import React, { useState, useEffect, useCallback } from 'react';
import { WeightLog } from '../../types';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';

interface WeightScreenProps {
  onRefresh?: () => void;
}

export const WeightScreen: React.FC<WeightScreenProps> = () => {
  const { flashToast } = useToast();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [weightInput, setWeightInput] = useState<string>('74.5');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchWeightLogs = useCallback(async () => {
    try {
      const res = await apiClient.get('/weight-logs/history');
      setLogs(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeightLogs();
  }, [fetchWeightLogs]);

  const latestLog = logs.length > 0 ? logs[0] : null;
  const previousLog = logs.length > 1 ? logs[1] : null;

  let deltaStr = '--';
  let deltaValue = 0;
  if (latestLog && previousLog) {
    deltaValue = latestLog.weight_kg - previousLog.weight_kg;
    deltaStr = deltaValue >= 0 ? `+${deltaValue.toFixed(1)}` : `${deltaValue.toFixed(1)}`;
  }

  const handleLogWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/weight-logs', { weight_kg: parseFloat(weightInput) });
      flashToast(`Weight logged: ${weightInput} kg!`);
      setIsLogModalOpen(false);
      fetchWeightLogs();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to log weight.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-24 w-full max-w-2xl mx-auto">
      {/* Hero Metric Section */}
      <section className="mb-2">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-[12px] font-semibold text-primary uppercase tracking-widest font-headline">
              Current Weight
            </span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold text-on-surface font-headline">
                {latestLog ? latestLog.weight_kg.toFixed(1) : '74.5'}
              </h2>
              <span className="text-xl font-medium text-on-surface-variant">kg</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-bold text-primary uppercase flex items-center gap-1 font-headline">
              <span className="material-symbols-outlined text-[16px]">
                {deltaValue >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              {deltaStr} kg
            </span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-headline">
              This week
            </span>
          </div>
        </div>

        {/* Visualization Canvas */}
        <div className="glass-card rounded-xl p-4 h-48 relative overflow-hidden">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(#C5A880 1px, transparent 1px), linear-gradient(90deg, #C5A880 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <svg className="w-full h-full drop-shadow-[0_0_12px_rgba(197,168,128,0.3)]" viewBox="0 0 300 120">
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#C5A880" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#C5A880" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,100 L30,95 L60,98 L90,85 L120,88 L150,75 L180,78 L210,65 L240,68 L270,55 L300,58 L300,120 L0,120 Z"
              fill="url(#chartGradient)"
            />
            <path
              className="animate-chart"
              d="M0,100 L30,95 L60,98 L90,85 L120,88 L150,75 L180,78 L210,65 L240,68 L270,55 L300,58"
              fill="none"
              stroke="#C5A880"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
          <div className="absolute bottom-3 left-0 right-0 px-4 flex justify-between">
            <span className="text-[10px] text-on-surface-variant font-medium">MON</span>
            <span className="text-[10px] text-on-surface-variant font-medium">WED</span>
            <span className="text-[10px] text-on-surface-variant font-medium">FRI</span>
            <span className="text-[10px] text-on-surface-variant font-medium">SUN</span>
          </div>
        </div>
      </section>

      {/* Action Pulse Button */}
      <div className="flex justify-center my-2">
        <button
          type="button"
          onClick={() => setIsLogModalOpen(true)}
          className="pulse-action bg-primary text-[#1C1B1C] font-bold py-4 px-10 rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all w-full"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="uppercase tracking-widest text-[14px] font-headline">Log Weight</span>
        </button>
      </div>

      {/* Logs Feed Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-on-surface font-headline">Weight History</h3>
          <span className="text-[12px] text-primary uppercase font-bold tracking-tighter font-headline">
            {logs.length} Entries
          </span>
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="glass-card p-6 rounded-xl text-center text-on-surface-variant text-xs">
              No weight logs recorded yet. Tap "Log Weight" above to add your first entry!
            </div>
          ) : (
            logs.map((log, idx) => {
              const prev = logs[idx + 1];
              let diffStr = '--';
              if (prev) {
                const diff = log.weight_kg - prev.weight_kg;
                diffStr = diff >= 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
              }

              return (
                <div
                  key={log.id || idx}
                  className="glass-card p-4 rounded-xl flex items-center justify-between group hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">scale</span>
                    </div>
                    <div>
                      <p className="text-lg text-on-surface font-semibold font-headline">{log.weight_kg.toFixed(1)} kg</p>
                      <p className="text-[11px] text-on-surface-variant uppercase tracking-wide">{log.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-primary font-bold font-headline">{diffStr}</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Quick Log Weight Modal */}
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Daily Weight">
        <form onSubmit={handleLogWeightSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Body Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#19191D] border border-white/10 text-on-surface font-headline font-bold text-lg focus:outline-none focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-primary text-[#1C1B1C] font-extrabold text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition-all mt-2"
          >
            {isSubmitting ? 'Logging...' : 'Save Weight Log Entry'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
