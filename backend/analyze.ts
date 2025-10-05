import { getBalances } from './adapters/covalent.js';
import { getTxCount7d } from './adapters/polygonscan.js';

const STABLES = new Set(['USDC','USDT','DAI','USDP','TUSD','USDC.E']);
const MAX_TOP = 12;

export type AnalyzeOut = {
  result: {
    score: number;
    notes: string[];
    components: { concentration: number; stable: number; activity: number };
    recommendations: string[];
    modelIdHex: string;
  };
  assets: { symbol: string; balanceUSD: number; pct: number }[];
  charts: {
    topBar: { labels: string[]; data: number[] };
    riskRadar: { labels: string[]; data: number[] };
  };
  signals: { txCount7d: number; stableRatio: number; hhi: number; topWeight: number };
};

export async function analyzeAddress(addr: string): Promise<AnalyzeOut> {
  const items = await getBalances(addr);
  const total = Math.max(1e-9, items.reduce((s, i) => s + i.balanceUSD, 0));
  const assets = items.map(a => ({ ...a, pct: a.balanceUSD / total }));

  const topWeight = assets.length ? assets[0].pct : 0;
  const stableUsd = assets.filter(a => STABLES.has(a.symbol.toUpperCase())).reduce((s,a)=>s+a.balanceUSD,0);
  const stableRatio = stableUsd / total;
  const hhi = assets.reduce((s,a)=> s + Math.pow(a.pct,2), 0);
  const txCount7d = await getTxCount7d(addr);

  const concentration = Math.min(100, Math.round(topWeight * 100));
  const stable = Math.round( Math.max(0, (0.15 - stableRatio)) / 0.15 * 100 );
  const activity = Math.min(100, txCount7d * 5);

  const score = Math.min(100, Math.round(0.6*concentration + 0.25*stable + 0.15*activity));

  const notes: string[] = [];
  const recs: string[] = [];

  if (topWeight >= 0.7) {
    notes.push('High concentration risk (>70% in a single asset).');
    recs.push('Reduce top asset below 50% by reallocating into 2–3 assets.');
  }
  if (stableRatio < 0.10) {
    notes.push('Low stablecoin hedge (<10%).');
    recs.push('Add 10–20% USDC/DAI/TUSD as volatility hedge.');
  }
  if (stableRatio > 0.5) {
    notes.push('Over-hedged: stablecoins >50%.');
    recs.push('Deploy some stables to yield (Aave, LSDFi).');
  }
  if (txCount7d > 30) {
    notes.push('High on-chain activity last 7 days.');
    recs.push('Throttle trading; set daily order caps or use DCA.');
  }
  if (!notes.length) notes.push('Balanced portfolio—no major red flags.');

  const top = assets.slice(0, MAX_TOP);
  const topBar = { labels: top.map(a=>a.symbol), data: top.map(a=>Number(a.balanceUSD.toFixed(2))) };
  const riskRadar = { labels: ['Concentration','Low Stable Hedge','Activity'], data: [concentration, stable, activity] };

  const modelIdHex = '0x' + Buffer.from('risk.v1').toString('hex').padEnd(64,'0');

  return {
    result: { score, notes, components:{ concentration, stable, activity }, recommendations: recs, modelIdHex },
    assets,
    charts: { topBar, riskRadar },
    signals: { txCount7d, stableRatio: Number(stableRatio.toFixed(4)), hhi: Number(hhi.toFixed(4)), topWeight: Number(topWeight.toFixed(4)) }
  };
}
