import React from 'react';
import { User } from '../../types';

interface PendingApprovalsTabProps {
  pendingPayments: any[];
  pendingMembers: User[];
  onApprovePayment: (id: number) => void;
  onRejectPayment: (id: number) => void;
  onApproveMember: (id: number) => void;
  onRejectMember: (id: number) => void;
  onViewProof: (id: number) => void;
}

export const PendingApprovalsTab: React.FC<PendingApprovalsTabProps> = ({
  pendingPayments,
  pendingMembers,
  onApprovePayment,
  onRejectPayment,
  onApproveMember,
  onRejectMember,
  onViewProof,
}) => {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Pending Bank Transfers */}
      <div className="glass-card rounded-3xl p-6 border border-white/10">
        <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400">payments</span>
          Pending Bank Transfer Approvals ({pendingPayments.length})
        </h3>

        {pendingPayments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No pending bank transfer payments.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 text-xs text-slate-400 uppercase font-bold tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Tx ID</th>
                  <th className="px-6 py-4">Member Name</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Proof Receipt</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary">#{p.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{p.member_name}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">${p.amount}</td>
                    <td className="px-6 py-4 text-slate-300">{p.date}</td>
                    <td className="px-6 py-4">
                      {p.proof_file ? (
                        <button
                          type="button"
                          onClick={() => onViewProof(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/30"
                        >
                          View Receipt File
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">No File</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onApprovePayment(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectPayment(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Self-Registrations */}
      <div className="glass-card rounded-3xl p-6 border border-white/10">
        <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person_add</span>
          Pending Account Self-Registrations ({pendingMembers.length})
        </h3>

        {pendingMembers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No pending member self-registrations.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 text-xs text-slate-400 uppercase font-bold tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingMembers.map((m) => (
                  <tr key={m.user_id || m.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary">#{m.user_id || m.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{m.name}</td>
                    <td className="px-6 py-4 text-slate-300">{m.email}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">{m.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onApproveMember(m.user_id || m.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30"
                        >
                          Approve Registration
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectMember(m.user_id || m.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
