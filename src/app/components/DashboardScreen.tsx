import { Menu, User, MapPin, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface DashboardScreenProps {
  onStartAttendance: () => void;
  onOpenDrawer: () => void;
}

export function DashboardScreen({ onStartAttendance, onOpenDrawer }: DashboardScreenProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');

  // Menghasilkan daftar tanggal dalam minggu ini
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Mulai dari Senin
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const schedules = [
    { time: '07:00 - 08:30', subject: 'Tematik', class: 'Kelas 3A' },
    { time: '08:30 - 10:00', subject: 'Matematika', class: 'Kelas 3B' },
    { time: '10:15 - 11:45', subject: 'Bahasa Indonesia', class: 'Kelas 3A' },
  ];

  const handleCheckLocation = () => {
    setLocationStatus('checking');
    
    if (!navigator.geolocation) {
      setTimeout(() => setLocationStatus('failed'), 1000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Simulasi sukses mendapatkan lokasi yang sesuai
        console.log("Koordinat:", position.coords.latitude, position.coords.longitude);
        setTimeout(() => setLocationStatus('success'), 1500);
      },
      (error) => {
        console.error("Error GPS:", error);
        setTimeout(() => setLocationStatus('failed'), 1000);
      },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-[#16a34a] px-4 py-4 flex items-center justify-between">
        <button onClick={onOpenDrawer} className="p-2 -ml-2 active:bg-white/10 rounded-full transition-colors">
          <Menu className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-[17px] font-semibold tracking-tight">SI-ABAS ISLAMIYAH</h1>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Welcome Section */}
        <div className="px-4 pt-5 pb-4">
          <h2 className="text-[#0a0a0a] text-[18px] font-semibold">Selamat Datang, Bapak/Ibu Guru</h2>
          <p className="text-[#737373] text-[13px] mt-0.5">ID Guru: 2024-GTR-001</p>
        </div>

        {/* Status Card (Location) */}
        <div className={`mx-4 mb-5 border rounded-lg px-4 py-3.5 transition-colors ${
          locationStatus === 'success' ? 'bg-[#f0fdf4] border-[#86efac]' : 
          locationStatus === 'failed' ? 'bg-[#fef2f2] border-[#fca5a5]' : 
          'bg-[#fafafa] border-[#e5e5e5]'
        }`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {locationStatus === 'failed' ? (
                <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
              ) : (
                <MapPin className={`w-5 h-5 ${locationStatus === 'success' ? 'text-[#16a34a]' : 'text-[#737373]'}`} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-[#0a0a0a] text-[14px] font-medium">Status Lokasi</p>
              {locationStatus === 'idle' && <p className="text-[#737373] text-[13px] mt-0.5">Lokasi belum dicek</p>}
              {locationStatus === 'checking' && <p className="text-[#eab308] text-[13px] mt-0.5 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Mendapatkan lokasi...</p>}
              {locationStatus === 'success' && <p className="text-[#16a34a] text-[13px] mt-0.5">Berada di area sekolah</p>}
              {locationStatus === 'failed' && <p className="text-[#dc2626] text-[13px] mt-0.5">Di luar area atau GPS mati</p>}
            </div>
            
            {locationStatus === 'idle' || locationStatus === 'failed' ? (
              <button 
                onClick={handleCheckLocation}
                className="bg-[#16a34a] text-white text-[12px] px-3 py-1.5 rounded-md font-medium active:scale-95 transition-transform"
              >
                Cek Lokasi
              </button>
            ) : locationStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#16a34a] mt-0.5" />
            ) : null}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="px-4 pb-4">
          <h3 className="text-[#0a0a0a] text-[15px] font-semibold mb-3 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: id })}
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, idx) => {
              const isToday = isSameDay(date, currentDate);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="text-[#737373] text-[11px] mb-1.5 capitalize">
                    {format(date, 'EEE', { locale: id })}
                  </div>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] transition-colors ${
                      isToday
                        ? 'bg-[#16a34a] text-white font-semibold shadow-sm'
                        : 'text-[#0a0a0a]'
                    }`}
                  >
                    {format(date, 'd')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="px-4 pb-6">
          <h3 className="text-[#0a0a0a] text-[15px] font-semibold mb-3">Jadwal Hari Ini</h3>
          <div className="space-y-3">
            {schedules.map((schedule, idx) => (
              <div key={idx} className="border border-[#e5e5e5] rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[#737373] text-[12px]">{schedule.time}</p>
                    <h4 className="text-[#0a0a0a] text-[15px] font-semibold mt-1">{schedule.subject}</h4>
                    <p className="text-[#0a0a0a] text-[13px] mt-0.5">{schedule.class}</p>
                  </div>
                </div>
                <button
                  onClick={onStartAttendance}
                  className="w-full bg-[#16a34a] text-white text-[14px] font-semibold py-2.5 rounded-lg active:bg-[#15803d] active:scale-[0.98] transition-all"
                >
                  MULAI PRESENSI
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
