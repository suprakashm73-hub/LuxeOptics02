'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { adminPasswordMatches, endSession, getSession, startSession, throttle } from '@/lib/auth';
import { answerService, archiveProduct, createProduct, setHelpline, updateOrderStatus } from '@/lib/repo';
import { firstError, helplineSchema, orderUpdateSchema, productSchema, serviceAnswerSchema } from '@/lib/validation';
import type { FormState } from './customer';

async function assertAdmin() {
  if ((await getSession())?.role !== 'admin') throw new Error('Admin sign-in required.');
}

export async function adminLogin(_: FormState, fd: FormData): Promise<FormState> {
  const gate = await throttle('admin', 5);
  if (gate.blocked) return { error: 'Too many failed attempts. Try again in 15 minutes.' };
  if (!adminPasswordMatches(String(fd.get('password') ?? ''))) {
    gate.fail();
    return { error: 'Incorrect admin password.' };
  }
  gate.ok();
  await startSession({ role: 'admin' });
  redirect('/admin/orders');
}

export async function adminLogout() {
  await endSession();
  redirect('/admin/login');
}

export async function addProduct(_: FormState, fd: FormData): Promise<FormState> {
  await assertAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  await createProduct({ ...parsed.data, badge: parsed.data.badge || 'NEW IN', desc: parsed.data.desc || 'A beautiful new frame.' });
  updateTag('products');
  revalidatePath('/admin/products');
  return { ok: 'Product added.' };
}

export async function deleteProduct(fd: FormData) {
  await assertAdmin();
  await archiveProduct(String(fd.get('id')));
  updateTag('products');
  revalidatePath('/admin/products');
}

export async function updateOrder(_: FormState, fd: FormData): Promise<FormState> {
  await assertAdmin();
  const parsed = orderUpdateSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (!(await updateOrderStatus(parsed.data.id, parsed.data.status, parsed.data.message))) return { error: 'Order not found.' };
  revalidatePath('/admin/orders');
  return { ok: 'Saved.' };
}

export async function answerRequest(_: FormState, fd: FormData): Promise<FormState> {
  await assertAdmin();
  const parsed = serviceAnswerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (!(await answerService(parsed.data.id, parsed.data.status, parsed.data.reply))) return { error: 'Order not found.' };
  revalidatePath('/admin/orders');
  return { ok: 'Saved.' };
}

export async function saveHelpline(_: FormState, fd: FormData): Promise<FormState> {
  await assertAdmin();
  const parsed = helplineSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  await setHelpline(parsed.data.phone);
  updateTag('settings');
  return { ok: 'Helpline updated.' };
}
