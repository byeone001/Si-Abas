import { ChevronLeft, AlertTriangle, CheckCircle2, Scan } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface FaceRecognitionScreenProps {
  onClose: () => void;
  onComplete: () => void;
}

export function FaceRecognitionScreen({ onClose, onComplete }: FaceRecognitionScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const statusButtons = [
    { label: 'Hadir', color: 'border-[#16a34a] text-[#16a34a]' },
    { label: 'Izin', color: 'border-[#2563eb] text-[#2563eb]' },
    { label: 'Sakit', color: 'border-[#eab308] text-[#eab308]' },
    { label: 'Alpa', color: 'border-[#dc2626] text-[#dc2626]' },
  ];

  // Efek untuk menyalakan kamera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }, // Gunakan kamera depan jika di HP
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        
        // Mulai simulasi pemindaian setelah kamera menyala
        setScanStatus('scanning');
        
        // Simulasi proses scanning (3 detik)
        setTimeout(() => {
          setScanStatus('success');
          setSelectedStatus('Hadir');
        }, 3000);

      } catch (err) {
        console.error("Gagal mengakses kamera:", err);
        setScanStatus('failed');
      }
    }

    startCamera();

    // Membersihkan memori & mematikan kamera saat komponen ditutup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-lg active:bg-white/20 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-semibold flex-1 text-center pr-16 tracking-tight">
          Presensi Kelas 3A
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Camera Feed Area */}
        <div className="px-4 pt-5 pb-4">
          <div className="relative bg-[#0a0a0a] rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center">
            
            {/* Elemen Video Kamera */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Fallback Jika Kamera Gagal/Loading */}
            {scanStatus === 'idle' && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#262626] to-[#0a0a0a]" />
            )}

            {/* Face Detection Oval */}
            <div className="relative z-10 w-[70%] aspect-[3/4]">
              <svg className="w-full h-full" viewBox="0 0 200 280">
                <ellipse
                  cx="100"
                  cy="140"
                  rx="90"
                  ry="130"
                  fill="none"
                  stroke={scanStatus === 'success' ? '#16a34a' : scanStatus === 'scanning' ? '#fbbf24' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={scanStatus === 'scanning' ? "8 6" : "0"}
                  opacity="0.8"
                  className={scanStatus === 'scanning' ? 'animate-pulse' : ''}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-[14px] text-center font-medium drop-shadow-md bg-black/30 px-3 py-1 rounded-full">
                  {scanStatus === 'scanning' && 'Memindai wajah...'}
                  {scanStatus === 'success' && 'Wajah Dikenali'}
                  {scanStatus === 'failed' && 'Kamera Gagal'}
                </div>
              </div>
            </div>

            {/* Corner Guides */}
            <div className={`absolute top-12 left-12 w-6 h-6 border-l-4 border-t-4 transition-colors ${scanStatus === 'success' ? 'border-[#16a34a]' : 'border-white/50'}`} />
            <div className={`absolute top-12 right-12 w-6 h-6 border-r-4 border-t-4 transition-colors ${scanStatus === 'success' ? 'border-[#16a34a]' : 'border-white/50'}`} />
            <div className={`absolute bottom-12 left-12 w-6 h-6 border-l-4 border-b-4 transition-colors ${scanStatus === 'success' ? 'border-[#16a34a]' : 'border-white/50'}`} />
            <div className={`absolute bottom-12 right-12 w-6 h-6 border-r-4 border-b-4 transition-colors ${scanStatus === 'success' ? 'border-[#16a34a]' : 'border-white/50'}`} />
          </div>
        </div>

        {/* Feedback Text / Status Pemindaian */}
        {scanStatus === 'scanning' && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 bg-[#fef3c7] border border-[#fbbf24] rounded-lg px-3 py-2.5">
              <Scan className="w-4 h-4 text-[#d97706] flex-shrink-0 animate-spin-slow" />
              <p className="text-[#92400e] text-[13px]">Sedang memproses, harap diam sejenak...</p>
            </div>
          </div>
        )}

        {/* Detection Status Success */}
        {scanStatus === 'success' && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#86efac] rounded-lg px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] flex-shrink-0" />
              <p className="text-[#0a0a0a] text-[13px]">
                <span className="font-semibold">Budi Santoso</span> (Cocok - 92%)
              </p>
            </div>
          </div>
        )}
        
        {/* Detection Status Failed */}
        {scanStatus === 'failed' && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 bg-[#fef2f2] border border-[#fca5a5] rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
              <p className="text-[#991b1b] text-[13px]">
                Akses kamera ditolak atau tidak ditemukan.
              </p>
            </div>
          </div>
        )}

        {/* Manual Override Section */}
        <div className="px-4 pb-4">
          <h3 className="text-[#0a0a0a] text-[13px] font-semibold mb-3 tracking-wider">SET MANUAL (JIKA GAGAL)</h3>
          <div className="grid grid-cols-4 gap-2">
            {statusButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => setSelectedStatus(btn.label)}
                className={`border-2 ${btn.color} ${
                  selectedStatus === btn.label ? 'bg-opacity-10 scale-95 ring-2 ring-offset-1' : 'bg-white'
                } rounded-lg py-2.5 text-[13px] font-semibold active:scale-95 transition-all`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="border-t border-[#e5e5e5] p-4">
        <button
          onClick={onComplete}
          disabled={!selectedStatus}
          className={`w-full text-white text-[14px] font-semibold py-3.5 rounded-lg transition-colors ${
            selectedStatus ? 'bg-[#16a34a] active:bg-[#15803d]' : 'bg-[#a3a3a3] cursor-not-allowed'
          }`}
        >
          SELESAI & REKAP
        </button>
      </div>
    </div>
  );
}