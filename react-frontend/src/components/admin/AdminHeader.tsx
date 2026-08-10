import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  onRefresh?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = () => {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 h-[72px] bg-[#0A0A0B] border-b border-[#27272A] px-8 flex items-center justify-between">
      <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
        {/* Brand Logo matching reference screenshots */}
        <div className="flex items-center gap-2">
          <a href="#" className="font-headline font-extrabold text-xl text-[#F4F4F5] tracking-widest uppercase flex items-center">
            KINETIC<span className="text-[#C5A880]">.</span>
          </a>
          <span className="text-[0.7rem] font-bold text-[#52525B] uppercase tracking-widest ml-2 font-headline">
            STAFF ADMIN
          </span>
        </div>

        {/* Sign Out Action Button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-1.5 rounded-lg bg-transparent text-[#A1A1AA] border border-[#27272A] text-xs font-bold font-headline uppercase hover:text-[#C5A880] hover:border-[#C5A880] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
