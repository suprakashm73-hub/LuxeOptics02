import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToBag, Gallery, RatingForm } from '@/components/product-actions';
import { getSession } from '@/lib/auth';
import { money } from '@/lib/format';
import { getProduct, getRatingStats } from '@/lib/repo';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).id);
  return p ? { title: p.name, description: p.desc } : {};
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [product, stats, session] = await Promise.all([getProduct(id), getRatingStats(), getSession()]);
  if (!product) notFound();

  const r = stats[product.id];
  const rounded = r ? Math.round(r.avg) : 0;

  return (
    <main className="page-narrow">
      <Link className="text-link" href="/#shop">← All frames</Link>
      <div className="detail-layout" style={{ marginTop: 28 }}>
        <Gallery images={product.images} name={product.name} />
        <div className="detail-copy">
          <p className="eyebrow">{product.type.toUpperCase()} · {product.color.toUpperCase()}</p>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-price">{money(product.price)}</div>
          <div className="detail-rating" aria-label={r ? `${r.avg.toFixed(1)} out of 5` : 'No ratings yet'}>
            {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)} <span>({r?.count ?? 0} {r?.count === 1 ? 'rating' : 'ratings'})</span>
          </div>
          <p>{product.desc}</p>
          <p className="fit-details">Suggested age group: {product.ageGroup} · Frame size: {product.frameSize}</p>
          <p>✓ &nbsp; UV400 protection &nbsp; · &nbsp; Lightweight fit<br />✓ &nbsp; Complimentary case &amp; cleaning cloth</p>
          <AddToBag product={product} />
          <RatingForm productId={product.id} signedIn={session?.role === 'customer'} />
        </div>
      </div>
    </main>
  );
}
