<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

abstract class Controller
{
    /**
     * @param  array<string, mixed>  $portalData
     */
    protected function appPage(string $page, string $title, string $description, array $portalData = []): View
    {
        $sharedData = [
            'errors' => session('errors')?->getMessages() ?? [],
            'old' => session()->get('_old_input', []),
            'status' => session('status'),
            'user' => auth()->user()?->only(['name', 'email', 'email_verified_at']),
        ];

        return view('welcome', [
            'page' => $page,
            'title' => $title.' | Jorvellan',
            'description' => $description,
            'portalData' => array_merge($sharedData, $portalData),
        ]);
    }
}
