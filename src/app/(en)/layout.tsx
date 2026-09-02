import { SiteChrome } from '@/components/transfer/root-layout';
import { rootMetadata, rootViewport } from '@/lib/metadata';

/**
 * Das englische Wurzellayout — für alles unter `/en`.
 *
 * Ein zweites Wurzellayout und nicht bloß ein zweiter Satz Texte: nur so
 * bekommt die englische Fassung ihr eigenes `<html lang="en">`.
 */
export const metadata = rootMetadata('en');
export const viewport = rootViewport;

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome locale="en">{children}</SiteChrome>;
}
