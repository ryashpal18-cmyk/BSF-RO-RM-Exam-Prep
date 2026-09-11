import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, EmptyState, Badge } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { getTopicById } from '@/data/syllabus';
import { db } from '@/db/db';
import { completeRevision, getRevisionBuckets, getWeakTopicIds, type RevisionBucket } from '@/lib/progress';
import { formatDateShort } from '@/lib/date';
import { useToast } from '@/context/ToastContext';
import type { TopicProgress } from '@/types';

export default function Revision() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [buckets, setBuckets] = useState<RevisionBucket>({ dueToday: [], overdue: [], upcoming: [] });
  const [recommendedIncomplete, setRecommendedIncomplete] = useState<TopicProgress | null>(null);
  const [recommendedWeak, setRecommendedWeak] = useState<string | null>(null);

  const load = async () => {
    setBuckets(await getRevisionBuckets());
    const inProgress = await db.topicProgress.where('status').equals('in_progress').first();
    const notStarted = inProgress ?? (await db.topicProgress.where('status').equals('not_started').first());
    setRecommendedIncomplete(notStarted ?? null);
    const weak = await getWeakTopicIds();
    setRecommendedWeak(weak[0] ?? null);
  };

  useEffect(() => {
    load();
  }, []);

  const complete = async (topicId: string) => {
    await completeRevision(topicId);
    showToast('Revision marked complete', 'success');
    await load();
  };

  const TopicRow = ({ tp, overdue }: { tp: TopicProgress; overdue?: boolean }) => {
    const t = getTopicById(tp.topicId);
    if (!t) return null;
    return (
      <Card className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{t.title.en}</p>
          <p className="text-muted text-xs font-hi">{t.title.hi}</p>
          <p className="text-[11px] text-muted mt-0.5">Due: {formatDateShort(tp.nextRevisionAt)}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {overdue && <Badge tone="danger">Overdue</Badge>}
          <Button size="sm" onClick={() => complete(tp.topicId)}>Done</Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Revision Planner <span className="font-hi text-muted font-normal text-lg">/ पुनरावृत्ति योजना</span>
      </h1>

      <Card>
        <p className="font-bold text-sm mb-2">Today's Plan <span className="font-hi text-muted font-normal">/ आज की योजना</span></p>
        <div className="space-y-2 text-sm">
          {recommendedIncomplete && (
            <button className="w-full text-left flex justify-between items-center p-2.5 rounded-lg bg-brand-light dark:bg-white/5" onClick={() => navigate(`/practice?scope=topic&topicId=${recommendedIncomplete.topicId}`)}>
              <span>📖 {getTopicById(recommendedIncomplete.topicId)?.title.en}</span>
              <span className="text-xs text-brand-green2 font-semibold">Study</span>
            </button>
          )}
          {recommendedWeak && (
            <button className="w-full text-left flex justify-between items-center p-2.5 rounded-lg bg-brand-light dark:bg-white/5" onClick={() => navigate(`/practice?scope=topic&topicId=${recommendedWeak}`)}>
              <span>⚠️ {getTopicById(recommendedWeak)?.title.en}</span>
              <span className="text-xs text-brand-green2 font-semibold">Weak Topic</span>
            </button>
          )}
          {buckets.dueToday[0] && (
            <button className="w-full text-left flex justify-between items-center p-2.5 rounded-lg bg-brand-light dark:bg-white/5" onClick={() => navigate(`/practice?scope=topic&topicId=${buckets.dueToday[0].topicId}`)}>
              <span>🔁 {getTopicById(buckets.dueToday[0].topicId)?.title.en}</span>
              <span className="text-xs text-brand-green2 font-semibold">Revise</span>
            </button>
          )}
          <button className="w-full text-left flex justify-between items-center p-2.5 rounded-lg bg-brand-light dark:bg-white/5" onClick={() => navigate('/practice?scope=random')}>
            <span>✍️ Quick practice test</span>
            <span className="text-xs text-brand-green2 font-semibold">Practice</span>
          </button>
        </div>
      </Card>

      <div>
        <p className="font-bold text-sm mb-2">Overdue ({buckets.overdue.length})</p>
        {buckets.overdue.length === 0 ? (
          <p className="text-xs text-muted">Nothing overdue 🎉</p>
        ) : (
          <div className="space-y-2">
            {buckets.overdue.map((tp) => <TopicRow key={tp.topicId} tp={tp} overdue />)}
          </div>
        )}
      </div>

      <div>
        <p className="font-bold text-sm mb-2">Due Today ({buckets.dueToday.length})</p>
        {buckets.dueToday.length === 0 ? (
          <p className="text-xs text-muted">Nothing due today.</p>
        ) : (
          <div className="space-y-2">
            {buckets.dueToday.map((tp) => <TopicRow key={tp.topicId} tp={tp} />)}
          </div>
        )}
      </div>

      <div>
        <p className="font-bold text-sm mb-2">Upcoming ({buckets.upcoming.length})</p>
        {buckets.upcoming.length === 0 ? (
          <EmptyState title="No upcoming revisions" subtitle="Mark topics as Completed in Syllabus to schedule spaced revisions automatically." />
        ) : (
          <div className="space-y-2">
            {buckets.upcoming.slice(0, 20).map((tp) => <TopicRow key={tp.topicId} tp={tp} />)}
          </div>
        )}
      </div>
    </div>
  );
}
