import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WhistleblowerSubmit } from './components/WhistleblowerSubmit';
import { AdminReviewHub } from './components/AdminReviewHub';
import { BountyClaim } from './components/BountyClaim';
import { ContractDeploy } from './components/ContractDeploy';
import { PreprodExplorer } from './components/PreprodExplorer';
import { CircuitLogsModal } from './components/CircuitLogsModal';
import { MidnightDAppConnector } from './midnight/dappConnector';
import { LaceWalletState, ClaimReceipt } from './midnight/types';
import { ShieldAlert, ExternalLink, Github, Sparkles, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('submit');
  const [walletState, setWalletState] = useState<LaceWalletState>(() =>
    MidnightDAppConnector.getInstance().getState()
  );
  const [isLogsModalOpen, setIsLogsModalOpen] = useState<boolean>(false);
  const [, setRefreshKey] = useState<number>(0);

  const connector = MidnightDAppConnector.getInstance();

  useEffect(() => {
    // If URL has /deploy or #deploy
    if (window.location.pathname === '/deploy' || window.location.hash === '#deploy') {
      setActiveTab('deploy');
    }
  }, []);

  const handleConnectWallet = async () => {
    const updated = await connector.connect();
    setWalletState({ ...updated });
  };

  const handleDisconnectWallet = async () => {
    const updated = await connector.disconnect();
    setWalletState({ ...updated });
  };

  const handleNavigateToClaim = (receipt: ClaimReceipt) => {
    setActiveTab('claim');
  };

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col font-sans selection:bg-midnight-accent selection:text-midnight-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletState={walletState}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onOpenLogsModal={() => setIsLogsModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'submit' && (
          <WhistleblowerSubmit
            onReportSubmitted={triggerRefresh}
            onNavigateToClaim={handleNavigateToClaim}
          />
        )}

        {activeTab === 'admin' && (
          <AdminReviewHub onStateChanged={triggerRefresh} />
        )}

        {activeTab === 'claim' && (
          <BountyClaim
            walletState={walletState}
            onConnectWallet={handleConnectWallet}
            onClaimSuccess={triggerRefresh}
          />
        )}

        {activeTab === 'explorer' && <PreprodExplorer />}

        {activeTab === 'deploy' && (
          <ContractDeploy
            walletState={walletState}
            onConnectWallet={handleConnectWallet}
          />
        )}
      </main>

      {/* Footer */}
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

      <CircuitLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </div>
  );
};
