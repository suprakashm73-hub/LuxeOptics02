'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useFormAction } from './use-form-action';
import { authenticate, placeOrder, submitServiceRequest } from '@/app/actions/customer';
import { money } from '@/lib/format';
import { useApp } from './app-provider';

export function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { state: state, pending, onSubmit } = useFormAction(authenticate);

  return (
    <div className="panel">
      <p className="eyebrow">WELCOME TO LUXE OPTICS</p>
      <h1 className="panel-title">Your account</h1>
      <div className="auth-switch">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
        <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button>
      </div>
      <p className="muted">
        {mode === 'signup' ? 'Create an account with your mobile number and a new password.' : 'Sign in with your mobile number and password.'}
      </p>
      <form onSubmit={onSubmit} className="stack">
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="next" value={next} />
        <label>Mobile number<input name="mobile" required inputMode="tel" autoComplete="tel" placeholder="98765 43210" /></label>
        <label>
          Password
          <input name="password" required type="password" minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder="At least 6 characters" />
        </label>
        <p className="auth-error" aria-live="polite">{state?.error}</p>
        <button className="button dark full" disabled={pending}>
          {pending ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'} <span>↗</span>
        </button>
      </form>
    </div>
  );
}

export function ServiceRequestForm({ orderId }: { orderId: string }) {
  const { state: state, pending, onSubmit } = useFormAction(submitServiceRequest);
  return (
    <form onSubmit={onSubmit} className="service-request">
      <input type="hidden" name="id" value={orderId} />
      <label>Return or exchange
        <select name="type"><option>Return</option><option>Exchange</option></select>
      </label>
      <label>Tell us why
        <textarea name="message" required minLength={5} maxLength={500} placeholder="Please describe what you need" />
      </label>
      <p className="auth-error">{state?.error}</p>
      <button className="text-link" disabled={pending}>{pending ? 'Sending…' : 'Request return / exchange'}</button>
    </form>
  );
}

export function CheckoutForm({ defaultMobile }: { defaultMobile: string }) {
  const { lines, subtotal, clear, toast } = useApp();
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  if (!lines.length)
    return (
      <div className="panel">
        <h1 className="panel-title">Your bag is empty</h1>
        <p className="muted">Add a frame to your bag to check out.</p>
        <a className="button dark" href="/#shop">Browse frames <span>↗</span></a>
      </div>
    );

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError('');
    start(async () => {
      const res = await placeOrder({
        name: f.get('name'),
        mobile: f.get('mobile'),
        pincode: f.get('pincode'),
        address: f.get('address'),
        city: f.get('city'),
        state: f.get('state'),
        payment: f.get('payment'),
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
      });
      if ('error' in res) return setError(res.error);
      clear();
      toast(`Order ${res.orderId} placed!`);
      router.push('/account?placed=' + res.orderId);
    });
  }

  return (
    <div className="panel">
      <p className="eyebrow">DELIVERY DETAILS</p>
      <h1 className="panel-title">Where should we send it?</h1>
      <p className="muted">Enter your contact and full address to place the order.</p>
      <form className="checkout-form" onSubmit={submit}>
        <label>Full name<input name="name" required autoComplete="name" placeholder="Name for delivery" /></label>
        <div className="checkout-pair">
          <label>Mobile number<input name="mobile" required inputMode="tel" autoComplete="tel" defaultValue={defaultMobile} /></label>
          <label>PIN code<input name="pincode" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6-digit PIN" /></label>
        </div>
        <label>Address<input name="address" required autoComplete="street-address" placeholder="House, street, area" /></label>
        <div className="checkout-pair">
          <label>City<input name="city" required autoComplete="address-level2" /></label>
          <label>State<input name="state" required autoComplete="address-level1" /></label>
        </div>
        <fieldset className="payment-options">
          <legend>Payment method</legend>
          <label><input type="radio" name="payment" value="COD" defaultChecked /> Cash on delivery</label>
          <label><input type="radio" name="payment" value="UPI" /> UPI / online payment</label>
          <p className="fineprint">Online payments are recorded as selected; the store will contact you to complete payment.</p>
        </fieldset>
        <p className="auth-error" aria-live="polite">{error}</p>
        <button className="button dark full" disabled={pending}>
          {pending ? 'Placing order…' : <>Place order · {money(subtotal)}</>}
        </button>
        <p className="fineprint">Final total is confirmed by the store from current prices.</p>
      </form>
    </div>
  );
}
