import { CheckCircle2, Check } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SuccessScreenProps {
  onHome: () => void;
}

export function SuccessScreen({ onHome }: SuccessScreenProps) {
  useEffect(() => {
    // Menjalankan efek kembang api (confetti)
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#16a34a', '#22c55e', '#bbf7d0']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#16a34a', '#22c55e', '#bbf7d0']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Animated Checkmark Circle */}
        <div className="w-24 h-24 bg-[#dcfce7] rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-[#dcfce7] rounded-full animate-ping opacity-75"></div>
          <div className="w-16 h-16 bg-[#16a34a] rounded-full flex items-center justify-center z-10 shadow-lg">
            <Check className="w-8 h-8 text-white stroke-[3]" />
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-[#0a0a0a] text-[24px] font-bold mb-3 text-center tracking-tight">
          Laporan Terkirim!
        </h2>
        
        <p className="text-[#737373] text-[15px] text-center leading-relaxed max-w-[280px]">
          Data presensi Kelas 3A berhasil disimpan ke server. Sistem sedang mengirimkan notifikasi WhatsApp ke Wali Murid.
        </p>
      </div>

      {/* Bottom Action */}
      <div className="px-5 pb-8 pt-4">
        <button 
          onClick={onHome}
          className="w-full bg-[#16a34a] text-white text-[15px] font-semibold py-4 rounded-xl active:bg-[#15803d] shadow-md shadow-[#16a34a]/20 transition-all hover:shadow-lg hover:shadow-[#16a34a]/30"
        >
          KEMBALI KE BERANDA
        </button>
      </div>
    </div>
  );
}