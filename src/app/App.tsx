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

export type ScreenState = 'dashboard' | 'camera' | 'summary' | 'profile' | 'success' | 'settings' | 'help';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    setIsDrawerOpen(false);
    setCurrentScreen('dashboard');
    setIsLoggedIn(false);
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
                onStartAttendance={() => setCurrentScreen('camera')}
                onOpenDrawer={() => setIsDrawerOpen(true)}
              />
            )}
            {currentScreen === 'camera' && (
              <FaceRecognitionScreen
                onClose={() => setCurrentScreen('dashboard')}
                onComplete={() => setCurrentScreen('summary')}
              />
            )}
            {currentScreen === 'summary' && (
              <SummaryScreen
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
