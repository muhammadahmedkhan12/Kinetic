import React from 'react';

export type MemberScreen = 'home' | 'classes' | 'weight' | 'billing' | 'profile';

interface MemberBottomNavProps {
  activeScreen: MemberScreen;
  setActiveScreen: (screen: MemberScreen) => void;
  onOpenAICoach: () => void;
}

export const MemberBottomNav: React.FC<MemberBottomNavProps> = ({ activeScreen, setActiveScreen, onOpenAICoach }) => {
  const tabs: { id: MemberScreen; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'classes', label: 'Classes', icon: 'fitness_center' },
    { id: 'weight', label: 'Weight', icon: 'monitoring' },
    { id: 'billing', label: 'Billing', icon: 'credit_card' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full sm:max-w-2xl mx-auto px-4 pb-4">
      <div className="glass-card rounded-2xl p-2 border border-white/10 shadow-2xl flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveScreen(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenAICoach}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl bg-primary text-[#1C1B1C] font-bold shadow-md hover:scale-105 transition-all"
        >
          <span className="material-symbols-outlined text-xl">smart_toy</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">AI</span>
        </button>
      </div>
    </div>
  );
};
