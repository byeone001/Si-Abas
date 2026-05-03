import { useState } from 'react';
import { Toaster } from 'sonner';
import { DashboardScreen } from './components/DashboardScreen';
import { FaceRecognitionScreen } from './components/FaceRecognitionScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { NavigationDrawer } from './components/NavigationDrawer';
import { TeacherProfileScreen } from './components/TeacherProfileScreen';
import { SuccessScreen } from './components/SuccessScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { LoginScreen } from './components/LoginScreen';
import { HelpScreen } from './components/HelpScreen';
import { StudentManagementScreen } from './components/StudentManagementScreen';
import { ScheduleManagementScreen } from './components/ScheduleManagementScreen';
import { ClassManagementScreen } from './components/ClassManagementScreen';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type ScreenState = 'dashboard' | 'camera' | 'summary' | 'profile' | 'success' | 'settings' | 'help' | 'students' | 'schedules' | 'classes';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{ id: number; name: string; subject: string } | null>(null);

  useEffect(() => {
    // Cek session saat pertama kali load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });

    // Listen perubahan auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDrawerOpen(false);
    setCurrentScreen('dashboard');
    setIsLoggedIn(false);
  };

  const handleStartAttendance = (classData: { id: number; name: string; subject: string }) => {
    setSelectedClass(classData);
    setCurrentScreen('camera');
  };

  return (
    <div className="size-full flex items-center justify-center bg-[#f5f5f5]">
      <div className="w-full max-w-[390px] h-full max-h-[844px] bg-white overflow-hidden shadow-2xl relative">
        <Toaster position="top-center" richColors />
        
        {/* ── LOGIN ── */}
        {!isLoggedIn && (
          <LoginScreen onLogin={() => setIsLoggedIn(true)} />
        )}

        {/* ── MAIN APP ── */}
        {isLoggedIn && (
          <>
            {currentScreen === 'dashboard' && (
              <DashboardScreen
                onStartAttendance={handleStartAttendance}
                onOpenDrawer={() => setIsDrawerOpen(true)}
              />
            )}
            {currentScreen === 'camera' && (
              <FaceRecognitionScreen
                classId={selectedClass?.id || 1}
                className={selectedClass?.name || "Kelas 3A"}
                onClose={() => setCurrentScreen('dashboard')}
                onComplete={() => setCurrentScreen('summary')}
              />
            )}
            {currentScreen === 'summary' && (
              <SummaryScreen
                classId={selectedClass?.id || 1}
                className={selectedClass?.name || "Kelas 3A"}
                subjectName={selectedClass?.subject || "Tematik"}
                onBack={() => setCurrentScreen('camera')}
                onSubmit={() => setCurrentScreen('success')}
              />
            )}
            {currentScreen === 'profile' && (
              <TeacherProfileScreen onBack={() => setCurrentScreen('dashboard')} />
            )}
            {currentScreen === 'success' && (
              <SuccessScreen onHome={() => setCurrentScreen('dashboard')} />
            )}
            {currentScreen === 'settings' && (
              <SettingsScreen onBack={() => setCurrentScreen('dashboard')} />
            )}
            {currentScreen === 'help' && (
              <HelpScreen onBack={() => setCurrentScreen('dashboard')} />
            )}
            {currentScreen === 'students' && (
              <StudentManagementScreen onBack={() => setCurrentScreen('dashboard')} />
            )}
            {currentScreen === 'schedules' && (
              <ScheduleManagementScreen onBack={() => setCurrentScreen('dashboard')} />
            )}
            {currentScreen === 'classes' && (
              <ClassManagementScreen onBack={() => setCurrentScreen('dashboard')} />
            )}

            {/* Overlay Navigation Drawer */}
            <NavigationDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              onNavigate={(screen) => {
                setCurrentScreen(screen);
                setIsDrawerOpen(false);
              }}
              onLogout={handleLogout}
            />
          </>
        )}
      </div>
    </div>
  );
}
