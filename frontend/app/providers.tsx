'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const wagmi = createConfig({
  chains: [polygon],
  transports: { [polygon.id]: http() }, // RPC otomatik (window.ethereum veya public)
});

const qc = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmi}>
      <QueryClientProvider client={qc}>
        {children}
        <Toaster position="top-right" closeButton richColors expand />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
