import React, { useState } from 'react';
import { Membership, MembershipPlan, Payment } from '../../types';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';

interface BillingScreenProps {
  membership: Membership | null;
  plans: MembershipPlan[];
  payments: Payment[];
  onOpenComparePlans: () => void;
  onRefresh: () => void;
}

export const BillingScreen: React.FC<BillingScreenProps> = ({
  membership,
  plans,
  payments,
  onOpenComparePlans,
  onRefresh,
}) => {
  const { flashToast } = useToast();

  // Modals state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Payment Form state
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'card' | 'cash'>('bank');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize selectedPlanId when plans load
  React.useEffect(() => {
    if (plans.length > 0 && selectedPlanId === null) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  // Check if a payment is already pending admin verification
  const hasPendingPayment = payments.some((p) => p.status === 'pending');

  const handleCopyIBAN = () => {
    navigator.clipboard.writeText('PK99PRST0000123456789');
    flashToast('IBAN copied to clipboard!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreenshotName(file.name);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasPendingPayment) {
      flashToast('You already have a payment under verification. Please wait for admin approval.', 'error');
      return;
    }

    const activePlanId = selectedPlanId || (plans.length > 0 ? plans[0].id : null);
    if (!activePlanId) {
      flashToast('Please select a subscription plan.', 'error');
      return;
    }

    if (selectedMethod === 'bank' && !selectedFile) {
      flashToast('Please attach a screenshot or PDF of your bank transfer receipt.', 'error');
      return;
    }

    const plan = plans.find((p) => p.id === activePlanId);
    if (!plan) {
      flashToast('Invalid plan selection.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (membership?.membership_type !== plan.plan_name) {
        await apiClient.post('/memberships/subscribe', { plan_id: activePlanId });
      }

      const formData = new FormData();
      formData.append('plan_id', String(activePlanId));
      formData.append('method', selectedMethod === 'bank' ? 'bank_transfer' : selectedMethod);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await apiClient.post('/payments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      flashToast('Payment submitted successfully! Pending admin approval.');
      setScreenshotBase64(null);
      setScreenshotName('');
      setSelectedFile(null);
      setIsPayModalOpen(false);
      onRefresh();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Payment submission failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePlanName = membership?.membership_type || 'Starter Pass';
  const isActive = membership?.status === 'active';
  const isPending = membership?.status === 'pending_approval' || hasPendingPayment;

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-28 w-full max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold font-headline text-on-surface">Billing & Subscriptions</h2>
        <p className="text-xs text-on-surface-variant">View your active gym membership tier and transaction history.</p>
      </div>

      {/* 1. HERO MEMBERSHIP TIER CARD */}
      <section>
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden shadow-2xl border border-primary/30 space-y-6">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest font-headline block mb-1">
                Current Membership Tier
              </span>
              <h3 className="text-3xl font-extrabold text-primary font-headline tracking-tight uppercase">
                {activePlanName}
              </h3>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-headline border flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isPending
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isActive ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-red-400'
                }`}
              />
              <span className="whitespace-nowrap">
                {membership?.status ? membership.status.replace('_', ' ') : 'NO MEMBERSHIP'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-white/10 pt-4">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-headline block mb-0.5">
                Expiry Date
              </span>
              <p className="text-sm font-semibold text-on-surface font-headline">
                {membership?.end_date ? membership.end_date : 'No Active Expiry'}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenComparePlans}
              className="text-xs font-bold text-primary hover:underline font-headline uppercase"
            >
              Compare Tiers →
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN ACTIONS */}
      <section className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setIsPayModalOpen(true)}
          className="w-full py-4 rounded-2xl bg-primary text-[#111415] font-extrabold text-xs uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-95 transition-all font-headline flex items-center justify-center gap-2 col-span-2"
        >
          <span className="material-symbols-outlined text-lg">credit_card</span>
          Pay / Submit Subscription Payment
        </button>
      </section>

      {/* 3. INVOICES & ACTIVITY LEDGER */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-bold text-on-surface-variant px-1 uppercase tracking-widest font-headline">
          Invoices & Payment History
        </h3>

        <div className="space-y-3">
          {payments.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center text-on-surface-variant text-xs">
              No transaction history recorded yet.
            </div>
          ) : (
            payments.map((p) => {
              const isApproved = p.status === 'completed';
              const isPending = p.status === 'pending';

              return (
                <div
                  key={p.id}
                  className="glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">receipt_long</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface font-headline">Gym Subscription Payment</p>
                      <p className="text-[11px] text-on-surface-variant capitalize">
                        {p.date} • {p.method ? p.method.replace('_', ' ') : 'Bank Transfer'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-primary font-headline">
                      ${(typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0).toFixed(2)}
                    </p>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-headline border ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isPending
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. CLEAN PAYMENT SUBMISSION MODAL */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Submit Subscription Payment">
        <form onSubmit={handleSubmitPayment} className="flex flex-col gap-4">
          {hasPendingPayment && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-400 text-xl">hourglass_top</span>
              <p className="text-xs font-bold text-amber-300 font-headline">
                Payment Under Verification. Duplicate submissions disabled.
              </p>
            </div>
          )}

          {/* Select Plan */}
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-headline mb-1.5">
              Select Subscription Plan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-primary text-[#111415] border-primary font-bold shadow-md'
                        : 'bg-[#1D2022] text-on-surface border-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-bold font-headline uppercase">{p.plan_name}</p>
                    <p className="text-sm font-extrabold font-headline mt-0.5">${p.price}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select Method */}
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-headline mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('bank')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'bank'
                    ? 'bg-primary/20 border-primary text-primary font-bold'
                    : 'bg-[#1D2022] text-on-surface-variant border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-lg">account_balance</span>
                <span className="text-[10px] uppercase font-bold tracking-wider font-headline">Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'card'
                    ? 'bg-primary/20 border-primary text-primary font-bold'
                    : 'bg-[#1D2022] text-on-surface-variant border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-lg">credit_card</span>
                <span className="text-[10px] uppercase font-bold tracking-wider font-headline">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('cash')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  selectedMethod === 'cash'
                    ? 'bg-primary/20 border-primary text-primary font-bold'
                    : 'bg-[#1D2022] text-on-surface-variant border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-lg">payments</span>
                <span className="text-[10px] uppercase font-bold tracking-wider font-headline">Cash</span>
              </button>
            </div>
          </div>

          {selectedMethod === 'bank' && (
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[#1D2022] border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-bold text-[10px]">Bank:</span>
                  <span className="font-bold text-on-surface font-headline">Prestige Bank</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-bold text-[10px]">Title:</span>
                  <span className="font-bold text-on-surface font-headline">KINETIC Gym Management</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-bold text-[10px]">IBAN:</span>
                  <span className="font-bold text-primary font-mono text-xs">PK99PRST0000123456789</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyIBAN}
                  className="w-full py-1 rounded bg-white/5 text-primary font-bold text-[10px] uppercase tracking-wider transition-colors font-headline mt-1"
                >
                  📋 Copy IBAN Number
                </button>
              </div>

              {/* Receipt File Dropzone */}
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-headline mb-1">
                  Upload Receipt Proof (Required)
                </label>
                <div
                  onClick={() => document.getElementById('modal-receipt-file-input')?.click()}
                  className="border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-xl p-3.5 text-center cursor-pointer transition-all bg-[#1D2022]"
                >
                  <input
                    type="file"
                    id="modal-receipt-file-input"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {screenshotName ? (
                    <div className="flex flex-col items-center gap-0.5 text-primary">
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      <span className="text-xs font-bold font-headline">{screenshotName}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-xl text-primary">upload_file</span>
                      <span className="text-xs font-bold text-on-surface font-headline">Attach Payment Proof</span>
                      <span className="text-[10px]">Tap to upload PNG, JPG, or PDF receipt</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="p-3.5 rounded-xl bg-[#1D2022] border border-white/5 text-xs space-y-1">
              <p className="font-bold text-on-surface font-headline">Online Credit / Debit Card</p>
              <p className="text-on-surface-variant text-[11px]">Instant automated subscription activation.</p>
            </div>
          )}

          {selectedMethod === 'cash' && (
            <div className="p-3.5 rounded-xl bg-[#1D2022] border border-white/5 text-xs space-y-1">
              <p className="font-bold text-on-surface font-headline">Pay at Front Desk</p>
              <p className="text-on-surface-variant text-[11px]">Submit request here and pay cash directly to gym receptionist.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || hasPendingPayment}
            className={`w-full py-3.5 rounded-full font-extrabold text-xs uppercase tracking-wider shadow-xl transition-all font-headline mt-2 ${
              hasPendingPayment
                ? 'bg-[#1D2022] text-on-surface-variant cursor-not-allowed border border-white/5'
                : 'bg-primary text-[#111415] hover:brightness-110'
            }`}
          >
            {isSubmitting ? 'Submitting...' : hasPendingPayment ? 'Payment Under Review' : 'Submit Payment Request'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
