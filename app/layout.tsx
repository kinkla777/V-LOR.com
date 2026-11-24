import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VΛLOR — PUBG Esports',
  description: 'VΛLOR PUBG Esports — compete without limits.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
