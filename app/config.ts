import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base],
  connectors: [
    // 1. Coinbase Smart Wallet (The popup experience)
    coinbaseWallet({
      appName: 'The Onchain Scroll',
      preference: 'smartWalletOnly',
    }),
    // 2. Injected Wallet (Works for Warpcast, MetaMask, Phantom, etc.)
    injected(), 
  ],
  transports: {
    [base.id]: http(), 
  },
});