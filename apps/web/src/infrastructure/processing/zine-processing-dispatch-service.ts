const githubApiVersion = '2022-11-28';

/** Best-effort trigger for the event-driven GitHub worker. */
export async function dispatchZineProcessing(): Promise<void> {
  const token = process.env.GITHUB_ACTIONS_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;

  if (!token || !repository) {
    console.warn('GitHub processing dispatch is not configured');
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/dispatches`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': githubApiVersion,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_type: 'process-pending-zines' }),
      },
    );

    if (!response.ok) {
      console.error(`Failed to dispatch zine processing workflow: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to contact GitHub for zine processing:', error);
  }
}
