<?php

namespace App\Http\Controllers;

use App\Models\ProcessRecord;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class ProcessRecordController extends Controller
{
    public function index(Request $request): View
    {
        $processes = ProcessRecord::query()->where('user_id', $request->user()->id)
            ->when($request->filled('q'), fn ($query) => $query->where(fn ($query) => $query->where('name', 'like', '%'.$request->string('q')->toString().'%')->orWhere('department', 'like', '%'.$request->string('q')->toString().'%')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->withCount(['workflowStages', 'observations', 'improvementActions'])->orderBy('name')->paginate(20)->withQueryString();

        return $this->appPage('process-list', 'Process records', 'Create and maintain your process registry.', [
            'processes' => $processes,
            'filters' => $request->only(['q', 'status']),
        ]);
    }

    public function create(): View
    {
        return $this->appPage('process-form', 'Create process', 'Add a process to your workspace.', ['mode' => 'create']);
    }

    public function store(Request $request, ActivityLogger $activityLogger): RedirectResponse
    {
        $validated = $request->validate($this->rules());
        /** @var User $user */
        $user = $request->user();
        $process = ProcessRecord::query()->create([
            ...$validated,
            'user_id' => $user->id,
            'slug' => $this->uniqueSlug($user, $validated['name']),
            'version' => 1,
        ]);
        $activityLogger->record($user, 'created', $process, 'Created process “'.$process->name.'”.');

        return redirect()->route('processes.show', $process)->with('status', 'Process created.');
    }

    public function show(Request $request, ProcessRecord $process): View
    {
        $this->ensureOwned($request, $process);
        $process->load(['workflowStages.dependency', 'observations.workflowStage', 'improvementActions']);

        return $this->appPage('process-detail', $process->name, 'Review process details, workflow stages, observations, and improvements.', [
            'process' => $process,
        ]);
    }

    public function edit(Request $request, ProcessRecord $process): View
    {
        $this->ensureOwned($request, $process);

        return $this->appPage('process-form', 'Edit process', 'Update this process record.', [
            'mode' => 'edit',
            'process' => $process,
        ]);
    }

    public function update(Request $request, ProcessRecord $process, ActivityLogger $activityLogger): RedirectResponse
    {
        $this->ensureOwned($request, $process);
        $validated = $request->validate($this->rules());
        $process->fill($validated);
        $process->version++;
        $process->save();
        $activityLogger->record($request->user(), 'updated', $process, 'Updated process “'.$process->name.'”.', ['version' => $process->version]);

        return redirect()->route('processes.show', $process)->with('status', 'Process updated.');
    }

    public function destroy(Request $request, ProcessRecord $process, ActivityLogger $activityLogger): RedirectResponse
    {
        $this->ensureOwned($request, $process);
        $name = $process->name;
        $activityLogger->record($request->user(), 'deleted', $process, 'Deleted process “'.$name.'”.');
        $process->delete();

        return redirect()->route('processes.index')->with('status', 'Process deleted.');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:160'],
            'category' => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:120'],
            'owner' => ['required', 'string', 'max:120'],
            'status' => ['required', Rule::in(['Active', 'Needs review', 'In progress', 'Paused', 'Archived'])],
            'risk_level' => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'last_reviewed_at' => ['nullable', 'date'],
            'purpose' => ['required', 'string', 'max:5000'],
        ];
    }

    private function uniqueSlug(User $user, string $name): string
    {
        $baseSlug = Str::slug($name) ?: 'process';
        $slug = $baseSlug;
        $suffix = 2;

        while (ProcessRecord::query()->where('user_id', $user->id)->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    private function ensureOwned(Request $request, ProcessRecord $process): void
    {
        abort_unless($process->user_id === $request->user()->id, 404);
    }
}
