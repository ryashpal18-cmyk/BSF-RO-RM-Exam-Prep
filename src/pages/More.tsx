import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Primitives';

const items = [
  { to: '/practice', emoji: '✍️', titleEn: 'Practice', titleHi: 'अभ्यास' },
  { to: '/revision', emoji: '📅', titleEn: 'Revision Planner', titleHi: 'पुनरावृत्ति योजना' },
  { to: '/notes', emoji: '📝', titleEn: 'Notes', titleHi: 'नोट्स' },
  { to: '/bookmarks', emoji: '🔖', titleEn: 'Bookmarks', titleHi: 'बुकमार्क' },
  { to: '/wrong-questions', emoji: '❌', titleEn: 'Wrong Questions', titleHi: 'गलत प्रश्न' },
  { to: '/test-history', emoji: '🗂️', titleEn: 'Test History', titleHi: 'टेस्ट इतिहास' },
  { to: '/backup', emoji: '💾', titleEn: 'Data Backup', titleHi: 'डेटा बैकअप' },
  { to: '/settings', emoji: '⚙️', titleEn: 'Settings', titleHi: 'सेटिंग्स' },
  { to: '/about', emoji: 'ℹ️', titleEn: 'About', titleHi: 'ऐप के बारे में' }
];

export default function More() {
  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        More <span className="font-hi text-muted font-normal text-lg">/ अन्य</span>
      </h1>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="h-full">
              <span className="text-2xl block mb-1.5">{item.emoji}</span>
              <h3 className="font-bold text-sm">{item.titleEn}</h3>
              <p className="text-muted text-xs font-hi">{item.titleHi}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
