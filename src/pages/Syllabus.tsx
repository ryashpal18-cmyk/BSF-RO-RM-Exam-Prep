import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { Card, Badge, Skeleton } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { SUBJECTS } from '@/data/examConfig';
import { ALL_CHAPTERS, ALL_TOPICS, getChaptersBySubject, getTopicsByChapter } from '@/data/syllabus';
import { db } from '@/db/db';
import { setTopicConfidence, setTopicImportance, toggleTopicBookmark, updateTopicStatus } from '@/lib/progress';
import { useToast } from '@/context/ToastContext';
import type { ConfidenceLevel, ImportanceLevel, SubjectId, Topic, TopicProgress, TopicStatus } from '@/types';
import { cn } from '@/lib/cn';

const STATUS_CYCLE: TopicStatus[] = ['not_started', 'in_progress', 'completed', 'weak', 'revision_needed'];
const STATUS_LABEL: Record<TopicStatus, { en: string; hi: string; tone: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  not_started: { en: 'Not Started', hi: 'शुरू नहीं किया', tone: 'default' },
  in_progress: { en: 'In Progress', hi: 'पढ़ाई जारी', tone: 'info' },
  completed: { en: 'Completed ✓', hi: 'पूरा हुआ', tone: 'success' },
  weak: { en: 'Weak ⚠️', hi: 'कमजोर विषय', tone: 'danger' },
  revision_needed: { en: 'Revision 🔁', hi: 'पुनरावृत्ति आवश्यक', tone: 'warning' }
};

export default function Syllabus() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [progressMap, setProgressMap] = useState<Record<string, TopicProgress>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>((params.get('subject') as SubjectId) || 'all');
  const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'order' | 'progress' | 'priority'>('order');

  const load = async () => {
    setLoading(true);
    const rows = await db.topicProgress.toArray();
    setProgressMap(Object.fromEntries(rows.map((r) => [r.topicId, r])));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const s = params.get('subject');
    if (s) setSubjectFilter(s as SubjectId);
  }, [params]);

  const chapters = useMemo(() => {
    return ALL_CHAPTERS.filter((c) => subjectFilter === 'all' || c.subjectId === subjectFilter).sort(
      (a, b) => a.order - b.order
    );
  }, [subjectFilter]);

  const filteredTopicsByChapter = useMemo(() => {
    const map: Record<string, Topic[]> = {};
    for (const chapter of chapters) {
      let topics = getTopicsByChapter(chapter.id);
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        topics = topics.filter((t) => t.title.en.toLowerCase().includes(q) || t.title.hi.includes(search.trim()));
      }
      if (statusFilter !== 'all') {
        topics = topics.filter((t) => (progressMap[t.id]?.status ?? 'not_started') === statusFilter);
      }
      if (sortBy === 'progress') {
        topics = [...topics].sort((a, b) => {
          const sa = progressMap[a.id]?.status === 'completed' ? 1 : 0;
          const sb = progressMap[b.id]?.status === 'completed' ? 1 : 0;
          return sb - sa;
        });
      } else if (sortBy === 'priority') {
        const rank: Record<ImportanceLevel, number> = { high_priority: 0, important: 1, normal: 2 };
        topics = [...topics].sort(
          (a, b) => rank[progressMap[a.id]?.importance ?? 'normal'] - rank[progressMap[b.id]?.importance ?? 'normal']
        );
      }
      if (topics.length) map[chapter.id] = topics;
    }
    return map;
  }, [chapters, search, statusFilter, sortBy, progressMap]);

  const visibleChapters = chapters.filter((c) => filteredTopicsByChapter[c.id]?.length);

  const toggleChapter = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(visibleChapters.map((c) => c.id)));
  const collapseAll = () => setExpanded(new Set());

  const cycleStatus = async (topicId: string) => {
    const current = progressMap[topicId]?.status ?? 'not_started';
    const idx = STATUS_CYCLE.indexOf(current);
    const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    await updateTopicStatus(topicId, nextStatus);
    await load();
  };

  const bookmark = async (topicId: string) => {
    const next = await toggleTopicBookmark(topicId);
    showToast(next ? 'Bookmarked' : 'Bookmark removed', 'success');
    await load();
  };

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold">
          Syllabus Tracker <span className="font-hi text-muted font-normal text-lg">/ पाठ्यक्रम प्रगति</span>
        </h1>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topic / विषय खोजें"
          className="w-full pl-10 pr-3 py-3 rounded-[11px] border border-line bg-white dark:bg-white/5 dark:border-white/10 text-sm outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
        <FilterChip active={subjectFilter === 'all'} onClick={() => { setSubjectFilter('all'); setParams({}); }}>
          All
        </FilterChip>
        {SUBJECTS.map((s) => (
          <FilterChip key={s.id} active={subjectFilter === s.id} onClick={() => { setSubjectFilter(s.id); setParams({ subject: s.id }); }}>
            {s.title.en}
          </FilterChip>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
        <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
          All Status
        </FilterChip>
        {STATUS_CYCLE.map((s) => (
          <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {STATUS_LABEL[s].en}
          </FilterChip>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={expandAll} className="text-xs font-semibold text-brand-green2">
            Expand All
          </button>
          <span className="text-muted">·</span>
          <button onClick={collapseAll} className="text-xs font-semibold text-brand-green2">
            Collapse All
          </button>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs border border-line dark:border-white/10 rounded-lg px-2 py-1.5 bg-white dark:bg-white/5"
        >
          <option value="order">Sort: Syllabus order</option>
          <option value="progress">Sort: Progress</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!loading && visibleChapters.length === 0 && (
        <div className="text-center py-10 text-muted text-sm">No topics found. / कोई विषय नहीं मिला।</div>
      )}

      {!loading &&
        visibleChapters.map((chapter) => {
          const topics = filteredTopicsByChapter[chapter.id] ?? [];
          const isOpen = expanded.has(chapter.id);
          const completedCount = topics.filter((t) => progressMap[t.id]?.status === 'completed').length;
          return (
            <Card key={chapter.id} className="!p-0 overflow-hidden">
              <button onClick={() => toggleChapter(chapter.id)} className="w-full flex items-center justify-between p-4 text-left">
                <div>
                  <h3 className="font-bold text-sm">{chapter.title.en}</h3>
                  <p className="text-muted text-xs font-hi">{chapter.title.hi}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted">
                    {completedCount}/{topics.length}
                  </span>
                  <ChevronDown size={18} className={cn('transition-transform text-muted', isOpen && 'rotate-180')} />
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-line dark:border-white/10">
                  {topics.map((topic) => {
                    const p = progressMap[topic.id];
                    const status = p?.status ?? 'not_started';
                    return (
                      <div key={topic.id} className="border-t border-line/70 dark:border-white/5 first:border-t-0 p-3.5">
                        <div className="flex justify-between items-start gap-3">
                          <button className="text-left flex-1" onClick={() => navigate(`/practice?scope=topic&topicId=${topic.id}`)}>
                            <p className="text-sm font-medium">{topic.title.en}</p>
                            <p className="text-xs text-muted font-hi">{topic.title.hi}</p>
                          </button>
                          <button onClick={() => bookmark(topic.id)} className="text-lg shrink-0">
                            {p?.bookmarked ? '🔖' : '📑'}
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          <button onClick={() => cycleStatus(topic.id)}>
                            <Badge tone={STATUS_LABEL[status].tone}>{STATUS_LABEL[status].en}</Badge>
                          </button>
                          <select
                            value={p?.confidence ?? 'medium'}
                            onChange={async (e) => {
                              await setTopicConfidence(topic.id, e.target.value as ConfidenceLevel);
                              await load();
                            }}
                            className="text-[11px] border border-line dark:border-white/10 rounded-full px-2 py-1 bg-transparent"
                          >
                            <option value="low">Confidence: Low</option>
                            <option value="medium">Confidence: Medium</option>
                            <option value="high">Confidence: High</option>
                          </select>
                          <select
                            value={p?.importance ?? 'normal'}
                            onChange={async (e) => {
                              await setTopicImportance(topic.id, e.target.value as ImportanceLevel);
                              await load();
                            }}
                            className="text-[11px] border border-line dark:border-white/10 rounded-full px-2 py-1 bg-transparent"
                          >
                            <option value="normal">Normal</option>
                            <option value="important">Important</option>
                            <option value="high_priority">High Priority</option>
                          </select>
                        </div>
                        <div className="flex gap-2 mt-2.5">
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/practice?scope=topic&topicId=${topic.id}`)}>
                            Start Practice
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              await updateTopicStatus(topic.id, 'completed');
                              await load();
                            }}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap',
        active ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-white/5 text-muted border-line dark:border-white/10'
      )}
    >
      {children}
    </button>
  );
}
