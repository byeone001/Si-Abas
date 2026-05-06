import { useState } from 'react';
import { User, Home, Settings, HelpCircle, LogOut, AlertTriangle, Users, Calendar, FileText } from 'lucide-react';
import { ScreenState } from '@/app/App';
import { ImageWithFallback } from './figma/ImageWithFallback';
// import logoImg from "../../imports/Logo Si-Abas.png";
const logoImg = "https://placehold.co/400x400?text=SI-ABAS";

interface NavigationDrawerProps {
  isOpen: boolean;
  userRole: 'admin' | 'guru';
  onClose: () => void;
  onNavigate: (screen: ScreenState) => void;
  onLogout: () => void;
}

export function NavigationDrawer({ isOpen, userRole, onClose, onNavigate, onLogout }: NavigationDrawerProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          setShowLogoutConfirm(false);
          onClose();
        }}
      />

      {/* Drawer */}
      <div
        className={`absolute inset-y-0 left-0 w-[75%] bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-[#16a34a] px-5 py-6 flex flex-col gap-3 rounded-br-2xl">
          {/* Logo + App Name row */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white text-[13px] font-bold tracking-tight leading-tight">SI-ABAS ISLAMIYAH</p>
              <p className="text-[#bbf7d0] text-[10px]">Sistem Absensi Madrasah</p>
            </div>
          </div>
          {/* Divider */}
          <div className="h-px bg-white/20" />
          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1729821728830-068bbff90645?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwbWFsZSUyMHRlYWNoZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzYwNjQ4MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Profile"
                className="w-full h-full object-cover"
                fallback={<User className="w-6 h-6 text-white" />}
              />
            </div>
            <div>
              <h2 className="text-white text-[15px] font-semibold leading-tight">
                {userRole === 'admin' ? 'Administrator' : 'Ahmad Dahlan, S.Pd'}
              </h2>
              <p className="text-[#dcfce7] text-[12px] mt-0.5">1980123456789</p>
              <p className="text-[#bbf7d0] text-[11px] mt-0.5 capitalize">{userRole === 'admin' ? 'Admin Sekolah' : 'Guru Kelas'}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-auto py-4 flex flex-col">
          <nav className="flex flex-col flex-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f0fdf4] active:bg-[#dcfce7] transition-colors"
            >
              <Home className="w-5 h-5 text-[#16a34a]" />
              <span className="text-[#0a0a0a] text-[15px] font-medium">Beranda</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f0fdf4] active:bg-[#dcfce7] transition-colors"
            >
              <FileText className="w-5 h-5 text-[#737373]" />
              <span className="text-[#0a0a0a] text-[15px] font-medium">Laporan Presensi</span>
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f0fdf4] active:bg-[#dcfce7] transition-colors"
            >
              <User className="w-5 h-5 text-[#737373]" />
              <span className="text-[#0a0a0a] text-[15px] font-medium">Profil Saya</span>
            </button>

            {userRole === 'admin' && (
              <>
                <div className="h-px bg-[#e5e5e5] mx-5 my-2" />
                <p className="px-5 py-2 text-[11px] font-bold text-[#a3a3a3] uppercase tracking-wider">Manajemen Data</p>
                
                <button
                  onClick={() => onNavigate('classes')}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f0fdf4] active:bg-[#dcfce7] transition-colors"
                >
                  <Users className="w-5 h-5 text-[#737373]" />
                  <span className="text-[#0a0a0a] text-[15px] font-medium">Data Kelas</span>
                </button>
                
                <button
                  onClick={() => onNavigate('students')}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f0fdf4] active:bg-[#dcfce7] transition-colors"
                >
                  <Users className="w-5 h-5 text-[#737373]" />
                  <span className="text-[#0a0a0a] text-[15px] font-medium">Data Siswa</span>
                </button>
                <button
                  onClick={() => onNavigate('schedules')}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f0fdf4] active:bg-[#dcfce7] transition-colors"
                >
                  <Calendar className="w-5 h-5 text-[#737373]" />
                  <span className="text-[#0a0a0a] text-[15px] font-medium">Jadwal Pelajaran</span>
                </button>
              </>
            )}

            <div className="h-px bg-[#e5e5e5] mx-5 my-2" />

            <button
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f0fdf4] active:bg-[#dcfce7] transition-colors"
            >
              <Settings className="w-5 h-5 text-[#737373]" />
              <span className="text-[#0a0a0a] text-[15px] font-medium">Pengaturan</span>
            </button>
            <button
              onClick={() => onNavigate('help')}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f0fdf4] active:bg-[#dcfce7] transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-[#737373]" />
              <span className="text-[#0a0a0a] text-[15px] font-medium">Bantuan</span>
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            <div className="h-px bg-[#e5e5e5] mx-5 my-2" />

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fef2f2] active:bg-[#fee2e2] transition-colors"
            >
              <LogOut className="w-5 h-5 text-[#dc2626]" />
              <span className="text-[#dc2626] text-[15px] font-semibold">Keluar</span>
            </button>
          </nav>
        </div>

        {/* ── Logout Confirm Dialog (inline bottom sheet) ── */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl border-t border-[#e5e5e5] px-5 py-6 flex flex-col gap-4 transition-transform duration-300 ease-in-out z-10 ${
            showLogoutConfirm ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
          </div>
          <div className="text-center">
            <h3 className="text-[#0a0a0a] text-[16px] font-semibold">Keluar dari Aplikasi?</h3>
            <p className="text-[#737373] text-[13px] mt-1.5 leading-snug">
              Anda akan keluar dari akun Ahmad Dahlan, S.Pd. Pastikan semua data presensi sudah tersimpan.
            </p>
          </div>
          <button
            onClick={handleLogoutConfirm}
            className="w-full bg-[#dc2626] text-white text-[14px] font-semibold py-3 rounded-xl active:bg-[#b91c1c] transition-colors"
          >
            Ya, Keluar Sekarang
          </button>
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="w-full bg-[#f5f5f5] text-[#0a0a0a] text-[14px] font-semibold py-3 rounded-xl active:bg-[#e5e5e5] transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </>
  );
}