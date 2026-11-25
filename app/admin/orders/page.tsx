import { AdminTabs } from '@/components/admin-tabs';
import { OrderUpdateForm, RequestAnswerForm } from '@/components/admin-forms';
import { requireAdmin } from '@/lib/auth';
import { formatDate, money } from '@/lib/format';
import { listOrders } from '@/lib/repo';

export default async function AdminOrders() {
  await requireAdmin();
  const orders = await listOrders();
  return (
    <>
      <p className="eyebrow">STORE MANAGEMENT</p>
      <h1 className="panel-title">Orders · {orders.length}</h1>
      <AdminTabs />
      {!orders.length && <p className="muted">No orders yet.</p>}
      {orders.map((o) => (
        <div className="order-card" key={o.id}>
          <b>{o.id} · {money(o.total)} · {o.payment}</b>
          <p>{o.paymentStatus}</p>
          <p>{o.name} · {o.phone} · PIN {o.pincode} · {formatDate(o.createdAt)}</p>
          <p>{o.address}</p>
          <p>{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</p>
          {o.service && (
            <div className="service-update">
              <b>Customer {o.service.type} request · {o.service.status}</b>
              <p>{o.service.message}</p>
              <RequestAnswerForm order={o} />
            </div>
          )}
          <OrderUpdateForm order={o} />
        </div>
      ))}
    </>
  );
}
