import React, { useState, useMemo } from 'react';
import { User } from '../../types';

interface MembersTabProps {
  members: User[];
  onOpenAddMember: () => void;
  onViewDetails: (user_id: number) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  members,
  onOpenAddMember,
  onViewDetails,
  onRefresh,
  isRefreshing = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unpaid'>('all');

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const query = searchTerm.toLowerCase();
      const nameMatch = m.name?.toLowerCase().includes(query);
      const emailMatch = m.email?.toLowerCase().includes(query);
      const idMatch = String(m.user_id || m.id).includes(query);
      const textMatch = nameMatch || emailMatch || idMatch;

      if (!textMatch) return false;

      if (statusFilter === 'active') {
        return m.membership?.status === 'active';
      } else if (statusFilter === 'unpaid') {
        return m.membership?.status === 'inactive' || m.membership?.status === 'overdue' || !m.membership;
      }
      return true;
    });
  }, [members, searchTerm, statusFilter]);

  return (
    <div className="bg-[#121214] rounded-xl p-6 border border-[#27272A] shadow-xl animate-fade-in space-y-5">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#F4F4F5] font-headline">Members Directory</h3>
          <p className="text-xs text-[#A1A1AA]">Search and manage all registered gym members.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#A1A1AA] hover:text-[#C5A880] hover:border-[#C5A880] transition-colors disabled:opacity-50"
              title="Refresh Members List"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenAddMember}
            className="px-4 py-2.5 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-xs uppercase tracking-wider font-headline shadow-lg hover:brightness-110 transition-all"
          >
            + Add New Member
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search members by name, email or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-xs focus:outline-none focus:border-[#C5A880]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-xs font-headline focus:outline-none focus:border-[#C5A880]"
        >
          <option value="all">All Members ({isRefreshing ? '...' : members.length})</option>
          <option value="active">Active Members Only</option>
          <option value="unpaid">Expired / Unpaid Only</option>
        </select>
      </div>

      {/* Members Data Table */}
      <div className="overflow-x-auto rounded-xl border border-[#27272A]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1A1A1D] border-b border-[#27272A] text-[#52525B] uppercase text-[10px] font-bold font-headline">
              <th className="p-3.5">ID</th>
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Gender</th>
              <th className="p-3.5">Phone</th>
              <th className="p-3.5">Membership Plan</th>
              <th className="p-3.5">Expiry Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {isRefreshing ? (
              [1, 2, 3, 4].map((idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="p-3.5"><div className="w-8 h-4 rounded bg-[#C5A880]/30 blur-[2px]" /></td>
                  <td className="p-3.5"><div className="w-32 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                  <td className="p-3.5"><div className="w-44 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-3.5"><div className="w-12 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-3.5"><div className="w-24 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  <td className="p-3.5"><div className="w-16 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                  <td className="p-3.5"><div className="w-28 h-5 rounded-full bg-emerald-500/20 blur-[2px]" /></td>
                </tr>
              ))
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#52525B]">
                  No members found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => {
                const sub = m.membership;
                const userId = m.user_id || m.id;
                const isActive = sub?.status === 'active';

                return (
                  <tr
                    key={userId}
                    onClick={() => onViewDetails(userId)}
                    className="hover:bg-[#1A1A1D]/60 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-bold text-[#C5A880] font-headline">#{userId}</td>
                    <td className="p-3.5 font-bold text-[#F4F4F5] font-headline">{m.name}</td>
                    <td className="p-3.5 text-[#A1A1AA]">{m.email}</td>
                    <td className="p-3.5 text-[#A1A1AA] capitalize">{m.gender || 'Male'}</td>
                    <td className="p-3.5 text-[#A1A1AA]">{m.phone || 'N/A'}</td>
                    <td className="p-3.5 font-bold text-[#F4F4F5] uppercase font-headline">
                      {sub ? sub.membership_type : <span className="text-[#52525B]">None</span>}
                    </td>
                    <td className="p-3.5">
                      {sub ? (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-headline uppercase border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {sub.end_date} ({sub.status})
                        </span>
                      ) : (
                        <span className="text-[#52525B]">N/A</span>
                      )}
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
