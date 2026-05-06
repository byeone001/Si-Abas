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
import { AttendanceHistoryScreen } from './components/AttendanceHistoryScreen';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type ScreenState = 'dashboard' | 'camera' | 'summary' | 'profile' | 'success' | 'settings' | 'help' | 'students' | 'schedules' | 'classes' | 'history';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'guru'>('guru'); // Default guru
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{ id: number; name: string; subject: string } | null>(null);
  const [presentStudentIds, setPresentStudentIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        if (data?.role) setUserRole(data.role);
      } catch (err) {
        console.error('Error fetching role:', err);
      }
    };

    // Cek session saat pertama kali load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        fetchRole(session.user.id);
      }
    });

    // Listen perubahan auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        fetchRole(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserRole('guru');
      }
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
    setPresentStudentIds([]); // Reset
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
                userRole={userRole}
                onStartAttendance={handleStartAttendance}
                onOpenDrawer={() => setIsDrawerOpen(true)}
              />
            )}
            {currentScreen === 'camera' && (
              <FaceRecognitionScreen
                classId={selectedClass?.id || 1}
                className={selectedClass?.name || "Kelas 3A"}
                onClose={() => setCurrentScreen('dashboard')}
                onComplete={(ids: number[]) => {
                  setPresentStudentIds(ids);
                  setCurrentScreen('summary');
                }}
              />
            )}
            {currentScreen === 'summary' && (
              <SummaryScreen
                classId={selectedClass?.id || 1}
                className={selectedClass?.name || "Kelas 3A"}
                subjectName={selectedClass?.subject || "Tematik"}
                presentStudentIds={presentStudentIds}
                onBack={() => setCurrentScreen('camera')}
                onSubmit={() => setCurrentScreen('success')}
              />
            )}
            {currentScreen === 'profile' && (
              <TeacherProfileScreen userRole={userRole} onBack={() => setCurrentScreen('dashboard')} />
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
            {currentScreen === 'students' && userRole === 'admin' && (
              <StudentManagementScreen onBack={() => setCurrentScreen('dashboard')} />
            )}
            {currentScreen === 'schedules' && userRole === 'admin' && (
              <ScheduleManagementScreen onBack={() => setCurrentScreen('dashboard')} />
            )}
            {currentScreen === 'classes' && userRole === 'admin' && (
              <ClassManagementScreen onBack={() => setCurrentScreen('dashboard')} />
            )}
            {currentScreen === 'history' && (
              <AttendanceHistoryScreen onBack={() => setCurrentScreen('dashboard')} />
            )}

            {/* Overlay Navigation Drawer */}
            <NavigationDrawer
              isOpen={isDrawerOpen}
              userRole={userRole}
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
