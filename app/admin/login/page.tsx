import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin-forms';
import { getSession } from '@/lib/auth';

export default async function AdminLogin() {
  if ((await getSession())?.role === 'admin') redirect('/admin/orders');
  return (
    <div className="panel" style={{ maxWidth: 420, margin: '0 auto' }}>
      <p className="eyebrow">LUXE OPTICS · ADMIN</p>
      <h1 className="panel-title">Admin portal</h1>
      <p className="muted">Sign in to manage your store.</p>
      <AdminLoginForm />
    </div>
  );
}
