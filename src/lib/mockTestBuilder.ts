import { db, ensureStatsForQuestions } from '@/db/db';
import { generateId } from './id';
import { EXAM_CONFIG, SUBJECTS } from '@/data/examConfig';
import { ALL_QUESTIONS } from '@/data/questions';
import type {
  FixedMockTest,
  Language,
  MockTestAttempt,
  MockTestConfig,
  MockTestType,
  Question,
  SubjectId
} from '@/types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The bundled question bank is a small sample set (clearly labelled as such in the UI),
// not the full 100-question official pattern. A full mock uses every available sample
// question, proportioned by subject, so the engine and scoring work end-to-end;
// a larger bank imported later via Data Backup will automatically fill out real full-length tests.

export async function createFullMockAttempt(language: Language): Promise<MockTestAttempt> {
  const questionIds: string[] = [];
  for (const subject of SUBJECTS) {
    const qs = shuffle(ALL_QUESTIONS.filter((q) => q.subjectId === subject.id));
    questionIds.push(...qs.map((q) => q.id));
  }

  const questions = questionIds.map((id) => ALL_QUESTIONS.find((q) => q.id === id)!);
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const scale = EXAM_CONFIG.totalQuestions > 0 ? questionIds.length / EXAM_CONFIG.totalQuestions : 1;

  const config: MockTestConfig = {
    totalQuestions: questionIds.length,
    totalMarks,
    durationMinutes: Math.max(10, Math.round(EXAM_CONFIG.durationMinutes * Math.min(1, scale + 0.15))),
    correctMarks: EXAM_CONFIG.correctMarks,
    wrongMarks: EXAM_CONFIG.wrongMarks,
    subjectDistribution: SUBJECTS.map((s) => {
      const qs = questions.filter((q) => q.subjectId === s.id);
      return { subjectId: s.id, questions: qs.length, marks: qs.reduce((sum, q) => sum + q.marks, 0) };
    })
  };

  return persistNewAttempt('full', config, questionIds, language);
}

export async function createSubjectMockAttempt(subjectId: SubjectId, language: Language): Promise<MockTestAttempt> {
  const subject = SUBJECTS.find((s) => s.id === subjectId)!;
  const qs = shuffle(ALL_QUESTIONS.filter((q) => q.subjectId === subjectId));
  const totalMarks = qs.reduce((sum, q) => sum + q.marks, 0);

  const config: MockTestConfig = {
    totalQuestions: qs.length,
    totalMarks,
    durationMinutes: Math.max(10, Math.round((subject.totalQuestions / EXAM_CONFIG.totalQuestions) * EXAM_CONFIG.durationMinutes)),
    correctMarks: EXAM_CONFIG.correctMarks,
    wrongMarks: EXAM_CONFIG.wrongMarks,
    subjectDistribution: [{ subjectId, questions: qs.length, marks: totalMarks }]
  };

  return persistNewAttempt('subject', config, qs.map((q) => q.id), language, subjectId);
}

async function persistNewAttempt(
  type: MockTestType,
  config: MockTestConfig,
  questionIds: string[],
  language: Language,
  subjectId?: SubjectId,
  generating = false
): Promise<MockTestAttempt> {
  const attempt: MockTestAttempt = {
    id: generateId('mock'),
    type,
    subjectId,
    config,
    language,
    questionIds,
    responses: questionIds.map((qid) => ({
      questionId: qid,
      selectedIndex: null,
      markedForReview: false,
      visited: false,
      timeSpentSeconds: 0
    })),
    startedAt: new Date().toISOString(),
    submittedAt: null,
    remainingSeconds: config.durationMinutes * 60,
    currentIndex: 0,
    status: 'in_progress',
    generating
  };
  await db.mockTestAttempts.put(attempt);
  return attempt;
}

export async function getInProgressAttempt(): Promise<MockTestAttempt | undefined> {
  return db.mockTestAttempts.where('status').equals('in_progress').first();
}

// ==================== AI Mock Test (Gemini-generated) ====================

/** Builds the MockTestConfig for a freshly-generated set of AI questions. */
export function buildAiMockConfig(questions: Question[]): MockTestConfig {
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  return {
    totalQuestions: questions.length,
    totalMarks,
    durationMinutes: EXAM_CONFIG.durationMinutes,
    correctMarks: EXAM_CONFIG.correctMarks,
    wrongMarks: EXAM_CONFIG.wrongMarks,
    subjectDistribution: SUBJECTS.map((s) => {
      const qs = questions.filter((q) => q.subjectId === s.id);
      return { subjectId: s.id, questions: qs.length, marks: qs.reduce((sum, q) => sum + q.marks, 0) };
    })
  };
}

/** Persists AI-generated questions into the question bank so scoring/bookmarks/stats work normally. */
export async function persistAiQuestions(questions: Question[]): Promise<void> {
  await db.questionBank.bulkPut(questions);
  await ensureStatsForQuestions(questions.map((q) => q.id));
}

/** Starts a live attempt from a freshly-generated (not necessarily saved) AI question set.
 *  Pass generating=true if more questions are still being fetched in the background — the
 *  Runner screen will then keep polling and appending them live. */
export async function createAiMockAttempt(
  questions: Question[],
  language: Language,
  config?: MockTestConfig,
  generating = false
): Promise<MockTestAttempt> {
  await persistAiQuestions(questions);
  const resolvedConfig = config ?? buildAiMockConfig(questions);
  return persistNewAttempt(
    'ai',
    resolvedConfig,
    questions.map((q) => q.id),
    language,
    undefined,
    generating
  );
}

/** Appends a newly-generated batch of AI questions to an already-started attempt (used while
 *  the rest of the AI mock test is still generating in the background). */
export async function appendQuestionsToAttempt(attemptId: string, newQuestions: Question[]): Promise<MockTestAttempt | undefined> {
  if (newQuestions.length === 0) return db.mockTestAttempts.get(attemptId);
  await persistAiQuestions(newQuestions);
  const attempt = await db.mockTestAttempts.get(attemptId);
  if (!attempt) return undefined;

  const newIds = newQuestions.map((q) => q.id);
  const updated: MockTestAttempt = {
    ...attempt,
    questionIds: [...attempt.questionIds, ...newIds],
    responses: [
      ...attempt.responses,
      ...newQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: null,
        markedForReview: false,
        visited: false,
        timeSpentSeconds: 0
      }))
    ],
    config: {
      ...attempt.config,
      totalQuestions: attempt.config.totalQuestions + newQuestions.length,
      totalMarks: attempt.config.totalMarks + newQuestions.reduce((sum, q) => sum + q.marks, 0),
      subjectDistribution: attempt.config.subjectDistribution.map((d) => {
        const add = newQuestions.filter((q) => q.subjectId === d.subjectId);
        return add.length
          ? { ...d, questions: d.questions + add.length, marks: d.marks + add.reduce((sum, q) => sum + q.marks, 0) }
          : d;
      })
    }
  };
  await db.mockTestAttempts.put(updated);
  return updated;
}

/** Marks an attempt as no longer receiving background-generated questions. */
export async function markAttemptGenerationDone(attemptId: string): Promise<void> {
  await db.mockTestAttempts.update(attemptId, { generating: false });
}

/** Starts a new attempt re-using the question set from a previously "Fixed" (saved) AI mock test. */
export async function createAttemptFromFixed(fixed: FixedMockTest): Promise<MockTestAttempt> {
  return persistNewAttempt('ai', fixed.config, fixed.questionIds, fixed.language);
}

// ==================== Fixed (saved) AI Mock Tests ====================

export async function saveFixedMockTest(
  title: string,
  language: Language,
  questions: Question[],
  config?: MockTestConfig
): Promise<FixedMockTest> {
  await persistAiQuestions(questions);
  const fixed: FixedMockTest = {
    id: generateId('fixed'),
    title,
    createdAt: new Date().toISOString(),
    language,
    config: config ?? buildAiMockConfig(questions),
    questionIds: questions.map((q) => q.id)
  };
  await db.fixedMockTests.put(fixed);
  return fixed;
}

/** Appends a newly-generated batch of AI questions into an already-saved Fixed Mock Test. */
export async function appendQuestionsToFixed(fixedId: string, newQuestions: Question[]): Promise<FixedMockTest | undefined> {
  if (newQuestions.length === 0) return db.fixedMockTests.get(fixedId);
  await persistAiQuestions(newQuestions);
  const fixed = await db.fixedMockTests.get(fixedId);
  if (!fixed) return undefined;
  const updated: FixedMockTest = {
    ...fixed,
    questionIds: [...fixed.questionIds, ...newQuestions.map((q) => q.id)],
    config: {
      ...fixed.config,
      totalQuestions: fixed.config.totalQuestions + newQuestions.length,
      totalMarks: fixed.config.totalMarks + newQuestions.reduce((sum, q) => sum + q.marks, 0),
      subjectDistribution: fixed.config.subjectDistribution.map((d) => {
        const add = newQuestions.filter((q) => q.subjectId === d.subjectId);
        return add.length
          ? { ...d, questions: d.questions + add.length, marks: d.marks + add.reduce((sum, q) => sum + q.marks, 0) }
          : d;
      })
    }
  };
  await db.fixedMockTests.put(updated);
  return updated;
}

export async function getAllFixedMockTests(): Promise<FixedMockTest[]> {
  const rows = await db.fixedMockTests.toArray();
  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function deleteFixedMockTest(id: string): Promise<void> {
  await db.fixedMockTests.delete(id);
}
