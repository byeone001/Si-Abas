import { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
  Camera,
  MapPin,
  ClipboardList,
  Send,
  Wifi,
  AlertCircle,
  CheckCircle2,
  Search,
  ExternalLink,
} from 'lucide-react';

interface HelpScreenProps {
  onBack: () => void;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const faqData = [
  {
    id: 1,
    q: 'Bagaimana cara memulai presensi?',
    a: 'Buka Dashboard, pilih jadwal kelas yang ingin diabsen, lalu tekan tombol "MULAI PRESENSI". Pastikan lokasi GPS Anda terdeteksi di area sekolah sebelum memulai.',
  },
  {
    id: 2,
    q: 'Apa yang harus dilakukan jika wajah siswa tidak terdeteksi?',
    a: 'Pastikan pencahayaan cukup dan wajah siswa menghadap kamera dengan jelas. Jika masih gagal, gunakan tombol override manual (Hadir / Izin / Sakit / Alpa) untuk mencatat presensi secara manual.',
  },
  {
    id: 3,
    q: 'Bagaimana cara mengirim laporan ke WhatsApp?',
    a: 'Setelah semua siswa diabsen, buka halaman Ringkasan dan tekan tombol "Submit & Kirim WhatsApp". Sistem akan otomatis mengirimkan laporan ke grup orang tua yang terdaftar.',
  },
  {
    id: 4,
    q: 'GPS tidak terdeteksi, bagaimana solusinya?',
    a: 'Pastikan izin lokasi sudah diberikan untuk aplikasi ini. Coba aktifkan/matikan GPS lalu buka kembali aplikasi. Jika masih bermasalah, hubungi administrator sekolah.',
  },
  {
    id: 5,
    q: 'Apakah data presensi tersimpan jika tidak ada internet?',
    a: 'Ya, data presensi disimpan secara lokal di perangkat. Data akan otomatis tersinkronisasi ke server saat koneksi internet tersedia kembali.',
  },
  {
    id: 6,
    q: 'Bagaimana cara mengubah status presensi yang sudah dicatat?',
    a: 'Pada halaman Ringkasan, ketuk nama siswa yang ingin diubah statusnya, lalu pilih status yang sesuai. Perubahan hanya bisa dilakukan sebelum laporan dikirim.',
  },
];

const guideSteps = [
  {
    icon: <MapPin className="w-5 h-5 text-[#16a34a]" />,
    title: 'Pastikan GPS Aktif',
    desc: 'Buka aplikasi di area sekolah. Sistem akan memvalidasi lokasi secara otomatis.',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-[#16a34a]" />,
    title: 'Pilih Jadwal Kelas',
    desc: 'Di Dashboard, pilih jadwal kelas yang akan diabsen hari ini.',
  },
  {
    icon: <Camera className="w-5 h-5 text-[#16a34a]" />,
    title: 'Scan Wajah Siswa',
    desc: 'Arahkan kamera ke wajah siswa satu per satu. Sistem mendeteksi otomatis.',
  },
  {
    icon: <ClipboardList className="w-5 h-5 text-[#16a34a]" />,
    title: 'Cek Ringkasan',
    desc: 'Tinjau daftar presensi. Edit status jika ada yang perlu diperbaiki.',
  },
  {
    icon: <Send className="w-5 h-5 text-[#16a34a]" />,
    title: 'Kirim Laporan',
    desc: 'Tekan Submit untuk menyimpan dan mengirim laporan ke WhatsApp orang tua.',
  },
];

const troubleshootItems = [
  {
    icon: <Wifi className="w-4 h-4 text-[#f59e0b]" />,
    bg: 'bg-[#fffbeb]',
    title: 'Koneksi Lambat / Timeout',
    solution: 'Coba pindah ke jaringan Wi-Fi sekolah atau aktifkan data seluler. Lakukan sinkronisasi ulang dari menu Pengaturan.',
  },
  {
    icon: <Camera className="w-4 h-4 text-[#3b82f6]" />,
    bg: 'bg-[#eff6ff]',
    title: 'Kamera Tidak Bisa Dibuka',
    solution: 'Pastikan izin kamera sudah diaktifkan di pengaturan perangkat. Tutup aplikasi lain yang menggunakan kamera, lalu coba lagi.',
  },
  {
    icon: <AlertCircle className="w-4 h-4 text-[#dc2626]" />,
    bg: 'bg-[#fef2f2]',
    title: 'Login Gagal Berulang Kali',
    solution: 'Periksa kembali username dan password. Jika lupa password, hubungi administrator sekolah untuk reset akun.',
  },
  {
    icon: <MapPin className="w-4 h-4 text-[#8b5cf6]" />,
    bg: 'bg-[#f5f3ff]',
    title: 'Lokasi Di Luar Area Sekolah',
    solution: 'Pastikan berada di dalam lingkungan sekolah. Jika lokasi masih tidak terdeteksi, hubungi admin untuk mengatur ulang radius GPS.',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function FaqItem({ id, q, a }: { id: number; q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-[#86efac] bg-[#f0fdf4]' : 'border-[#e5e5e5] bg-white'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
      >
        <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold ${open ? 'bg-[#16a34a] text-white' : 'bg-[#e5e5e5] text-[#737373]'}`}>
          {id}
        </span>
        <span className={`flex-1 text-[14px] font-medium leading-snug ${open ? 'text-[#16a34a]' : 'text-[#0a0a0a]'}`}>
          {q}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 text-[#a3a3a3] flex-shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="ml-9">
            <p className="text-[#374151] text-[13px] leading-relaxed">{a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-5 pb-2">
      <p className="text-[#16a34a] text-[12px] font-semibold tracking-widest uppercase">{children}</p>
      <div className="flex-1 h-px bg-[#dcfce7]" />
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function HelpScreen({ onBack }: HelpScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'panduan' | 'faq' | 'masalah' | 'kontak'>('panduan');

  const filteredFaq = faqData.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#fafafa]">
      {/* Top App Bar */}
      <div className="bg-[#16a34a] flex-shrink-0">
        <div className="px-2 py-3 flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-lg active:bg-white/20 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
            <span className="text-white text-[14px] font-medium">Kembali</span>
          </button>
          <h1 className="text-white text-[17px] font-semibold flex-1 text-center pr-20 tracking-tight">
            Bantuan
          </h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-white/70 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setActiveTab('faq');
              }}
              placeholder="Cari pertanyaan atau topik..."
              className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder-white/60"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-white/70 text-[11px]">✕</button>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        {!searchQuery && (
          <div className="flex border-t border-white/20">
            {[
              { key: 'panduan', label: 'Panduan' },
              { key: 'faq', label: 'FAQ' },
              { key: 'masalah', label: 'Masalah' },
              { key: 'kontak', label: 'Kontak' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-white border-b-2 border-white'
                    : 'text-white/60 border-b-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-auto pb-8">

        {/* ─── SEARCH RESULTS ─── */}
        {searchQuery && (
          <div className="px-4 pt-4 flex flex-col gap-3">
            <p className="text-[#737373] text-[13px]">
              {filteredFaq.length} hasil untuk "<span className="text-[#0a0a0a] font-medium">{searchQuery}</span>"
            </p>
            {filteredFaq.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-14 h-14 rounded-full bg-[#f5f5f5] flex items-center justify-center">
                  <Search className="w-6 h-6 text-[#a3a3a3]" />
                </div>
                <p className="text-[#737373] text-[14px] text-center">
                  Tidak ada hasil yang ditemukan.<br />Coba kata kunci lain.
                </p>
              </div>
            ) : (
              filteredFaq.map((item) => (
                <FaqItem key={item.id} {...item} />
              ))
            )}
          </div>
        )}

        {/* ─── TAB: PANDUAN ─── */}
        {!searchQuery && activeTab === 'panduan' && (
          <>
            {/* Hero Card */}
            <div className="mx-4 mt-4 bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-[15px] font-semibold">Panduan Penggunaan</p>
                <p className="text-[#bbf7d0] text-[12px] mt-0.5">5 langkah mudah presensi harian</p>
              </div>
            </div>

            <SectionTitle>Langkah-Langkah</SectionTitle>
            <div className="px-4 flex flex-col gap-0">
              {guideSteps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  {/* Line connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-[#f0fdf4] border-2 border-[#86efac] flex items-center justify-center flex-shrink-0 z-10">
                      {step.icon}
                    </div>
                    {idx < guideSteps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-[#dcfce7] my-1" />
                    )}
                  </div>
                  <div className={`pb-4 ${idx === guideSteps.length - 1 ? '' : ''}`}>
                    <p className="text-[#0a0a0a] text-[14px] font-semibold mt-1.5">{step.title}</p>
                    <p className="text-[#737373] text-[13px] mt-0.5 leading-snug">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips card */}
            <SectionTitle>Tips & Trik</SectionTitle>
            <div className="px-4 flex flex-col gap-2.5">
              {[
                'Lakukan presensi di ruangan dengan cahaya yang cukup untuk hasil deteksi wajah terbaik.',
                'Sinkronisasi data setiap hari setelah selesai mengajar untuk menghindari kehilangan data.',
                'Aktifkan notifikasi agar mendapat pengingat jadwal 15 menit sebelum kelas dimulai.',
                'Gunakan Wi-Fi sekolah untuk proses upload laporan yang lebih cepat dan stabil.',
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white border border-[#e5e5e5] rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                  <p className="text-[#374151] text-[13px] leading-snug">{tip}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── TAB: FAQ ─── */}
        {!searchQuery && activeTab === 'faq' && (
          <>
            <SectionTitle>Pertanyaan Umum</SectionTitle>
            <div className="px-4 flex flex-col gap-2.5">
              {faqData.map((item) => (
                <FaqItem key={item.id} {...item} />
              ))}
            </div>
          </>
        )}

        {/* ─── TAB: MASALAH ─── */}
        {!searchQuery && activeTab === 'masalah' && (
          <>
            <SectionTitle>Troubleshooting</SectionTitle>
            <div className="px-4 flex flex-col gap-3">
              {troubleshootItems.map((item, idx) => (
                <div key={idx} className={`${item.bg} border border-[#e5e5e5] rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <p className="text-[#0a0a0a] text-[14px] font-semibold">{item.title}</p>
                  </div>
                  <p className="text-[#374151] text-[13px] leading-relaxed ml-9">{item.solution}</p>
                </div>
              ))}
            </div>

            {/* Still having issues */}
            <div className="mx-4 mt-4 bg-[#f0fdf4] border border-[#86efac] rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#166534] text-[13px] font-semibold">Masih ada masalah?</p>
                <p className="text-[#166534] text-[12px] mt-0.5 leading-snug">
                  Hubungi tim dukungan teknis melalui menu Kontak di bawah ini.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ─── TAB: KONTAK ─── */}
        {!searchQuery && activeTab === 'kontak' && (
          <>
            <SectionTitle>Hubungi Kami</SectionTitle>
            <div className="px-4 flex flex-col gap-3">

              {/* WhatsApp */}
              <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#dcfce7] flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#16a34a]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#0a0a0a] text-[14px] font-semibold">WhatsApp Admin</p>
                  <p className="text-[#737373] text-[12px] mt-0.5">Respon cepat (jam kerja)</p>
                  <p className="text-[#16a34a] text-[13px] font-medium mt-1">+62 812-3456-7890</p>
                </div>
                <button className="w-9 h-9 rounded-lg bg-[#f0fdf4] flex items-center justify-center active:bg-[#dcfce7]">
                  <ExternalLink className="w-4 h-4 text-[#16a34a]" />
                </button>
              </div>

              {/* Telepon */}
              <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#0a0a0a] text-[14px] font-semibold">Telepon Sekolah</p>
                  <p className="text-[#737373] text-[12px] mt-0.5">Senin – Jumat, 07.00 – 15.00</p>
                  <p className="text-[#3b82f6] text-[13px] font-medium mt-1">(021) 7890-1234</p>
                </div>
                <button className="w-9 h-9 rounded-lg bg-[#eff6ff] flex items-center justify-center active:bg-[#dbeafe]">
                  <ExternalLink className="w-4 h-4 text-[#3b82f6]" />
                </button>
              </div>

              {/* Email */}
              <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#fef3c7] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#d97706]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#0a0a0a] text-[14px] font-semibold">Email Dukungan</p>
                  <p className="text-[#737373] text-[12px] mt-0.5">Balasan dalam 1×24 jam</p>
                  <p className="text-[#d97706] text-[13px] font-medium mt-1">admin@islamiyah.sch.id</p>
                </div>
                <button className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center active:bg-[#fde68a]">
                  <ExternalLink className="w-4 h-4 text-[#d97706]" />
                </button>
              </div>
            </div>

            {/* Jam Operasional */}
            <SectionTitle>Jam Operasional</SectionTitle>
            <div className="mx-4 bg-white border border-[#e5e5e5] rounded-xl overflow-hidden">
              {[
                { day: 'Senin – Kamis', hours: '07.00 – 15.00 WIB', active: true },
                { day: 'Jumat', hours: '07.00 – 11.30 WIB', active: true },
                { day: 'Sabtu', hours: '07.00 – 12.00 WIB', active: true },
                { day: 'Minggu & Libur', hours: 'Tutup', active: false },
              ].map((row, idx, arr) => (
                <div key={idx}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-[#0a0a0a] text-[13px] font-medium">{row.day}</p>
                    <span className={`text-[13px] font-medium ${row.active ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                      {row.hours}
                    </span>
                  </div>
                  {idx < arr.length - 1 && <div className="h-px bg-[#f5f5f5] mx-4" />}
                </div>
              ))}
            </div>

            {/* Kirim Laporan Bug */}
            <SectionTitle>Laporkan Masalah</SectionTitle>
            <div className="mx-4 flex flex-col gap-2.5">
              <textarea
                rows={3}
                placeholder="Jelaskan masalah yang Anda temukan..."
                className="w-full border border-[#e5e5e5] rounded-xl px-4 py-3 text-[13px] text-[#0a0a0a] placeholder-[#a3a3a3] outline-none focus:border-[#16a34a] bg-white resize-none"
              />
              <button className="w-full bg-[#16a34a] text-white text-[14px] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:bg-[#15803d] transition-colors">
                <Send className="w-4 h-4" />
                Kirim Laporan
              </button>
            </div>

            <p className="text-center text-[#a3a3a3] text-[11px] mt-6 px-4">
              Versi SI-ABAS ISLAMIYAH v1.0.0
            </p>
          </>
        )}
      </div>
    </div>
  );
}
