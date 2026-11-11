<?php

namespace Database\Seeders;

use App\Models\ImprovementAction;
use App\Models\Plan;
use App\Models\ProcessObservation;
use App\Models\ProcessRecord;
use App\Models\WorkflowStage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PortalDemoSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $plans = [
            ['name' => 'Explore', 'slug' => 'explore', 'audience' => 'For individual evaluation', 'summary' => 'A guided, read-only look at the Jorvellan sample workspace.', 'price_cents' => 0, 'features' => ['Sample operations dashboard', 'Illustrative process records', 'No account required'], 'is_demo' => true, 'sort_order' => 1],
            ['name' => 'Team', 'slug' => 'team', 'audience' => 'For focused improvement teams', 'summary' => 'A draft plan for a small team organizing process records and review.', 'price_cents' => 4900, 'features' => ['Up to 10 team members', 'Process registry and workflow maps', 'Observation and action tracking', 'Monthly review workspace'], 'is_demo' => false, 'sort_order' => 2],
            ['name' => 'Operations', 'slug' => 'operations', 'audience' => 'For cross-functional operations', 'summary' => 'A draft plan for teams coordinating multiple departments and improvement programs.', 'price_cents' => 14900, 'features' => ['Up to 40 team members', 'Unlimited process records', 'Cross-department review views', 'Priority support'], 'is_demo' => false, 'sort_order' => 3],
        ];

        foreach ($plans as $plan) {
            Plan::query()->updateOrCreate(['slug' => $plan['slug']], [...$plan, 'currency' => 'USD', 'billing_period' => 'month', 'is_active' => true]);
        }

        $processes = [
            ['name' => 'Customer onboarding', 'slug' => 'customer-onboarding', 'department' => 'Customer operations', 'owner' => 'Nadia Perera', 'status' => 'Needs review', 'risk_level' => 'Medium', 'purpose' => 'Move a newly signed customer from handoff to a confirmed first value milestone.'],
            ['name' => 'Invoice to payment', 'slug' => 'invoice-to-payment', 'department' => 'Finance', 'owner' => 'Daniel Silva', 'status' => 'Active', 'risk_level' => 'Low', 'purpose' => 'Issue, verify and reconcile customer invoices through settlement.'],
            ['name' => 'Supplier approval', 'slug' => 'supplier-approval', 'department' => 'Procurement', 'owner' => 'Maya Fernando', 'status' => 'Bottleneck', 'risk_level' => 'High', 'purpose' => 'Assess supplier risk and route vendors through required approvals.'],
            ['name' => 'Employee access request', 'slug' => 'employee-access', 'department' => 'IT operations', 'owner' => 'Ishan Jayasuriya', 'status' => 'Active', 'risk_level' => 'Medium', 'purpose' => 'Provision role-appropriate access with documented approvals and closure.'],
            ['name' => 'Customer issue resolution', 'slug' => 'issue-resolution', 'department' => 'Support', 'owner' => 'Leah Wijesinghe', 'status' => 'Active', 'risk_level' => 'Medium', 'purpose' => 'Triage, investigate and resolve customer-reported issues.'],
            ['name' => 'Purchase order approval', 'slug' => 'purchase-order', 'department' => 'Finance', 'owner' => 'Ravi de Alwis', 'status' => 'Needs review', 'risk_level' => 'Low', 'purpose' => 'Validate spend requests against policy, budget and delegated authority.'],
            ['name' => 'Product change review', 'slug' => 'product-change-review', 'department' => 'Product', 'owner' => 'Sara Mendis', 'status' => 'Active', 'risk_level' => 'Medium', 'purpose' => 'Assess proposed changes for customer, delivery and operational impacts.'],
            ['name' => 'Month-end close', 'slug' => 'month-end-close', 'department' => 'Finance', 'owner' => 'Owen Peris', 'status' => 'In progress', 'risk_level' => 'High', 'purpose' => 'Coordinate reconciliations, review balances and close the reporting period.'],
        ];
        $stageSets = [
            ['Request received', 'Initial assessment', 'Owner assigned', 'Work completed', 'Outcome confirmed'],
            ['Request submitted', 'Policy checks', 'Manager approval', 'Finance review', 'Decision recorded'],
            ['Case opened', 'Triage', 'Investigation', 'Resolution proposed', 'Customer follow-up'],
            ['Source documents', 'Review and reconcile', 'Exceptions cleared', 'Manager sign-off', 'Period closed'],
        ];
        $stageStatuses = ['Complete', 'Complete', 'In review', 'Waiting', 'Not started'];
        $records = [];

        foreach ($processes as $index => $process) {
            $record = ProcessRecord::query()->updateOrCreate(
                ['slug' => $process['slug']],
                [...$process, 'version' => 2, 'last_reviewed_at' => now()->subDays(($index + 1) * 3)->toDateString()],
            );
            $records[] = $record;

            foreach ($stageSets[$index % count($stageSets)] as $position => $stageName) {
                WorkflowStage::query()->updateOrCreate(
                    ['process_record_id' => $record->id, 'position' => $position + 1],
                    ['name' => $stageName, 'owner_team' => $record->department, 'status' => $stageStatuses[$position], 'expected_minutes' => 30 + ($position * 25), 'observed_minutes' => $position === 2 && $index === 2 ? 210 : 35 + ($position * 29), 'handoff_note' => $position === 2 ? 'Confirm next owner and record any waiting time.' : null],
                );
            }
        }

        $observationSeeds = [
            [0, 2, 'Handoff', 'High', 'Approval queue has variable wait time', 'Recent records show a wide difference between submission and manager review. Compare the queue by team and week before deciding on an intervention.'],
            [0, 1, 'Data quality', 'Medium', 'Customer records need a second correction pass', 'A sample of recent onboarding files required repeated edits to contact and billing fields.'],
            [1, 3, 'Rework', 'Medium', 'Invoice reference is re-entered during reconciliation', 'Finance notes describe a manual copy step that may introduce avoidable mismatches.'],
            [2, 2, 'Bottleneck', 'High', 'Supplier risk review is the longest stage', 'The recorded sample times suggest this stage has more waiting than the surrounding steps. Validate with process owners.'],
            [2, 3, 'Ownership', 'Medium', 'Exception approvals have no named backup', 'Several exception cases remained pending when the primary approver was unavailable.'],
            [3, 1, 'Access', 'Low', 'Request categories are applied inconsistently', 'Similar access requests were routed to different teams in the sample records.'],
            [4, 2, 'Queue', 'Medium', 'Issue triage time changes by category', 'The team may benefit from a shared definition of urgency and routing thresholds.'],
            [5, 2, 'Policy', 'Low', 'Purchase request fields are often incomplete', 'Missing cost center information is a recurring reason for clarification.'],
            [6, 3, 'Review', 'Medium', 'Change impact notes are not consistently linked', 'Reviewers noted that affected operational teams were sometimes identified late.'],
            [7, 2, 'Close', 'High', 'Two reconciliations depend on the same reviewer', 'The current sample close plan shows a shared reviewer across parallel tasks, creating a possible scheduling constraint.'],
        ];
        $observations = [];

        foreach ($observationSeeds as [$recordIndex, $stagePosition, $category, $priority, $title, $detail]) {
            $record = $records[$recordIndex];
            $stage = $record->workflowStages()->where('position', $stagePosition + 1)->first();
            $observations[$title] = ProcessObservation::query()->updateOrCreate(
                ['process_record_id' => $record->id, 'title' => $title],
                ['workflow_stage_id' => $stage?->id, 'category' => $category, 'priority' => $priority, 'detail' => $detail, 'review_status' => 'needs_review', 'observed_on' => now()->subDays($recordIndex + 2)->toDateString()],
            );
        }

        $actionSeeds = [
            [0, 'Compare approval wait time by segment', 'Review a representative set of onboarding cases and identify where the approval queue accumulates.', 'Nadia Perera', 'High', 'In progress', 8, 'Approval queue review scheduled with customer operations.'],
            [0, 'Standardize customer data intake', 'Agree on required billing and contact fields and add a single review checklist.', 'Kavindi Jayawardena', 'Medium', 'Planned', 18, null],
            [1, 'Assess invoice reference handoff', 'Map the reference transfer and check whether a stable identifier can be reused.', 'Daniel Silva', 'Medium', 'In review', 12, null],
            [2, 'Document an approval backup path', 'Define the alternate approver and escalation path for supplier exceptions.', 'Maya Fernando', 'High', 'In progress', 5, null],
            [4, 'Review category routing definitions', 'Compare routing rules against recent issue types with support leads.', 'Leah Wijesinghe', 'Medium', 'Planned', 22, null],
            [5, 'Add cost center guidance to intake', 'Provide an example and a short validation prompt for requestors.', 'Ravi de Alwis', 'Low', 'Complete', -2, 'Guidance was added to the sample request checklist.'],
            [6, 'Add affected-team prompt to change review', 'Include an explicit operations impact question in the review record.', 'Sara Mendis', 'Medium', 'In review', 11, null],
            [7, 'Review close calendar dependencies', 'Compare reviewer assignments across reconciliations and identify a backup.', 'Owen Peris', 'High', 'In progress', 3, null],
        ];

        foreach ($actionSeeds as [$recordIndex, $title, $description, $owner, $priority, $status, $daysFromNow, $outcome]) {
            $record = $records[$recordIndex];
            $observation = collect($observations)->first(fn (ProcessObservation $candidate): bool => $candidate->process_record_id === $record->id);
            ImprovementAction::query()->updateOrCreate(
                ['process_record_id' => $record->id, 'title' => $title],
                ['process_observation_id' => $observation?->id, 'description' => $description, 'owner' => $owner, 'priority' => $priority, 'status' => $status, 'due_on' => now()->addDays($daysFromNow)->toDateString(), 'outcome' => $outcome],
            );
        }
    }
}
