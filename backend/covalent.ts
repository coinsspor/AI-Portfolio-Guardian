import fetch from 'node-fetch';

type BalItem = { symbol: string; balanceUSD: number };

// Fetch ERC20 + native balances in USD using Covalent's balances endpoint.
export async function getBalances(address: string): Promise<BalItem[]> {
  const key = process.env.COVALENT_API_KEY;
  const url = `https://api.covalenthq.com/v1/137/address/${address}/balances_v2/?nft=false&no-nft-fetch=true&quote-currency=USD&key=${key}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j: any = await r.json();
  const items: BalItem[] = [];
  const data = j?.data?.items || [];
  for (const it of data) {
    const usd = Number(it.quote ?? 0);
    const sym = (it.contract_ticker_symbol || 'TOKEN').toUpperCase();
    if (usd > 0) items.push({ symbol: sym, balanceUSD: usd });
  }
  // sort high to low
  items.sort((a,b)=>b.balanceUSD - a.balanceUSD);
  return items.slice(0, 24);
}
