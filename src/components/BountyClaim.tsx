import React, { useState } from 'react';
import {
  Gift,
  Key,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { WhistleSimulator, computeCategoryNullifier } from '../midnight/whistleSimulator';
import { LaceWalletState, WhistleReport } from '../midnight/types';

interface BountyClaimProps {
  walletState: LaceWalletState;
  onConnectWallet: () => void;
  onClaimSuccess?: () => void;
}

export const BountyClaim: React.FC<BountyClaimProps> = ({
  walletState,
  onConnectWallet,
  onClaimSuccess,
}) => {
  const simulator = WhistleSimulator.getInstance();
  const [inputReceiptKey, setInputReceiptKey] = useState<string>('');
  const [matchedReport, setMatchedReport] = useState<WhistleReport | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimProgress, setClaimProgress] = useState<string>('');
  const [claimResult, setClaimResult] = useState<{ txHash: string; amount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearchReceipt = () => {
    setErrorMessage(null);
    setClaimResult(null);
    const cleaned = inputReceiptKey.trim();
    if (!cleaned) {
      setErrorMessage('Please enter your secret witness key or paste the receipt JSON.');
      return;
    }

    setIsSearching(true);
    try {
      let secret = cleaned;
      if (cleaned.startsWith('{')) {
        const parsed = JSON.parse(cleaned);
        secret = parsed.secretKey || '';
      }

      const allReports = simulator.getReports();
      let found: WhistleReport | null = null;

      for (const r of allReports) {
        const derived = computeCategoryNullifier(secret, r.categoryId);
        if (derived === r.nullifier) {
          found = r;
          break;
        }
      }

      if (!found) {
        setErrorMessage('No submitted report found matching this secret key. Ensure the credentials are exact.');
        setMatchedReport(null);
      } else {
        setMatchedReport(found);
      }
    } catch (e: any) {
      setErrorMessage('Failed to parse input: ' + e.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExecuteClaim = async () => {
    if (!matchedReport) return;
    if (!walletState.isConnected || !walletState.address) {
      setErrorMessage('Please connect your 1AM wallet to receive your shielded bounty.');
      return;
    }

    let secret = inputReceiptKey.trim();
    if (secret.startsWith('{')) {
      secret = JSON.parse(secret).secretKey;
    }

    setErrorMessage(null);
    setIsClaiming(true);

    try {
      setClaimProgress('Verifying nullifier knowledge in Minokawa ZK circuit...');
      await new Promise((r) => setTimeout(r, 600));

      setClaimProgress('Validating organization escrow balance on Midnight Preprod...');
      await new Promise((r) => setTimeout(r, 600));

      setClaimProgress('Disbursing shielded tNIGHT bounty to destination wallet...');
      const res = simulator.claimBounty(matchedReport.id, secret, walletState.address);

      setClaimResult({ txHash: res.txHash, amount: res.amountClaimed });
      setMatchedReport(simulator.getReports().find((r) => r.id === matchedReport.id) || null);
      onClaimSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to claim anonymous bounty.');
    } finally {
      setIsClaiming(false);
      setClaimProgress('');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-midnight-900 via-midnight-800 to-midnight-900 border border-midnight-700/80 p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-midnight-accent/10 text-midnight-accent text-xs font-bold border border-midnight-accent/30">
          <Gift className="w-3.5 h-3.5" />
          <span>Anonymous Bounty Escrow Claim</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Claim Verified Whistleblower Bounty
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          When an organization or DAO validates your report as legitimate, escrow funds are released. You can prove you filed the report using your <strong className="text-midnight-accent font-semibold">secret witness key</strong> and withdraw the reward to any clean 1AM wallet without linking back to your real identity.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-midnight-900/90 border border-midnight-700/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <label className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center space-x-2">
          <Key className="w-4 h-4 text-midnight-accent" />
          <span>Enter Secret Witness Key or Paste Claim Receipt</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputReceiptKey}
            onChange={(e) => setInputReceiptKey(e.target.value)}
            placeholder="e.g. whistle_secret_beta_31a77d1 or paste full JSON receipt"
            className="flex-1 bg-midnight-950 border border-midnight-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-midnight-accent"
          />
          <button
            onClick={handleSearchReceipt}
            disabled={isSearching}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-midnight-950 bg-gradient-to-r from-midnight-accent to-cyan-300 hover:shadow-lg hover:shadow-midnight-accent/25 transition-all shrink-0"
          >
            {isSearching ? 'Inspecting Chain...' : 'Check Status'}
          </button>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-3 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Claim Success Banner */}
        {claimResult && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-6 space-y-3">
            <div className="flex items-center space-x-3 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Bounty Claim Successfully Disbursed!</span>
            </div>
            <p className="text-xs text-slate-300">
              {claimResult.amount} tNIGHT has been transferred to your connected 1AM wallet without deanonymizing your membership leaf.
            </p>
            <div className="text-[11px] font-mono text-slate-400 break-all select-all">
              Claim Transaction Hash: {claimResult.txHash}
            </div>
          </div>
        )}

        {/* Matched Report Info Card */}
        {matchedReport && (
          <div className="bg-midnight-950 border border-midnight-700 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-midnight-800">
              <div>
                <span className="text-xs font-mono text-midnight-accent font-bold">
                  Report #{matchedReport.reportNumber}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{matchedReport.title}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-midnight-800 text-slate-300 border border-midnight-700">
                  Status: {matchedReport.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-midnight-900/60 p-3 rounded-xl border border-midnight-800 space-y-1">
                <span className="text-[11px] text-slate-400">Assigned Bounty</span>
                <div className="text-base font-extrabold text-midnight-accent font-mono">
                  {matchedReport.bountyAmount} tNIGHT
                </div>
              </div>
              <div className="bg-midnight-900/60 p-3 rounded-xl border border-midnight-800 space-y-1">
                <span className="text-[11px] text-slate-400">Claim Status</span>
                <div className="text-sm font-bold font-mono">
                  {matchedReport.isBountyClaimed ? (
                    <span className="text-purple-400">Already Claimed</span>
                  ) : matchedReport.bountyAmount > 0 ? (
                    <span className="text-emerald-400">Ready to Claim</span>
                  ) : (
                    <span className="text-slate-400">Awaiting Bounty</span>
                  )}
                </div>
              </div>
              <div className="bg-midnight-900/60 p-3 rounded-xl border border-midnight-800 space-y-1">
                <span className="text-[11px] text-slate-400">Category</span>
                <div className="text-xs font-bold text-white uppercase">
                  {matchedReport.category.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Action to Claim */}
            {matchedReport.status === 'validated' && !matchedReport.isBountyClaimed && (
              <div className="pt-2 space-y-3">
                {walletState.isConnected ? (
                  <button
                    onClick={handleExecuteClaim}
                    disabled={isClaiming}
                    className="w-full py-3 rounded-xl font-bold text-xs text-midnight-950 bg-gradient-to-r from-emerald-400 via-midnight-accent to-cyan-300 hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isClaiming ? claimProgress : 'Claim ' + matchedReport.bountyAmount + ' tNIGHT Bounty into 1AM Wallet'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={onConnectWallet}
                    className="w-full py-3 rounded-xl font-bold text-xs text-midnight-950 bg-gradient-to-r from-midnight-accent to-cyan-300 transition-all flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-4 h-4 stroke-[2.5]" />
                    <span>Connect 1AM Wallet to Receive Bounty</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};