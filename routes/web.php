<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ImprovementActionController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\ProcessObservationController;
use App\Http\Controllers\ProcessRecordController;
use App\Http\Controllers\WorkflowStageController;
use App\Http\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1')->name('register.store');
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login.store');
    Route::get('/auth/google', [AuthController::class, 'redirectToGoogle'])->name('auth.google');
    Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
    Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])->middleware('throttle:3,1')->name('password.email');
    Route::get('/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1')->name('password.update');
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/email/verify', [AuthController::class, 'verificationNotice'])->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware('signed', 'throttle:6,1')->name('verification.verify');
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])->middleware('throttle:6,1')->name('verification.send');

    Route::get('/dashboard', [WorkspaceController::class, 'dashboard'])->name('dashboard');
    Route::get('/dashboard/demo', fn () => redirect()->route('dashboard'))->name('dashboard.demo');
    Route::get('/search', [WorkspaceController::class, 'search'])->name('workspace.search');
    Route::get('/activity', [WorkspaceController::class, 'activity'])->name('workspace.activity');
    Route::resource('processes', ProcessRecordController::class);
    Route::resource('processes.stages', WorkflowStageController::class)->except(['index', 'show']);
    Route::resource('observations', ProcessObservationController::class);
    Route::resource('improvements', ImprovementActionController::class);
});

Route::get('/pricing', [PortalController::class, 'pricing'])->name('pricing');
Route::get('/checkout/complete/{reference}', [PortalController::class, 'complete'])->name('checkout.complete');
Route::get('/checkout/{slug}', [PortalController::class, 'checkout'])->name('checkout.show');
Route::post('/checkout/{slug}', [PortalController::class, 'subscribe'])->middleware('throttle:5,10')->name('checkout.subscribe');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,10')->name('contact.submit');
Route::post('/chat', [ChatController::class, 'store'])->middleware('throttle:10,1')->name('chat.store');

Route::view('/', 'welcome', [
    'page' => 'home',
    'title' => 'Jorvellan | AI Process Discovery & Workflow Intelligence',
    'description' => 'Bring process documentation, workflow stages and improvement work into one clear operational picture with Jorvellan.',
])->name('home');

Route::view('/product', 'welcome', [
    'page' => 'product',
    'title' => 'Product | Jorvellan',
    'description' => 'Explore the Jorvellan process intelligence workspace and its proposed future technical direction.',
])->name('product');

Route::view('/features', 'welcome', [
    'page' => 'features',
    'title' => 'Features | Jorvellan',
    'description' => 'Explore process registry, workflow mapping, observations, improvement tracking and insight review in Jorvellan.',
])->name('features');

Route::view('/about', 'welcome', [
    'page' => 'about',
    'title' => 'About | Jorvellan',
    'description' => 'Learn about Jorvellan and its focus on enterprise operations and process improvement.',
])->name('about');

Route::get('/contact', [ContactController::class, 'show'])->name('contact');

Route::view('/how-it-works', 'welcome', [
    'page' => 'how-it-works',
    'title' => 'How it works | Jorvellan',
    'description' => 'See how Jorvellan organizes process documentation, workflow mapping, observations, review and improvement actions.',
])->name('how-it-works');

Route::view('/terms', 'welcome', [
    'page' => 'terms',
    'title' => 'Terms of Use | Jorvellan',
    'description' => 'Draft terms of use for the Jorvellan website, prepared for company review.',
])->name('terms');

Route::view('/privacy', 'welcome', [
    'page' => 'privacy',
    'title' => 'Privacy Policy | Jorvellan',
    'description' => 'Draft privacy policy describing the intended handling of information on the Jorvellan marketing website.',
])->name('privacy');
