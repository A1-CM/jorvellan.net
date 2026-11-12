<?php

namespace App\Http\Controllers;

use App\Models\ActivityEntry;
use App\Models\ImprovementAction;
use App\Models\ProcessObservation;
use App\Models\ProcessRecord;
use App\Models\User;
use App\Models\WorkflowStage;
use Illuminate\Http\Request;
use Illuminate\View\View;

class WorkspaceController extends Controller
{
    public function dashboard(Request $request): View
    {
        /** @var User $user */
        $user = $request->user();
        $processes = ProcessRecord::query()->where('user_id', $user->id)->withCount(['workflowStages', 'observations', 'improvementActions'])->orderBy('name')->get();
        $observations = ProcessObservation::query()->whereHas('processRecord', fn ($query) => $query->where('user_id', $user->id));
        $actions = ImprovementAction::query()->whereHas('processRecord', fn ($query) => $query->where('user_id', $user->id));
        $openActions = (clone $actions)->whereNotIn('status', ['Complete', 'Cancelled']);
        $lateActions = (clone $openActions)->whereNotNull('due_on')->whereDate('due_on', '<', today());
        $pendingReview = (clone $observations)->where('review_status', 'needs_review');
        $blockedStages = WorkflowStage::query()
            ->whereHas('processRecord', fn ($query) => $query->where('user_id', $user->id))
            ->whereIn('status', ['Blocked', 'Waiting'])
            ->with('processRecord:id,name')
            ->get();

        $prompts = collect();
        foreach ($lateActions->with('processRecord:id,name')->limit(5)->get() as $action) {
            $prompts->push([
                'type' => 'overdue_action',
                'title' => $action->title,
                'detail' => $action->processRecord?->name.' · Due '.($action->due_on?->format('M j, Y') ?? 'date not set'),
                'process_id' => $action->process_record_id,
                'action_id' => $action->id,
            ]);
        }
        foreach ($blockedStages->take(5) as $stage) {
            $prompts->push([
                'type' => 'blocked_stage',
                'title' => $stage->name.' needs attention',
                'detail' => $stage->processRecord?->name.' · '.$stage->status,
                'process_id' => $stage->process_record_id,
                'stage_id' => $stage->id,
            ]);
        }
        foreach ($pendingReview->with(['processRecord:id,name', 'workflowStage:id,name'])->latest('observed_on')->limit(5)->get() as $observation) {
            $prompts->push([
                'type' => 'observation_review',
                'title' => $observation->title,
                'detail' => $observation->processRecord?->name.' · '.($observation->workflowStage?->name ?? 'Process level').' · Review pending',
                'process_id' => $observation->process_record_id,
                'stage_id' => $observation->workflow_stage_id,
                'observation_id' => $observation->id,
            ]);
        }

        $activities = ActivityEntry::query()->where('user_id', $user->id)->latest()->limit(8)->get();

        return $this->appPage('dashboard', 'Workspace', 'Review your process records, actions, and activity.', [
            'stats' => [
                'processes' => $processes->count(),
                'departments' => $processes->pluck('department')->filter()->unique()->count(),
                'stages' => $processes->sum('workflow_stages_count'),
                'observations' => (clone $observations)->count(),
                'reviews' => $pendingReview->count(),
                'actions_open' => $openActions->count(),
                'actions_late' => $lateActions->count(),
            ],
            'processes' => $processes->take(8)->map(fn (ProcessRecord $process): array => [
                'id' => $process->id,
                'name' => $process->name,
                'category' => $process->category,
                'department' => $process->department,
                'status' => $process->status,
                'stages' => $process->workflow_stages_count,
            ])->values(),
            'prompts' => $prompts->values(),
            'activities' => $activities->map(fn (ActivityEntry $activity): array => [
                'summary' => $activity->summary,
                'action' => $activity->action,
                'created_at' => $activity->created_at->diffForHumans(),
            ])->values(),
            'empty' => $processes->isEmpty(),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function search(Request $request): View
    {
        $term = trim((string) $request->query('q', ''));
        $userId = $request->user()->id;
        $processes = ProcessRecord::query()->where('user_id', $userId)
            ->when($term !== '', fn ($query) => $query->where(fn ($query) => $query->where('name', 'like', "%{$term}%")->orWhere('department', 'like', "%{$term}%")->orWhere('purpose', 'like', "%{$term}%")))
            ->orderBy('name')->limit(50)->get(['id', 'name', 'department', 'status']);
        $observations = ProcessObservation::query()->whereHas('processRecord', fn ($query) => $query->where('user_id', $userId))
            ->when($term !== '', fn ($query) => $query->where(fn ($query) => $query->where('title', 'like', "%{$term}%")->orWhere('detail', 'like', "%{$term}%")))
            ->with('processRecord:id,name')->latest('observed_on')->limit(50)->get();
        $actions = ImprovementAction::query()->whereHas('processRecord', fn ($query) => $query->where('user_id', $userId))
            ->when($term !== '', fn ($query) => $query->where(fn ($query) => $query->where('title', 'like', "%{$term}%")->orWhere('description', 'like', "%{$term}%")))
            ->with('processRecord:id,name')->latest()->limit(50)->get();

        return $this->appPage('search', 'Search workspace', 'Search your process records and follow-up work.', [
            'term' => $term,
            'processes' => $processes,
            'observations' => $observations,
            'actions' => $actions,
        ]);
    }

    public function activity(Request $request): View
    {
        $activities = ActivityEntry::query()->where('user_id', $request->user()->id)->latest()->paginate(25);

        return $this->appPage('activity', 'Activity history', 'Review changes made in your workspace.', ['activities' => $activities]);
    }
}
