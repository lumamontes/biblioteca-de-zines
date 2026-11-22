import type {
  DeliveryState,
  InfluenceKind,
  OfficialResponse,
  OriginalReport,
  PrincipalIssue,
  ProposalOrigin,
  PullRequestReference,
  QuestionRevision,
  RelatedTask,
  ReleaseConfirmation,
  Stage,
  StageWarning,
  VoteValue,
} from '@/domain/proposal.types';
import type { VoteTally } from '@/domain/voting.service';

export type ProposalSummary = {
  number: number;
  path: string;
  title: string;
  question: string;
  stage: Stage;
  origin: ProposalOrigin;
  featured: boolean;
  votes: VoteTally;
  /** Whether the current visitor has upvoted this proposal. */
  viewerVoted: boolean;
  contributionCount: number;
  hasOfficialResponse: boolean;
  updateSlug: string | null;
  createdAt: string;
  lastActivityAt: string;
};

export type ProposalListView = {
  /** Every public proposal, in board order: open ones (team questions first), suggestions, then decisions. */
  notes: ProposalSummary[];
};

export type ContributionView = {
  id: string;
  displayName: string;
  text: string | null;
  createdAt: string;
  delivery: DeliveryState;
  githubUrl: string | null;
  githubCommentId: number | null;
  lastError: string | null;
  hidden: boolean;
  influence: { kind: InfluenceKind; note: string | null; decisionUrl: string | null } | null;
};

export type DecisionView = {
  response: OfficialResponse;
  justification: string;
  nextSteps: string | null;
};

export type ProposalDetailView = ProposalSummary & {
  canonicalPath: string;
  openDecision: string | null;
  originalReport: OriginalReport | null;
  principalIssue: PrincipalIssue | null;
  relatedTasks: RelatedTask[];
  pullRequests: PullRequestReference[];
  decision: DecisionView | null;
  responses: OfficialResponse[];
  contributions: ContributionView[];
  viewerVote: VoteValue | null;
  votingOpen: boolean;
  contributionOpen: boolean;
  awaitingRelease: boolean;
  release: ReleaseConfirmation | null;
  syncedAt: string | null;
  stale: boolean;
  archiveReason: string | null;
  questionRevisions: QuestionRevision[];
  presentedByTeam: boolean;
};

export type TriageProposalView = {
  summary: ProposalSummary;
  originalReport: OriginalReport | null;
  principalIssue: PrincipalIssue | null;
  warnings: StageWarning[];
  contributions: ContributionView[];
};

export type TriageView = {
  inTriage: TriageProposalView[];
  linked: TriageProposalView[];
  archived: TriageProposalView[];
  deliveryProblems: (ContributionView & { proposalNumber: number; proposalTitle: string })[];
};

export type SubmitContributionResult =
  | { status: 'invalid'; errors: Partial<Record<'text' | 'displayName', string>> }
  | { status: 'closed' }
  | { status: 'saved'; contributionId: string; delivery: DeliveryState; githubUrl: string | null; message: string };
