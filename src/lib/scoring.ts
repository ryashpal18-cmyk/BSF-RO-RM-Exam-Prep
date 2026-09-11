import type { Difficulty, MockTestAttempt, MockTestResult, Question, SubjectId } from '@/types';
import { WEAK_TOPIC_ACCURACY_THRESHOLD } from '@/data/examConfig';

interface TopicAccuracyAgg {
  topicId: string;
  correct: number;
  total: number;
}

export function calculateMockTestResult(attempt: MockTestAttempt, questions: Question[]): MockTestResult {
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let rawScore = 0;
  let negativeMarks = 0;
  let totalTimeSeconds = 0;

  const subjectAgg = new Map<SubjectId, { marks: number; maxMarks: number; correct: number; wrong: number; unattempted: number }>();
  const difficultyAgg = new Map<Difficulty, { correct: number; total: number }>();
  const topicAgg = new Map<string, TopicAccuracyAgg>();

  for (const dist of attempt.config.subjectDistribution) {
    subjectAgg.set(dist.subjectId, { marks: 0, maxMarks: dist.marks, correct: 0, wrong: 0, unattempted: 0 });
  }

  for (const response of attempt.responses) {
    const q = questionMap.get(response.questionId);
    if (!q) continue;
    totalTimeSeconds += response.timeSpentSeconds;

    const subjEntry = subjectAgg.get(q.subjectId) ?? { marks: 0, maxMarks: 0, correct: 0, wrong: 0, unattempted: 0 };
    const diffEntry = difficultyAgg.get(q.difficulty) ?? { correct: 0, total: 0 };
    diffEntry.total += 1;

    const topicEntry = topicAgg.get(q.topicId) ?? { topicId: q.topicId, correct: 0, total: 0 };
    topicEntry.total += 1;

    if (response.selectedIndex === null) {
      unattemptedCount += 1;
      subjEntry.unattempted += 1;
    } else if (response.selectedIndex === q.correctIndex) {
      correctCount += 1;
      rawScore += q.marks;
      subjEntry.correct += 1;
      subjEntry.marks += q.marks;
      diffEntry.correct += 1;
      topicEntry.correct += 1;
    } else {
      wrongCount += 1;
      negativeMarks += q.negativeMarks;
      subjEntry.wrong += 1;
      subjEntry.marks -= q.negativeMarks;
    }

    subjectAgg.set(q.subjectId, subjEntry);
    difficultyAgg.set(q.difficulty, diffEntry);
    topicAgg.set(q.topicId, topicEntry);
  }

  const finalMarks = rawScore - negativeMarks;
  const percentage = attempt.config.totalMarks > 0 ? (finalMarks / attempt.config.totalMarks) * 100 : 0;
  const attempted = correctCount + wrongCount;
  const accuracy = attempted > 0 ? (correctCount / attempted) * 100 : 0;
  const avgTimePerQuestion = attempt.questionIds.length > 0 ? totalTimeSeconds / attempt.questionIds.length : 0;

  const weakTopicIds: string[] = [];
  const strongTopicIds: string[] = [];
  for (const t of topicAgg.values()) {
    const acc = t.total > 0 ? (t.correct / t.total) * 100 : 0;
    if (acc < WEAK_TOPIC_ACCURACY_THRESHOLD) weakTopicIds.push(t.topicId);
    else strongTopicIds.push(t.topicId);
  }

  return {
    attemptId: attempt.id,
    rawScore,
    correctCount,
    wrongCount,
    unattemptedCount,
    negativeMarks,
    finalMarks,
    percentage,
    accuracy,
    totalTimeSeconds,
    avgTimePerQuestion,
    subjectWise: Array.from(subjectAgg.entries()).map(([subjectId, v]) => ({ subjectId, ...v })),
    difficultyWise: Array.from(difficultyAgg.entries()).map(([difficulty, v]) => ({ difficulty, ...v })),
    weakTopicIds,
    strongTopicIds,
    createdAt: new Date().toISOString()
  };
}

export function paletteStateFor(response: { visited: boolean; selectedIndex: number | null; markedForReview: boolean }) {
  if (!response.visited) return 'not_visited' as const;
  if (response.markedForReview && response.selectedIndex !== null) return 'answered_marked_review' as const;
  if (response.markedForReview) return 'marked_review' as const;
  if (response.selectedIndex !== null) return 'answered' as const;
  return 'not_answered' as const;
}
