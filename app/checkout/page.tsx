import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/customer-forms';
import { requireCustomer } from '@/lib/auth';

export const metadata: Metadata = { title: 'Checkout' };

export default async function Checkout() {
  const session = await requireCustomer('/checkout');
  return (
    <main className="page-narrow">
      <CheckoutForm defaultMobile={session.mobile} />
    </main>
  );
}
