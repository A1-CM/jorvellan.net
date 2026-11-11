<?php

namespace App\Http\Controllers;

use App\Mail\ContactSubmissionReceived;
use App\Models\ContactSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\View\View;
use Throwable;

class ContactController extends Controller
{
    public function show(Request $request): View
    {
        return view('welcome', [
            'page' => 'contact',
            'title' => 'Contact Jorvellan',
            'description' => 'Contact Jorvellan in Sri Lanka or the United States, or send a message to the support team.',
            'portalData' => [
                'contactSuccess' => $request->session()->get('contact_success'),
                'contactDeliveryError' => $request->session()->get('contact_delivery_error'),
                'errors' => $request->session()->get('errors')?->getMessages() ?? [],
                'old' => $request->session()->get('_old_input', []),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'company' => ['nullable', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
            'subject' => ['nullable', 'string', 'max:180'],
            'message' => ['required', 'string', 'min:20', 'max:6000'],
            'privacy_acknowledged' => ['accepted'],
        ]);

        $submission = ContactSubmission::query()->create([...$validated, 'status' => 'new']);

        try {
            Mail::to(config('contact.to_address'))->send(new ContactSubmissionReceived($submission));
        } catch (Throwable $exception) {
            Log::error('Contact submission email delivery failed.', ['submission_id' => $submission->id, 'exception' => $exception::class]);

            return back()->withInput()->with('contact_delivery_error', 'Your message was saved, but email delivery is temporarily unavailable. Please email support@jorvellan.net directly.');
        }

        return back()->with('contact_success', 'Thank you. Your message has been sent to Jorvellan Support.');
    }
}
