import React from 'react';
import { GridIcon, LayoutDashboardIcon, FolderKanbanIcon, CopyIcon, PlusCircleIcon } from './icons';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboardIcon, href: '#', current: false },
  { name: 'My Projects', icon: FolderKanbanIcon, href: '#', current: false },
  { name: 'Templates', icon: CopyIcon, href: '#', current: false },
  { name: 'New Project', icon: PlusCircleIcon, href: '#', current: true },
];

const NavItem: React.FC<{ item: typeof navigation[0] }> = ({ item }) => (
  <a
    href={item.href}
    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${item.current
        ? 'bg-brand-primary/10 text-brand-primary-hover shadow-[inset_0_0_0_1px_rgba(47,129,247,0.4),inset_2px_0_0_rgba(47,129,247,1)]'
        : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary'
      }`}
  >
    <item.icon className="h-5 w-5 mr-3" />
    {item.name}
  </a>
);

export const Sidebar: React.FC = () => {
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
          <NavItem key={item.name} item={item} />
        ))}
      </nav>
    </aside>
  );
};