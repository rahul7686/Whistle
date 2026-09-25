import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { BrowserContractDeployer, DeploymentResult } from '../midnight/browserDeployer';
import { MIDNIGHT_NETWORK_CONFIG } from '../midnight/dappConnector';
import { LaceWalletState } from '../midnight/types';

interface ContractDeployProps {
  walletState: LaceWalletState;
  onConnectWallet: () => void;
}

export const ContractDeploy: React.FC<ContractDeployProps> = ({
  walletState,
  onConnectWallet,
}) => {
  const [deployer] = useState(() => new BrowserContractDeployer());
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployProgress, setDeployProgress] = useState<number>(0);
  const [deployStep, setDeployStep] = useState<string>('');
  const [result, setResult] = useState<DeploymentResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleStartDeploy = async () => {
    setIsDeploying(true);
    setResult(null);
    setDeployProgress(5);
    setDeployStep('Initiating in-browser 1AM Prover session...');

    const res = await deployer.deployWhistleContract((step, pct) => {
      setDeployStep(step);
      setDeployProgress(pct);
    });

    setResult(res);
    setIsDeploying(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-midnight-900 via-midnight-800 to-midnight-900 border border-midnight-700/80 p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-midnight-accent/10 text-midnight-accent text-xs font-bold border border-midnight-accent/30">
          <Rocket className="w-3.5 h-3.5" />
          <span>100% In-Browser 1AM Contract Deployment (/deploy)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Deploy Whistle Smart Contract to Midnight Preprod
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Deploy your organization's Whistle reporting instance directly through the 1AM browser extension.
          <strong className="text-midnight-accent font-semibold"> No server-side funded deployer wallet is required</strong>. The Minokawa ZK circuits and genesis Merkle root are synthesized in-browser.
        </p>
      </div>

      {/* Network Configuration Card */}
      <div className="bg-midnight-900/90 border border-midnight-700/80 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-midnight-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-midnight-accent" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Midnight Preprod Network Endpoints
            </h3>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Network ID: preprod
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-midnight-950 p-3 rounded-xl border border-midnight-800 space-y-1">
            <span className="text-slate-400 text-[11px]">Node RPC URI:</span>
            <div className="text-slate-200">{MIDNIGHT_NETWORK_CONFIG.nodeRpcUri}</div>
          </div>
          <div className="bg-midnight-950 p-3 rounded-xl border border-midnight-800 space-y-1">
            <span className="text-slate-400 text-[11px]">Indexer GraphQL URI:</span>
            <div className="text-slate-200">{MIDNIGHT_NETWORK_CONFIG.indexerUri}</div>
          </div>
        </div>

        {/* Existing Active Contract Address */}
        <div className="bg-midnight-950 p-4 rounded-xl border border-midnight-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Currently Verified Preprod Contract:</span>
            <span className="text-[11px] text-midnight-accent font-mono font-bold">Bech32m Format</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-emerald-400 select-all break-all">
              {MIDNIGHT_NETWORK_CONFIG.contractAddress}
            </span>
            <button
              onClick={() => handleCopy(MIDNIGHT_NETWORK_CONFIG.contractAddress)}
              className="px-2.5 py-1 rounded-lg bg-midnight-800 text-slate-300 hover:text-white border border-midnight-700 shrink-0 text-xs"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Deployment Action Section */}
      <div className="bg-midnight-900/90 border border-midnight-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-midnight-accent" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Execute In-Browser Contract Deployment
          </h3>
        </div>

        {isDeploying ? (
          <div className="space-y-4 bg-midnight-950 p-6 rounded-xl border border-midnight-accent/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-midnight-accent font-bold">{deployStep}</span>
              <span className="text-slate-400 font-mono">{deployProgress}%</span>
            </div>
            <div className="w-full bg-midnight-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-midnight-accent via-cyan-300 to-midnight-teal h-full transition-all duration-300"
                style={{ width: deployProgress + '%' }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {walletState.isConnected ? (
              <button
                onClick={handleStartDeploy}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-midnight-950 bg-gradient-to-r from-midnight-accent via-cyan-300 to-midnight-teal hover:shadow-xl hover:shadow-midnight-accent/30 transition-all flex items-center justify-center space-x-2"
              >
                <Rocket className="w-4 h-4 stroke-[2.5]" />
                <span>Deploy Whistle Contract via 1AM Extension</span>
              </button>
            ) : (
              <button
                onClick={onConnectWallet}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-midnight-950 bg-gradient-to-r from-midnight-accent to-cyan-300 transition-all flex items-center justify-center space-x-2"
              >
                <span>Connect 1AM Wallet to Deploy</span>
              </button>
            )}
          </div>
        )}

        {/* Deployment Result */}
        {result && (
          <div
            className={
              'p-6 rounded-xl border space-y-4 ' +
              (result.success
                ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-200'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300')
            }
          >
            <div className="flex items-center space-x-3">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <h4 className="font-bold text-sm">
                {result.success ? 'Smart Contract Successfully Deployed on Preprod!' : 'Deployment Failed'}
              </h4>
            </div>

            {result.success && result.contractAddress && (
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-midnight-950/80 p-3 rounded-lg border border-midnight-750 space-y-1">
                  <span className="text-slate-400 text-[11px]">Deployed Bech32m Address:</span>
                  <div className="text-emerald-400 font-bold select-all break-all">{result.contractAddress}</div>
                </div>

                <div className="bg-midnight-950/80 p-3 rounded-lg border border-midnight-750 space-y-1">
                  <span className="text-slate-400 text-[11px]">Deployment Transaction Hash:</span>
                  <div className="text-slate-300 select-all break-all">{result.txHash}</div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => handleCopy(result.contractAddress!)}
                    className="px-3 py-1.5 rounded-lg bg-midnight-800 text-xs font-semibold text-slate-200 hover:text-white border border-midnight-700"
                  >
                    Copy Address
                  </button>
                  <a
                    href="https://preprod.midnightexplorer.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-midnight-800 text-xs font-semibold text-midnight-accent hover:underline border border-midnight-700"
                  >
                    <span>Inspect on Midnight Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {result.error && <div className="text-xs text-rose-300">{result.error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};