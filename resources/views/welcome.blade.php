<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ $title ?? config('app.name', 'Jorvellan') }}</title>
        <meta name="description" content="{{ $description ?? 'AI process discovery and workflow intelligence for enterprise operations.' }}">
        <link rel="canonical" href="{{ url()->current() }}">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body>
        <div id="app" data-page="{{ $page ?? 'home' }}" data-props="{{ json_encode($portalData ?? [], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) }}"></div>
    </body>
</html>
