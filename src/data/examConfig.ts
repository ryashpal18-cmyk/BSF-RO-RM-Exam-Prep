import type { MockTestConfig, Subject } from '@/types';

// Central Exam Configuration — change here to update marking scheme / pattern everywhere
// without touching the test engine itself.
export const SUBJECTS: Subject[] = [
  { id: 'physics', title: { en: 'Physics', hi: 'भौतिक विज्ञान' }, color: '#1f3d2b', totalMarks: 80, totalQuestions: 40 },
  { id: 'mathematics', title: { en: 'Mathematics', hi: 'गणित' }, color: '#0f766e', totalMarks: 40, totalQuestions: 20 },
  { id: 'chemistry', title: { en: 'Chemistry', hi: 'रसायन विज्ञान' }, color: '#b45309', totalMarks: 40, totalQuestions: 20 },
  { id: 'english', title: { en: 'English', hi: 'अंग्रेजी' }, color: '#7c3aed', totalMarks: 20, totalQuestions: 10 },
  { id: 'gk', title: { en: 'General Knowledge', hi: 'सामान्य ज्ञान' }, color: '#be123c', totalMarks: 20, totalQuestions: 10 }
];

export const EXAM_CONFIG: MockTestConfig = {
  totalQuestions: 100,
  totalMarks: 200,
  durationMinutes: 120,
  correctMarks: 2,
  wrongMarks: -0.25,
  subjectDistribution: SUBJECTS.map((s) => ({
    subjectId: s.id,
    questions: s.totalQuestions,
    marks: s.totalMarks
  }))
};

export const SPACED_REVISION_INTERVALS_DAYS = [1, 3, 7, 15, 30];

export const WEAK_TOPIC_ACCURACY_THRESHOLD = 50; // percentage

export const DISCLAIMER = {
  en: 'Exam pattern and syllabus should be verified with the latest official BSF recruitment notification.',
  hi: 'परीक्षा पैटर्न और पाठ्यक्रम को BSF की नवीनतम आधिकारिक भर्ती अधिसूचना से सत्यापित करें।'
};

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
