'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createSignedUpload } from '@/app/(site)/sperrgut/actions';
import { createClient } from '@/lib/supabase/client';
import { isImageFile, prepareImage } from '@/lib/image';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

export type UploadedPhoto = {
  path: string;
  /** Object URL for the local preview — never a link to the private bucket. */
  previewUrl: string;
};

/**
 * Photo picker with direct-to-storage upload.
 *
 * Flow per file: downscale in the browser → ask the server for a signed upload
 * URL → PUT straight to Supabase Storage. The bucket is private, so the
 * preview shown here is the local blob, not a public URL.
 */
export function PhotoUpload({
  photos,
  onChange,
  max = 6,
  disabled,
}: {
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
  max?: number;
  disabled?: boolean;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setError(null);
    setBusy(true);

    const accepted: UploadedPhoto[] = [];
    const supabase = createClient();

    try {
      for (const file of Array.from(fileList)) {
        if (photos.length + accepted.length >= max) {
          setError(`Maximal ${max} Fotos.`);
          break;
        }
        if (!isImageFile(file)) {
          setError(t('photos.onlyImages'));
          continue;
        }

        const prepared = await prepareImage(file);

        const signed = await createSignedUpload({
          bucket: 'bulky-photos',
          kind: 'bulky_photo',
          fileName: prepared.fileName,
          mimeType: prepared.mimeType,
          sizeBytes: prepared.blob.size,
        });

        if (!signed.ok) {
          setError(signed.error);
          continue;
        }

        const { error: uploadError } = await supabase.storage
          .from(signed.bucket)
          .uploadToSignedUrl(signed.path, signed.token, prepared.blob, {
            contentType: prepared.mimeType,
          });

        if (uploadError) {
          setError(t('photos.uploadFailed'));
          continue;
        }

        accepted.push({
          path: signed.path,
          previewUrl: URL.createObjectURL(prepared.blob),
        });
      }

      if (accepted.length > 0) onChange([...photos, ...accepted]);
    } catch {
      setError(t('photos.processingFailed'));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function remove(index: number) {
    const photo = photos[index];
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    onChange(photos.filter((_, i) => i !== index));
  }

  const full = photos.length >= max;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="sr-only"
        disabled={disabled || busy || full}
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {photos.map((photo, index) => (
          <div
            key={photo.path}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote asset */}
            <img
              src={photo.previewUrl}
              alt={t('photos.photoAlt', { n: index + 1 })}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-foreground/70 text-background backdrop-blur transition-colors hover:bg-destructive"
              aria-label={t('photos.removePhoto', { n: index + 1 })}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || busy}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-input',
              'text-muted-foreground transition-colors hover:border-primary hover:bg-primary-muted/40 hover:text-primary',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {busy ? (
              <Loader2 className="size-6 animate-spin" aria-hidden />
            ) : (
              <Camera className="size-6" aria-hidden />
            )}
            <span className="text-xs font-medium">
              {busy ? t('photos.uploading') : t('photos.addPhoto')}
            </span>
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy || full}
        >
          <ImagePlus aria-hidden />
          {t('photos.choosePhotos')}
        </Button>
        <span className="text-xs text-muted-foreground">
          {photos.length}/{max} · {t('photos.resizeNote')}
        </span>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
