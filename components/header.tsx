'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useApp } from './app-provider';
import { CartDrawer } from './cart-drawer';
import { ThemeToggle } from './theme-toggle';

export function Header({ signedIn }: { signedIn: boolean }) {
  const { count, setDrawerOpen } = useApp();
  const [menu, setMenu] = useState(false);
  const close = () => setMenu(false);

  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Luxe Optics home">
          <Image className="logo" src="/logo.png" alt="Luxe Optics" width={290} height={145} priority />
        </Link>
        <nav className={menu ? 'show' : ''}>
          <Link href="/#shop" onClick={close}>Shop all</Link>
          <Link href="/?type=Sunglasses#shop" onClick={close}>Sun</Link>
          <Link href="/?type=Optical#shop" onClick={close}>Optical</Link>
          <Link href="/#about" onClick={close}>Our story</Link>
        </nav>
        <div className="header-actions">
          <Link className="orders-btn" href="/account">{signedIn ? 'My orders' : 'Sign in'}</Link>
          <ThemeToggle />
          <button className="bag-btn" onClick={() => setDrawerOpen(true)}>
            Bag <span>{count}</span>
          </button>
          <button className="menu-btn" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>☰</button>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
