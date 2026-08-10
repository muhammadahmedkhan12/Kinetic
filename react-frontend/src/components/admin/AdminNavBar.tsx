import React from 'react';

export type AdminTab = 'overview' | 'members' | 'trainers' | 'classes' | 'revenue' | 'assets';

interface AdminNavBarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminNavBar: React.FC<AdminNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="dash-tabs flex flex-wrap items-center justify-start gap-1 border-b border-[#27272A] mb-8 pb-[1px]">
      {/* Overview Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('overview')}
        className={`dash-tab-btn text-[0.78rem] font-extrabold uppercase tracking-[0.06em] px-4 py-2.5 cursor-pointer transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap font-headline ${
          activeTab === 'overview'
            ? 'text-[#C5A880] border-[#C5A880]'
            : 'text-[#52525B] border-transparent hover:text-[#F4F4F5]'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9"/>
          <rect x="14" y="3" width="7" height="5"/>
          <rect x="14" y="12" width="7" height="9"/>
          <rect x="3" y="16" width="7" height="5"/>
        </svg>
        OVERVIEW
      </button>

      {/* Members Directory Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('members')}
        className={`dash-tab-btn text-[0.78rem] font-extrabold uppercase tracking-[0.06em] px-4 py-2.5 cursor-pointer transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap font-headline ${
          activeTab === 'members'
            ? 'text-[#C5A880] border-[#C5A880]'
            : 'text-[#52525B] border-transparent hover:text-[#F4F4F5]'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        MEMBERS DIRECTORY
      </button>

      {/* Trainers Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('trainers')}
        className={`dash-tab-btn text-[0.78rem] font-extrabold uppercase tracking-[0.06em] px-4 py-2.5 cursor-pointer transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap font-headline ${
          activeTab === 'trainers'
            ? 'text-[#C5A880] border-[#C5A880]'
            : 'text-[#52525B] border-transparent hover:text-[#F4F4F5]'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
          <line x1="16" y1="8" x2="2" y2="22"/>
          <line x1="17.5" y1="15" x2="9" y2="15"/>
        </svg>
        TRAINERS
      </button>

      {/* Classes Schedule Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('classes')}
        className={`dash-tab-btn text-[0.78rem] font-extrabold uppercase tracking-[0.06em] px-4 py-2.5 cursor-pointer transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap font-headline ${
          activeTab === 'classes'
            ? 'text-[#C5A880] border-[#C5A880]'
            : 'text-[#52525B] border-transparent hover:text-[#F4F4F5]'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        CLASSES SCHEDULE
      </button>

      {/* Revenue Analytics Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('revenue')}
        className={`dash-tab-btn text-[0.78rem] font-extrabold uppercase tracking-[0.06em] px-4 py-2.5 cursor-pointer transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap font-headline ${
          activeTab === 'revenue'
            ? 'text-[#C5A880] border-[#C5A880]'
            : 'text-[#52525B] border-transparent hover:text-[#F4F4F5]'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        REVENUE ANALYTICS
      </button>

      {/* Equipment & Assets Tab */}
      <button
        type="button"
        onClick={() => setActiveTab('assets')}
        className={`dash-tab-btn text-[0.78rem] font-extrabold uppercase tracking-[0.06em] px-4 py-2.5 cursor-pointer transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap font-headline ${
          activeTab === 'assets'
            ? 'text-[#C5A880] border-[#C5A880]'
            : 'text-[#52525B] border-transparent hover:text-[#F4F4F5]'
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 5v14M18 5v14M3 9h18M3 15h18" />
        </svg>
        EQUIPMENT & ASSETS
      </button>
    </div>
  );
};
