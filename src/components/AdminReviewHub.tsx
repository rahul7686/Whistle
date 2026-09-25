import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  ShieldCheck,
  UserPlus,
  Gift,
  Filter,
  Check,
  XCircle,
} from 'lucide-react';
import { WhistleSimulator } from '../midnight/whistleSimulator';
import { WhistleReport, ReportStatus, MemberIdentity } from '../midnight/types';

interface AdminReviewHubProps {
  onStateChanged?: () => void;
}

export const AdminReviewHub: React.FC<AdminReviewHubProps> = ({ onStateChanged }) => {
  const simulator = WhistleSimulator.getInstance();
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'roster'>('reports');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New member form
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<string>('');
  const [newMemberDept, setNewMemberDept] = useState<string>('');
  const [recentlyAddedMember, setRecentlyAddedMember] = useState<MemberIdentity | null>(null);

  // Review modal state
  const [selectedReport, setSelectedReport] = useState<WhistleReport | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ReportStatus>('validated');
  const [bountyInput, setBountyInput] = useState<number>(1500);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const reports = simulator.getReports();
  const members = simulator.getMembers();
  const ledgerState = simulator.getLedgerState();

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim()) return;

    const { newMember } = simulator.addMember(
      newMemberName.trim(),
      newMemberRole.trim(),
      newMemberDept.trim() || 'General'
    );
    setRecentlyAddedMember(newMember);
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberDept('');
    onStateChanged?.();
  };

  const handleApplyReview = () => {
    if (!selectedReport) return;
    simulator.reviewReport(selectedReport.id, reviewStatus, bountyInput);
    setActionSuccess('Report #' + selectedReport.reportNumber + ' updated to ' + reviewStatus.toUpperCase());
    setSelectedReport(null);
    onStateChanged?.();
    setTimeout(() => setActionSuccess(null), 3500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-midnight-900 border border-midnight-700/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Roster Members</span>
            <Users className="w-4 h-4 text-midnight-accent" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{members.length}</div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
            <span>Merkle Tree Verified</span>
          </div>
        </div>

        <div className="bg-midnight-900 border border-midnight-700/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Reports</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{reports.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">100% Zero-Knowledge</div>
        </div>

        <div className="bg-midnight-900 border border-midnight-700/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Validated & Rewarded</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {reports.filter((r) => r.status === 'validated' || r.status === 'resolved').length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Bounties Authorized</div>
        </div>

        <div className="bg-midnight-900 border border-midnight-700/80 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Escrow Pool</span>
            <Gift className="w-4 h-4 text-midnight-accent" />
          </div>
          <div className="text-2xl font-extrabold text-midnight-accent font-mono">
            {ledgerState.totalBountyEscrow} <span className="text-xs text-slate-400">tNIGHT</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Whistleblower Escrow</div>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-3 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-midnight-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('reports')}
            className={
              'px-4 py-2 rounded-xl text-xs font-bold transition-all ' +
              (activeSubTab === 'reports'
                ? 'bg-midnight-accent/15 text-midnight-accent border border-midnight-accent/40'
                : 'text-slate-400 hover:text-white')
            }
          >
            {'Review Queue (' + reports.length + ')'}
          </button>
          <button
            onClick={() => setActiveSubTab('roster')}
            className={
              'px-4 py-2 rounded-xl text-xs font-bold transition-all ' +
              (activeSubTab === 'roster'
                ? 'bg-midnight-accent/15 text-midnight-accent border border-midnight-accent/40'
                : 'text-slate-400 hover:text-white')
            }
          >
            {'Membership Roster & Merkle Tree (' + members.length + ')'}
          </button>
        </div>

        {activeSubTab === 'reports' && (
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-midnight-900 border border-midnight-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="validated">Validated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab Content 1: Reports Queue */}
      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm bg-midnight-900/40 rounded-2xl border border-midnight-800">
              No reports found matching criteria.
            </div>
          ) : (
            filteredReports.map((report) => {
              const statusColors: Record<string, string> = {
                submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                validated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                resolved: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                dismissed: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
              };

              const severityColors: Record<string, string> = {
                low: 'text-blue-400',
                medium: 'text-amber-400',
                high: 'text-orange-400',
                critical: 'text-rose-400',
              };

              return (
                <div
                  key={report.id}
                  className="bg-midnight-900 border border-midnight-700/70 rounded-2xl p-6 space-y-4 hover:border-midnight-600 transition-all shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-midnight-800">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold text-midnight-accent px-2 py-0.5 rounded bg-midnight-800 border border-midnight-700">
                        #{report.reportNumber}
                      </span>
                      <h4 className="text-base font-bold text-white tracking-tight">{report.title}</h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ' + statusColors[report.status]}>
                        {report.status.replace('_', ' ')}
                      </span>
                      <span className={'text-[10px] font-bold uppercase tracking-wider font-mono ' + severityColors[report.severity]}>
                        [{report.severity}]
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-midnight-950/60 p-4 rounded-xl border border-midnight-800">
                    {report.encryptedSummary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                    <div className="bg-midnight-950 p-2.5 rounded-lg border border-midnight-800 space-y-1">
                      <div className="text-slate-400 flex items-center justify-between">
                        <span>Verifiable Nullifier:</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-slate-300 break-all select-all">{report.nullifier}</div>
                    </div>

                    <div className="bg-midnight-950 p-2.5 rounded-lg border border-midnight-800 space-y-1">
                      <div className="text-slate-400 flex items-center justify-between">
                        <span>Standing Proof Snapshot Root:</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Valid Merkle Leaf</span>
                      </div>
                      <div className="text-slate-300 break-all select-all">{report.merkleRootSnapshot}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-slate-400 flex items-center space-x-4">
                      <span>Submitted: {new Date(report.timestamp).toLocaleDateString()}</span>
                      {report.bountyAmount > 0 && (
                        <span className="text-emerald-400 font-bold font-mono">
                          Bounty: {report.bountyAmount} tNIGHT {report.isBountyClaimed && '(Claimed)'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setReviewStatus(report.status === 'submitted' ? 'validated' : report.status);
                        setBountyInput(report.bountyAmount || 1500);
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-midnight-800 border border-midnight-700 hover:border-midnight-accent/40 hover:text-midnight-accent transition-all"
                    >
                      Update Status / Allocate Bounty
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content 2: Membership Roster */}
      {activeSubTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-midnight-900 border border-midnight-700/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Authorized Member Roster
                  </h3>
                  <p className="text-xs text-slate-400">
                    Members eligible to generate zero-knowledge standing proofs.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-midnight-accent bg-midnight-800 px-3 py-1 rounded-full border border-midnight-700">
                  {members.length} Credentialed
                </span>
              </div>

              <div className="space-y-3">
                {members.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-4 rounded-xl bg-midnight-950 border border-midnight-800 space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm font-sans">{mem.name}</span>
                      <span className="text-[10px] text-midnight-accent bg-midnight-900 px-2 py-0.5 rounded border border-midnight-700 font-sans font-semibold">
                        {mem.role} ({mem.department})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                      <div className="flex justify-between">
                        <span>Merkle Leaf Commitment:</span>
                        <span className="text-slate-300">{mem.commitment.slice(0, 24)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Secret Credential:</span>
                        <span className="text-emerald-400">{mem.secretKey.slice(0, 24)}...</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Member Form */}
          <div className="space-y-4">
            <form onSubmit={handleAddMember} className="bg-midnight-900 border border-midnight-700/80 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 pb-2 border-b border-midnight-800">
                <UserPlus className="w-4 h-4 text-midnight-accent" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Onboard New Member
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Full Name / Member Tag</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Lead Security Researcher"
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-midnight-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Role Title</label>
                <input
                  type="text"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="e.g. Security Specialist"
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-midnight-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">Department / Group</label>
                <input
                  type="text"
                  value={newMemberDept}
                  onChange={(e) => setNewMemberDept(e.target.value)}
                  placeholder="e.g. Protocol Infrastructure"
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-midnight-accent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-midnight-950 bg-gradient-to-r from-midnight-accent to-cyan-300 hover:shadow-lg hover:shadow-midnight-accent/25 transition-all"
              >
                Register & Recompute Merkle Root
              </button>
            </form>

            {recentlyAddedMember && (
              <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 space-y-2 text-xs font-mono">
                <div className="text-emerald-400 font-bold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Member Registered On-Chain!</span>
                </div>
                <div className="text-slate-300 text-[11px]">
                  <strong>Secret Key:</strong> {recentlyAddedMember.secretKey}
                </div>
                <div className="text-slate-400 text-[10px]">
                  Share this secret key securely with the member so they can generate valid standing proofs.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-900 border border-midnight-700 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-midnight-800">
              <h3 className="text-base font-bold text-white">
                Review Report #{selectedReport.reportNumber}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">Update Lifecycle Status</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as ReportStatus)}
                className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-midnight-accent"
              >
                <option value="under_review">Under Review</option>
                <option value="validated">Validated (Legitimate Report)</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed (No Action)</option>
              </select>
            </div>

            {reviewStatus === 'validated' && (
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Allocate Bounty from Escrow (tNIGHT)
                </label>
                <input
                  type="number"
                  value={bountyInput}
                  onChange={(e) => setBountyInput(Number(e.target.value))}
                  min={0}
                  step={100}
                  className="w-full bg-midnight-950 border border-midnight-700 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-midnight-accent font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Whistleblower can claim this reward anonymously using their proof receipt.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-midnight-800">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyReview}
                className="px-5 py-2 rounded-xl text-xs font-bold text-midnight-950 bg-gradient-to-r from-midnight-accent to-cyan-300 hover:shadow-lg hover:shadow-midnight-accent/30 transition-all"
              >
                Commit Status to Chain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};