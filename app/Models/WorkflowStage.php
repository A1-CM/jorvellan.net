<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['process_record_id', 'position', 'name', 'owner_team', 'status', 'expected_minutes', 'observed_minutes', 'handoff_note'])]
class WorkflowStage extends Model
{
    public function processRecord(): BelongsTo
    {
        return $this->belongsTo(ProcessRecord::class);
    }
}
