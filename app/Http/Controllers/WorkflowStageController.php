<?php

namespace App\Http\Controllers;

use App\Models\ProcessRecord;
use App\Models\WorkflowStage;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class WorkflowStageController extends Controller
{
    public function create(Request $request, ProcessRecord $process): View
    {
        $this->ensureOwned($request, $process);

        return $this->appPage('stage-form', 'Add workflow stage', 'Add a stage to '.$process->name.'.', [
            'mode' => 'create',
            'process' => $process->load('workflowStages:id,process_record_id,position,name'),
        ]);
    }

    public function store(Request $request, ProcessRecord $process, ActivityLogger $activityLogger): RedirectResponse
    {
        $this->ensureOwned($request, $process);
        $validated = $this->validatedStage($request, $process);
        $stage = $process->workflowStages()->create($validated);
        $activityLogger->record($request->user(), 'created', $stage, 'Added workflow stage “'.$stage->name.'” to '.$process->name.'.');

        return redirect()->route('processes.show', $process)->with('status', 'Workflow stage created.');
    }

    public function edit(Request $request, ProcessRecord $process, WorkflowStage $stage): View
    {
        $this->ensureOwned($request, $process);
        $this->ensureStage($process, $stage);

        return $this->appPage('stage-form', 'Edit workflow stage', 'Update a stage in '.$process->name.'.', [
            'mode' => 'edit',
            'process' => $process->load('workflowStages:id,process_record_id,position,name'),
            'stage' => $stage,
        ]);
    }

    public function update(Request $request, ProcessRecord $process, WorkflowStage $stage, ActivityLogger $activityLogger): RedirectResponse
    {
        $this->ensureOwned($request, $process);
        $this->ensureStage($process, $stage);
        $stage->fill($this->validatedStage($request, $process, $stage));
        $stage->save();
        $activityLogger->record($request->user(), 'updated', $stage, 'Updated workflow stage “'.$stage->name.'” in '.$process->name.'.');

        return redirect()->route('processes.show', $process)->with('status', 'Workflow stage updated.');
    }

    public function destroy(Request $request, ProcessRecord $process, WorkflowStage $stage, ActivityLogger $activityLogger): RedirectResponse
    {
        $this->ensureOwned($request, $process);
        $this->ensureStage($process, $stage);
        $name = $stage->name;
        $activityLogger->record($request->user(), 'deleted', $stage, 'Deleted workflow stage “'.$name.'” from '.$process->name.'.');
        $stage->delete();

        return redirect()->route('processes.show', $process)->with('status', 'Workflow stage deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedStage(Request $request, ProcessRecord $process, ?WorkflowStage $stage = null): array
    {
        $positionRule = Rule::unique('workflow_stages', 'position')->where('process_record_id', $process->id);
        if ($stage) {
            $positionRule->ignore($stage->id);
        }

        $validated = $request->validate([
            'position' => ['required', 'integer', 'min:1', 'max:1000', $positionRule],
            'name' => ['required', 'string', 'max:160'],
            'task_details' => ['nullable', 'string', 'max:4000'],
            'depends_on_stage_id' => ['nullable', 'integer', Rule::exists('workflow_stages', 'id')->where('process_record_id', $process->id)],
            'owner_team' => ['required', 'string', 'max:120'],
            'status' => ['required', Rule::in(['Not started', 'In progress', 'Waiting', 'Blocked', 'In review', 'Complete'])],
            'expected_minutes' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'observed_minutes' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'handoff_note' => ['nullable', 'string', 'max:4000'],
        ]);

        if (! empty($validated['depends_on_stage_id'])) {
            $dependency = WorkflowStage::query()->where('process_record_id', $process->id)->findOrFail($validated['depends_on_stage_id']);
            if ($dependency->id === $stage?->id || $dependency->position >= (int) $validated['position']) {
                $this->dependencyError();
            }
        }

        return $validated;
    }

    private function dependencyError(): never
    {
        throw ValidationException::withMessages([
            'depends_on_stage_id' => 'Choose an earlier stage in this process as the dependency.',
        ]);
    }

    private function ensureOwned(Request $request, ProcessRecord $process): void
    {
        abort_unless($process->user_id === $request->user()->id, 404);
    }

    private function ensureStage(ProcessRecord $process, WorkflowStage $stage): void
    {
        abort_unless($stage->process_record_id === $process->id, 404);
    }
}
