import type { Chapter, SubjectId, Topic } from '@/types';
import { physicsSyllabus } from './physics';
import { mathematicsSyllabus } from './mathematics';
import { chemistrySyllabus } from './chemistry';
import { englishSyllabus } from './english';
import { gkSyllabus } from './gk';

const all = [physicsSyllabus, mathematicsSyllabus, chemistrySyllabus, englishSyllabus, gkSyllabus];

export const ALL_CHAPTERS: Chapter[] = all.flatMap((s) => s.chapters);
export const ALL_TOPICS: Topic[] = all.flatMap((s) => s.topics);

export function getChaptersBySubject(subjectId: SubjectId): Chapter[] {
  return ALL_CHAPTERS.filter((c) => c.subjectId === subjectId).sort((a, b) => a.order - b.order);
}

export function getTopicsByChapter(chapterId: string): Topic[] {
  return ALL_TOPICS.filter((t) => t.chapterId === chapterId).sort((a, b) => a.order - b.order);
}

export function getTopicsBySubject(subjectId: SubjectId): Topic[] {
  return ALL_TOPICS.filter((t) => t.subjectId === subjectId);
}

export function getTopicById(topicId: string): Topic | undefined {
  return ALL_TOPICS.find((t) => t.id === topicId);
}

export function getChapterById(chapterId: string): Chapter | undefined {
  return ALL_CHAPTERS.find((c) => c.id === chapterId);
}

export const TOTAL_TOPIC_COUNT = ALL_TOPICS.length;
