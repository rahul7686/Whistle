import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { WhistleblowerSubmit } from './components/WhistleblowerSubmit';
import { AdminReviewHub } from './components/AdminReviewHub';
import { BountyClaim } from './components/BountyClaim';
import { ContractDeploy } from './components/ContractDeploy';
import { PreprodExplorer } from './components/PreprodExplorer';
import { CircuitLogsModal } from './components/CircuitLogsModal';
import { MidnightDAppConnector } from './midnight/dappConnector';
import { LaceWalletState, ClaimReceipt } from './midnight/types';

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

  const handleNavigateToClaim = (_receipt: ClaimReceipt) => {
    setActiveTab('claim');
  };

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      walletState={walletState}
      onConnectWallet={handleConnectWallet}
      onDisconnectWallet={handleDisconnectWallet}
      onOpenLogsModal={() => setIsLogsModalOpen(true)}
    >
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

      <CircuitLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </Layout>
  );
};