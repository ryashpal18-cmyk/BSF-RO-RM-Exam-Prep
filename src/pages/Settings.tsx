import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAppState } from '@/context/AppStateContext';
import { useToast } from '@/context/ToastContext';
import type { DailyTarget, Language, TargetPost, ThemeMode } from '@/types';

export default function Settings() {
  const { profile, settings, updateProfile, updateSettings } = useAppState();
  const { showToast } = useToast();
  const [confirmResetOnboarding, setConfirmResetOnboarding] = useState(false);

  if (!profile || !settings) return null;

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Settings <span className="font-hi text-muted font-normal text-lg">/ सेटिंग्स</span>
      </h1>

      <Card className="space-y-3">
        <p className="font-bold text-sm">Profile</p>
        <div>
          <label className="text-xs text-muted">Student Name</label>
          <input
            value={profile.studentName}
            onChange={(e) => updateProfile({ studentName: e.target.value })}
            placeholder="Your name"
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-muted">Target Post</label>
          <select
            value={profile.targetPost}
            onChange={(e) => updateProfile({ targetPost: e.target.value as TargetPost })}
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-1"
          >
            <option value="ro">BSF HC Radio Operator</option>
            <option value="rm">BSF HC Radio Mechanic</option>
            <option value="both">Both RO and RM</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted">Exam Date</label>
          <input
            type="date"
            value={profile.examDate ?? ''}
            onChange={(e) => updateProfile({ examDate: e.target.value || null })}
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-muted">Daily Study Target (minutes)</label>
          <input
            type="number"
            value={profile.dailyTargetMinutes}
            onChange={(e) => updateProfile({ dailyTargetMinutes: Number(e.target.value) })}
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-1"
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="font-bold text-sm">Language & Appearance</p>
        <div>
          <label className="text-xs text-muted">Language</label>
          <select
            value={profile.language}
            onChange={(e) => updateProfile({ language: e.target.value as Language })}
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-1"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="bilingual">English + हिंदी</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted">Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value as ThemeMode })}
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-1"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
            <option value="system">System Default</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted">Font Size</label>
          <select
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-1"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="font-bold text-sm">AI Mock Test (Gemini)</p>
        <p className="text-xs text-muted -mt-2">
          Add your own Google Gemini API key to generate a fresh 100-question AI mock test, covering
          every subject and topic in the syllabus. Get a free key at{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline">
            aistudio.google.com/apikey
          </a>
          . The key is stored only on this device.
        </p>
        <div>
          <label className="text-xs text-muted">Gemini API Key</label>
          <input
            type="password"
            autoComplete="off"
            value={settings.geminiApiKey ?? ''}
            onChange={(e) => updateSettings({ geminiApiKey: e.target.value })}
            placeholder="Paste your Gemini API key"
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-1 font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted">Gemini Model</label>
          <input
            value={settings.geminiModel ?? 'gemini-2.5-flash'}
            onChange={(e) => updateSettings({ geminiModel: e.target.value })}
            placeholder="gemini-2.5-flash"
            className="w-full border border-line dark:border-white/10 rounded-lg p-2.5 bg-transparent text-sm mt-1 font-mono"
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="font-bold text-sm">Practice & Test</p>
        <label className="flex items-center justify-between text-sm">
          Sound
          <input type="checkbox" checked={settings.soundEnabled} onChange={(e) => updateSettings({ soundEnabled: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between text-sm">
          Test Auto-save
          <input type="checkbox" checked={settings.autoSaveTest} onChange={(e) => updateSettings({ autoSaveTest: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between text-sm">
          Show Answer Immediately (default)
          <input
            type="checkbox"
            checked={settings.showAnswerImmediately}
            onChange={(e) => updateSettings({ showAnswerImmediately: e.target.checked })}
          />
        </label>
      </Card>

      <Card className="space-y-3">
        <p className="font-bold text-sm">Other</p>
        <Button variant="outline" className="w-full" onClick={() => setConfirmResetOnboarding(true)}>
          Reset Onboarding
        </Button>
        <Link to="/backup">
          <Button variant="outline" className="w-full">Backup & Restore</Button>
        </Link>
        <Link to="/about">
          <Button variant="outline" className="w-full">About & Disclaimer</Button>
        </Link>
      </Card>

      <ConfirmDialog
        open={confirmResetOnboarding}
        onOpenChange={setConfirmResetOnboarding}
        title="Reset onboarding?"
        description="You will see the welcome setup screens again next time you open the app."
        confirmLabel="Reset"
        onConfirm={async () => {
          await updateProfile({ onboardingCompleted: false });
          showToast('Onboarding reset', 'success');
        }}
      />
    </div>
  );
}
