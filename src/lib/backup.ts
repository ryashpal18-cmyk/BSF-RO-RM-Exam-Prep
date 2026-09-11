import { db, ensureStatsForQuestions, ensureProgressForTopics } from '@/db/db';
import { ALL_TOPICS } from '@/data/syllabus';
import type { Question } from '@/types';

const BACKUP_VERSION = 1;

export interface BackupPayload {
  version: number;
  exportedAt: string;
  userProfile: unknown;
  appSettings: unknown;
  topicProgress: unknown[];
  questionStats: unknown[];
  notes: unknown[];
  practiceSessions: unknown[];
  mockTestAttempts: unknown[];
  mockTestResults: unknown[];
  studyActivity: unknown[];
  questionBank: unknown[];
}

export async function exportFullBackup(): Promise<BackupPayload> {
  const [
    userProfile,
    appSettings,
    topicProgress,
    questionStats,
    notes,
    practiceSessions,
    mockTestAttempts,
    mockTestResults,
    studyActivity,
    questionBank
  ] = await Promise.all([
    db.userProfile.get('singleton'),
    db.appSettings.get('singleton'),
    db.topicProgress.toArray(),
    db.questionStats.toArray(),
    db.notes.toArray(),
    db.practiceSessions.toArray(),
    db.mockTestAttempts.toArray(),
    db.mockTestResults.toArray(),
    db.studyActivity.toArray(),
    db.questionBank.toArray()
  ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    userProfile,
    appSettings,
    topicProgress,
    questionStats,
    notes,
    practiceSessions,
    mockTestAttempts,
    mockTestResults,
    studyActivity,
    questionBank
  };
}

export async function exportSyllabusProgressOnly(): Promise<unknown> {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    topicProgress: await db.topicProgress.toArray()
  };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportSummary {
  valid: boolean;
  message: string;
  counts?: Record<string, number>;
}

export function validateBackupJson(raw: unknown): ImportSummary {
  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, message: 'Invalid file: not a JSON object. / अमान्य फ़ाइल: JSON ऑब्जेक्ट नहीं है।' };
  }
  const data = raw as Partial<BackupPayload>;
  if (typeof data.version !== 'number') {
    return { valid: false, message: 'Invalid backup file: missing version. / अमान्य बैकअप फ़ाइल: संस्करण गायब है।' };
  }
  const counts: Record<string, number> = {};
  const arrayFields: (keyof BackupPayload)[] = [
    'topicProgress',
    'questionStats',
    'notes',
    'practiceSessions',
    'mockTestAttempts',
    'mockTestResults',
    'studyActivity',
    'questionBank'
  ];
  for (const field of arrayFields) {
    const val = data[field];
    if (val !== undefined) {
      if (!Array.isArray(val)) {
        return { valid: false, message: `Invalid field: ${field} should be an array.` };
      }
      counts[field] = val.length;
    }
  }
  return { valid: true, message: 'Backup file looks valid.', counts };
}

export async function importFullBackup(raw: BackupPayload): Promise<void> {
  await db.transaction(
    'rw',
    [db.userProfile, db.appSettings, db.topicProgress, db.questionStats, db.notes, db.practiceSessions, db.mockTestAttempts, db.mockTestResults, db.studyActivity, db.questionBank],
    async () => {
      if (raw.userProfile) await db.userProfile.put(raw.userProfile as never);
      if (raw.appSettings) await db.appSettings.put(raw.appSettings as never);
      if (raw.topicProgress?.length) await db.topicProgress.bulkPut(raw.topicProgress as never[]);
      if (raw.questionStats?.length) await db.questionStats.bulkPut(raw.questionStats as never[]);
      if (raw.notes?.length) await db.notes.bulkPut(raw.notes as never[]);
      if (raw.practiceSessions?.length) await db.practiceSessions.bulkPut(raw.practiceSessions as never[]);
      if (raw.mockTestAttempts?.length) await db.mockTestAttempts.bulkPut(raw.mockTestAttempts as never[]);
      if (raw.mockTestResults?.length) await db.mockTestResults.bulkPut(raw.mockTestResults as never[]);
      if (raw.studyActivity?.length) await db.studyActivity.bulkPut(raw.studyActivity as never[]);
      if (raw.questionBank?.length) await db.questionBank.bulkPut(raw.questionBank as never[]);
    }
  );
}

export function validateQuestionBankJson(raw: unknown): ImportSummary {
  if (!Array.isArray(raw)) {
    return { valid: false, message: 'Question bank file must be a JSON array of questions.' };
  }
  const requiredKeys: (keyof Question)[] = ['id', 'subjectId', 'chapterId', 'topicId', 'questionEn', 'optionsEn', 'correctIndex'];
  for (const item of raw) {
    for (const key of requiredKeys) {
      if (!(key in (item as object))) {
        return { valid: false, message: `Invalid question object: missing "${key}" field.` };
      }
    }
  }
  return { valid: true, message: `${raw.length} questions found and validated.`, counts: { questions: raw.length } };
}

export async function importQuestionBank(questions: Question[]): Promise<void> {
  await db.questionBank.bulkPut(questions);
  await ensureStatsForQuestions(questions.map((q) => q.id));
  await ensureProgressForTopics(Array.from(new Set(questions.map((q) => q.topicId))));
}

export async function resetMockTestHistory(): Promise<void> {
  await db.transaction('rw', [db.mockTestAttempts, db.mockTestResults], async () => {
    await db.mockTestAttempts.clear();
    await db.mockTestResults.clear();
  });
}

export async function resetSyllabusProgress(): Promise<void> {
  await db.topicProgress.clear();
  await ensureProgressForTopics(ALL_TOPICS.map((t) => t.id));
}

export async function resetEntireApplication(): Promise<void> {
  await db.delete();
  window.location.reload();
}
