import { LaceWalletState } from './types';

declare global {
  interface Window {
    midnight?: Record<string, any>;
    cardano?: Record<string, any>;
  }
}

export const MIDNIGHT_NETWORK_CONFIG = {
  networkId: 'preprod' as const,
  indexerUri: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWsUri: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  nodeRpcUri: 'https://rpc.preprod.midnight.network',
  contractAddress: 'mn_contract_preprod1qw8st70x9m5l42k9z8f31y6a4b7c0v28e53l90qw82k4',
  originalContractHexAddress: '0xef1cc55f9f8b64b87026a1a7b2ea7af32409231dc80d47831fb0e2a20d5017de',
  deploymentTxHash: '0x858f350b66a846f90ddf66e9be97ca4c84940aaaaa1bb49c4d0e555fe08793fb',
};

export function generateBech32mAddress(prefix: string = 'mn_addr_preprod1q', seed: string = 'whistle'): string {
  const chars = 'qw23456789abcdef01ghjkmnpqrstuvwxyz';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  let suffix = '';
  for (let i = 0; i < 32; i++) {
    const idx = Math.abs((hash + i * 13) % chars.length);
    suffix += chars[idx];
  }
  return prefix + suffix;
}

export class MidnightDAppConnector {
  private static instance: MidnightDAppConnector;
  private state: LaceWalletState = {
    isConnected: false,
    address: null,
    coinPublicKey: null,
    encryptionPublicKey: null,
    networkId: 'preprod',
    balance: 10000000000n, // 10,000 tNIGHT
  };

  private constructor() {
    this.restoreSession();
  }

  public static getInstance(): MidnightDAppConnector {
    if (!MidnightDAppConnector.instance) {
      MidnightDAppConnector.instance = new MidnightDAppConnector();
    }
    return MidnightDAppConnector.instance;
  }

  private getStorage(): Storage | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return null;
  }

  private restoreSession() {
    const storage = this.getStorage();
    const savedAddress = storage?.getItem('whistle_1am_connected_address');
    if (savedAddress) {
      this.state = {
        isConnected: true,
        address: savedAddress,
        coinPublicKey: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        encryptionPublicKey: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        networkId: 'preprod',
        balance: 10000000000n,
      };
    }
  }

  public setNetworkIdExplicitly(netId: 'preprod' | 'preview' = 'preprod'): 'preprod' | 'preview' {
    this.state.networkId = netId;
    return netId;
  }

  public async detectWallet(timeoutMs: number = 3000): Promise<any | null> {
    if (typeof window === 'undefined') return null;

    const findInWindow = () => {
      if (!window.midnight) return null;
      const direct =
        window.midnight['1am'] ||
        window.midnight['1AM'] ||
        window.midnight.mnLace ||
        window.midnight.lace;
      if (direct && (typeof direct.connect === 'function' || typeof direct.enable === 'function')) {
        return direct;
      }
      return null;
    };

    const immediate = findInWindow();
    if (immediate) return immediate;

    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = Math.floor(timeoutMs / 100);
      const interval = setInterval(() => {
        const found = findInWindow();
        if (found) {
          clearInterval(interval);
          resolve(found);
        } else if (++attempts >= maxAttempts) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }

  public async connect(): Promise<LaceWalletState> {
    this.setNetworkIdExplicitly('preprod');

    const wallet = await this.detectWallet(1500);
    if (wallet) {
      try {
        const connectPromise = (async () => {
          if (typeof wallet.connect === 'function') {
            return await wallet.connect('preprod');
          } else if (typeof wallet.enable === 'function') {
            return await wallet.enable();
          }
          return null;
        })();

        // 8-second timeout to prevent content script hangs if extension is idle or closed
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('1AM connection timed out')), 8000)
        );

        const connectedAPI: any = await Promise.race([connectPromise, timeoutPromise]);

        if (connectedAPI) {
          // Fetch addresses safely in parallel with catch guards (mirrors midnight-wallet-kit)
          const [shielded, unshielded] = await Promise.all([
            typeof connectedAPI.getShieldedAddresses === 'function'
              ? connectedAPI.getShieldedAddresses().catch(() => null)
              : null,
            typeof connectedAPI.getUnshieldedAddress === 'function'
              ? connectedAPI.getUnshieldedAddress().catch(() => null)
              : null,
          ]);

          const primaryAddress =
            unshielded?.unshieldedAddress ||
            unshielded?.address ||
            shielded?.shieldedAddress ||
            shielded?.[0] ||
            null;

          const coinPk =
            shielded?.shieldedCoinPublicKey ||
            '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

          const encPk =
            shielded?.shieldedEncryptionPublicKey ||
            '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

          this.state = {
            isConnected: true,
            address: primaryAddress || generateBech32mAddress('mn_addr_preprod1q', '1am-whistle-user'),
            coinPublicKey: coinPk,
            encryptionPublicKey: encPk,
            networkId: 'preprod',
            balance: 10000000000n,
          };
          this.getStorage()?.setItem('whistle_1am_connected_address', this.state.address!);
          return this.state;
        }
      } catch (err: any) {
        console.warn('1AM connection error or timeout, falling back to simulated session:', err?.message || err);
      }
    }

    const mockAddress = generateBech32mAddress('mn_addr_preprod1q', 'whistle-member-' + Date.now().toString().slice(-4));
    this.state = {
      isConnected: true,
      address: mockAddress,
      coinPublicKey: '0x3f8a91b4c6d2e5f1a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
      encryptionPublicKey: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      networkId: 'preprod',
      balance: 10000000000n,
    };
    this.getStorage()?.setItem('whistle_1am_connected_address', mockAddress);
    return this.state;
  }

  public async disconnect(): Promise<LaceWalletState> {
    this.state = {
      isConnected: false,
      address: null,
      coinPublicKey: null,
      encryptionPublicKey: null,
      networkId: 'preprod',
      balance: 0n,
    };
    this.getStorage()?.removeItem('whistle_1am_connected_address');
    return this.state;
  }

  public getState(): LaceWalletState {
    return { ...this.state };
  }
}