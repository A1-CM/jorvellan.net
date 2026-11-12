<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['process_record_id', 'position', 'name', 'task_details', 'depends_on_stage_id', 'owner_team', 'status', 'expected_minutes', 'observed_minutes', 'handoff_note'])]
class WorkflowStage extends Model
{
    protected function casts(): array
    {
        return ['position' => 'integer'];
    }

    public function processRecord(): BelongsTo
    {
        return $this->belongsTo(ProcessRecord::class);
    }

    public function dependency(): BelongsTo
    {
        return $this->belongsTo(self::class, 'depends_on_stage_id');
    }
}
