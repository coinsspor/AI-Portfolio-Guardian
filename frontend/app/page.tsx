'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from 'wagmi';
import { injected } from 'wagmi/connectors';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js';
import { Doughnut, Radar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Filler,
);

const RISK_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'attestOpen',
    stateMutability: 'payable',
    inputs: [
      { name: 'wallet',        type: 'address' },
      { name: 'modelId',       type: 'bytes32' },
      { name: 'version',       type: 'uint16'  },
      { name: 'score',         type: 'uint16'  },
      { name: 'confidence',    type: 'uint16'  },
      { name: 'concentration', type: 'uint16'  },
      { name: 'stable',        type: 'uint16'  },
      { name: 'activity',      type: 'uint16'  },
      { name: 'tag',           type: 'string'  },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'publicMode',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'feeWei',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'get',
    stateMutability: 'view',
    inputs: [
      { name: 'wallet', type: 'address' },
      { name: 'modelId', type: 'bytes32' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'score', type: 'uint16' },
          { name: 'confidence', type: 'uint16' },
          { name: 'version', type: 'uint16' },
          { name: 'updatedAt', type: 'uint64' },
          { name: 'attestor', type: 'address' },
          { name: 'modelId', type: 'bytes32' },
          {
            name: 'f',
            type: 'tuple',
            components: [
              { name: 'concentration', type: 'uint16' },
              { name: 'stable', type: 'uint16' },
              { name: 'activity', type: 'uint16' },
            ],
          },
          { name: 'tag', type: 'string' },
        ],
      },
    ],
  },
] as const;

const REGISTRY = (process.env.NEXT_PUBLIC_REGISTRY ||
  '0x35d818492803865b20804C8D60a149519B215b37') as `0x${string}`;
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://149.50.116.116:4000';

const PALETTE = [
  '#8B5CF6', '#22D3EE', '#10B981', '#F59E0B', '#EF4444',
  '#38BDF8', '#F472B6', '#34D399', '#FB923C', '#A78BFA',
];
const pickColors = (n: number) =>
  Array.from({ length: n }, (_, i) => PALETTE[i % PALETTE.length]);

type Analysis = {
  result: {
    score: number;
    notes: string[];
    recommendations?: string[];
    components: { concentration: number; stable: number; activity: number };
    modelIdHex?: `0x${string}`;
  };
  assets?: any;
  charts?: any;
};

export default function AnalyzePage() {
  const [addr, setAddr] = useState('');
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [attestLoading, setAttestLoading] = useState(false);

  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient({ chainId: 137 });
  
  // Read contract states
  const { data: publicMode } = useReadContract({
    address: REGISTRY,
    abi: RISK_REGISTRY_ABI,
    functionName: 'publicMode',
    chainId: 137,
  });
  
  const { data: feeWei } = useReadContract({
    address: REGISTRY,
    abi: RISK_REGISTRY_ABI,
    functionName: 'feeWei',
    chainId: 137,
  });
  
  const { data: isPaused } = useReadContract({
    address: REGISTRY,
    abi: RISK_REGISTRY_ABI,
    functionName: 'paused',
    chainId: 137,
  });
  
  const { data: owner } = useReadContract({
    address: REGISTRY,
    abi: RISK_REGISTRY_ABI,
    functionName: 'owner',
    chainId: 137,
  });

  // Check existing record - use query for conditional execution
  const modelId = '0x7269736b2e763100000000000000000000000000000000000000000000000000' as `0x${string}`;
  
  const { data: existingRecord } = useReadContract({
    address: REGISTRY,
    abi: RISK_REGISTRY_ABI,
    functionName: 'get',
    args: addr ? [addr as `0x${string}`, modelId] : undefined,
    chainId: 137,
    query: {
      enabled: !!addr && addr.startsWith('0x') && addr.length === 42,
    },
  });
  
  const { writeContractAsync, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
    chainId: 137,
  });

  useEffect(() => {
    if (isConnected && address && (!addr || addr.length < 6)) setAddr(address);
  }, [isConnected, address]);

  useEffect(() => {
    if (isConfirmed && hash) {
      const link = `https://polygonscan.com/tx/${hash}`;
      toast.success(
        <span>
          Attested on mainnet ✅{' '}
          <a className="underline underline-offset-4 text-sky-300" href={link} target="_blank" rel="noreferrer">
            View transaction
          </a>
        </span>
      );
      setAttestLoading(false);
    }
  }, [isConfirmed, hash]);

  const fetchAnalyze = async () => {
    if (!addr) return toast.error('Enter a wallet address.');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr }),
      });
      if (!res.ok) throw new Error('API error');
      const j = (await res.json()) as Analysis;
      setData(j);
      toast.success('Analysis completed');
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to analyze wallet');
    } finally {
      setLoading(false);
    }
  };

  const attest = async () => {
    if (!isConnected) return toast.error('Connect your wallet first.');
    if (!data) return toast.error('Run an analysis first.');
    if (!addr || addr.toLowerCase() !== (address ?? '').toLowerCase()) {
      return toast.error('Self-attestation only. Input must equal connected wallet.');
    }
    
    if (isPaused === true) {
      return toast.error('Contract is paused. Please try again later.');
    }
    
    if (publicMode === false) {
      return toast.error('Public mode is disabled. Contact contract owner to enable it.');
    }
    
    if (chainId !== 137) {
      try { 
        await switchChainAsync({ chainId: 137 }); 
      } catch { 
        return toast.error('Please switch to Polygon mainnet.'); 
      }
    }
    
    setAttestLoading(true);
    
    try {
      // Calculate proper version
      let nextVersion = Math.floor(Date.now() / 60_000) % 65535 || 1;
      if (existingRecord && existingRecord.version > 0) {
        nextVersion = (existingRecord.version + 1) % 65536 || 1;
      }
      
      const { concentration, stable, activity } = data.result.components;
      
      // Ensure all values are in range 0-100
      const score = Math.max(0, Math.min(100, Math.round(data.result.score)));
      const concentrationValue = Math.max(0, Math.min(100, Math.round(concentration)));
      const stableValue = Math.max(0, Math.min(100, Math.round(stable)));
      const activityValue = Math.max(0, Math.min(100, Math.round(activity)));
      
      console.log('Attesting with values:', {
        wallet: addr,
        modelId,
        version: nextVersion,
        score,
        confidence: 90,
        concentration: concentrationValue,
        stable: stableValue,
        activity: activityValue,
        tag: 'apg.v1',
        fee: feeWei?.toString() || '0',
      });
      
      const txHash = await writeContractAsync({
        address: REGISTRY,
        abi: RISK_REGISTRY_ABI,
        functionName: 'attestOpen',
        args: [
          addr as `0x${string}`,
          modelId,
          nextVersion,
          score,
          90, // confidence
          concentrationValue,
          stableValue,
          activityValue,
          'apg.v1',
        ],
        value: feeWei || 0n,
      });
      
      console.log('Transaction submitted:', txHash);
      
    } catch (e: any) {
      console.error('Transaction failed:', e);
      
      let errorMsg = 'Transaction failed: ';
      if (e.message?.includes('public off')) {
        errorMsg = 'Public mode is disabled';
      } else if (e.message?.includes('range')) {
        errorMsg = 'Values must be between 0-100';
      } else if (e.message?.includes('User rejected')) {
        errorMsg = 'Transaction rejected by user';
      } else {
        errorMsg += e.shortMessage || e.message || 'Unknown error';
      }
      
      toast.error(errorMsg);
      setAttestLoading(false);
    }
  };

  const debugInfo = () => {
    console.log('=== Contract State ===');
    console.log('Registry:', REGISTRY);
    console.log('Owner:', owner);
    console.log('Your Address:', address);
    console.log('Public Mode:', publicMode);
    console.log('Paused:', isPaused);
    console.log('Fee (POL):', feeWei ? (Number(feeWei) / 1e18).toFixed(6) : '0');
    if (existingRecord) {
      console.log('Existing Version:', existingRecord.version);
      console.log('Existing Score:', existingRecord.score);
    }
    if (data) {
      console.log('=== Current Analysis ===');
      console.log('Score:', Math.round(data.result.score));
      console.log('Components:', data.result.components);
    }
  };

  // Charts
  const donut = useMemo(() => {
    if (!data) return null;
    const srcAssets = (data as any).assets;
    const tb = (data as any).charts?.topBar;

    const toNum = (x: any) => {
      const n = typeof x === 'string' ? Number(x) : x;
      return Number.isFinite(n) ? Number(n) : 0;
    };
    const pushPair = (pairs: { l: string; v: number }[], label: any, value: any) => {
      const l = String(label || '').trim();
      const v = toNum(value);
      if (l && v > 0) pairs.push({ l, v });
    };
    const fromArrayOfObjects = (arr: any[]) => {
      const out: { l: string; v: number }[] = [];
      for (const it of arr) {
        if (!it) continue;
        const l = it?.label ?? it?.symbol ?? it?.name ?? it?.token;
        const v = it?.usd ?? it?.value ?? it?.amount_usd ?? it?.amountUsd ?? it?.v ?? it?.amounts?.usd ?? it?.amounts?.value;
        pushPair(out, l, v);
      }
      return out;
    };
    const fromRecord = (obj: Record<string, any>) => {
      const out: { l: string; v: number }[] = [];
      for (const [k, v] of Object.entries(obj || {})) {
        if (v && typeof v === 'object') pushPair(out, k, (v as any).usd ?? (v as any).value ?? (v as any).amount_usd);
        else pushPair(out, k, v);
      }
      return out;
    };

    let pairs: { l: string; v: number }[] = [];
    if (Array.isArray(srcAssets)) pairs = fromArrayOfObjects(srcAssets);
    else if (srcAssets && typeof srcAssets === 'object') pairs = fromRecord(srcAssets);

    if (!pairs.length && tb) {
      if (Array.isArray(tb)) pairs = fromArrayOfObjects(tb);
      else if (Array.isArray(tb?.labels)) {
        const labels: any[] = tb.labels;
        const candidateArrays = [tb.usd, tb.values, tb.data, tb.series, tb.amounts] as any[];
        let nums: any[] | null = null;
        for (const cand of candidateArrays) {
          if (Array.isArray(cand) && cand.length) {
            nums = cand.map((x: any) => toNum(x?.usd ?? x?.value ?? x?.amount_usd ?? x?.v ?? x));
            break;
          }
        }
        if (nums) {
          const L = Math.min(labels.length, nums.length);
          for (let i = 0; i < L; i++) pairs.push({ l: String(labels[i]), v: toNum(nums[i]) });
        }
      } else if (typeof tb === 'object') pairs = fromRecord(tb as any);
    }

    pairs = pairs.filter(p => p.v > 0);
    if (!pairs.length) return null;

    pairs.sort((a, b) => b.v - a.v);
    const top = pairs.slice(0, 12);
    const other = pairs.slice(12).reduce((s, p) => s + p.v, 0);
    if (other > 0) top.push({ l: 'Other', v: other });

    const labels = top.map(p => p.l);
    const values = top.map(p => p.v);

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Asset Breakdown (USD)',
            data: values,
            backgroundColor: pickColors(values.length),
            borderWidth: 0,
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: 'top' as const, labels: { color: '#CBD5E1' } },
          tooltip: { enabled: true },
        },
        cutout: '60%',
      },
      table: top,
    };
  }, [data]);

  const radar = useMemo(() => {
    if (!data) return null;
    const c = data.result.components;
    return {
      data: {
        labels: ['Concentration', 'Low Stable Hedge', 'Activity'],
        datasets: [
          {
            label: 'Risk Components',
            data: [c.concentration, c.stable, c.activity],
            backgroundColor: 'rgba(139,92,246,0.25)',
            borderColor: '#8B5CF6',
            pointBackgroundColor: '#8B5CF6',
            pointBorderColor: '#fff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        scales: {
          r: {
            angleLines: { color: 'rgba(148,163,184,0.25)' },
            grid: { color: 'rgba(148,163,184,0.25)' },
            pointLabels: { color: '#CBD5E1' },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: { display: false },
          },
        },
        plugins: { legend: { display: false } },
      },
    };
  }, [data]);

  const spark = useMemo(() => {
    const base = data ? Math.round(data.result.score) : 25;
    const pts = Array.from({ length: 12 }, (_, i) =>
      Math.max(5, Math.min(95, base + Math.round(8 * Math.sin(i * 0.8)) - 4 + (i % 3) * 2))
    );
    return {
      data: {
        labels: pts.map((_, i) => `${i + 1}`),
        datasets: [
          {
            data: pts,
            borderColor: '#22D3EE',
            backgroundColor: 'rgba(34,211,238,0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        scales: { x: { display: false }, y: { display: false, suggestedMin: 0, suggestedMax: 100 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  }, [data]);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-xl bg-white/10 px-3 py-2 font-semibold hover:bg-white/20">
            ← Home
          </Link>
          <h1 className="text-2xl font-bold">AI Portfolio Guardian — Mainnet</h1>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="hidden sm:block text-sm text-neutral-400">
                Connected: {address?.slice(0, 6)}…{address?.slice(-4)}
              </span>
              <button onClick={() => disconnect()} className="rounded-xl bg-white/10 px-4 py-2 font-semibold hover:bg-white/20">
                Disconnect
              </button>
            </>
          ) : (
            <button onClick={() => connect({ connector: injected() })} className="rounded-xl bg-violet-600 px-4 py-2 font-semibold hover:bg-violet-500">
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Address + Analyze */}
      <div className="flex gap-3 items-center mb-6">
        <input
          className="flex-1 rounded-xl bg-white/5 px-4 py-3 outline-none border border-white/10"
          placeholder="Enter a Polygon mainnet address (0x...)"
          value={addr}
          onChange={(e) => setAddr(e.target.value.trim())}
        />
        <button
          onClick={fetchAnalyze}
          disabled={loading}
          className="rounded-xl bg-fuchsia-600 px-5 py-3 font-semibold hover:bg-fuchsia-500 disabled:opacity-60"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>

      {/* Contract Status Bar */}
      {isConnected && (
        <div className="mb-4 rounded-xl bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-neutral-400">
                Public: 
                <span className={publicMode ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
                  {publicMode ? 'ON' : 'OFF'}
                </span>
              </span>
              <span className="text-neutral-400">
                Status: 
                <span className={isPaused ? 'text-red-400 ml-1' : 'text-green-400 ml-1'}>
                  {isPaused ? 'Paused' : 'Active'}
                </span>
              </span>
              <span className="text-neutral-400">
                Fee: 
                <span className="text-sky-400 ml-1">
                  {feeWei ? `${(Number(feeWei) / 1e18).toFixed(6)} POL` : 'Free'}
                </span>
              </span>
              {existingRecord && existingRecord.version > 0 && (
                <span className="text-neutral-400">
                  Last: 
                  <span className="text-amber-400 ml-1">v{existingRecord.version}</span>
                </span>
              )}
            </div>
            <button 
              onClick={debugInfo}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              Debug
            </button>
          </div>
          
          {!publicMode && (
            <div className="mt-2 text-sm text-red-400">
              ⚠️ Public mode is OFF. Contact owner to enable.
            </div>
          )}
        </div>
      )}

      {/* Cards row */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Score + Notes */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-neutral-400">Risk Score (0–100)</div>
          <div className="text-6xl font-extrabold mt-2">{data ? Math.round(data.result.score) : 0}</div>
          <div className="mt-4 h-16">{data && <Line data={spark.data} options={spark.options as any} />}</div>
          <div className="mt-4">
            <div className="text-neutral-300 font-semibold mb-1">Notes</div>
            <ul className="list-disc pl-5 text-neutral-300">
              {(data?.result.notes ?? ['No data yet.']).map((n, i) => (<li key={i}>{n}</li>))}
            </ul>
          </div>

          <button 
            onClick={attest} 
            disabled={!isConnected || !data || attestLoading || isConfirming || publicMode === false || isPaused === true}
            className="mt-6 rounded-xl bg-fuchsia-600 px-4 py-2 font-semibold hover:bg-fuchsia-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {attestLoading || isConfirming ? 'Processing...' : 'Attest On-Chain'}
          </button>
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div className="text-neutral-300 font-semibold">Asset Breakdown (USD)</div>
            <button onClick={() => setShowAssets((s) => !s)} className="text-sky-300 underline underline-offset-4">
              {showAssets ? 'Hide' : 'View'} assets
            </button>
          </div>

          <div className="mt-4">
            {donut ? <Doughnut data={donut.data} options={donut.options as any} /> : <div className="text-neutral-500">No asset data</div>}
          </div>

          {showAssets && donut && (
            <div className="mt-5">
              <table className="w-full text-sm">
                <thead className="text-neutral-400">
                  <tr><th className="text-left py-1">Asset</th><th className="text-right py-1">USD</th><th className="text-left py-1 pl-3">Weight</th></tr>
                </thead>
                <tbody>
                  {donut.table!.map((row: any, i: number) => {
                    const total = donut.table!.reduce((s: number, r: any) => s + r.v, 0) || 1;
                    const pct = (row.v / total) * 100;
                    return (
                      <tr key={i} className="border-t border-white/10">
                        <td className="py-2">{row.l}</td>
                        <td className="py-2 text-right">${row.v.toLocaleString()}</td>
                        <td className="py-2 pl-3">
                          <div className="h-2 rounded bg-white/10">
                            <div style={{ width: `${pct}%`, background: pickColors(1)[0] }} className="h-2 rounded" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Radar */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-neutral-300 font-semibold mb-2">Risk Components</div>
        <div className="text-xs text-neutral-400 mb-4">
          <b>Concentration↑</b> = more weight in 1–2 assets • <b>Low Stable Hedge↑</b> = fewer stables • <b>Activity↑</b> = active in last 7d
        </div>
        {radar ? <Radar data={radar.data} options={radar.options as any} /> : <div className="text-neutral-500">Run an analysis to see component breakdown.</div>}
      </div>
    </div>
  );
}