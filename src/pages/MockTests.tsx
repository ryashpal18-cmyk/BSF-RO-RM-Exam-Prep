import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Notice } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { EXAM_CONFIG, SUBJECTS, DISCLAIMER } from '@/data/examConfig';
import { createFullMockAttempt, createSubjectMockAttempt, getInProgressAttempt } from '@/lib/mockTestBuilder';
import { useAppState } from '@/context/AppStateContext';
import type { Language, MockTestAttempt, SubjectId } from '@/types';

export default function MockTests() {
  const navigate = useNavigate();
  const { language } = useAppState();
  const [inProgress, setInProgress] = useState<MockTestAttempt | undefined>();
  const [instructionsFor, setInstructionsFor] = useState<{ type: 'full' } | { type: 'subject'; subjectId: SubjectId } | null>(null);
  const [testLanguage, setTestLanguage] = useState<Language>(language);

  useEffect(() => {
    getInProgressAttempt().then(setInProgress);
  }, []);

  const startTest = async () => {
    if (!instructionsFor) return;
    const attempt =
      instructionsFor.type === 'full'
        ? await createFullMockAttempt(testLanguage)
        : await createSubjectMockAttempt(instructionsFor.subjectId, testLanguage);
    navigate(`/mock-tests/run/${attempt.id}`);
  };

  if (instructionsFor) {
    const subject = instructionsFor.type === 'subject' ? SUBJECTS.find((s) => s.id === instructionsFor.subjectId) : null;
    return (
      <div className="space-y-4 pb-4">
        <h1 className="text-xl font-bold">Instructions <span className="font-hi text-muted font-normal text-lg">/ निर्देश</span></h1>
        <Card className="space-y-3 text-sm">
          <p className="font-semibold">{instructionsFor.type === 'full' ? 'Full Mock Test' : `${subject?.title.en} Mock Test`}</p>
          <ul className="space-y-1.5 text-black/70 dark:text-white/70">
            <li>• Questions: {instructionsFor.type === 'full' ? EXAM_CONFIG.totalQuestions : subject?.totalQuestions} (from sample bank)</li>
            <li>• Duration: {instructionsFor.type === 'full' ? EXAM_CONFIG.durationMinutes : Math.round((subject!.totalQuestions / EXAM_CONFIG.totalQuestions) * EXAM_CONFIG.durationMinutes)} minutes</li>
            <li>• Correct answer: +{EXAM_CONFIG.correctMarks} marks</li>
            <li>• Wrong answer: {EXAM_CONFIG.wrongMarks} marks</li>
            <li>• Unattempted: 0 marks</li>
            <li>• Your progress auto-saves — you can safely close and resume.</li>
          </ul>
          <div>
            <p className="font-semibold mb-1.5">Language for this test</p>
            <div className="flex gap-2">
              {(['en', 'hi', 'bilingual'] as Language[]).map((l) => (
                <button key={l} onClick={() => setTestLanguage(l)}>
                  <Badge tone={testLanguage === l ? 'success' : 'default'}>{l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'EN + HI'}</Badge>
                </button>
              ))}
            </div>
          </div>
        </Card>
        <Notice>
          {DISCLAIMER.en}
          <br />
          <span className="font-hi">{DISCLAIMER.hi}</span>
        </Notice>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setInstructionsFor(null)}>
            Back
          </Button>
          <Button className="flex-1" onClick={startTest}>
            Start Test
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Mock Tests <span className="font-hi text-muted font-normal text-lg">/ मॉक टेस्ट</span>
      </h1>

      {inProgress && (
        <Card className="border-2 border-brand-accent">
          <p className="font-semibold text-sm mb-1">⏳ Resume in-progress test</p>
          <p className="text-xs text-muted mb-3">You have an unfinished mock test. Continue where you left off.</p>
          <Button className="w-full" onClick={() => navigate(`/mock-tests/run/${inProgress.id}`)}>
            Resume Test
          </Button>
        </Card>
      )}

      <Card>
        <p className="font-bold">Full Mock Test</p>
        <p className="text-muted text-xs font-hi mb-3">पूर्ण मॉक टेस्ट — {EXAM_CONFIG.totalQuestions} प्रश्न, {EXAM_CONFIG.durationMinutes} मिनट</p>
        <Button onClick={() => setInstructionsFor({ type: 'full' })}>Start Full Mock</Button>
      </Card>

      <div>
        <h2 className="text-lg font-bold mb-3">Subject-wise Mock Tests</h2>
        <div className="space-y-2.5">
          {SUBJECTS.map((s) => (
            <Card key={s.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{s.title.en}</p>
                <p className="text-muted text-xs font-hi">{s.title.hi} · {s.totalQuestions} Qs</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setInstructionsFor({ type: 'subject', subjectId: s.id })}>
                Start
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
