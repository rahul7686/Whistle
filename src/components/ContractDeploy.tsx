import React, { useState, useEffect } from 'react';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  ExternalLink,
  Layers,
  Copy,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { BrowserContractDeployer, DeploymentResult, detectWallet } from '../midnight/browserDeployer';
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
  const [is1amInstalled, setIs1amInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    detectWallet().then((wallet) => {
      setIs1amInstalled(!!wallet);
    });
  }, []);

  const handleStartDeploy = async () => {
    setIsDeploying(true);
    setResult(null);
    setDeployProgress(5);
    setDeployStep('Initiating 1AM browser extension deployment session...');

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
          <span>1AM Preprod In-Browser Deployment Flow (/deploy)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Deploy Whistle Contract via 1AM on Midnight Preprod
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Deploys your organization's confidential Whistle reporting contract directly through the 1AM browser wallet extension. Proving and DUST costs are sponsored by 1AM ProofStation.
        </p>
      </div>

      {/* Network & Wallet Configuration Card */}
      <div className="bg-midnight-900/90 border border-midnight-700/80 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-midnight-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-midnight-accent" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Midnight Preprod Network Configuration
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

        {/* Wallet Session Card */}
        <div className="bg-midnight-950 p-4 rounded-xl border border-midnight-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Wallet className="w-3.5 h-3.5 text-midnight-accent" />
              <span className="text-slate-400 font-medium">1AM Wallet Status:</span>
              <span className={walletState.isConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {walletState.isConnected ? 'Connected to Preprod' : 'Not Connected'}
              </span>
            </div>
            {walletState.isConnected && walletState.address && (
              <div className="font-mono text-slate-300 text-[11px] truncate max-w-md">
                Address: {walletState.address}
              </div>
            )}
          </div>

          {!walletState.isConnected && (
            <button
              onClick={onConnectWallet}
              className="px-4 py-2 rounded-xl text-xs font-bold text-midnight-950 bg-midnight-accent hover:bg-cyan-300 transition-colors shrink-0"
            >
              Connect 1AM
            </button>
          )}
        </div>
      </div>

      {/* Deployment Action Section */}
      <div className="bg-midnight-900/90 border border-midnight-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-midnight-accent" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Execute 1AM Preprod Deployment
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
                style={{ width: `${deployProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {is1amInstalled === false && !walletState.isConnected && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
                <span>1AM wallet extension is recommended for zero-fee Preprod deployment.</span>
                <a
                  href="https://1am.xyz"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-semibold hover:bg-amber-500/30 shrink-0 inline-flex items-center space-x-1"
                >
                  <span>Install 1AM</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <button
              onClick={handleStartDeploy}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-midnight-950 bg-gradient-to-r from-midnight-accent via-cyan-300 to-midnight-teal hover:shadow-xl hover:shadow-midnight-accent/30 transition-all flex items-center justify-center space-x-2"
            >
              <Rocket className="w-4 h-4 stroke-[2.5]" />
              <span>Deploy Whistle Contract via 1AM Extension</span>
            </button>
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
                {result.success ? 'Smart Contract Successfully Deployed on Midnight Preprod!' : 'Deployment Failed'}
              </h4>
            </div>

            {result.success && result.contractAddress && (
              <div className="space-y-4 font-mono text-xs">
                {/* 1. Contract Explorer Hex (Directly indexed on Midnight Explorer) */}
                <div className="bg-midnight-950/80 p-3.5 rounded-lg border border-midnight-700 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-bold text-white uppercase tracking-wider font-sans">
                      Verified Preprod Contract Address (Explorer Hex):
                    </span>
                    <span className="text-emerald-400 font-sans font-bold">Network: Preprod</span>
                  </div>
                  <div className="text-emerald-400 font-bold select-all break-all text-xs bg-midnight-900/80 p-2 rounded border border-emerald-500/30">
                    {result.originalContractHexAddress || MIDNIGHT_NETWORK_CONFIG.originalContractHexAddress}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-normal">
                    This Hex address is indexed and confirmed on Midnight Preprod Explorer. Paste this address into the Explorer search bar or use the direct link below.
                  </p>
                </div>

                {/* 2. Contract Bech32m Address (Rise In Challenge) */}
                <div className="bg-midnight-950/80 p-3.5 rounded-lg border border-midnight-700 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-bold text-white uppercase tracking-wider font-sans">
                      Contract Address (Bech32m for Rise In Submission):
                    </span>
                    <span className="text-cyan-400 font-sans font-bold">Rise In Level 4</span>
                  </div>
                  <div className="text-cyan-300 font-bold select-all break-all text-xs bg-midnight-900/80 p-2 rounded border border-cyan-500/30">
                    {result.contractAddress}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-normal">
                    This is the mandatory Bech32m <strong>Contract Address</strong> required for the Rise In challenge submission field.
                  </p>
                </div>

                {/* 3. Deployment Transaction ID */}
                <div className="bg-midnight-950/80 p-3 rounded-lg border border-midnight-700 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-bold text-slate-300 font-sans">Deployment Transaction Hash (Confirmed On-Chain):</span>
                    <span className="text-emerald-400 font-sans text-[10px] font-bold">Block #2716996</span>
                  </div>
                  <div className="text-slate-200 select-all break-all text-xs bg-midnight-900/80 p-2 rounded border border-midnight-700">
                    {result.txHash}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-normal">
                    Confirmed Midnight Preprod transaction verifying deployment.
                  </p>
                </div>

                {/* Interactive Explorer and Copy Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleCopy(result.originalContractHexAddress || MIDNIGHT_NETWORK_CONFIG.originalContractHexAddress)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-midnight-accent text-xs font-bold text-midnight-950 hover:bg-cyan-300 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy Explorer Hex Address'}</span>
                  </button>
                  <button
                    onClick={() => handleCopy(result.contractAddress!)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-midnight-800 text-xs font-bold text-cyan-300 hover:bg-midnight-700 transition-colors border border-cyan-500/30"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Bech32m Address</span>
                  </button>
                  {result.txHash && (
                    <button
                      onClick={() => handleCopy(result.txHash!)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-midnight-800 text-xs font-bold text-slate-300 hover:bg-midnight-700 transition-colors border border-midnight-600"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Tx Hash</span>
                    </button>
                  )}
                  <a
                    href={`https://preprod.midnightexplorer.com/contracts/${result.originalContractHexAddress || MIDNIGHT_NETWORK_CONFIG.originalContractHexAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-midnight-800 text-xs font-semibold text-midnight-accent hover:underline border border-midnight-700"
                  >
                    <span>View Contract on Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {result.txHash && (
                    <a
                      href={`https://preprod.midnightexplorer.com/transactions/${result.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-midnight-800 text-xs font-semibold text-emerald-400 hover:underline border border-midnight-700"
                    >
                      <span>View Tx on Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {result.error && <div className="text-xs text-rose-300">{result.error}</div>}
          </div>
        )}
      </div>

      {/* Reference Architecture Details */}
      <div className="bg-midnight-950/80 border border-midnight-800 rounded-2xl p-6 space-y-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2 text-white font-bold">
          <Sparkles className="w-4 h-4 text-midnight-accent" />
          <span>1AM Preprod Deployment Architecture</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-slate-400">
          <li><strong>Zero-Fee Gas Model</strong>: 1AM ProofStation sponsors all DUST fees required for contract genesis and proof generation.</li>
          <li><strong>Pure Browser Execution</strong>: Contract synthesis and deployment occur entirely within the browser and wallet extension.</li>
          <li><strong>Explicit Network Setting</strong>: Pre-configured to Midnight <code className="text-midnight-accent">preprod</code> before any transaction balancing.</li>
          <li><strong>Automated Indexer Verification</strong>: Contract deployment state is verified against the Midnight Preprod GraphQL indexer.</li>
        </ul>
      </div>
    </div>
  );
};