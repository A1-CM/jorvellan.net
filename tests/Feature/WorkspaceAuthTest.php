<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetWorkspacePassword;
use App\Notifications\VerifyWorkspaceEmail;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;
use Mockery;
use Tests\TestCase;

class WorkspaceAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_sign_in_and_return_to_the_requested_workspace_page(): void
    {
        $this->get('/processes')->assertRedirect('/login');

        $user = User::factory()->unverified()->create();
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect('/processes');

        $this->get('/processes')->assertOk()->assertSee('data-page="process-list"', false);
    }

    public function test_registration_requires_a_confirmed_twelve_character_password_and_sends_optional_verification(): void
    {
        Notification::fake();

        $this->from('/register')->post('/register', [
            'name' => 'Workspace Owner',
            'email' => 'owner@example.test',
            'password' => 'short-pass',
            'password_confirmation' => 'short-pass',
        ])->assertRedirect('/register')->assertSessionHasErrors('password');

        $this->post('/register', [
            'name' => 'Workspace Owner',
            'email' => 'owner@example.test',
            'password' => 'long-enough-pass-123',
            'password_confirmation' => 'long-enough-pass-123',
        ])->assertRedirect('/dashboard');

        $user = User::query()->where('email', 'owner@example.test')->sole();
        $this->assertNull($user->email_verified_at);
        $this->assertAuthenticatedAs($user);
        Notification::assertSentTo($user, VerifyWorkspaceEmail::class);

        $this->get('/dashboard')->assertOk()->assertSee('data-page="dashboard"', false);
    }

    public function test_sign_out_clears_the_authenticated_session(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/logout')->assertRedirect('/');

        $this->assertGuest();
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_email_verification_can_be_resent_without_blocking_workspace_access(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->post('/email/verification-notification')->assertRedirect();
        Notification::assertSentTo($user, VerifyWorkspaceEmail::class);
        $this->get('/dashboard')->assertOk();
    }

    public function test_password_reset_link_uses_the_branded_notification(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertRedirect('/')
            ->assertSessionHas('status');

        Notification::assertSentTo($user, ResetWorkspacePassword::class);
        Notification::assertNotSentTo($user, ResetPassword::class);
    }

    public function test_google_first_sign_in_creates_a_verified_account_and_returning_sign_in_reuses_it(): void
    {
        $googleUser = new GoogleUser;
        $googleUser->id = 'google-123';
        $googleUser->name = 'Google Workspace Owner';
        $googleUser->email = 'google-owner@example.test';
        $googleUser->user = ['verified_email' => true];

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->twice()->andReturn($googleUser);
        Socialite::shouldReceive('driver')->twice()->with('google')->andReturn($provider);

        $this->get('/auth/google/callback')->assertRedirect('/dashboard');
        $account = User::query()->where('email', 'google-owner@example.test')->sole();
        $this->assertSame('google-123', $account->google_id);
        $this->assertTrue($account->hasVerifiedEmail());
        $this->assertAuthenticatedAs($account);

        $this->post('/logout');
        $this->get('/auth/google/callback')->assertRedirect('/dashboard');
        $this->assertSame(1, User::query()->where('google_id', 'google-123')->count());
        $this->assertAuthenticatedAs($account);
    }
}
