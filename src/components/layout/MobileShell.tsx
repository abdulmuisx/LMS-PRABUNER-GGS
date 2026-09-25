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
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

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

  // Handle Logo Click -> Return to Home Dashboard
  const handleLogoClick = () => {
    setActiveTab('home');
    setSelectedSubject(null);
    setActiveExam(null);
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
          <div>
            <span className="font-bold text-xs tracking-tight block">
              {siteSettings.siteName}
            </span>
            <span className="text-slate-400 block text-[10px]">
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
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold tracking-tight">{siteSettings.siteName}</h1>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-bold uppercase">
                  SMK PB
                </span>
              </div>
              <p className="text-[10px] text-blue-100 font-medium">{siteSettings.schoolName}</p>
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

        {/* Floating Bottom Mobile Navigation Island Bar - Always on top & elevated above mobile address bar */}
        <div
          className="fixed sm:absolute bottom-0 left-0 right-0 z-50 pointer-events-none px-2.5 pb-2 sm:pb-3 flex justify-center"
          style={{
            paddingBottom: 'max(0.5rem, calc(env(safe-area-inset-bottom, 0px) + 0.35rem))',
          }}
        >
          <nav
            aria-label="Navigasi Utama Melayang"
            className="pointer-events-auto w-full max-w-[410px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl px-1.5 py-1.5 flex items-center justify-around text-[10px] font-bold text-slate-500 shadow-[0_12px_32px_rgba(15,23,42,0.18),0_2px_8px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
          >
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-1.5 px-2.5 sm:px-3 rounded-xl transition-all duration-200 ${
                activeTab === 'home'
                  ? 'text-blue-600 bg-blue-50/90 font-bold scale-105 shadow-xs'
                  : 'hover:text-slate-800'
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span>Beranda</span>
            </button>

            <button
              id="nav-tab-schedule"
              onClick={() => setActiveTab('schedule')}
              className={`flex flex-col items-center py-1.5 px-2.5 sm:px-3 rounded-xl transition-all duration-200 ${
                activeTab === 'schedule'
                  ? 'text-blue-600 bg-blue-50/90 font-bold scale-105 shadow-xs'
                  : 'hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4 mb-0.5" />
              <span>Jadwal</span>
            </button>

            <button
              id="nav-tab-subjects"
              onClick={() => setActiveTab('subjects')}
              className={`flex flex-col items-center py-1.5 px-2.5 sm:px-3 rounded-xl transition-all duration-200 ${
                activeTab === 'subjects'
                  ? 'text-blue-600 bg-blue-50/90 font-bold scale-105 shadow-xs'
                  : 'hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-0.5" />
              <span>Mapel</span>
            </button>

            <button
              id="nav-tab-cbt"
              onClick={() => setActiveTab('cbt')}
              className={`flex flex-col items-center py-1.5 px-2.5 sm:px-3 rounded-xl transition-all duration-200 ${
                activeTab === 'cbt'
                  ? 'text-blue-600 bg-blue-50/90 font-bold scale-105 shadow-xs'
                  : 'hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 mb-0.5" />
              <span>CBT PB</span>
            </button>

            <button
              id="nav-tab-account"
              onClick={() => setActiveTab('account')}
              className={`flex flex-col items-center py-1.5 px-2.5 sm:px-3 rounded-xl transition-all duration-200 ${
                activeTab === 'account'
                  ? 'text-blue-600 bg-blue-50/90 font-bold scale-105 shadow-xs'
                  : 'hover:text-slate-800'
              }`}
            >
              {currentUser?.role === 'admin' ? (
                <>
                  <Crown className="w-4 h-4 mb-0.5 text-amber-600" />
                  <span className="text-amber-700">KepSek</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mb-0.5" />
                  <span>Akun</span>
                </>
              )}
            </button>
          </nav>
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
