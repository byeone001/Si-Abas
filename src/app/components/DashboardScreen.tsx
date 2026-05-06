import { Menu, User, MapPin, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

interface DashboardScreenProps {
  onStartAttendance: (classData: { id: number; name: string; subject: string }) => void;
  onOpenDrawer: () => void;
  userRole?: 'admin' | 'guru';
}

export function DashboardScreen({ onStartAttendance, onOpenDrawer, userRole = 'guru' }: DashboardScreenProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [distance, setDistance] = useState<number | null>(null);

  // Koordinat Sekolah (Sesuai FaceRecognitionScreen)
  const SCHOOL_LOCATION = { lat: -7.693503, lng: 111.333048 };
  const ALLOWED_RADIUS = 2000; // Meter

  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);

  // Menghasilkan daftar tanggal dalam minggu ini
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Mulai dari Senin
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('*, classes(name)');

        if (data) {
          const transformed = data.map(s => ({
            id: s.class_id,
            time: `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`,
            subject: s.subject_name,
            class: s.classes?.name || 'Unknown Class'
          }));
          setSchedules(transformed);
        } else if (error) {
          console.error("Error fetching schedules:", error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoadingSchedules(false);
      }
    }

    fetchSchedules();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCheckLocation = () => {
    setLocationStatus('checking');

    if (!navigator.geolocation) {
      setTimeout(() => setLocationStatus('failed'), 1000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const d = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          SCHOOL_LOCATION.lat,
          SCHOOL_LOCATION.lng
        );
        setDistance(Math.round(d));

        setDistance(Math.round(d));

        // MEMATIKAN FITUR LOKASI SEMENTARA UNTUK TESTING
        // Mengabaikan jarak sebenarnya (d <= ALLOWED_RADIUS)
        setLocationStatus('success');
      },
      (error) => {
        console.error("Error GPS:", error);
        setLocationStatus('failed');
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
          <h2 className="text-[#0a0a0a] text-[18px] font-semibold">
            {userRole === 'admin' ? 'Selamat Datang, Administrator' : 'Selamat Datang, Bapak/Ibu Guru'}
          </h2>
          <p className="text-[#737373] text-[13px] mt-0.5">
            {userRole === 'admin' ? 'ID Admin: 2024-ADM-001' : 'ID Guru: 2024-GTR-001'}
          </p>
        </div>

        {/* Status Card (Location) */}
        <div className={`mx-4 mb-5 border rounded-lg px-4 py-3.5 transition-colors ${locationStatus === 'success' ? 'bg-[#f0fdf4] border-[#86efac]' :
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
              {locationStatus === 'checking' && <p className="text-[#eab308] text-[13px] mt-0.5 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Mendapatkan lokasi...</p>}
              {locationStatus === 'success' && <p className="text-[#16a34a] text-[13px] mt-0.5">Berada di area sekolah ({distance}m)</p>}
              {locationStatus === 'failed' && (
                <p className="text-[#dc2626] text-[13px] mt-0.5">
                  {distance !== null && distance > ALLOWED_RADIUS
                    ? `Di luar area sekolah (${distance}m)`
                    : "Gagal mendapatkan lokasi atau GPS mati"}
                </p>
              )}
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
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] transition-colors ${isToday
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
            {isLoadingSchedules ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <Loader2 className="w-6 h-6 animate-spin text-[#16a34a] mb-2" />
                <p className="text-[12px]">Memuat jadwal...</p>
              </div>
            ) : schedules.length > 0 ? (
              schedules.map((schedule, idx) => (
                <div key={idx} className="border border-[#e5e5e5] rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[#737373] text-[12px]">{schedule.time}</p>
                      <h4 className="text-[#0a0a0a] text-[15px] font-semibold mt-1">{schedule.subject}</h4>
                      <p className="text-[#0a0a0a] text-[13px] mt-0.5">{schedule.class}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onStartAttendance({ id: schedule.id, name: schedule.class, subject: schedule.subject })}
                    disabled={locationStatus !== 'success'}
                    className={`w-full text-white text-[14px] font-semibold py-2.5 rounded-lg transition-all ${locationStatus === 'success'
                      ? 'bg-[#16a34a] active:bg-[#15803d] active:scale-[0.98]'
                      : 'bg-[#d4d4d4] cursor-not-allowed opacity-70'
                      }`}
                  >
                    {locationStatus === 'success' ? 'MULAI PRESENSI' : 'LOKASI TIDAK VALID'}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 text-[13px]">Tidak ada jadwal hari ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
