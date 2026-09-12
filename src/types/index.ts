// ==================== Language ====================
export type Language = 'en' | 'hi' | 'bilingual';

export interface Bilingual {
  en: string;
  hi: string;
}

// ==================== Subjects ====================
export type SubjectId = 'physics' | 'mathematics' | 'chemistry' | 'english' | 'gk';

export interface Subject {
  id: SubjectId;
  title: Bilingual;
  color: string;
  totalMarks: number;
  totalQuestions: number;
}

// ==================== Syllabus ====================
export type TopicStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'weak'
  | 'revision_needed';

export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ImportanceLevel = 'normal' | 'important' | 'high_priority';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Topic {
  id: string;
  subjectId: SubjectId;
  chapterId: string;
  title: Bilingual;
  description: Bilingual;
  order: number;
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  title: Bilingual;
  order: number;
  topicIds: string[];
}

// Mutable per-user progress stored in IndexedDB, separate from static syllabus content
export interface TopicProgress {
  topicId: string; // primary key
  status: TopicStatus;
  confidence: ConfidenceLevel;
  importance: ImportanceLevel;
  bookmarked: boolean;
  notes: string;
  lastStudiedAt: string | null; // ISO date
  nextRevisionAt: string | null; // ISO date
  revisionStage: number; // 0-5, index into spaced repetition intervals
  practiceAttempts: number;
  practiceCorrect: number;
  updatedAt: string;
}

// ==================== Questions ====================
export interface Question {
  id: string;
  subjectId: SubjectId;
  chapterId: string;
  topicId: string;
  questionEn: string;
  questionHi: string;
  optionsEn: [string, string, string, string];
  optionsHi: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanationEn: string;
  explanationHi: string;
  difficulty: Difficulty;
  marks: number;
  negativeMarks: number;
  sourceYear?: string;
  isSample: boolean; // true for bundled demo/sample questions
  aiGenerated?: boolean; // true for questions generated via Gemini
}

// Mutable per-question stats, kept separate from static question content
export interface QuestionStats {
  questionId: string; // primary key
  bookmarked: boolean;
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  lastAttemptedAt: string | null;
  lastAttemptCorrect: boolean | null;
  masteredWrong: boolean; // marked as mastered from Wrong Questions screen
}

// ==================== Practice ====================
export type PracticeScope =
  | { type: 'topic'; topicId: string }
  | { type: 'chapter'; chapterId: string }
  | { type: 'subject'; subjectId: SubjectId }
  | { type: 'weak_topics' }
  | { type: 'wrong_questions' }
  | { type: 'bookmarked' }
  | { type: 'random' };

export interface PracticeSettings {
  questionCount: number | 'custom';
  customCount?: number;
  difficulty: Difficulty | 'mixed';
  showAnswerImmediately: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  language: Language;
}

export interface PracticeSessionAnswer {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean | null;
  timeSpentSeconds: number;
}

export interface PracticeSession {
  id: string;
  scope: PracticeScope;
  settings: PracticeSettings;
  questionIds: string[];
  answers: PracticeSessionAnswer[];
  startedAt: string;
  completedAt: string | null;
}

// ==================== Notes ====================
export type NoteAttachTo =
  | { type: 'subject'; subjectId: SubjectId }
  | { type: 'chapter'; chapterId: string }
  | { type: 'topic'; topicId: string }
  | { type: 'question'; questionId: string }
  | { type: 'general' };

export interface Note {
  id: string;
  attachTo: NoteAttachTo;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Mock Test ====================
export type QuestionPaletteState =
  | 'not_visited'
  | 'not_answered'
  | 'answered'
  | 'marked_review'
  | 'answered_marked_review';

export interface MockTestConfig {
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  correctMarks: number;
  wrongMarks: number; // negative value
  subjectDistribution: { subjectId: SubjectId; questions: number; marks: number }[];
}

export interface MockTestResponse {
  questionId: string;
  selectedIndex: number | null;
  markedForReview: boolean;
  visited: boolean;
  timeSpentSeconds: number;
}

export type MockTestType = 'full' | 'subject' | 'ai';

export interface MockTestAttempt {
  id: string;
  type: MockTestType;
  subjectId?: SubjectId; // for subject-wise mock
  config: MockTestConfig;
  language: Language;
  questionIds: string[];
  responses: MockTestResponse[];
  startedAt: string;
  submittedAt: string | null;
  remainingSeconds: number;
  currentIndex: number;
  status: 'in_progress' | 'submitted' | 'abandoned';
  generating?: boolean; // true while more AI questions are still being fetched in the background
}

export interface MockTestResult {
  attemptId: string;
  rawScore: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  negativeMarks: number;
  finalMarks: number;
  percentage: number;
  accuracy: number;
  totalTimeSeconds: number;
  avgTimePerQuestion: number;
  subjectWise: {
    subjectId: SubjectId;
    marks: number;
    maxMarks: number;
    correct: number;
    wrong: number;
    unattempted: number;
  }[];
  difficultyWise: { difficulty: Difficulty; correct: number; total: number }[];
  weakTopicIds: string[];
  strongTopicIds: string[];
  createdAt: string;
}

// ==================== Fixed (Saved) AI Mock Tests ====================
// A "Fixed Mock Test" is an AI-generated question set the user has chosen to
// save permanently (via the "Fix Mock" option), so it can be retaken later
// without calling the Gemini API again.
export interface FixedMockTest {
  id: string;
  title: string;
  createdAt: string;
  language: Language;
  config: MockTestConfig;
  questionIds: string[];
}

// ==================== Study Activity / Streak ====================
export interface StudyActivityDay {
  date: string; // YYYY-MM-DD, primary key
  studyMinutes: number;
  questionsAttempted: number;
  topicsCompleted: number;
}

// ==================== User Profile / Settings ====================
export type TargetPost = 'ro' | 'rm' | 'both';
export type PrepLevel = 'starting' | 'studying' | 'revision';
export type DailyTarget = 30 | 60 | 120 | 'custom';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  id: 'singleton';
  onboardingCompleted: boolean;
  studentName: string;
  language: Language;
  targetPost: TargetPost;
  prepLevel: PrepLevel;
  examDate: string | null;
  dailyTargetMinutes: number;
  streakCount: number;
  lastActiveDate: string | null;
}

export interface AppSettings {
  id: 'singleton';
  theme: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  autoSaveTest: boolean;
  showAnswerImmediately: boolean;
  geminiApiKey?: string; // stored locally on-device only, used to call Gemini API for AI Mock Tests
  geminiModel?: string; // e.g. "gemini-3.6-flash"
}
