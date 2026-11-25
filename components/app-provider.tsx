'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CartLine, Product } from '@/lib/types';

type Ctx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (p: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toast: (msg: string) => void;
};

const AppCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = 'luxe_cart_v1';

export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp must be used inside <AppProvider>');
  return c;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load once on the client; storage may be unavailable (private mode), so never throw.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(saved)) setLines(saved);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);

  const toast = useCallback((msg: string) => {
    setMessage(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 2400);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      add: (p) => {
        setLines((ls) =>
          ls.some((l) => l.id === p.id)
            ? ls.map((l) => (l.id === p.id ? { ...l, qty: Math.min(20, l.qty + 1) } : l))
            : [...ls, { id: p.id, name: p.name, price: p.price, color: p.color, image: p.images[0] ?? '', qty: 1 }],
        );
        toast('Added to your bag');
      },
      remove: (id) => setLines((ls) => ls.filter((l) => l.id !== id)),
      clear: () => setLines([]),
      drawerOpen,
      setDrawerOpen,
      toast,
    }),
    [lines, drawerOpen, toast],
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
      <div className={`toast${message ? ' show' : ''}`} role="status" aria-live="polite">
        {message}
      </div>
    </AppCtx.Provider>
  );
}
