'use client';

import { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAttachmentUrl } from '@/app/admin/actions';

type Attachment = { id: string; caption: string | null; created_at: string };

/**
 * Photos live in private buckets and are fetched through short-lived signed
 * URLs (5 minutes), requested only when a staff member actually opens one.
 * No permanent image URL ever exists, so a leaked link expires by itself.
 */
export function AttachmentGallery({ attachments }: { attachments: Attachment[] }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  async function load(id: string) {
    if (urls[id] || loading) return;
    setLoading(id);
    const url = await getAttachmentUrl(id);
    if (url) {
      setUrls((prev) => ({ ...prev, [id]: url }));
    } else {
      setFailed((prev) => ({ ...prev, [id]: true }));
    }
    setLoading(null);
  }

  if (attachments.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-input p-5 text-sm text-muted-foreground">
        <ImageOff className="size-5 shrink-0" aria-hidden />
        Keine Fotos vorhanden.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {attachments.map((attachment) => {
        const url = urls[attachment.id];
        const isLoading = loading === attachment.id;

        return (
          <div
            key={attachment.id}
            className="overflow-hidden rounded-xl border border-border bg-secondary"
          >
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived URL */}
                <img
                  src={url}
                  alt={attachment.caption ?? 'Foto zur Anfrage'}
                  className="aspect-square w-full object-cover transition-opacity hover:opacity-90"
                />
              </a>
            ) : failed[attachment.id] ? (
              <div className="flex aspect-square items-center justify-center p-3 text-center text-xs text-muted-foreground">
                Foto konnte nicht geladen werden.
              </div>
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center gap-2 p-3">
                <Button size="sm" variant="outline" onClick={() => load(attachment.id)} disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" aria-hidden /> : null}
                  Foto anzeigen
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
