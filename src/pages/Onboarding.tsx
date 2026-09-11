import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Primitives';
import { useAppState } from '@/context/AppStateContext';
import type { DailyTarget, Language, PrepLevel, TargetPost } from '@/types';
import { cn } from '@/lib/cn';

const STEPS = ['language', 'post', 'level', 'examDate', 'target'] as const;

export default function Onboarding() {
  const { updateProfile } = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [language, setLanguage] = useState<Language>('bilingual');
  const [targetPost, setTargetPost] = useState<TargetPost>('both');
  const [prepLevel, setPrepLevel] = useState<PrepLevel>('starting');
  const [examDate, setExamDate] = useState('');
  const [dailyTarget, setDailyTarget] = useState<DailyTarget>(60);
  const [customTarget, setCustomTarget] = useState(45);

  const finish = async (skip = false) => {
    await updateProfile({
      onboardingCompleted: true,
      language: skip ? 'bilingual' : language,
      targetPost: skip ? 'both' : targetPost,
      prepLevel: skip ? 'starting' : prepLevel,
      examDate: skip ? null : examDate || null,
      dailyTargetMinutes: skip ? 60 : dailyTarget === 'custom' ? customTarget : dailyTarget
    });
    navigate('/', { replace: true });
  };

  const next = () => {
    if (step === STEPS.length - 1) finish();
    else setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen bg-appbg dark:bg-brand-dark flex flex-col p-5 safe-top safe-bottom">
      <div className="flex gap-1.5 mb-6 mt-2">
        {STEPS.map((s, i) => (
          <div key={s} className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-brand-green2' : 'bg-black/10 dark:bg-white/10')} />
        ))}
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Choose your language</h1>
            <p className="text-muted text-sm font-hi mb-5">अपनी भाषा चुनें</p>
            <div className="grid gap-3">
              {(
                [
                  { v: 'en', label: 'English' },
                  { v: 'hi', label: 'हिंदी' },
                  { v: 'bilingual', label: 'English + हिंदी' }
                ] as { v: Language; label: string }[]
              ).map((opt) => (
                <button key={opt.v} onClick={() => setLanguage(opt.v)}>
                  <Card className={cn('text-left', language === opt.v && 'border-brand-green2 border-2')}>
                    <span className="font-semibold">{opt.label}</span>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Choose your target post</h1>
            <p className="text-muted text-sm font-hi mb-5">अपना लक्ष्य पद चुनें</p>
            <div className="grid gap-3">
              {(
                [
                  { v: 'ro', label: 'BSF HC Radio Operator' },
                  { v: 'rm', label: 'BSF HC Radio Mechanic' },
                  { v: 'both', label: 'Both RO and RM' }
                ] as { v: TargetPost; label: string }[]
              ).map((opt) => (
                <button key={opt.v} onClick={() => setTargetPost(opt.v)}>
                  <Card className={cn('text-left', targetPost === opt.v && 'border-brand-green2 border-2')}>
                    <span className="font-semibold">{opt.label}</span>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Your preparation level</h1>
            <p className="text-muted text-sm font-hi mb-5">आपकी तैयारी का स्तर</p>
            <div className="grid gap-3">
              {(
                [
                  { v: 'starting', label: 'Starting preparation' },
                  { v: 'studying', label: 'Already studying' },
                  { v: 'revision', label: 'Revision stage' }
                ] as { v: PrepLevel; label: string }[]
              ).map((opt) => (
                <button key={opt.v} onClick={() => setPrepLevel(opt.v)}>
                  <Card className={cn('text-left', prepLevel === opt.v && 'border-brand-green2 border-2')}>
                    <span className="font-semibold">{opt.label}</span>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Exam date (optional)</h1>
            <p className="text-muted text-sm font-hi mb-5">परीक्षा तिथि (वैकल्पिक)</p>
            <Card>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-transparent outline-none text-base"
              />
            </Card>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-xl font-bold mb-1">Daily study target</h1>
            <p className="text-muted text-sm font-hi mb-5">दैनिक अध्ययन लक्ष्य</p>
            <div className="grid gap-3">
              {(
                [
                  { v: 30, label: '30 minutes' },
                  { v: 60, label: '1 hour' },
                  { v: 120, label: '2 hours' },
                  { v: 'custom', label: 'Custom' }
                ] as { v: DailyTarget; label: string }[]
              ).map((opt) => (
                <button key={String(opt.v)} onClick={() => setDailyTarget(opt.v)}>
                  <Card className={cn('text-left', dailyTarget === opt.v && 'border-brand-green2 border-2')}>
                    <span className="font-semibold">{opt.label}</span>
                  </Card>
                </button>
              ))}
              {dailyTarget === 'custom' && (
                <Card>
                  <input
                    type="number"
                    min={5}
                    value={customTarget}
                    onChange={(e) => setCustomTarget(Number(e.target.value))}
                    className="w-full bg-transparent outline-none"
                    placeholder="Minutes per day"
                  />
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mt-6">
        <button onClick={() => finish(true)} className="text-sm text-muted font-medium">
          Skip
        </button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={back}>
              Back
            </Button>
          )}
          <Button onClick={next}>{step === STEPS.length - 1 ? 'Get Started' : 'Next'}</Button>
        </div>
      </div>
    </div>
  );
}
