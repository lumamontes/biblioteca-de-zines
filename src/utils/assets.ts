export function getThumbnailUrl(url: string) {
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
  
  console.warn('Could not extract file ID from URL:', url);
  return url;
}

export function getPreviewUrl(url: string){
  if(url.includes('google.com') && !url.includes('preview')){
    return url.replace('view', 'preview');
  }
  return url;
}