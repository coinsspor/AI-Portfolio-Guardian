import fetch from 'node-fetch';

export async function getTxCount7d(address: string): Promise<number> {
  const key = process.env.POLYGONSCAN_API_KEY;
  const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${key}`;
  try {
    const r = await fetch(url);
    const j: any = await r.json();
    const list = Array.isArray(j?.result) ? j.result : [];
    const now = Math.floor(Date.now()/1000);
    const weekAgo = now - 7*24*3600;
    let cnt = 0;
    for (const tx of list.slice(0, 1000)) {
      const t = Number(tx.timeStamp || 0);
      if (t >= weekAgo) cnt++;
      else break;
    }
    return cnt;
  } catch {
    return 0;
  }
}
