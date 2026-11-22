import type { TriageActions } from '@/components/triage/triage-actions.types';
import { archiveAction, influenceAction, linkAction, moderateAction, relatedTaskAction, reopenArchivedAction, simulateGitHubAction } from './actions';

export const TRIAGE_ACTIONS: TriageActions = {
  link: linkAction,
  archive: archiveAction,
  reopenArchived: reopenArchivedAction,
  relatedTask: relatedTaskAction,
  moderate: moderateAction,
  influence: influenceAction,
  simulate: simulateGitHubAction,
};
