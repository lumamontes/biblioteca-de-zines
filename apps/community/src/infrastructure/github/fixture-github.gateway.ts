import { GitHubUnavailableError } from '@/application/github-unavailable.error';
import type { GitHubComment, GitHubGateway, GitHubIssueSnapshot } from '@/application/community.types';
import { readJsonFile, writeJsonFileAtomically } from '../json-file.helpers';
import { PORTAL_BOT_LOGIN } from './github.config';
import type { FixtureCommentInput, FixtureFailureMode, FixtureGitHubState } from './fixture-github.types';

/**
 * Simulated GitHub for local development and tests. It keeps issues, comments, labels,
 * PRs and release confirmations, can inject the failures the portal must survive, and
 * exposes the maintainer actions the triage simulator uses.
 */
export class FixtureGitHubGateway implements GitHubGateway {
  readonly kind = 'fixture' as const;
  private state: FixtureGitHubState;

  constructor(private readonly options: { filePath: string | null; seed: () => FixtureGitHubState; failureMode: FixtureFailureMode; clock: () => Date }) {
    const stored = options.filePath ? readJsonFile<FixtureGitHubState>(options.filePath) : null;
    this.state = stored ?? options.seed();
    if (!stored) this.persist();
  }

  get repository(): string {
    return this.state.repository;
  }

  async getIssue(number: number): Promise<GitHubIssueSnapshot | null> {
    const issue = this.state.issues.find((item) => item.number === number);
    return issue ? structuredClone(issue) : null;
  }

  async listIssuesWithPortalBlock(): Promise<number[]> {
    return this.state.issues.filter((issue) => /<!--\s*portal\s*\n/.test(issue.body)).map((issue) => issue.number);
  }

  /** Only issues the portal itself created count, so nobody can plant a marker in their own issue. */
  async findIssueByMarker(marker: string) {
    const issue = this.state.issues.find((item) => item.authorLogin === PORTAL_BOT_LOGIN && item.body.startsWith(marker));
    return issue ? { number: issue.number, url: issue.url, title: issue.title } : null;
  }

  async createIssue(input: { title: string; body: string }) {
    const number = this.state.nextIssueNumber++;
    const issue: GitHubIssueSnapshot = {
      number,
      url: this.issueUrl(number),
      title: input.title,
      body: input.body,
      authorLogin: PORTAL_BOT_LOGIN,
      authorAssociation: 'NONE',
      state: 'open',
      stateReason: null,
      labels: [],
      comments: [],
      pullRequests: [],
      release: null,
    };
    this.state.issues.push(issue);
    this.persist();
    return { number, url: issue.url, title: issue.title };
  }

  async findCommentByMarker(issueNumber: number, marker: string) {
    // Only the portal's own comments, with the marker on the first line, so a quoted marker cannot match.
    const comment = this.requireIssue(issueNumber).comments.find((item) => item.isPortalBot && item.body.startsWith(marker));
    return comment ? { id: comment.id, url: comment.url } : null;
  }

  async createComment(issueNumber: number, body: string) {
    const marker = /<!-- portal:[^>]+-->/.exec(body)?.[0] ?? null;
    const firstAttempt = marker !== null && !this.state.failedMarkers.includes(marker);
    if (this.options.failureMode !== 'none' && firstAttempt) {
      this.state.failedMarkers.push(marker);
      if (this.options.failureMode === 'unavailable') {
        this.persist();
        throw new GitHubUnavailableError('O GitHub está fora do ar no momento.');
      }
      // The comment is created, but the confirmation never reaches the portal.
      this.addComment(issueNumber, { authorLogin: PORTAL_BOT_LOGIN, authorAssociation: 'NONE', body });
      throw new GitHubUnavailableError('O GitHub demorou demais para confirmar a publicação.');
    }
    const comment = this.addComment(issueNumber, { authorLogin: PORTAL_BOT_LOGIN, authorAssociation: 'NONE', body });
    return { id: comment.id, url: comment.url };
  }

  async updateComment(commentId: number, body: string): Promise<void> {
    const comment = this.state.issues.flatMap((issue) => issue.comments).find((item) => item.id === commentId);
    if (!comment) throw new Error(`Comentário ${commentId} não encontrado.`);
    comment.body = body;
    comment.updatedAt = this.options.clock().toISOString();
    this.persist();
  }

  // --- Maintainer and system actions, used by tests and by the local triage simulator. ---

  simulateComment(issueNumber: number, input: FixtureCommentInput): GitHubComment {
    return this.addComment(issueNumber, input);
  }

  simulateIssue(input: { title: string; body: string; authorLogin: string; authorAssociation: GitHubComment['authorAssociation'] }): GitHubIssueSnapshot {
    const number = this.state.nextIssueNumber++;
    const issue: GitHubIssueSnapshot = {
      number,
      url: this.issueUrl(number),
      ...input,
      state: 'open',
      stateReason: null,
      labels: [],
      comments: [],
      pullRequests: [],
      release: null,
    };
    this.state.issues.push(issue);
    this.persist();
    return structuredClone(issue);
  }

  simulateDeleteComment(commentId: number): void {
    for (const issue of this.state.issues) issue.comments = issue.comments.filter((comment) => comment.id !== commentId);
    this.persist();
  }

  simulateSetStageLabel(issueNumber: number, label: string | null): void {
    const issue = this.requireIssue(issueNumber);
    issue.labels = [...issue.labels.filter((item) => !item.startsWith('portal:') || item === 'portal:featured'), ...(label ? [label] : [])];
    this.persist();
  }

  simulateClose(issueNumber: number, reason: 'completed' | 'not_planned'): void {
    const issue = this.requireIssue(issueNumber);
    issue.state = 'closed';
    issue.stateReason = reason;
    this.persist();
  }

  simulateReopen(issueNumber: number): void {
    const issue = this.requireIssue(issueNumber);
    issue.state = 'open';
    issue.stateReason = 'reopened';
    issue.release = null;
    this.persist();
  }

  simulateRelease(issueNumber: number, url: string | null): void {
    const issue = this.requireIssue(issueNumber);
    issue.release = { confirmedAt: this.options.clock().toISOString(), environment: 'Production', url };
    this.persist();
  }

  simulateEditBody(issueNumber: number, body: string): void {
    this.requireIssue(issueNumber).body = body;
    this.persist();
  }

  private addComment(issueNumber: number, input: FixtureCommentInput): GitHubComment {
    const issue = this.requireIssue(issueNumber);
    const id = this.state.nextCommentId++;
    const now = this.options.clock().toISOString();
    const comment: GitHubComment = {
      id,
      url: `${issue.url}#issuecomment-${id}`,
      body: input.body,
      authorLogin: input.authorLogin,
      authorAssociation: input.authorAssociation,
      isPortalBot: input.authorLogin === PORTAL_BOT_LOGIN,
      createdAt: now,
      updatedAt: now,
    };
    issue.comments.push(comment);
    this.persist();
    return structuredClone(comment);
  }

  private requireIssue(number: number): GitHubIssueSnapshot {
    const issue = this.state.issues.find((item) => item.number === number);
    if (!issue) throw new Error(`Issue #${number} não existe no GitHub simulado.`);
    return issue;
  }

  private issueUrl(number: number): string {
    return `https://github.com/${this.state.repository}/issues/${number}`;
  }

  private persist(): void {
    if (this.options.filePath) writeJsonFileAtomically(this.options.filePath, this.state);
  }
}
