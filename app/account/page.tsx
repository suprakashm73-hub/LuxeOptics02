import type { Metadata } from 'next';
import { logout } from '@/app/actions/customer';
import { AuthForm, ServiceRequestForm } from '@/components/customer-forms';
import { getSession, safeNext } from '@/lib/auth';
import { formatDate, money } from '@/lib/format';
import { getHelpline, listOrders } from '@/lib/repo';

export const metadata: Metadata = { title: 'My account' };

export default async function Account({ searchParams }: { searchParams: Promise<{ next?: string; placed?: string }> }) {
  const { next, placed } = await searchParams;
  const session = await getSession();

  if (session?.role !== 'customer')
    return (
      <main className="page-narrow">
        <AuthForm next={safeNext(next)} />
      </main>
    );

  const [orders, helpline] = await Promise.all([listOrders({ accountMobile: session.mobile }), getHelpline()]);

  return (
    <main className="page-narrow">
      {placed && (
        <div className="notice">Order <b>{placed}</b> placed. We&apos;ll update its status here as it moves.</div>
      )}
      <div className="row-between">
        <div>
          <p className="eyebrow">SIGNED IN AS {session.mobile}</p>
          <h1 className="panel-title">My orders · {orders.length}</h1>
        </div>
        <form action={logout}><button className="text-link">Sign out</button></form>
      </div>
      {helpline && (
        <p className="muted">Need help with an order? <a href={`tel:${helpline.replace(/[^+\d]/g, '')}`}><b>Call {helpline}</b></a></p>
      )}

      {!orders.length && <p className="muted">You have not placed any orders yet.</p>}
      {orders.map((o) => (
        <article className="my-order" key={o.id}>
          <b>{o.id} · {money(o.total)}</b>
          <p className="order-status">{o.status}</p>
          {o.statusMessage && <p>{o.statusMessage}</p>}
          <p>{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</p>
          <small>{formatDate(o.createdAt)} · {o.payment} · {o.address}</small>
          {o.service ? (
            <div className="service-update">
              <b>{o.service.type} request: {o.service.status}</b>
              <p>{o.service.reply || o.service.message}</p>
            </div>
          ) : (
            <ServiceRequestForm orderId={o.id} />
          )}
        </article>
      ))}
    </main>
  );
}
