'use client';

import { useState, useTransition } from 'react';
import { submitRating } from '@/app/actions/customer';
import { money } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useApp } from './app-provider';

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="detail-main" src={images[i]} alt={name} />
      <div className="thumbs">
        {images.map((src, n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} className={n === i ? 'selected' : ''} src={src} alt={`${name} view ${n + 1}`} onClick={() => setI(n)} />
        ))}
      </div>
    </div>
  );
}

export function AddToBag({ product }: { product: Product }) {
  const { add } = useApp();
  return (
    <button className="button dark full" onClick={() => add(product)}>
      Add to bag — {money(product.price)} <span>↗</span>
    </button>
  );
}

export function RatingForm({ productId, signedIn }: { productId: string; signedIn: boolean }) {
  const { toast } = useApp();
  const [stars, setStars] = useState(5);
  const [pending, start] = useTransition();

  if (!signedIn)
    return (
      <div className="rating-form">
        <b>Enjoying your pair?</b>
        <p><a href={`/account?next=/product/${productId}`}>Sign in</a> to leave a rating.</p>
      </div>
    );

  return (
    <form
      className="rating-form"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await submitRating({ productId, stars });
          toast(r?.error ?? r?.ok ?? 'Saved');
        });
      }}
    >
      <b>Enjoying your pair?</b>
      <p>Leave a rating for this frame</p>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={n <= stars ? 'on' : ''} onClick={() => setStars(n)}>★</button>
        ))}
      </div>
      <button className="text-link" disabled={pending}>{pending ? 'Saving…' : 'Submit rating'}</button>
    </form>
  );
}
