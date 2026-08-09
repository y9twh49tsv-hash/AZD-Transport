import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col corridor-gradient">
      <header className="container flex h-16 items-center">
        <Link href="/" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
          <span className="sr-only">Zur Startseite</span>
        </Link>
      </header>

      <main id="main" className="container flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="container py-6">
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Link href="/impressum" className="hover:text-foreground">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-foreground">
            Datenschutz
          </Link>
          <Link href="/agb" className="hover:text-foreground">
            AGB
          </Link>
        </nav>
      </footer>
    </div>
  );
}
