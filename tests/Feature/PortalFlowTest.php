<?php

namespace Tests\Feature;

use App\Mail\ContactSubmissionReceived;
use App\Models\ContactSubmission;
use App\Models\Plan;
use App\Models\SimulatedPayment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PortalFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_pricing_remains_available_and_workspace_is_private_and_empty(): void
    {
        $pricingResponse = $this->get(route('pricing'));

        $pricingResponse->assertOk()
            ->assertSee('Team')
            ->assertSee('&quot;price_cents&quot;:4900', false);

        $this->get(route('dashboard.demo'))->assertRedirect(route('login'));

        $user = User::factory()->unverified()->create();
        $this->actingAs($user)->get(route('dashboard'))
            ->assertOk()
            ->assertSee('data-page="dashboard"', false)
            ->assertSee('&quot;empty&quot;:true', false)
            ->assertDontSee('Customer onboarding');

        $this->assertSame(3, Plan::query()->count());
    }

    public function test_valid_test_card_completes_a_no_charge_checkout_and_saves_only_card_metadata(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
                'success' => true,
                'action' => 'checkout',
                'hostname' => 'localhost',
            ]),
        ]);

        $response = $this->post(route('checkout.subscribe', ['slug' => 'team']), [
            'customer_name' => 'Riya Fernando',
            'customer_email' => 'riya@example.com',
            'company' => 'Example Operations',
            'card_number' => '4242 4242 4242 4242',
            'card_expiry' => '12/30',
            'card_cvc' => '123',
            'cf-turnstile-response' => 'valid-checkout-token',
            'agree' => '1',
        ]);
        $response->assertSessionHasNoErrors();

        $subscription = Subscription::query()->sole();
        $payment = SimulatedPayment::query()->sole();

        $response->assertRedirect(route('checkout.complete', ['reference' => $subscription->reference]))
            ->assertSessionHasNoErrors()
            ->assertSessionMissingInput('card_number')
            ->assertSessionMissingInput('card_expiry')
            ->assertSessionMissingInput('card_cvc');
        $this->assertSame('active', $subscription->status);
        $this->assertTrue($subscription->is_simulated);
        $this->assertSame('simulated_success', $payment->status);
        $this->assertSame(4900, $payment->amount_cents);
        $this->assertSame('Visa', $payment->card_brand);
        $this->assertSame('4242', $payment->card_last_four);
        $this->assertArrayNotHasKey('card_number', $payment->getAttributes());
        $this->assertArrayNotHasKey('card_expiry', $payment->getAttributes());
        $this->assertArrayNotHasKey('card_cvc', $payment->getAttributes());
    }

    public function test_invalid_card_number_is_rejected_without_creating_a_checkout_record(): void
    {
        $response = $this->from(route('checkout.show', ['slug' => 'team']))
            ->post(route('checkout.subscribe', ['slug' => 'team']), [
                'customer_name' => 'Riya Fernando',
                'customer_email' => 'riya@example.com',
                'card_number' => '4242 4242 4242 4241',
                'card_expiry' => '12/30',
                'card_cvc' => '123',
                'agree' => '1',
            ]);

        $response->assertRedirect(route('checkout.show', ['slug' => 'team']))
            ->assertSessionHasErrors(['card_number'])
            ->assertSessionMissingInput('card_number')
            ->assertSessionMissingInput('card_expiry')
            ->assertSessionMissingInput('card_cvc');
        $this->assertSame(0, Subscription::query()->count());
        $this->assertSame(0, SimulatedPayment::query()->count());
    }

    public function test_contact_form_saves_the_inquiry_and_sends_a_quoted_support_email(): void
    {
        Mail::fake([ContactSubmissionReceived::class]);
        Http::preventStrayRequests();
        Http::fake([
            'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
                'success' => true,
                'action' => 'contact',
                'hostname' => 'localhost',
            ]),
        ]);
        $unsafeMessage = "Please review our process. <script>alert('x')</script>";

        $response = $this->post(route('contact.submit'), [
            'name' => 'Jordan Lee',
            'email' => 'jordan@example.com',
            'company' => 'Example Operations',
            'phone' => '+1 415 555 0199',
            'subject' => 'Workflow discovery',
            'message' => $unsafeMessage,
            'cf-turnstile-response' => 'valid-contact-token',
            'privacy_acknowledged' => '1',
        ]);
        $response->assertSessionHasNoErrors();

        $submission = ContactSubmission::query()->sole();
        $response->assertRedirect()
            ->assertSessionHas('contact_success', 'Thank you. Your message has been sent to Jorvellan Support.');
        $this->assertSame($unsafeMessage, $submission->message);
        Mail::assertSent(ContactSubmissionReceived::class, function (ContactSubmissionReceived $mail): bool {
            $mail->assertHasSubject('New Jorvellan website inquiry')
                ->assertSeeInHtml('<script>')
                ->assertDontSeeInHtml("<script>alert('x')</script>", false);

            return $mail->hasTo('support@jorvellan.net');
        });
    }
}
