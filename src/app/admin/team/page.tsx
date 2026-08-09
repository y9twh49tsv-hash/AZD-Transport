import { redirect } from 'next/navigation';
import { UsersRound } from 'lucide-react';
import { RoleControls } from './role-controls';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { createServerSupabase } from '@/lib/supabase/server';
import { getSessionUser, isAdmin } from '@/lib/auth';
import { roleLabels } from '@/lib/shipment-status';
import { formatDate } from '@/lib/utils';
import type { UserRole } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

const roleTone: Record<UserRole, string> = {
  admin: 'bg-primary text-primary-foreground border-primary',
  staff: 'bg-primary-muted text-primary border-primary/20',
  driver: 'bg-sand/15 text-sand-foreground border-sand/30',
  customer: 'bg-secondary text-secondary-foreground border-border',
};

export default async function TeamPage() {
  const user = await getSessionUser();

  // Staff may see the back office, but only admins manage roles.
  if (!isAdmin(user)) redirect('/kein-zugriff');

  const supabase = await createServerSupabase();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, is_active, created_at')
    .in('role', ['driver', 'staff', 'admin'])
    .order('role')
    .order('full_name');

  const list = profiles ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mitarbeiter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rollen und Zugänge für Fahrer, Mitarbeiter und Admins
        </p>
      </header>

      <Alert tone="info" title="So legst du einen neuen Zugang an">
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>
            Die Person registriert sich selbst über{' '}
            <code className="rounded bg-secondary px-1 text-xs">/registrieren</code> — oder du legst
            sie in Supabase unter Authentication → Users an.
          </li>
          <li>Nach der Bestätigung der E-Mail-Adresse erscheint sie hier als „Kunde“.</li>
          <li>Weise ihr hier die passende Rolle zu.</li>
        </ol>
        <p className="mt-2">
          Neu registrierte Personen ohne Rolle findest du erst in dieser Liste, wenn du ihnen eine
          Rolle gegeben hast. Nutze dafür die Supabase-Konsole oder das SQL aus der README.
        </p>
      </Alert>

      {list.length === 0 ? (
        <div className="surface p-10 text-center">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <UsersRound className="size-6" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">Noch keine Mitarbeiterkonten</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((profile) => (
            <li key={profile.id} className="surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{profile.full_name ?? 'Ohne Namen'}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.phone ?? 'Keine Telefonnummer'} · dabei seit{' '}
                    {formatDate(profile.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={roleTone[profile.role]}>{roleLabels[profile.role]}</Badge>
                  {!profile.is_active && <Badge>Deaktiviert</Badge>}
                </div>
              </div>

              <RoleControls
                profileId={profile.id}
                currentRole={profile.role}
                isActive={profile.is_active}
                isSelf={profile.id === user?.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
