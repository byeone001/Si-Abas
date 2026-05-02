import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Calendar, Trash2, Edit2, Loader2, Save, X, Clock, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ScheduleManagementScreenProps {
  onBack: () => void;
}

const DAYS = [
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' },
];

export function ScheduleManagementScreen({ onBack }: ScheduleManagementScreenProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  
  // State for form
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    class_id: '',
    subject_name: '',
    start_time: '07:00',
    end_time: '08:30',
    day_of_week: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: schedulesData } = await supabase
        .from('schedules')
        .select('*, classes(name)')
        .order('start_time');
      
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (schedulesData) setSchedules(schedulesData);
      if (classesData) setClasses(classesData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (schedule: any = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        class_id: schedule.class_id?.toString() || '',
        subject_name: schedule.subject_name,
        start_time: schedule.start_time.slice(0, 5),
        end_time: schedule.end_time.slice(0, 5),
        day_of_week: schedule.day_of_week
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        class_id: '',
        subject_name: '',
        start_time: '07:00',
        end_time: '08:30',
        day_of_week: selectedDay
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.class_id || !formData.subject_name) return;

    setIsSubmitting(true);
    try {
      const payload = {
        class_id: parseInt(formData.class_id),
        subject_name: formData.subject_name,
        start_time: formData.start_time,
        end_time: formData.end_time,
        day_of_week: formData.day_of_week
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from('schedules')
          .update(payload)
          .eq('id', editingSchedule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert([payload]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Gagal menyimpan jadwal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const currentSchedules = schedules.filter(s => s.day_of_week === selectedDay);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 px-3 py-2.5 rounded-lg active:bg-white/20 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-semibold flex-1 text-center pr-16 tracking-tight">Jadwal Pelajaran</h1>
      </div>

      {/* Day Selector */}
      <div className="flex overflow-auto px-4 py-4 gap-2 border-b border-[#e5e5e5] scrollbar-hide">
        {DAYS.map(day => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className={`px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
              selectedDay === day.id ? 'bg-[#16a34a] text-white shadow-md' : 'bg-[#fafafa] text-[#737373] border border-[#e5e5e5]'
            }`}
          >
            {day.name}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#0a0a0a] text-[15px] font-bold">Jadwal {DAYS.find(d => d.id === selectedDay)?.name}</h2>
          <button onClick={() => handleOpenModal()} className="bg-[#f0fdf4] text-[#16a34a] px-3 py-1.5 rounded-lg text-[12px] font-bold border border-[#86efac] active:scale-95 transition-transform">
            + TAMBAH
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : currentSchedules.length > 0 ? (
          <div className="space-y-3">
            {currentSchedules.map(s => (
              <div key={s.id} className="border border-[#e5e5e5] rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-[#16a34a] mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <p className="text-[12px] font-bold">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</p>
                    </div>
                    <h3 className="text-[#0a0a0a] text-[16px] font-bold">{s.subject_name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-4 h-4 rounded-md bg-[#f0fdf4] flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-[#16a34a]" />
                      </div>
                      <p className="text-[#737373] text-[12px] font-medium">{s.classes?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => handleOpenModal(s)} className="p-2 text-[#737373] active:bg-[#f5f5f5] rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-[#dc2626] active:bg-[#fef2f2] rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-[#e5e5e5] rounded-xl opacity-50">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-[#a3a3a3]" />
            <p className="text-[13px]">Belum ada jadwal untuk hari ini</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[340px] rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="bg-[#16a34a] px-4 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold">{editingSchedule ? 'Ubah Jadwal' : 'Tambah Jadwal'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#737373] uppercase tracking-wider">Mata Pelajaran</label>
                <input required type="text" value={formData.subject_name} onChange={(e) => setFormData({...formData, subject_name: e.target.value})} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-[14px]" placeholder="Contoh: Matematika" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#737373] uppercase tracking-wider">Kelas</label>
                <select required value={formData.class_id} onChange={(e) => setFormData({...formData, class_id: e.target.value})} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-[14px]">
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#737373] uppercase tracking-wider">Mulai</label>
                  <input required type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#737373] uppercase tracking-wider">Selesai</label>
                  <input required type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-[14px]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#737373] uppercase tracking-wider">Hari</label>
                <select value={formData.day_of_week} onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})} className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-[14px]">
                  {DAYS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-[#16a34a] text-white font-bold py-3.5 rounded-xl active:bg-[#15803d] transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editingSchedule ? 'SIMPAN PERUBAHAN' : 'TAMBAHKAN JADWAL'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
