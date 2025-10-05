'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#8B5CF6','#22D3EE','#10B981','#F59E0B','#EF4444','#38BDF8','#F472B6','#34D399','#FB923C','#A78BFA'];
const pickColors = (n: number) => Array.from({ length: n }, (_, i) => PALETTE[i % PALETTE.length]);

type Demo = { title: string; address: string; score: number; notes: string[]; recs: string[]; pie: { label: string; value: number }[]; };

const DEMOS: Demo[] = [
  { title: 'Balanced DeFi Wallet', address: '0x3a…DeF1', score: 28,
    notes: ['Balanced portfolio — no major red flags.'],
    recs: ['Add a small stablecoin hedge (10–15%).'],
    pie: [{label:'POL',value:45},{label:'USDT',value:30},{label:'QUICK',value:10},{label:'GNS',value:8},{label:'Others',value:7}] },
  { title: 'High Concentration Trader', address: '0x9f…Tr4d', score: 72,
    notes: ['High concentration in a single token (>70%).'],
    recs: ['Rebalance top asset below 50% by spreading into 2–3 assets.'],
    pie: [{label:'POL',value:78},{label:'USDC',value:12},{label:'AEG',value:5},{label:'Misc',value:5}] },
  { title: 'Stable-heavy Holder', address: '0xa1…H0dl', score: 18,
    notes: ['Strong stablecoin hedge (>40%).'],
    recs: ['Deploy a portion into yield or blue-chips for growth.'],
    pie: [{label:'USDC',value:55},{label:'POL',value:25},{label:'wETH',value:10},{label:'Others',value:10}] },
];

function GradientWord({ children }: { children: React.ReactNode }) {
  return <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">{children}</span>;
}

const REGISTRY = (process.env.NEXT_PUBLIC_REGISTRY ||
  '0x35d818492803865b20804C8D60a149519B215b37') as `0x${string}`;
const PSC = `https://polygonscan.com/address/${REGISTRY}`;

export default function Home() {
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % DEMOS.length), 4500); return () => clearInterval(t); }, []);
  const d = DEMOS[idx];

  const donutData = useMemo(() => {
    const labels = d.pie.map(p => p.label);
    const data = d.pie.map(p => p.value);
    return { labels, datasets: [{ label: 'Asset Breakdown', data, backgroundColor: pickColors(data.length), borderWidth: 0 }] };
  }, [d]);
  const donutOptions = useMemo(() => ({ plugins: { legend: { position: 'top' as const, labels: { color: '#CBD5E1' } }, tooltip: { enabled: true } }, cutout: '60%' }), []);

  return (
    <main className="min-h-screen text-neutral-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(130,82,255,0.25),rgba(0,0,0,0))]" />
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1 text-sm">
            <span className="text-pink-300">🧠 AI Portfolio Guardian</span>
            <span className="text-neutral-400">on Polygon Mainnet</span>
          </div>

          <h1 className="text-4xl font-extrabold sm:text-6xl leading-tight">
            Scan your wallet, get a <GradientWord>0–100 risk score</GradientWord>,<br />
            and <GradientWord>write</GradientWord> the finding <GradientWord>on-chain</GradientWord>.
          </h1>

          <p className="mt-5 max-w-3xl text-neutral-300">
            Our AI-assisted model blends diversification, stable-hedge and activity signals to produce a wallet risk score.
            Make it verifiable by attesting the result on Polygon.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/analyze" className="rounded-xl bg-fuchsia-600 px-5 py-3 font-semibold hover:bg-fuchsia-500">
              Start Analyzing
            </Link>
            <a href="#contract" className="rounded-xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/20">
              Contract & On-chain
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-2xl">🤖 AI Risk Model</div>
          <p className="mt-2 text-neutral-300">Composite score from concentration (HHI), stable hedge ratio and recent activity.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-2xl">🔗 On-chain Attestation</div>
          <p className="mt-2 text-neutral-300">Publish the score to <b>RiskRegistry</b> so anyone can verify it transparently.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-2xl">🧰 Dev-friendly</div>
          <p className="mt-2 text-neutral-300">Simple REST API. Data via Covalent & Polygonscan. Built for Polygon.</p>
        </div>
      </section>

      {/* Live-style demo slider */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Live-style Demos</h2>
          <div className="flex gap-2">
            {DEMOS.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`h-2 w-8 rounded-full ${i === idx ? 'bg-fuchsia-500' : 'bg-white/20'}`} aria-label={`slide-${i}`} />
            ))}
          </div>
        </div>

        <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2">
          <div>
            <div className="text-sm text-neutral-400">{d.title}</div>
            <div className="mt-1 text-xs text-neutral-500">{d.address}</div>

            <div className="mt-6 flex items-end gap-6">
              <div>
                <div className="text-5xl font-extrabold">{d.score}</div>
                <div className="text-neutral-400">Risk Score (0–100)</div>
              </div>
              <ul className="ml-2 list-disc text-neutral-300">{d.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>

            <div className="mt-4">
              <div className="text-neutral-400">Recommendations</div>
              <ul className="list-disc pl-4 text-neutral-200">{d.recs.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>

            <Link href="/analyze" className="mt-6 inline-block rounded-xl bg-fuchsia-600 px-4 py-2 font-semibold hover:bg-fuchsia-500">
              Analyze your wallet →
            </Link>
          </div>

          <div className="self-center">
            <Doughnut data={donutData} options={donutOptions} />
          </div>
        </div>
      </section>

      {/* Contract & On-chain */}
      <section id="contract" className="mx-auto w-full max-w-6xl px-5 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold mb-2">RiskRegistry Contract</h2>
          <p className="text-neutral-300">
            We store the final risk score on-chain so it’s auditable. Explore all attestations on{' '}
            <a href={PSC} target="_blank" rel="noreferrer" className="underline underline-offset-4 text-sky-300">
              Polygonscan
            </a>{' '}
            (<code className="text-neutral-400">{REGISTRY}</code>).
          </p>
          <ul className="list-disc pl-5 mt-3 text-neutral-300 space-y-1">
            <li><b>Events</b>: find <code>write()</code> logs with score + components.</li>
            <li><b>Transactions</b>: who attested, gas, parameters (concentration / stable / activity).</li>
            <li><b>Read/Write</b> tabs: call view functions or submit a new attestation.</li>
          </ul>
          <div className="mt-4 rounded-xl bg-black/20 p-3 text-sm text-neutral-300">
            Tip: When you press <b>Attest On-Chain</b> after an analysis, the transaction appears here within seconds.
          </div>
        </div>
      </section>

      <footer className="pb-10 text-center text-sm text-neutral-500">Polygon • Mainnet (137) • Demo build</footer>
    </main>
  );
}
