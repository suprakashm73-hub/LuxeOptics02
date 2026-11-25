import { deleteProduct } from '@/app/actions/admin';
import { AdminTabs } from '@/components/admin-tabs';
import { ProductForm } from '@/components/admin-forms';
import { requireAdmin } from '@/lib/auth';
import { money } from '@/lib/format';
import { getProducts } from '@/lib/repo';

export default async function AdminProducts() {
  await requireAdmin();
  const products = await getProducts();
  return (
    <>
      <p className="eyebrow">STORE MANAGEMENT</p>
      <h1 className="panel-title">Products · {products.length}</h1>
      <AdminTabs />
      <ProductForm />
      <div className="admin-list">
        {products.map((p) => (
          <div className="admin-item" key={p.id}>
            <span>{p.name} · {money(p.price)}</span>
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={p.id} />
              <button>Delete</button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
