<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetWorkspacePassword extends Notification
{
    use Queueable;

    public function __construct(public string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = route('password.reset', ['token' => $this->token, 'email' => $notifiable->getEmailForPasswordReset()]);

        return (new MailMessage)
            ->subject('Reset your Jorvellan password')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We received a request to reset the password for your Jorvellan account.')
            ->action('Choose a new password', $resetUrl)
            ->line('If you did not request this, you can ignore this email. The link expires in '.config('auth.passwords.users.expire').' minutes.')
            ->salutation('Jorvellan');
    }
}
