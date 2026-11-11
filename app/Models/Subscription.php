<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['plan_id', 'customer_name', 'customer_email', 'status', 'is_simulated', 'started_at', 'ends_at', 'reference'])]
class Subscription extends Model
{
    protected function casts(): array
    {
        return ['is_simulated' => 'boolean', 'started_at' => 'datetime', 'ends_at' => 'datetime'];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function simulatedPayment(): HasOne
    {
        return $this->hasOne(SimulatedPayment::class);
    }
}
