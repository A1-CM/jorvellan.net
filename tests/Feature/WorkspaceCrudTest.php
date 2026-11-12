<?php

namespace Tests\Feature;

use App\Models\ActivityEntry;
use App\Models\ImprovementAction;
use App\Models\ProcessObservation;
use App\Models\ProcessRecord;
use App\Models\User;
use App\Models\WorkflowStage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_create_and_maintain_a_process_workflow_observation_and_action(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->post('/processes', $this->processData('Customer onboarding'))
            ->assertRedirect();
        $process = ProcessRecord::query()->where('user_id', $user->id)->sole();

        $this->post("/processes/{$process->id}/stages", [
            'position' => 1,
            'name' => 'Request received',
            'owner_team' => 'Customer operations',
            'status' => 'Complete',
            'task_details' => 'Capture the request and confirm required information.',
        ])->assertRedirect("/processes/{$process->id}");
        $firstStage = $process->workflowStages()->sole();

        $this->post("/processes/{$process->id}/stages", [
            'position' => 2,
            'name' => 'Initial review',
            'owner_team' => 'Operations',
            'status' => 'Blocked',
            'depends_on_stage_id' => $firstStage->id,
        ])->assertRedirect("/processes/{$process->id}");
        $secondStage = $process->workflowStages()->where('position', 2)->sole();
        $this->assertSame($firstStage->id, $secondStage->depends_on_stage_id);

        $this->post('/observations', [
            'process_record_id' => $process->id,
            'workflow_stage_id' => $secondStage->id,
            'category' => 'Handoff',
            'priority' => 'High',
            'title' => 'Approval is waiting',
            'detail' => 'The review is waiting for a manager acknowledgement.',
            'review_status' => 'needs_review',
            'observed_on' => today()->toDateString(),
        ])->assertRedirect();
        $observation = ProcessObservation::query()->sole();

        $this->post('/improvements', [
            'process_record_id' => $process->id,
            'process_observation_id' => $observation->id,
            'title' => 'Clarify approval ownership',
            'description' => 'Document the primary and backup approver.',
            'owner' => 'Operations lead',
            'priority' => 'Medium',
            'status' => 'Planned',
            'due_on' => today()->addWeek()->toDateString(),
        ])->assertRedirect();

        $this->get('/dashboard')
            ->assertOk()
            ->assertSee('Customer onboarding')
            ->assertSee('Approval is waiting')
            ->assertSee('observation_review');
        $this->get('/search?q=approval')->assertOk()->assertSee('Approval is waiting')->assertSee('Clarify approval ownership');
        $this->assertSame(5, ActivityEntry::query()->where('user_id', $user->id)->count());

        $this->delete("/processes/{$process->id}/stages/{$firstStage->id}")->assertRedirect("/processes/{$process->id}");
        $this->assertNull($secondStage->fresh()->depends_on_stage_id);

        $this->patch("/processes/{$process->id}", $this->processData('Customer onboarding revised'))
            ->assertRedirect("/processes/{$process->id}");
        $this->assertDatabaseHas('process_records', ['id' => $process->id, 'name' => 'Customer onboarding revised', 'version' => 2]);

        $this->patch("/processes/{$process->id}/stages/{$secondStage->id}", [
            'position' => 2,
            'name' => 'Manager review',
            'owner_team' => 'Operations',
            'status' => 'In progress',
            'task_details' => 'Review the required approvals.',
        ])->assertRedirect("/processes/{$process->id}");
        $this->assertDatabaseHas('workflow_stages', ['id' => $secondStage->id, 'name' => 'Manager review']);

        $this->patch("/observations/{$observation->id}", [
            'process_record_id' => $process->id,
            'workflow_stage_id' => $secondStage->id,
            'category' => 'Handoff',
            'priority' => 'High',
            'title' => 'Approval reviewed',
            'detail' => 'The manager confirmed the handoff.',
            'review_status' => 'accepted',
            'observed_on' => today()->toDateString(),
        ])->assertRedirect("/observations/{$observation->id}");
        $this->delete("/observations/{$observation->id}")->assertRedirect('/observations');
        $this->assertDatabaseMissing('process_observations', ['id' => $observation->id]);

        $action = ImprovementAction::query()->sole();
        $this->patch("/improvements/{$action->id}", [
            'process_record_id' => $process->id,
            'process_observation_id' => null,
            'title' => 'Clarify approval ownership',
            'description' => 'Publish the updated approval ownership.',
            'owner' => 'Operations lead',
            'priority' => 'High',
            'status' => 'Complete',
            'due_on' => today()->addWeek()->toDateString(),
            'outcome' => 'The primary and backup approvers were documented.',
        ])->assertRedirect("/improvements/{$action->id}");
        $this->delete("/improvements/{$action->id}")->assertRedirect('/improvements');
        $this->assertDatabaseMissing('improvement_actions', ['id' => $action->id]);

        $this->delete("/processes/{$process->id}")->assertRedirect('/processes');
        $this->assertDatabaseMissing('process_records', ['id' => $process->id]);
    }

    public function test_users_cannot_access_other_workspaces_or_legacy_unassigned_records(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherProcess = ProcessRecord::query()->create([
            ...$this->processData('Private process'),
            'user_id' => $otherUser->id,
            'slug' => 'private-process',
            'version' => 1,
        ]);
        $legacyProcess = ProcessRecord::query()->create([
            ...$this->processData('Legacy unassigned process'),
            'user_id' => null,
            'slug' => 'legacy-unassigned-process',
            'version' => 1,
        ]);

        $this->actingAs($owner)
            ->get("/processes/{$otherProcess->id}")
            ->assertNotFound();
        $this->get("/processes/{$legacyProcess->id}")->assertNotFound();
        $this->get('/search?q=process')->assertOk()->assertDontSee('Private process')->assertDontSee('Legacy unassigned process');
        $this->get('/dashboard')->assertOk()->assertSee('&quot;empty&quot;:true', false)->assertDontSee('Private process');

        $this->patch("/processes/{$otherProcess->id}", $this->processData('Attempted takeover'))->assertNotFound();
        $this->delete("/processes/{$otherProcess->id}")->assertNotFound();
        $this->assertSame('Private process', $otherProcess->fresh()->name);
    }

    public function test_a_stage_cannot_depend_on_a_stage_from_another_process(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $firstProcess = $this->createProcess($user, 'First process');
        $secondProcess = $this->createProcess($user, 'Second process');
        $foreignStage = WorkflowStage::query()->create([
            'process_record_id' => $firstProcess->id,
            'position' => 1,
            'name' => 'First stage',
            'owner_team' => 'Operations',
            'status' => 'Complete',
        ]);

        $this->from("/processes/{$secondProcess->id}/stages/create")
            ->post("/processes/{$secondProcess->id}/stages", [
                'position' => 1,
                'name' => 'Invalid dependency',
                'owner_team' => 'Operations',
                'status' => 'Not started',
                'depends_on_stage_id' => $foreignStage->id,
            ])
            ->assertSessionHasErrors('depends_on_stage_id');

        $this->assertDatabaseMissing('workflow_stages', ['name' => 'Invalid dependency']);
    }

    /** @return array<string, string> */
    private function processData(string $name): array
    {
        return [
            'name' => $name,
            'category' => 'Customer operations',
            'department' => 'Operations',
            'owner' => 'Operations manager',
            'status' => 'Active',
            'risk_level' => 'Medium',
            'last_reviewed_at' => today()->toDateString(),
            'purpose' => 'Coordinate a consistent customer onboarding process.',
        ];
    }

    private function createProcess(User $user, string $name): ProcessRecord
    {
        return ProcessRecord::query()->create([
            ...$this->processData($name),
            'user_id' => $user->id,
            'slug' => strtolower(str_replace(' ', '-', $name)),
            'version' => 1,
        ]);
    }
}
