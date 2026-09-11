import type { Question, SubjectId } from '@/types';
import { physicsQuestions } from './physics';
import { mathematicsQuestions } from './mathematics';
import { chemistryQuestions } from './chemistry';
import { englishQuestions, gkQuestions } from './englishGk';

export const ALL_QUESTIONS: Question[] = [
  ...physicsQuestions,
  ...mathematicsQuestions,
  ...chemistryQuestions,
  ...englishQuestions,
  ...gkQuestions
];

export function getQuestionsBySubject(subjectId: SubjectId): Question[] {
  return ALL_QUESTIONS.filter((q) => q.subjectId === subjectId);
}

export function getQuestionsByTopic(topicId: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.topicId === topicId);
}

export function getQuestionsByChapter(chapterId: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.chapterId === chapterId);
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}
