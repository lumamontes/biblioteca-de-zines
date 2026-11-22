import { getCommunityServer } from '@/composition/server/community-server.service';
import { seeOther } from '../../proposals/[segment]/proposal-page.helpers';

/**
 * Stable entry by GitHub issue number, used by the catalogue's novidades:
 * /comunidade/issues/191 leads to the proposal linked to issue #191.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ number: string }> }) {
  const issueNumber = Number((await params).number);
  const { queries } = await getCommunityServer();
  const path = Number.isInteger(issueNumber) && issueNumber > 0 ? await queries.pathForIssue(issueNumber) : null;
  return path ? seeOther(path) : seeOther('/');
}
