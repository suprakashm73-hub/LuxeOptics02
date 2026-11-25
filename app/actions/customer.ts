'use server';

import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { endSession, getSession, hashPassword, safeNext, startSession, throttle, verifyPassword } from '@/lib/auth';
import { createOrder, createUser, findUser, getProducts, requestService, upsertRating } from '@/lib/repo';
import { authSchema, checkoutSchema, firstError, ratingSchema, serviceRequestSchema } from '@/lib/validation';

export type FormState = { error?: string; ok?: string } | undefined;

export async function authenticate(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = authSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const gate = await throttle('auth');
  if (gate.blocked) return { error: 'Too many attempts. Please try again in a few minutes.' };

  const { mode, mobile, password } = parsed.data;
  const existing = await findUser(mobile);

  if (mode === 'signup') {
    if (existing) return { error: 'An account already exists for this mobile. Choose Sign in.' };
    const { salt, hash } = await hashPassword(password);
    await createUser(mobile, salt, hash);
  } else if (!existing || !(await verifyPassword(password, existing.salt, existing.hash))) {
    // Same message for unknown mobile and wrong password, so account existence isn't revealed.
    gate.fail();
    return { error: 'Mobile number or password is incorrect.' };
  }

  gate.ok();
  await startSession({ role: 'customer', mobile });
  redirect(safeNext(fd.get('next')));
}

export async function logout() {
  await endSession();
  redirect('/');
}

export async function placeOrder(input: unknown): Promise<{ error: string } | { orderId: string; total: number }> {
  const session = await getSession();
  if (session?.role !== 'customer') return { error: 'Please sign in before checkout.' };
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const b = parsed.data;

  // Prices always come from the catalog, never from the browser.
  const catalog = new Map((await getProducts()).map((p) => [p.id, p]));
  const items = b.items.flatMap((i) => {
    const p = catalog.get(i.id);
    return p ? [{ id: p.id, name: p.name, price: p.price, qty: i.qty }] : [];
  });
  if (!items.length) return { error: 'Those frames are no longer available.' };

  const order = await createOrder({
    accountMobile: session.mobile,
    name: b.name,
    phone: b.mobile,
    pincode: b.pincode,
    address: `${b.address}, ${b.city}, ${b.state} - ${b.pincode}`,
    payment: b.payment,
    paymentStatus: b.payment === 'COD' ? 'Pay on delivery' : 'Awaiting payment - store will contact you',
    items,
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
  });
  return { orderId: order.id, total: order.total };
}

export async function submitRating(input: { productId: string; stars: number }): Promise<FormState> {
  const session = await getSession();
  if (session?.role !== 'customer') return { error: 'Sign in to rate this frame.' };
  const parsed = ratingSchema.safeParse(input);
  if (!parsed.success) return { error: 'Select a rating from 1 to 5.' };
  await upsertRating(parsed.data.productId, session.mobile, parsed.data.stars);
  updateTag('ratings');
  return { ok: 'Thanks for rating!' };
}

export async function submitServiceRequest(_: FormState, fd: FormData): Promise<FormState> {
  const session = await getSession();
  if (session?.role !== 'customer') return { error: 'Sign in to continue.' };
  const parsed = serviceRequestSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const r = await requestService(parsed.data.id, session.mobile, parsed.data.type, parsed.data.message);
  if (r === 'not-found') return { error: 'Order not found.' };
  if (r === 'exists') return { error: 'A request already exists for this order.' };
  redirect('/account');
}
