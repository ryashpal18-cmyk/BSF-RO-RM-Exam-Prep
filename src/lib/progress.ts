import { db } from '@/db/db';
import { ALL_TOPICS, getChaptersBySubject, getTopicsByChapter, getTopicsBySubject } from '@/data/syllabus';
import { SPACED_REVISION_INTERVALS_DAYS, WEAK_TOPIC_ACCURACY_THRESHOLD } from '@/data/examConfig';
import type { SubjectId, TopicProgress, TopicStatus } from '@/types';
import { addDays, todayKey } from './date';

export interface ProgressCounts {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  weak: number;
  revisionNeeded: number;
  percentage: number;
}

export function summarizeProgress(rows: TopicProgress[]): ProgressCounts {
  const total = rows.length;
  const completed = rows.filter((r) => r.status === 'completed').length;
  const inProgress = rows.filter((r) => r.status === 'in_progress').length;
  const notStarted = rows.filter((r) => r.status === 'not_started').length;
  const weak = rows.filter((r) => r.status === 'weak').length;
  const revisionNeeded = rows.filter((r) => r.status === 'revision_needed').length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, inProgress, notStarted, weak, revisionNeeded, percentage };
}

export async function getAllTopicProgress(): Promise<TopicProgress[]> {
  return db.topicProgress.toArray();
}

export async function getOverallProgress(): Promise<ProgressCounts> {
  const rows = await getAllTopicProgress();
  return summarizeProgress(rows);
}

export async function getSubjectProgress(subjectId: SubjectId): Promise<ProgressCounts> {
  const topicIds = new Set(getTopicsBySubject(subjectId).map((t) => t.id));
  const rows = (await getAllTopicProgress()).filter((r) => topicIds.has(r.topicId));
  return summarizeProgress(rows);
}

export async function getChapterProgress(chapterId: string): Promise<ProgressCounts> {
  const topicIds = new Set(getTopicsByChapter(chapterId).map((t) => t.id));
  const rows = (await getAllTopicProgress()).filter((r) => topicIds.has(r.topicId));
  return summarizeProgress(rows);
}

export async function updateTopicStatus(topicId: string, status: TopicStatus): Promise<void> {
  const existing = await db.topicProgress.get(topicId);
  const now = new Date().toISOString();
  await db.topicProgress.put({
    topicId,
    status,
    confidence: existing?.confidence ?? 'medium',
    importance: existing?.importance ?? 'normal',
    bookmarked: existing?.bookmarked ?? false,
    notes: existing?.notes ?? '',
    lastStudiedAt: status === 'completed' || status === 'in_progress' ? now : existing?.lastStudiedAt ?? null,
    nextRevisionAt: existing?.nextRevisionAt ?? null,
    revisionStage: existing?.revisionStage ?? 0,
    practiceAttempts: existing?.practiceAttempts ?? 0,
    practiceCorrect: existing?.practiceCorrect ?? 0,
    updatedAt: now
  });
  if (status === 'completed') {
    await scheduleNextRevision(topicId, 0);
  }
}

export async function toggleTopicBookmark(topicId: string): Promise<boolean> {
  const existing = await db.topicProgress.get(topicId);
  const next = !(existing?.bookmarked ?? false);
  await db.topicProgress.update(topicId, { bookmarked: next, updatedAt: new Date().toISOString() });
  return next;
}

export async function setTopicConfidence(topicId: string, confidence: TopicProgress['confidence']): Promise<void> {
  await db.topicProgress.update(topicId, { confidence, updatedAt: new Date().toISOString() });
}

export async function setTopicImportance(topicId: string, importance: TopicProgress['importance']): Promise<void> {
  await db.topicProgress.update(topicId, { importance, updatedAt: new Date().toISOString() });
}

export async function setTopicNotes(topicId: string, notes: string): Promise<void> {
  await db.topicProgress.update(topicId, { notes, updatedAt: new Date().toISOString() });
}

// ==================== Spaced Revision ====================

export async function scheduleNextRevision(topicId: string, stage: number): Promise<void> {
  const clampedStage = Math.min(stage, SPACED_REVISION_INTERVALS_DAYS.length - 1);
  const daysAhead = SPACED_REVISION_INTERVALS_DAYS[clampedStage];
  const nextDate = addDays(new Date(), daysAhead).toISOString();
  await db.topicProgress.update(topicId, {
    nextRevisionAt: nextDate,
    revisionStage: clampedStage,
    updatedAt: new Date().toISOString()
  });
}

export async function completeRevision(topicId: string): Promise<void> {
  const existing = await db.topicProgress.get(topicId);
  const nextStage = (existing?.revisionStage ?? 0) + 1;
  await scheduleNextRevision(topicId, nextStage);
}

export async function setRevisionDateManually(topicId: string, iso: string): Promise<void> {
  await db.topicProgress.update(topicId, { nextRevisionAt: iso, updatedAt: new Date().toISOString() });
}

export interface RevisionBucket {
  dueToday: TopicProgress[];
  overdue: TopicProgress[];
  upcoming: TopicProgress[];
}

export async function getRevisionBuckets(): Promise<RevisionBucket> {
  const rows = (await getAllTopicProgress()).filter((r) => r.nextRevisionAt);
  const today = todayKey();
  const dueToday: TopicProgress[] = [];
  const overdue: TopicProgress[] = [];
  const upcoming: TopicProgress[] = [];

  for (const row of rows) {
    const key = todayKey(new Date(row.nextRevisionAt!));
    if (key === today) dueToday.push(row);
    else if (key < today) overdue.push(row);
    else upcoming.push(row);
  }
  return { dueToday, overdue, upcoming };
}

// ==================== Weak topic detection ====================

export async function recordPracticeResult(topicId: string, correct: boolean): Promise<void> {
  const existing = await db.topicProgress.get(topicId);
  const attempts = (existing?.practiceAttempts ?? 0) + 1;
  const correctCount = (existing?.practiceCorrect ?? 0) + (correct ? 1 : 0);
  const accuracy = attempts === 0 ? 100 : (correctCount / attempts) * 100;

  let status = existing?.status ?? 'not_started';
  // Only auto-flag weak based on accuracy after a meaningful sample size; never auto-complete a topic just from answering.
  if (attempts >= 4 && accuracy < WEAK_TOPIC_ACCURACY_THRESHOLD) {
    status = 'weak';
  } else if (status === 'weak' && accuracy >= WEAK_TOPIC_ACCURACY_THRESHOLD) {
    status = 'in_progress';
  }

  await db.topicProgress.put({
    topicId,
    status,
    confidence: existing?.confidence ?? 'medium',
    importance: existing?.importance ?? 'normal',
    bookmarked: existing?.bookmarked ?? false,
    notes: existing?.notes ?? '',
    lastStudiedAt: new Date().toISOString(),
    nextRevisionAt: existing?.nextRevisionAt ?? null,
    revisionStage: existing?.revisionStage ?? 0,
    practiceAttempts: attempts,
    practiceCorrect: correctCount,
    updatedAt: new Date().toISOString()
  });
}

export async function getWeakTopicIds(): Promise<string[]> {
  const rows = await db.topicProgress.where('status').equals('weak').toArray();
  return rows.map((r) => r.topicId);
}

// ==================== Streak & daily activity ====================

export async function logStudyActivity(opts: { minutes?: number; questions?: number; topicsCompleted?: number }): Promise<void> {
  const key = todayKey();
  const existing = await db.studyActivity.get(key);
  await db.studyActivity.put({
    date: key,
    studyMinutes: (existing?.studyMinutes ?? 0) + (opts.minutes ?? 0),
    questionsAttempted: (existing?.questionsAttempted ?? 0) + (opts.questions ?? 0),
    topicsCompleted: (existing?.topicsCompleted ?? 0) + (opts.topicsCompleted ?? 0)
  });
  await bumpStreak();
}

async function bumpStreak(): Promise<void> {
  const profile = await db.userProfile.get('singleton');
  if (!profile) return;
  const today = todayKey();
  if (profile.lastActiveDate === today) return; // already counted today

  const yesterday = todayKey(addDays(new Date(), -1));
  const newStreak = profile.lastActiveDate === yesterday ? profile.streakCount + 1 : 1;

  await db.userProfile.update('singleton', {
    streakCount: newStreak,
    lastActiveDate: today
  });
}

export async function getTodayActivity() {
  const key = todayKey();
  const row = await db.studyActivity.get(key);
  return row ?? { date: key, studyMinutes: 0, questionsAttempted: 0, topicsCompleted: 0 };
}

export function daysRemaining(examDateIso: string | null): number | null {
  if (!examDateIso) return null;
  const now = new Date();
  const exam = new Date(examDateIso);
  const diff = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}
