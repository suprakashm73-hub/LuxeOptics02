import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { AppProvider } from '@/components/app-provider';
import { Header } from '@/components/header';
import { getSession } from '@/lib/auth';
import './globals.css';

const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Luxe Optics — Find your point of view', template: '%s · Luxe Optics' },
  description: 'Thoughtful optical frames and sunglasses, designed to go wherever you do.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f4ee' },
    { media: '(prefers-color-scheme: dark)', color: '#12110f' },
  ],
};

// Runs before first paint so there is no light/dark flash. Saved choice wins, otherwise the OS setting.
const themeScript = `(function(){try{var t=localStorage.getItem('luxe_theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en" className={`${dm.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProvider>
          <div className="announcement">Complimentary shipping on every order <span>✦</span> 7-day easy returns</div>
          <Header signedIn={session?.role === 'customer'} />
          {children}
          <footer>
            <div className="foot-top">
              <div>
                <Link className="brand" href="/" aria-label="Luxe Optics home">
                  <Image className="logo" src="/logo.png" alt="Luxe Optics" width={240} height={120} />
                </Link>
                <p className="foot-tag">Thoughtful frames, beautifully made. See yourself clearly.</p>
              </div>
              <div className="foot-col">
                <h4>Shop</h4>
                <Link href="/#shop">All frames</Link>
                <Link href="/?type=Optical#shop">Optical</Link>
                <Link href="/?type=Sunglasses#shop">Sunglasses</Link>
              </div>
              <div className="foot-col">
                <h4>Help</h4>
                <Link href="/#fitFinder">Find your fit</Link>
                <Link href="/account">My orders</Link>
                <Link href="/#about">Our story</Link>
              </div>
              <div className="foot-col">
                <h4>Promise</h4>
                <span className="muted">UV400 protection<br />Free shipping<br />7-day easy returns</span>
              </div>
            </div>
            <div className="foot-bottom">
              <span>© {new Date().getFullYear()} Luxe Optics</span>
              <Link className="admin-link" href="/admin">Admin</Link>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
