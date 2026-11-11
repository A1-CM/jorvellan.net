<?php

namespace App\Http\Controllers;

use App\Models\ImprovementAction;
use App\Models\Plan;
use App\Models\ProcessObservation;
use App\Models\ProcessRecord;
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

    public function dashboard(): View
    {
        $processes = ProcessRecord::query()
            ->with(['workflowStages', 'observations', 'improvementActions'])
            ->orderBy('name')
            ->get();

        $observations = ProcessObservation::query()
            ->with(['processRecord:id,name', 'workflowStage:id,name'])
            ->latest('observed_on')
            ->take(10)
            ->get();

        $actions = ImprovementAction::query()
            ->with('processRecord:id,name')
            ->orderByRaw("CASE status WHEN 'In progress' THEN 0 WHEN 'In review' THEN 1 WHEN 'Planned' THEN 2 ELSE 3 END")
            ->orderBy('due_on')
            ->take(8)
            ->get();

        return $this->page('dashboard', 'Operations demo | Jorvellan', 'Database-backed illustrative sample operations dashboard.', [
            'stats' => [
                'processes' => $processes->count(),
                'departments' => $processes->pluck('department')->unique()->count(),
                'stages' => $processes->sum(fn (ProcessRecord $process): int => $process->workflowStages->count()),
                'observations' => ProcessObservation::query()->count(),
                'reviews' => ProcessObservation::query()->where('review_status', 'needs_review')->count(),
                'actions_open' => ImprovementAction::query()->whereNotIn('status', ['Complete', 'Cancelled'])->count(),
                'actions_late' => ImprovementAction::query()->whereNotIn('status', ['Complete', 'Cancelled'])->whereDate('due_on', '<', now()->toDateString())->count(),
            ],
            'processes' => $processes->map(fn (ProcessRecord $process): array => [
                'name' => $process->name,
                'department' => $process->department,
                'owner' => $process->owner,
                'status' => $process->status,
                'risk' => $process->risk_level,
                'version' => $process->version,
                'last_reviewed' => $process->last_reviewed_at?->format('M j, Y'),
                'purpose' => $process->purpose,
                'stages' => $process->workflowStages->map(fn ($stage): array => ['name' => $stage->name, 'team' => $stage->owner_team, 'status' => $stage->status, 'expected_minutes' => $stage->expected_minutes, 'observed_minutes' => $stage->observed_minutes, 'handoff_note' => $stage->handoff_note]),
            ]),
            'observations' => $observations->map(fn (ProcessObservation $observation): array => ['process' => $observation->processRecord?->name, 'stage' => $observation->workflowStage?->name, 'category' => $observation->category, 'priority' => $observation->priority, 'title' => $observation->title, 'detail' => $observation->detail, 'status' => $observation->review_status, 'observed_on' => $observation->observed_on->format('M j, Y')]),
            'actions' => $actions->map(fn (ImprovementAction $action): array => ['process' => $action->processRecord?->name, 'title' => $action->title, 'description' => $action->description, 'owner' => $action->owner, 'priority' => $action->priority, 'status' => $action->status, 'due_on' => $action->due_on?->format('M j, Y'), 'outcome' => $action->outcome]),
        ]);
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
