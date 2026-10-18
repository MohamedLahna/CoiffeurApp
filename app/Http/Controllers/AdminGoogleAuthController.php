<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminGoogleAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['credential' => ['required', 'string', 'max:10000']]);
        $clientId = (string) config('services.google.client_id');
        $allowedEmail = strtolower((string) config('services.google.admin_email'));

        abort_if($clientId === '' || $allowedEmail === '', 503, 'Google admin sign-in is not configured.');

        $claims = $this->verifyGoogleCredential($data['credential'], $clientId);
        $email = strtolower((string) ($claims->email ?? ''));

        abort_unless(($claims->email_verified ?? false) === true, 401, 'Google email is not verified.');
        abort_unless(str_ends_with($email, '@gmail.com') && hash_equals($allowedEmail, $email), 403, 'This Google account is not authorized for the admin area.');

        $user = User::firstOrNew(['email' => $email]);
        $user->name = $claims->name ?? Str::before($email, '@');
        $user->role = 'admin';
        if (!$user->exists) {
            $user->password = Hash::make(Str::random(64));
        }
        $user->save();

        return response()->json([
            'token' => $user->createToken('admin-google')->plainTextToken,
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->only(['id', 'name', 'email', 'role']));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Signed out.']);
    }

    private function verifyGoogleCredential(string $jwt, string $clientId): object
    {
        $parts = explode('.', $jwt);
        abort_unless(count($parts) === 3, 401, 'Invalid Google credential.');
        [$encodedHeader, $encodedClaims, $encodedSignature] = $parts;
        $header = json_decode($this->base64UrlDecode($encodedHeader));
        $claims = json_decode($this->base64UrlDecode($encodedClaims));
        abort_unless(is_object($header) && is_object($claims) && ($header->alg ?? null) === 'RS256' && !empty($header->kid), 401, 'Invalid Google credential.');

        $keys = Cache::remember('google:oauth:jwks', now()->addHour(), function () {
            return $this->googleHttp()->get('https://www.googleapis.com/oauth2/v3/certs')->throw()->json('keys', []);
        });
        $jwk = collect($keys)->firstWhere('kid', $header->kid);
        if (!$jwk) {
            Cache::forget('google:oauth:jwks');
            $keys = $this->googleHttp()->get('https://www.googleapis.com/oauth2/v3/certs')->throw()->json('keys', []);
            $jwk = collect($keys)->firstWhere('kid', $header->kid);
        }
        abort_unless(is_array($jwk) && isset($jwk['n'], $jwk['e']), 401, 'Unknown Google signing key.');

        $publicKey = openssl_pkey_get_public($this->jwkToPem($jwk));
        $signature = $this->base64UrlDecode($encodedSignature);
        $verified = $publicKey && openssl_verify($encodedHeader.'.'.$encodedClaims, $signature, $publicKey, OPENSSL_ALGO_SHA256) === 1;
        abort_unless($verified, 401, 'Google credential signature is invalid.');

        $issuer = $claims->iss ?? '';
        abort_unless(in_array($issuer, ['accounts.google.com', 'https://accounts.google.com'], true), 401, 'Invalid Google credential issuer.');
        abort_unless(($claims->aud ?? null) === $clientId && (int) ($claims->exp ?? 0) > time(), 401, 'Google credential is expired or has the wrong audience.');

        return $claims;
    }

    private function googleHttp()
    {
        $caBundle = config('services.google.ca_bundle');

        return Http::timeout(8)->withOptions($caBundle ? ['verify' => $caBundle] : []);
    }

    private function base64UrlDecode(string $value): string
    {
        $decoded = base64_decode(strtr($value, '-_', '+/').str_repeat('=', (4 - strlen($value) % 4) % 4), true);
        abort_unless($decoded !== false, 401, 'Malformed Google credential.');

        return $decoded;
    }

    private function jwkToPem(array $jwk): string
    {
        $modulus = $this->base64UrlDecode($jwk['n']);
        $exponent = $this->base64UrlDecode($jwk['e']);
        $rsaKey = $this->der(0x30, $this->derInteger($modulus).$this->derInteger($exponent));
        $algorithm = hex2bin('300d06092a864886f70d0101010500');
        $subjectPublicKeyInfo = $this->der(0x30, $algorithm.$this->der(0x03, "\0".$rsaKey));

        return "-----BEGIN PUBLIC KEY-----\n".chunk_split(base64_encode($subjectPublicKeyInfo), 64, "\n")."-----END PUBLIC KEY-----\n";
    }

    private function derInteger(string $bytes): string
    {
        if (ord($bytes[0]) > 0x7f) {
            $bytes = "\0".$bytes;
        }

        return $this->der(0x02, $bytes);
    }

    private function der(int $tag, string $content): string
    {
        $length = strlen($content);
        if ($length < 0x80) {
            $encodedLength = chr($length);
        } else {
            $bytes = '';
            while ($length > 0) {
                $bytes = chr($length & 0xff).$bytes;
                $length >>= 8;
            }
            $encodedLength = chr(0x80 | strlen($bytes)).$bytes;
        }

        return chr($tag).$encodedLength.$content;
    }
}
