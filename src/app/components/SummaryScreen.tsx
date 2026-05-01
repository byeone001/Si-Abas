import { ChevronLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SummaryScreenProps {
  onBack: () => void;
  onSubmit: () => void;
}

const initialStudents = [
  { id: 1, name: 'Andi Wijaya', status: 'hadir' },
  { id: 2, name: 'Budi Santoso', status: 'hadir' },
  { id: 3, name: 'Citra Dewi', status: 'hadir' },
  { id: 4, name: 'Dian Pratama', status: 'sakit' },
  { id: 5, name: 'Eka Putri', status: 'hadir' },
  { id: 6, name: 'Fajar Rahman', status: 'hadir' },
  { id: 7, name: 'Gita Sari', status: 'hadir' },
  { id: 8, name: 'Hendra Kusuma', status: 'sakit' },
  { id: 9, name: 'Indah Permata', status: 'hadir' },
  { id: 10, name: 'Joko Widodo', status: 'hadir' },
  { id: 11, name: 'Kartika Dewi', status: 'hadir' },
  { id: 12, name: 'Lukman Hakim', status: 'hadir' },
  { id: 13, name: 'Maya Sari', status: 'hadir' },
  { id: 14, name: 'Nico Pratama', status: 'hadir' },
  { id: 15, name: 'Olivia Tan', status: 'hadir' },
  { id: 16, name: 'Putri Ayu', status: 'hadir' },
  { id: 17, name: 'Qori Rahman', status: 'hadir' },
  { id: 18, name: 'Rina Wati', status: 'hadir' },
  { id: 19, name: 'Siti Nurhaliza', status: 'hadir' },
  { id: 20, name: 'Tono Sugiarto', status: 'hadir' },
  { id: 21, name: 'Umar Bakri', status: 'hadir' },
  { id: 22, name: 'Vina Panduwinata', status: 'hadir' },
  { id: 23, name: 'Wawan Setiawan', status: 'hadir' },
  { id: 24, name: 'Xena Warrior', status: 'hadir' },
  { id: 25, name: 'Yudi Latif', status: 'hadir' },
  { id: 26, name: 'Zainal Abidin', status: 'hadir' },
  { id: 27, name: 'Anisa Rahma', status: 'hadir' },
  { id: 28, name: 'Bambang Pamungkas', status: 'hadir' },
  { id: 29, name: 'Cinta Laura', status: 'hadir' },
  { id: 30, name: 'Doni Tata', status: 'hadir' },
];

export function SummaryScreen({ onBack, onSubmit }: SummaryScreenProps) {
  const [students, setStudents] = useState(initialStudents);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Menghitung ringkasan secara real-time berdasarkan state terbaru
  const summary = {
    hadir: students.filter((s) => s.status === 'hadir').length,
    sakit: students.filter((s) => s.status === 'sakit').length,
    izin: students.filter((s) => s.status === 'izin').length,
    alpa: students.filter((s) => s.status === 'alpa').length,
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'hadir':
        return { icon: <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />, label: 'Hadir', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]' };
      case 'sakit':
        return { icon: <AlertCircle className="w-5 h-5 text-[#eab308]" />, label: 'Sakit', color: 'text-[#eab308]', bg: 'bg-[#fefce8]' };
      case 'izin':
        return { icon: <AlertCircle className="w-5 h-5 text-[#2563eb]" />, label: 'Izin', color: 'text-[#2563eb]', bg: 'bg-[#eff6ff]' };
      case 'alpa':
        return { icon: <AlertCircle className="w-5 h-5 text-[#dc2626]" />, label: 'Alpa', color: 'text-[#dc2626]', bg: 'bg-[#fef2f2]' };
      default:
        return { icon: null, label: '', color: '', bg: '' };
    }
  };

  // Mengubah status secara rotasi saat di-klik
  const toggleStudentStatus = (id: number) => {
    setStudents(prev => prev.map(student => {
      if (student.id === id) {
        const nextStatus = {
          'hadir': 'sakit',
          'sakit': 'izin',
          'izin': 'alpa',
          'alpa': 'hadir'
        }[student.status];
        return { ...student, status: nextStatus as string };
      }
      return student;
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 1500); // Simulasi delay API
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-lg active:bg-white/20 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-semibold flex-1 text-center pr-16 tracking-tight">
          Ringkasan Presensi
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Subheader */}
        <div className="px-4 pt-4 pb-3 bg-[#fafafa] border-b border-[#e5e5e5]">
          <p className="text-[#0a0a0a] text-[14px] font-semibold">Kelas 3A - Tematik</p>
          <p className="text-[#737373] text-[12px] mt-0.5">
            Kamis, 10 April 2026 • 07:00 - 08:30
          </p>
        </div>

        {/* Summary Card */}
        <div className="mx-4 my-4 bg-[#fafafa] border border-[#e5e5e5] rounded-lg px-4 py-3.5 transition-all">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-[#e5e5e5] shadow-sm">
              <div className="text-[#16a34a] text-[22px] font-bold">{summary.hadir}</div>
              <div className="text-[#737373] text-[11px] font-medium mt-0.5 uppercase tracking-wider">Hadir</div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-[#e5e5e5] shadow-sm">
              <div className="text-[#eab308] text-[22px] font-bold">{summary.sakit}</div>
              <div className="text-[#737373] text-[11px] font-medium mt-0.5 uppercase tracking-wider">Sakit</div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-[#e5e5e5] shadow-sm">
              <div className="text-[#2563eb] text-[22px] font-bold">{summary.izin}</div>
              <div className="text-[#737373] text-[11px] font-medium mt-0.5 uppercase tracking-wider">Izin</div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-[#e5e5e5] shadow-sm">
              <div className="text-[#dc2626] text-[22px] font-bold">{summary.alpa}</div>
              <div className="text-[#737373] text-[11px] font-medium mt-0.5 uppercase tracking-wider">Alpa</div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-[#0a0a0a] text-[14px] font-bold">Daftar Siswa</h3>
            <span className="text-[11px] text-[#737373] italic">Ketuk nama untuk ubah status</span>
          </div>
          
          <div className="border border-[#e5e5e5] rounded-xl divide-y divide-[#e5e5e5] overflow-hidden bg-white shadow-sm">
            {students.map((student) => {
              const display = getStatusDisplay(student.status);
              return (
                <button 
                  key={student.id} 
                  onClick={() => toggleStudentStatus(student.id)}
                  className="w-full flex items-center justify-between px-4 py-3 active:bg-[#f5f5f5] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-[#a3a3a3] text-[12px] font-medium">{student.id}.</div>
                    <p className="text-[#0a0a0a] text-[13px] font-medium">
                      {student.name}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${display.bg}`}>
                    {display.icon}
                    <span className={`text-[11px] font-bold ${display.color} uppercase tracking-wider`}>
                      {display.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e5e5e5] bg-[#fafafa] px-4 pt-3 pb-4">
        <div className="bg-[#eff6ff] border border-[#93c5fd] rounded-lg px-3 py-2.5 mb-3">
          <p className="text-[#1e40af] text-[11px] leading-relaxed">
            Menekan tombol kirim akan menyinkronkan data dan mengirimkan notifikasi WhatsApp ke Wali Murid.
          </p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#16a34a] text-white text-[14px] font-semibold py-3.5 rounded-lg active:bg-[#15803d] disabled:opacity-80 transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              MENYINKRONKAN...
            </>
          ) : (
            'KIRIM LAPORAN'
          )}
        </button>
      </div>
    </div>
  );
}