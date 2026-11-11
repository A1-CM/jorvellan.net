<?php

namespace App\Http\Controllers;

use App\Mail\ContactSubmissionReceived;
use App\Models\ContactSubmission;
use App\Services\TurnstileVerifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\View\View;
use Throwable;

class ContactController extends Controller
{
    public function show(Request $request): View
    {
        $turnstile = app(TurnstileVerifier::class);

        return view('welcome', [
            'page' => 'contact',
            'title' => 'Contact Jorvellan',
            'description' => 'Contact Jorvellan in Sri Lanka or the United States, or send a message to the support team.',
            'portalData' => [
                'contactSuccess' => $request->session()->get('contact_success'),
                'contactDeliveryError' => $request->session()->get('contact_delivery_error'),
                'errors' => $request->session()->get('errors')?->getMessages() ?? [],
                'old' => $request->session()->get('_old_input', []),
                'turnstileEnabled' => $turnstile->isConfigured(),
                'turnstileSiteKey' => $turnstile->isConfigured() ? config('services.turnstile.site_key') : null,
            ],
        ]);
    }

    public function store(Request $request, TurnstileVerifier $turnstile): RedirectResponse
    {
        $input = $request->only('name', 'email', 'company', 'phone', 'subject', 'message', 'privacy_acknowledged');
        $validator = Validator::make($input, [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'company' => ['nullable', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
            'subject' => ['nullable', 'string', 'max:180'],
            'message' => ['required', 'string', 'min:20', 'max:6000'],
            'privacy_acknowledged' => ['accepted'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput($input);
        }

        if (! $turnstile->isConfigured() && ! app()->environment('testing')) {
            return back()->withErrors(['turnstile' => 'The security check is not configured. Please email support@jorvellan.net directly.'])->withInput($input);
        }

        if ($turnstile->isConfigured()) {
            $token = $request->input('cf-turnstile-response');

            if (! is_string($token) || $token === '' || strlen($token) > 2048) {
                return back()->withErrors(['turnstile' => 'Complete the security check before sending your message.'])->withInput($input);
            }

            try {
                $verified = $turnstile->verify($token, 'contact');
            } catch (Throwable $exception) {
                Log::warning('Contact form Turnstile verification is unavailable.', ['exception' => $exception::class]);

                return back()->withErrors(['turnstile' => 'The security check is temporarily unavailable. Please try again.'])->withInput($input);
            }

            if (! $verified) {
                return back()->withErrors(['turnstile' => 'The security check failed or expired. Please try again.'])->withInput($input);
            }
        }

        $validated = $validator->validated();
        $submission = ContactSubmission::query()->create([...$validated, 'status' => 'new']);

        try {
            Mail::to(config('contact.to_address'))->send(new ContactSubmissionReceived($submission));
        } catch (Throwable $exception) {
            Log::error('Contact submission email delivery failed.', ['submission_id' => $submission->id, 'exception' => $exception::class]);

            return back()->withInput($input)->with('contact_delivery_error', 'Your message was saved, but email delivery is temporarily unavailable. Please email support@jorvellan.net directly.');
        }

        return back()->with('contact_success', 'Thank you. Your message has been sent to Jorvellan Support.');
    }
}
