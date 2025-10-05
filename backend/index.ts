import express, { Request, Response } from 'express';
import cors from 'cors';
import { ALLOW_ORIGIN } from './config.js';
import { analyzeAddress } from './analyze.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: ALLOW_ORIGIN, credentials: false }));

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { address } = req.body || {};
    if (!address) return res.status(400).json({ error: 'address required' });
    const out = await analyzeAddress(address);
    res.json(out);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message || 'internal' });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API on :${port}`));
