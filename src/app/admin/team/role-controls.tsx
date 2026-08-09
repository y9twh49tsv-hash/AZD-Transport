'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Select } from '@/components/ui/input';
import { setUserActive, updateUserRole, type ActionResult } from '@/app/admin/actions';
import { USER_ROLES, roleLabels } from '@/lib/shipment-status';
import type { UserRole } from '@/lib/supabase/database.types';

export function RoleControls({
  profileId,
  currentRole,
  isActive,
  isSelf,
}: {
  profileId: string;
  currentRole: UserRole;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [role, setRole] = useState<string>(currentRole);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-40 flex-1">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Rolle</span>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isSelf}
            className="min-h-10 text-sm"
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabels[r]}
              </option>
            ))}
          </Select>
        </label>

        <Button
          size="sm"
          variant="outline"
          disabled={pending || isSelf || role === currentRole}
          onClick={() =>
            startTransition(async () => setResult(await updateUserRole({ profileId, role })))
          }
        >
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Rolle speichern
        </Button>

        <Button
          size="sm"
          variant={isActive ? 'ghost' : 'outline'}
          disabled={pending || isSelf}
          onClick={() =>
            startTransition(async () =>
              setResult(await setUserActive({ profileId, isActive: !isActive })),
            )
          }
        >
          {isActive ? 'Deaktivieren' : 'Aktivieren'}
        </Button>
      </div>

      {isSelf && (
        <p className="mt-2 text-xs text-muted-foreground">
          Das ist dein eigenes Konto — Rolle und Status kannst du hier nicht ändern.
        </p>
      )}

      {result && (
        <Alert tone={result.ok ? 'success' : 'error'} className="mt-3">
          {result.ok ? (result.message ?? 'Gespeichert.') : result.error}
        </Alert>
      )}
    </div>
  );
}
