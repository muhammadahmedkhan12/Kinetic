import React from 'react';

export type AdminTab = 'overview' | 'members' | 'pending' | 'classes' | 'trainers' | 'revenue' | 'assets';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'members', label: 'Members Directory', icon: 'group' },
    { id: 'pending', label: 'Pending Approvals', icon: 'pending_actions' },
    { id: 'classes', label: 'Class Schedule', icon: 'calendar_month' },
    { id: 'trainers', label: 'Trainers', icon: 'sports_gymnastics' },
    { id: 'revenue', label: 'Revenue Analytics', icon: 'payments' },
    { id: 'assets', label: 'Equipment & Assets', icon: 'fitness_center' },
  ];

  return (
    <aside className="w-64 glass-card border-r border-white/10 p-6 flex flex-col justify-between hidden md:flex min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center font-black font-display text-slate-900 text-xl shadow-lg">
            K
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg text-primary tracking-wide">KINETIC</h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Staff Admin Portal</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-white/10">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/30 text-primary flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">Staff Admin</p>
            <p className="text-[10px] text-slate-400 truncate">admin@kineticgym.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
