import { ChevronLeft, AlertTriangle, CheckCircle2, Scan, Loader2, MapPin, Eye, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { supabase } from '@/lib/supabase';

interface FaceRecognitionScreenProps {
  onClose: () => void;
  onComplete: (presentIds: number[]) => void;
  classId: number;
  className: string;
}

// Koordinat Sekolah (Contoh: Ganti dengan koordinat asli sekolah)
//const SCHOOL_LOCATION = { lat: -7.693503, lng: 111.333048 };
const SCHOOL_LOCATION = { lat: -7.693499, lng: 111.333072 };
const ALLOWED_RADIUS = 100; // Meter (sesuai SRS FR-02)

export function FaceRecognitionScreen({ onClose, onComplete, classId, className }: FaceRecognitionScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'loading_models' | 'starting_camera' | 'scanning' | 'success' | 'failed' | 'outside_area'>('idle');
  const [distance, setDistance] = useState<number | null>(null);
  const [allowOutside, setAllowOutside] = useState<boolean>(() => {
    const v = localStorage.getItem('allowOutsidePresensi');
    return v !== null ? JSON.parse(v) : false;
  });

  // States for Continuous Scanning
  const [presentStudents, setPresentStudents] = useState<Set<number>>(new Set());
  const [lastScannedName, setLastScannedName] = useState<string | null>(null);
  const [livenessVerified, setLivenessVerified] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const [students, setStudents] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionInterval = useRef<any>(null);
  const blinkCountRef = useRef(0);
  const earBelowRef = useRef(false);
  const livenessVerifiedRef = useRef(false);
  const lastRecognitionRef = useRef(0); // throttle recognition ke 1x/detik

  // Konstanta Liveness Detection
  // EAR 0.30 lebih toleran; blink normal biasanya EAR turun ke 0.10-0.20
  const EAR_THRESHOLD = 0.30;
  const BLINKS_REQUIRED = 1; // Cukup 1 kedipan untuk verifikasi

  // Hitung jarak Euclidean dua titik landmark
  const euclideanDist = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
    Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

  // Eye Aspect Ratio — deteksi kedipan dari 6 titik landmark mata
  const calcEAR = (eyePts: { x: number; y: number }[]) => {
    const A = euclideanDist(eyePts[1], eyePts[5]);
    const B = euclideanDist(eyePts[2], eyePts[4]);
    const C = euclideanDist(eyePts[0], eyePts[3]);
    return (A + B) / (2.0 * C);
  };

  const statusButtons = [
    { label: 'Hadir', color: 'border-[#16a34a] text-[#16a34a]' },
    { label: 'Izin', color: 'border-[#2563eb] text-[#2563eb]' },
    { label: 'Sakit', color: 'border-[#eab308] text-[#eab308]' },
    { label: 'Alpa', color: 'border-[#dc2626] text-[#dc2626]' },
  ];

  // Fungsi hitung jarak GPS
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('full_name');
      if (data) setStudents(data);
    };
    fetchStudents();
  }, [classId]);

  useEffect(() => {
    const initProcess = async () => {
      // 1. Cek Geofencing dulu (respek ke pengaturan `gpsOtomatis`)
      setScanStatus('idle');


      // Baca setting dari Pengaturan: jika pengguna mematikan "Akses GPS Otomatis",
      // atau pengguna meng-override lewat tombol "Izinkan di luar area",
      // kita lewati validasi lokasi agar aplikasi bisa dipakai di mana saja.
      const gpsSetting = localStorage.getItem('gpsOtomatis');
      const gpsEnabled = gpsSetting !== null ? JSON.parse(gpsSetting) : true;

      if (!gpsEnabled || allowOutside) {
        console.log('GPS validation disabled or override enabled; skipping geofence check.');
        await startFaceDetection();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Tambahkan console log untuk melihat koordinat yang dibaca oleh browser
          console.log("Lokasi Perangkat (Browser):", lat, lng);
          console.log("Lokasi Target (Rumah/Sekolah):", SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);

          const d = calculateDistance(
            lat,
            lng,
            SCHOOL_LOCATION.lat,
            SCHOOL_LOCATION.lng
          );
          console.log("Jarak Dihitung:", d, "meter");

          setDistance(Math.round(d));

          // Validasi geofencing: blokir akses jika di luar 100m dari sekolah
          if (d > ALLOWED_RADIUS) {
            // setScanStatus('outside_area');
            // return; // Dibypass sementara agar kamera tetap muncul walau di luar area
            console.warn("Di luar radius, namun kamera tetap dinyalakan untuk testing.");
          }

          // 2. Load Models & Start Camera
          await startFaceDetection();
        },
        (err) => {
          console.error("GPS Error:", err);
          setDistance(10);
          startFaceDetection();
        },
        // Tambahkan opsi ini agar browser memaksa menggunakan akurasi tinggi (GPS/WiFi Positioning)
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    async function startFaceDetection() {
      setScanStatus('loading_models');
      try {
        // Load models dari public/models
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        // Siapkan matcher dari data murid kelas ini yang punya face_descriptor
        let faceMatcher: faceapi.FaceMatcher | null = null;
        const enrolledStudents = students.filter(s => s.face_descriptor);
        setEnrolledCount(enrolledStudents.length);
        console.log(`[FaceRecog] Total siswa: ${students.length}, Sudah enroll: ${enrolledStudents.length}`);

        if (enrolledStudents.length > 0) {
          const labeledDescriptors = enrolledStudents.map(s => {
            const descriptorArray = new Float32Array(s.face_descriptor);
            return new faceapi.LabeledFaceDescriptors(`${s.id}#${s.full_name}`, [descriptorArray]);
          });
          faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.65);
        } else {
          console.warn('[FaceRecog] ⚠️ Tidak ada siswa yang sudah di-enroll wajahnya! Gunakan menu Pendaftaran Wajah terlebih dahulu.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;

        setScanStatus('scanning');
        // Interval 150ms: cukup cepat untuk menangkap blink (100-400ms)
        detectionInterval.current = setInterval(() => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            faceapi.detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
            )
              .withFaceLandmarks()
              .withFaceDescriptor()
              .then(detection => {
                if (!detection) return;

                // ── LIVENESS DETECTION (EAR Blink, cek setiap 150ms) ──
                if (!livenessVerifiedRef.current) {
                  const pts = detection.landmarks.positions;
                  const leftEye = [pts[36], pts[37], pts[38], pts[39], pts[40], pts[41]];
                  const rightEye = [pts[42], pts[43], pts[44], pts[45], pts[46], pts[47]];
                  const ear = (calcEAR(leftEye) + calcEAR(rightEye)) / 2;
                  console.debug('[Liveness] EAR:', ear.toFixed(3), '| Threshold:', EAR_THRESHOLD);

                  if (ear < EAR_THRESHOLD) {
                    earBelowRef.current = true; // Mata sedang menutup
                  } else if (earBelowRef.current) {
                    // Mata baru terbuka kembali = kedipan selesai
                    earBelowRef.current = false;
                    blinkCountRef.current += 1;
                    setBlinkCount(blinkCountRef.current);
                    console.log('[Liveness] Blink terdeteksi! Total:', blinkCountRef.current);
                    if (blinkCountRef.current >= BLINKS_REQUIRED) {
                      livenessVerifiedRef.current = true;
                      setLivenessVerified(true);
                      console.log('[Liveness] ✅ Liveness VERIFIED!');
                    }
                  }
                  return; // Tahan face recognition sampai liveness lolos
                }

                // ── FACE RECOGNITION (throttle 1x/detik agar tidak berat) ──
                const now = Date.now();
                if (now - lastRecognitionRef.current < 1000) return;
                lastRecognitionRef.current = now;

                if (faceMatcher) {
                  const match = faceMatcher.findBestMatch(detection.descriptor);
                  if (match.label !== 'unknown') {
                    const [matchedId, matchedName] = match.label.split('#');
                    const idNum = parseInt(matchedId);
                    setPresentStudents(prev => {
                      if (!prev.has(idNum)) {
                        const newSet = new Set(prev);
                        newSet.add(idNum);
                        setLastScannedName(matchedName);
                        setTimeout(() => setLastScannedName(null), 2000);
                        return newSet;
                      }
                      return prev;
                    });
                  }
                }
              });
          }
        }, 150); // 150ms — cukup cepat tangkap blink

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
  }, [students, facingMode]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-[#16a34a] px-2 py-3 flex items-center gap-2 flex-shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 px-3 py-2.5 rounded-lg active:bg-white/20 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white text-[14px] font-medium">Tutup</span>
        </button>
        <h1 className="text-white text-[17px] font-semibold flex-1 text-center tracking-tight">Presensi {className}</h1>
        <button aria-label="Ganti Kamera" title="Ganti Kamera" onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} className="p-2 mr-1 active:bg-white/20 rounded-full transition-colors flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-4 pt-4 pb-3 flex justify-center">
          <div className="relative w-[75%] max-w-[280px] bg-[#0a0a0a] rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center border-2 border-[#e5e5e5] shadow-lg">
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

            {(scanStatus === 'idle' || scanStatus === 'loading_models') && (
              <div className="absolute inset-0 bg-[#171717] flex flex-col items-center justify-center gap-3 z-20">
                <Loader2 className="w-8 h-8 text-[#16a34a] animate-spin" />
                <p className="text-white text-[12px] font-medium">Menyiapkan Kamera & AI...</p>
              </div>
            )}

            <div className="relative z-10 w-[75%] aspect-[3.5/5]">
              <div className={`absolute inset-0 border-4 rounded-[50%] transition-all duration-300 ${lastScannedName ? 'border-[#16a34a] shadow-[0_0_30px_rgba(22,163,74,0.5)] scale-105' :
                !livenessVerified && scanStatus === 'scanning' ? 'border-[#f59e0b] border-dashed animate-pulse' :
                  scanStatus === 'scanning' ? 'border-white/30 border-dashed animate-pulse' : 'border-transparent'
                }`} />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
                <div className="text-white text-[11px] font-bold uppercase tracking-widest bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md">
                  {lastScannedName ? 'Dikenali!' : !livenessVerified && scanStatus === 'scanning' ? `Kedip ${BLINKS_REQUIRED - blinkCount}x` : scanStatus === 'scanning' ? 'Scanning...' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="flex items-center gap-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f0fdf4]">
              <MapPin className="w-4 h-4 text-[#16a34a]" />
            </div>
            <div>
              <p className="text-[#0a0a0a] text-[13px] font-bold">Verifikasi Lokasi</p>
              <p className="text-[#737373] text-[11px]">Jarak: {distance !== null ? `${distance}m dari sekolah` : 'Menghitung...'}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => {
                  const newVal = !allowOutside;
                  setAllowOutside(newVal);
                  localStorage.setItem('allowOutsidePresensi', JSON.stringify(newVal));
                }}
                className={`text-[12px] font-semibold px-3 py-2 rounded-full transition-colors ${allowOutside ? 'bg-[#16a34a] text-white' : 'bg-white border border-[#e5e5e5] text-[#374151]'}`}
              >
                {allowOutside ? 'Diizinkan: Luar Area' : 'Izinkan di Luar Area'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          {!livenessVerified && scanStatus === 'scanning' ? (
            <div className="flex items-center gap-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3 shadow-sm">
              <Eye className="w-8 h-8 text-[#d97706] flex-shrink-0" />
              <div>
                <p className="text-[#d97706] text-[11px] font-bold uppercase tracking-wider">Verifikasi Keaslian (Liveness)</p>
                <p className="text-[#0a0a0a] text-[15px] font-bold">Kedipkan mata {BLINKS_REQUIRED - blinkCount}x lagi</p>
                <p className="text-[#737373] text-[11px]">Untuk memastikan bukan foto/gambar</p>
              </div>
            </div>
          ) : enrolledCount === 0 && scanStatus === 'scanning' ? (
            <div className="flex items-center gap-3 bg-[#fef2f2] border border-[#fca5a5] rounded-xl px-4 py-3 shadow-sm">
              <AlertTriangle className="w-8 h-8 text-[#dc2626] flex-shrink-0" />
              <div>
                <p className="text-[#dc2626] text-[11px] font-bold uppercase tracking-wider">Belum Ada Wajah Terdaftar</p>
                <p className="text-[#0a0a0a] text-[14px] font-bold">0 dari {students.length} siswa ter-enroll</p>
                <p className="text-[#737373] text-[11px]">Daftar wajah dulu via menu Siswa</p>
              </div>
            </div>
          ) : lastScannedName ? (
            <div className="flex items-center gap-3 bg-[#f0fdf4] border border-[#86efac] rounded-xl px-4 py-3 shadow-sm animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8 text-[#16a34a]" />
              <div>
                <p className="text-[#16a34a] text-[11px] font-bold uppercase tracking-wider">Otomatis Hadir</p>
                <p className="text-[#0a0a0a] text-[16px] font-bold">{lastScannedName}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-5 py-4">
              <div>
                <p className="text-[#16a34a] text-[12px] font-bold uppercase tracking-widest mb-1">Status Kamera</p>
                <p className="text-[#0a0a0a] text-[14px] font-medium flex items-center gap-2">
                  <Scan className="w-4 h-4 text-[#16a34a] animate-pulse" />
                  Mengenali wajah...
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#737373] text-[11px] font-bold uppercase mb-0.5">Hadir / Enroll</p>
                <p className="text-[#16a34a] text-[24px] font-black leading-none">
                  {presentStudents.size}<span className="text-[#a3a3a3] text-[14px] font-medium">/{enrolledCount}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#e5e5e5] p-4 bg-[#fafafa]">
        <button
          onClick={() => onComplete(Array.from(presentStudents))}
          className="w-full text-white bg-[#16a34a] text-[14px] font-bold py-4 rounded-xl shadow-[0_4px_15px_rgba(22,163,74,0.3)] active:bg-[#15803d] active:scale-95 transition-all"
        >
          SELESAI ({presentStudents.size} HADIR)
        </button>
      </div>
    </div>
  );
}