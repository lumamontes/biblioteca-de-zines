import type { GitHubComment, GitHubIssueSnapshot } from '@/application/participation.types';

export type FixtureFailureMode = 'none' | 'lost-confirmation' | 'unavailable';

export type FixtureGitHubState = {
  repository: string;
  nextIssueNumber: number;
  nextCommentId: number;
  issues: GitHubIssueSnapshot[];
  /** Markers whose first publication attempt already went through the configured failure. */
  failedMarkers: string[];
};

export type FixtureCommentInput = {
  authorLogin: string;
  authorAssociation: GitHubComment['authorAssociation'];
  body: string;
};
