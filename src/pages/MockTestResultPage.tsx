import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '@/db/db';
import { getSubject } from '@/data/examConfig';
import { getTopicById } from '@/data/syllabus';
import { Card, Badge, ProgressBar } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import type { MockTestAttempt, MockTestResult } from '@/types';

const PIE_COLORS = ['#2a9865', '#e14b4b', '#c7cbc8'];

export default function MockTestResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<MockTestAttempt | null>(null);
  const [result, setResult] = useState<MockTestResult | null>(null);

  useEffect(() => {
    (async () => {
      if (!attemptId) return;
      const a = await db.mockTestAttempts.get(attemptId);
      const r = await db.mockTestResults.get(attemptId);
      setAttempt(a ?? null);
      setResult(r ?? null);
    })();
  }, [attemptId]);

  if (!attempt || !result) {
    return <div className="py-20 text-center text-muted">Loading result...</div>;
  }

  const pieData = [
    { name: 'Correct', value: result.correctCount },
    { name: 'Wrong', value: result.wrongCount },
    { name: 'Unattempted', value: result.unattemptedCount }
  ];

  const subjectBarData = result.subjectWise.map((s) => ({
    name: getSubject(s.subjectId)?.title.en ?? s.subjectId,
    marks: Math.round(s.marks * 100) / 100,
    max: s.maxMarks
  }));

  const retryWrong = () => {
    navigate(`/practice?scope=wrong_questions`);
  };

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">
        Result <span className="font-hi text-muted font-normal text-lg">/ परिणाम</span>
      </h1>

      <div className="rounded-[20px] p-5 text-white text-center" style={{ background: 'linear-gradient(135deg,#153d2d,#2a865a)' }}>
        <p className="opacity-80 text-sm">Final Score</p>
        <p className="text-4xl font-extrabold mt-1">
          {result.finalMarks.toFixed(2)} <span className="text-lg font-medium opacity-80">/ {attempt.config.totalMarks}</span>
        </p>
        <p className="text-sm mt-1 opacity-90">{result.percentage.toFixed(1)}% · Accuracy {result.accuracy.toFixed(1)}%</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Card className="text-center">
          <b className="text-lg text-green-600 block">{result.correctCount}</b>
          <p className="text-[11px] text-muted">Correct</p>
        </Card>
        <Card className="text-center">
          <b className="text-lg text-red-600 block">{result.wrongCount}</b>
          <p className="text-[11px] text-muted">Wrong</p>
        </Card>
        <Card className="text-center">
          <b className="text-lg text-muted block">{result.unattemptedCount}</b>
          <p className="text-[11px] text-muted">Unattempted</p>
        </Card>
      </div>

      <Card>
        <p className="font-bold text-sm mb-2">Score Distribution</p>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <p className="font-bold text-sm mb-2">Subject-wise Marks</p>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={subjectBarData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="marks" fill="#23734e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <p className="font-bold text-sm mb-2">Time Analysis</p>
        <p className="text-sm text-muted">
          Total time: {Math.round(result.totalTimeSeconds / 60)} min · Avg per question: {Math.round(result.avgTimePerQuestion)}s
        </p>
      </Card>

      {result.weakTopicIds.length > 0 && (
        <Card>
          <p className="font-bold text-sm mb-2">Weak Topics <span className="font-hi text-muted font-normal">/ कमजोर विषय</span></p>
          <div className="flex flex-wrap gap-1.5">
            {result.weakTopicIds.map((id) => {
              const t = getTopicById(id);
              return t ? <Badge key={id} tone="danger">{t.title.en}</Badge> : null;
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={retryWrong}>Retry Wrong Questions</Button>
        <Button variant="outline" onClick={() => navigate('/test-history')}>Test History</Button>
        <Button variant="secondary" onClick={() => window.print()}>Print Result</Button>
        <Button onClick={() => navigate('/mock-tests')}>Retake / New Test</Button>
      </div>
    </div>
  );
}
