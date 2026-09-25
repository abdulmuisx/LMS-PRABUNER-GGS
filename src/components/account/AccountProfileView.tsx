import React, { useState, useRef } from 'react';
import { useApp, ADMIN_CREDENTIALS } from '../../context/AppContext';
import {
  User,
  KeyRound,
  LogOut,
  GraduationCap,
  Briefcase,
  Mail,
  Shield,
  RotateCcw,
  CheckCircle2,
  Lock,
  ChevronRight,
  BookOpen,
  Award,
  Camera,
  Upload,
  Image as ImageIcon,
  Edit2,
  Sparkles,
  Crown,
} from 'lucide-react';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { AuthModal } from '../auth/AuthModal';
import { AdminDashboard } from '../admin/AdminDashboard';

export const AccountProfileView: React.FC = () => {
  const {
    currentUser,
    logout,
    updateUserProfile,
    resetAllData,
  } = useApp();

  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'teacher' | 'student' | 'register' | 'forgot'>('teacher');

  // Photo Update State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser?.avatar || '');
  const [photoSavedToast, setPhotoSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset Avatars for teachers/students
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&fit=crop&crop=faces',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    if (avatarPreview) {
      updateUserProfile({ avatar: avatarPreview });
      setShowPhotoModal(false);
      setPhotoSavedToast(true);
      setTimeout(() => setPhotoSavedToast(false), 3000);
    }
  };

  // If the logged in user is the Headmaster / Super Admin, render the full Admin Dashboard!
  if (currentUser?.role === 'admin') {
    return (
      <div className="space-y-4 pb-20">
        <AdminDashboard />
        <ChangePasswordModal isOpen={isChangePassOpen} onClose={() => setIsChangePassOpen(false)} />
      </div>
    );
  }

  return (
    <div id="account-profile-view" className="space-y-3.5 pb-20">
      {photoSavedToast && (
        <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in zoom-in-95">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Foto profil berhasil diperbarui & disimpan!</span>
          </span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-4 text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="flex items-center space-x-3 relative z-10">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/40 border-2 border-blue-400/50 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <User className="w-8 h-8 text-blue-200" />
              )}
            </div>

            {/* Quick Change Photo Button on Avatar */}
            {currentUser && (
              <button
                id="btn-edit-avatar-quick"
                onClick={() => {
                  setAvatarPreview(currentUser.avatar || '');
                  setShowPhotoModal(true);
                }}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full shadow-md border-2 border-slate-900 transition-transform active:scale-95 cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase border border-blue-400/20">
                {currentUser?.role === 'guru' ? 'DEWAN GURU' : 'SISWA PB'}
              </span>
              {currentUser?.jurusan && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 text-[10px] font-bold border border-indigo-400/20">
                  {currentUser.jurusan}
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-bold truncate leading-snug">
              {currentUser?.name || 'Pengguna PRABUNET'}
            </h2>
            <p className="text-xs text-slate-300 truncate mt-0.5 font-mono">{currentUser?.email || 'Belum masuk'}</p>

            {currentUser && (
              <button
                onClick={() => {
                  setAvatarPreview(currentUser.avatar || '');
                  setShowPhotoModal(true);
                }}
                className="mt-1.5 text-[10px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md border border-white/15 w-fit cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                <span>Ubah Foto Profil Guru</span>
              </button>
            )}
          </div>
        </div>

        {/* Real User Academic Info (Without NIP / NISN) */}
        {currentUser && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-medium">
                {currentUser?.role === 'guru' ? 'Status Kepegawaian' : 'Jurusan Kejuruan'}
              </span>
              <strong className="text-slate-100 text-[11px] truncate block">
                {currentUser?.role === 'guru' ? 'Guru Tetap SMK PB' : currentUser?.jurusan || 'DKV'}
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-medium">
                {currentUser?.role === 'guru' ? 'Mata Pelajaran Diampu' : 'Kelas & Rombel'}
              </span>
              <strong className="text-slate-100 text-[11px] truncate block">
                {currentUser?.role === 'guru'
                  ? currentUser.subjectsTaught?.join(', ') || 'Semua Bidang Keahlian'
                  : currentUser?.rombel || `${currentUser?.kelas} ${currentUser?.jurusan}`}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* If Not Logged In: 3 Separate Login Cards (Kepala Sekolah, Guru, Siswa) */}
      {!currentUser && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Pilih Masuk Akun PRABUNET</span>
          </h3>

          {/* Dedicated Super Admin Login Banner */}
          <button
            onClick={() => {
              setAuthMode('admin');
              setIsAuthOpen(true);
            }}
            className="w-full p-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl text-left shadow-lg shadow-amber-500/20 transition-all flex items-center justify-between border border-amber-400/40 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 border-2 border-white overflow-hidden shrink-0 shadow-xs">
                <img
                  src={ADMIN_CREDENTIALS.avatar}
                  alt="Bapak Kepala Sekolah"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-200" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.2 rounded">
                    SUPER ADMIN
                  </span>
                </div>
                <h4 className="text-xs font-black mt-0.5 leading-tight">
                  Login Kepala Sekolah (Bapak Nishfa Rahmada)
                </h4>
                <p className="text-[10px] text-amber-100">Kontrol Logo, Tema, Guru & Edit Nilai Semua Murid</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
          </button>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                setAuthMode('teacher');
                setIsAuthOpen(true);
              }}
              className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl text-left shadow-md shadow-blue-500/20 transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Dewan Guru
                </span>
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold leading-tight">Login Guru</h4>
                <p className="text-[10px] text-blue-100 mt-0.5">Kelola Modul, Soal, & Nilai</p>
              </div>
            </button>

            <button
              onClick={() => {
                setAuthMode('student');
                setIsAuthOpen(true);
              }}
              className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-left shadow-md shadow-emerald-500/20 transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Siswa PB
                </span>
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold leading-tight">Login Siswa</h4>
                <p className="text-[10px] text-emerald-100 mt-0.5">Belajar 30 Modul & Ujian</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Security & Password Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Keamanan & Sandi Akun</span>
        </h3>

        <div className="space-y-2 text-xs">
          {currentUser && (
            <button
              onClick={() => setIsChangePassOpen(true)}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between transition-colors text-slate-800"
            >
              <div className="flex items-center space-x-2.5">
                <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-left">
                  <span className="font-bold block">Ubah Kata Sandi Akun</span>
                  <span className="text-[10px] text-slate-500">Perbarui kata sandi SMKPBMAJU ke sandi pribadi Anda</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          )}

          <button
            onClick={() => {
              setAuthMode('forgot');
              setIsAuthOpen(true);
            }}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between transition-colors text-slate-800"
          >
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-left">
                <span className="font-bold block">Reset Sandi via Email</span>
                <span className="text-[10px] text-slate-500">Kirim tautan pemulihan sandi ke email terdaftar</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Logout & Reset Buttons */}
      {currentUser && (
        <div className="space-y-2 pt-1">
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun PRABUNET</span>
          </button>
        </div>
      )}

      {/* App Footer Info */}
      <div className="text-center text-[10px] text-slate-400 space-y-0.5 pt-3">
        <p className="font-semibold text-slate-600">SMK Purnama Bakti</p>
        <p>International Global Gateway School</p>
      </div>

      {/* UPDATE PHOTO MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>Update Foto Profil Guru</span>
              </h4>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-white/80 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Photo Preview */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-blue-500 overflow-hidden flex items-center justify-center shadow-md">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Pratinjau Foto Profil</span>
              </div>

              {/* Upload from Device */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Unggah dari Perangkat / Kamera:</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Foto (Galeri / Kamera)</span>
                </button>
              </div>

              {/* Preset Teacher Avatars */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-700 block text-[11px]">Atau Pilih Foto Avatar Guru:</span>
                <div className="grid grid-cols-6 gap-2">
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarPreview(url)}
                      className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${
                        avatarPreview === url
                          ? 'border-blue-600 ring-2 ring-blue-400 scale-105'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Direct Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">Atau Tautan URL Foto:</label>
                <input
                  type="text"
                  value={avatarPreview}
                  onChange={(e) => setAvatarPreview(e.target.value)}
                  placeholder="https://... URL gambar"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
                >
                  Simpan Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ChangePasswordModal isOpen={isChangePassOpen} onClose={() => setIsChangePassOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} />
    </div>
  );
};
