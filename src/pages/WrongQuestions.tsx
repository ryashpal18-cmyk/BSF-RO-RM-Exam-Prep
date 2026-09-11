import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, EmptyState, Badge } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { ALL_QUESTIONS } from '@/data/questions';
import { db } from '@/db/db';
import { useToast } from '@/context/ToastContext';
import type { QuestionStats } from '@/types';

export default function WrongQuestions() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState<QuestionStats[]>([]);

  const load = async () => {
    const rows = await db.questionStats.filter((s) => s.incorrectCount > 0 && !s.masteredWrong).toArray();
    setStats(rows);
  };

  useEffect(() => {
    load();
  }, []);

  const markMastered = async (questionId: string) => {
    const s = await db.questionStats.get(questionId);
    if (s) await db.questionStats.put({ ...s, masteredWrong: true });
    showToast('Marked as mastered', 'success');
    await load();
  };

  const items = stats.map((s) => ({ stat: s, q: ALL_QUESTIONS.find((q) => q.id === s.questionId) })).filter((i) => i.q);

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Wrong Questions <span className="font-hi text-muted font-normal text-lg">/ गलत प्रश्न</span>
      </h1>

      {items.length === 0 ? (
        <EmptyState title="No wrong questions yet" subtitle="Questions you answer incorrectly during practice or mock tests will show up here for revision." />
      ) : (
        <>
          <Button className="w-full" onClick={() => navigate('/practice?scope=wrong_questions')}>
            Retry All Wrong Questions
          </Button>
          <div className="space-y-2.5">
            {items.map(({ stat, q }) => (
              <Card key={stat.questionId}>
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm flex-1">{q!.questionEn}</p>
                  <Badge tone="danger">{stat.incorrectCount}x wrong</Badge>
                </div>
                <p className="text-xs text-muted font-hi mt-1">{q!.questionHi}</p>
                <div className="mt-2 p-2.5 rounded-lg bg-brand-light dark:bg-white/5 text-xs">
                  <p className="font-semibold mb-0.5">Correct answer:</p>
                  <p>{q!.optionsEn[q!.correctIndex]}</p>
                </div>
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="outline" onClick={() => markMastered(stat.questionId)}>
                    Mark as Mastered
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
