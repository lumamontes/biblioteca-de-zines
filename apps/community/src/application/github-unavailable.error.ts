export class GitHubUnavailableError extends Error {
  constructor(message = 'O GitHub não respondeu.') {
    super(message);
    this.name = 'GitHubUnavailableError';
  }
}
