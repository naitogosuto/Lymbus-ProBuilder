import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Limbus Pro Builder — Limbus Company Deck & Team Builder',
  description: 'Build the best Limbus Company team comp. Real-time keyword deck analysis, sin resonance, and identity database.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="main-content">
          <Header />
          <div className="app-container" style={{ flex: 1 }}>
            <Sidebar />
            <main style={{ flex: 1, overflowY: 'auto' }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
