import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Badge, Notice } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EXAM_CONFIG, SUBJECTS, DISCLAIMER } from '@/data/examConfig';
import {
  createFullMockAttempt,
  createSubjectMockAttempt,
  createAiMockAttempt,
  createAttemptFromFixed,
  saveFixedMockTest,
  appendQuestionsToAttempt,
  appendQuestionsToFixed,
  markAttemptGenerationDone,
  getAllFixedMockTests,
  deleteFixedMockTest,
  getInProgressAttempt
} from '@/lib/mockTestBuilder';
import { generateAiMockQuestionsStreaming, GeminiMockGenerationError } from '@/lib/gemini';
import { useAppState } from '@/context/AppStateContext';
import { useToast } from '@/context/ToastContext';
import type { FixedMockTest, Language, MockTestAttempt, Question, SubjectId } from '@/types';

// Minimum questions ready before the user is allowed to jump into the test
// while the rest keep generating in the background (matches one Gemini batch).
const MIN_READY_TO_START = 10;

type InstructionsTarget =
  | { type: 'full' }
  | { type: 'subject'; subjectId: SubjectId }
  | { type: 'ai' }
  | { type: 'fixed'; fixed: FixedMockTest };

export default function MockTests() {
  const navigate = useNavigate();
  const { language, settings } = useAppState();
  const { showToast } = useToast();
  const [inProgress, setInProgress] = useState<MockTestAttempt | undefined>();
  const [instructionsFor, setInstructionsFor] = useState<InstructionsTarget | null>(null);
  const [testLanguage, setTestLanguage] = useState<Language>(language);
  const [fixedTests, setFixedTests] = useState<FixedMockTest[]>([]);
  const [fixMock, setFixMock] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FixedMockTest | null>(null);

  // Live AI generation state — questions accumulate here in batches of 10 as Gemini responds.
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  // Once the user hits "Start Test", we track the created attempt/fixed-test id here so that
  // any further batches that arrive afterwards get appended live instead of being dropped.
  const activeAttemptIdRef = useRef<string | null>(null);
  const activeFixedIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    getInProgressAttempt().then(setInProgress);
    getAllFixedMockTests().then(setFixedTests);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const generateAiMock = async () => {
    const apiKey = settings?.geminiApiKey ?? '';
    if (!apiKey.trim()) {
      showToast('Add your Gemini API key in Settings first', 'error');
      return;
    }
    setAiQuestions([]);
    setAiError(null);
    activeAttemptIdRef.current = null;
    activeFixedIdRef.current = null;
    setFixMock(false);
    setAiStreaming(true);
    setInstructionsFor({ type: 'ai' });

    try {
      await generateAiMockQuestionsStreaming(apiKey, settings?.geminiModel || 'gemini-3.6-flash', async (batch) => {
        if (isMountedRef.current) {
          setAiQuestions((prev) => [...prev, ...batch]);
        }
        // If the user already started the test with an earlier batch, keep feeding it live.
        if (activeAttemptIdRef.current) {
          await appendQuestionsToAttempt(activeAttemptIdRef.current, batch);
        }
        if (activeFixedIdRef.current) {
          await appendQuestionsToFixed(activeFixedIdRef.current, batch);
        }
      });
    } catch (err) {
      const msg = err instanceof GeminiMockGenerationError ? err.message : 'Could not generate AI mock test. Try again.';
      if (isMountedRef.current) setAiError(msg);
      showToast(msg, 'error');
    } finally {
      if (isMountedRef.current) setAiStreaming(false);
      if (activeAttemptIdRef.current) {
        await markAttemptGenerationDone(activeAttemptIdRef.current);
      }
    }
  };

  const startTest = async () => {
    if (!instructionsFor) return;
    if (instructionsFor.type === 'full') {
      const attempt = await createFullMockAttempt(testLanguage);
      navigate(`/mock-tests/run/${attempt.id}`);
      return;
    }
    if (instructionsFor.type === 'subject') {
      const attempt = await createSubjectMockAttempt(instructionsFor.subjectId, testLanguage);
      navigate(`/mock-tests/run/${attempt.id}`);
      return;
    }
    if (instructionsFor.type === 'fixed') {
      const attempt = await createAttemptFromFixed(instructionsFor.fixed);
      navigate(`/mock-tests/run/${attempt.id}`);
      return;
    }

    // AI-generated: start with whatever batches are ready now; rest keeps streaming in via the refs.
    const readyNow = aiQuestions;
    if (readyNow.length === 0) return;

    if (fixMock) {
      const fixed = await saveFixedMockTest(`AI Mock Test — ${new Date().toLocaleDateString()}`, testLanguage, readyNow);
      activeFixedIdRef.current = fixed.id;
      showToast('Saved to Fixed Mock Tests — will keep filling up in the background', 'success');
    }
    const attempt = await createAiMockAttempt(readyNow, testLanguage, undefined, aiStreaming);
    activeAttemptIdRef.current = attempt.id;
    navigate(`/mock-tests/run/${attempt.id}`);
  };

  const confirmDeleteFixed = async () => {
    if (!deleteTarget) return;
    await deleteFixedMockTest(deleteTarget.id);
    setFixedTests((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  if (instructionsFor) {
    const subject = instructionsFor.type === 'subject' ? SUBJECTS.find((s) => s.id === instructionsFor.subjectId) : null;
    const isAi = instructionsFor.type === 'ai';
    const isFixed = instructionsFor.type === 'fixed';
    const questionCount =
      instructionsFor.type === 'full'
        ? EXAM_CONFIG.totalQuestions
        : instructionsFor.type === 'subject'
        ? subject?.totalQuestions
        : isAi
        ? aiQuestions.length
        : instructionsFor.fixed.questionIds.length;
    const durationMinutes =
      instructionsFor.type === 'full'
        ? EXAM_CONFIG.durationMinutes
        : instructionsFor.type === 'subject'
        ? Math.round((subject!.totalQuestions / EXAM_CONFIG.totalQuestions) * EXAM_CONFIG.durationMinutes)
        : isAi
        ? EXAM_CONFIG.durationMinutes
        : instructionsFor.fixed.config.durationMinutes;
    const title = isAi ? 'AI Mock Test (Gemini)' : isFixed ? instructionsFor.fixed.title : instructionsFor.type === 'full' ? 'Full Mock Test' : `${subject?.title.en} Mock Test`;
    const canStartAi = isAi && aiQuestions.length >= Math.min(MIN_READY_TO_START, EXAM_CONFIG.totalQuestions);

    return (
      <div className="space-y-4 pb-4">
        <h1 className="text-xl font-bold">Instructions <span className="font-hi text-muted font-normal text-lg">/ निर्देश</span></h1>
        <Card className="space-y-3 text-sm">
          <p className="font-semibold">{title}</p>
          <ul className="space-y-1.5 text-black/70 dark:text-white/70">
            <li>
              • Questions: {questionCount}
              {isAi && aiStreaming && ` of ${EXAM_CONFIG.totalQuestions} ready`}
              {' '}
              {isAi ? '(Gemini AI-generated)' : isFixed ? '(saved AI mock)' : '(from sample bank)'}
            </li>
            <li>• Duration: {durationMinutes} minutes</li>
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
          {isAi && (
            <label className="flex items-start gap-2 text-sm pt-1 border-t border-line dark:border-white/10">
              <input type="checkbox" className="mt-0.5" checked={fixMock} onChange={(e) => setFixMock(e.target.checked)} />
              <span>
                📌 <b>Fix Mock</b> — save this question set permanently so I can retake it later without generating a new one.
              </span>
            </label>
          )}
          {isAi && aiStreaming && (
            <p className="text-xs text-muted">
              ⏳ Generating in batches of 10... you can start as soon as {Math.min(MIN_READY_TO_START, EXAM_CONFIG.totalQuestions)} are ready — the
              rest will keep loading inside the test.
            </p>
          )}
          {isAi && aiError && !aiStreaming && aiQuestions.length === 0 && <p className="text-xs text-red-600">{aiError}</p>}
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
          {isAi && !aiStreaming && (
            <Button variant="secondary" className="flex-1" onClick={generateAiMock}>
              Regenerate
            </Button>
          )}
          <Button className="flex-1" disabled={isAi && !canStartAi} onClick={startTest}>
            {isAi && aiStreaming && !canStartAi ? `Waiting... ${aiQuestions.length}/${MIN_READY_TO_START}` : 'Start Test'}
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

      <Card className="border-2 border-brand-green2/40">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold">AI Mock Test</p>
          <Badge tone="info">Gemini</Badge>
        </div>
        <p className="text-muted text-xs font-hi mb-3">
          AI बनाता है {EXAM_CONFIG.totalQuestions} नए प्रश्न (10-10 के बैच में), आपके सभी subjects/topics के अनुसार
        </p>
        {settings?.geminiApiKey ? (
          <Button className="w-full" onClick={generateAiMock}>
            Generate AI Mock ({EXAM_CONFIG.totalQuestions} Qs)
          </Button>
        ) : (
          <>
            <p className="text-xs text-muted mb-2">Add a Gemini API key in Settings to use this.</p>
            <Link to="/settings">
              <Button variant="outline" className="w-full">
                Go to Settings
              </Button>
            </Link>
          </>
        )}
      </Card>

      {fixedTests.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3">Fixed Mock Tests</h2>
          <div className="space-y-2.5">
            {fixedTests.map((f) => (
              <Card key={f.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{f.title}</p>
                  <p className="text-muted text-xs">{f.questionIds.length} Qs · saved {new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => setInstructionsFor({ type: 'fixed', fixed: f })}>
                    Start
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(f)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete fixed mock test?"
        description="This saved question set will be removed. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDeleteFixed}
      />
    </div>
  );
}
