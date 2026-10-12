import sharp from 'sharp';

export async function optimizeCoverImage(image: Buffer): Promise<Buffer> {
  return sharp(image)
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toBuffer();
}
