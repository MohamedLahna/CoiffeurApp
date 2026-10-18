<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class TranslationController extends Controller
{
    public function translate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'texts' => ['required', 'array', 'min:1', 'max:120'],
            'texts.*' => ['required', 'string', 'max:250'],
            'source' => ['sometimes', 'in:fr'],
            'target' => ['required', 'in:en,ar,es,de'],
        ]);
        $texts = $data['texts'];
        $cacheKey = 'ui-translation:'.hash('sha256', $data['target'].'|'.json_encode($texts, JSON_UNESCAPED_UNICODE));

        try {
            $translated = Cache::remember($cacheKey, now()->addDays(14), function () use ($data, $texts) {
                $uniqueTexts = array_values(array_unique(array_values($texts)));
                $translatedByText = [];
                $contactEmail = config('services.mymemory.contact_email');
                $caBundle = config('services.google.ca_bundle');

                foreach (array_chunk($uniqueTexts, 8, true) as $batch) {
                    $responses = Http::pool(function (Pool $pool) use ($batch, $data, $contactEmail, $caBundle) {
                        $requests = [];
                        foreach ($batch as $index => $text) {
                            $query = ['q' => $text, 'langpair' => 'fr|'.$data['target']];
                            if ($contactEmail) {
                                $query['de'] = $contactEmail;
                            }
                            $pending = $pool->as((string) $index)->timeout(20);
                            if ($caBundle) {
                                $pending = $pending->withOptions(['verify' => $caBundle]);
                            }
                            $requests[] = $pending->get(config('services.mymemory.url'), $query);
                        }

                        return $requests;
                    });

                    foreach ($batch as $index => $text) {
                        $response = $responses[(string) $index] ?? null;
                        $translatedText = $response?->json('responseData.translatedText');
                        $responseStatus = (int) ($response?->json('responseStatus') ?? 0);
                        if (!$response || !$response->successful() || $responseStatus !== 200 || !is_string($translatedText) || $translatedText === '') {
                            throw new \RuntimeException('MyMemory translation request failed.');
                        }
                        $translatedByText[$text] = html_entity_decode($translatedText, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    }
                }

                $result = [];
                foreach ($texts as $key => $text) {
                    $result[$key] = $translatedByText[$text] ?? $text;
                }

                return $result;
            });

            return response()->json(['translations' => $translated, 'source' => 'mymemory']);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json(['message' => 'The free online translation service is unavailable or its daily limit was reached.'], 503);
        }
    }
}
