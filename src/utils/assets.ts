export function getThumbnailUrl(url: string) {
  if (url.startsWith('file://')) {
    return null;
  }

  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  
  if (fileIdMatch) {
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  const idFromUrl = url.split('id=')[1];
  if (idFromUrl) {
    const cleanId = idFromUrl.split('&')[0];
    return `https://drive.google.com/thumbnail?id=${cleanId}&sz=w1000`;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === 'canva.link') {
      return null;
    }

    if (parsedUrl.hostname === 'imgur.com' || parsedUrl.hostname === 'www.imgur.com') {
      const match = parsedUrl.pathname.match(/^\/([a-zA-Z0-9]+)(\.[a-zA-Z0-9]+)?$/);
      if (match) {
        return `https://i.imgur.com/${match[1]}${match[2] || '.jpg'}`;
      }
    }
  } catch {
    return url;
  }

  return url;
}

export function getPreviewUrl(url: string){
  if(url.includes('google.com') && !url.includes('preview')){
    return url.replace('view', 'preview');
  }
  return url;
}
