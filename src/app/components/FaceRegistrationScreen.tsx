import { useState, useEffect, useRef } from 'react';
import { Camera, ChevronLeft, Loader2, CheckCircle2, AlertTriangle, ScanFace } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import { supabase } from '@/lib/supabase';

interface FaceRegistrationScreenProps {
  student: { id: number; full_name: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function FaceRegistrationScreen({ student, onClose, onSuccess }: FaceRegistrationScreenProps) {
  const [status, setStatus] = useState<'loading_models' | 'starting_camera' | 'scanning' | 'face_found' | 'saving' | 'success' | 'error' | 'duplicate'>('loading_models');
  const [errorMessage, setErrorMessage] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [existingMatcher, setExistingMatcher] = useState<faceapi.FaceMatcher | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // 1. Ambil data wajah yang sudah ada di database untuk mengecek duplikat
        const { data: existingStudents } = await supabase
          .from('students')
          .select('id, full_name, face_descriptor')
          .not('face_descriptor', 'is', null);

        if (existingStudents && existingStudents.length > 0) {
          const labeledDescriptors = existingStudents.map(s => {
            const descriptorArray = new Float32Array(s.face_descriptor);
            // Label kita isi dengan ID dan Nama agar mudah diekstrak nanti
            return new faceapi.LabeledFaceDescriptors(`${s.id}#${s.full_name}`, [descriptorArray]);
          });
          
          if (isMounted && labeledDescriptors.length > 0) {
            // Threshold 0.6 (default faceapi.js untuk komparasi wajah umum)
            // Jika diset 0.5 kadang wajah yang sama di pencahayaan beda terdeteksi sebagai 'unknown'
            setExistingMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
            console.log(`Loaded ${labeledDescriptors.length} existing faces for duplicate check.`);
          }
        }

        // 2. Load Face-API Models
        setStatus('loading_models');
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        if (!isMounted) return;

        // 3. Start Camera
        setStatus('starting_camera');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (isMounted) startScanning();
          };
        }
      } catch (err: any) {
        console.error("Init Error:", err);
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Gagal mempersiapkan kamera atau AI.');
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      stopCameraAndScan();
    };
  }, []);

  const stopCameraAndScan = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startScanning = () => {
    setStatus('scanning');
    
    // Kita gunakan state matcher terbaru melalui referensi jika perlu, tapi karena startScanning dipanggil
    // setelah init selesai, state existingMatcher mungkin belum terupdate saat fungsi ini dibuat.
    // Lebih aman mengecek nilai terbarunya menggunakan state updater atau ref.
    // Namun untuk kesederhanaan, kita bisa mengekstraknya langsung.
    
    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const detection = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

        if (detection) {
          clearInterval(scanIntervalRef.current);
          
          // 4. CEK DUPLIKAT WAJAH
          // existingMatcher state is accessed here. To ensure we have the latest, 
          // we should ideally use a ref, but let's assume it was set correctly during init.
          // We will fetch the latest state inside the interval by using a functional check if needed,
          // but React hooks might capture old state. Let's use setState callback to get latest matcher if we used a ref, 
          // or just rely on the component re-render. Since we need to access it inside setInterval, a ref is better.
          
          // Workaround: We'll do the matcher check using existingMatcher if it's available.
          // Wait, setInterval captures the initial state. We need to be careful.
          
          // Let's just dispatch an event or set state and let useEffect handle it?
          // No, we can just process it.
          setFaceDescriptor(detection.descriptor);
          
          // We will check duplicate after setting the descriptor to trigger a re-render
        }
      }
    }, 1000);
  };

  // Effect to check duplicate after face is found
  useEffect(() => {
    if (faceDescriptor && status === 'scanning') {
      if (existingMatcher) {
        const match = existingMatcher.findBestMatch(faceDescriptor);
        if (match.label !== 'unknown') {
          // Wajah ini sudah ada di database!
          const [matchedId, matchedName] = match.label.split('#');
          
          // Jika wajah ini terdaftar di murid LAIN
          if (parseInt(matchedId) !== student.id) {
            setStatus('duplicate');
            setErrorMessage(`Wajah ini sudah terdaftar atas nama: ${matchedName}`);
            return;
          }
        }
      }
      
      // Jika lolos (tidak ada duplikat atau milik sendiri)
      setStatus('face_found');
    }
  }, [faceDescriptor, status, existingMatcher, student.id]);

  const handleRetake = () => {
    setFaceDescriptor(null);
    startScanning();
  };

  const handleSave = async () => {
    if (!faceDescriptor) return;
    
    setStatus('saving');
    try {
      // Ubah Float32Array ke standard Array agar bisa disimpan sebagai JSON di Supabase
      const descriptorArray = Array.from(faceDescriptor);
      
      const { error } = await supabase
        .from('students')
        .update({ face_descriptor: descriptorArray })
        .eq('id', student.id);

      if (error) throw error;
      
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err: any) {
      console.error("Save Error:", err);
      setStatus('error');
      setErrorMessage('Gagal menyimpan data wajah ke database.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white backdrop-blur-md active:bg-white/30 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center flex-1">
          <p className="text-white/70 text-[12px] font-medium uppercase tracking-wider">Rekam Wajah Siswa</p>
          <p className="text-white text-[16px] font-bold">{student.full_name}</p>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      <div className="w-full h-full flex flex-col">
        {/* Camera Feed */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              (status === 'loading_models' || status === 'starting_camera') ? 'opacity-0' : 'opacity-100'
            }`}
          />
          
          {/* Overlays */}
          {status === 'loading_models' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#171717]">
              <Loader2 className="w-10 h-10 text-[#16a34a] animate-spin" />
              <p className="text-white font-medium">Memuat Model AI...</p>
            </div>
          )}

          {status === 'starting_camera' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#171717]">
              <Camera className="w-10 h-10 text-white/50 animate-pulse" />
              <p className="text-white font-medium">Mengakses Kamera...</p>
            </div>
          )}

          {status === 'scanning' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-64 h-64 border-4 border-dashed border-white/50 rounded-[50px] animate-pulse" />
              <div className="absolute bottom-20 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                <p className="text-white text-[13px] font-medium flex items-center gap-2">
                  <ScanFace className="w-4 h-4 text-[#16a34a]" />
                  Arahkan wajah ke kamera...
                </p>
              </div>
            </div>
          )}

          {status === 'face_found' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-64 h-64 border-4 border-[#16a34a] rounded-[50px] shadow-[0_0_30px_rgba(22,163,74,0.5)] transition-all duration-300 scale-105" />
              <div className="absolute bottom-20 bg-[#16a34a] text-white px-6 py-2 rounded-full shadow-lg">
                <p className="text-[14px] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Wajah Berhasil Dipindai!
                </p>
              </div>
            </div>
          )}

          {status === 'saving' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
              <Loader2 className="w-12 h-12 text-[#16a34a] animate-spin mb-4" />
              <p className="text-white font-bold text-[18px]">Menyimpan Data Biometrik...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#16a34a] z-30 animate-in fade-in duration-300">
              <CheckCircle2 className="w-20 h-20 text-white mb-4 animate-bounce" />
              <p className="text-white font-bold text-[24px]">Berhasil!</p>
              <p className="text-white/80 mt-2">Data wajah {student.full_name} tersimpan.</p>
            </div>
          )}

          {status === 'duplicate' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#171717]/90 px-6 text-center z-20 backdrop-blur-sm">
              <AlertTriangle className="w-16 h-16 text-[#eab308] mb-4" />
              <p className="text-white font-bold text-[18px] mb-2">Wajah Ditolak</p>
              <p className="text-white/80 text-[14px] mb-8 max-w-[280px]">{errorMessage}</p>
              <button 
                onClick={handleRetake}
                className="bg-[#eab308] text-black font-bold px-6 py-3 rounded-xl active:bg-[#ca8a04] transition-colors"
              >
                Pindai Wajah Lain
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#171717] px-6 text-center z-20">
              <AlertTriangle className="w-16 h-16 text-[#dc2626] mb-4" />
              <p className="text-white font-bold text-[18px] mb-2">Terjadi Kesalahan</p>
              <p className="text-white/70 text-[14px] mb-8">{errorMessage}</p>
              <button 
                onClick={onClose}
                className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium active:bg-white/20 transition-colors"
              >
                Kembali
              </button>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="bg-[#171717] p-5 pb-8 flex gap-3 z-10">
          <button 
            onClick={handleRetake}
            disabled={status !== 'face_found' && status !== 'duplicate'}
            className="flex-1 bg-[#262626] text-white font-semibold py-4 rounded-xl disabled:opacity-50 active:bg-[#404040] transition-colors"
          >
            ULANGI
          </button>
          <button 
            onClick={handleSave}
            disabled={status !== 'face_found'}
            className="flex-[2] bg-[#16a34a] text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
          >
            SIMPAN WAJAH
          </button>
        </div>
      </div>
    </div>
  );
}
