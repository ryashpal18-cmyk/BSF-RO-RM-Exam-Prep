import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Badge, ProgressBar } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { SUBJECTS } from '@/data/examConfig';
import { ALL_QUESTIONS } from '@/data/questions';
import { getTopicById, getTopicsBySubject, getChaptersBySubject } from '@/data/syllabus';
import { db } from '@/db/db';
import { recordPracticeResult, logStudyActivity } from '@/lib/progress';
import { useAppState } from '@/context/AppStateContext';
import type { Difficulty, Question, SubjectId } from '@/types';
import { cn } from '@/lib/cn';

type Scope = 'topic' | 'chapter' | 'subject' | 'weak_topics' | 'wrong_questions' | 'bookmarked' | 'random';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Practice() {
  const [params] = useSearchParams();
  const { language } = useAppState();

  const [phase, setPhase] = useState<'setup' | 'running' | 'summary'>('setup');
  const [scope, setScope] = useState<Scope>((params.get('scope') as Scope) || 'random');
  const [subjectId, setSubjectId] = useState<SubjectId>('physics');
  const [topicId, setTopicId] = useState<string>(params.get('topicId') || '');
  const [chapterId, setChapterId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [showAnswerImmediately, setShowAnswerImmediately] = useState(true);
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleOpt, setShuffleOpt] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const urlTopic = params.get('topicId');
    if (urlTopic) {
      setTopicId(urlTopic);
      setScope('topic');
      const t = getTopicById(urlTopic);
      if (t) setSubjectId(t.subjectId);
    }
    const urlScope = params.get('scope') as Scope | null;
    if (urlScope) setScope(urlScope);
  }, [params]);

  async function buildQuestionPool(): Promise<Question[]> {
    let pool: Question[] = [];
    if (scope === 'topic' && topicId) pool = ALL_QUESTIONS.filter((q) => q.topicId === topicId);
    else if (scope === 'chapter' && chapterId) pool = ALL_QUESTIONS.filter((q) => q.chapterId === chapterId);
    else if (scope === 'subject') pool = ALL_QUESTIONS.filter((q) => q.subjectId === subjectId);
    else if (scope === 'random') pool = ALL_QUESTIONS;
    else if (scope === 'weak_topics') {
      const weak = await db.topicProgress.where('status').equals('weak').toArray();
      const ids = new Set(weak.map((w) => w.topicId));
      pool = ALL_QUESTIONS.filter((q) => ids.has(q.topicId));
    } else if (scope === 'wrong_questions') {
      const stats = await db.questionStats.filter((s) => s.incorrectCount > 0 && !s.masteredWrong).toArray();
      const ids = new Set(stats.map((s) => s.questionId));
      pool = ALL_QUESTIONS.filter((q) => ids.has(q.id));
    } else if (scope === 'bookmarked') {
      const stats = await db.questionStats.filter((s) => s.bookmarked).toArray();
      const ids = new Set(stats.map((s) => s.questionId));
      pool = ALL_QUESTIONS.filter((q) => ids.has(q.id));
    }

    if (difficulty !== 'mixed') pool = pool.filter((q) => q.difficulty === difficulty);
    if (shuffleQ) pool = shuffle(pool);
    return pool.slice(0, questionCount);
  }

  const start = async () => {
    const pool = await buildQuestionPool();
    setQuestions(pool);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setResults([]);
    setPhase(pool.length ? 'running' : 'setup');

    const stats = await db.questionStats.toArray();
    setBookmarkedIds(new Set(stats.filter((s) => s.bookmarked).map((s) => s.questionId)));
  };

  const q = questions[current];
  const optionOrder = useMemo(() => {
    if (!q) return [0, 1, 2, 3];
    const order = [0, 1, 2, 3];
    return shuffleOpt ? shuffle(order) : order;
  }, [q, shuffleOpt]);

  const persistAnswer = async (idx: number, correct: boolean) => {
    const stat = await db.questionStats.get(q.id);
    await db.questionStats.put({
      questionId: q.id,
      bookmarked: stat?.bookmarked ?? false,
      attemptCount: (stat?.attemptCount ?? 0) + 1,
      correctCount: (stat?.correctCount ?? 0) + (correct ? 1 : 0),
      incorrectCount: (stat?.incorrectCount ?? 0) + (correct ? 0 : 1),
      lastAttemptedAt: new Date().toISOString(),
      lastAttemptCorrect: correct,
      masteredWrong: correct ? stat?.masteredWrong ?? false : false
    });
    await recordPracticeResult(q.topicId, correct);
    setResults((prev) => [...prev, { questionId: q.id, correct }]);
  };

  const selectOption = async (idx: number) => {
    if (revealed && showAnswerImmediately) return;
    setSelected(idx);
    if (showAnswerImmediately) {
      const correct = idx === q.correctIndex;
      setRevealed(true);
      await persistAnswer(idx, correct);
    }
  };

  const next = async () => {
    if (!revealed && selected !== null && !showAnswerImmediately) {
      const correct = selected === q.correctIndex;
      await persistAnswer(selected, correct);
    }
    if (current + 1 >= questions.length) {
      await logStudyActivity({ questions: questions.length, minutes: Math.max(1, Math.round(questions.length * 0.8)) });
      setPhase('summary');
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const toggleBookmark = async () => {
    const stat = await db.questionStats.get(q.id);
    const nextVal = !(stat?.bookmarked ?? false);
    await db.questionStats.put({
      questionId: q.id,
      bookmarked: nextVal,
      attemptCount: stat?.attemptCount ?? 0,
      correctCount: stat?.correctCount ?? 0,
      incorrectCount: stat?.incorrectCount ?? 0,
      lastAttemptedAt: stat?.lastAttemptedAt ?? null,
      lastAttemptCorrect: stat?.lastAttemptCorrect ?? null,
      masteredWrong: stat?.masteredWrong ?? false
    });
    setBookmarkedIds((prev) => {
      const set = new Set(prev);
      if (nextVal) set.add(q.id);
      else set.delete(q.id);
      return set;
    });
  };

  if (phase === 'summary') {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    return (
      <div className="space-y-4 pb-4">
        <h1 className="text-xl font-bold">
          Practice Complete <span className="font-hi text-muted font-normal text-lg">/ अभ्यास पूर्ण</span>
        </h1>
        <Card>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-brand-green2">
              {correct}/{total}
            </p>
            <p className="text-muted text-sm mt-1">{total > 0 ? Math.round((correct / total) * 100) : 0}% correct</p>
          </div>
          <ProgressBar value={total > 0 ? (correct / total) * 100 : 0} />
        </Card>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => setPhase('setup')}>
            New Practice
          </Button>
          <Button variant="outline" className="flex-1" onClick={start}>
            Retry Same
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'running' && q) {
    const subject = SUBJECTS.find((s) => s.id === q.subjectId);
    const topic = getTopicById(q.topicId);
    return (
      <div className="space-y-4 pb-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {subject?.title.en} · {topic?.title.en}
          </span>
          <span>
            {current + 1} / {questions.length}
          </span>
        </div>
        <ProgressBar value={((current + 1) / questions.length) * 100} />

        <Card>
          <p className="text-base leading-relaxed">
            {language !== 'hi' && q.questionEn}
            {language === 'bilingual' && <br />}
            {language !== 'en' && <span className="font-hi block mt-1">{q.questionHi}</span>}
          </p>

          <div className="mt-3 space-y-2">
            {optionOrder.map((idx) => {
              const isSelected = selected === idx;
              const isCorrectOpt = idx === q.correctIndex;
              const showState = revealed;
              return (
                <button
                  key={idx}
                  onClick={() => selectOption(idx)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-[11px] border text-sm',
                    !showState && isSelected && 'border-brand-green2 bg-[#e9f7ef]',
                    !showState && !isSelected && 'border-line dark:border-white/10',
                    showState && isCorrectOpt && 'border-green-600 bg-[#e9f7ef]',
                    showState && isSelected && !isCorrectOpt && 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  )}
                >
                  <span className="font-semibold mr-1">{String.fromCharCode(65 + idx)}.</span>
                  {language !== 'hi' && q.optionsEn[idx]}
                  {language === 'bilingual' && ' / '}
                  {language !== 'en' && <span className="font-hi">{q.optionsHi[idx]}</span>}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="mt-3 p-3 rounded-lg bg-brand-light dark:bg-white/5 text-sm">
              <p className="font-semibold mb-1">Explanation / व्याख्या</p>
              <p>{q.explanationEn}</p>
              <p className="font-hi text-muted mt-1">{q.explanationHi}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <button onClick={toggleBookmark} className="text-lg">
              {bookmarkedIds.has(q.id) ? '🔖' : '📑'}
            </button>
            <Badge tone={q.difficulty === 'easy' ? 'success' : q.difficulty === 'medium' ? 'warning' : 'danger'}>
              {q.difficulty}
            </Badge>
          </div>
        </Card>

        <Button className="w-full" onClick={next} disabled={selected === null && showAnswerImmediately}>
          {current + 1 >= questions.length ? 'Finish' : 'Next Question'}
        </Button>
      </div>
    );
  }

  const chapters = getChaptersBySubject(subjectId);

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Practice <span className="font-hi text-muted font-normal text-lg">/ अभ्यास</span>
      </h1>

      <Card>
        <p className="font-semibold text-sm mb-2">Scope / दायरा</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['topic', 'Topic-wise'],
              ['chapter', 'Chapter-wise'],
              ['subject', 'Subject-wise'],
              ['weak_topics', 'Weak Topics'],
              ['wrong_questions', 'Wrong Questions'],
              ['bookmarked', 'Bookmarked'],
              ['random', 'Random Quick Test']
            ] as [Scope, string][]
          ).map(([v, label]) => (
            <button key={v} onClick={() => setScope(v)}>
              <div
                className={cn(
                  'text-xs font-semibold p-2.5 rounded-lg border text-center',
                  scope === v ? 'bg-brand text-white border-brand' : 'border-line dark:border-white/10'
                )}
              >
                {label}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {(scope === 'subject' || scope === 'chapter' || scope === 'topic') && (
        <Card>
          <p className="font-semibold text-sm mb-2">Subject</p>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value as SubjectId)}
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm"
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title.en}
              </option>
            ))}
          </select>

          {scope === 'chapter' && (
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-2"
            >
              <option value="">Select chapter</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title.en}
                </option>
              ))}
            </select>
          )}

          {scope === 'topic' && (
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-2"
            >
              <option value="">Select topic</option>
              {getTopicsBySubject(subjectId).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title.en}
                </option>
              ))}
            </select>
          )}
        </Card>
      )}

      <Card className="space-y-3">
        <div>
          <p className="font-semibold text-sm mb-2">Number of questions</p>
          <div className="flex gap-2 flex-wrap">
            {[5, 10, 20, 50].map((n) => (
              <button key={n} onClick={() => setQuestionCount(n)}>
                <Badge tone={questionCount === n ? 'success' : 'default'}>{n}</Badge>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-sm mb-2">Difficulty</p>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | 'mixed')}
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm"
          >
            <option value="mixed">Mixed</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <label className="flex items-center justify-between text-sm">
          Show answer immediately
          <input type="checkbox" checked={showAnswerImmediately} onChange={(e) => setShowAnswerImmediately(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between text-sm">
          Shuffle questions
          <input type="checkbox" checked={shuffleQ} onChange={(e) => setShuffleQ(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between text-sm">
          Shuffle options
          <input type="checkbox" checked={shuffleOpt} onChange={(e) => setShuffleOpt(e.target.checked)} />
        </label>
      </Card>

      <Button className="w-full" onClick={start}>
        Start Practice
      </Button>
    </div>
  );
}
