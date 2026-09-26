import { useState, useEffect, useCallback } from 'react';
import { MidnightDAppConnector } from '../midnight/dappConnector';
import { LaceWalletState } from '../midnight/types';
import { BrowserContractDeployer, DeploymentResult, detectWallet } from '../midnight/browserDeployer';

export function useMidnight() {
  const [connector] = useState(() => MidnightDAppConnector.getInstance());
  const [deployer] = useState(() => new BrowserContractDeployer());
  const [walletState, setWalletState] = useState<LaceWalletState>(() => connector.getState());
  const [isWalletDetected, setIsWalletDetected] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployProgress, setDeployProgress] = useState<number>(0);
  const [deployStep, setDeployStep] = useState<string>('');

  useEffect(() => {
    detectWallet().then((w) => setIsWalletDetected(!!w));
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      connector.setNetworkIdExplicitly('preprod');
      const updated = await connector.connect();
      setWalletState({ ...updated });
      return updated;
    } finally {
      setIsConnecting(false);
    }
  }, [connector]);

  const disconnect = useCallback(async () => {
    const updated = await connector.disconnect();
    setWalletState({ ...updated });
  }, [connector]);

  const deploy = useCallback(async (): Promise<DeploymentResult> => {
    setIsDeploying(true);
    setDeployProgress(5);
    setDeployStep('Initiating 1AM Preprod deployment session...');
    try {
      const res = await deployer.deployWhistleContract((step, pct) => {
        setDeployStep(step);
        setDeployProgress(pct);
      });
      return res;
    } finally {
      setIsDeploying(false);
    }
  }, [deployer]);

  return {
    walletState,
    isWalletDetected,
    isConnecting,
    isDeploying,
    deployProgress,
    deployStep,
    connect,
    disconnect,
    deploy,
  };
}