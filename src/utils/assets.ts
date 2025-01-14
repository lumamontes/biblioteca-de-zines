export function getThumbnailUrl(url: string) {
  const idFromUrl = url.split('id=')[1];
  const newUrl = `https://drive.google.com/thumbnail?id=${idFromUrl}&sz=w1000`;
  return newUrl;
}

export function getPreviewUrl(url: string){
  if(url.includes('google.com') && !url.includes('preview')){
    return url.replace('view', 'preview');
  }
  return url;
}