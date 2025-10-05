'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 text-slate-100 flex items-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/10 text-purple-300 ring-1 ring-purple-500/30">
          <span>🔎</span><span className="font-semibold">Sayfa bulunamadı</span>
        </div>
        <h1 className="mt-6 text-4xl font-extrabold">Oops… 404</h1>
        <p className="mt-3 text-slate-300">
          Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold">
            Ana sayfaya dön
          </Link>
          <Link href="/analyze" className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 ring-1 ring-white/10">
            Cüzdanını analiz et
          </Link>
        </div>
      </div>
    </main>
  );
}
