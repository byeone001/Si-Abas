import { ChevronLeft, Camera, Edit2, Lock, ChevronRight, User, Loader2, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface TeacherProfileScreenProps {
  onBack: () => void;
  userRole: 'admin' | 'guru';
}

export function TeacherProfileScreen({ onBack, userRole }: TeacherProfileScreenProps) {
  const [waNumber, setWaNumber] = useState('');
  const [profileName, setProfileName] = useState('');
  const [nip, setNip] = useState('');
  
  const [isEditingWa, setIsEditingWa] = useState(false);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(localStorage.getItem('profileImage'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data } = await supabase
            .from('profiles')
            .select('full_name, nip, phone')
            .eq('id', user.id)
            .single();
            
          if (data) {
            setProfileName(data.full_name || 'Tanpa Nama');
            setNip(data.nip || '-');
            setWaNumber(data.phone || '');
          }
        }
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveWa = async () => {
    setIsEditingWa(false);
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: waNumber })
        .eq('id', userId);
        
      if (error) throw error;
      toast.success('Nomor WhatsApp berhasil diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui nomor');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingFoto(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem('profileImage', base64String);
        setIsUploadingFoto(false);
        toast.success('Foto profil berhasil diperbarui');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-lg active:bg-white/20 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-semibold flex-1 text-center pr-16 tracking-tight">
          Profil Saya
        </h1>
      </div>

      <div className="flex-1 overflow-auto bg-[#f5f5f5]">
        {/* Top Section */}
        <div className="bg-white flex flex-col items-center py-8 border-b border-[#e5e5e5]">
          <div className="relative group">
            <div className={`w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-gray-100 relative transition-opacity ${isUploadingFoto ? 'opacity-50' : ''}`}>
              <ImageWithFallback 
                src={profileImage || "https://images.unsplash.com/photo-1729821728830-068bbff90645?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwbWFsZSUyMHRlYWNoZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzYwNjQ4MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
                alt="Profile"
                className="w-full h-full object-cover"
                fallback={<User className="w-8 h-8 text-[#94a3b8]" />}
              />
              {isUploadingFoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="w-6 h-6 text-[#16a34a] animate-spin" />
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              id="profile-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            
            <label 
              htmlFor="profile-upload"
              className={`absolute bottom-0 right-0 p-1.5 bg-[#16a34a] rounded-full border-2 border-white shadow-md transition-colors cursor-pointer ${isUploadingFoto ? 'pointer-events-none opacity-50' : 'active:bg-[#15803d]'}`}
            >
              <Camera className="w-4 h-4 text-white" />
            </label>
          </div>
          <label 
            htmlFor="profile-upload" 
            className={`mt-3 text-[#16a34a] text-[13px] font-semibold transition-all cursor-pointer ${isUploadingFoto ? 'pointer-events-none opacity-50' : 'hover:underline'}`}
          >
            {isUploadingFoto ? 'Mengunggah...' : 'Ubah Foto'}
          </label>
        </div>

        {/* Information Section */}
        <div className="mt-4 bg-white border-y border-[#e5e5e5] px-4 py-2">
          {isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#16a34a]" /></div>
          ) : (
            <>
              <div className="py-3 border-b border-[#e5e5e5] last:border-0">
                <p className="text-[#737373] text-[12px] font-medium mb-1">Nama Lengkap</p>
                <p className="text-[#0a0a0a] text-[15px] font-medium">{profileName}</p>
              </div>
              <div className="py-3 border-b border-[#e5e5e5] last:border-0">
                <p className="text-[#737373] text-[12px] font-medium mb-1">NIP</p>
                <p className="text-[#0a0a0a] text-[15px] font-medium">{nip}</p>
              </div>
              <div className="py-3 border-b border-[#e5e5e5] last:border-0">
                <p className="text-[#737373] text-[12px] font-medium mb-1">Tugas / Jabatan</p>
                <p className="text-[#0a0a0a] text-[15px] font-medium capitalize">{userRole === 'admin' ? 'Administrator' : 'Guru Kelas'}</p>
              </div>
              <div className="py-3">
                <p className="text-[#737373] text-[12px] font-medium mb-1">Nomor WhatsApp</p>
                <div className="flex items-center justify-between">
                  {isEditingWa ? (
                    <input
                      autoFocus
                      type="tel"
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      onBlur={handleSaveWa}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveWa()}
                      className="flex-1 bg-transparent border-b-2 border-[#16a34a] text-[#0a0a0a] text-[15px] font-medium outline-none pb-1"
                    />
                  ) : (
                    <p className="flex-1 text-[#0a0a0a] text-[15px] font-medium">{waNumber || 'Belum diisi'}</p>
                  )}
                  <button 
                    onClick={() => isEditingWa ? handleSaveWa() : setIsEditingWa(true)}
                    className="p-2 -mr-2 text-[#16a34a] active:bg-[#f0fdf4] rounded-full transition-colors"
                  >
                    {isEditingWa ? <CheckCircle2 className="w-5 h-5" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Security Section */}
        <div className="mt-4 px-4 mb-8">
          <button 
            onClick={() => toast.info('Fitur ubah sandi akan segera hadir!')}
            className="w-full bg-white border border-[#e5e5e5] rounded-xl p-4 flex items-center justify-between active:bg-[#f5f5f5] transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#16a34a]" />
              </div>
              <span className="text-[#0a0a0a] text-[15px] font-semibold">Ubah Kata Sandi</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#737373]" />
          </button>
        </div>
      </div>
    </div>
  );
}