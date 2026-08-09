'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/(auth)/login/actions';

export function SignOutButton({
  variant = 'outline',
  size = 'sm',
  label = 'Abmelden',
}: {
  variant?: 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md';
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      size={size}
      disabled={pending}
      onClick={() => startTransition(() => signOut())}
    >
      <LogOut aria-hidden />
      {pending ? 'Wird abgemeldet …' : label}
    </Button>
  );
}
