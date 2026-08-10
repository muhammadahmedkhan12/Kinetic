import React from 'react';
import { User } from '../../types';

interface OverviewTabProps {
  stats: {
    total_members: number;
    total_trainers: number;
    total_payments: number;
    total_assets: number;
    monthly_revenue: number;
  };
  pendingPayments: any[];
  pendingMembers: User[];
  onApprovePayment: (id: number) => void;
  onRejectPayment: (id: number) => void;
  onApproveMember: (id: number) => void;
  onRejectMember: (id: number) => void;
  onViewProof: (id: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actionLoadingId?: string | null;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  pendingPayments,
  pendingMembers,
  onApprovePayment,
  onRejectPayment,
  onApproveMember,
  onRejectMember,
  onViewProof,
  onRefresh,
  isRefreshing = false,
  actionLoadingId = null,
}) => {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members Card */}
        <div className="bg-[#121214] p-6 rounded-xl border border-[#27272A] text-center transition-colors hover:border-[#3F3F46] flex flex-col items-center justify-center min-h-[110px]">
          {isRefreshing ? (
            <div className="w-14 h-9 rounded-lg bg-[#C5A880]/30 animate-pulse blur-[3px] mb-1.5" />
          ) : (
            <span className="text-[2.2rem] font-extrabold text-[#C5A880] font-headline block mb-1">
              {stats.total_members}
            </span>
          )}
          <span className="text-[0.72rem] font-bold text-[#52525B] uppercase tracking-[0.1em] font-headline">
            TOTAL MEMBERS
          </span>
        </div>

        {/* Trainers Card */}
        <div className="bg-[#121214] p-6 rounded-xl border border-[#27272A] text-center transition-colors hover:border-[#3F3F46] flex flex-col items-center justify-center min-h-[110px]">
          {isRefreshing ? (
            <div className="w-14 h-9 rounded-lg bg-[#C5A880]/30 animate-pulse blur-[3px] mb-1.5" />
          ) : (
            <span className="text-[2.2rem] font-extrabold text-[#C5A880] font-headline block mb-1">
              {stats.total_trainers}
            </span>
          )}
          <span className="text-[0.72rem] font-bold text-[#52525B] uppercase tracking-[0.1em] font-headline">
            TRAINERS
          </span>
        </div>

        {/* Revenue Card */}
        <div className="bg-[#121214] p-6 rounded-xl border border-[#27272A] text-center transition-colors hover:border-[#3F3F46] flex flex-col items-center justify-center min-h-[110px]">
          {isRefreshing ? (
            <div className="w-28 h-9 rounded-lg bg-[#C5A880]/30 animate-pulse blur-[3px] mb-1.5" />
          ) : (
            <span className="text-[2.2rem] font-extrabold text-[#C5A880] font-headline block mb-1">
              ${stats.monthly_revenue.toFixed(2)}
            </span>
          )}
          <span className="text-[0.72rem] font-bold text-[#52525B] uppercase tracking-[0.1em] font-headline">
            REVENUE (THIS MONTH)
          </span>
        </div>

        {/* Equipment Assets Card */}
        <div className="bg-[#121214] p-6 rounded-xl border border-[#27272A] text-center transition-colors hover:border-[#3F3F46] flex flex-col items-center justify-center min-h-[110px]">
          {isRefreshing ? (
            <div className="w-14 h-9 rounded-lg bg-[#C5A880]/30 animate-pulse blur-[3px] mb-1.5" />
          ) : (
            <span className="text-[2.2rem] font-extrabold text-[#C5A880] font-headline block mb-1">
              {stats.total_assets}
            </span>
          )}
          <span className="text-[0.72rem] font-bold text-[#52525B] uppercase tracking-[0.1em] font-headline">
            EQUIPMENT ASSETS
          </span>
        </div>
      </div>

      {/* ── Pending Payment Approvals Card ── */}
      <div className="bg-[#121214] rounded-xl p-8 border border-[rgba(197,168,128,0.35)] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold font-headline text-[#C5A880] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C5A880] text-lg">hourglass_top</span>
              <span>Pending Payment Approvals ({isRefreshing ? '...' : pendingPayments.length})</span>
            </h3>
            <p className="text-xs text-[#52525B] mt-0.5">
              Bank transfer payments awaiting your verification.
            </p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#A1A1AA] hover:text-[#C5A880] hover:border-[#C5A880] transition-colors disabled:opacity-50"
              title="Check for New Payment Requests"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}
        </div>

        {isRefreshing ? (
          <div className="p-8 text-center bg-[#1A1A1D] rounded-xl border border-[#27272A] flex flex-col items-center justify-center gap-3">
            <div className="w-32 h-4 rounded bg-[#C5A880]/30 animate-pulse blur-[3px]" />
            <div className="w-64 h-3 rounded bg-[#52525B]/40 animate-pulse blur-[2px]" />
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="p-8 text-center bg-[#1A1A1D] rounded-xl border border-[#27272A]">
            <span className="material-symbols-outlined text-[#C5A880] text-2xl mb-2 block">task_alt</span>
            <h4 className="text-sm font-bold text-[#F4F4F5] font-headline">No Pending Payment Requests</h4>
            <p className="text-xs text-[#52525B] max-w-sm mx-auto mt-1">
              There are currently no bank transfer verification requests awaiting admin approval.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#27272A]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1A1A1D] border-b border-[#27272A] text-[#52525B] uppercase text-[0.72rem] font-semibold font-headline tracking-[0.08em]">
                  <th className="p-4">ID</th>
                  <th className="p-4">MEMBER</th>
                  <th className="p-4">AMOUNT</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4">METHOD</th>
                  <th className="p-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {pendingPayments.map((p) => {
                  const isApproving = actionLoadingId === `approve_pay_${p.id}`;
                  const isRejecting = actionLoadingId === `reject_pay_${p.id}`;
                  return (
                    <tr key={p.id} className="hover:bg-[rgba(197,168,128,0.04)] transition-colors">
                      <td className="p-4 font-bold text-[#C5A880] font-headline">#{p.id}</td>
                      <td className="p-4 font-bold text-[#F4F4F5] font-headline">{p.member_name}</td>
                      <td className="p-4 text-[#F4F4F5] font-headline">${p.amount}</td>
                      <td className="p-4 text-[#A1A1AA]">{p.date}</td>
                      <td className="p-4 text-[#A1A1AA] capitalize">{p.method?.replace('_', ' ')}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {p.proof_file && (
                            <button
                              type="button"
                              onClick={() => onViewProof(p.id)}
                              className="px-3 py-1 rounded bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/40 text-[0.72rem] font-bold font-headline uppercase hover:bg-[#C5A880]/20 transition-all"
                            >
                              Proof
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isApproving || isRejecting}
                            onClick={() => onApprovePayment(p.id)}
                            className="px-3.5 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 text-[0.72rem] font-extrabold font-headline uppercase hover:bg-[#10B981]/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isApproving ? (
                              <>
                                <div className="w-3 h-3 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                                <span>SAVING...</span>
                              </>
                            ) : (
                              <span>APPROVE</span>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isApproving || isRejecting}
                            onClick={() => onRejectPayment(p.id)}
                            className="px-3.5 py-1 rounded bg-transparent text-[#EF4444] border border-[#EF4444]/40 text-[0.72rem] font-extrabold font-headline uppercase hover:bg-[#EF4444]/15 transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isRejecting ? (
                              <>
                                <div className="w-3 h-3 border-2 border-[#EF4444]/30 border-t-[#EF4444] rounded-full animate-spin" />
                                <span>REJECTING...</span>
                              </>
                            ) : (
                              <span>REJECT</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Member Registrations Box */}
      {pendingMembers.length > 0 && (
        <div className="bg-[#121214] rounded-xl p-8 border border-[#27272A] shadow-xl">
          <h3 className="text-lg font-bold font-headline text-[#F4F4F5] mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F4F4F5] text-lg">person_add</span>
            <span>Pending Member Registrations ({pendingMembers.length})</span>
          </h3>
          <p className="text-xs text-[#52525B] mb-6">Self-registered members awaiting approval.</p>

          <div className="overflow-x-auto rounded-xl border border-[#27272A]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1A1A1D] border-b border-[#27272A] text-[#52525B] uppercase text-[0.72rem] font-semibold font-headline tracking-[0.08em]">
                  <th className="p-4">ID</th>
                  <th className="p-4">NAME</th>
                  <th className="p-4">EMAIL</th>
                  <th className="p-4">PHONE</th>
                  <th className="p-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {pendingMembers.map((m) => {
                  const mId = m.user_id || m.id;
                  const isApproving = actionLoadingId === `approve_mem_${mId}`;
                  const isRejecting = actionLoadingId === `reject_mem_${mId}`;
                  return (
                    <tr key={mId} className="hover:bg-[rgba(197,168,128,0.04)] transition-colors">
                      <td className="p-4 font-bold text-[#C5A880] font-headline">#{mId}</td>
                      <td className="p-4 font-bold text-[#F4F4F5] font-headline">{m.name}</td>
                      <td className="p-4 text-[#A1A1AA]">{m.email}</td>
                      <td className="p-4 text-[#A1A1AA]">{m.phone || 'N/A'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isApproving || isRejecting}
                            onClick={() => onApproveMember(mId)}
                            className="px-3.5 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 text-[0.72rem] font-extrabold font-headline uppercase hover:bg-[#10B981]/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isApproving ? (
                              <>
                                <div className="w-3 h-3 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                                <span>SAVING...</span>
                              </>
                            ) : (
                              <span>APPROVE</span>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isApproving || isRejecting}
                            onClick={() => onRejectMember(mId)}
                            className="px-3.5 py-1 rounded bg-transparent text-[#EF4444] border border-[#EF4444]/40 text-[0.72rem] font-extrabold font-headline uppercase hover:bg-[#EF4444]/15 transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isRejecting ? (
                              <>
                                <div className="w-3 h-3 border-2 border-[#EF4444]/30 border-t-[#EF4444] rounded-full animate-spin" />
                                <span>REJECTING...</span>
                              </>
                            ) : (
                              <span>REJECT</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
