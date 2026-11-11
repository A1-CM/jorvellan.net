<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class TurnstileVerifier
{
    public function isConfigured(): bool
    {
        return filled(config('services.turnstile.site_key'))
            && filled(config('services.turnstile.secret_key'));
    }

    public function verify(string $token, string $action): bool
    {
        $response = Http::asForm()
            ->connectTimeout(3)
            ->timeout(5)
            ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => config('services.turnstile.secret_key'),
                'response' => $token,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Turnstile verification is unavailable.');
        }

        $hostname = $response->json('hostname');
        $expectedHostname = parse_url((string) config('app.url'), PHP_URL_HOST);
        $verified = $response->json('success') === true
            && $response->json('action') === $action
            && is_string($hostname)
            && is_string($expectedHostname)
            && $expectedHostname !== ''
            && hash_equals(strtolower($expectedHostname), strtolower($hostname));

        if (! $verified) {
            $errorCodes = $response->json('error-codes', []);

            Log::notice('Turnstile rejected form verification.', [
                'action' => $action,
                'response_action' => $response->json('action'),
                'hostname' => $hostname,
                'expected_hostname' => $expectedHostname,
                'error_codes' => is_array($errorCodes) ? $errorCodes : [],
            ]);
        }

        return $verified;
    }
}
