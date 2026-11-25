'use client';

import { useState, useTransition } from 'react';
import type { FormState } from '@/app/actions/customer';

/**
 * Like useActionState, but submits through onSubmit so React does NOT auto-reset the form
 * when the action returns a validation error (which would wipe what the user typed).
 */
export function useFormAction(action: (prev: FormState, fd: FormData) => Promise<FormState>) {
  const [state, setState] = useState<FormState>();
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => setState(await action(undefined, fd)));
  };

  return { state, pending, onSubmit };
}
