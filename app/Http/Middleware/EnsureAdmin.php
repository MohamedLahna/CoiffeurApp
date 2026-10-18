<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $token = $user?->currentAccessToken();
        abort_unless(
            $user?->role === 'admin' && $token && $token->name === 'admin-google',
            403,
            'Admin access requires the authorized Google sign-in.',
        );

        return $next($request);
    }
}
