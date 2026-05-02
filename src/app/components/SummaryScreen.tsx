import { ChevronLeft, CheckCircle2, AlertCircle, Loader2, FileText, Download, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

interface SummaryScreenProps {
  onBack: () => void;
  onSubmit: () => void;
  classId?: number;
  className?: string;
  subjectName?: string;
}

export function SummaryScreen({ onBack, onSubmit, classId = 1, className = "Kelas 3A", subjectName = "Tematik" }: SummaryScreenProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', classId)
          .order('full_name');
        
        if (data && data.length > 0) {
          setStudents(data.map(s => ({ ...s, status: 'hadir' })));
        } else {
          // Fallback dummy data jika database kosong
          const dummy = [
            { id: 1, full_name: 'Andi Wijaya', status: 'hadir' },
            { id: 2, full_name: 'Budi Santoso', status: 'hadir' },
            { id: 3, full_name: 'Citra Dewi', status: 'hadir' },
            { id: 4, full_name: 'Dian Pratama', status: 'sakit' },
          ];
          setStudents(dummy);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [classId]);

  const summary = {
    hadir: students.filter((s) => s.status === 'hadir').length,
    sakit: students.filter((s) => s.status === 'sakit').length,
    izin: students.filter((s) => s.status === 'izin').length,
    alpa: students.filter((s) => s.status === 'alpa').length,
  };

  const toggleStudentStatus = (id: number) => {
    setStudents(prev => prev.map(student => {
      if (student.id === id) {
        const nextStatusMap: Record<string, string> = {
          'hadir': 'sakit',
          'sakit': 'izin',
          'izin': 'alpa',
          'alpa': 'hadir'
        };
        const nextStatus = nextStatusMap[student.status] || 'hadir';
        return { ...student, status: nextStatus };
      }
      return student;
    }));
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'hadir': return { icon: <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />, label: 'Hadir', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]' };
      case 'sakit': return { icon: <AlertCircle className="w-4 h-4 text-[#eab308]" />, label: 'Sakit', color: 'text-[#eab308]', bg: 'bg-[#fffbeb]' };
      case 'izin': return { icon: <AlertCircle className="w-4 h-4 text-[#2563eb]" />, label: 'Izin', color: 'text-[#2563eb]', bg: 'bg-[#eff6ff]' };
      case 'alpa': return { icon: <AlertCircle className="w-4 h-4 text-[#dc2626]" />, label: 'Alpa', color: 'text-[#dc2626]', bg: 'bg-[#fef2f2]' };
      default: return { icon: null, label: '', color: '', bg: '' };
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(18);
    doc.text(`Laporan Presensi - ${className}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Mata Pelajaran: ${subjectName}`, 14, 30);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);
    
    const tableData = students.map((s, i) => [i + 1, s.full_name, s.status.toUpperCase()]);
    doc.autoTable({
      head: [['No', 'Nama Siswa', 'Status']],
      body: tableData,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }
    });
    
    doc.save(`Presensi_${className}_${subjectName}.pdf`);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students.map((s, i) => ({
      'No': i + 1,
      'Nama Siswa': s.full_name,
      'Status': s.status.toUpperCase()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Presensi");
    XLSX.writeFile(workbook, `Presensi_${className}.xlsx`);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulasi Notifikasi WhatsApp
      console.log("Mengirim notifikasi WhatsApp ke wali murid...");
      
      setTimeout(() => {
        setIsSubmitting(false);
        onSubmit();
      }, 2000);
    } catch (err) {
      alert("Gagal mengirim laporan.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0 shadow-md">
        <button onClick={onBack} className="flex items-center gap-1 px-3 py-2 rounded-lg active:bg-white/20 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-bold flex-1 text-center pr-10 tracking-tight">Ringkasan Presensi</h1>
      </div>

      <div className="flex-1 overflow-auto bg-[#f8fafc]">
        {/* Info Header */}
        <div className="px-5 py-4 bg-white border-b border-[#e2e8f0]">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-[#0a0a0a] text-[16px] font-bold">{className}</h2>
              <p className="text-[#64748b] text-[12px] font-medium mt-0.5 uppercase tracking-wide">{subjectName}</p>
            </div>
            <div className="text-right">
              <p className="text-[#0a0a0a] text-[12px] font-bold">{new Date().toLocaleDateString('id-ID', { weekday: 'long' })}</p>
              <p className="text-[#64748b] text-[11px]">{new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {[
            { label: 'HADIR', val: summary.hadir, color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]' },
            { label: 'SAKIT', val: summary.sakit, color: 'text-[#eab308]', bg: 'bg-[#fffbeb]' },
            { label: 'IZIN', val: summary.izin, color: 'text-[#2563eb]', bg: 'bg-[#eff6ff]' },
            { label: 'ALPA', val: summary.alpa, color: 'text-[#dc2626]', bg: 'bg-[#fef2f2]' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-white rounded-xl p-3 shadow-sm text-center`}>
              <div className={`${s.color} text-[22px] font-black`}>{s.val}</div>
              <div className="text-[#64748b] text-[9px] font-bold uppercase tracking-tighter">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions Tooltip */}
        <div className="px-4 flex gap-2 mb-4">
          <button onClick={exportPDF} className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#e2e8f0] py-2.5 rounded-xl text-[12px] font-bold text-[#475569] active:bg-[#f1f5f9] transition-colors">
            <FileText className="w-4 h-4 text-[#ef4444]" /> PDF
          </button>
          <button onClick={exportExcel} className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#e2e8f0] py-2.5 rounded-xl text-[12px] font-bold text-[#475569] active:bg-[#f1f5f9] transition-colors">
            <Download className="w-4 h-4 text-[#16a34a]" /> EXCEL
          </button>
        </div>

        {/* Student List */}
        <div className="px-4 pb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[#0a0a0a] text-[14px] font-black uppercase tracking-wider">Daftar Siswa</h3>
            <span className="text-[10px] text-[#64748b] font-medium bg-[#f1f5f9] px-2 py-1 rounded-md">Total: {students.length}</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[#16a34a]" /></div>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#f1f5f9]">
              {students.map((s, i) => {
                const display = getStatusDisplay(s.status);
                return (
                  <button key={s.id} onClick={() => toggleStudentStatus(s.id)} className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[#f8fafc] text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-[#cbd5e1] w-4">{i + 1}</span>
                      <p className="text-[#0f172a] text-[14px] font-semibold">{s.full_name}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${display.bg} border border-transparent`}>
                      {display.icon}
                      <span className={`text-[10px] font-black ${display.color} uppercase`}>{display.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-[#e2e8f0]">
        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex gap-3 mb-4">
          <Share2 className="w-5 h-5 text-[#0284c7] flex-shrink-0 mt-0.5" />
          <p className="text-[#075985] text-[11px] font-medium leading-relaxed">
            Data akan disimpan ke sistem dan notifikasi WhatsApp akan dikirimkan otomatis ke Wali Murid yang bersangkutan.
          </p>
        </div>
        <button onClick={handleSubmit} disabled={isSubmitting || students.length === 0} className="w-full bg-[#16a34a] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#16a34a]/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          KIRIM LAPORAN SEKARANG
        </button>
      </div>
    </div>
  );
}