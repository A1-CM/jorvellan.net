<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'department', 'owner', 'status', 'risk_level', 'version', 'last_reviewed_at', 'purpose'])]
class ProcessRecord extends Model
{
    protected function casts(): array
    {
        return ['last_reviewed_at' => 'date'];
    }

    public function workflowStages(): HasMany
    {
        return $this->hasMany(WorkflowStage::class)->orderBy('position');
    }

    public function observations(): HasMany
    {
        return $this->hasMany(ProcessObservation::class)->latest('observed_on');
    }

    public function improvementActions(): HasMany
    {
        return $this->hasMany(ImprovementAction::class)->latest('created_at');
    }
}
