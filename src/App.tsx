import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileShell } from './components/layout/MobileShell';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { SubjectDetailView } from './components/student/SubjectDetailView';
import { ScheduleCalendarView } from './components/schedule/ScheduleCalendarView';
import { ExamHubView } from './components/exam/ExamHubView';
import { AccountProfileView } from './components/account/AccountProfileView';
import { Subject } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, activeTab, setActiveTab } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // If viewing a specific subject's 30 meetings & LKPD
  if (selectedSubject) {
    return (
      <SubjectDetailView
        subject={selectedSubject}
        onBack={() => setSelectedSubject(null)}
      />
    );
  }

  // Render based on activeTab
  switch (activeTab) {
    case 'home':
      return currentUser?.role === 'guru' ? (
        <TeacherDashboard onSelectSubject={(sbj: Subject) => setSelectedSubject(sbj)} />
      ) : (
        <StudentDashboard
          onSelectSubject={(sbj: Subject) => setSelectedSubject(sbj)}
          onGoToCbt={() => setActiveTab('cbt')}
          onGoToSchedule={() => setActiveTab('schedule')}
        />
      );

    case 'schedule':
      return <ScheduleCalendarView />;

    case 'subjects':
      return currentUser?.role === 'guru' ? (
        <TeacherDashboard onSelectSubject={(sbj: Subject) => setSelectedSubject(sbj)} />
      ) : (
        <StudentDashboard
          onSelectSubject={(sbj: Subject) => setSelectedSubject(sbj)}
          onGoToCbt={() => setActiveTab('cbt')}
          onGoToSchedule={() => setActiveTab('schedule')}
        />
      );

    case 'cbt':
      return <ExamHubView />;

    case 'account':
      return <AccountProfileView />;

    default:
      return <StudentDashboard
        onSelectSubject={(sbj) => setSelectedSubject(sbj)}
        onGoToCbt={() => setActiveTab('cbt')}
        onGoToSchedule={() => setActiveTab('schedule')}
      />;
  }
};

export function App() {
  return (
    <AppProvider>
      <MobileShell>
        <MainAppContent />
      </MobileShell>
    </AppProvider>
  );
}

export default App;
