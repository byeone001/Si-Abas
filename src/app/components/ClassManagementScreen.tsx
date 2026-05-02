import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Edit2, Loader2, Save, X, School } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ClassManagementScreenProps {
  onBack: () => void;
}

export function ClassManagementScreen({ onBack }: ClassManagementScreenProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for form
  const [editingClass, setEditingClass] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    academic_year: new Date().getFullYear().toString()
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      
      if (data) setClasses(data);
      if (error) console.error("Error fetching classes:", error);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cls: any = null) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        name: cls.name,
        academic_year: cls.academic_year || ''
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        academic_year: new Date().getFullYear().toString()
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update({
            name: formData.name,
            academic_year: formData.academic_year
          })
          .eq('id', editingClass.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('classes')
          .insert([
            {
              name: formData.name,
              academic_year: formData.academic_year
            }
          ]);
        
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchClasses();
    } catch (err: any) {
      alert("Gagal menyimpan data: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kelas ini? Semua siswa di kelas ini mungkin akan kehilangan relasi kelasnya.")) return;
    
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchClasses();
    } catch (err: any) {
      alert("Gagal menghapus data: " + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-2.5 rounded-lg active:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-semibold flex-1 text-center pr-16 tracking-tight">
          Manajemen Kelas
        </h1>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-[#e5e5e5]">
        <div>
          <h2 className="text-[#0a0a0a] text-[15px] font-bold">Daftar Kelas</h2>
          <p className="text-[#737373] text-[12px]">Total: {classes.length} Kelas</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#16a34a] text-white flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold active:bg-[#15803d]"
        >
          <Plus className="w-4 h-4" /> TAMBAH KELAS
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-[#16a34a] mb-2" />
            <p className="text-[14px]">Memuat kelas...</p>
          </div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {classes.map((cls) => (
              <div key={cls.id} className="border border-[#e5e5e5] rounded-xl p-4 bg-[#f8fafc] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center shadow-sm text-[#16a34a]">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[#0a0a0a] text-[15px] font-bold">{cls.name}</h3>
                    <p className="text-[#737373] text-[12px]">Tahun Ajaran: {cls.academic_year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenModal(cls)} className="p-2 text-[#737373] active:bg-white rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cls.id)} className="p-2 text-[#dc2626] active:bg-[#fef2f2] rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#e5e5e5] rounded-xl opacity-50">
            <School className="w-8 h-8 mb-2 text-[#a3a3a3]" />
            <p className="text-[14px]">Belum ada data kelas</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[340px] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-[#16a34a] px-4 py-4 flex items-center justify-between text-white">
              <h2 className="font-bold">{editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#737373] uppercase tracking-wider">Nama Kelas</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#16a34a]"
                  placeholder="Contoh: Kelas 3A"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#737373] uppercase tracking-wider">Tahun Ajaran</label>
                <input
                  required
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                  className="bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#16a34a]"
                  placeholder="Contoh: 2026"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#16a34a] text-white font-bold py-3.5 rounded-xl active:bg-[#15803d] disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editingClass ? 'SIMPAN PERUBAHAN' : 'BUAT KELAS'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
