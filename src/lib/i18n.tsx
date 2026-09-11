import React from 'react';
import type { Bilingual, Language } from '@/types';
import { useAppState } from '@/context/AppStateContext';

export function renderBilingual(text: Bilingual, language: Language): React.ReactNode {
  if (language === 'en') return text.en;
  if (language === 'hi') return <span className="font-hi">{text.hi}</span>;
  return (
    <span>
      {text.en} <span className="text-muted-foreground font-hi">/ {text.hi}</span>
    </span>
  );
}

export function BilingualText({ text }: { text: Bilingual }) {
  const { language } = useAppState();
  return <>{renderBilingual(text, language)}</>;
}

// Static UI labels (not syllabus data) — small dictionary for chrome/navigation strings.
const UI_STRINGS: Record<string, Bilingual> = {
  home: { en: 'Home', hi: 'होम' },
  syllabus: { en: 'Syllabus', hi: 'पाठ्यक्रम' },
  practice: { en: 'Practice', hi: 'अभ्यास' },
  mockTests: { en: 'Mock Tests', hi: 'मॉक टेस्ट' },
  progress: { en: 'Progress', hi: 'प्रगति' },
  bookmarks: { en: 'Bookmarks', hi: 'बुकमार्क' },
  wrongQuestions: { en: 'Wrong Questions', hi: 'गलत प्रश्न' },
  revision: { en: 'Revision', hi: 'पुनरावृत्ति' },
  notes: { en: 'Notes', hi: 'नोट्स' },
  testHistory: { en: 'Test History', hi: 'टेस्ट इतिहास' },
  dataBackup: { en: 'Data Backup', hi: 'डेटा बैकअप' },
  settings: { en: 'Settings', hi: 'सेटिंग्स' },
  about: { en: 'About', hi: 'ऐप के बारे में' }
};

export function useUiText() {
  const { language } = useAppState();
  return (key: keyof typeof UI_STRINGS) => renderBilingual(UI_STRINGS[key], language);
}

export { UI_STRINGS };
