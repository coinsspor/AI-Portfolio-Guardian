import 'dotenv/config';

export const CHAIN_ID = Number(process.env.CHAIN_ID || 137);
export const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL!;
export const COVALENT_API_KEY = process.env.COVALENT_API_KEY!;
export const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY!;
export const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';
export const RISK_REGISTRY_ADDRESS = process.env.RISK_REGISTRY_ADDRESS || '';
