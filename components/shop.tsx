'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { money } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useApp } from './app-provider';

type AgeGroup = 'All' | 'Kids' | 'Teen' | 'Adult';

function ageToFit(age: number) {
  const group: AgeGroup = age <= 12 ? 'Kids' : age <= 17 ? 'Teen' : 'Adult';
  const size = age <= 3 ? 'XS (40–44 mm)' : age <= 12 ? 'S (45–48 mm)' : age <= 17 ? 'S/M (45–52 mm)' : 'M/L (49–56 mm)';
  const range = group === 'Kids' ? 'Kids (0–12)' : group === 'Teen' ? 'Teen (13–17)' : 'Adult (18+)';
  return { group, size, range };
}

export function Shop({ products, initialType }: { products: Product[]; initialType: string }) {
  const { add } = useApp();
  const [type, setType] = useState(initialType);
  const [query, setQuery] = useState('');
  const [age, setAge] = useState('');
  const [group, setGroup] = useState<AgeGroup>('All');
  const [ageMsg, setAgeMsg] = useState('Available age groups: Kids, Teen, Adult, and All ages.');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (type === 'All' || p.type === type) &&
        (group === 'All' || p.ageGroup === group || p.ageGroup === 'All ages') &&
        `${p.name} ${p.type} ${p.color}`.toLowerCase().includes(q),
    );
  }, [products, type, query, group]);

  function findFit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(age);
    if (!Number.isInteger(n) || n < 0 || n > 120) return setAgeMsg('Enter an age from 0 to 120.');
    const fit = ageToFit(n);
    setGroup(fit.group);
    setType('All');
    const matches = products.filter((p) => p.ageGroup === fit.group || p.ageGroup === 'All ages').length;
    setAgeMsg(
      matches
        ? `Showing ${matches} ${fit.range} frame${matches === 1 ? '' : 's'}. Starting fit suggestion: ${fit.size}. Check the exact size on each frame.`
        : `No products are currently tagged for ${fit.range}. Ask the store for help or try another age.`,
    );
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  }

  function clearAge() {
    setGroup('All');
    setAge('');
    setAgeMsg('Available age groups: Kids, Teen, Adult, and All ages.');
  }

  const filters = ['All', 'Optical', 'Sunglasses'];

  return (
    <>
      <section className="fit-finder" id="fitFinder">
        <div className="fit-copy">
          <p className="eyebrow">A COMFORTABLE FIT STARTS HERE</p>
          <h2>Find a frame by <em>age.</em></h2>
          <p>Choose an age to see the suggested frame group and matching products. Age gives a starting point; check each frame size and fit for the best match.</p>
        </div>
        <form className="age-form" onSubmit={findFit}>
          <label htmlFor="ageInput">Age</label>
          <div className="age-controls">
            <input id="ageInput" type="number" min={0} max={120} required placeholder="Enter age" value={age} onChange={(e) => setAge(e.target.value)} />
            <button className="button dark">Find my fit <span>↗</span></button>
          </div>
          <button type="button" className="text-link" onClick={clearAge}>Show all frames</button>
          <p className="age-result" aria-live="polite">{ageMsg}</p>
        </form>
      </section>

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE COLLECTION</p>
            <h2>Find your <em>frame.</em></h2>
          </div>
        </div>
        <div className="shop-controls">
          <div className="filters">
            {filters.map((f) => (
              <button key={f} className={`filter${type === f ? ' active' : ''}`} onClick={() => setType(f)}>
                {f === 'All' ? 'All frames' : f}
                {f === 'All' && <span>{String(products.length).padStart(2, '0')}</span>}
              </button>
            ))}
          </div>
          <label className="search">
            <span aria-hidden>⌕</span>
            <input aria-label="Search frames" placeholder="Find your pair..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>

        <div className="product-grid">
          {visible.map((p, i) => (
            <article className="product-card" key={p.id} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
              <div className="product-photo">
                <Link href={`/product/${p.id}`} aria-label={`View ${p.name}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt={`${p.name} eyewear`} loading="lazy" />
                </Link>
                {p.badge && <span className="badge">{p.badge}</span>}
                <button className="quick-add" aria-label={`Add ${p.name} to bag`} onClick={() => add(p)}>+</button>
              </div>
              <Link href={`/product/${p.id}`} className="product-info">
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.type} · {p.color}</p>
                  <p className="fit-tag">{p.ageGroup} · {p.frameSize}</p>
                </div>
                <span className="price">{money(p.price)}</span>
              </Link>
            </article>
          ))}
          {!visible.length && (
            <p className="empty" style={{ gridColumn: '1/-1' }}>
              {group !== 'All' ? `No frames tagged for ${group} yet. Try another age or contact us for help.` : 'No frames found. Try another search.'}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
