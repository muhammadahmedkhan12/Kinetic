import React from 'react';
import { Trainer } from '../../types';

interface TrainersTabProps {
  trainers: Trainer[];
  onOpenAddTrainer: () => void;
  onDeleteTrainer: (id: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actionLoadingId?: string | null;
}

export const TrainersTab: React.FC<TrainersTabProps> = ({
  trainers,
  onOpenAddTrainer,
  onDeleteTrainer,
  onRefresh,
  isRefreshing = false,
  actionLoadingId = null,
}) => {
  return (
    <div className="bg-[#121214] rounded-xl p-8 border border-[#27272A] shadow-xl animate-fade-in space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#F4F4F5] font-headline">
            Gym Trainers Registry
          </h3>
          <p className="text-xs text-[#52525B] mt-0.5">
            Manage certified personal trainers and specializations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#A1A1AA] hover:text-[#C5A880] hover:border-[#C5A880] transition-colors disabled:opacity-50"
              title="Refresh Trainers List"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddTrainer}
            className="px-4 py-2.5 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-xs uppercase tracking-wider font-headline shadow-lg hover:brightness-110 transition-all shrink-0 flex items-center gap-2"
          >
            <span>+ Add Trainer</span>
          </button>
        </div>
      </div>

      {/* Trainers Table */}
      <div className="overflow-x-auto rounded-xl border border-[#27272A]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1A1A1D] border-b border-[#27272A] text-[#52525B] uppercase text-[10px] font-bold font-headline tracking-widest">
              <th className="p-4">ID</th>
              <th className="p-4">NAME</th>
              <th className="p-4">SPECIALIZATION</th>
              <th className="p-4">EXPERIENCE</th>
              <th className="p-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {isRefreshing ? (
              [1, 2, 3].map((idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="p-4"><div className="w-8 h-4 rounded bg-[#C5A880]/30 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-36 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-40 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-16 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                  <td className="p-4 text-right"><div className="w-16 h-6 rounded bg-[#27272A]/80 blur-[2px] ml-auto" /></td>
                </tr>
              ))
            ) : trainers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#52525B]">
                  No trainers registered yet.
                </td>
              </tr>
            ) : (
              trainers.map((t) => {
                const isDeleting = actionLoadingId === `del_trainer_${t.id}`;
                return (
                  <tr key={t.id} className="hover:bg-[#1A1A1D]/60 transition-colors">
                    <td className="p-4 font-bold text-[#C5A880] font-headline">#{t.id}</td>
                    <td className="p-4 font-extrabold text-[#F4F4F5] font-headline">{t.name}</td>
                    <td className="p-4 text-[#A1A1AA]">{t.specialization}</td>
                    <td className="p-4 text-[#A1A1AA]">{t.experience_years} years</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => onDeleteTrainer(t.id)}
                        className="px-3 py-1 rounded bg-transparent text-[#EF4444] border border-[#EF4444]/40 text-[10px] font-bold font-headline uppercase hover:bg-red-500/10 disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        {isDeleting ? (
                          <>
                            <div className="w-3 h-3 border-2 border-[#EF4444]/30 border-t-[#EF4444] rounded-full animate-spin" />
                            <span>Removing...</span>
                          </>
                        ) : (
                          <span>Remove</span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
