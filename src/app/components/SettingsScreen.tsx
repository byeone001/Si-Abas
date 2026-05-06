import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Bell,
  MessageSquare,
  Shield,
  RefreshCw,
  Smartphone,
  Globe,
  Moon,
  Info,
  ChevronRight,
  MapPin,
  Camera,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsScreenProps {
  onBack: () => void;
}

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`relative inline-flex flex-shrink-0 w-12 h-[26px] rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-[#16a34a]' : 'bg-[#d4d4d4]'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className="absolute top-[3px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(26px)' : 'translateX(3px)' }}
      />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 pt-5 pb-2">
      <p className="text-[#16a34a] text-[12px] font-semibold tracking-widest uppercase">{title}</p>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  sublabel,
  rightEl,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  rightEl?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onPress}
      className={`w-full flex items-center gap-4 px-4 py-3.5 transition-colors ${
        onPress ? 'cursor-pointer' : ''
      } ${
        danger
          ? 'hover:bg-[#fef2f2] active:bg-[#fee2e2]'
          : 'hover:bg-[#f5f5f5] active:bg-[#e5e5e5]'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          danger ? 'bg-[#fef2f2]' : 'bg-[#f0fdf4]'
        }`}
      >
        <span className={danger ? 'text-[#dc2626]' : 'text-[#16a34a]'}>{icon}</span>
      </div>
      <div className="flex-1 text-left">
        <p className={`text-[14px] font-medium ${danger ? 'text-[#dc2626]' : 'text-[#0a0a0a]'}`}>
          {label}
        </p>
        {sublabel && <p className="text-[#737373] text-[12px] mt-0.5">{sublabel}</p>}
      </div>
      {rightEl ?? (
        <ChevronRight className="w-4 h-4 text-[#a3a3a3] flex-shrink-0" />
      )}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#e5e5e5] mx-4" />;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  // Read initial states from localStorage or default
  const getInitialState = (key: string, defaultValue: boolean) => {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  };

  const [notifAbsensi, setNotifAbsensi] = useState(() => getInitialState('notifAbsensi', true));
  const [notifWA, setNotifWA] = useState(() => getInitialState('notifWA', true));
  const [notifPengingat, setNotifPengingat] = useState(() => getInitialState('notifPengingat', false));
  const [darkMode, setDarkMode] = useState(() => getInitialState('darkMode', false));
  const [gpsOtomatis, setGpsOtomatis] = useState(() => getInitialState('gpsOtomatis', true));
  const [kameraOtomatis, setKameraOtomatis] = useState(() => getInitialState('kameraOtomatis', false));
  const [sinkronOtomatis, setSinkronOtomatis] = useState(() => getInitialState('sinkronOtomatis', true));
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Apply dark mode immediately
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggle = (
    setter: React.Dispatch<React.SetStateAction<boolean>>, 
    value: boolean, 
    name: string,
    storageKey: string
  ) => {
    setter(value);
    localStorage.setItem(storageKey, JSON.stringify(value));
    
    if (value) {
      toast.success(`${name} berhasil diaktifkan`);
    } else {
      toast.info(`${name} dimatikan`);
    }
  };

  const handleSyncNow = () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));
    toast.promise(promise, {
      loading: 'Menyinkronkan data...',
      success: 'Data berhasil disinkronkan',
      error: 'Gagal menyinkronkan data'
    });
  };

  const handleReset = () => {
    setShowResetConfirm(false);
    // Hapus semua data settings di local storage
    ['notifAbsensi', 'notifWA', 'notifPengingat', 'darkMode', 'gpsOtomatis', 'kameraOtomatis', 'sinkronOtomatis'].forEach(k => localStorage.removeItem(k));
    
    // Reset state ke default
    setNotifAbsensi(true);
    setNotifWA(true);
    setNotifPengingat(false);
    setDarkMode(false);
    setGpsOtomatis(true);
    setKameraOtomatis(false);
    setSinkronOtomatis(true);
    
    toast.error('Data aplikasi berhasil direset ke pengaturan awal');
  };

  return (
    <div className="h-full flex flex-col bg-[#fafafa]">
      {/* Top App Bar */}
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-lg active:bg-white/20 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-semibold flex-1 text-center pr-16 tracking-tight">
          Pengaturan
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto pb-8">

        {/* ───── NOTIFIKASI ───── */}
        <SectionHeader title="Notifikasi" />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-[#e5e5e5]">
          <SettingRow
            icon={<Bell className="w-5 h-5" />}
            label="Notifikasi Presensi"
            sublabel="Pemberitahuan saat presensi berhasil"
            rightEl={
              <ToggleSwitch enabled={notifAbsensi} onToggle={() => handleToggle(setNotifAbsensi, !notifAbsensi, 'Notifikasi Presensi', 'notifAbsensi')} />
            }
          />
          <Divider />
          <SettingRow
            icon={<MessageSquare className="w-5 h-5" />}
            label="Kirim ke WhatsApp"
            sublabel="Laporan otomatis ke grup orang tua"
            rightEl={
              <ToggleSwitch enabled={notifWA} onToggle={() => handleToggle(setNotifWA, !notifWA, 'Kirim ke WhatsApp', 'notifWA')} />
            }
          />
          <Divider />
          <SettingRow
            icon={<Bell className="w-5 h-5" />}
            label="Pengingat Jadwal"
            sublabel="Ingatkan 15 menit sebelum kelas"
            rightEl={
              <ToggleSwitch enabled={notifPengingat} onToggle={() => handleToggle(setNotifPengingat, !notifPengingat, 'Pengingat Jadwal', 'notifPengingat')} />
            }
          />
        </div>

        {/* ───── TAMPILAN ───── */}
        <SectionHeader title="Tampilan" />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-[#e5e5e5]">
          <SettingRow
            icon={<Moon className="w-5 h-5" />}
            label="Mode Gelap"
            sublabel="Aktifkan tema gelap"
            rightEl={
              <ToggleSwitch enabled={darkMode} onToggle={() => handleToggle(setDarkMode, !darkMode, 'Mode Gelap', 'darkMode')} />
            }
          />
          <Divider />
          <SettingRow
            icon={<Globe className="w-5 h-5" />}
            label="Bahasa"
            sublabel="Indonesia (ID)"
            onPress={() => toast.info('Hanya mendukung Bahasa Indonesia saat ini.')}
          />
        </div>

        {/* ───── IZIN PERANGKAT ───── */}
        <SectionHeader title="Izin Perangkat" />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-[#e5e5e5]">
          <SettingRow
            icon={<MapPin className="w-5 h-5" />}
            label="Akses GPS Otomatis"
            sublabel="Validasi lokasi saat buka aplikasi"
            rightEl={
              <ToggleSwitch enabled={gpsOtomatis} onToggle={() => handleToggle(setGpsOtomatis, !gpsOtomatis, 'Akses GPS Otomatis', 'gpsOtomatis')} />
            }
          />
          <Divider />
          <SettingRow
            icon={<Camera className="w-5 h-5" />}
            label="Buka Kamera Otomatis"
            sublabel="Langsung ke kamera saat presensi"
            rightEl={
              <ToggleSwitch enabled={kameraOtomatis} onToggle={() => handleToggle(setKameraOtomatis, !kameraOtomatis, 'Buka Kamera Otomatis', 'kameraOtomatis')} />
            }
          />
        </div>

        {/* ───── SINKRONISASI ───── */}
        <SectionHeader title="Sinkronisasi Data" />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-[#e5e5e5]">
          <SettingRow
            icon={<RefreshCw className="w-5 h-5" />}
            label="Sinkronisasi Otomatis"
            sublabel="Upload data saat terhubung Wi-Fi"
            rightEl={
              <ToggleSwitch enabled={sinkronOtomatis} onToggle={() => handleToggle(setSinkronOtomatis, !sinkronOtomatis, 'Sinkronisasi Otomatis', 'sinkronOtomatis')} />
            }
          />
          <Divider />
          <SettingRow
            icon={<RefreshCw className="w-5 h-5" />}
            label="Sinkronisasi Sekarang"
            sublabel="Terakhir: Hari ini, 06:45 WIB"
            onPress={handleSyncNow}
          />
        </div>

        {/* ───── KEAMANAN ───── */}
        <SectionHeader title="Keamanan" />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-[#e5e5e5]">
          <SettingRow
            icon={<Shield className="w-5 h-5" />}
            label="Ubah PIN"
            sublabel="Ganti PIN masuk aplikasi"
            onPress={() => toast.info('Menu ubah PIN belum tersedia')}
          />
          <Divider />
          <SettingRow
            icon={<Smartphone className="w-5 h-5" />}
            label="Verifikasi Perangkat"
            sublabel="Perangkat ini terverifikasi"
            rightEl={
              <span className="text-[#16a34a] text-[12px] font-semibold bg-[#f0fdf4] border border-[#86efac] px-2 py-0.5 rounded-full">
                Aktif
              </span>
            }
          />
        </div>

        {/* ───── TENTANG ───── */}
        <SectionHeader title="Tentang Aplikasi" />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-[#e5e5e5]">
          <SettingRow
            icon={<Info className="w-5 h-5" />}
            label="Versi Aplikasi"
            sublabel="SI-ABAS ISLAMIYAH"
            rightEl={
              <span className="text-[#737373] text-[13px] font-medium">v1.0.0</span>
            }
          />
          <Divider />
          <SettingRow
            icon={<Globe className="w-5 h-5" />}
            label="Kebijakan Privasi"
            onPress={() => toast.success('Membuka kebijakan privasi...')}
          />
          <Divider />
          <SettingRow
            icon={<Info className="w-5 h-5" />}
            label="Syarat & Ketentuan"
            onPress={() => toast.success('Membuka syarat & ketentuan...')}
          />
        </div>

        {/* ───── ZONA BAHAYA ───── */}
        <SectionHeader title="Zona Bahaya" />
        <div className="mx-4 bg-white rounded-xl overflow-hidden border border-[#fecaca]">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-[#fef2f2] active:bg-[#fee2e2] transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#fef2f2] flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-[#dc2626]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-medium text-[#dc2626]">Reset Data Aplikasi</p>
              <p className="text-[#737373] text-[12px] mt-0.5">Hapus semua data lokal aplikasi</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#fca5a5] flex-shrink-0" />
          </button>
        </div>

        <p className="text-center text-[#a3a3a3] text-[11px] mt-6 px-4">
          © 2026 SI-ABAS ISLAMIYAH · Madrasah Islamiyah
        </p>
      </div>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-2xl p-6 pb-8 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-[#dc2626]" />
            </div>
            <div className="text-center">
              <h3 className="text-[#0a0a0a] text-[16px] font-semibold">Reset Data Aplikasi?</h3>
              <p className="text-[#737373] text-[13px] mt-1.5 leading-snug">
                Semua data presensi lokal akan dihapus permanen. Pastikan data sudah tersinkronisasi ke server.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-[#dc2626] text-white text-[14px] font-semibold py-3 rounded-xl active:bg-[#b91c1c]"
            >
              Ya, Reset Sekarang
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="w-full bg-[#f5f5f5] text-[#0a0a0a] text-[14px] font-semibold py-3 rounded-xl active:bg-[#e5e5e5]"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}