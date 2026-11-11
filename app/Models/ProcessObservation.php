<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['process_record_id', 'workflow_stage_id', 'category', 'priority', 'title', 'detail', 'review_status', 'observed_on'])]
class ProcessObservation extends Model
{
    protected function casts(): array
    {
        return ['observed_on' => 'date'];
    }

    public function processRecord(): BelongsTo
    {
        return $this->belongsTo(ProcessRecord::class);
    }

    public function workflowStage(): BelongsTo
    {
        return $this->belongsTo(WorkflowStage::class);
    }
}
