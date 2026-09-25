import React from 'react';
import {
  ShieldAlert,
  Send,
  Building2,
  Gift,
  Search,
  Rocket,
  Activity,
  Wallet,
  Lock,
} from 'lucide-react';
import { LaceWalletState } from '../midnight/types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletState: LaceWalletState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onOpenLogsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  walletState,
  onConnectWallet,
  onDisconnectWallet,
  onOpenLogsModal,
}) => {
  const navItems = [
    { id: 'submit', label: 'Submit Report', icon: Send },
    { id: 'admin', label: 'Admin Hub', icon: Building2 },
    { id: 'claim', label: 'Claim Bounty', icon: Gift },
    { id: 'explorer', label: 'Preprod Explorer', icon: Search },
    { id: 'deploy', label: 'Deploy (/deploy)', icon: Rocket },
  ];

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return addr.slice(0, 14) + '...' + addr.slice(-6);
  };

  return (
    <header className="sticky top-0 z-40 bg-midnight-950/85 backdrop-blur-md border-b border-midnight-700/60 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('submit')}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-midnight-accent to-midnight-purple flex items-center justify-center shadow-lg shadow-midnight-accent/25 border border-midnight-accent/40">
                <ShieldAlert className="w-5 h-5 text-midnight-950 stroke-[2.5]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-midnight-950 flex items-center justify-center">
                <Lock className="w-2 h-2 text-midnight-950" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-midnight-accent bg-clip-text text-transparent">
                  Whistle
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-midnight-accent/15 text-midnight-accent border border-midnight-accent/30">
                  Preprod ZK
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Anonymous Organizational Reporting with Verifiable Standing
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-midnight-900/90 p-1 rounded-xl border border-midnight-700/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={
                    'flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ' +
                    (isActive
                      ? 'bg-gradient-to-r from-midnight-accent/20 to-midnight-purple/20 text-midnight-accent border border-midnight-accent/40 shadow-sm shadow-midnight-accent/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-midnight-800/60')
                  }
                >
                  <Icon className={'w-3.5 h-3.5 ' + (isActive ? 'text-midnight-accent' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: ZK Logs + 1AM Wallet */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenLogsModal}
              title="Inspect ZK Circuit Execution Logs"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-midnight-900 border border-midnight-700 hover:border-midnight-accent/40 hover:text-midnight-accent transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-midnight-accent animate-pulse" />
              <span className="hidden lg:inline">ZK Circuits</span>
            </button>

            {/* Wallet Connector */}
            {walletState.isConnected ? (
              <div className="flex items-center space-x-2 bg-midnight-900/90 border border-midnight-700 rounded-xl p-1 pr-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-mono font-bold text-slate-200">
                    {formatAddress(walletState.address)}
                  </div>
                  <div className="text-[10px] text-midnight-accent font-semibold flex items-center space-x-1">
                    <span>10,000 tNIGHT</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400 uppercase">Preprod</span>
                  </div>
                </div>
                <button
                  onClick={onDisconnectWallet}
                  className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-0.5 rounded hover:bg-rose-500/10 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-midnight-950 bg-gradient-to-r from-midnight-accent via-cyan-300 to-midnight-teal hover:shadow-lg hover:shadow-midnight-accent/30 transition-all transform active:scale-95"
              >
                <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Connect 1AM</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-midnight-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={
                  'flex flex-col items-center py-1 px-2 text-[10px] font-medium ' +
                  (isActive ? 'text-midnight-accent' : 'text-slate-400')
                }
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label.replace(' (/deploy)', '')}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};