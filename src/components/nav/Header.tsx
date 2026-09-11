import React, { useState } from 'react';
import { useAppState } from '@/context/AppStateContext';
import type { Language } from '@/types';

const LANG_LABEL: Record<Language, string> = { en: 'EN', hi: 'HI', bilingual: 'HI + EN' };
const LANG_CYCLE: Language[] = ['bilingual', 'en', 'hi'];

export function Header() {
  const { updateProfile, language } = useAppState();
  const [open, setOpen] = useState(false);

  const cycleLanguage = async () => {
    const idx = LANG_CYCLE.indexOf(language);
    const next = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length];
    await updateProfile({ language: next });
    setOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 text-white shadow-[0_4px_18px_rgba(13,40,29,0.2)] safe-top"
      style={{ background: 'linear-gradient(135deg,#102f23,#246c4b)' }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-[42px] h-[42px] rounded-xl bg-white/15 grid place-items-center text-2xl shrink-0">🛡️</div>
        <div className="leading-tight">
          <b className="block text-sm">BSF RO/RM Exam Prep</b>
          <small className="block opacity-75 text-xs font-hi mt-0.5">BSF RO/RM परीक्षा तैयारी</small>
        </div>
      </div>
      <button
        onClick={cycleLanguage}
        className="border border-white/35 bg-white/15 text-white rounded-[9px] px-2.5 py-2 text-xs font-semibold"
        title="Change language"
      >
        {LANG_LABEL[language]}
      </button>
    </header>
  );
}
