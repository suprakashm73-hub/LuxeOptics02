import 'server-only';
import { randomBytes } from 'node:crypto';
import { unstable_cache } from 'next/cache';
import { getDriver, type Row } from './db/driver';
import type { Order, OrderItem, Product } from './types';

/** Sheets allows ~60 reads/min, so public catalog reads are cached and busted on write. */
const CATALOG_TTL = 120;

// ---------- Products ----------

const toProduct = (r: Row): Product => ({
  id: r.id,
  name: r.name,
  type: r.type,
  price: Number(r.price) || 0,
  color: r.color,
  badge: r.badge,
  desc: r.desc,
  ageGroup: r.ageGroup || 'Adult',
  frameSize: r.frameSize || 'M (49–52 mm)',
  images: r.images.split('|').map((s) => s.trim()).filter(Boolean),
});

const isActive = (r: Row) => r.active.toUpperCase() !== 'FALSE';

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const rows = await (await getDriver()).list('Products');
    return rows.filter((r) => r.id && isActive(r)).map(toProduct);
  },
  ['products'],
  { tags: ['products'], revalidate: CATALOG_TTL },
);

export async function getProduct(id: string) {
  return (await getProducts()).find((p) => p.id === id);
}

export async function createProduct(p: Omit<Product, 'id'>) {
  const id = 'p' + randomBytes(5).toString('hex');
  await (await getDriver()).append('Products', {
    id,
    name: p.name,
    type: p.type,
    price: String(p.price),
    color: p.color,
    badge: p.badge,
    desc: p.desc,
    ageGroup: p.ageGroup,
    frameSize: p.frameSize,
    images: p.images.join('|'),
    active: 'TRUE',
    createdAt: new Date().toISOString(),
  });
  return id;
}

/** Soft delete: keeps the row so past orders stay traceable. */
export async function archiveProduct(id: string) {
  return (await getDriver()).update('Products', 'id', id, { active: 'FALSE' });
}

// ---------- Settings ----------

export const getHelpline = unstable_cache(
  async () => {
    const rows = await (await getDriver()).list('Settings');
    return rows.find((r) => r.key === 'helpline')?.value || '';
  },
  ['helpline'],
  { tags: ['settings'], revalidate: CATALOG_TTL },
);

export async function setHelpline(value: string) {
  const d = await getDriver();
  if (!(await d.update('Settings', 'key', 'helpline', { value }))) await d.append('Settings', { key: 'helpline', value });
}

// ---------- Ratings ----------

export type RatingStats = Record<string, { avg: number; count: number }>;

export const getRatingStats = unstable_cache(
  async (): Promise<RatingStats> => {
    const rows = await (await getDriver()).list('Ratings');
    const acc: Record<string, { sum: number; count: number }> = {};
    for (const r of rows) {
      const a = (acc[r.productId] ??= { sum: 0, count: 0 });
      a.sum += Number(r.stars) || 0;
      a.count++;
    }
    return Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, { avg: v.sum / v.count, count: v.count }]));
  },
  ['ratings'],
  { tags: ['ratings'], revalidate: CATALOG_TTL },
);

/** One rating per customer per product; re-rating overwrites. */
export async function upsertRating(productId: string, mobile: string, stars: number) {
  const d = await getDriver();
  const key = `${productId}:${mobile}`;
  const patch = { stars: String(stars), createdAt: new Date().toISOString() };
  if (!(await d.update('Ratings', 'key', key, patch))) await d.append('Ratings', { key, productId, mobile, ...patch });
}

// ---------- Users ----------

export async function findUser(mobile: string) {
  return (await (await getDriver()).list('Users')).find((u) => u.mobile === mobile);
}

export async function createUser(mobile: string, salt: string, hash: string) {
  await (await getDriver()).append('Users', { mobile, salt, hash, createdAt: new Date().toISOString() });
}

// ---------- Orders ----------

const toOrder = (r: Row): Order => ({
  id: r.id,
  accountMobile: r.accountMobile,
  name: r.name,
  phone: r.phone,
  pincode: r.pincode,
  address: r.address,
  payment: r.payment === 'UPI' ? 'UPI' : 'COD',
  paymentStatus: r.paymentStatus,
  status: r.status || 'Order received',
  statusMessage: r.statusMessage,
  items: safeItems(r.items),
  total: Number(r.total) || 0,
  createdAt: r.createdAt,
  service: r.serviceType
    ? { type: r.serviceType, message: r.serviceMessage, status: r.serviceStatus, reply: r.serviceReply }
    : undefined,
});

function safeItems(s: string): OrderItem[] {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}

export async function listOrders(filter?: { accountMobile: string }): Promise<Order[]> {
  const rows = await (await getDriver()).list('Orders');
  return rows
    .filter((r) => r.id && (!filter || r.accountMobile === filter.accountMobile))
    .map(toOrder)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createOrder(o: Omit<Order, 'id' | 'createdAt' | 'status' | 'statusMessage' | 'service'>) {
  const order: Order = {
    ...o,
    id: 'LX' + Date.now().toString(36).toUpperCase() + randomBytes(2).toString('hex').toUpperCase(),
    status: 'Order received',
    statusMessage: '',
    createdAt: new Date().toISOString(),
  };
  await (await getDriver()).append('Orders', {
    ...order,
    items: JSON.stringify(order.items),
    total: String(order.total),
  } as unknown as Row);
  return order;
}

export async function updateOrderStatus(id: string, status: string, message: string) {
  return (await getDriver()).update('Orders', 'id', id, { status, statusMessage: message });
}

export async function requestService(id: string, mobile: string, type: string, message: string) {
  const order = (await listOrders({ accountMobile: mobile })).find((o) => o.id === id);
  if (!order) return 'not-found' as const;
  if (order.service) return 'exists' as const;
  await (await getDriver()).update('Orders', 'id', id, {
    serviceType: type,
    serviceMessage: message,
    serviceStatus: 'Requested',
    serviceReply: '',
  });
  return 'ok' as const;
}

export async function answerService(id: string, status: string, reply: string) {
  return (await getDriver()).update('Orders', 'id', id, { serviceStatus: status, serviceReply: reply });
}
