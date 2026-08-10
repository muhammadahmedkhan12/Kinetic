import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';

interface MustChangePasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const MustChangePasswordModal: React.FC<MustChangePasswordModalProps> = ({ isOpen, onSuccess }) => {
  const { flashToast } = useToast();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/members/me/change-password', {
        current_password: currentPw,
        new_password: newPw,
      });
      flashToast('Permanent password set successfully! Welcome to KINETIC Gym.');
      onSuccess();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Password update failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="glass-modal w-full max-w-md rounded-3xl p-6 sm:p-8 border border-primary/40 shadow-2xl flex flex-col gap-5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">lock_reset</span>
          </div>
          <h3 className="text-xl font-bold font-display text-white">Set Permanent Password</h3>
          <p className="text-xs text-slate-400 mt-1">
            Your account was registered with a temporary 6-digit PIN. Please set a permanent password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Temporary PIN (Current Password)</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">New Permanent Password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-slate-900 font-extrabold text-sm shadow-xl hover:brightness-110 transition-all mt-2"
          >
            {isSubmitting ? 'Updating Password...' : 'Save Permanent Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
