import { BASE_PATH } from './base-path.config';

/**
 * Next adds the base path to <Link> and to redirects, but not to plain form actions or
 * raw Location headers. Use this for those.
 */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path === '/' ? '' : path}` || '/';
}
