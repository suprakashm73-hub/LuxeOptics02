import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-narrow">
      <p className="eyebrow">404</p>
      <h1 className="panel-title">We couldn’t find that page.</h1>
      <Link className="button dark" href="/">Back to the store <span>↗</span></Link>
    </main>
  );
}
