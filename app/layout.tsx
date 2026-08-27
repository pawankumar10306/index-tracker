import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jbm',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'AlphaTrack — Indian Index Monitor',
  description: 'Monitor NIFTY 50, Next 50, and Midcap 50 for monthly drawdown entry signals',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${jetbrainsMono.variable}`}>
      <body
        className="antialiased min-h-screen"
        style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}
      >
        {children}
      </body>
    </html>
  );
}
