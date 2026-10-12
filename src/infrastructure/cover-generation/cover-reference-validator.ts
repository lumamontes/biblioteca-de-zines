export async function isReachableImage(url: string | null): Promise<boolean> {
  if (!url) return false;
  try {
    const head = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (isImageResponse(head)) return true;
    if (head.status !== 405 && head.status !== 501) return false;

    const response = await fetch(url, {
      headers: { Range: 'bytes=0-0' },
      redirect: 'follow',
    });
    return isImageResponse(response);
  } catch {
    return false;
  }
}

function isImageResponse(response: Response): boolean {
  return response.ok && response.headers.get('content-type')?.startsWith('image/') === true;
}
