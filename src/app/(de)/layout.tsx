import { SiteChrome } from '@/components/transfer/root-layout';
import { rootMetadata, rootViewport } from '@/lib/metadata';

/**
 * Das deutsche Wurzellayout.
 *
 * Deutsch liegt ohne Präfix auf der Wurzel — `/`, `/anfrage`, `/impressum`.
 * Das ist der Hauptmarkt, und diese Adressen sind bereits im Umlauf und in der
 * Sitemap. Sie nach `/de` zu verschieben hieße, jede davon umzuleiten und die
 * eingesammelte Sichtbarkeit neu aufzubauen.
 */
export const metadata = rootMetadata('de');
export const viewport = rootViewport;

export default function DeLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome locale="de">{children}</SiteChrome>;
}
