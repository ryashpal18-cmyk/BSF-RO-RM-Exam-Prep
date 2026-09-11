import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CircularProgress, Notice, ProgressBar } from '@/components/common/Primitives';
import { SUBJECTS, DISCLAIMER } from '@/data/examConfig';
import { getOverallProgress, getSubjectProgress, getTodayActivity, daysRemaining, type ProgressCounts } from '@/lib/progress';
import { useAppState } from '@/context/AppStateContext';
import { db } from '@/db/db';
import type { MockTestResult, SubjectId } from '@/types';

export default function Home() {
  const { profile, language } = useAppState();
  const [overall, setOverall] = useState<ProgressCounts | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<Record<string, ProgressCounts>>({});
  const [today, setToday] = useState({ studyMinutes: 0, questionsAttempted: 0, topicsCompleted: 0 });
  const [recentResult, setRecentResult] = useState<MockTestResult | null>(null);

  useEffect(() => {
    (async () => {
      const o = await getOverallProgress();
      setOverall(o);
      const entries = await Promise.all(
        SUBJECTS.map(async (s) => [s.id, await getSubjectProgress(s.id)] as const)
      );
      setSubjectProgress(Object.fromEntries(entries));
      setToday(await getTodayActivity());
      const results = await db.mockTestResults.toArray();
      if (results.length) setRecentResult(results.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]);
    })();
  }, []);

  const days = daysRemaining(profile?.examDate ?? null);
  const greetingName = profile?.studentName?.trim() ? profile.studentName.trim() : 'Aspirant';
  const showHi = language !== 'en';
  const showEn = language !== 'hi';

  return (
    <div className="space-y-5 pb-4">
      {/* Hero card */}
      <div className="rounded-[20px] p-5 text-white shadow-[0_12px_35px_rgba(18,61,40,0.16)]" style={{ background: 'linear-gradient(135deg,#153d2d,#2a865a)' }}>
        <p className="opacity-80 text-sm">
          {showHi && <span className="font-hi">नमस्ते {greetingName} 👋</span>}
          {showHi && showEn && ' · '}
          {showEn && <span>Hi {greetingName} 👋</span>}
        </p>
        <h1 className="text-2xl font-bold mt-1 mb-4 leading-snug">
          {showHi && <span className="font-hi block">आज की तैयारी शुरू करें</span>}
          {showEn && <span className="block">{showHi ? 'Start Today’s Prep' : 'Start Today’s Preparation'}</span>}
        </h1>
        <div className="flex items-center justify-between gap-4">
          <CircularProgress value={overall?.percentage ?? 0} />
          <div className="grid grid-cols-3 gap-2 flex-1">
            <div className="bg-white/15 rounded-[10px] p-2 text-center">
              <b className="block text-lg">{overall?.completed ?? 0}</b>
              <small className="block text-[10px] opacity-80">Completed</small>
            </div>
            <div className="bg-white/15 rounded-[10px] p-2 text-center">
              <b className="block text-lg">{overall?.inProgress ?? 0}</b>
              <small className="block text-[10px] opacity-80">Learning</small>
            </div>
            <div className="bg-white/15 rounded-[10px] p-2 text-center">
              <b className="block text-lg">{overall?.weak ?? 0}</b>
              <small className="block text-[10px] opacity-80">Weak</small>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs opacity-90">
          {days !== null && <span>📅 {days >= 0 ? `${days} days to exam` : 'Exam date passed'}</span>}
          <span>🔥 {profile?.streakCount ?? 0} day streak</span>
          <span>⏳ {today.studyMinutes}/{profile?.dailyTargetMinutes ?? 60} min today</span>
        </div>
      </div>

      {/* Subject progress */}
      <div>
        <h2 className="text-lg font-bold mb-3 px-0.5">Subject Progress <span className="font-hi text-muted font-normal text-base">/ विषय प्रगति</span></h2>
        <div className="grid grid-cols-2 gap-2.5">
          {SUBJECTS.map((s) => {
            const p = subjectProgress[s.id];
            return (
              <Link key={s.id} to={`/syllabus?subject=${s.id}`}>
                <Card>
                  <div className="flex justify-between gap-2">
                    <b className="text-sm leading-tight">
                      {s.title.en}
                      <br />
                      <small className="font-hi text-muted font-normal">{s.title.hi}</small>
                    </b>
                    <b className="text-brand-green2 text-sm">{p?.percentage ?? 0}%</b>
                  </div>
                  <ProgressBar value={p?.percentage ?? 0} className="mt-2.5" />
                  <p className="text-[11px] text-muted mt-1.5">
                    {p?.completed ?? 0}/{p?.total ?? 0} topics · {p?.weak ?? 0} weak
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold mb-3 px-0.5">Quick Actions <span className="font-hi text-muted font-normal text-base">/ त्वरित कार्य</span></h2>
        <div className="grid grid-cols-3 gap-2.5">
          <Link to="/syllabus" className="bg-white dark:bg-white/5 rounded-[14px] p-3.5 text-center shadow-[0_3px_14px_rgba(23,63,43,0.07)] font-bold text-xs">
            <span className="block text-2xl mb-1">📚</span>Continue
          </Link>
          <Link to="/practice?scope=random" className="bg-white dark:bg-white/5 rounded-[14px] p-3.5 text-center shadow-[0_3px_14px_rgba(23,63,43,0.07)] font-bold text-xs">
            <span className="block text-2xl mb-1">⚡</span>Quick Test
          </Link>
          <Link to="/mock-tests" className="bg-white dark:bg-white/5 rounded-[14px] p-3.5 text-center shadow-[0_3px_14px_rgba(23,63,43,0.07)] font-bold text-xs">
            <span className="block text-2xl mb-1">🧾</span>Full Mock
          </Link>
          <Link to="/practice?scope=weak_topics" className="bg-white dark:bg-white/5 rounded-[14px] p-3.5 text-center shadow-[0_3px_14px_rgba(23,63,43,0.07)] font-bold text-xs">
            <span className="block text-2xl mb-1">🔁</span>Weak Topics
          </Link>
          <Link to="/practice?scope=wrong_questions" className="bg-white dark:bg-white/5 rounded-[14px] p-3.5 text-center shadow-[0_3px_14px_rgba(23,63,43,0.07)] font-bold text-xs">
            <span className="block text-2xl mb-1">❌</span>Wrong Qs
          </Link>
          <Link to="/revision" className="bg-white dark:bg-white/5 rounded-[14px] p-3.5 text-center shadow-[0_3px_14px_rgba(23,63,43,0.07)] font-bold text-xs">
            <span className="block text-2xl mb-1">📅</span>Today's Plan
          </Link>
        </div>
      </div>

      {recentResult && (
        <div>
          <h2 className="text-lg font-bold mb-3 px-0.5">Recent Activity <span className="font-hi text-muted font-normal text-base">/ हाल की गतिविधि</span></h2>
          <Link to="/test-history">
            <Card>
              <div className="flex justify-between items-center">
                <b className="text-sm">Last Mock Test</b>
                <b className="text-sm">{recentResult.finalMarks.toFixed(2)} / {overall ? '' : ''}200</b>
              </div>
              <ProgressBar value={recentResult.percentage} className="mt-2.5" />
              <p className="text-[11px] text-muted mt-1.5">
                Correct {recentResult.correctCount} · Wrong {recentResult.wrongCount} · Unattempted {recentResult.unattemptedCount}
              </p>
            </Card>
          </Link>
        </div>
      )}

      <Notice>
        {DISCLAIMER.en}
        <br />
        <span className="font-hi">{DISCLAIMER.hi}</span>
      </Notice>
    </div>
  );
}
