import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  Fingerprint,
  FileText,
  DollarSign,
  Vote,
  Sparkles,
  ChevronRight,
  Cpu,
  ExternalLink,
} from 'lucide-react';
import {
  WhistleSimulator,
  CATEGORIES_LIST,
  computeCategoryNullifier,
  computeLeafCommitment,
} from '../midnight/whistleSimulator';
import { ReportSeverity, ClaimReceipt, WhistleReport } from '../midnight/types';

interface WhistleblowerSubmitProps {
  onReportSubmitted?: () => void;
  onNavigateToClaim?: (receipt: ClaimReceipt) => void;
}

export const WhistleblowerSubmit: React.FC<WhistleblowerSubmitProps> = ({
  onReportSubmitted,
  onNavigateToClaim,
}) => {
  const simulator = WhistleSimulator.getInstance();
  const members = simulator.getMembers();

  // Form states
  const [selectedMemberSecret, setSelectedMemberSecret] = useState<string>(members[0]?.secretKey || '');
  const [customSecret, setCustomSecret] = useState<string>('');
  const [useCustomSecret, setUseCustomSecret] = useState<boolean>(false);

  const [categoryId, setCategoryId] = useState<number>(1);
  const [severity, setSeverity] = useState<ReportSeverity>('high');
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [evidence, setEvidence] = useState<string>('');

  // Execution states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [provingStep, setProvingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<ClaimReceipt | null>(null);
  const [completedReport, setCompletedReport] = useState<WhistleReport | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const activeSecretKey = useCustomSecret ? customSecret.trim() : selectedMemberSecret;
  const activeNullifier = activeSecretKey ? computeCategoryNullifier(activeSecretKey, categoryId) : 'N/A';
  const activeCommitment = activeSecretKey ? computeLeafCommitment(activeSecretKey) : 'N/A';

  const categoryIcons: Record<string, any> = {
    financial_fraud: DollarSign,
    security: ShieldAlert,
    misconduct: AlertTriangle,
    governance: Vote,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setErrorMessage('Please provide a title and detailed summary for your report.');
      return;
    }
    if (!activeSecretKey) {
      setErrorMessage('A valid member secret key is required to prove your organization standing.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      setProvingStep('Fetching local witness & building Merkle membership proof...');
      await new Promise((r) => setTimeout(r, 600));

      setProvingStep('Synthesizing Minokawa ZK circuit constraints in-browser...');
      await new Promise((r) => setTimeout(r, 700));

      setProvingStep('Deriving deterministic anti-spam category nullifier...');
      await new Promise((r) => setTimeout(r, 500));

      setProvingStep('Broadcasting anonymous shielded transaction to Midnight Preprod...');
      const { report, receipt } = await simulator.submitReport(
        activeSecretKey,
        categoryId,
        severity,
        title,
        summary,
        evidence
      );

      setCompletedReceipt(receipt);
      setCompletedReport(report);
      onReportSubmitted?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit anonymous report.');
    } finally {
      setIsSubmitting(false);
      setProvingStep('');
    }
  };

  const handleCopyReceipt = () => {
    if (!completedReceipt) return;
    navigator.clipboard.writeText(JSON.stringify(completedReceipt, null, 2));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDownloadReceipt = () => {
    if (!completedReceipt) return;
    const blob = new Blob([JSON.stringify(completedReceipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whistle_claim_receipt_rep_' + completedReceipt.reportNumber + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setEvidence('');
    setCompletedReceipt(null);
    setCompletedReport(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Banner with Privacy Guarantee */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-midnight-900 via-midnight-800 to-midnight-900 border border-midnight-700/80 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-midnight-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-midnight-accent/10 text-midnight-accent text-xs font-bold border border-midnight-accent/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Standing Guarantee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              File a Verifiable Anonymous Report
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Whistle uses Midnight's dual-state ZK architecture to mathematically prove you belong to this organization's credentialed roster — <strong className="text-midnight-accent font-semibold">without ever disclosing your identity, wallet address, or roster leaf</strong>.
            </p>
          </div>
          <div className="bg-midnight-950/70 p-4 rounded-xl border border-midnight-700/70 space-y-2 min-w-[240px]">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
              <span>Active Org Root</span>
              <span className="text-emerald-400 font-mono">Verified</span>
            </div>
            <div className="text-xs font-mono text-slate-200 bg-midnight-900 p-2 rounded-lg border border-midnight-800 break-all select-all">
              {simulator.getMembershipRoot().slice(0, 20)}...
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Credentialed Members:</span>
              <span className="text-midnight-accent font-bold font-mono">{members.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Dialog / Receipt */}
      {completedReceipt && completedReport ? (
        <div className="bg-midnight-900/90 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl shadow-emerald-950/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Anonymous Report #{completedReceipt.reportNumber} Proven & Broadcasted</span>
              </h3>
              <p className="text-xs text-slate-300">
                Your report has been securely registered on Midnight Preprod. Keep your <strong>Claim Receipt</strong> safe — it is your cryptographic key to monitor status and claim anonymous bounty rewards!
              </p>
            </div>
          </div>

          {/* Receipt Data Box */}
          <div className="bg-midnight-950 rounded-xl border border-midnight-700 p-4 space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-midnight-800">
              <span className="text-slate-400">Public Report Nullifier:</span>
              <span className="text-midnight-accent select-all break-all">{completedReceipt.nullifier}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-midnight-800">
              <span className="text-slate-400">Preprod Transaction Hash:</span>
              <span className="text-slate-300 select-all break-all">{completedReceipt.txHash}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-midnight-800">
              <span className="text-slate-400">Category & Severity:</span>
              <span className="text-amber-400 uppercase font-bold">{completedReport.category.replace('_', ' ')} ({completedReport.severity})</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-400">Secret Witness Key (Private to You):</span>
              <span className="text-emerald-400 select-all break-all">{completedReceipt.secretKey}</span>
            </div>
          </div>

          {/* Receipt Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyReceipt}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-midnight-800 border border-midnight-700 hover:border-midnight-accent/50 hover:bg-midnight-700 transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-midnight-accent" />
              <span>{copiedKey ? 'Receipt Copied!' : 'Copy Full Receipt JSON'}</span>
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-midnight-800 border border-midnight-700 hover:border-midnight-accent/50 hover:bg-midnight-700 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-midnight-accent" />
              <span>Download Receipt File</span>
            </button>
            {completedReceipt.txHash && (
              <a
                href={`https://preprod.midnightexplorer.com/transactions/${completedReceipt.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-midnight-800 border border-midnight-700 hover:text-midnight-accent hover:bg-midnight-700 transition-all"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 text-midnight-accent" />
              </a>
            )}
            {onNavigateToClaim && (
              <button
                onClick={() => onNavigateToClaim(completedReceipt)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-midnight-950 bg-gradient-to-r from-midnight-accent to-cyan-300 hover:shadow-lg hover:shadow-midnight-accent/25 transition-all"
              >
                <span>Track or Claim Bounty</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={resetForm}
              className="ml-auto text-xs text-slate-400 hover:text-white underline underline-offset-4"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        /* Report Form */
        <form onSubmit={handleSubmit} className="bg-midnight-900/90 border border-midnight-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-4 flex items-start space-x-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Submission Blocked</div>
                <div className="mt-0.5">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Section 1: Verifiable Standing Credentials */}
          <div className="space-y-4 pb-6 border-b border-midnight-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-midnight-accent" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Step 1: Your Standing Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUseCustomSecret(!useCustomSecret)}
                className="text-[11px] text-midnight-accent hover:underline font-medium"
              >
                {useCustomSecret ? '← Select Pre-Seeded Roster Identity' : 'Paste Custom Secret Key →'}
              </button>
            </div>

            {useCustomSecret ? (
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Custom Secret Witness Key</label>
                <input
                  type="text"
                  value={customSecret}
                  onChange={(e) => setCustomSecret(e.target.value)}
                  placeholder="e.g. whistle_secret_alpha_89f02c4"
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-midnight-accent"
                />
                <p className="text-[11px] text-slate-400">
                  Must be a valid member secret belonging to the organization's Merkle tree.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Simulated Authorized Identity</label>
                <select
                  value={selectedMemberSecret}
                  onChange={(e) => setSelectedMemberSecret(e.target.value)}
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-midnight-accent"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.secretKey}>
                      {m.name} — {m.role} ({m.department})
                    </option>
                  ))}
                </select>
                <div className="bg-midnight-950/60 p-3 rounded-xl border border-midnight-800 text-[11px] space-y-1 font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Leaf Commitment:</span>
                    <span className="text-slate-300">{activeCommitment.slice(0, 22)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category Nullifier:</span>
                    <span className="text-midnight-accent">{activeNullifier.slice(0, 22)}...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Report Classification */}
          <div className="space-y-4 pb-6 border-b border-midnight-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-midnight-accent" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Step 2: Category & Severity Classification
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES_LIST.map((cat) => {
                const Icon = categoryIcons[cat.slug] || FileText;
                const isSelected = categoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={
                      'cursor-pointer p-4 rounded-xl border transition-all ' +
                      (isSelected
                        ? 'bg-midnight-accent/10 border-midnight-accent/70 shadow-md shadow-midnight-accent/10'
                        : 'bg-midnight-950/60 border-midnight-700/60 hover:border-midnight-600')
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={'w-4 h-4 ' + (isSelected ? 'text-midnight-accent' : 'text-slate-400')} />
                        <span className={'text-xs font-bold ' + (isSelected ? 'text-white' : 'text-slate-300')}>
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-midnight-800 text-midnight-accent border border-midnight-700">
                        ~{cat.defaultBountyTier} tNIGHT
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Severity Radio */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-300 font-medium">Assessed Threat Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as ReportSeverity[]).map((sev) => {
                  const isSel = severity === sev;
                  const colors: Record<string, string> = {
                    low: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
                    medium: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
                    high: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
                    critical: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
                  };
                  return (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={
                        'py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ' +
                        (isSel ? colors[sev] : 'bg-midnight-950 border-midnight-800 text-slate-400 hover:bg-midnight-800')
                      }
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Report Content */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-midnight-accent" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Step 3: Confidential Report Information
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">Incident Subject / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unauthorized withdrawal from community treasury escrow pool"
                className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-midnight-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">
                Detailed Narrative & Factual Evidence
              </label>
              <textarea
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Provide objective facts, transaction timestamps, internal links, or communications. Do not disclose personal identifiers if you wish to remain strictly anonymous."
                className="w-full bg-midnight-950 border border-midnight-700 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-midnight-accent resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>Supporting Proof / Evidence Hash (Optional)</span>
                <span className="text-[10px] text-slate-500 font-normal">SHA256 / IPFS CID / Log snippet</span>
              </label>
              <input
                type="text"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="e.g. QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco or transaction hash"
                className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-4 py-2 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-midnight-accent"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 space-y-4">
            {isSubmitting && (
              <div className="bg-midnight-950 border border-midnight-accent/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-midnight-accent text-xs font-bold">
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>{provingStep}</span>
                </div>
                <div className="w-full bg-midnight-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-midnight-accent to-cyan-300 h-full w-2/3 animate-pulse" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-midnight-950 bg-gradient-to-r from-midnight-accent via-cyan-300 to-midnight-teal hover:shadow-xl hover:shadow-midnight-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Generating ZK Proof & Broadcasting...' : 'Submit Anonymous Report in Zero-Knowledge'}</span>
            </button>
            <p className="text-center text-[11px] text-slate-400">
              Transaction is executed on Midnight Preprod. Your identity is guaranteed confidential by Minokawa zk-SNARKs.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};