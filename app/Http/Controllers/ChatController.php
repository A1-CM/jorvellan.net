<?php

namespace App\Http\Controllers;

use App\Services\GroqSiteChat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class ChatController extends Controller
{
    public function store(Request $request, GroqSiteChat $chat): JsonResponse
    {
        $validated = $request->validate([
            'messages' => ['required', 'array', 'min:1', 'max:8'],
            'messages.*' => ['required', 'array:role,content'],
            'messages.*.role' => ['required', 'string', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:1500'],
        ]);
        $messages = $validated['messages'];

        if (end($messages)['role'] !== 'user') {
            throw ValidationException::withMessages([
                'messages' => 'Send a user message to continue the conversation.',
            ]);
        }

        if (collect($messages)->sum(fn (array $message): int => mb_strlen($message['content'])) > 8000) {
            throw ValidationException::withMessages([
                'messages' => 'Please shorten the conversation and try again.',
            ]);
        }

        if (! filled(config('services.groq.api_token'))) {
            return response()->json([
                'message' => 'The Jorvellan assistant is being connected. Please use the contact page in the meantime.',
            ], 503);
        }

        try {
            $answer = $chat->reply($messages);
        } catch (Throwable $exception) {
            Log::error('Jorvellan site assistant could not get a response.', [
                'exception' => $exception::class,
            ]);

            return response()->json([
                'message' => 'The assistant is temporarily unavailable. Please try again or contact Jorvellan Support.',
            ], 502);
        }

        return response()->json(['reply' => $answer['reply']]);
    }
}
