import React, { useState } from 'react';
import { User, Membership, GymClass } from '../../types';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface HomeScreenProps {
  user: User;
  membership: Membership | null;
  upcomingClass: GymClass | null;
  onNavigateBilling: () => void;
  onRefresh: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  membership,
  upcomingClass,
  onNavigateBilling,
  onRefresh,
}) => {
  const { flashToast } = useToast();
  const [checkingIn, setCheckingIn] = useState(false);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await apiClient.post('/attendance/check-in');
      flashToast(res.data.message || 'Gate check-in recorded!');
      onRefresh();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Check-in failed.', 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  const isOverdue = membership?.status === 'overdue';
  const isInactive = membership?.status === 'inactive' || !membership;
  const isPending = membership?.status === 'pending_approval';

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-24 w-full max-w-2xl mx-auto">
      {/* Top Header Greeting Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest font-headline">
            HIGH-PERFORMANCE LUXURY FITNESS
          </span>
          <h2 className="text-2xl font-bold font-headline text-on-surface">Good Day, {user.name} 👋</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1D2022] border border-primary/30 text-primary flex items-center justify-center font-extrabold text-base shadow-lg">
          {user.name[0]}
        </div>
      </div>

      {/* Dynamic Status Banners */}
      {isPending && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-400 text-2xl">hourglass_top</span>
          <div>
            <p className="text-xs font-bold text-amber-300 font-headline">Payment Under Verification</p>
            <p className="text-[11px] text-on-surface-variant">Your bank transfer is currently being verified by gym staff.</p>
          </div>
        </div>
      )}

      {isOverdue && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl">warning</span>
            <div>
              <p className="text-xs font-bold text-amber-300 font-headline">Membership Overdue (Grace Period)</p>
              <p className="text-[11px] text-on-surface-variant">Please renew your subscription to prevent lockout.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateBilling}
            className="px-3 py-1.5 rounded-lg bg-primary text-[#1C1B1C] font-bold text-xs shadow-md shrink-0 font-headline uppercase"
          >
            Renew
          </button>
        </div>
      )}

      {isInactive && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400 text-2xl">block</span>
            <div>
              <p className="text-xs font-bold text-red-300 font-headline">Membership Expired / Restricted</p>
              <p className="text-[11px] text-on-surface-variant">Gym access is locked. Renew subscription to unlock features.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateBilling}
            className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-bold text-xs shadow-md shrink-0 font-headline uppercase"
          >
            Pay Now
          </button>
        </div>
      )}

      {/* Gate Entry Check-In Card */}
      <div className="glass-card rounded-xl p-6 border border-primary/15 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
        <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-headline">
          GATE ENTRY PASS
        </h3>

        <button
          type="button"
          onClick={handleCheckIn}
          disabled={checkingIn || isInactive}
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl transition-all relative ${
            isInactive
              ? 'bg-[#1D2022] opacity-50 cursor-not-allowed border border-white/10'
              : 'bg-primary text-[#1C1B1C] hover:scale-105 active:scale-95 pulse-gold'
          }`}
        >
          <span className="material-symbols-outlined text-3xl font-bold">sensor_door</span>
          <span className="text-[10px] font-black uppercase tracking-wider font-headline">
            {checkingIn ? '...' : 'CHECK-IN'}
          </span>
        </button>

        <p className="text-xs text-on-surface-variant">
          {isInactive ? 'Access Restricted • Payment Required' : 'Tap turnstile gate scanner pass to record daily attendance.'}
        </p>
      </div>

      {/* Quick Dashboard Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Upcoming Class Widget */}
        <div className="glass-card rounded-xl p-4 border border-primary/15 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-headline">
              UPCOMING CLASS
            </span>
            <span className="material-symbols-outlined text-primary text-xl">event</span>
          </div>
          {upcomingClass ? (
            <div>
              <p className="text-sm font-bold text-on-surface font-headline truncate">{upcomingClass.name}</p>
              <p className="text-xs text-on-surface-variant">{upcomingClass.day} • {upcomingClass.time}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-on-surface font-headline">No Reserved Spot</p>
              <p className="text-xs text-on-surface-variant">Browse schedule tab</p>
            </div>
          )}
        </div>

        {/* Weekly Goal Progress Ring Widget */}
        <div className="glass-card rounded-xl p-4 border border-primary/15 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-headline">
              WEEKLY GOAL
            </span>
            <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold font-headline text-on-surface">4 / 5</p>
              <p className="text-[11px] text-on-surface-variant">Workouts Done</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary flex items-center justify-center font-bold text-[11px] text-primary font-headline">
              80%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
