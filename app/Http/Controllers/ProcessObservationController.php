<?php

namespace App\Http\Controllers;

use App\Models\ProcessObservation;
use App\Models\ProcessRecord;
use App\Models\WorkflowStage;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class ProcessObservationController extends Controller
{
    public function index(Request $request): View
    {
        $observations = ProcessObservation::query()
            ->whereHas('processRecord', fn ($query) => $query->where('user_id', $request->user()->id))
            ->when($request->filled('review_status'), fn ($query) => $query->where('review_status', $request->string('review_status')->toString()))
            ->with(['processRecord:id,name', 'workflowStage:id,name'])
            ->latest('observed_on')->paginate(20)->withQueryString();

        return $this->appPage('observation-list', 'Observations', 'Record and review operational observations.', [
            'observations' => $observations,
            'filters' => $request->only(['review_status']),
            'processes' => ProcessRecord::query()->where('user_id', $request->user()->id)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(Request $request): View
    {
        return $this->appPage('observation-form', 'Record an observation', 'Add an observation to one of your processes.', [
            'mode' => 'create',
            'processes' => ProcessRecord::query()->where('user_id', $request->user()->id)->with('workflowStages:id,process_record_id,name')->orderBy('name')->get(),
            'prefill' => $request->only(['process_record_id', 'workflow_stage_id']),
        ]);
    }

    public function store(Request $request, ActivityLogger $activityLogger): RedirectResponse
    {
        $validated = $this->validatedObservation($request);
        $observation = ProcessObservation::query()->create($validated);
        $activityLogger->record($request->user(), 'created', $observation, 'Recorded observation “'.$observation->title.'”.');

        return redirect()->route('observations.show', $observation)->with('status', 'Observation recorded.');
    }

    public function show(Request $request, ProcessObservation $observation): View
    {
        $this->ensureOwned($request, $observation);
        $observation->load(['processRecord:id,name', 'workflowStage:id,name']);

        return $this->appPage('observation-detail', $observation->title, 'Review an observation and its process context.', ['observation' => $observation]);
    }

    public function edit(Request $request, ProcessObservation $observation): View
    {
        $this->ensureOwned($request, $observation);

        return $this->appPage('observation-form', 'Edit observation', 'Update a recorded observation.', [
            'mode' => 'edit',
            'observation' => $observation,
            'processes' => ProcessRecord::query()->where('user_id', $request->user()->id)->with('workflowStages:id,process_record_id,name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, ProcessObservation $observation, ActivityLogger $activityLogger): RedirectResponse
    {
        $this->ensureOwned($request, $observation);
        $observation->fill($this->validatedObservation($request));
        $observation->save();
        $activityLogger->record($request->user(), 'updated', $observation, 'Updated observation “'.$observation->title.'”.');

        return redirect()->route('observations.show', $observation)->with('status', 'Observation updated.');
    }

    public function destroy(Request $request, ProcessObservation $observation, ActivityLogger $activityLogger): RedirectResponse
    {
        $this->ensureOwned($request, $observation);
        $title = $observation->title;
        $activityLogger->record($request->user(), 'deleted', $observation, 'Deleted observation “'.$title.'”.');
        $observation->delete();

        return redirect()->route('observations.index')->with('status', 'Observation deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedObservation(Request $request): array
    {
        $validated = $request->validate([
            'process_record_id' => ['required', 'integer', Rule::exists('process_records', 'id')->where('user_id', $request->user()->id)],
            'workflow_stage_id' => ['nullable', 'integer', 'exists:workflow_stages,id'],
            'category' => ['required', 'string', 'max:100'],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'title' => ['required', 'string', 'max:180'],
            'detail' => ['required', 'string', 'max:5000'],
            'review_status' => ['required', Rule::in(['needs_review', 'accepted', 'declined'])],
            'observed_on' => ['required', 'date'],
        ]);

        if (! empty($validated['workflow_stage_id'])) {
            $stageBelongsToProcess = WorkflowStage::query()
                ->where('process_record_id', $validated['process_record_id'])
                ->whereKey($validated['workflow_stage_id'])
                ->exists();
            if (! $stageBelongsToProcess) {
                throw ValidationException::withMessages([
                    'workflow_stage_id' => 'Choose a stage that belongs to the selected process.',
                ]);
            }
        }

        return $validated;
    }

    private function ensureOwned(Request $request, ProcessObservation $observation): void
    {
        abort_unless($observation->processRecord()->where('user_id', $request->user()->id)->exists(), 404);
    }
}
