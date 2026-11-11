<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['subscription_id', 'amount_cents', 'currency', 'status', 'card_brand', 'card_last_four', 'reference', 'simulated_at'])]
class SimulatedPayment extends Model
{
    protected function casts(): array
    {
        return ['simulated_at' => 'datetime'];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
