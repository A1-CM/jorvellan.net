<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\PortalController;
use Illuminate\Support\Facades\Route;

Route::get('/pricing', [PortalController::class, 'pricing'])->name('pricing');
Route::get('/checkout/complete/{reference}', [PortalController::class, 'complete'])->name('checkout.complete');
Route::get('/checkout/{slug}', [PortalController::class, 'checkout'])->name('checkout.show');
Route::post('/checkout/{slug}', [PortalController::class, 'subscribe'])->middleware('throttle:5,10')->name('checkout.subscribe');
Route::get('/dashboard/demo', [PortalController::class, 'dashboard'])->name('dashboard.demo');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,10')->name('contact.submit');

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
