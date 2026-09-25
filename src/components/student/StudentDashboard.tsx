import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import {
  BookOpen,
  HelpCircle,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  Layers,
  Award,
  Megaphone,
  Radio,
  Palette,
  Laptop,
  Wrench,
  BookMarked,
  Filter,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Compass,
  LogIn,
  Shield,
  Crown,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

interface StudentDashboardProps {
  onSelectSubject: (subject: Subject) => void;
  onGoToCbt: () => void;
  onGoToSchedule: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectSubject,
  onGoToCbt,
  onGoToSchedule,
}) => {
  const { currentUser, subjects, exams, broadcasts } = useApp();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'teacher' | 'student' | 'register'>('student');

  const isStudent = currentUser?.role === 'murid';

  // Access validation helper
  const getSubjectAccess = (sbj: Subject) => {
    if (!isStudent || !currentUser) {
      return { isLocked: false, reason: '', detail: '' };
    }
    const studentKelas = currentUser.kelas;
    const studentJurusan = currentUser.jurusan;

    // 1. Grade/Jenjang check
    if (studentKelas && sbj.jenjang !== 'SEMUA' && sbj.jenjang !== studentKelas) {
      return {
        isLocked: true,
        reason: `Khusus Kelas ${sbj.jenjang}`,
        detail: `Anda Kelas ${studentKelas}`,
      };
    }

    // 2. Department/Jurusan check (Productive/Kejuruan subjects)
    const isProduktif = sbj.category === 'Kejuruan' || (sbj.jurusan !== 'SEMUA' && sbj.jurusan !== undefined);
    if (isProduktif && studentJurusan && sbj.jurusan !== 'SEMUA' && sbj.jurusan !== studentJurusan) {
      return {
        isLocked: true,
        reason: `Khusus ${sbj.jurusan}`,
        detail: `Anda Jurusan ${studentJurusan}`,
      };
    }

    return { isLocked: false, reason: '', detail: '' };
  };

  const [viewScope, setViewScope] = useState<'my_subjects' | 'all_catalog'>(
    isStudent ? 'my_subjects' : 'all_catalog'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState<'Semua' | 'X' | 'XI' | 'XII'>('Semua');
  const [selectedJurusanFilter, setSelectedJurusanFilter] = useState<'Semua' | 'DKV' | 'TKJ' | 'TBSM' | 'Umum'>('Semua');

  // If user is not logged in, show locked screen
  if (!currentUser) {
    return (
      <div id="student-dashboard-locked-view" className="space-y-4 pb-20 animate-in fade-in">
        {/* School Branding Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white text-center shadow-xl border border-indigo-900/50 relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-3.5 shadow-inner">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold backdrop-blur-xs text-blue-200 mb-2 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SMK Purnama Bakti • International Global Gateway School</span>
          </div>

          <h2 className="text-lg font-black text-white tracking-tight mb-2">
            Akses Mata Pelajaran & Modul Terkunci
          </h2>

          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed mb-6">
            Seluruh materi pembelajaran, modul 30 pertemuan, panduan praktikum, dan Lembar Kerja Peserta Didik (LKPD) hanya dapat diakses oleh Siswa dan Guru SMK Purnama Bakti yang telah masuk (login).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-sm mx-auto">
            <button
              onClick={() => {
                setAuthMode('student');
                setIsAuthOpen(true);
              }}
              className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Sebagai Siswa</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('teacher');
                setIsAuthOpen(true);
              }}
              className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Shield className="w-4 h-4 text-indigo-300" />
              <span>Masuk Sebagai Guru</span>
            </button>
          </div>

          <div className="mt-3 max-w-sm mx-auto">
            <button
              onClick={() => {
                setAuthMode('admin');
                setIsAuthOpen(true);
              }}
              className="w-full py-2.5 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Portal Kepala Sekolah</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <span>Belum memiliki akun siswa?</span>
            <button
              onClick={() => {
                setAuthMode('register');
                setIsAuthOpen(true);
              }}
              className="text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Daftar Siswa Baru
            </button>
          </div>
        </div>

        {/* Informative Preview of Jurusan Categories (Read-Only Hint) */}
        <div className="p-4 bg-slate-100 rounded-3xl border border-slate-200 text-center space-y-1.5">
          <BookOpen className="w-6 h-6 text-slate-400 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">Modul Terstruktur SMK Purnama Bakti</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            Tersedia 30 pertemuan materi ajar, video referensi, kuis interaktif, dan LKPD untuk seluruh jenjang Kelas X, XI, XII.
          </p>
        </div>

        {/* Auth Modal Popup */}
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
        />
      </div>
    );
  }

  // Relevant broadcasts for this student
  const relevantBroadcasts = broadcasts.filter(
    (bc) => bc.target === 'SEMUA' || (currentUser?.jurusan && bc.target === currentUser.jurusan)
  );

  // Department metadata for big visual boxes
  const jurusanCards = [
    {
      id: 'Semua',
      name: 'Semua Jurusan',
      sub: 'Seluruh Mapel & Kejuruan',
      icon: Layers,
      color: 'from-blue-600 to-indigo-600',
      activeBorder: 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50',
      count: subjects.length,
    },
    {
      id: 'DKV',
      name: 'DKV',
      fullName: 'Desain Komunikasi Visual',
      sub: 'Grafis, Ilustrasi, Video & Animasi',
      icon: Palette,
      color: 'from-purple-600 to-pink-600',
      activeBorder: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/50',
      count: subjects.filter((s) => s.jurusan === 'DKV').length,
    },
    {
      id: 'TKJ',
      name: 'TKJ',
      fullName: 'Teknik Komputer & Jaringan',
      sub: 'Server, Cisco, Mikrotik & Cyber',
      icon: Laptop,
      color: 'from-sky-600 to-cyan-600',
      activeBorder: 'border-sky-600 ring-2 ring-sky-500/20 bg-sky-50/50',
      count: subjects.filter((s) => s.jurusan === 'TKJ').length,
    },
    {
      id: 'TBSM',
      name: 'TBSM',
      fullName: 'Teknik Sepeda Motor',
      sub: 'Otomotif, Mesin & Kelistrikan Motor',
      icon: Wrench,
      color: 'from-amber-600 to-orange-600',
      activeBorder: 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/50',
      count: subjects.filter((s) => s.jurusan === 'TBSM').length,
    },
    {
      id: 'Umum',
      name: 'Mapel Umum',
      fullName: 'Muatan Nasional & Umum',
      sub: 'Agama, PPKn, Bahasa & Matematika',
      icon: BookMarked,
      color: 'from-emerald-600 to-teal-600',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50',
      count: subjects.filter((s) => s.category === 'Umum' || s.jurusan === 'SEMUA').length,
    },
  ];

  // Filter subjects
  const filteredSubjects = subjects.filter((s) => {
    // If student selected "Mapel Saya" scope, only show subjects matching their class & major
    if (viewScope === 'my_subjects' && isStudent) {
      const access = getSubjectAccess(s);
      if (access.isLocked) return false;
    }

    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesJenjang =
      selectedJenjangFilter === 'Semua' || s.jenjang === selectedJenjangFilter || s.jenjang === 'SEMUA';

    const matchesJurusan =
      selectedJurusanFilter === 'Semua' ||
      (selectedJurusanFilter === 'Umum'
        ? s.category === 'Umum' || s.jurusan === 'SEMUA'
        : s.jurusan === selectedJurusanFilter || s.jurusan === 'SEMUA');

    return matchesSearch && matchesJenjang && matchesJurusan;
  });

  const myAccessibleCount = subjects.filter((s) => !getSubjectAccess(s).isLocked).length;

  return (
    <div id="student-dashboard-view" className="space-y-4 pb-20">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-2 -bottom-2 opacity-10 pointer-events-none">
          <GraduationCap className="w-36 h-36" />
        </div>
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>International Global Gateway School</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              {currentUser?.name || 'Siswa SMK Purnama Bakti'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-mono">
              {currentUser?.email || 'siswa@siswa.smkpurnamabakti.sch.id'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2.5 py-1 bg-blue-500/40 border border-white/20 rounded-lg text-xs font-extrabold tracking-wide">
                Kelas: {currentUser?.kelas ? `Kelas ${currentUser.kelas}` : 'Kelas X'} ({currentUser?.rombel || 'X DKV 1'})
              </span>
              <span className="px-2.5 py-1 bg-indigo-500/40 border border-white/20 rounded-lg text-xs font-extrabold">
                Jurusan: {currentUser?.jurusan || 'DKV'}
              </span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-white" />
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Announcements Section */}
      {relevantBroadcasts.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-indigo-600 animate-bounce" />
              <span>Siaran Pengumuman Resmi ({relevantBroadcasts.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Dari Guru & Admin</span>
          </div>

          <div className="space-y-2">
            {relevantBroadcasts.map((bc) => (
              <div
                key={bc.id}
                className={`p-4 rounded-3xl border shadow-xs flex flex-col gap-2 transition-all ${
                  bc.priority === 'urgent'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950 ring-1 ring-rose-400/30'
                    : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        bc.priority === 'urgent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-indigo-600 text-white shadow-xs'
                      }`}
                    >
                      {bc.priority === 'urgent' ? '🔴 MENDESAK' : '📢 INFORMASI'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                      {bc.target === 'SEMUA' ? 'Semua Jurusan' : `Khusus ${bc.target}`}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(bc.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{bc.title}</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white/60 p-2.5 rounded-2xl border border-white/80">
                  {bc.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="font-semibold text-slate-600">Pengirim: {bc.senderName}</span>
                  <span className="font-medium text-indigo-700">SMK Purnama Bakti</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid (CBT & Schedule) */}
      <div className="grid grid-cols-2 gap-3">
        {/* CBT UNBK Quick Link */}
        <button
          onClick={onGoToCbt}
          className="p-4 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
              Ujian CBT
            </span>
            <HelpCircle className="w-5 h-5 text-white/90" />
          </div>
          <div className="mt-3.5">
            <h4 className="text-sm sm:text-base font-black leading-tight">CBT UNBK Simulator</h4>
            <p className="text-xs text-amber-100 mt-1">Ujian STS & SAS Anti-Curang</p>
          </div>
        </button>

        {/* Schedule Quick Link */}
        <button
          onClick={onGoToSchedule}
          className="p-4 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white rounded-3xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
              Jadwal Siswa
            </span>
            <Calendar className="w-5 h-5 text-white/90" />
          </div>
          <div className="mt-3.5">
            <h4 className="text-sm sm:text-base font-black leading-tight">Kalender Pelajaran</h4>
            <p className="text-xs text-indigo-100 mt-1">Jadwal Harian & Google Sync</p>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* KOTAK PILIHAN JURUSAN & MAPEL UMUM (SPACIOUS & ELEGANT BENTO CARDS) */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Pilihan Jurusan & Mapel Umum
              </h3>
              <p className="text-xs text-slate-500">
                Pilih kategori untuk memfilter modul materi ajar & LKPD
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
            {filteredSubjects.length} Mapel
          </span>
        </div>

        {/* Big Beautiful Department Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {jurusanCards.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedJurusanFilter === card.id;

            return (
              <button
                key={card.id}
                onClick={() => setSelectedJurusanFilter(card.id as any)}
                className={`p-3.5 sm:p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? `${card.activeBorder} shadow-md`
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                } ${card.id === 'Semua' ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {card.count} Mapel
                  </span>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {card.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {card.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Access Scope Switcher for Logged in Students */}
        {isStudent && (
          <div className="p-1.5 bg-slate-100 rounded-2xl border border-slate-200 grid grid-cols-2 gap-1.5 text-xs font-bold">
            <button
              onClick={() => setViewScope('my_subjects')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewScope === 'my_subjects'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Mapel Saya ({myAccessibleCount})</span>
            </button>
            <button
              onClick={() => setViewScope('all_catalog')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                viewScope === 'all_catalog'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Semua Mapel ({subjects.length})</span>
            </button>
          </div>
        )}

        {/* Search Bar & Jenjang Filter */}
        <div className="space-y-2 pt-1">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mata pelajaran, kode modul, atau nama guru..."
              className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Jenjang Filter Buttons (Kelas X, XI, XII, Semua) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 pl-2 shrink-0">Jenjang:</span>
            <div className="grid grid-cols-4 gap-1 w-full font-bold">
              {(['Semua', 'X', 'XI', 'XII'] as const).map((jen) => (
                <button
                  key={jen}
                  onClick={() => setSelectedJenjangFilter(jen)}
                  className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer ${
                    selectedJenjangFilter === jen
                      ? 'bg-white text-indigo-700 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {jen === 'Semua' ? 'Semua Kelas' : `Kelas ${jen}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBJECT CARDS LIST (HIGH LEGIBILITY & ACCESS CONTROL INDICATORS) */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>
              {viewScope === 'my_subjects' && isStudent
                ? `Mata Pelajaran Kelas ${currentUser?.kelas || 'X'} ${currentUser?.jurusan || 'DKV'} (${filteredSubjects.length})`
                : `Daftar Mata Pelajaran (${filteredSubjects.length})`}
            </span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">Klik untuk 30 Modul & LKPD</span>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <h5 className="text-sm font-bold text-slate-700">Tidak ada mata pelajaran yang cocok</h5>
            <p className="text-xs text-slate-400">
              {viewScope === 'my_subjects'
                ? 'Tidak ada mata pelajaran yang terdaftar pada filter ini. Coba pilih Semua Mapel.'
                : 'Coba ubah kata kunci pencarian atau ganti filter jurusan di atas.'}
            </p>
          </div>
        ) : (
          filteredSubjects.map((sbj) => {
            const access = getSubjectAccess(sbj);

            return (
              <div
                key={sbj.id}
                onClick={() => onSelectSubject(sbj)}
                className={`p-4 rounded-3xl border transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col gap-3 relative overflow-hidden group ${
                  access.isLocked
                    ? 'bg-slate-50/90 border-slate-300 opacity-85 hover:border-rose-300'
                    : 'bg-white border-slate-200 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${sbj.color} text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-base group-hover:scale-105 transition-transform relative`}
                    >
                      {sbj.jurusan === 'DKV' ? '🎨' : sbj.jurusan === 'TKJ' ? '💻' : sbj.jurusan === 'TBSM' ? '🏍️' : '📚'}
                      {access.isLocked && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold font-mono border border-blue-100">
                          {sbj.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                          Kelas {sbj.jenjang}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {sbj.jurusan === 'SEMUA' ? 'Umum' : sbj.jurusan}
                        </span>
                        {access.isLocked && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-extrabold flex items-center gap-1 border border-rose-200">
                            <Lock className="w-3 h-3" />
                            <span>{access.reason}</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                        {sbj.name}
                      </h4>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {sbj.description}
                </p>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[180px] sm:max-w-none">{sbj.teacherName}</span>
                  </span>
                  <span
                    className={`font-extrabold px-2.5 py-1 rounded-xl border shrink-0 ${
                      access.isLocked
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'text-indigo-700 bg-indigo-50 border-indigo-100'
                    }`}
                  >
                    {access.isLocked ? 'Akses Terkunci' : '30 Pertemuan & LKPD'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
