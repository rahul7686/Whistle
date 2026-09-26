import React from 'react';
import { Navbar } from './Navbar';
import { LaceWalletState } from '../midnight/types';
import { ShieldAlert, Github, ExternalLink } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletState: LaceWalletState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onOpenLogsModal: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  walletState,
  onConnectWallet,
  onDisconnectWallet,
  onOpenLogsModal,
}) => {
  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col font-sans selection:bg-midnight-accent selection:text-midnight-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletState={walletState}
        onConnectWallet={onConnectWallet}
        onDisconnectWallet={onDisconnectWallet}
        onOpenLogsModal={onOpenLogsModal}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      <footer className="bg-midnight-950 border-t border-midnight-800/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-midnight-accent" />
            <span className="font-extrabold text-white">Whistle</span>
            <span className="text-slate-500">—</span>
            <span>Anonymous Organizational Reporting on Midnight Network</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a
              href="https://github.com/rahul7686/Whistle"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
            <a
              href="https://docs.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Midnight Docs</span>
            </a>
            <a
              href="https://x.com/WhistleMnight"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-midnight-accent hover:text-cyan-300 transition-colors font-semibold"
            >
              <span>X (@WhistleMnight)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://preprod.midnightexplorer.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preprod Explorer</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};