import Link from 'next/link';
import { Shop } from '@/components/shop';
import { getHelpline, getProducts } from '@/lib/repo';

export default async function Home({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const [products, helpline] = await Promise.all([getProducts(), getHelpline()]);
  const initialType = type === 'Optical' || type === 'Sunglasses' ? type : 'All';

  return (
    <main id="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">EYEWEAR FOR EVERY DAY</p>
          <h1>See the world<br />in a <em>new light.</em></h1>
          <p>Thoughtful frames. Beautifully made. Designed to go wherever you do.</p>
          <Link className="button dark" href="#shop">Find your frames <span>↗</span></Link>
          <div className="hero-note"><span>✳</span> Good vision. Better perspective.</div>
        </div>
        <div className="hero-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1400&q=85" alt="Sunglasses resting in warm sunlight" />
          <div className="art-sticker">MADE TO<br />BE YOURS <b>✳</b></div>
          <span className="art-caption">THE EVERYDAY EDIT · {new Date().getFullYear()}</span>
        </div>
      </section>

      <section className="trust-row">
        <div>✧ &nbsp;Thoughtful design</div>
        <div>◉ &nbsp;UV400 protection</div>
        <div>♧ &nbsp;Free shipping</div>
        <div>↺ &nbsp;Easy 7-day returns</div>
      </section>

      <Shop products={products} initialType={initialType} />

      <section className="manifesto" id="about">
        <div className="manifesto-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1000&q=85" alt="A collection of eyeglasses" />
        </div>
        <div className="manifesto-copy">
          <p className="eyebrow">A CLEARER KIND OF CLASSIC</p>
          <h2>Good frames.<br /><em>Good days.</em></h2>
          <p>We believe the right pair just feels like you. Thoughtfully designed eyewear, made for real life and all the little moments in between.</p>
        </div>
      </section>

      <section className="help-strip">
        <div>
          <p className="eyebrow">HERE WHEN YOU NEED US</p>
          <h2>Questions? <em>We’re all ears.</em></h2>
          <p>Need help choosing your fit? Our team can help.</p>
        </div>
        {helpline && (
          <a className="button dark" href={`tel:${helpline.replace(/[^+\d]/g, '')}`}>
            Call {helpline} <span>↗</span>
          </a>
        )}
      </section>
    </main>
  );
}
