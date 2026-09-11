import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Bookmark,
  CalendarClock,
  Database,
  Home,
  Info,
  ListChecks,
  NotebookPen,
  PenLine,
  Settings as SettingsIcon,
  TrendingUp,
  XCircle,
  History
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUiText } from '@/lib/i18n';

const mainItems = [
  { to: '/', icon: Home, key: 'home' as const, end: true },
  { to: '/syllabus', icon: BookOpen, key: 'syllabus' as const, end: false },
  { to: '/practice', icon: PenLine, key: 'practice' as const, end: false },
  { to: '/mock-tests', icon: ListChecks, key: 'mockTests' as const, end: false },
  { to: '/progress', icon: TrendingUp, key: 'progress' as const, end: false }
];

const secondaryItems = [
  { to: '/bookmarks', icon: Bookmark, key: 'bookmarks' as const },
  { to: '/wrong-questions', icon: XCircle, key: 'wrongQuestions' as const },
  { to: '/revision', icon: CalendarClock, key: 'revision' as const },
  { to: '/notes', icon: NotebookPen, key: 'notes' as const },
  { to: '/test-history', icon: History, key: 'testHistory' as const },
  { to: '/backup', icon: Database, key: 'dataBackup' as const },
  { to: '/settings', icon: SettingsIcon, key: 'settings' as const },
  { to: '/about', icon: Info, key: 'about' as const }
];

function linkClass(isActive: boolean) {
  return cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
    isActive ? 'bg-brand text-white' : 'text-black/60 dark:text-white/60 hover:bg-brand-light dark:hover:bg-white/5'
  );
}

export function Sidebar() {
  const t = useUiText();
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-black/5 dark:border-white/10 bg-white dark:bg-neutral-900 p-4 overflow-y-auto">
      <div className="mb-6 px-2">
        <p className="font-bold text-brand dark:text-brand-light leading-tight">BSF RO/RM</p>
        <p className="text-xs text-black/50 dark:text-white/50 font-hi">परीक्षा तैयारी</p>
      </div>
      <nav className="flex flex-col gap-1">
        {mainItems.map(({ to, icon: Icon, key, end }) => (
          <NavLink key={key} to={to} end={end} className={({ isActive }) => linkClass(isActive)}>
            <Icon size={18} /> {t(key)}
          </NavLink>
        ))}
      </nav>
      <div className="h-px bg-black/5 dark:bg-white/10 my-4" />
      <nav className="flex flex-col gap-1">
        {secondaryItems.map(({ to, icon: Icon, key }) => (
          <NavLink key={key} to={to} className={({ isActive }) => linkClass(isActive)}>
            <Icon size={18} /> {t(key)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
