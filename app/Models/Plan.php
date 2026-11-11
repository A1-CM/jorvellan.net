<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'audience', 'summary', 'price_cents', 'currency', 'billing_period', 'features', 'is_demo', 'is_active', 'sort_order'])]
class Plan extends Model
{
    protected function casts(): array
    {
        return ['features' => 'array', 'is_demo' => 'boolean', 'is_active' => 'boolean'];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
