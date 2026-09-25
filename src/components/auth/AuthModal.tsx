import React, { useState, useEffect } from 'react';
import { useApp, ADMIN_CREDENTIALS } from '../../context/AppContext';
import { registerPendaftarToFirestore } from '../../services/firestoreService';
import {
  GraduationCap,
  LogIn,
  UserCheck,
  UserPlus,
  KeyRound,
  Mail,
  Lock,
  ChevronDown,
  Info,
  CheckCircle2,
  BookOpen,
  User,
  ShieldCheck,
  Crown,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'admin' | 'teacher' | 'student' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'teacher',
}) => {
  const {
    teachers,
    loginAsAdmin,
    loginAsTeacher,
    loginAsStudent,
    registerStudent,
    requestPasswordReset,
    resetPasswordWithToken,
    siteSettings,
  } = useApp();

  const [mode, setMode] = useState<'admin' | 'teacher' | 'student' | 'register' | 'forgot' | 'resetConfirm'>(initialMode);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Admin Form State (Nishfa Rahmada, S.Kom., MM, Gr / @Purnama165)
  const [adminEmail, setAdminEmail] = useState(ADMIN_CREDENTIALS.email);
  const [adminPassword, setAdminPassword] = useState(ADMIN_CREDENTIALS.password);

  // Teacher Form State
  const [teacherEmail, setTeacherEmail] = useState(teachers[0]?.email || '');
  const [teacherPassword, setTeacherPassword] = useState('SMKPBMAJU');

  // Student Login Form State
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Student Register State
  const [regName, setRegName] = useState('');
  const [regNisn, setRegNisn] = useState('');
  const [regAsalSekolah, setRegAsalSekolah] = useState('');
  const [regJurusan, setRegJurusan] = useState<'DKV' | 'TKJ' | 'TBSM'>('DKV');
  const [regKelas, setRegKelas] = useState<'X' | 'XI' | 'XII'>('X');
  const [regRombel, setRegRombel] = useState('X DKV 1');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = loginAsAdmin(adminEmail, adminPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = loginAsTeacher(teacherEmail, teacherPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = loginAsStudent(studentEmail, studentPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => onClose(), 600);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = registerStudent({
      name: regName,
      nisn: regNisn || '0078129901',
      jurusan: regJurusan,
      kelas: regKelas,
      rombel: regRombel || `${regKelas} ${regJurusan} 1`,
      email: regEmail,
      password: regPass,
    });
    if (res.success) {
      // Record to Firestore collection 'pendaftar'
      registerPendaftarToFirestore({
        nama: regName.trim(),
        nisn: regNisn.trim() || regEmail.split('@')[0],
        asalSekolah: regAsalSekolah.trim() || 'SMP / MTs Pendaftar',
        jurusan: regJurusan,
        email: regEmail.trim(),
      }).catch((err) => {
        console.warn('Firestore pendaftar save note:', err);
      });

      setSuccessMessage(res.message);
      setStudentEmail(regEmail);
      setRegPass('');
      // Switch back to login view after a moment so they can see the notification
      setTimeout(() => {
        setMode('student');
      }, 3500);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = requestPasswordReset(forgotEmail);
    if (res.success) {
      setSuccessMessage(res.message);
      if (res.simulatedToken) {
        setResetToken(res.simulatedToken);
        setMode('resetConfirm');
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleResetConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const res = resetPasswordWithToken(forgotEmail, resetToken, newPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setMode('teacher');
      }, 1200);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div id="auth-modal-card" className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-4 sm:p-5 text-white relative">
          <div className="flex items-center space-x-3">
            <img
              src={siteSettings.logoUrl || '/Logo-07(1).png'}
              alt="Logo SMK Purnama Bakti"
              className="w-10 h-10 object-contain rounded-xl bg-white/20 p-1 backdrop-blur-xs border border-white/30"
            />
            <div className="flex flex-col items-start justify-center text-left">
              <h2 className="text-base sm:text-lg font-extrabold tracking-wide leading-tight">{siteSettings.siteName}</h2>
              <p className="text-xs text-blue-100 font-medium leading-tight">{siteSettings.schoolName} • Portal Resmi</p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Separate Top Role Selection Buttons */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              id="btn-switch-to-admin-auth"
              type="button"
              onClick={() => {
                setMode('admin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-1 rounded-xl transition-all text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 border ${
                mode === 'admin'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-700" />
              <span>👑 KepSek</span>
            </button>

            <button
              id="btn-switch-to-teacher-auth"
              type="button"
              onClick={() => {
                setMode('teacher');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-1 rounded-xl transition-all text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 border ${
                mode === 'teacher'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>👨‍🏫 Dewan Guru</span>
            </button>

            <button
              id="btn-switch-to-student-auth"
              type="button"
              onClick={() => {
                setMode('student');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 px-1 rounded-xl transition-all text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 border ${
                mode === 'student' || mode === 'register'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>🎓 Murid</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* DEDICATED KEPALA SEKOLAH / ADMIN LOGIN */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-xs text-amber-950 leading-relaxed space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 border-2 border-amber-400 shrink-0 shadow-xs">
                    <img
                      src={ADMIN_CREDENTIALS.avatar}
                      alt="Bapak Kepala Sekolah"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-950 block text-xs">
                      👑 {ADMIN_CREDENTIALS.name}
                    </span>
                    <span className="text-[11px] text-amber-800 font-medium">{ADMIN_CREDENTIALS.title}</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-900 border-t border-amber-200/60 pt-1.5 leading-snug">
                  Ruang Kontrol Kepala Sekolah: Manajemen konfigurasi situs, dewan guru, jadwal pelajaran, dan rekapitulasi akademik.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Resmi Kepala Sekolah:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="nishfa_rahmada@smkpurnamabakti.sch.id"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Khusus:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="@Purnama165"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Ruang Kontrol Kepala Sekolah</span>
              </button>
            </form>
          )}

          {/* DEDICATED TEACHER LOGIN */}
          {mode === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-3.5">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-900 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-blue-950">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Akses Khusus Dewan Guru SMK Purnama Bakti</span>
                </p>
                <p className="text-[11px] text-blue-800">
                  Masuk menggunakan email guru resmi. Kata sandi default awal adalah{' '}
                  <strong className="font-mono bg-blue-200/70 px-1 py-0.5 rounded text-blue-900 font-bold">
                    SMKPBMAJU
                  </strong>
                  . Setelah login Anda dapat mengubah kata sandi di menu Akun.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih / Ketik Email Guru Terdaftar:
                </label>
                <div className="relative">
                  <select
                    id="teacher-email-select"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 pr-8 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {teachers.map((t) => (
                      <option key={t.email} value={t.email}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                {/* Selected teacher subjects info */}
                {(() => {
                  const curr = teachers.find((t) => t.email === teacherEmail);
                  if (!curr) return null;
                  return (
                    <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700">Mata Pelajaran: </span>
                      {curr.subjects.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-white px-2 py-0.5 rounded-md border border-slate-200 mr-1 mt-1 text-[10px] font-semibold text-blue-700"
                        >
                          {s.name} ({s.classes})
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Kata Sandi Guru:</label>
                  <button
                    id="btn-teacher-forgot-password"
                    type="button"
                    onClick={() => {
                      setForgotEmail(teacherEmail);
                      setMode('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="teacher-password-input"
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Masukkan kata sandi guru"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                id="btn-submit-teacher-login"
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Portal Dewan Guru</span>
              </button>
            </form>
          )}

          {/* DEDICATED STUDENT LOGIN */}
          {mode === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-900 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Ruang Belajar Siswa SMK Purnama Bakti</span>
                </p>
                <p className="text-[11px] text-emerald-800">
                  Masuk menggunakan Email Siswa atau daftarkan akun baru jika belum memiliki akun.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email / ID Siswa:</label>
                <input
                  id="student-email-input"
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="Contoh: siswa@siswa.smkpurnamabakti.sch.id"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Kata Sandi Siswa:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(studentEmail);
                      setMode('forgot');
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="student-password-input"
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun siswa"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                id="btn-submit-student-login"
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Ruang Belajar Siswa</span>
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  Belum punya akun siswa?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Daftar Siswa Baru Sekarang
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* STUDENT REGISTRATION */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Pendaftaran Siswa Baru PRABUNET</span>
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Setelah mendaftar, akun siswa akan diverifikasi dan disetujui (approval) oleh <strong>Admin / Bapak Kepala Sekolah (Bapak Nishfa Rahmada)</strong> sebelum dapat masuk dan mengakses pembelajaran.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa:</label>
                <input
                  id="reg-student-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizki Pratama"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN / NIS Siswa:</label>
                  <input
                    type="text"
                    value={regNisn}
                    onChange={(e) => setRegNisn(e.target.value)}
                    placeholder="Contoh: 0078129901"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asal Sekolah (SMP/MTs):</label>
                  <input
                    type="text"
                    value={regAsalSekolah}
                    onChange={(e) => setRegAsalSekolah(e.target.value)}
                    placeholder="Contoh: SMP Negeri 1"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenjang Kelas:</label>
                  <select
                    id="reg-student-kelas"
                    value={regKelas}
                    onChange={(e) => {
                      const newK = e.target.value as 'X' | 'XI' | 'XII';
                      setRegKelas(newK);
                      setRegRombel(`${newK} ${regJurusan} 1`);
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="X">Kelas X (Sepuluh)</option>
                    <option value="XI">Kelas XI (Sebelas)</option>
                    <option value="XII">Kelas XII (Duabelas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rombel / Kelas:</label>
                  <input
                    id="reg-student-rombel"
                    type="text"
                    value={regRombel}
                    onChange={(e) => setRegRombel(e.target.value)}
                    placeholder="Contoh: X DKV 1"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kompetensi Keahlian (Jurusan):</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['DKV', 'TKJ', 'TBSM'] as const).map((jur) => (
                    <button
                      key={jur}
                      type="button"
                      onClick={() => {
                        setRegJurusan(jur);
                        setRegRombel(`${regKelas} ${jur} 1`);
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        regJurusan === jur
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {jur}
                      <span className="block text-[9px] font-normal opacity-90">
                        {jur === 'DKV' ? 'Desain Komunikasi' : jur === 'TKJ' ? 'Teknik Komputer' : 'Sepeda Motor'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Siswa:</label>
                <input
                  id="reg-student-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama.siswa@siswa.smkpurnamabakti.sch.id"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Baru:</label>
                <input
                  id="reg-student-password"
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="Minimal 5 karakter"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <button
                id="btn-submit-student-register"
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun Siswa Sekarang</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('student')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Sudah punya akun? Kembali ke Login Siswa
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>Fitur Lupa Sandi Resmi SMK Purnama Bakti</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  Masukkan email akun Anda. Sistem PRABUNET akan memverifikasi dan mengirimkan instruksi kode pemulihan sandi ke email Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email Terdaftar:</label>
                <input
                  id="forgot-email-input"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Contoh: guru@smkpurnamabakti.sch.id atau siswa@..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  required
                />
              </div>

              <button
                id="btn-send-reset-code"
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Kirim Kode Reset Sandi ke Email</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('teacher')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD CONFIRM WITH TOKEN */}
          {mode === 'resetConfirm' && (
            <form onSubmit={handleResetConfirmSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900">
                <p className="font-bold mb-1">Verifikasi Reset Kata Sandi</p>
                <p className="text-[11px] text-blue-800">
                  Masukkan 6-digit kode verifikasi yang telah dikirim ke email <strong>{forgotEmail}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Verifikasi Email:</label>
                <input
                  id="reset-token-input"
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="6 Digit Kode (misal: 482910)"
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-mono tracking-widest text-center focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Baru:</label>
                <input
                  id="reset-new-pass-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru (minimal 5 karakter)"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <button
                id="btn-confirm-reset-pass"
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Kata Sandi Baru</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
