import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, ProgressBar } from '@/components/common/Primitives';
import { SUBJECTS } from '@/data/examConfig';
import { getOverallProgress, getSubjectProgress, type ProgressCounts } from '@/lib/progress';
import { lastNDays } from '@/lib/date';
import { db } from '@/db/db';
import { useAppState } from '@/context/AppStateContext';

type RangeFilter = '7d' | '30d' | 'all';

export default function ProgressPage() {
  const { profile } = useAppState();
  const [overall, setOverall] = useState<ProgressCounts | null>(null);
  const [subjectRows, setSubjectRows] = useState<{ id: string; label: string; p: ProgressCounts }[]>([]);
  const [range, setRange] = useState<RangeFilter>('7d');
  const [activityData, setActivityData] = useState<{ day: string; minutes: number; questions: number }[]>([]);
  const [mockStats, setMockStats] = useState({ count: 0, best: 0, recent: 0, avgAccuracy: 0 });

  useEffect(() => {
    (async () => {
      setOverall(await getOverallProgress());
      const rows = await Promise.all(SUBJECTS.map(async (s) => ({ id: s.id, label: s.title.en, p: await getSubjectProgress(s.id) })));
      setSubjectRows(rows);

      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const keys = lastNDays(days);
      const rowsAct = await db.studyActivity.bulkGet(keys);
      setActivityData(
        keys.map((k, i) => ({
          day: k.slice(5),
          minutes: rowsAct[i]?.studyMinutes ?? 0,
          questions: rowsAct[i]?.questionsAttempted ?? 0
        }))
      );

      const results = await db.mockTestResults.toArray();
      if (results.length) {
        const best = Math.max(...results.map((r) => r.percentage));
        const recent = results.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].percentage;
        const avgAccuracy = results.reduce((s, r) => s + r.accuracy, 0) / results.length;
        setMockStats({ count: results.length, best, recent, avgAccuracy });
      }
    })();
  }, [range]);

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Progress <span className="font-hi text-muted font-normal text-lg">/ प्रगति</span>
      </h1>

      <div className="grid grid-cols-3 gap-2.5">
        <Card className="text-center">
          <b className="text-xl text-brand-green2 block">{overall?.percentage ?? 0}%</b>
          <p className="text-[11px] text-muted mt-1">Syllabus completed</p>
        </Card>
        <Card className="text-center">
          <b className="text-xl text-brand-green2 block">{mockStats.count}</b>
          <p className="text-[11px] text-muted mt-1">Mock tests</p>
        </Card>
        <Card className="text-center">
          <b className="text-xl text-brand-green2 block">{mockStats.avgAccuracy.toFixed(0)}%</b>
          <p className="text-[11px] text-muted mt-1">Accuracy</p>
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <b className="block text-sm">{profile?.streakCount ?? 0}</b>
            <span className="text-muted">Streak (days)</span>
          </div>
          <div>
            <b className="block text-sm">{mockStats.best.toFixed(0)}%</b>
            <span className="text-muted">Best score</span>
          </div>
          <div>
            <b className="block text-sm">{mockStats.recent.toFixed(0)}%</b>
            <span className="text-muted">Recent score</span>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-sm">Subject-wise Completion</p>
        </div>
        <div className="space-y-2.5">
          {subjectRows.map((r) => (
            <Card key={r.id}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{r.label}</span>
                <span className="text-brand-green2 font-semibold">{r.p.percentage}%</span>
              </div>
              <ProgressBar value={r.p.percentage} />
              <p className="text-[11px] text-muted mt-1.5">Weak: {r.p.weak} · Revision needed: {r.p.revisionNeeded}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-sm">Activity</p>
          <div className="flex gap-1.5">
            {(['7d', '30d', 'all'] as RangeFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-[11px] px-2.5 py-1 rounded-full border ${range === r ? 'bg-brand text-white border-brand' : 'border-line dark:border-white/10 text-muted'}`}
              >
                {r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'All time'}
              </button>
            ))}
          </div>
        </div>
        <Card>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={activityData}>
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#23734e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div>
        <p className="font-bold text-sm mb-2">Questions Attempted Trend</p>
        <Card>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={activityData}>
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Line type="monotone" dataKey="questions" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
