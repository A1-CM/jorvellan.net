<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['process_record_id', 'process_observation_id', 'title', 'description', 'owner', 'priority', 'status', 'due_on', 'outcome'])]
class ImprovementAction extends Model
{
    protected function casts(): array
    {
        return ['due_on' => 'date'];
    }

    public function processRecord(): BelongsTo
    {
        return $this->belongsTo(ProcessRecord::class);
    }

    public function observation(): BelongsTo
    {
        return $this->belongsTo(ProcessObservation::class, 'process_observation_id');
    }
}
