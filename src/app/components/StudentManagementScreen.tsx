import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Search, User, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StudentManagementScreenProps {
  onBack: () => void;
}

export function StudentManagementScreen({ onBack }: StudentManagementScreenProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for form
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    class_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*, classes(name)')
        .order('full_name');
      
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (studentsData) setStudents(studentsData);
      if (classesData) setClasses(classesData);
      
      if (studentsError) console.error("Error fetching students:", studentsError);
      if (classesError) console.error("Error fetching classes:", classesError);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (student: any = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        full_name: student.full_name,
        class_id: student.class_id?.toString() || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({
        full_name: '',
        class_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.class_id) return;

    setIsSubmitting(true);
    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update({
            full_name: formData.full_name,
            class_id: parseInt(formData.class_id)
          })
          .eq('id', editingStudent.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('students')
          .insert([
            {
              full_name: formData.full_name,
              class_id: parseInt(formData.class_id)
            }
          ]);
        
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Gagal menyimpan data: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus siswa ini?")) return;
    
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus data: " + err.message);
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.classes?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-lg active:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-semibold flex-1 text-center pr-16 tracking-tight">
          Data Siswa
        </h1>
      </div>

      {/* Toolbar */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="Cari nama atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fafafa] border border-[#e5e5e5] rounded-xl pl-10 pr-4 py-2.5 text-[14px] outline-none focus:border-[#16a34a]"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#16a34a] text-white p-2.5 rounded-xl active:bg-[#15803d]"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-[#16a34a] mb-2" />
            <p className="text-[14px]">Memuat data...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="space-y-3 mt-2">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border border-[#e5e5e5] rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#16a34a]" />
                  </div>
                  <div>
                    <h3 className="text-[#0a0a0a] text-[15px] font-semibold">{student.full_name}</h3>
                    <p className="text-[#737373] text-[12px]">{student.classes?.name || 'Tanpa Kelas'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenModal(student)}
                    className="p-2 text-[#737373] active:bg-[#f5f5f5] rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(student.id)}
                    className="p-2 text-[#dc2626] active:bg-[#fef2f2] rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 opacity-50 border-2 border-dashed border-[#e5e5e5] rounded-xl mt-2">
            <p className="text-[14px]">Siswa tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[340px] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-[#16a34a] px-4 py-3 flex items-center justify-between">
              <h2 className="text-white font-semibold">
                {editingStudent ? 'Edit Siswa' : 'Tambah Siswa'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 active:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium">Nama Lengkap</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#16a34a]"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium">Kelas</label>
                <select
                  required
                  value={formData.class_id}
                  onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                  className="bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#16a34a] appearance-none"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#16a34a] text-white font-semibold py-3 rounded-xl active:bg-[#15803d] disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editingStudent ? 'SIMPAN PERUBAHAN' : 'TAMBAH SISWA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
