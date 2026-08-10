import React from 'react';
import { GymClass } from '../../types';

interface ClassScheduleTabProps {
  classes: GymClass[];
  onOpenAddClass: () => void;
  onDeleteClass: (id: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actionLoadingId?: string | null;
}

export const ClassScheduleTab: React.FC<ClassScheduleTabProps> = ({
  classes,
  onOpenAddClass,
  onDeleteClass,
  onRefresh,
  isRefreshing = false,
  actionLoadingId = null,
}) => {
  return (
    <div className="bg-[#121214] rounded-xl p-8 border border-[#27272A] shadow-xl animate-fade-in space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#C5A880] font-headline flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#C5A880] text-lg">calendar_today</span>
            <span>Gym Classes Schedule</span>
          </h3>
          <p className="text-xs text-[#52525B]">
            Manage standard group fitness classes, schedule times, assign instructors, and set maximum capacity limits.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#A1A1AA] hover:text-[#C5A880] hover:border-[#C5A880] transition-colors disabled:opacity-50"
              title="Refresh Classes Schedule"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddClass}
            className="px-4 py-2.5 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-xs uppercase tracking-wider font-headline shadow-lg hover:brightness-110 transition-all shrink-0 flex items-center gap-2"
          >
            <span>+ Add Class</span>
          </button>
        </div>
      </div>

      {/* Classes Table */}
      <div className="overflow-x-auto rounded-xl border border-[#27272A]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1A1A1D] border-b border-[#27272A] text-[#52525B] uppercase text-[10px] font-bold font-headline tracking-widest">
              <th className="p-4">CLASS ID</th>
              <th className="p-4">CLASS NAME</th>
              <th className="p-4">DAYS</th>
              <th className="p-4">TIME SLOT</th>
              <th className="p-4">INSTRUCTOR</th>
              <th className="p-4">CAPACITY / BOOKED</th>
              <th className="p-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {isRefreshing ? (
              [1, 2, 3].map((idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="p-4"><div className="w-8 h-4 rounded bg-[#C5A880]/30 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-36 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-28 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-24 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-20 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-16 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-4 text-right"><div className="w-20 h-6 rounded bg-[#27272A]/80 blur-[2px] ml-auto" /></td>
                </tr>
              ))
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#52525B]">
                  No fitness classes scheduled yet. Click "+ Add Class" to create your first class.
                </td>
              </tr>
            ) : (
              classes.map((c) => {
                const isDeleting = actionLoadingId === `del_class_${c.id}`;
                return (
                  <tr key={c.id} className="hover:bg-[#1A1A1D]/60 transition-colors">
                    <td className="p-4 font-bold text-[#C5A880] font-headline">#{c.id}</td>
                    <td className="p-4 font-extrabold text-[#F4F4F5] font-headline">{c.name}</td>
                    <td className="p-4 text-[#A1A1AA]">{c.day}</td>
                    <td className="p-4 text-[#A1A1AA]">{c.time}</td>
                    <td className="p-4 text-[#A1A1AA] font-semibold">{c.trainer_name || 'Instructor'}</td>
                    <td className="p-4 text-[#F4F4F5]">
                      <span className="font-bold">{c.booked_count || 0}</span> / {c.capacity}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => onDeleteClass(c.id)}
                        className="px-3 py-1 rounded bg-transparent text-[#EF4444] border border-[#EF4444]/40 text-[10px] font-bold font-headline uppercase hover:bg-red-500/10 disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        {isDeleting ? (
                          <>
                            <div className="w-3 h-3 border-2 border-[#EF4444]/30 border-t-[#EF4444] rounded-full animate-spin" />
                            <span>Canceling...</span>
                          </>
                        ) : (
                          <span>Cancel Class</span>
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
