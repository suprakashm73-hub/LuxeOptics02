'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminLogout } from '@/app/actions/admin';

const TABS = [
  ['/admin/orders', 'Orders'],
  ['/admin/products', 'Products'],
  ['/admin/settings', 'Helpline'],
] as const;

export function AdminTabs() {
  const path = usePathname();
  return (
    <div className="admin-tabs">
      {TABS.map(([href, label]) => (
        <Link key={href} href={href} className={path === href ? 'active' : ''}>{label}</Link>
      ))}
      <form action={adminLogout}><button>Log out</button></form>
    </div>
  );
}
