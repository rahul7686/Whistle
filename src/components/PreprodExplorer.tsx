import React from 'react';
import {
  ExternalLink,
  Eye,
  EyeOff,
  Activity,
} from 'lucide-react';
import { WhistleSimulator } from '../midnight/whistleSimulator';

export const PreprodExplorer: React.FC = () => {
  const simulator = WhistleSimulator.getInstance();
  const reports = simulator.getReports();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-midnight-900 via-midnight-800 to-midnight-900 border border-midnight-700/80 p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-midnight-accent/10 text-midnight-accent text-xs font-bold border border-midnight-accent/30">
          <Activity className="w-3.5 h-3.5" />
          <span>Midnight Preprod On-Chain State</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Public Ledger Transparency Explorer
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Inspect the live dual-state ledger for Whistle on the Midnight Preprod Network. See exactly what is verified on the public blockchain vs. what remains strictly confidential.
        </p>
      </div>

      {/* Privacy Guarantee Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What observer CAN see */}
        <div className="bg-midnight-900/90 border border-emerald-500/40 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <Eye className="w-4 h-4" />
            <span>What an Observer CAN Verify (Public State)</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Verifiable Standing:</strong> Mathematical proof that reporter is in the member Merkle tree.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Category Nullifiers:</strong> Unique hash per member/category preventing spam and Sybils.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Lifecycle Progression:</strong> Real-time status (Submitted, Validated, Resolved, Dismissed).</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Bounty Escrow Conservation:</strong> Transparent on-chain balance and total bounties claimed.</span>
            </li>
          </ul>
        </div>

        {/* What observer CANNOT see */}
        <div className="bg-midnight-900/90 border border-purple-500/40 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
            <EyeOff className="w-4 h-4" />
            <span>What an Observer CANNOT Learn (Shielded ZK)</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 font-bold">•</span>
              <span><strong>Member Identity:</strong> No name, email, employee ID, or address is ever revealed.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 font-bold">•</span>
              <span><strong>Merkle Leaf Index:</strong> Observer cannot tell which member leaf generated the proof.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 font-bold">•</span>
              <span><strong>Reporter Wallet:</strong> Submission does not tie to a personal wallet address.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 font-bold">•</span>
              <span><strong>Bounty Recipient Linkage:</strong> Rewards are claimed to fresh 1AM addresses via ZK proofs.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Verified On-Chain Reports Table */}
      <div className="bg-midnight-900 border border-midnight-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-midnight-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              On-Chain Anonymous Report Registry
            </h3>
            <p className="text-xs text-slate-400">
              Synchronized with Midnight Preprod contract state.
            </p>
          </div>
          <a
            href="https://preprod.midnightexplorer.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-xs text-midnight-accent hover:underline font-mono"
          >
            <span>Open Midnight Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-midnight-950 text-slate-400 border-b border-midnight-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Nullifier Hash</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Bounty</th>
                <th className="py-3 px-4">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight-800 text-slate-300">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-midnight-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-midnight-accent font-sans">
                    #{report.reportNumber}
                  </td>
                  <td className="py-3.5 px-4 font-sans uppercase font-medium text-slate-200">
                    {report.category.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 select-all">
                    {report.nullifier.slice(0, 16)}...{report.nullifier.slice(-6)}
                  </td>
                  <td className="py-3.5 px-4 font-bold uppercase text-[11px]">
                    <span
                      className={
                        report.severity === 'critical'
                          ? 'text-rose-400'
                          : report.severity === 'high'
                          ? 'text-orange-400'
                          : 'text-amber-400'
                      }
                    >
                      {report.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-midnight-800 text-slate-300 border border-midnight-700">
                      {report.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    {report.bountyAmount > 0 ? report.bountyAmount + ' tNIGHT' : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 select-all font-mono text-[11px]">
                    <a
                      href={`https://preprod.midnightexplorer.com/transactions/${report.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-slate-400 hover:text-midnight-accent hover:underline"
                      title="View on Midnight Preprod Explorer"
                    >
                      <span>{report.txHash.slice(0, 10)}...{report.txHash.slice(-6)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};