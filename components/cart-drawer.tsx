'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { money } from '@/lib/format';
import { useApp } from './app-provider';

export function CartDrawer() {
  const { lines, count, subtotal, remove, drawerOpen, setDrawerOpen } = useApp();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, setDrawerOpen]);

  return (
    <>
      <div className={`overlay${drawerOpen ? ' show' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen} aria-label="Shopping bag">
        <div className="drawer-head">
          <div>
            <p className="eyebrow">YOUR SELECTION</p>
            <h2>Your bag <span>({count})</span></h2>
          </div>
          <button className="close" aria-label="Close bag" onClick={() => setDrawerOpen(false)}>×</button>
        </div>
        <div className="cart-items">
          {lines.length === 0 && <div className="empty">Your bag is waiting for a good pair.</div>}
          {lines.map((l) => (
            <div className="cart-row" key={l.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.image} alt="" />
              <div>
                <h3>{l.name}</h3>
                <p>{l.color} · Qty {l.qty}</p>
                <p>{money(l.price * l.qty)}</p>
              </div>
              <button onClick={() => remove(l.id)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="cart-bottom">
          <div className="subtotal"><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <p>Free shipping on every order.</p>
          <Link
            className="button dark full"
            href="/checkout"
            aria-disabled={!lines.length}
            onClick={(e) => (lines.length ? setDrawerOpen(false) : e.preventDefault())}
          >
            Continue to checkout <span>↗</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
