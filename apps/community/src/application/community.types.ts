import type { Contribution, Influence, Proposal, Vote } from '@/domain/proposal.types';

export type CommunityState = {
  version: 1;
  nextProposalNumber: number;
  proposals: Proposal[];
  contributions: Contribution[];
  votes: Vote[];
  influences: Influence[];
  pendingLinks: PendingLink[];
};

/** Records an issue creation in progress so repeating the operation never creates a second issue. */
export type PendingLink = {
  proposalNumber: number;
  startedAt: string;
};

export interface CommunityRepository {
  read(): Promise<CommunityState>;
  /** Runs `change` against the latest state and persists it atomically. */
  update<Result>(change: (state: CommunityState) => Result): Promise<Result>;
  readonly durable: boolean;
}

export type GitHubComment = {
  id: number;
  url: string;
  body: string;
  authorLogin: string;
  authorAssociation: 'OWNER' | 'MEMBER' | 'COLLABORATOR' | 'CONTRIBUTOR' | 'NONE';
  isPortalBot: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GitHubIssueSnapshot = {
  number: number;
  url: string;
  title: string;
  body: string;
  state: 'open' | 'closed';
  stateReason: 'completed' | 'not_planned' | 'reopened' | null;
  labels: string[];
  comments: GitHubComment[];
  pullRequests: { number: number; url: string; title: string; state: 'open' | 'closed' | 'merged' }[];
  release: { confirmedAt: string; environment: string; url: string | null } | null;
};

export interface GitHubGateway {
  readonly kind: 'fixture' | 'rest';
  readonly repository: string;
  getIssue(number: number): Promise<GitHubIssueSnapshot | null>;
  listIssuesWithPortalBlock(): Promise<number[]>;
  findIssueByMarker(marker: string): Promise<{ number: number; url: string; title: string } | null>;
  createIssue(input: { title: string; body: string }): Promise<{ number: number; url: string; title: string }>;
  findCommentByMarker(issueNumber: number, marker: string): Promise<{ id: number; url: string } | null>;
  createComment(issueNumber: number, body: string): Promise<{ id: number; url: string }>;
  updateComment(commentId: number, body: string): Promise<void>;
}

export type CommunityConfig = {
  publicOrigin: string;
  maintainers: readonly string[];
  voterSecret: string;
};

export type Clock = () => Date;
export type IdGenerator = () => string;

export type CommunityDependencies = {
  repository: CommunityRepository;
  github: GitHubGateway;
  config: CommunityConfig;
  clock: Clock;
  newId: IdGenerator;
};
