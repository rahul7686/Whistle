import React from 'react';
import { X, Activity, Cpu, ShieldCheck, CheckCircle, Clock } from 'lucide-react';
import { WhistleSimulator } from '../midnight/whistleSimulator';

interface CircuitLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CircuitLogsModal: React.FC<CircuitLogsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const simulator = WhistleSimulator.getInstance();
  const logs = simulator.getCircuitLogs();

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-midnight-900 border border-midnight-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-midnight-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-midnight-accent" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Minokawa ZK Prover & Circuit Execution Inspector
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-midnight-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Log Entries */}
        <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-sans">
              No circuit executions recorded yet. Submit a report or review in the UI to generate live proofs!
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className="bg-midnight-950 border border-midnight-800 rounded-xl p-4 space-y-2.5 hover:border-midnight-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-midnight-850">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-midnight-accent font-sans uppercase">
                      {log.circuitName}()
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {log.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{log.timestamp}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Cpu className="w-3 h-3 text-midnight-accent" />
                      <span>{log.proofDurationMs}ms</span>
                    </span>
                  </div>
                </div>

                <div className="text-slate-300 font-sans text-xs">{log.details}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-midnight-900/60 p-2.5 rounded-lg border border-midnight-800 space-y-1">
                    <span className="text-slate-400 font-sans font-semibold">Public Inputs (On-Chain):</span>
                    <pre className="text-slate-300 text-[10px] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(log.publicInputs, null, 2)}
                    </pre>
                  </div>

                  <div className="bg-midnight-900/60 p-2.5 rounded-lg border border-midnight-800 space-y-1">
                    <span className="text-purple-400 font-sans font-semibold">
                      Private Witnesses (Hidden Locally):
                    </span>
                    <div className="space-y-1 text-slate-300 text-[10px]">
                      {log.privateWitnessKeys.map((w, i) => (
                        <div key={i} className="flex items-center space-x-1.5">
                          <span className="text-purple-400">•</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-midnight-800 bg-midnight-950/70 flex items-center justify-between text-[11px] text-slate-400">
          <span>Target Network: Midnight Preprod (Minokawa zk-SNARK Engine)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-midnight-800 text-slate-200 hover:text-white border border-midnight-700 text-xs font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
