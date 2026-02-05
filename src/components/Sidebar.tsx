import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GridIcon, LayoutDashboardIcon, FolderKanbanIcon, CopyIcon, PlusCircleIcon } from './icons';

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
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboardIcon, path: '/dashboard' },
  { id: 'wizard', name: 'New Project', icon: PlusCircleIcon, path: '/wizard' },
  { id: 'templates', name: 'Templates', icon: CopyIcon, path: '/templates' },
  { id: 'projects', name: 'My Projects', icon: FolderKanbanIcon, path: '/projects' },
  { id: 'settings', name: 'Settings', icon: SettingsIcon, path: '/settings' },
];

interface NavItemProps {
  item: (typeof navigation)[0];
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive }) => (
  <NavLink
    to={item.path}
    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${
        isActive
          ? 'bg-brand-primary/10 text-brand-primary-hover shadow-[inset_0_0_0_1px_rgba(47,129,247,0.4),inset_2px_0_0_rgba(47,129,247,1)]'
          : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary'
      }`}
  >
    <item.icon className="h-5 w-5 mr-3" />
    {item.name}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    // For projects route, match both /projects and /projects/:id
    if (path === '/projects') {
      return location.pathname.startsWith('/projects');
    }
    // For wizard route, match both /wizard and /wizard/:templateId
    if (path === '/wizard') {
      return location.pathname.startsWith('/wizard');
    }
    return location.pathname === path;
  };

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
          <NavItem key={item.id} item={item} isActive={isActive(item.path)} />
        ))}
      </nav>
    </aside>
  );
};
