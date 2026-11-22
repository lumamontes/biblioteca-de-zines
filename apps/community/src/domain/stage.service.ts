import { STAGE_BY_GITHUB_LABEL, STAGE_LABEL_PREFIX, STAGE_PROGRESS, TERMINAL_STAGES } from './stage.config';
import type { OfficialResponse, ReleaseConfirmation, Stage, StageWarning, TriageState } from './proposal.types';

export type IssueStageInput = {
  state: 'open' | 'closed';
  stateReason: 'completed' | 'not_planned' | 'reopened' | null;
  labels: readonly string[];
  release: ReleaseConfirmation | null;
  officialResponses: readonly Pick<OfficialResponse, 'kind'>[];
};

export type DerivedStage = {
  stage: Stage;
  warnings: StageWarning[];
  awaitingRelease: boolean;
};

export function stageForUnlinked(triageState: Exclude<TriageState, 'linked'>): Stage {
  return triageState === 'archived' ? 'archived' : 'triage';
}

/**
 * Derives the single public stage from the principal issue. GitHub is the
 * source of truth; the portal never stores a stage that GitHub contradicts.
 */
export function deriveStageFromIssue(issue: IssueStageInput): DerivedStage {
  const warnings: StageWarning[] = [];
  const labelStages = issue.labels
    .filter((label) => label.startsWith(STAGE_LABEL_PREFIX))
    .map((label) => STAGE_BY_GITHUB_LABEL[label])
    .filter((stage): stage is Stage => stage !== undefined);

  if (labelStages.length > 1) warnings.push('multiple_stage_labels');
  const labelStage = labelStages.reduce<Stage | null>(
    (current, next) => (current === null || STAGE_PROGRESS[next] > STAGE_PROGRESS[current] ? next : current),
    null,
  );

  let stage: Stage;
  let awaitingRelease = false;

  if (issue.state === 'closed') {
    if (issue.stateReason === 'not_planned' || labelStage === 'not_planned') {
      stage = 'not_planned';
    } else if (issue.release) {
      stage = 'available';
    } else {
      stage = 'in_progress';
      awaitingRelease = true;
    }
  } else if (labelStage && TERMINAL_STAGES.has(labelStage)) {
    warnings.push('terminal_label_on_open_issue');
    stage = 'discussion';
  } else {
    stage = labelStage ?? 'discussion';
  }

  const isDecisionStage = stage === 'decided' || stage === 'not_planned';
  if (isDecisionStage && !issue.officialResponses.some((response) => response.kind === 'decision')) {
    warnings.push('decision_without_justification');
  }

  return { stage, warnings, awaitingRelease };
}

export function isVotingOpen(stage: Stage): boolean {
  return !TERMINAL_STAGES.has(stage);
}

export function isContributionOpen(stage: Stage): boolean {
  return stage !== 'archived';
}

export function isDecidedStage(stage: Stage): boolean {
  return stage === 'decided' || stage === 'in_progress' || stage === 'available' || stage === 'not_planned';
}
