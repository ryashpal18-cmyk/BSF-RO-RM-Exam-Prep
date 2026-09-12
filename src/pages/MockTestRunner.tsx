import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '@/db/db';
import { getSubject, EXAM_CONFIG } from '@/data/examConfig';
import { calculateMockTestResult, paletteStateFor } from '@/lib/scoring';
import { logStudyActivity } from '@/lib/progress';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Primitives';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { MockTestAttempt, Question } from '@/types';
import { cn } from '@/lib/cn';

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const paletteColor: Record<string, string> = {
  not_visited: 'bg-[#e1e7e3] text-[#3a453e]',
  not_answered: 'bg-red-200 text-red-800',
  answered: 'bg-[#2a9865] text-white',
  marked_review: 'bg-purple-300 text-purple-900',
  answered_marked_review: 'bg-purple-500 text-white'
};

export default function MockTestRunner() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<MockTestAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const questionStartRef = useRef<number>(Date.now());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      if (!attemptId) return;
      const a = await db.mockTestAttempts.get(attemptId);
      if (!a) {
        navigate('/mock-tests', { replace: true });
        return;
      }
      setAttempt(a);
      const qs = (await db.questionBank.bulkGet(a.questionIds)).filter((q): q is Question => Boolean(q));
      setQuestions(qs);
      setLoading(false);
      questionStartRef.current = Date.now();
    })();
  }, [attemptId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return;
    const interval = setInterval(() => {
      setAttempt((prev) => {
        if (!prev) return prev;
        const remaining = prev.remainingSeconds - 1;
        if (remaining <= 0) {
          clearInterval(interval);
          void submitTest(prev, true);
          return { ...prev, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: remaining };
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.id]);

  // Poll for more AI questions arriving in the background (streaming AI Mock Test)
  useEffect(() => {
    if (!attempt?.id || !attempt.generating) return;
    const poll = setInterval(async () => {
      const latest = await db.mockTestAttempts.get(attempt.id);
      if (!latest) return;
      setAttempt((prev) => {
        if (!prev) return prev;
        if (latest.questionIds.length === prev.questionIds.length && latest.generating === prev.generating) {
          return prev;
        }
        const newIds = latest.questionIds.slice(prev.questionIds.length);
        if (newIds.length > 0) {
          db.questionBank.bulkGet(newIds).then((rows) => {
            const newQs = rows.filter((q): q is Question => Boolean(q));
            setQuestions((prevQs) => [...prevQs, ...newQs]);
          });
        }
        return {
          ...prev,
          questionIds: latest.questionIds,
          responses: [...prev.responses, ...latest.responses.slice(prev.responses.length)],
          config: latest.config,
          generating: latest.generating
        };
      });
    }, 3000);
    return () => clearInterval(poll);
  }, [attempt?.id, attempt?.generating, attempt?.questionIds.length]);

  // Auto-save every response
  const persist = (next: MockTestAttempt) => {
    setAttempt(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      db.mockTestAttempts.put(next);
    }, 300);
  };

  // Warn before leaving tab
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (attempt?.status === 'in_progress') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [attempt?.status]);

  if (loading || !attempt) {
    return <div className="py-20 text-center text-muted">Loading test...</div>;
  }

  const currentQ = questions[attempt.currentIndex];
  const currentResponse = attempt.responses[attempt.currentIndex];
  const subject = getSubject(currentQ?.subjectId ?? '');

  const recordTimeSpent = (a: MockTestAttempt): MockTestAttempt => {
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    questionStartRef.current = Date.now();
    const responses = [...a.responses];
    responses[a.currentIndex] = {
      ...responses[a.currentIndex],
      visited: true,
      timeSpentSeconds: responses[a.currentIndex].timeSpentSeconds + elapsed
    };
    return { ...a, responses };
  };

  const selectOption = (idx: number) => {
    const withTime = recordTimeSpent(attempt);
    const responses = [...withTime.responses];
    responses[attempt.currentIndex] = { ...responses[attempt.currentIndex], selectedIndex: idx, visited: true };
    persist({ ...withTime, responses });
  };

  const clearResponse = () => {
    const withTime = recordTimeSpent(attempt);
    const responses = [...withTime.responses];
    responses[attempt.currentIndex] = { ...responses[attempt.currentIndex], selectedIndex: null };
    persist({ ...withTime, responses });
  };

  const toggleMarkForReview = () => {
    const withTime = recordTimeSpent(attempt);
    const responses = [...withTime.responses];
    responses[attempt.currentIndex] = {
      ...responses[attempt.currentIndex],
      markedForReview: !responses[attempt.currentIndex].markedForReview,
      visited: true
    };
    persist({ ...withTime, responses });
  };

  const goTo = (index: number) => {
    const withTime = recordTimeSpent(attempt);
    persist({ ...withTime, currentIndex: index });
  };

  const saveAndNext = () => {
    const withTime = recordTimeSpent(attempt);
    const responses = [...withTime.responses];
    responses[attempt.currentIndex] = { ...responses[attempt.currentIndex], visited: true };
    const nextIndex = Math.min(attempt.currentIndex + 1, questions.length - 1);
    persist({ ...withTime, responses, currentIndex: nextIndex });
  };

  const submitTest = async (attemptToSubmit: MockTestAttempt, auto = false) => {
    const finalAttempt: MockTestAttempt = {
      ...attemptToSubmit,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };
    await db.mockTestAttempts.put(finalAttempt);
    const result = calculateMockTestResult(finalAttempt, questions);
    await db.mockTestResults.put(result);
    await logStudyActivity({ minutes: Math.round((finalAttempt.config.durationMinutes * 60 - finalAttempt.remainingSeconds) / 60), questions: questions.length });
    navigate(`/mock-tests/result/${finalAttempt.id}`, { replace: true });
  };

  const answeredCount = attempt.responses.filter((r) => r.selectedIndex !== null).length;
  const markedCount = attempt.responses.filter((r) => r.markedForReview).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold leading-tight">
            {attempt.type === 'full' ? 'Full Mock Test' : attempt.type === 'ai' ? 'AI Mock Test' : `${subject?.title.en} Mock Test`}
          </h1>
          <p className="text-[11px] text-muted">
            {attempt.type === 'ai' ? 'Auto-saved · AI-Generated Questions' : 'Auto-saved · Sample Questions'}
          </p>
          {attempt.generating && (
            <p className="text-[11px] text-brand-accent font-medium">
              ⏳ More questions loading... {questions.length}/{EXAM_CONFIG.totalQuestions}
            </p>
          )}
        </div>
        <div className="font-extrabold text-xl" style={{ color: '#d42b2b' }}>
          {formatTime(attempt.remainingSeconds)}
        </div>
      </div>

      {/* Question palette */}
      <div className="grid grid-cols-10 gap-1">
        {questions.map((_, i) => {
          const state = paletteStateFor(attempt.responses[i]);
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'text-[11px] rounded py-1.5 font-semibold',
                paletteColor[state],
                i === attempt.currentIndex && 'ring-2 ring-brand'
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {currentQ && (
        <Card>
          <p className="text-muted text-xs mb-1.5">
            {subject?.title.en} · Q{attempt.currentIndex + 1} of {questions.length}
          </p>
          <h2 className="text-base leading-relaxed font-medium">
            {attempt.language !== 'hi' && currentQ.questionEn}
            {attempt.language === 'bilingual' && <br />}
            {attempt.language !== 'en' && <span className="font-hi block mt-1">{currentQ.questionHi}</span>}
          </h2>

          <div className="mt-3 space-y-2">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => selectOption(idx)}
                className={cn(
                  'w-full text-left p-3.5 rounded-[11px] border text-sm',
                  currentResponse.selectedIndex === idx ? 'border-brand-green2 bg-[#e9f7ef]' : 'border-line dark:border-white/10'
                )}
              >
                <span className="font-semibold mr-1">{String.fromCharCode(65 + idx)}.</span>
                {attempt.language !== 'hi' && currentQ.optionsEn[idx]}
                {attempt.language === 'bilingual' && ' / '}
                {attempt.language !== 'en' && <span className="font-hi">{currentQ.optionsHi[idx]}</span>}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => goTo(Math.max(0, attempt.currentIndex - 1))} disabled={attempt.currentIndex === 0}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={clearResponse}>
              Clear Response
            </Button>
            <Button variant="secondary" size="sm" onClick={toggleMarkForReview}>
              {currentResponse.markedForReview ? '★ Marked' : '☆ Mark Review'}
            </Button>
          </div>
          <Button className="w-full mt-2" onClick={saveAndNext} disabled={attempt.currentIndex >= questions.length - 1}>
            Save & Next
          </Button>
        </Card>
      )}

      <Button variant="destructive" className="w-full" onClick={() => setShowSubmitConfirm(true)}>
        Submit Test
      </Button>

      <ConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit test?"
        description={
          <>
            Answered: {answeredCount} · Unanswered: {unansweredCount} · Marked for review: {markedCount} · Remaining time: {formatTime(attempt.remainingSeconds)}.
            This cannot be undone.
          </>
        }
        confirmLabel="Submit"
        destructive
        onConfirm={() => submitTest(attempt)}
      />
    </div>
  );
}
