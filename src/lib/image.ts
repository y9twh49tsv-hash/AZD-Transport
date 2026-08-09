'use client';

/**
 * Client-side image preparation.
 *
 * Phone cameras produce 4–8 MB files. Downscaling in the browser before the
 * upload cuts transfer time on mobile data dramatically and keeps us well
 * inside the bucket's 10 MB limit — while staying more than sharp enough to
 * judge a washing machine or a bicycle.
 *
 * Also strips EXIF metadata (including GPS coordinates) as a side effect of
 * re-encoding through a canvas, which is exactly what we want for photos
 * customers take at home.
 */

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export type PreparedImage = {
  blob: Blob;
  mimeType: 'image/jpeg';
  fileName: string;
  width: number;
  height: number;
};

export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Das Bild konnte nicht verarbeitet werden.');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  );

  if (!blob) throw new Error('Das Bild konnte nicht verarbeitet werden.');

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
  return {
    blob,
    mimeType: 'image/jpeg',
    fileName: `${baseName}.jpg`,
    width,
    height,
  };
}

export function isImageFile(file: File): boolean {
  return /^image\//.test(file.type);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
