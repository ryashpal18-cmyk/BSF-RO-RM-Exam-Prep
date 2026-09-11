import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, EmptyState } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { SUBJECTS } from '@/data/examConfig';
import { ALL_QUESTIONS } from '@/data/questions';
import { getTopicById } from '@/data/syllabus';
import { db } from '@/db/db';
import { toggleTopicBookmark } from '@/lib/progress';
import { useToast } from '@/context/ToastContext';
import type { SubjectId, TopicProgress, QuestionStats } from '@/types';

export default function Bookmarks() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'topics' | 'questions'>('topics');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [bookmarkedTopics, setBookmarkedTopics] = useState<TopicProgress[]>([]);
  const [bookmarkedQuestionStats, setBookmarkedQuestionStats] = useState<QuestionStats[]>([]);

  const load = async () => {
    const topics = await db.topicProgress.filter((t) => t.bookmarked).toArray();
    setBookmarkedTopics(topics);
    const stats = await db.questionStats.filter((s) => s.bookmarked).toArray();
    setBookmarkedQuestionStats(stats);
  };

  useEffect(() => {
    load();
  }, []);

  const removeTopicBookmark = async (topicId: string) => {
    await toggleTopicBookmark(topicId);
    showToast('Bookmark removed', 'info');
    await load();
  };

  const removeQuestionBookmark = async (questionId: string) => {
    const stat = await db.questionStats.get(questionId);
    if (stat) await db.questionStats.put({ ...stat, bookmarked: false });
    showToast('Bookmark removed', 'info');
    await load();
  };

  const filteredTopics = bookmarkedTopics
    .map((tp) => getTopicById(tp.topicId))
    .filter((t): t is NonNullable<typeof t> => !!t)
    .filter((t) => subjectFilter === 'all' || t.subjectId === subjectFilter)
    .filter((t) => !search.trim() || t.title.en.toLowerCase().includes(search.toLowerCase()) || t.title.hi.includes(search));

  const filteredQuestions = bookmarkedQuestionStats
    .map((s) => ALL_QUESTIONS.find((q) => q.id === s.questionId))
    .filter((q): q is NonNullable<typeof q> => !!q)
    .filter((q) => subjectFilter === 'all' || q.subjectId === subjectFilter)
    .filter((q) => !search.trim() || q.questionEn.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Bookmarks <span className="font-hi text-muted font-normal text-lg">/ बुकमार्क</span>
      </h1>

      <div className="flex gap-2">
        <button onClick={() => setTab('topics')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${tab === 'topics' ? 'bg-brand text-white' : 'bg-white dark:bg-white/5 border border-line dark:border-white/10'}`}>
          Topics
        </button>
        <button onClick={() => setTab('questions')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${tab === 'questions' ? 'bg-brand text-white' : 'bg-white dark:bg-white/5 border border-line dark:border-white/10'}`}>
          Questions
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search / खोजें"
        className="w-full p-3 rounded-[11px] border border-line dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setSubjectFilter('all')} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${subjectFilter === 'all' ? 'bg-brand text-white border-brand' : 'border-line dark:border-white/10 text-muted'}`}>
          All
        </button>
        {SUBJECTS.map((s) => (
          <button key={s.id} onClick={() => setSubjectFilter(s.id)} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${subjectFilter === s.id ? 'bg-brand text-white border-brand' : 'border-line dark:border-white/10 text-muted'}`}>
            {s.title.en}
          </button>
        ))}
      </div>

      {tab === 'topics' && (
        filteredTopics.length === 0 ? (
          <EmptyState title="No bookmarked topics" subtitle="Bookmark topics from the Syllabus page to see them here." />
        ) : (
          <div className="space-y-2.5">
            {filteredTopics.map((t) => (
              <Card key={t.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{t.title.en}</p>
                  <p className="text-muted text-xs font-hi">{t.title.hi}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/practice?scope=topic&topicId=${t.id}`)}>Practice</Button>
                  <Button size="sm" variant="outline" onClick={() => removeTopicBookmark(t.id)}>Remove</Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === 'questions' && (
        filteredQuestions.length === 0 ? (
          <EmptyState title="No bookmarked questions" subtitle="Bookmark questions during Practice to see them here." />
        ) : (
          <div className="space-y-2.5">
            {filteredQuestions.map((q) => (
              <Card key={q.id}>
                <p className="text-sm">{q.questionEn}</p>
                <p className="text-xs text-muted font-hi mt-1">{q.questionHi}</p>
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="outline" onClick={() => removeQuestionBookmark(q.id)}>Remove</Button>
                </div>
              </Card>
            ))}
            <Button className="w-full" onClick={() => navigate('/practice?scope=bookmarked')}>
              Start Bookmarked Test
            </Button>
          </div>
        )
      )}
    </div>
  );
}
