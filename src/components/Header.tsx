import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavTab } from './BottomNav';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onOpenShare?: () => void;
  onOpenAIAdvisor?: () => void;
  onOpenInstallMobile?: () => void;
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onOpenAuth,
  onOpenProfile,
  onOpenShare,
  onOpenAIAdvisor,
  onOpenInstallMobile,
  currentTab,
  onSelectTab,
}) => {
  const { currentUser, userProfile } = useAuth();

  return (
    <header className="fixed top-0 w-full z-40 bg-[#f9f9ff]/95 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      {/* Main app bar with responsive max-w-7xl desktop width */}
      <div className="h-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack ? (
            <button
              onClick={onBack}
              aria-label="Go Back"
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:scale-95 transition-all -ml-2"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </button>
          ) : null}

          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <span className="material-symbols-outlined text-[20px] text-white">luggage</span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-[17px] tracking-tight text-slate-900 leading-none">
                Trip<span className="text-blue-600">Swipe</span>
              </span>
            </div>
            {title && (
              <span className="text-xs text-slate-500 font-medium truncate leading-tight">
                {title}
              </span>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links (Visible on desktop md+ viewports) */}
        {onSelectTab && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-2xs">
            {[
              { id: 'home', label: 'Home', icon: 'explore' },
              { id: 'my-trips', label: 'My Trips', icon: 'luggage' },
              { id: 'shop', label: 'Gear Store', icon: 'shopping_bag' },
              { id: 'wallet', label: 'Travel Wallet', icon: 'account_balance_wallet' },
              { id: 'profile', label: 'Profile', icon: 'person' },
            ].map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id as NavTab)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right action area */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onOpenShare && (
            <button
              type="button"
              onClick={onOpenShare}
              title="Invite Friends & Family / Share App"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px]">share</span>
            </button>
          )}

          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Account Profile"
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name || 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border border-blue-200 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs shadow-xs hover:border-blue-400 transition-colors">
                  {userProfile?.name ? (
                    userProfile.name.charAt(0).toUpperCase()
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  )}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
