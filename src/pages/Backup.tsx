import React, { useRef, useState } from 'react';
import { Card } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  exportFullBackup,
  exportSyllabusProgressOnly,
  downloadJson,
  validateBackupJson,
  importFullBackup,
  validateQuestionBankJson,
  importQuestionBank,
  resetMockTestHistory,
  resetSyllabusProgress,
  resetEntireApplication,
  type BackupPayload,
  type ImportSummary
} from '@/lib/backup';
import { useToast } from '@/context/ToastContext';
import type { Question } from '@/types';

export default function Backup() {
  const { showToast } = useToast();
  const backupFileRef = useRef<HTMLInputElement>(null);
  const questionFileRef = useRef<HTMLInputElement>(null);

  const [pendingBackup, setPendingBackup] = useState<BackupPayload | null>(null);
  const [pendingSummary, setPendingSummary] = useState<ImportSummary | null>(null);
  const [pendingQuestions, setPendingQuestions] = useState<Question[] | null>(null);
  const [pendingQuestionSummary, setPendingQuestionSummary] = useState<ImportSummary | null>(null);
  const [confirmAction, setConfirmAction] = useState<'reset-mock' | 'reset-syllabus' | 'reset-all' | null>(null);

  const doExportAll = async () => {
    const data = await exportFullBackup();
    downloadJson(`bsf-ro-rm-backup-${Date.now()}.json`, data);
    showToast('Backup exported', 'success');
  };

  const doExportSyllabus = async () => {
    const data = await exportSyllabusProgressOnly();
    downloadJson(`bsf-ro-rm-syllabus-progress-${Date.now()}.json`, data);
    showToast('Syllabus progress exported', 'success');
  };

  const onBackupFileChosen = async (file: File) => {
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const summary = validateBackupJson(json);
      setPendingSummary(summary);
      if (summary.valid) setPendingBackup(json as BackupPayload);
      else showToast(summary.message, 'error');
    } catch {
      showToast('Could not parse JSON file.', 'error');
    }
  };

  const confirmImportBackup = async () => {
    if (!pendingBackup) return;
    await importFullBackup(pendingBackup);
    showToast('Backup imported successfully', 'success');
    setPendingBackup(null);
    setPendingSummary(null);
  };

  const onQuestionFileChosen = async (file: File) => {
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const summary = validateQuestionBankJson(json);
      setPendingQuestionSummary(summary);
      if (summary.valid) setPendingQuestions(json as Question[]);
      else showToast(summary.message, 'error');
    } catch {
      showToast('Could not parse JSON file.', 'error');
    }
  };

  const confirmImportQuestions = async () => {
    if (!pendingQuestions) return;
    await importQuestionBank(pendingQuestions);
    showToast(`${pendingQuestions.length} questions imported`, 'success');
    setPendingQuestions(null);
    setPendingQuestionSummary(null);
  };

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Data Backup <span className="font-hi text-muted font-normal text-lg">/ डेटा बैकअप</span>
      </h1>

      <Card className="space-y-3">
        <p className="font-bold text-sm">Export</p>
        <Button className="w-full" variant="secondary" onClick={doExportAll}>
          Export All Data (JSON)
        </Button>
        <Button className="w-full" variant="secondary" onClick={doExportSyllabus}>
          Export Syllabus Progress Only
        </Button>
      </Card>

      <Card className="space-y-3">
        <p className="font-bold text-sm">Import</p>
        <input
          ref={backupFileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onBackupFileChosen(e.target.files[0])}
        />
        <Button className="w-full" variant="outline" onClick={() => backupFileRef.current?.click()}>
          Import Backup JSON
        </Button>
        {pendingSummary && (
          <div className="text-xs p-2.5 rounded-lg bg-brand-light dark:bg-white/5">
            <p>{pendingSummary.message}</p>
            {pendingSummary.valid && (
              <Button size="sm" className="mt-2" onClick={confirmImportBackup}>
                Confirm Import
              </Button>
            )}
          </div>
        )}

        <input
          ref={questionFileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onQuestionFileChosen(e.target.files[0])}
        />
        <Button className="w-full" variant="outline" onClick={() => questionFileRef.current?.click()}>
          Import Question Bank JSON
        </Button>
        {pendingQuestionSummary && (
          <div className="text-xs p-2.5 rounded-lg bg-brand-light dark:bg-white/5">
            <p>{pendingQuestionSummary.message}</p>
            {pendingQuestionSummary.valid && (
              <Button size="sm" className="mt-2" onClick={confirmImportQuestions}>
                Confirm Import
              </Button>
            )}
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <p className="font-bold text-sm text-red-600">Reset</p>
        <Button className="w-full" variant="outline" onClick={() => setConfirmAction('reset-mock')}>
          Reset Mock Test History Only
        </Button>
        <Button className="w-full" variant="outline" onClick={() => setConfirmAction('reset-syllabus')}>
          Reset Syllabus Progress Only
        </Button>
        <Button className="w-full" variant="destructive" onClick={() => setConfirmAction('reset-all')}>
          Reset Complete Application
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmAction === 'reset-mock'}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="Reset mock test history?"
        description="All mock test attempts and results will be permanently deleted. This cannot be undone."
        confirmLabel="Reset"
        destructive
        onConfirm={async () => {
          await resetMockTestHistory();
          showToast('Mock test history reset', 'success');
        }}
      />
      <ConfirmDialog
        open={confirmAction === 'reset-syllabus'}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="Reset syllabus progress?"
        description="All topic status, confidence, notes and revision schedules will be permanently deleted. This cannot be undone."
        confirmLabel="Reset"
        destructive
        onConfirm={async () => {
          await resetSyllabusProgress();
          showToast('Syllabus progress reset', 'success');
        }}
      />
      <ConfirmDialog
        open={confirmAction === 'reset-all'}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="Reset entire application?"
        description="This will permanently delete ALL your data — progress, tests, notes, bookmarks, everything — and cannot be undone."
        confirmLabel="Reset Everything"
        destructive
        onConfirm={resetEntireApplication}
      />
    </div>
  );
}
