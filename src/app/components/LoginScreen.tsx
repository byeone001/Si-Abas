import { useState } from 'react';
import { Eye, EyeOff, User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImg from "../../imports/Gemini_Generated_Image_xg3fxbxg3fxbxg3f.png";

interface LoginScreenProps {
  onLogin: () => void;
}

// Kredensial demo
const DEMO_USERNAME = 'ahmad.dahlan';
const DEMO_PASSWORD = 'siabas2026';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  const handleLogin = () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Username dan password tidak boleh kosong.');
      return;
    }
    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      setError('Username atau password salah. Silakan coba lagi.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  const handleFillDemo = () => {
    setUsername(DEMO_USERNAME);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">

      {/* Hero Section */}
      <div className="relative h-[260px] flex-shrink-0 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1617727973004-b0b34a2d645c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc2xhbWljJTIwc2Nob29sJTIwbW9zcXVlJTIwZ3JlZW4lMjBuYXR1cmV8ZW58MXx8fHwxNzc2NTE4MTkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Madrasah Islamiyah"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#16a34a]/70 via-[#16a34a]/50 to-white" />

        {/* Logo & Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
          {/* Logo bulat */}
          <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden">
            <img src={logoImg} alt="Logo SI-ABAS ISLAMIYAH" className="w-full h-full object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-white text-[20px] font-bold tracking-tight drop-shadow">
              SI-ABAS ISLAMIYAH
            </h1>
            <p className="text-white/85 text-[12px] mt-0.5 drop-shadow">
              Sistem Absensi Madrasah Islamiyah
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-5 pt-4 pb-6 overflow-auto flex flex-col gap-4">

        <div>
          <h2 className="text-[#0a0a0a] text-[19px] font-semibold">Masuk ke Akun</h2>
          <p className="text-[#737373] text-[13px] mt-0.5">Silakan login dengan akun guru Anda</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
            <p className="text-[#dc2626] text-[13px] leading-snug">{error}</p>
          </div>
        )}

        {/* Username Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[#0a0a0a] text-[13px] font-medium">Username</label>
          <div
            className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors ${
              focusedField === 'username'
                ? 'border-[#16a34a] bg-[#f0fdf4]'
                : 'border-[#e5e5e5] bg-[#fafafa]'
            }`}
          >
            <User className={`w-5 h-5 flex-shrink-0 ${focusedField === 'username' ? 'text-[#16a34a]' : 'text-[#a3a3a3]'}`} />
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              placeholder="Masukkan username"
              className="flex-1 bg-transparent text-[#0a0a0a] text-[14px] outline-none placeholder-[#a3a3a3]"
              autoComplete="username"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[#0a0a0a] text-[13px] font-medium">Password</label>
          <div
            className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors ${
              focusedField === 'password'
                ? 'border-[#16a34a] bg-[#f0fdf4]'
                : 'border-[#e5e5e5] bg-[#fafafa]'
            }`}
          >
            <Lock className={`w-5 h-5 flex-shrink-0 ${focusedField === 'password' ? 'text-[#16a34a]' : 'text-[#a3a3a3]'}`} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Masukkan password"
              className="flex-1 bg-transparent text-[#0a0a0a] text-[14px] outline-none placeholder-[#a3a3a3]"
              autoComplete="current-password"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-0.5 active:opacity-60 transition-opacity"
              type="button"
            >
              {showPassword
                ? <EyeOff className="w-4.5 h-4.5 text-[#a3a3a3]" />
                : <Eye className="w-4.5 h-4.5 text-[#a3a3a3]" />
              }
            </button>
          </div>
          <button className="self-end text-[#16a34a] text-[12px] font-medium active:opacity-60">
            Lupa Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[#16a34a] text-white text-[15px] font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 active:bg-[#15803d] disabled:opacity-70 transition-colors mt-1"
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Memverifikasi...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>Masuk</span>
            </>
          )}
        </button>

        {/* Demo Hint Card */}
        <div className="bg-[#f0fdf4] border border-[#86efac] rounded-xl px-4 py-3">
          <p className="text-[#15803d] text-[12px] font-semibold mb-1.5">Akun Demo</p>
          <div className="flex flex-col gap-0.5">
            <p className="text-[#166534] text-[12px]">
              Username: <span className="font-mono font-semibold">ahmad.dahlan</span>
            </p>
            <p className="text-[#166534] text-[12px]">
              Password: <span className="font-mono font-semibold">siabas2026</span>
            </p>
          </div>
          <button
            onClick={handleFillDemo}
            className="mt-2 text-[#16a34a] text-[12px] font-semibold underline active:opacity-60"
          >
            Isi otomatis →
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[#a3a3a3] text-[11px] mt-auto pt-2">
          © 2026 SI-ABAS ISLAMIYAH · Madrasah Islamiyah
        </p>
      </div>
    </div>
  );
}