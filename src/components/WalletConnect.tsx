import React from 'react';
import { Wallet, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { LaceWalletState } from '../midnight/types';
import { shortenAddress } from '../utils/contract';

interface WalletConnectProps {
  walletState: LaceWalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  compact?: boolean;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  walletState,
  onConnect,
  onDisconnect,
  compact = false,
}) => {
  if (!walletState.isConnected) {
    return (
      <button
        onClick={onConnect}
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-midnight-950 bg-gradient-to-r from-midnight-accent to-cyan-300 hover:opacity-90 transition-all shadow-lg shadow-midnight-accent/20"
      >
        <Wallet className="w-3.5 h-3.5 text-midnight-950" />
        <span>Connect 1AM</span>
      </button>
    );
  }

  if (compact) {
    return (
      <div className="inline-flex items-center space-x-2 bg-midnight-900 border border-midnight-700 px-3 py-1.5 rounded-xl text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-slate-200">{shortenAddress(walletState.address, 4)}</span>
        <button
          onClick={onDisconnect}
          title="Disconnect"
          className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 bg-midnight-900/90 border border-midnight-700/80 px-3.5 py-1.5 rounded-xl shadow-inner">
      <div className="flex items-center space-x-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Preprod</span>
      </div>

      <div className="h-3.5 w-px bg-midnight-700" />

      <span className="font-mono text-xs text-slate-300 font-medium">
        {shortenAddress(walletState.address, 5)}
      </span>

      <button
        onClick={onDisconnect}
        title="Disconnect 1AM Wallet"
        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};