import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
// CRITICAL CHANGE: Use the specific connector for Mini Apps
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export const config = createConfig({
  chains: [base],
  connectors: [
    // Uses the Farcaster user's connected wallet automatically
    farcasterMiniApp(), 
  ],
  transports: {
    // KEEPS PUBLIC RPC (Default)
    [base.id]: http(), 
  },
});