<?php

namespace App\Http\Controllers;

use App\Models\ImprovementAction;
use App\Models\ProcessObservation;
use App\Models\ProcessRecord;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class ImprovementActionController extends Controller
{
    public function index(Request $request): View
    {
        $actions = ImprovementAction::query()->whereHas('processRecord', fn ($query) => $query->where('user_id', $request->user()->id))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->query('due') === 'overdue', fn ($query) => $query->whereNotIn('status', ['Complete', 'Cancelled'])->whereNotNull('due_on')->whereDate('due_on', '<', today()))
            ->with(['processRecord:id,name', 'observation:id,title'])
            ->orderByRaw("CASE status WHEN 'In progress' THEN 0 WHEN 'In review' THEN 1 WHEN 'Planned' THEN 2 ELSE 3 END")
            ->orderBy('due_on')->paginate(20)->withQueryString();

        return $this->appPage('improvement-list', 'Improvements', 'Track owners, priorities, due dates, and outcomes.', [
            'improvements' => $actions,
            'filters' => $request->only(['status', 'due']),
        ]);
    }

    public function create(Request $request): View
    {
        return $this->appPage('improvement-form', 'Create improvement action', 'Plan a follow-up action for one of your processes.', [
            'mode' => 'create',
            'processes' => ProcessRecord::query()->where('user_id', $request->user()->id)->with('observations:id,process_record_id,title')->orderBy('name')->get(),
            'prefill' => $request->only(['process_record_id', 'process_observation_id']),
        ]);
    }

    public function store(Request $request, ActivityLogger $activityLogger): RedirectResponse
    {
        $action = ImprovementAction::query()->create($this->validatedAction($request));
        $activityLogger->record($request->user(), 'created', $action, 'Created improvement action “'.$action->title.'”.');

        return redirect()->route('improvements.show', $action)->with('status', 'Improvement action created.');
    }

    public function show(Request $request, ImprovementAction $improvement): View
    {
        $this->ensureOwned($request, $improvement);
        $improvement->load(['processRecord:id,name', 'observation:id,title']);

        return $this->appPage('improvement-detail', $improvement->title, 'Review an improvement action and its process context.', ['improvement' => $improvement]);
    }

    public function edit(Request $request, ImprovementAction $improvement): View
    {
        $this->ensureOwned($request, $improvement);

        return $this->appPage('improvement-form', 'Edit improvement action', 'Update a planned improvement action.', [
            'mode' => 'edit',
            'improvement' => $improvement,
            'processes' => ProcessRecord::query()->where('user_id', $request->user()->id)->with('observations:id,process_record_id,title')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, ImprovementAction $improvement, ActivityLogger $activityLogger): RedirectResponse
    {
        $this->ensureOwned($request, $improvement);
        $improvement->fill($this->validatedAction($request));
        $improvement->save();
        $activityLogger->record($request->user(), 'updated', $improvement, 'Updated improvement action “'.$improvement->title.'”.');

        return redirect()->route('improvements.show', $improvement)->with('status', 'Improvement action updated.');
    }

    public function destroy(Request $request, ImprovementAction $improvement, ActivityLogger $activityLogger): RedirectResponse
    {
        $this->ensureOwned($request, $improvement);
        $title = $improvement->title;
        $activityLogger->record($request->user(), 'deleted', $improvement, 'Deleted improvement action “'.$title.'”.');
        $improvement->delete();

        return redirect()->route('improvements.index')->with('status', 'Improvement action deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedAction(Request $request): array
    {
        $validated = $request->validate([
            'process_record_id' => ['required', 'integer', Rule::exists('process_records', 'id')->where('user_id', $request->user()->id)],
            'process_observation_id' => ['nullable', 'integer', 'exists:process_observations,id'],
            'title' => ['required', 'string', 'max:180'],
            'description' => ['required', 'string', 'max:5000'],
            'owner' => ['required', 'string', 'max:120'],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'status' => ['required', Rule::in(['Planned', 'In progress', 'In review', 'Complete', 'Cancelled'])],
            'due_on' => ['nullable', 'date'],
            'outcome' => ['nullable', 'string', 'max:5000'],
        ]);

        if (! empty($validated['process_observation_id'])) {
            $observationMatchesProcess = ProcessObservation::query()
                ->where('process_record_id', $validated['process_record_id'])
                ->whereKey($validated['process_observation_id'])
                ->exists();
            if (! $observationMatchesProcess) {
                throw ValidationException::withMessages([
                    'process_observation_id' => 'Choose an observation that belongs to the selected process.',
                ]);
            }
        }

        return $validated;
    }

    private function ensureOwned(Request $request, ImprovementAction $improvement): void
    {
        abort_unless($improvement->processRecord()->where('user_id', $request->user()->id)->exists(), 404);
    }
}
