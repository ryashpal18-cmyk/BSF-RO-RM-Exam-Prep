import React from 'react';
import { Card, Notice } from '@/components/common/Primitives';
import { DISCLAIMER, EXAM_CONFIG } from '@/data/examConfig';

export default function About() {
  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        About <span className="font-hi text-muted font-normal text-lg">/ ऐप के बारे में</span>
      </h1>

      <Card className="text-center py-6">
        <div className="text-4xl mb-2">🛡️</div>
        <p className="font-bold">BSF RO/RM Exam Prep</p>
        <p className="text-muted text-sm font-hi mt-0.5">BSF RO/RM परीक्षा तैयारी</p>
        <p className="text-xs text-muted mt-2">Version 1.0.0</p>
      </Card>

      <Card className="space-y-2 text-sm">
        <p className="font-bold">About this app</p>
        <p className="text-black/70 dark:text-white/70">
          A complete offline-first exam preparation companion for BSF Head Constable Radio Operator (RO) and
          Radio Mechanic (RM) recruitment — covering syllabus tracking, topic-wise and full-length practice,
          mock tests, spaced revision, and detailed performance analysis, in English, Hindi, or both.
        </p>
      </Card>

      <Card className="space-y-2 text-sm">
        <p className="font-bold">Current Exam Pattern (configurable)</p>
        <ul className="text-black/70 dark:text-white/70 space-y-1">
          <li>• Total Questions: {EXAM_CONFIG.totalQuestions}</li>
          <li>• Total Marks: {EXAM_CONFIG.totalMarks}</li>
          <li>• Duration: {EXAM_CONFIG.durationMinutes} minutes</li>
          <li>• Correct Answer: +{EXAM_CONFIG.correctMarks} marks</li>
          <li>• Wrong Answer: {EXAM_CONFIG.wrongMarks} marks</li>
        </ul>
      </Card>

      <Notice>
        {DISCLAIMER.en}
        <br />
        <span className="font-hi">{DISCLAIMER.hi}</span>
      </Notice>

      <Card className="text-xs text-muted space-y-1">
        <p>All bundled questions are sample/demo questions for practice and are not official BSF previous-year papers, clearly marked as such throughout the app.</p>
        <p>This app is an independent study tool and is not affiliated with, endorsed by, or connected to the Border Security Force or the Government of India.</p>
      </Card>
    </div>
  );
}
