import React from 'react';
import { LiquidNavbar, LiquidNavItem, NimbusIcons } from '@/components/ui/liquid-glass-navbar';

export type NavTab = 'home' | 'my-trips' | 'shop' | 'wallet' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabIds: NavTab[] = ['home', 'my-trips', 'shop', 'wallet', 'profile'];
  const activeIndex = Math.max(0, tabIds.indexOf(currentTab));

  const items: LiquidNavItem[] = [
    { label: 'Home', icon: NimbusIcons.home, fx: 'glow' },
    { label: 'Trips', icon: NimbusIcons.plane, fx: 'plane' },
    { label: 'Shop', icon: NimbusIcons.bag, fx: 'pop' },
    { label: 'Wallet', icon: NimbusIcons.wallet, fx: 'spin' },
    { label: 'Profile', icon: NimbusIcons.user, fx: 'wave' },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-0 right-0 z-40 flex justify-center pointer-events-none px-2 pb-safe">
      <div className="pointer-events-auto shadow-2xl rounded-full">
        <LiquidNavbar
          items={items}
          active={activeIndex}
          onChange={(index) => onSelectTab(tabIds[index])}
          tone="light"
          sound={true}
        />
      </div>
    </div>
  );
};
