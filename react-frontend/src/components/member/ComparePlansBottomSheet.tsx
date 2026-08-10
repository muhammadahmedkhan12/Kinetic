import React from 'react';
import { MembershipPlan } from '../../types';

interface ComparePlansBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  plans: MembershipPlan[];
}

export const ComparePlansBottomSheet: React.FC<ComparePlansBottomSheetProps> = ({ isOpen, onClose, plans }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-modal relative w-full max-w-lg rounded-t-3xl p-6 shadow-2xl border-t border-primary/40 max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold font-display text-primary">Compare Plan Features</h3>
            <p className="text-xs text-slate-400">Detailed side-by-side tier comparison</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {plans.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-bold text-white">{p.plan_name}</h4>
                <span className="text-lg font-black text-primary">${p.price}/mo</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">{p.description}</p>
              <ul className="flex flex-col gap-1.5 text-xs text-slate-400">
                {(p.features || []).map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
