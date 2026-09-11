import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, EmptyState, ProgressBar } from '@/components/common/Primitives';
import { db } from '@/db/db';
import { formatDateShort } from '@/lib/date';
import type { MockTestAttempt, MockTestResult } from '@/types';

export default function TestHistory() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<{ attempt: MockTestAttempt; result: MockTestResult }[]>([]);

  useEffect(() => {
    (async () => {
      const attempts = await db.mockTestAttempts.where('status').equals('submitted').toArray();
      const results = await db.mockTestResults.toArray();
      const resultMap = Object.fromEntries(results.map((r) => [r.attemptId, r]));
      const combined = attempts
        .map((a) => ({ attempt: a, result: resultMap[a.id] }))
        .filter((r): r is { attempt: MockTestAttempt; result: MockTestResult } => !!r.result)
        .sort((a, b) => b.result.createdAt.localeCompare(a.result.createdAt));
      setRows(combined);
    })();
  }, []);

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Test History <span className="font-hi text-muted font-normal text-lg">/ टेस्ट इतिहास</span>
      </h1>

      {rows.length === 0 ? (
        <EmptyState title="No tests taken yet" subtitle="Your completed mock tests will appear here." />
      ) : (
        <div className="space-y-2.5">
          {rows.map(({ attempt, result }) => (
            <button key={attempt.id} className="w-full text-left" onClick={() => navigate(`/mock-tests/result/${attempt.id}`)}>
              <Card>
                <div className="flex justify-between items-center">
                  <b className="text-sm">{attempt.type === 'full' ? 'Full Mock Test' : 'Subject Mock Test'}</b>
                  <b className="text-sm">
                    {result.finalMarks.toFixed(2)} / {attempt.config.totalMarks}
                  </b>
                </div>
                <ProgressBar value={result.percentage} className="mt-2" />
                <p className="text-[11px] text-muted mt-1.5">
                  {formatDateShort(attempt.submittedAt)} · Correct {result.correctCount} · Wrong {result.wrongCount} · Unattempted {result.unattemptedCount}
                </p>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
