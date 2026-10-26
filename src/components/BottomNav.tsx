import React from 'react';

export type NavTab = 'home' | 'my-trips' | 'shop' | 'wallet' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'explore' },
    { id: 'my-trips', label: 'My Trips', icon: 'luggage' },
    { id: 'shop', label: 'Shop', icon: 'shopping_bag' },
    { id: 'wallet', label: 'Wallet', icon: 'account_balance_wallet' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ] as const;

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#f9f9ff]/90 backdrop-blur-xl border-t border-slate-200/70 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-all select-none ${
                isActive ? 'text-blue-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 700" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
