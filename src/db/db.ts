import Dexie, { type Table } from 'dexie';
import type {
  AppSettings,
  FixedMockTest,
  MockTestAttempt,
  MockTestResult,
  Note,
  PracticeSession,
  Question,
  QuestionStats,
  StudyActivityDay,
  TopicProgress,
  UserProfile
} from '@/types';
import { ALL_TOPICS } from '@/data/syllabus';
import { ALL_QUESTIONS } from '@/data/questions';

export class AppDatabase extends Dexie {
  userProfile!: Table<UserProfile, string>;
  appSettings!: Table<AppSettings, string>;
  topicProgress!: Table<TopicProgress, string>;
  questionStats!: Table<QuestionStats, string>;
  questionBank!: Table<Question, string>; // importable/extendable question bank, seeded from bundled data
  notes!: Table<Note, string>;
  practiceSessions!: Table<PracticeSession, string>;
  mockTestAttempts!: Table<MockTestAttempt, string>;
  mockTestResults!: Table<MockTestResult, string>;
  studyActivity!: Table<StudyActivityDay, string>;
  fixedMockTests!: Table<FixedMockTest, string>; // AI mock tests the user chose to "Fix" (save) for later

  constructor() {
    super('bsf_ro_rm_exam_prep_db');
    this.version(1).stores({
      userProfile: 'id',
      appSettings: 'id',
      topicProgress: 'topicId, status, confidence, bookmarked, nextRevisionAt',
      questionStats: 'questionId, bookmarked, masteredWrong',
      questionBank: 'id, subjectId, chapterId, topicId, difficulty',
      notes: 'id, pinned, createdAt',
      practiceSessions: 'id, startedAt, completedAt',
      mockTestAttempts: 'id, status, startedAt, type',
      mockTestResults: 'attemptId, createdAt',
      studyActivity: 'date'
    });
    // v2: adds fixedMockTests store for saved/"Fixed" AI mock tests
    this.version(2).stores({
      userProfile: 'id',
      appSettings: 'id',
      topicProgress: 'topicId, status, confidence, bookmarked, nextRevisionAt',
      questionStats: 'questionId, bookmarked, masteredWrong',
      questionBank: 'id, subjectId, chapterId, topicId, difficulty',
      notes: 'id, pinned, createdAt',
      practiceSessions: 'id, startedAt, completedAt',
      mockTestAttempts: 'id, status, startedAt, type',
      mockTestResults: 'attemptId, createdAt',
      studyActivity: 'date',
      fixedMockTests: 'id, createdAt'
    });
  }
}

export const db = new AppDatabase();

const nowIso = () => new Date().toISOString();

export async function ensureSeeded(): Promise<void> {
  const profileCount = await db.userProfile.count();
  if (profileCount === 0) {
    const profile: UserProfile = {
      id: 'singleton',
      onboardingCompleted: false,
      studentName: '',
      language: 'bilingual',
      targetPost: 'both',
      prepLevel: 'starting',
      examDate: null,
      dailyTargetMinutes: 60,
      streakCount: 0,
      lastActiveDate: null
    };
    await db.userProfile.put(profile);
  }

  const settingsCount = await db.appSettings.count();
  if (settingsCount === 0) {
    const settings: AppSettings = {
      id: 'singleton',
      theme: 'system',
      fontSize: 'medium',
      soundEnabled: true,
      autoSaveTest: true,
      showAnswerImmediately: false,
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash'
    };
    await db.appSettings.put(settings);
  }

  const topicProgressCount = await db.topicProgress.count();
  if (topicProgressCount === 0) {
    const rows: TopicProgress[] = ALL_TOPICS.map((t) => ({
      topicId: t.id,
      status: 'not_started',
      confidence: 'medium',
      importance: 'normal',
      bookmarked: false,
      notes: '',
      lastStudiedAt: null,
      nextRevisionAt: null,
      revisionStage: 0,
      practiceAttempts: 0,
      practiceCorrect: 0,
      updatedAt: nowIso()
    }));
    await db.topicProgress.bulkPut(rows);
  }

  const questionBankCount = await db.questionBank.count();
  if (questionBankCount === 0) {
    await db.questionBank.bulkPut(ALL_QUESTIONS);
  }

  const questionStatsCount = await db.questionStats.count();
  if (questionStatsCount === 0) {
    const rows: QuestionStats[] = ALL_QUESTIONS.map((q) => ({
      questionId: q.id,
      bookmarked: false,
      attemptCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastAttemptedAt: null,
      lastAttemptCorrect: null,
      masteredWrong: false
    }));
    await db.questionStats.bulkPut(rows);
  }
}

export async function ensureStatsForQuestions(questionIds: string[]): Promise<void> {
  for (const id of questionIds) {
    const existing = await db.questionStats.get(id);
    if (!existing) {
      await db.questionStats.put({
        questionId: id,
        bookmarked: false,
        attemptCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        lastAttemptedAt: null,
        lastAttemptCorrect: null,
        masteredWrong: false
      });
    }
  }
}

export async function ensureProgressForTopics(topicIds: string[]): Promise<void> {
  for (const id of topicIds) {
    const existing = await db.topicProgress.get(id);
    if (!existing) {
      await db.topicProgress.put({
        topicId: id,
        status: 'not_started',
        confidence: 'medium',
        importance: 'normal',
        bookmarked: false,
        notes: '',
        lastStudiedAt: null,
        nextRevisionAt: null,
        revisionStage: 0,
        practiceAttempts: 0,
        practiceCorrect: 0,
        updatedAt: nowIso()
      });
    }
  }
}
