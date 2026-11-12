<?php

namespace App\Services;

use App\Models\ActivityEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogger
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function record(User $user, string $action, ?Model $subject, string $summary, array $metadata = []): ActivityEntry
    {
        return ActivityEntry::query()->create([
            'user_id' => $user->id,
            'action' => $action,
            'subject_type' => $subject ? class_basename($subject) : null,
            'subject_id' => $subject?->getKey(),
            'summary' => $summary,
            'metadata' => $metadata,
        ]);
    }
}
