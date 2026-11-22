export type ProposalOrigin = 'community' | 'team';

export type Stage =
  | 'triage'
  | 'discussion'
  | 'decided'
  | 'in_progress'
  | 'available'
  | 'not_planned'
  | 'archived';

export type TriageState = 'triage' | 'linked' | 'archived';

export type OfficialResponseKind = 'answer' | 'update' | 'decision';

export type DeliveryState = 'local' | 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled';

export type ModerationState = 'visible' | 'hidden' | 'deleted_on_github';

export type InfluenceKind = 'clarified_need' | 'changed_priority' | 'changed_solution';

export type VoteValue = 1 | -1;

export type StageWarning =
  | 'terminal_label_on_open_issue'
  | 'multiple_stage_labels'
  | 'decision_without_justification'
  | 'unauthorized_official_marker';

export type OriginalReport = {
  text: string;
  displayName: string;
  submittedAt: string;
};

export type PrincipalIssue = {
  number: number;
  url: string;
  technicalTitle: string;
  linkedAt: string;
  linkCommentUrl: string | null;
};

export type RelatedTask = {
  number: number;
  url: string;
  title: string;
};

export type OfficialResponse = {
  githubCommentId: number;
  url: string;
  kind: OfficialResponseKind;
  authorLogin: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt: string;
};

export type PullRequestReference = {
  number: number;
  url: string;
  title: string;
  state: 'open' | 'closed' | 'merged';
};

export type ReleaseConfirmation = {
  confirmedAt: string;
  environment: string;
  url: string | null;
};

export type ProposalSyncCache = {
  stage: Stage;
  warnings: StageWarning[];
  awaitingRelease: boolean;
  issueState: 'open' | 'closed';
  issueStateReason: 'completed' | 'not_planned' | 'reopened' | null;
  officialResponses: OfficialResponse[];
  pullRequests: PullRequestReference[];
  release: ReleaseConfirmation | null;
  syncedAt: string;
};

export type QuestionRevision = {
  publicTitle: string;
  publicQuestion: string;
  replacedAt: string;
};

export type Proposal = {
  number: number;
  origin: ProposalOrigin;
  publicTitle: string;
  publicQuestion: string;
  openDecision: string | null;
  originalReport: OriginalReport | null;
  createdAt: string;
  lastActivityAt: string;
  featured: boolean;
  triageState: TriageState;
  archive: { reason: string; archivedAt: string; archivedBy: string } | null;
  principalIssue: PrincipalIssue | null;
  relatedTasks: RelatedTask[];
  questionRevisions: QuestionRevision[];
  presentedByTeam: boolean;
  cache: ProposalSyncCache | null;
};

export type Contribution = {
  id: string;
  proposalNumber: number;
  displayName: string;
  text: string;
  createdAt: string;
  delivery: {
    state: DeliveryState;
    attempts: number;
    lastAttemptAt: string | null;
    lastError: string | null;
    githubCommentId: number | null;
    githubUrl: string | null;
    issueNumber: number | null;
  };
  moderation: {
    state: ModerationState;
    reason: string | null;
    moderatedAt: string | null;
    moderatedBy: string | null;
  };
};

export type Vote = {
  proposalNumber: number;
  voterHash: string;
  value: VoteValue;
  updatedAt: string;
};

export type Influence = {
  contributionId: string;
  proposalNumber: number;
  kind: InfluenceKind;
  note: string | null;
  decisionUrl: string | null;
  recordedAt: string;
  recordedBy: string;
};
