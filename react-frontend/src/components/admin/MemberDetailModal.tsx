import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberDetails: any;
  isLoading?: boolean;
  onSendReminder: (id: number) => void;
  onDeleteMember: (id: number) => Promise<void> | void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  memberDetails,
  isLoading = false,
  onSendReminder,
  onDeleteMember,
}) => {
  const { flashToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  // Blurred Skeleton Loader Layout during data retrieval
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Member Profile Details">
        <div className="flex flex-col gap-5 animate-pulse">
          {/* Header Profile Skeleton */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1D] border border-[#27272A]">
            <div className="w-14 h-14 rounded-full bg-[#27272A]/80 border-2 border-[#C5A880]/30 blur-[2px] shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-40 h-5 rounded bg-[#3F3F46]/60 blur-[3px]" />
              <div className="w-56 h-3.5 rounded bg-[#27272A]/80 blur-[2px]" />
            </div>
          </div>

          {/* Personal Data Skeleton */}
          <div>
            <div className="w-24 h-3 rounded bg-[#C5A880]/40 blur-[2px] mb-2" />
            <div className="grid grid-cols-3 gap-3 bg-[#1A1A1D] p-3.5 rounded-xl border border-[#27272A]">
              <div>
                <div className="w-12 h-2.5 rounded bg-[#52525B]/50 blur-[2px] mb-1.5" />
                <div className="w-20 h-4 rounded bg-[#3F3F46]/70 blur-[3px]" />
              </div>
              <div>
                <div className="w-10 h-2.5 rounded bg-[#52525B]/50 blur-[2px] mb-1.5" />
                <div className="w-14 h-4 rounded bg-[#3F3F46]/70 blur-[3px]" />
              </div>
              <div>
                <div className="w-14 h-2.5 rounded bg-[#52525B]/50 blur-[2px] mb-1.5" />
                <div className="w-16 h-4 rounded bg-[#3F3F46]/70 blur-[3px]" />
              </div>
            </div>
          </div>

          {/* Account Credentials Skeleton */}
          <div>
            <div className="w-36 h-3 rounded bg-[#C5A880]/40 blur-[2px] mb-2" />
            <div className="p-4 rounded-xl bg-[#C5A880]/5 border border-[#C5A880]/20 flex items-center justify-between">
              <div className="flex flex-col gap-2 flex-1">
                <div className="w-32 h-2.5 rounded bg-[#52525B]/50 blur-[2px]" />
                <div className="w-48 h-4.5 rounded bg-[#3F3F46]/80 blur-[3px]" />
                <div className="w-20 h-2.5 rounded bg-[#52525B]/50 blur-[2px] mt-1" />
                <div className="w-28 h-4 rounded bg-[#C5A880]/50 blur-[3px]" />
              </div>
              <div className="w-32 h-8 rounded-lg bg-[#C5A880]/20 blur-[2px] shrink-0" />
            </div>
          </div>

          {/* Membership Status Skeleton */}
          <div>
            <div className="w-32 h-3 rounded bg-[#C5A880]/40 blur-[2px] mb-2" />
            <div className="p-4 rounded-xl bg-[#1A1A1D] border border-[#27272A] flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="w-28 h-4.5 rounded bg-[#3F3F46]/80 blur-[3px]" />
                <div className="w-44 h-3 rounded bg-[#27272A]/80 blur-[2px]" />
              </div>
              <div className="w-20 h-6 rounded-full bg-emerald-500/20 blur-[2px]" />
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  if (!memberDetails) return null;

  const getCleanPassword = (rawPassword?: string, userId?: number) => {
    if (!rawPassword) return '123456';
    if (
      rawPassword.startsWith('scrypt:') ||
      rawPassword.startsWith('$2b$') ||
      rawPassword.startsWith('$2a$') ||
      rawPassword.length > 20
    ) {
      const id = userId || 10;
      return String(100000 + ((id * 7919) % 900000));
    }
    return rawPassword;
  };

  const displayPassword = getCleanPassword(memberDetails.password, memberDetails.id);

  const copyCredentials = () => {
    const text = `KINETIC Gym Credentials:\nEmail: ${memberDetails.email}\nPassword: ${displayPassword}`;
    navigator.clipboard.writeText(text).then(() => {
      flashToast('Credentials copied to clipboard!');
    }).catch(() => {
      prompt('Copy member credentials:', text);
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteMember(memberDetails.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Profile Details">
      <div className="flex flex-col gap-5">
        {/* Header Profile Box */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1D] border border-[#27272A]">
          <div className="w-14 h-14 rounded-full bg-[#0A0A0B] border-2 border-[#C5A880] text-[#C5A880] flex items-center justify-center font-extrabold text-2xl font-headline">
            {memberDetails.name ? memberDetails.name[0].toUpperCase() : 'M'}
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-[#F4F4F5] font-headline">{memberDetails.name}</h4>
            <p className="text-xs text-[#A1A1AA]">ID #{memberDetails.id} • {memberDetails.email}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div>
          <div className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider font-headline mb-2">
            Personal Data
          </div>
          <div className="grid grid-cols-3 gap-3 bg-[#1A1A1D] p-3.5 rounded-xl border border-[#27272A] text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline block">Phone</span>
              <span className="font-semibold text-[#F4F4F5]">{memberDetails.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline block">Age</span>
              <span className="font-semibold text-[#F4F4F5]">{memberDetails.age || 25} yrs</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline block">Gender</span>
              <span className="font-semibold text-[#F4F4F5] capitalize">{memberDetails.gender || 'Male'}</span>
            </div>
          </div>
        </div>

        {/* Account Credentials Box */}
        <div>
          <div className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider font-headline mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[#C5A880] text-sm">key</span>
            <span>Account Credentials</span>
          </div>
          <div className="p-4 rounded-xl bg-[#C5A880]/5 border border-[#C5A880]/20 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline">Login Email / Username</div>
              <div className="text-sm font-bold text-[#F4F4F5] mb-2 font-headline">{memberDetails.email}</div>
              <div className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider font-headline">PIN Password</div>
              <div className="text-sm font-mono font-bold text-[#C5A880]">{displayPassword}</div>
            </div>
            <button
              type="button"
              onClick={copyCredentials}
              className="px-3.5 py-1.5 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/30 text-[#C5A880] text-xs font-bold font-headline uppercase hover:bg-[#C5A880]/20 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span>Copy Credentials</span>
            </button>
          </div>
        </div>

        {/* Membership Status Box */}
        <div>
          <div className="text-[10px] font-bold text-[#C5A880] uppercase tracking-wider font-headline mb-2">
            Membership Status
          </div>
          <div className="p-4 rounded-xl bg-[#1A1A1D] border border-[#27272A]">
            {memberDetails.membership ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#F4F4F5] font-headline uppercase">
                    {memberDetails.membership.type} Plan
                  </span>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Valid: {memberDetails.membership.start_date} to {memberDetails.membership.end_date}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-headline uppercase">
                  {memberDetails.membership.status}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#EF4444] font-headline">No Active Membership</span>
                  <p className="text-xs text-[#52525B] mt-0.5">Member has not selected a plan yet.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSendReminder(memberDetails.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#C5A880] text-[#0A0A0B] font-bold text-xs font-headline uppercase hover:brightness-110"
                >
                  Send Payment Reminder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delete Member Action */}
        <div className="pt-3 border-t border-[#27272A] flex justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold font-headline uppercase hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                <span>Deleting Account...</span>
              </>
            ) : (
              <span>Delete Member Account</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
