import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  KeyRound,
  Calendar,
  BookOpen,
  HelpCircle,
  Home,
  CheckCircle2,
  Smartphone,
  Maximize2,
  Minimize2,
  RotateCcw,
  Wifi,
  Battery,
  Signal,
  ShieldCheck,
  ExternalLink,
  UserCheck,
  Crown,
  Edit2,
  ChevronRight,
  Sparkles,
  Camera,
  LogIn,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { Dock, DockIcon, DockItem, DockLabel } from '../ui/dock';
import { cn } from '../../lib/utils';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const {
    currentUser,
    notifications,
    activeTab,
    setActiveTab,
    setSelectedSubject,
    setActiveExam,
    logout,
    siteSettings,
    updateUserProfile,
    loginWithSecretKey,
  } = useApp();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'teacher' | 'student' | 'register' | 'forgot'>('teacher');
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Digital clock for status bar
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Secret Backdoor Kepsek State
  const [isSecretAdminModalOpen, setIsSecretAdminModalOpen] = useState(false);
  const [secretPassInput, setSecretPassInput] = useState('');
  const [secretPassError, setSecretPassError] = useState('');
  const [showSecretPass, setShowSecretPass] = useState(false);
  const logoClicksRef = useRef(0);
  const lastLogoClickTimeRef = useRef(0);

  // Handle Logo Click -> Return to Home Dashboard + Secret 5-Clicks Backdoor
  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastLogoClickTimeRef.current < 900) {
      logoClicksRef.current += 1;
    } else {
      logoClicksRef.current = 1;
    }
    lastLogoClickTimeRef.current = now;

    // Secret trigger: 5 rapid clicks on logo opens the secret Kepsek portal
    if (logoClicksRef.current >= 5) {
      logoClicksRef.current = 0;
      setIsSecretAdminModalOpen(true);
      setSecretPassInput('');
      setSecretPassError('');
      return;
    }

    setActiveTab('home');
    setSelectedSubject(null);
    setActiveExam(null);
  };

  const handleSecretLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretPassInput.trim()) {
      setSecretPassError('Masukkan sandi rahasia.');
      return;
    }
    const res = loginWithSecretKey(secretPassInput);
    if (res.success) {
      setIsSecretAdminModalOpen(false);
      setSecretPassInput('');
      setSecretPassError('');
    } else {
      setSecretPassError(res.message || 'Sandi rahasia salah.');
    }
  };

  // Open Edit Profile modal
  const openEditProfile = () => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditAvatar(currentUser.avatar || '');
      setEditPhone(currentUser.phone || '');
      setIsEditProfileOpen(true);
      setIsProfileMenuOpen(false);
    }
  };

  // Handle avatar image file upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      updateUserProfile({
        name: editName,
        avatar: editAvatar,
        phone: editPhone,
      });
      setIsEditProfileOpen(false);
    }
  };

  // Dynamic Theme Gradients
  const getHeaderGradient = () => {
    switch (siteSettings.themeColor) {
      case 'emerald':
        return 'from-emerald-700 via-teal-700 to-emerald-950';
      case 'indigo':
        return 'from-indigo-800 via-blue-900 to-slate-900';
      case 'purple':
        return 'from-purple-800 via-violet-800 to-indigo-950';
      case 'rose':
        return 'from-rose-800 via-red-800 to-rose-950';
      case 'darkGold':
        return 'from-slate-950 via-zinc-900 to-slate-950';
      default:
        return 'from-blue-700 via-indigo-700 to-blue-800';
    }
  };

  return (
    <div className="h-screen h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-2 lg:p-3 font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white overflow-hidden">
      {/* Desktop Top Control Banner */}
      <header className="hidden lg:flex w-full max-w-lg items-center justify-between py-1.5 px-4 mb-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 text-white text-xs shadow-lg shrink-0">
        <button
          onClick={handleLogoClick}
          className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity text-left cursor-pointer"
        >
          <img
            src={siteSettings.logoUrl || '/Logo-07(1).png'}
            alt="Logo Sekolah"
            className="w-7 h-7 object-contain rounded-lg bg-white/10 p-0.5"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/Logo-07(1).png';
            }}
          />
          <div className="flex flex-col items-start justify-center text-left">
            <span className="font-extrabold text-xs tracking-wide text-white leading-tight uppercase">
              {siteSettings.siteName}
            </span>
            <span className="text-slate-400 text-[10px] font-medium leading-tight">
              {siteSettings.schoolName}
            </span>
          </div>
        </button>

        <div className="flex items-center space-x-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[120px]">
                {currentUser.name}
              </span>
            </div>
          ) : (
            <div className="relative">
              <button
                id="btn-desktop-login-dropdown"
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLoginDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLoginDropdownOpen && (
                <div className="absolute right-0 top-9 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Pilih Portal Masuk
                  </div>
                  <button
                    onClick={() => {
                      setAuthMode('admin');
                      setIsAuthOpen(true);
                      setIsLoginDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 text-slate-800 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                      👑
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700">Kepala Sekolah</span>
                      <span className="text-[10px] text-slate-500 block">Bapak Nishfa Rahmada</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('teacher');
                      setIsAuthOpen(true);
                      setIsLoginDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50 text-slate-800 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                      👨‍🏫
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">Dewan Guru</span>
                      <span className="text-[10px] text-slate-500 block">Modul, Bank Soal, Koreksi</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('student');
                      setIsAuthOpen(true);
                      setIsLoginDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-emerald-50 text-slate-800 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                      🎓
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Siswa / Murid</span>
                      <span className="text-[10px] text-slate-500 block">Ruang Belajar & CBT UNBK</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* SMARTPHONE FRAME CONTAINER (Maintains Mobile Version UI on all screens) */}
      <main
        id="mobile-phone-viewport"
        className="w-full h-full sm:h-[100dvh] sm:max-h-[860px] sm:max-w-[430px] bg-slate-50 flex flex-col relative overflow-hidden sm:rounded-[44px] sm:shadow-[0_25px_65px_-15px_rgba(0,0,0,0.85)] sm:border-[8px] sm:border-slate-800"
      >
        {/* Phone Top Dynamic Notch Header */}
        <div className="hidden sm:flex w-full bg-slate-900 text-white px-6 pt-3 pb-2 items-center justify-between text-xs select-none shrink-0 z-30">
          <span className="font-mono font-semibold text-[11px]">{currentTime || '08:00'}</span>

          {/* Dynamic Island Mockup */}
          <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center space-x-1.5 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/70"></div>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-300 text-[10px]">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* PRABUNET App Main Header - With interactive Logo button & Theme gradient */}
        <div className={`bg-gradient-to-r ${getHeaderGradient()} text-white px-3.5 py-2.5 flex items-center justify-between shadow-md shrink-0 z-20 transition-all duration-300`}>
          {/* Logo Click Handler -> Returns directly to Home Dashboard */}
          <button
            id="btn-header-school-logo"
            onClick={handleLogoClick}
            className="flex items-center space-x-2.5 hover:opacity-90 transition-all text-left cursor-pointer group"
            title="Kembali ke Dashboard Utama"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 p-1 backdrop-blur-xs border border-white/30 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={siteSettings.logoUrl || '/Logo-07(1).png'}
                alt="Logo SMK Purnama Bakti"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Logo-07(1).png';
                }}
              />
            </div>
            <div className="flex flex-col items-start justify-center text-left min-w-0">
              <h1 className="text-sm font-black tracking-wide text-white leading-tight uppercase">
                {siteSettings.siteName}
              </h1>
              <p className="text-[10px] text-blue-100 font-semibold tracking-normal leading-tight">
                {siteSettings.schoolName}
              </p>
            </div>
          </button>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-1.5">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-open-notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors relative cursor-pointer"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4 text-white" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Notifikasi Sistem</span>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 bg-slate-50 rounded-xl text-xs space-y-0.5 border border-slate-100">
                        <span className="font-bold text-blue-900 block">{n.title}</span>
                        <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                        <span className="text-[9px] text-slate-400 font-mono block">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar with Dropdown Menu (Profil, Edit Profil, Mapel, Logout) */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="btn-header-profile-avatar"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 p-1 pr-2.5 rounded-full border border-white/20 transition-all shadow-xs cursor-pointer"
                  title="Menu Profil"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-400 overflow-hidden shrink-0 border border-white/30">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-slate-900 m-1" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-white max-w-[65px] truncate">
                    {currentUser?.name ? currentUser.name.split(' ')[0] : 'Akun'}
                  </span>
                </button>

                {/* Interactive Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-10 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200 text-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
                    {/* Header Info */}
                    <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-amber-400 overflow-hidden shrink-0 border border-slate-200">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-slate-900 m-2" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 uppercase inline-block">
                          {currentUser.role === 'admin' ? '👑 Kepala Sekolah' : currentUser.role === 'guru' ? '👨‍🏫 Guru' : '🎓 Siswa'}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1 text-xs font-semibold">
                      <button
                        onClick={() => {
                          setActiveTab('account');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>Profil Saya</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={openEditProfile}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Edit2 className="w-4 h-4 text-emerald-600" />
                          <span>Edit Profil & Foto</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('subjects');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span>Mata Pelajaran (30 Mapel)</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('schedule');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <span>Jadwal Pelajaran</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <button
                        onClick={() => {
                          setIsChangePassOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-indigo-600" />
                          <span>Ubah Kata Sandi</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Akun (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  id="btn-mobile-login-dropdown"
                  onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition-all border border-white/20"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLoginDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLoginDropdownOpen && (
                  <div className="absolute right-0 top-10 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Pilih Portal Masuk
                    </div>
                    <button
                      onClick={() => {
                        setAuthMode('admin');
                        setIsAuthOpen(true);
                        setIsLoginDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 text-slate-800 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        👑
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700">Kepala Sekolah</span>
                        <span className="text-[10px] text-slate-500 block">Bapak Nishfa Rahmada</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('teacher');
                        setIsAuthOpen(true);
                        setIsLoginDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50 text-slate-800 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        👨‍🏫
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">Dewan Guru</span>
                        <span className="text-[10px] text-slate-500 block">Modul, Bank Soal & Nilai</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('student');
                        setIsAuthOpen(true);
                        setIsLoginDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-emerald-50 text-slate-800 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        🎓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">Siswa / Murid</span>
                        <span className="text-[10px] text-slate-500 block">Ruang Belajar & CBT UNBK</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Main Screen Content */}
        <div
          id="mobile-screen-scroll-container"
          className="flex-1 min-h-0 overflow-y-auto p-3.5 pb-28 relative scroll-smooth overscroll-contain"
        >
          {children}
        </div>

        {/* Floating Bottom Apple Style Dock Navigation Bar (Clean & Transparent - No background box) */}
        <div
          className="fixed sm:absolute bottom-0 left-0 right-0 z-50 pointer-events-none px-2 pb-2 sm:pb-3 flex justify-center"
          style={{
            paddingBottom: 'max(0.45rem, calc(env(safe-area-inset-bottom, 0px) + 0.3rem))',
          }}
        >
          <div className="pointer-events-auto flex justify-center items-end">
            <Dock
              className="gap-2 sm:gap-2.5 pb-1"
              baseSize={46}
              magnification={64}
              distance={95}
            >
              {[
                {
                  id: 'home' as const,
                  title: 'Beranda',
                  icon: Home,
                  activeGradient: 'from-blue-600 to-indigo-600 text-white shadow-blue-500/40',
                  badge: null,
                },
                {
                  id: 'schedule' as const,
                  title: 'Jadwal Pelajaran',
                  icon: Calendar,
                  activeGradient: 'from-indigo-600 to-violet-600 text-white shadow-indigo-500/40',
                  badge: null,
                },
                {
                  id: 'subjects' as const,
                  title: 'Mata Pelajaran',
                  icon: BookOpen,
                  activeGradient: 'from-teal-600 to-emerald-600 text-white shadow-teal-500/40',
                  badge: null,
                },
                {
                  id: 'cbt' as const,
                  title: 'Portal CBT',
                  icon: HelpCircle,
                  activeGradient: 'from-amber-500 to-orange-600 text-white shadow-orange-500/40',
                  badge: 'CBT',
                },
                {
                  id: 'account' as const,
                  title: currentUser?.role === 'admin' ? 'Ruang KepSek' : (currentUser ? 'Profil Akun' : 'Masuk Akun'),
                  icon: currentUser?.role === 'admin' ? Crown : User,
                  activeGradient: currentUser?.role === 'admin' ? 'from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black shadow-amber-500/40' : 'from-blue-600 to-indigo-600 text-white shadow-blue-500/40',
                  badge: null,
                },
              ].map((item) => {
                const isActive = activeTab === item.id;
                const IconComponent = item.icon;
                return (
                  <DockItem
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSelectedSubject(null);
                      setActiveExam(null);
                    }}
                    className={cn(
                      'rounded-2xl relative group flex items-center justify-center cursor-pointer transition-shadow duration-150',
                      isActive
                        ? `bg-gradient-to-tr ${item.activeGradient} shadow-lg ring-2 ring-white/90 dark:ring-slate-700`
                        : 'bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/80 shadow-[0_6px_18px_rgba(15,23,42,0.14)] backdrop-blur-md dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700'
                    )}
                  >
                    <DockLabel>{item.title}</DockLabel>
                    <DockIcon className="h-full w-full flex items-center justify-center">
                      <IconComponent
                        className={cn(
                          'w-5 h-5 transition-colors',
                          isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                        )}
                      />
                    </DockIcon>
                    {isActive && (
                      <span className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-xs" />
                    )}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-rose-500 text-white font-extrabold text-[8px] rounded-full animate-pulse shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </DockItem>
                );
              })}
            </Dock>
          </div>
        </div>

        {/* Smartphone Bottom Home Gesture Indicator (Desktop Mockup Only) */}
        <div className="hidden sm:flex w-full bg-slate-900 py-1 items-center justify-center shrink-0 z-30">
          <div className="w-24 h-1 bg-slate-600 rounded-full"></div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Edit2 className="w-4 h-4" />
                <span>Edit Profil Saya</span>
              </h4>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-white/80 hover:text-white font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 space-y-3.5 text-xs">
              {/* Photo preview & upload */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-300 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                  {editAvatar ? (
                    <img src={editAvatar} alt="Pratinjau Foto" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block text-xs">Foto Profil</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Ganti Foto</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Foto (Opsional):</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / HP:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Backdoor Kepsek Modal (Unlocked by 5 clicks on PRABUNET logo) */}
      {isSecretAdminModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-white relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white tracking-wide uppercase">Pintu Rahasia Kepala Sekolah</h3>
                  <p className="text-[10px] text-amber-300/80">Ruang Kontrol Utama • SMK Purnama Bakti</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSecretAdminModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSecretLogin} className="space-y-3.5">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Masukkan sandi rahasia Kepala Sekolah untuk membuka akses penuh Ruang Kontrol Utama secara tersembunyi.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Sandi Rahasia Kepala Sekolah:
                </label>
                <div className="relative">
                  <input
                    type={showSecretPass ? 'text' : 'password'}
                    value={secretPassInput}
                    onChange={(e) => setSecretPassInput(e.target.value)}
                    placeholder="Masukkan sandi rahasia..."
                    autoFocus
                    className="w-full text-xs bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 pr-10 text-white font-mono focus:ring-2 focus:ring-amber-500/40 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretPass(!showSecretPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showSecretPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {secretPassError && (
                  <p className="text-[11px] text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{secretPassError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSecretAdminModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Buka Akses</span>
                </button>
              </div>

              <div className="text-center pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500">
                  Tip: Sandi bawaan adalah <strong className="text-amber-400 font-mono">@Purnama165</strong> (bisa diubah di Pengaturan Admin)
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals for Auth & Password */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
      />
    </div>
  );
};
