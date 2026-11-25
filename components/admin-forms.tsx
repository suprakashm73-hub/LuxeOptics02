'use client';

import { useEffect, useRef } from 'react';
import { useFormAction } from './use-form-action';
import { addProduct, adminLogin, answerRequest, saveHelpline, updateOrder } from '@/app/actions/admin';
import { AGE_GROUPS, FRAME_SIZES, ORDER_STATUSES, PRODUCT_TYPES, REQUEST_STATUSES } from '@/lib/types';
import type { Order } from '@/lib/types';

const Msg = ({ s }: { s?: { error?: string; ok?: string } }) => (
  <>
    {s?.error && <p className="auth-error">{s.error}</p>}
    {s?.ok && <p className="ok-msg">{s.ok}</p>}
  </>
);

export function AdminLoginForm() {
  const { state: s, pending, onSubmit } = useFormAction(adminLogin);
  return (
    <form onSubmit={onSubmit} className="admin-form">
      <label>Password<input name="password" type="password" required autoComplete="current-password" placeholder="Admin password" /></label>
      <Msg s={s} />
      <button className="button dark full" disabled={pending}>{pending ? 'Checking…' : 'Sign in'} <span>↗</span></button>
    </form>
  );
}

export function ProductForm() {
  const { state: s, pending, onSubmit } = useFormAction(addProduct);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (s?.ok) ref.current?.reset();
  }, [s]);
  return (
    <form ref={ref} onSubmit={onSubmit} className="admin-form">
      <label>Product name<input name="name" required placeholder="e.g. The Meadow" /></label>
      <label>Category<select name="type">{PRODUCT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Price in ₹<input name="price" type="number" required min={1} step={1} /></label>
      <label>Color<input name="color" required /></label>
      <label>Badge (optional)<input name="badge" maxLength={20} placeholder="NEW IN" /></label>
      <label>Age group<select name="ageGroup" defaultValue="Adult">{AGE_GROUPS.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Frame size<select name="frameSize" defaultValue="M (49–52 mm)">{FRAME_SIZES.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>
        Image URLs (one per line, up to 5)
        <textarea name="images" required placeholder={'https://...\nhttps://...'} />
        <small>Host photos anywhere public (Cloudinary, Imgur, Google Drive “anyone with link” direct URL, your CDN). The first is the cover image.</small>
      </label>
      <label>Description<textarea name="desc" maxLength={600} /></label>
      <Msg s={s} />
      <button className="button dark" disabled={pending}>{pending ? 'Adding…' : 'Add product'} <span>↗</span></button>
    </form>
  );
}

export function OrderUpdateForm({ order }: { order: Order }) {
  const { state: s, pending, onSubmit } = useFormAction(updateOrder);
  return (
    <form onSubmit={onSubmit} className="admin-form order-update">
      <input type="hidden" name="id" value={order.id} />
      <label>Delivery status
        <select name="status" defaultValue={order.status}>{ORDER_STATUSES.map((t) => <option key={t}>{t}</option>)}</select>
      </label>
      <label>Message for customer
        <textarea name="message" maxLength={500} defaultValue={order.statusMessage} placeholder="Optional delivery update..." />
      </label>
      <Msg s={s} />
      <button className="button dark" disabled={pending}>{pending ? 'Saving…' : 'Save delivery update'} <span>↗</span></button>
    </form>
  );
}

export function RequestAnswerForm({ order }: { order: Order }) {
  const { state: s, pending, onSubmit } = useFormAction(answerRequest);
  return (
    <form onSubmit={onSubmit} className="admin-form service-admin-response">
      <input type="hidden" name="id" value={order.id} />
      <label>Request decision
        <select name="status" defaultValue={order.service?.status}>{REQUEST_STATUSES.map((t) => <option key={t}>{t}</option>)}</select>
      </label>
      <label>Reply to customer
        <textarea name="reply" maxLength={500} defaultValue={order.service?.reply} />
      </label>
      <Msg s={s} />
      <button className="button dark" disabled={pending}>{pending ? 'Saving…' : 'Save reply'} <span>↗</span></button>
    </form>
  );
}

export function HelplineForm({ current }: { current: string }) {
  const { state: s, pending, onSubmit } = useFormAction(saveHelpline);
  return (
    <form onSubmit={onSubmit} className="admin-form">
      <label>Customer helpline number<input name="phone" defaultValue={current} required /></label>
      <Msg s={s} />
      <button className="button dark" disabled={pending}>{pending ? 'Saving…' : 'Save helpline'} <span>↗</span></button>
    </form>
  );
}
