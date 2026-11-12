<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\SimulatedPayment;
use App\Models\Subscription;
use App\Services\TurnstileVerifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator as ValidationValidator;
use Illuminate\View\View;

class PortalController extends Controller
{
    public function pricing(): View
    {
        $plans = Plan::query()->where('is_active', true)->orderBy('sort_order')->get();

        return $this->page('pricing', 'Pricing | Jorvellan', 'Draft plan options for the proposed Jorvellan operations workspace.', ['plans' => $plans]);
    }

    public function checkout(Request $request, string $slug): View
    {
        $plan = Plan::query()->where('is_active', true)->where('slug', $slug)->firstOrFail();

        return $this->page('checkout', 'Checkout | Jorvellan', 'Simulated checkout for a Jorvellan draft plan. No payment is processed.', [
            'plan' => $plan,
            'errors' => $request->session()->get('errors')?->getMessages() ?? [],
            'old' => $request->session()->get('_old_input', []),
        ]);
    }

    public function subscribe(Request $request, string $slug): RedirectResponse
    {
        $plan = Plan::query()->where('is_active', true)->where('slug', $slug)->firstOrFail();
        $isDemo = $plan->is_demo;

        $validator = Validator::make($request->all(), [
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'email', 'max:190'],
            'company' => ['nullable', 'string', 'max:160'],
            'card_number' => [$isDemo ? 'nullable' : 'required', 'string', 'max:37', 'regex:/^[0-9 -]{12,37}$/'],
            'card_expiry' => [$isDemo ? 'nullable' : 'required', 'string', 'regex:/^(0[1-9]|1[0-2])\/\d{2}$/'],
            'card_cvc' => [$isDemo ? 'nullable' : 'required', 'string', 'regex:/^\d{3,4}$/'],
            'agree' => ['accepted'],
        ], [
            'agree.accepted' => 'Please confirm that you understand this is a simulated, no-charge checkout.',
        ]);

        $validator->after(function (ValidationValidator $validator) use ($request, $isDemo): void {
            if ($isDemo) {
                return;
            }

            $cardNumber = preg_replace('/\D+/', '', (string) $request->input('card_number'));
            if (! $this->passesLuhnCheck($cardNumber)) {
                $validator->errors()->add('card_number', 'Enter a valid card number. This form only checks the number format; no authorization is requested.');
            }

            $expiry = (string) $request->input('card_expiry');
            if (preg_match('/^(0[1-9]|1[0-2])\/(\d{2})$/', $expiry, $matches) === 1) {
                $expiryYear = 2000 + (int) $matches[2];
                $expiryMonth = (int) $matches[1];
                if ($expiryYear < (int) now()->format('Y') || ($expiryYear === (int) now()->format('Y') && $expiryMonth < (int) now()->format('n'))) {
                    $validator->errors()->add('card_expiry', 'Enter a card expiry date in the future.');
                }
            }
        });

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput($request->except(['card_number', 'card_expiry', 'card_cvc', 'cf-turnstile-response']));
        }

        $turnstile = app(TurnstileVerifier::class);
        if (! $turnstile->isConfigured() && ! app()->environment('testing')) {
            return back()->withErrors(['turnstile' => 'The security check is not configured. Please contact support@jorvellan.net.'])->withInput($request->except(['card_number', 'card_expiry', 'card_cvc', 'cf-turnstile-response']));
        }

        if ($turnstile->isConfigured()) {
            $token = $request->input('cf-turnstile-response');
            $safeInput = $request->except(['card_number', 'card_expiry', 'card_cvc', 'cf-turnstile-response']);

            if (! is_string($token) || $token === '' || strlen($token) > 2048) {
                return back()->withErrors(['turnstile' => 'Complete the security check before continuing.'])->withInput($safeInput);
            }

            try {
                $verified = $turnstile->verify($token, 'checkout');
            } catch (\Throwable $exception) {
                Log::warning('Checkout Turnstile verification is unavailable.', ['exception' => $exception::class]);

                return back()->withErrors(['turnstile' => 'The security check is temporarily unavailable. Please try again.'])->withInput($safeInput);
            }

            if (! $verified) {
                return back()->withErrors(['turnstile' => 'The security check failed or expired. Please try again.'])->withInput($safeInput);
            }
        }

        $reference = (string) Str::uuid();
        $subscription = DB::transaction(function () use ($request, $plan, $isDemo, $reference): Subscription {
            $subscription = Subscription::query()->create([
                'plan_id' => $plan->id,
                'customer_name' => $request->string('customer_name')->toString(),
                'customer_email' => $request->string('customer_email')->toString(),
                'status' => 'active',
                'is_simulated' => true,
                'started_at' => now(),
                'ends_at' => $isDemo ? null : now()->addMonth(),
                'reference' => $reference,
            ]);

            $number = preg_replace('/\D+/', '', (string) $request->input('card_number'));
            SimulatedPayment::query()->create([
                'subscription_id' => $subscription->id,
                'amount_cents' => $plan->price_cents,
                'currency' => $plan->currency,
                'status' => $isDemo ? 'no_charge_demo' : 'simulated_success',
                'card_brand' => $isDemo ? null : $this->cardBrand($number),
                'card_last_four' => $isDemo ? '0000' : substr($number, -4),
                'reference' => 'SIM-'.Str::upper(Str::random(12)),
                'simulated_at' => now(),
            ]);

            return $subscription;
        });

        $request->session()->put('simulated_subscription_reference', $subscription->reference);

        return redirect()->route('checkout.complete', ['reference' => $subscription->reference]);
    }

    public function complete(Request $request, string $reference): View
    {
        abort_unless($request->session()->get('simulated_subscription_reference') === $reference, 404);
        $subscription = Subscription::query()->with(['plan', 'simulatedPayment'])->where('reference', $reference)->firstOrFail();

        return $this->page('checkout-complete', 'Demo checkout complete | Jorvellan', 'Your simulated checkout completed successfully. No payment was processed.', ['subscription' => $subscription]);
    }

    private function page(string $page, string $title, string $description, array $portalData = []): View
    {
        $turnstile = app(TurnstileVerifier::class);
        $portalData = [
            'turnstileEnabled' => $turnstile->isConfigured(),
            'turnstileSiteKey' => $turnstile->isConfigured() ? config('services.turnstile.site_key') : null,
        ] + $portalData;

        return view('welcome', compact('page', 'title', 'description', 'portalData'));
    }

    private function passesLuhnCheck(string $number): bool
    {
        if (strlen($number) < 12 || strlen($number) > 19) {
            return false;
        }

        $sum = 0;
        $double = false;
        foreach (array_reverse(str_split($number)) as $digit) {
            $value = (int) $digit;
            if ($double) {
                $value *= 2;
                if ($value > 9) {
                    $value -= 9;
                }
            }
            $sum += $value;
            $double = ! $double;
        }

        return $sum % 10 === 0;
    }

    private function cardBrand(string $number): string
    {
        return match (true) {
            str_starts_with($number, '4') => 'Visa',
            preg_match('/^(5[1-5]|2(2[2-9]|[3-6][0-9]|7[01]|720))/', $number) === 1 => 'Mastercard',
            str_starts_with($number, '34'), str_starts_with($number, '37') => 'American Express',
            str_starts_with($number, '6') => 'Discover',
            default => 'Card',
        };
    }
}
