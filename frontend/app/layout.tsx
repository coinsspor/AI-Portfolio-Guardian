export const metadata = { title: 'AI Portfolio Guardian — Mainnet' };
import './globals.css';
import Providers from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-6xl mx-auto p-4">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">🧠 AI Portfolio Guardian — Mainnet</h1>
          </header>
          <Providers>{children}</Providers>
          <footer className="mt-10 opacity-60 text-xs">Polygon • Mainnet (137) • Demo build</footer>
        </div>
      </body>
    </html>
  );
}
