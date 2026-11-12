<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\View\View;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function showRegister(Request $request): View
    {
        return $this->page('register', 'Create your Jorvellan account', $request);
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'confirmed', PasswordRule::min(12)],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => Str::lower($validated['email']),
            'password' => $validated['password'],
        ]);

        event(new Registered($user));
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'))->with('status', 'Your workspace is ready. Please verify your email when convenient.');
    }

    public function showLogin(Request $request): View
    {
        return $this->page('login', 'Sign in to Jorvellan', $request);
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $credentials['email'] = Str::lower($credentials['email']);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors(['email' => 'Those sign-in details did not match an account.'])->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();
        $googleId = $googleUser->getId();
        $email = Str::lower(trim((string) $googleUser->getEmail()));
        $emailVerified = (bool) ($googleUser->user['verified_email'] ?? false);

        if (! is_string($googleId) || $googleId === '' || $email === '') {
            return redirect()->route('login')->withErrors(['google' => 'Google did not provide an account ID and email address. Try signing in another way.']);
        }

        [$user, $wasRecentlyCreated] = DB::transaction(function () use ($email, $emailVerified, $googleId, $googleUser): array {
            $user = User::query()->where('google_id', $googleId)->first();

            if (! $user) {
                $user = User::query()->where('email', $email)->first();

                if ($user && ! $emailVerified) {
                    return [null, false];
                }

                if (! $user) {
                    $user = User::query()->create([
                        'name' => $googleUser->getName() ?: $email,
                        'email' => $email,
                        'password' => null,
                        'google_id' => $googleId,
                    ]);

                    if ($emailVerified) {
                        $user->forceFill(['email_verified_at' => now()])->save();
                    }

                    return [$user, true];
                }

                $user->google_id = $googleId;
                if ($emailVerified && ! $user->hasVerifiedEmail()) {
                    $user->email_verified_at = now();
                }
                $user->save();
            }

            return [$user, false];
        });

        if (! $user) {
            return redirect()->route('login')->withErrors(['google' => 'Sign in to your existing account before connecting this Google address.']);
        }

        if ($wasRecentlyCreated && ! $emailVerified) {
            event(new Registered($user));
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function verificationNotice(Request $request): View
    {
        return $this->page('verify-email', 'Verify your email', $request, ['verified' => $request->user()->hasVerifiedEmail()]);
    }

    public function verifyEmail(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('dashboard')->with('status', 'Your email address is already verified.');
        }

        $request->fulfill();

        return redirect()->route('dashboard')->with('status', 'Your email address has been verified.');
    }

    public function resendVerification(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return back()->with('status', 'Your email address is already verified.');
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'A fresh verification link has been sent.');
    }

    public function showForgotPassword(Request $request): View
    {
        return $this->page('forgot-password', 'Reset your password', $request);
    }

    public function sendResetLink(Request $request): RedirectResponse
    {
        $request->validate(['email' => ['required', 'email']]);
        $status = Password::sendResetLink(['email' => Str::lower($request->string('email')->toString())]);

        return back()->with('status', __($status));
    }

    public function showResetPassword(Request $request, string $token): View
    {
        return $this->page('reset-password', 'Choose a new password', $request, [
            'token' => $token,
            'email' => $request->query('email'),
        ]);
    }

    public function resetPassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(12)],
        ]);

        $status = Password::reset($validated, function (User $user, string $password): void {
            $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
            event(new PasswordReset($user));
        });

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('login')->with('status', __($status))
            : back()->withErrors(['email' => __($status)]);
    }

    private function page(string $page, string $title, Request $request, array $data = []): View
    {
        $portalData = [
            'errors' => $request->session()->get('errors')?->getMessages() ?? [],
            'old' => $request->session()->get('_old_input', []),
            'status' => $request->session()->get('status'),
        ] + $data;

        return view('welcome', [
            'page' => $page,
            'title' => $title.' | Jorvellan',
            'description' => 'Sign in to your private Jorvellan workspace.',
            'portalData' => $portalData,
        ]);
    }
}
