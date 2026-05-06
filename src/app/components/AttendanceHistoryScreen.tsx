import { ChevronLeft, Calendar, Filter, FileText, Loader2, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AttendanceHistoryScreenProps {
  onBack: () => void;
}

export function AttendanceHistoryScreen({ onBack }: AttendanceHistoryScreenProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ambil daftar kelas
    const fetchClasses = async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      if (data) {
        setClasses(data);
        if (data.length > 0) setSelectedClass(data[0].id);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      // Ambil data murid di kelas tersebut beserta riwayat absennya pada tanggal terpilih
      const { data, error } = await supabase
        .from('students')
        .select(`
          id, 
          full_name,
          attendance ( status, subject, created_at )
        `)
        .eq('class_id', selectedClass)
        .eq('attendance.date', selectedDate);

      if (error) throw error;
      setAttendanceData(data || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'hadir': return <span className="text-[#16a34a] font-bold bg-[#f0fdf4] px-2 py-1 rounded-md text-[10px] uppercase">Hadir</span>;
      case 'sakit': return <span className="text-[#eab308] font-bold bg-[#fffbeb] px-2 py-1 rounded-md text-[10px] uppercase">Sakit</span>;
      case 'izin': return <span className="text-[#2563eb] font-bold bg-[#eff6ff] px-2 py-1 rounded-md text-[10px] uppercase">Izin</span>;
      case 'alpa': return <span className="text-[#dc2626] font-bold bg-[#fef2f2] px-2 py-1 rounded-md text-[10px] uppercase">Alpa</span>;
      default: return <span className="text-[#94a3b8] font-bold bg-[#f8fafc] px-2 py-1 rounded-md text-[10px] uppercase">Belum Absen</span>;
    }
  };

  const exportExcel = () => {
    if (!attendanceData.length) return;
    const worksheet = XLSX.utils.json_to_sheet(attendanceData.map((s, i) => ({
      'No': i + 1,
      'Nama Siswa': s.full_name,
      'Status': s.attendance?.[0]?.status?.toUpperCase() || 'BELUM ABSEN',
      'Pelajaran': s.attendance?.[0]?.subject || '-'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `Laporan_Absen_${selectedDate}.xlsx`);
  };

  const exportPDF = () => {
    if (!attendanceData.length) return;
    const doc = new jsPDF() as any;
    doc.text(`Laporan Presensi - ${selectedDate}`, 14, 22);
    const tableData = attendanceData.map((s, i) => [
      i + 1, 
      s.full_name, 
      s.attendance?.[0]?.status?.toUpperCase() || 'BELUM ABSEN',
      s.attendance?.[0]?.subject || '-'
    ]);
    doc.autoTable({
      head: [['No', 'Nama Siswa', 'Status', 'Pelajaran']],
      body: tableData,
      startY: 30,
    });
    doc.save(`Laporan_Absen_${selectedDate}.pdf`);
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc]">
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0 shadow-md">
        <button onClick={onBack} className="flex items-center gap-1 px-3 py-2 rounded-lg active:bg-white/20 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-bold flex-1 text-center pr-10 tracking-tight">Laporan Presensi</h1>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Filter Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-3 text-[#0a0a0a] font-bold text-[13px]">
            <Filter className="w-4 h-4 text-[#16a34a]" /> Filter Laporan
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1 block">Kelas</label>
              <select 
                value={selectedClass || ''} 
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-[14px] bg-[#f8fafc]"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1 block">Tanggal</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-[#cbd5e1] rounded-lg px-3 py-2 text-[14px] bg-[#f8fafc]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button onClick={exportPDF} className="flex-1 bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center gap-2 py-2.5 rounded-lg text-[#ef4444] font-bold text-[12px] active:bg-[#f1f5f9]">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={exportExcel} className="flex-1 bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center gap-2 py-2.5 rounded-lg text-[#16a34a] font-bold text-[12px] active:bg-[#f1f5f9]">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>

        {/* Data List */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
          <div className="bg-[#f1f5f9] px-4 py-3 border-b border-[#e2e8f0] flex justify-between items-center">
            <h3 className="text-[#0a0a0a] text-[13px] font-bold">Data Presensi Harian</h3>
            <span className="bg-white px-2 py-1 rounded text-[#64748b] text-[10px] font-bold">{attendanceData.length} Siswa</span>
          </div>
          
          {isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#16a34a]" /></div>
          ) : attendanceData.length === 0 ? (
            <div className="py-10 text-center text-[#94a3b8] text-[13px]">Tidak ada data murid</div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {attendanceData.map((s, i) => {
                const att = s.attendance?.[0]; // Ambil presensi pertama hari itu
                return (
                  <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-[#0a0a0a] text-[14px] font-semibold">{s.full_name}</p>
                      {att?.subject && <p className="text-[#64748b] text-[11px] mt-0.5">Mapel: {att.subject}</p>}
                    </div>
                    <div>
                      {getStatusLabel(att?.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
