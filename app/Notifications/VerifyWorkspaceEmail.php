<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyWorkspaceEmail extends Notification
{
    use Queueable;

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(24),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())],
        );

        return (new MailMessage)
            ->subject('Verify your Jorvellan email address')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Confirm this email address to keep your Jorvellan account details up to date.')
            ->action('Verify email address', $verificationUrl)
            ->line('You can sign in and use your workspace even if you verify later. This link expires in 24 hours.')
            ->salutation('Jorvellan');
    }
}
