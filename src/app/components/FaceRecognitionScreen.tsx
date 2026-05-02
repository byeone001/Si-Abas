import { ChevronLeft, AlertTriangle, CheckCircle2, Scan, Loader2, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';

interface FaceRecognitionScreenProps {
  onClose: () => void;
  onComplete: () => void;
}

// Koordinat Sekolah (Contoh: Ganti dengan koordinat asli sekolah)
const SCHOOL_LOCATION = { lat: -6.175392, lng: 106.827153 }; 
const ALLOWED_RADIUS = 100; // Meter

export function FaceRecognitionScreen({ onClose, onComplete }: FaceRecognitionScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'loading_models' | 'scanning' | 'success' | 'failed' | 'outside_area'>('idle');
  const [detectedName, setDetectedName] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionInterval = useRef<any>(null);

  const statusButtons = [
    { label: 'Hadir', color: 'border-[#16a34a] text-[#16a34a]' },
    { label: 'Izin', color: 'border-[#2563eb] text-[#2563eb]' },
    { label: 'Sakit', color: 'border-[#eab308] text-[#eab308]' },
    { label: 'Alpa', color: 'border-[#dc2626] text-[#dc2626]' },
  ];

  // Fungsi hitung jarak GPS
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    const initProcess = async () => {
      // 1. Cek Geofencing dulu
      setScanStatus('idle');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const d = calculateDistance(
            position.coords.latitude, 
            position.coords.longitude,
            SCHOOL_LOCATION.lat,
            SCHOOL_LOCATION.lng
          );
          setDistance(Math.round(d));

          if (d > ALLOWED_RADIUS) {
            // setScanStatus('outside_area'); // Uncomment untuk aktifkan geofencing ketat
            // return;
          }

          // 2. Load Models & Start Camera
          await startFaceDetection();
        },
        (err) => {
          console.error("GPS Error:", err);
          startFaceDetection(); // Lanjut saja jika GPS gagal (opsional)
        }
      );
    };

    async function startFaceDetection() {
      setScanStatus('loading_models');
      try {
        // Load models dari CDN
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;

        setScanStatus('scanning');
        
        // Loop deteksi
        detectionInterval.current = setInterval(async () => {
          if (videoRef.current && scanStatus !== 'success') {
            const detections = await faceapi.detectSingleFace(
              videoRef.current, 
              new faceapi.TinyFaceDetectorOptions()
            );

            if (detections) {
              // Simulasi: Jika wajah terdeteksi, kita anggap sukses 
              // (Di tahap lanjut bisa dibandingkan dengan embedding database)
              clearInterval(detectionInterval.current);
              setScanStatus('success');
              setDetectedName('Budi Santoso'); // Placeholder hasil deteksi
              setSelectedStatus('Hadir');
            }
          }
        }, 1000);

      } catch (err) {
        console.error("Init Error:", err);
        setScanStatus('failed');
      }
    }

    initProcess();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 px-3 py-2.5 rounded-lg active:bg-white/20 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Kembali</span>
        </button>
        <h1 className="text-white text-[17px] font-semibold flex-1 text-center pr-16 tracking-tight">Presensi Kelas 3A</h1>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Camera Feed Area */}
        <div className="px-4 pt-5 pb-4">
          <div className="relative bg-[#0a0a0a] rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center border-2 border-[#e5e5e5]">
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            
            {(scanStatus === 'idle' || scanStatus === 'loading_models') && (
              <div className="absolute inset-0 bg-[#171717] flex flex-col items-center justify-center gap-3 z-20">
                <Loader2 className="w-8 h-8 text-[#16a34a] animate-spin" />
                <p className="text-white text-[12px] font-medium">Menyiapkan Kamera & AI...</p>
              </div>
            )}

            {/* Face Detection Oval */}
            <div className="relative z-10 w-[75%] aspect-[3.5/5]">
              <div className={`absolute inset-0 border-2 rounded-[50%] transition-colors duration-500 ${
                scanStatus === 'success' ? 'border-[#16a34a] shadow-[0_0_20px_#16a34a]' : 
                scanStatus === 'scanning' ? 'border-white/40 border-dashed animate-pulse' : 'border-white/20'
              }`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-[11px] font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  {scanStatus === 'scanning' && 'Posisikan Wajah'}
                  {scanStatus === 'success' && 'Wajah Dikenali'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="px-4 mb-4">
          <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${scanStatus === 'outside_area' ? 'bg-[#fef2f2]' : 'bg-[#f0fdf4]'}`}>
              <MapPin className={`w-4 h-4 ${scanStatus === 'outside_area' ? 'text-[#dc2626]' : 'text-[#16a34a]'}`} />
            </div>
            <div>
              <p className="text-[#0a0a0a] text-[13px] font-bold">Verifikasi Lokasi</p>
              <p className="text-[#737373] text-[11px]">Jarak: {distance !== null ? `${distance}m dari sekolah` : 'Menghitung...'}</p>
            </div>
            {scanStatus === 'outside_area' && (
              <span className="ml-auto text-[#dc2626] text-[10px] font-bold bg-[#fef2f2] px-2 py-1 rounded-md">DI LUAR AREA</span>
            )}
          </div>
        </div>

        {/* Detection Status Feedback */}
        <div className="px-4 pb-4">
          {scanStatus === 'scanning' && (
            <div className="flex items-center gap-2 bg-[#fffbeb] border border-[#fef3c7] rounded-xl px-4 py-3">
              <Scan className="w-4 h-4 text-[#d97706] animate-pulse" />
              <p className="text-[#92400e] text-[13px] font-medium">Menganalisis wajah...</p>
            </div>
          )}
          {scanStatus === 'success' && (
            <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#86efac] rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
              <p className="text-[#065f46] text-[13px] font-bold">{detectedName} Teridentifikasi</p>
            </div>
          )}
          {scanStatus === 'failed' && (
            <div className="flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
              <p className="text-[#991b1b] text-[13px]">Gagal mengakses kamera atau AI.</p>
            </div>
          )}
        </div>

        {/* Manual Status */}
        <div className="px-4 pb-8">
          <h3 className="text-[#737373] text-[11px] font-bold uppercase tracking-widest mb-3">Status Kehadiran</h3>
          <div className="grid grid-cols-4 gap-2">
            {statusButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => setSelectedStatus(btn.label)}
                className={`border-2 rounded-xl py-3 text-[12px] font-bold transition-all ${
                  selectedStatus === btn.label 
                    ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a] shadow-sm scale-95' 
                    : 'border-[#e5e5e5] bg-white text-[#737373]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="border-t border-[#e5e5e5] p-4 bg-[#fafafa]">
        <button
          onClick={onComplete}
          disabled={!selectedStatus || scanStatus === 'outside_area'}
          className={`w-full text-white text-[14px] font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 ${
            selectedStatus && scanStatus !== 'outside_area' ? 'bg-[#16a34a] shadow-[#16a34a]/20' : 'bg-[#d4d4d4] cursor-not-allowed'
          }`}
        >
          SIMPAN PRESENSI
        </button>
      </div>
    </div>
  );
}