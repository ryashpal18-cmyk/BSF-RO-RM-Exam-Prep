import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAppState } from '@/context/AppStateContext';
import type { Language } from '@/types';

interface NavItem {
  to: string;
  emoji: string;
  labelEn: string;
  labelHi: string;
  end?: boolean;
}

const items: NavItem[] = [
  { to: '/', emoji: '🏠', labelEn: 'Home', labelHi: 'होम', end: true },
  { to: '/syllabus', emoji: '📚', labelEn: 'Syllabus', labelHi: 'पाठ्यक्रम' },
  { to: '/mock-tests', emoji: '⏱️', labelEn: 'Mock', labelHi: 'मॉक टेस्ट' },
  { to: '/progress', emoji: '📊', labelEn: 'Progress', labelHi: 'प्रगति' },
  { to: '/more', emoji: '☰', labelEn: 'More', labelHi: 'अन्य' }
];

function labelFor(item: NavItem, language: Language) {
  if (language === 'en') return item.labelEn;
  if (language === 'hi') return item.labelHi;
  return item.labelEn;
}

export function BottomNav() {
  const { language } = useAppState();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-neutral-900 border-t border-line dark:border-white/10 safe-bottom"
      style={{ height: 72 }}
    >
      <div className="flex items-stretch justify-around h-full">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[55px] px-2 text-muted',
                isActive && 'text-[#1e704a] font-bold'
              )
            }
          >
            <span className="text-xl leading-none">{item.emoji}</span>
            <span className="text-[11px] leading-none mt-1">{labelFor(item, language)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
