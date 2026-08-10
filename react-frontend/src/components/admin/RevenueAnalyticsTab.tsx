import React, { useState, useMemo } from 'react';
import { Payment } from '../../types';

interface RevenueAnalyticsTabProps {
  payments: Payment[];
  onOpenRecordCash: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const RevenueAnalyticsTab: React.FC<RevenueAnalyticsTabProps> = ({
  payments,
  onOpenRecordCash,
  onRefresh,
  isRefreshing = false,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState('all');

  const filteredData = useMemo(() => {
    const start = startDate ? new Date(startDate + 'T00:00:00') : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;

    let sum = 0;
    let count = 0;
    const items: Payment[] = [];

    payments.forEach((p) => {
      if (p.status !== 'completed') return;

      const pDate = new Date(p.date + 'T12:00:00');
      if (start && pDate < start) return;
      if (end && pDate > end) return;
      if (selectedMethod !== 'all' && p.method !== selectedMethod) return;
      if (selectedPlan !== 'all' && Math.round(p.amount) !== parseInt(selectedPlan)) return;

      sum += p.amount;
      count++;
      items.push(p);
    });

    const avg = count > 0 ? sum / count : 0;
    return { sum, count, avg, items };
  }, [payments, startDate, endDate, selectedMethod, selectedPlan]);

  return (
    <div className="bg-[#121214] rounded-xl p-8 border border-[#27272A] shadow-xl animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#C5A880] font-headline flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#C5A880] text-lg">payments</span>
            <span>Revenue Analysis Dashboard</span>
          </h3>
          <p className="text-xs text-[#52525B]">
            Analyze gym income by date range, payment method, and membership package.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#A1A1AA] hover:text-[#C5A880] hover:border-[#C5A880] transition-colors disabled:opacity-50"
              title="Refresh Revenue Transactions"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenRecordCash}
            className="px-4 py-2.5 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-xs uppercase tracking-wider font-headline shadow-lg hover:brightness-110 transition-all shrink-0 flex items-center gap-2"
          >
            <span>+ Record Cash Payment</span>
          </button>
        </div>
      </div>

      {/* Dynamic Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline mb-1">
            START DATE
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-xs focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline mb-1">
            END DATE
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-xs focus:outline-none focus:border-[#C5A880]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline mb-1">
            PAYMENT METHOD
          </label>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-xs font-headline focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="card">Debit Card / Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline mb-1">
            PLAN TIER EST.
          </label>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-xs font-headline focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">All Plan Tiers</option>
            <option value="29">Starter Plan ($29)</option>
            <option value="49">Pro Plan ($49)</option>
            <option value="99">Elite Plan ($99)</option>
          </select>
        </div>
      </div>

      {/* Revenue Summary Cards Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[#1A1A1D] p-6 rounded-xl border border-[#27272A]">
        <div>
          <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline block mb-1">
            FILTERED SALES TOTAL
          </span>
          {isRefreshing ? (
            <div className="w-32 h-8 rounded-lg bg-[#C5A880]/30 animate-pulse blur-[3px]" />
          ) : (
            <span className="text-3xl font-extrabold text-[#C5A880] font-headline">
              ${filteredData.sum.toFixed(2)}
            </span>
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline block mb-1">
            COMPLETED TRANSACTIONS
          </span>
          {isRefreshing ? (
            <div className="w-16 h-8 rounded-lg bg-[#3F3F46]/60 animate-pulse blur-[3px]" />
          ) : (
            <span className="text-3xl font-extrabold text-[#F4F4F5] font-headline">
              {filteredData.count}
            </span>
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline block mb-1">
            AVERAGE TRANSACTION
          </span>
          {isRefreshing ? (
            <div className="w-28 h-8 rounded-lg bg-[#3F3F46]/60 animate-pulse blur-[3px]" />
          ) : (
            <span className="text-3xl font-extrabold text-[#A1A1AA] font-headline">
              ${filteredData.avg.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Detailed Query Breakdown Table */}
      <div>
        <h4 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider font-headline mb-3">
          DETAILED QUERY BREAKDOWN
        </h4>

        <div className="overflow-x-auto rounded-xl border border-[#27272A]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1A1A1D] border-b border-[#27272A] text-[#52525B] uppercase text-[10px] font-bold font-headline tracking-widest">
                <th className="p-4">TX ID</th>
                <th className="p-4">MEMBER</th>
                <th className="p-4">AMOUNT</th>
                <th className="p-4">DATE</th>
                <th className="p-4">METHOD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {isRefreshing ? (
                [1, 2, 3].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="w-8 h-4 rounded bg-[#C5A880]/30 blur-[2px]" /></td>
                    <td className="p-4"><div className="w-28 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                    <td className="p-4"><div className="w-20 h-4 rounded bg-[#3F3F46]/60 blur-[2px]" /></td>
                    <td className="p-4"><div className="w-24 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                    <td className="p-4"><div className="w-24 h-4 rounded bg-[#27272A]/80 blur-[2px]" /></td>
                  </tr>
                ))
              ) : filteredData.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#52525B]">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredData.items.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1A1A1D]/60 transition-colors">
                    <td className="p-4 font-bold text-[#C5A880] font-headline">#{p.id}</td>
                    <td className="p-4 font-bold text-[#F4F4F5] font-headline">Member #{p.user_id}</td>
                    <td className="p-4 font-extrabold text-[#F4F4F5] font-headline">${p.amount.toFixed(2)}</td>
                    <td className="p-4 text-[#A1A1AA]">{p.date}</td>
                    <td className="p-4 text-[#A1A1AA] capitalize">{p.method?.replace('_', ' ')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
