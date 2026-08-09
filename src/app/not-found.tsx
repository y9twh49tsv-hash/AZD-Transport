import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Compass className="size-7" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Seite nicht gefunden</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Diese Seite gibt es nicht (mehr). Vielleicht suchst du deine Sendung?
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/tracking">
          <Button block className="sm:w-auto">
            Sendung verfolgen
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" block className="sm:w-auto">
            Zur Startseite
          </Button>
        </Link>
      </div>
    </div>
  );
}
