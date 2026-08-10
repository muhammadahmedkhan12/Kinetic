import React from 'react';
import { EquipmentAsset } from '../../types';

interface EquipmentAssetsTabProps {
  assets: EquipmentAsset[];
  onOpenAddAsset: () => void;
  onMarkServiced: (id: number) => void;
  onDeleteAsset: (id: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actionLoadingId?: string | null;
}

export const EquipmentAssetsTab: React.FC<EquipmentAssetsTabProps> = ({
  assets,
  onOpenAddAsset,
  onMarkServiced,
  onDeleteAsset,
  onRefresh,
  isRefreshing = false,
  actionLoadingId = null,
}) => {
  return (
    <div className="bg-[#121214] rounded-xl p-8 border border-[#27272A] shadow-xl animate-fade-in space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#F4F4F5] font-headline flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#F4F4F5] text-lg">build</span>
            <span>Gym Equipment & Facilities Registry</span>
          </h3>
          <p className="text-xs text-[#52525B]">
            Track machinery maintenance, service schedules, and equipment status.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#A1A1AA] hover:text-[#C5A880] hover:border-[#C5A880] transition-colors disabled:opacity-50"
              title="Refresh Equipment Assets"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenAddAsset}
            className="px-4 py-2.5 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-xs uppercase tracking-wider font-headline shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span>+ Register Equipment Asset</span>
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="overflow-x-auto rounded-xl border border-[#27272A]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1A1A1D] border-b border-[#27272A] text-[#52525B] uppercase text-[10px] font-bold font-headline tracking-widest">
              <th className="p-4">ASSET ID</th>
              <th className="p-4">ASSET NAME</th>
              <th className="p-4">CATEGORY</th>
              <th className="p-4">QTY</th>
              <th className="p-4">LOCATION</th>
              <th className="p-4">SERVICE STATUS</th>
              <th className="p-4">LAST SERVICED</th>
              <th className="p-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {isRefreshing ? (
              [1, 2, 3, 4].map((idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="p-4"><div className="w-8 h-4 rounded bg-[#C5A880]/30 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-36 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-20 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-6 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-28 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-24 h-5 rounded-md bg-[#10B981]/20 blur-[2px]" /></td>
                  <td className="p-4"><div className="w-20 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-4 text-right"><div className="w-32 h-6 rounded bg-[#27272A]/80 blur-[2px] ml-auto" /></td>
                </tr>
              ))
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#52525B]">
                  No equipment assets registered yet.
                </td>
              </tr>
            ) : (
              assets.map((a) => {
                const isOperational = a.status === 'Operational' || a.status === 'OK' || a.status === 'Operational ✓';
                const statusLabel = isOperational ? 'OPERATIONAL' : (a.status?.toUpperCase() || 'NEEDS SERVICE');
                const isServicing = actionLoadingId === `service_asset_${a.id}`;
                const isDeleting = actionLoadingId === `del_asset_${a.id}`;

                return (
                  <tr key={a.id} className="hover:bg-[#1A1A1D]/60 transition-colors">
                    <td className="p-4 font-bold text-[#C5A880] font-headline">#{a.id}</td>
                    <td className="p-4 font-extrabold text-[#F4F4F5] font-headline">{a.name}</td>
                    <td className="p-4 text-[#A1A1AA]">{a.category}</td>
                    <td className="p-4 font-bold text-[#F4F4F5] font-headline">{a.quantity}</td>
                    <td className="p-4 text-[#A1A1AA]">{a.location}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold font-headline tracking-wider uppercase border ${
                          isOperational
                            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                            : 'bg-[#C5A880]/10 text-[#C5A880] border-[#C5A880]/40'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="p-4 text-[#A1A1AA] font-mono text-[11px]">{a.last_serviced}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isServicing || isDeleting}
                          onClick={() => onMarkServiced(a.id)}
                          className="px-3 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 text-[0.72rem] font-extrabold font-headline uppercase hover:bg-[#10B981]/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isServicing ? (
                            <>
                              <div className="w-3 h-3 border-2 border-[#10B981]/30 border-t-[#10B981] rounded-full animate-spin" />
                              <span>SAVING...</span>
                            </>
                          ) : (
                            <span>MARK SERVICED</span>
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={isServicing || isDeleting}
                          onClick={() => onDeleteAsset(a.id)}
                          className="px-3 py-1 rounded bg-transparent text-[#EF4444] border border-[#EF4444]/40 text-[0.72rem] font-extrabold font-headline uppercase hover:bg-[#EF4444]/15 transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isDeleting ? (
                            <>
                              <div className="w-3 h-3 border-2 border-[#EF4444]/30 border-t-[#EF4444] rounded-full animate-spin" />
                              <span>DELETING...</span>
                            </>
                          ) : (
                            <span>DELETE</span>
                          )}
                        </button>
                      </div>
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
