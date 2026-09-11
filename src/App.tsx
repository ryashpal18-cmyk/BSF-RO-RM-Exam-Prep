import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Header } from '@/components/nav/Header';
import { Sidebar } from '@/components/nav/Sidebar';
import { BottomNav } from '@/components/nav/BottomNav';
import { useAppState } from '@/context/AppStateContext';

import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import More from '@/pages/More';
import Syllabus from '@/pages/Syllabus';
import Practice from '@/pages/Practice';
import MockTests from '@/pages/MockTests';
import MockTestRunner from '@/pages/MockTestRunner';
import MockTestResultPage from '@/pages/MockTestResultPage';
import ProgressPage from '@/pages/ProgressPage';
import Bookmarks from '@/pages/Bookmarks';
import WrongQuestions from '@/pages/WrongQuestions';
import Revision from '@/pages/Revision';
import Notes from '@/pages/Notes';
import TestHistory from '@/pages/TestHistory';
import Backup from '@/pages/Backup';
import Settings from '@/pages/Settings';
import About from '@/pages/About';

function AppLayout() {
  return (
    <div className="md:flex">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto p-4 pb-24 md:pb-8">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

// Mock test runner gets its own minimal layout (no bottom nav distraction during exam,
// but still inside the header/sidebar shell so navigation state is never lost on refresh).
function ExamLayout() {
  return (
    <div className="md:flex">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto p-4 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { loading, profile } = useAppState();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-appbg dark:bg-brand-dark">
        <div className="text-center">
          <div className="text-4xl mb-2">🛡️</div>
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile?.onboardingCompleted) {
    return (
      <HashRouter>
        <Routes>
          <Route path="*" element={<Onboarding />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/more" element={<More />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/mock-tests" element={<MockTests />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/wrong-questions" element={<WrongQuestions />} />
          <Route path="/revision" element={<Revision />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/test-history" element={<TestHistory />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/mock-tests/result/:attemptId" element={<MockTestResultPage />} />
        </Route>
        <Route element={<ExamLayout />}>
          <Route path="/mock-tests/run/:attemptId" element={<MockTestRunner />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
