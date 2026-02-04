import React from 'react';
import { GridIcon, LayoutDashboardIcon, FolderKanbanIcon, CopyIcon, PlusCircleIcon } from './icons';
import type { Screen } from '../types';

// Simple settings icon
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboardIcon },
  { id: 'wizard', name: 'New Project', icon: PlusCircleIcon },
  { id: 'templates', name: 'Templates', icon: CopyIcon },
  { id: 'projects', name: 'My Projects', icon: FolderKanbanIcon },
  { id: 'settings', name: 'Settings', icon: SettingsIcon },
];

interface NavItemProps {
  item: (typeof navigation)[0];
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${
        isActive
          ? 'bg-brand-primary/10 text-brand-primary-hover shadow-[inset_0_0_0_1px_rgba(47,129,247,0.4),inset_2px_0_0_rgba(47,129,247,1)]'
          : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary'
      }`}
  >
    <item.icon className="h-5 w-5 mr-3" />
    {item.name}
  </button>
);

interface SidebarProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onScreenChange }) => {
  return (
    <aside className="w-64 flex-shrink-0 p-4 border-r border-brand-border">
      <div className="flex items-center mb-8">
        <div className="p-2 bg-brand-surface rounded-lg mr-3">
          <GridIcon className="h-6 w-6 text-brand-text-primary" />
        </div>
        <h1 className="text-xl font-bold text-brand-text-primary">PlannifyAI</h1>
      </div>
      <nav className="space-y-1">
        {navigation.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeScreen === item.id}
            onClick={() => onScreenChange(item.id as Screen)}
          />
        ))}
      </nav>
    </aside>
  );
};
