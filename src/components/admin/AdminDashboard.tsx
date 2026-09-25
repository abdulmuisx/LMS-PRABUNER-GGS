import React, { useState, useRef } from 'react';
import { useApp, ADMIN_CREDENTIALS } from '../../context/AppContext';
import { ThemeColor, TeacherAccount, ExamAttempt, LKPDSubmission, Subject, BroadcastMessage, User } from '../../types';
import {
  ShieldCheck,
  Palette,
  Image as ImageIcon,
  Users,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Upload,
  RotateCcw,
  Search,
  KeyRound,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Sliders,
  ExternalLink,
  ChevronDown,
  Info,
  Calendar,
  Lock,
  Megaphone,
  Radio,
  Copy,
  Send,
  ShieldAlert,
  Check,
  UserCheck,
  UserX,
  UserPlus,
  GraduationCap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Database,
  Eye,
  EyeOff,
  Globe,
  Wifi,
  Server,
  Crown,
} from 'lucide-react';
import { BankSoalAdminPanel } from './BankSoalAdminPanel';

export const THEME_OPTIONS: {
  id: ThemeColor;
  name: string;
  desc: string;
  headerGradient: string;
  badgeColor: string;
  primaryBg: string;
  textColor: string;
  previewColors: string[];
}[] = [
  {
    id: 'blue',
    name: 'Biru Prestasi (Default)',
    desc: 'Warna resmi kebanggaan SMK Purnama Bakti bernuansa cerdas & profesional.',
    headerGradient: 'from-blue-700 via-indigo-700 to-blue-900',
    badgeColor: 'bg-amber-400 text-amber-950',
    primaryBg: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-blue-600',
    previewColors: ['#1d4ed8', '#4338ca', '#fbbf24'],
  },
  {
    id: 'emerald',
    name: 'Zamrud Harapan',
    desc: 'Nuansa hijau sejuk melambangkan pertumbuhan, integritas & keasrian.',
    headerGradient: 'from-emerald-700 via-teal-700 to-emerald-950',
    badgeColor: 'bg-emerald-300 text-emerald-950',
    primaryBg: 'bg-emerald-600 hover:bg-emerald-700',
    textColor: 'text-emerald-600',
    previewColors: ['#047857', '#0f766e', '#6ee7b7'],
  },
  {
    id: 'indigo',
    name: 'Indigo Digital Kejuruan',
    desc: 'Nuansa teknologi tinggi yang modern untuk era Kurikulum Merdeka.',
    headerGradient: 'from-indigo-800 via-blue-900 to-slate-900',
    badgeColor: 'bg-cyan-300 text-cyan-950',
    primaryBg: 'bg-indigo-600 hover:bg-indigo-700',
    textColor: 'text-indigo-600',
    previewColors: ['#3730a3', '#1e3a8a', '#67e8f9'],
  },
  {
    id: 'purple',
    name: 'Ungu Merdeka Unggul',
    desc: 'Nuansa kreatif dan inovatif untuk jurusan DKV & Seni Komunikasi.',
    headerGradient: 'from-purple-800 via-violet-800 to-indigo-950',
    badgeColor: 'bg-pink-300 text-pink-950',
    primaryBg: 'bg-purple-600 hover:bg-purple-700',
    textColor: 'text-purple-600',
    previewColors: ['#6b21a8', '#5b21b6', '#f472b6'],
  },
  {
    id: 'rose',
    name: 'Marun Kejayaan',
    desc: 'Nuansa merah marun berani mencerminkan semangat juang & ketangguhan.',
    headerGradient: 'from-rose-800 via-red-800 to-rose-950',
    badgeColor: 'bg-amber-300 text-amber-950',
    primaryBg: 'bg-rose-600 hover:bg-rose-700',
    textColor: 'text-rose-600',
    previewColors: ['#9f1239', '#991b1b', '#fde047'],
  },
  {
    id: 'darkGold',
    name: 'Midnight Gold Luxury',
    desc: 'Palet gelap eksklusif beraksen emas mulia untuk sentuhan eksekutif.',
    headerGradient: 'from-slate-950 via-zinc-900 to-slate-950',
    badgeColor: 'bg-amber-400 text-slate-950',
    primaryBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
    textColor: 'text-amber-500',
    previewColors: ['#0f172a', '#18181b', '#f59e0b'],
  },
];

interface AdminDashboardProps {
  onSelectSubject?: (subject: Subject) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectSubject }) => {
  const {
    currentUser,
    siteSettings,
    updateSiteSettings,
    teachers,
    students,
    subjects,
    exams,
    examAttempts,
    lkpdSubmissions,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    approveStudent,
    rejectStudent,
    approveAllPendingStudents,
    deleteStudent,
    updateStudent,
    registerStudent,
    updateStudentGrade,
    deleteExam,
    cbtUnlockToken,
    setCbtUnlockToken,
    broadcasts,
    addBroadcast,
    deleteBroadcast,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'bank_soal' | 'approvals' | 'security' | 'broadcast' | 'identity' | 'theme' | 'teachers' | 'grades'>('overview');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Student Approval & Management State
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [studentJurusanFilter, setStudentJurusanFilter] = useState<'Semua' | 'DKV' | 'TKJ' | 'TBSM'>('Semua');
  const [studentKelasFilter, setStudentKelasFilter] = useState<'Semua' | 'X' | 'XI' | 'XII'>('Semua');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Reject Student Modal State
  const [rejectModalStudent, setRejectModalStudent] = useState<User | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('Data pendaftaran belum memenuhi syarat verifikasi sekolah.');

  // Edit / Add Student Modal State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formStudentName, setFormStudentName] = useState('');
  const [formStudentEmail, setFormStudentEmail] = useState('');
  const [formStudentJurusan, setFormStudentJurusan] = useState<'DKV' | 'TKJ' | 'TBSM'>('DKV');
  const [formStudentKelas, setFormStudentKelas] = useState<'X' | 'XI' | 'XII'>('X');
  const [formStudentRombel, setFormStudentRombel] = useState('X DKV 1');
  const [formStudentPassword, setFormStudentPassword] = useState('siswa123');
  const [formStudentPhone, setFormStudentPhone] = useState('0812-1111-2222');
  const [formStudentStatus, setFormStudentStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');

  // Computed Student Counts
  const pendingStudents = students.filter((s) => s.approvalStatus === 'pending');
  const approvedStudents = students.filter((s) => s.approvalStatus === 'approved' || !s.approvalStatus);
  const rejectedStudents = students.filter((s) => s.approvalStatus === 'rejected');

  // Security / CBT Token State
  const [tokenInput, setTokenInput] = useState(cbtUnlockToken || 'SMKPB2026');
  const [copiedToken, setCopiedToken] = useState(false);

  // CBT Server Redirect & Secret Admin Password State
  const [customCbtUrl, setCustomCbtUrl] = useState(siteSettings.cbtRedirectUrl || '192.168.1.7/ujian');
  const [customCbtMode, setCustomCbtMode] = useState<'redirect' | 'internal'>(siteSettings.cbtMode || 'redirect');
  const [customCbtAutoRedirect, setCustomCbtAutoRedirect] = useState(siteSettings.cbtAutoRedirect !== false);
  const [customSecretPass, setCustomSecretPass] = useState(siteSettings.secretAdminPassword || '@Purnama165');
  const [showSecretPassInAdmin, setShowSecretPassInAdmin] = useState(false);

  // Broadcast Message State
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcTarget, setBcTarget] = useState<'SEMUA' | 'DKV' | 'TKJ' | 'TBSM'>('SEMUA');
  const [bcPriority, setBcPriority] = useState<'normal' | 'urgent'>('urgent');

  // Identity Form State
  const [customLogoUrl, setCustomLogoUrl] = useState(siteSettings.logoUrl);
  const [customSiteName, setCustomSiteName] = useState(siteSettings.siteName);
  const [customSchoolName, setCustomSchoolName] = useState(siteSettings.schoolName);
  const [customTagline, setCustomTagline] = useState(siteSettings.tagline);
  const fileLogoInputRef = useRef<HTMLInputElement>(null);

  // Teacher Management State
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingTeacherEmail, setEditingTeacherEmail] = useState<string | null>(null);
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formTeacherEmail, setFormTeacherEmail] = useState('');
  const [formTeacherSubject, setFormTeacherSubject] = useState('');
  const [formTeacherClasses, setFormTeacherClasses] = useState('X DKV, XI DKV');
  const [formTeacherPassword, setFormTeacherPassword] = useState('SMKPBMAJU');
  const [formTeacherPhone, setFormTeacherPhone] = useState('0812-3456-7890');
  const [formTeacherNip, setFormTeacherNip] = useState('-');

  // Gradebook State
  const [gradeSearch, setGradeSearch] = useState('');
  const [gradeFilterJurusan, setGradeFilterJurusan] = useState<'Semua' | 'DKV' | 'TKJ' | 'TBSM'>('Semua');
  const [editingAttempt, setEditingAttempt] = useState<ExamAttempt | null>(null);
  const [editScoreTotal, setEditScoreTotal] = useState<number>(85);
  const [editScorePg, setEditScorePg] = useState<number>(40);
  const [editScoreEssay, setEditScoreEssay] = useState<number>(45);
  const [editIsPassed, setEditIsPassed] = useState<boolean>(true);

  const showNotificationToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Identity
  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      logoUrl: customLogoUrl || '/Logo-07(1).png',
      siteName: customSiteName || 'PRABUNET',
      schoolName: customSchoolName || 'SMK Purnama Bakti',
      tagline: customTagline,
    });
    showNotificationToast('Logo dan Identitas Website SMK Purnama Bakti berhasil disimpan!');
  };

  // Save CBT Server Settings
  const handleSaveCbtSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      cbtRedirectUrl: customCbtUrl.trim() || '192.168.1.7/ujian',
      cbtMode: customCbtMode,
      cbtAutoRedirect: customCbtAutoRedirect,
    });
    showNotificationToast(`Pengaturan server CBT berhasil disimpan! URL: ${customCbtUrl.trim() || '192.168.1.7/ujian'}`);
  };

  // Save Secret Admin Password
  const handleSaveSecretPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSecretPass.trim()) {
      showNotificationToast('Sandi rahasia tidak boleh kosong.');
      return;
    }
    updateSiteSettings({
      secretAdminPassword: customSecretPass.trim(),
    });
    showNotificationToast('Sandi Rahasia Kepala Sekolah berhasil diperbarui!');
  };

  // Reset to default logo
  const handleResetLogo = () => {
    setCustomLogoUrl('/Logo-07(1).png');
    updateSiteSettings({ logoUrl: '/Logo-07(1).png' });
    showNotificationToast('Logo berhasil direset ke logo resmi SMK Purnama Bakti.');
  };

  // Add / Edit Teacher submit
  const handleTeacherFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeacherName || !formTeacherEmail) return;

    if (editingTeacherEmail) {
      updateTeacher(editingTeacherEmail, {
        name: formTeacherName,
        email: formTeacherEmail,
        phone: formTeacherPhone,
        nip: formTeacherNip,
        subjects: [{ name: formTeacherSubject || 'Kejuruan', classes: formTeacherClasses || 'Semua Kelas' }],
        customPassword: formTeacherPassword,
      });
      showNotificationToast(`Data guru ${formTeacherName} berhasil diperbarui.`);
    } else {
      const res = addTeacher({
        no: teachers.length + 1,
        name: formTeacherName,
        email: formTeacherEmail,
        phone: formTeacherPhone,
        nip: formTeacherNip,
        subjects: [{ name: formTeacherSubject || 'Kejuruan', classes: formTeacherClasses || 'Semua Kelas' }],
        customPassword: formTeacherPassword || 'SMKPBMAJU',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
      if (res.success) {
        showNotificationToast(res.message);
      } else {
        alert(res.message);
      }
    }
    setShowAddTeacherModal(false);
    setEditingTeacherEmail(null);
  };

  // Open Edit Teacher modal
  const openEditTeacherModal = (t: TeacherAccount) => {
    setEditingTeacherEmail(t.email);
    setFormTeacherName(t.name);
    setFormTeacherEmail(t.email);
    setFormTeacherSubject(t.subjects[0]?.name || '');
    setFormTeacherClasses(t.subjects[0]?.classes || '');
    setFormTeacherPassword(t.customPassword || 'SMKPBMAJU');
    setFormTeacherPhone(t.phone || '0812-3456-7890');
    setFormTeacherNip(t.nip || '-');
    setShowAddTeacherModal(true);
  };

  // Open Add Teacher modal
  const openAddTeacherModal = () => {
    setEditingTeacherEmail(null);
    setFormTeacherName('');
    setFormTeacherEmail('');
    setFormTeacherSubject(subjects[0]?.name || 'Dasar Desain Komunikasi Visual');
    setFormTeacherClasses('X DKV 1, X DKV 2');
    setFormTeacherPassword('SMKPBMAJU');
    setFormTeacherPhone('0812-3456-7890');
    setFormTeacherNip('-');
    setShowAddTeacherModal(true);
  };

  // Save Grade Edit
  const handleSaveGradeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttempt) return;
    updateStudentGrade(editingAttempt.id, {
      totalScore: Number(editScoreTotal),
      pgScore: Number(editScorePg),
      essayScore: Number(editScoreEssay),
      isPassed: editIsPassed,
    });
    showNotificationToast(`Nilai siswa ${editingAttempt.studentName} berhasil diperbarui.`);
    setEditingAttempt(null);
  };

  // Save CBT Unlock Token
  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const clean = tokenInput.trim().toUpperCase();
    setCbtUnlockToken(clean);
    showNotificationToast(`Token Buka Kunci CBT berhasil disimpan: ${clean}`);
  };

  // Generate random token
  const handleGenerateRandomToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = 'PB-';
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTokenInput(rand);
  };

  // Copy token
  const handleCopyToken = () => {
    navigator.clipboard?.writeText(cbtUnlockToken || tokenInput);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
    showNotificationToast('Token berhasil disalin!');
  };

  // Send Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMessage.trim()) return;
    const newBc: BroadcastMessage = {
      id: `bc-${Date.now()}`,
      senderRole: 'admin',
      senderName: ADMIN_CREDENTIALS.name,
      title: bcTitle.trim(),
      message: bcMessage.trim(),
      target: bcTarget,
      priority: bcPriority,
      createdAt: new Date().toISOString(),
    };
    addBroadcast(newBc);
    setBcTitle('');
    setBcMessage('');
    showNotificationToast(`Broadcast "${newBc.title}" berhasil dikirimkan ke siswa!`);
  };

  // Filtered Students for Approval Management
  const filteredStudents = students.filter((s) => {
    const status = s.approvalStatus || 'approved';
    const matchesStatus =
      studentStatusFilter === 'all' || status === studentStatusFilter;
    const matchesJurusan =
      studentJurusanFilter === 'Semua' || s.jurusan === studentJurusanFilter;
    const matchesKelas =
      studentKelasFilter === 'Semua' || s.kelas === studentKelasFilter;
    const q = studentSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.rombel && s.rombel.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q));

    return matchesStatus && matchesJurusan && matchesKelas && matchesSearch;
  });

  // Student Approval Handlers
  const handleApproveStudent = (student: User) => {
    const res = approveStudent(student.id);
    showNotificationToast(res.message);
  };

  const handleOpenRejectModal = (student: User) => {
    setRejectModalStudent(student);
    setRejectReasonInput('Data pendaftaran belum memenuhi syarat verifikasi sekolah.');
  };

  const handleConfirmReject = () => {
    if (!rejectModalStudent) return;
    const res = rejectStudent(rejectModalStudent.id, rejectReasonInput.trim());
    showNotificationToast(res.message);
    setRejectModalStudent(null);
  };

  const handleApproveAll = () => {
    if (pendingStudents.length === 0) {
      alert('Tidak ada siswa baru yang berstatus pending.');
      return;
    }
    const res = approveAllPendingStudents();
    showNotificationToast(res.message);
  };

  const handleDeleteStudentAccount = (student: User) => {
    const confirm = window.confirm(`Hapus data akun siswa "${student.name}" (${student.email})? Tindakan ini tidak dapat dibatalkan.`);
    if (confirm) {
      const res = deleteStudent(student.id);
      showNotificationToast(res.message);
    }
  };

  const openAddStudentModal = () => {
    setEditingStudentId(null);
    setFormStudentName('');
    setFormStudentEmail('');
    setFormStudentJurusan('DKV');
    setFormStudentKelas('X');
    setFormStudentRombel('X DKV 1');
    setFormStudentPassword('siswa123');
    setFormStudentPhone('');
    setFormStudentStatus('approved');
    setShowStudentModal(true);
  };

  const openEditStudentModal = (s: User) => {
    setEditingStudentId(s.id);
    setFormStudentName(s.name);
    setFormStudentEmail(s.email);
    setFormStudentJurusan(s.jurusan || 'DKV');
    setFormStudentKelas(s.kelas || 'X');
    setFormStudentRombel(s.rombel || `${s.kelas || 'X'} ${s.jurusan || 'DKV'} 1`);
    setFormStudentPassword((s as any).password || 'siswa123');
    setFormStudentPhone(s.phone || '');
    setFormStudentStatus(s.approvalStatus || 'approved');
    setShowStudentModal(true);
  };

  const handleSaveStudentModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentName.trim() || !formStudentEmail.trim()) {
      alert('Nama dan email wajib diisi!');
      return;
    }

    if (editingStudentId) {
      const res = updateStudent(editingStudentId, {
        name: formStudentName.trim(),
        email: formStudentEmail.trim().toLowerCase(),
        jurusan: formStudentJurusan,
        kelas: formStudentKelas,
        rombel: formStudentRombel.trim(),
        phone: formStudentPhone.trim() || '-',
        password: formStudentPassword,
        approvalStatus: formStudentStatus,
        approvedAt: formStudentStatus === 'approved' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
        approvedBy: formStudentStatus === 'approved' ? ADMIN_CREDENTIALS.name : undefined,
      });
      showNotificationToast(res.message);
    } else {
      const res = registerStudent({
        name: formStudentName.trim(),
        email: formStudentEmail.trim().toLowerCase(),
        jurusan: formStudentJurusan,
        kelas: formStudentKelas,
        rombel: formStudentRombel.trim(),
        phone: formStudentPhone.trim() || '-',
        password: formStudentPassword,
      });
      if (res.success && res.user && formStudentStatus === 'approved') {
        approveStudent(res.user.id);
      }
      showNotificationToast(res.message);
    }

    setShowStudentModal(false);
    setEditingStudentId(null);
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.subjects.some((s) => s.name.toLowerCase().includes(teacherSearch.toLowerCase()))
  );

  // Filtered Exam attempts
  const filteredAttempts = examAttempts.filter((att) => {
    const matchesSearch =
      att.studentName.toLowerCase().includes(gradeSearch.toLowerCase()) ||
      att.subjectName.toLowerCase().includes(gradeSearch.toLowerCase()) ||
      att.examTitle.toLowerCase().includes(gradeSearch.toLowerCase());
    const matchesJurusan =
      gradeFilterJurusan === 'Semua' ||
      att.studentClass.toUpperCase().includes(gradeFilterJurusan);
    return matchesSearch && matchesJurusan;
  });

  return (
    <div id="admin-dashboard-container" className="space-y-3.5 pb-24 text-slate-800">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-14 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-3 bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden space-y-3">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-13 h-13 rounded-2xl bg-white/20 p-1 backdrop-blur-xs border-2 border-white/30 overflow-hidden shrink-0 shadow-inner">
              <img
                src={currentUser?.avatar || ADMIN_CREDENTIALS.avatar}
                alt="Bapak Kepala Sekolah"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[10px] font-extrabold tracking-wider uppercase border border-amber-400/30">
                  👑 KEPALA SEKOLAH
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-semibold text-white">
                  Administrator
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                {ADMIN_CREDENTIALS.name}
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                {ADMIN_CREDENTIALS.title}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/15 text-center">
          <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-xs">
            <span className="text-[10px] text-amber-100 block">Guru</span>
            <strong className="text-xs sm:text-sm font-extrabold text-white">{teachers.length}</strong>
          </div>
          <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-xs">
            <span className="text-[10px] text-amber-100 block">Murid Disetujui</span>
            <strong className="text-xs sm:text-sm font-extrabold text-white">
              {approvedStudents.length}
            </strong>
          </div>
          <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-xs relative">
            <span className="text-[10px] text-amber-100 block">Pending Approval</span>
            <strong className={`text-xs sm:text-sm font-extrabold ${pendingStudents.length > 0 ? 'text-amber-300 animate-pulse' : 'text-white'}`}>
              {pendingStudents.length}
            </strong>
          </div>
          <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-xs">
            <span className="text-[10px] text-amber-100 block">Mapel & CBT</span>
            <strong className="text-xs sm:text-sm font-extrabold text-white">{subjects.length} / {exams.length}</strong>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 bg-slate-200/80 p-1 rounded-2xl text-[11px] font-bold">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white/60 text-slate-700 hover:bg-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ikhtisar</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('bank_soal')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'bank_soal'
              ? 'bg-blue-600 text-white shadow-md font-extrabold'
              : 'bg-white/60 text-slate-700 hover:bg-white'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate max-w-full">Bank Soal</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('approvals')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 relative ${
            activeAdminTab === 'approvals'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white/60 text-slate-700 hover:bg-white'
          }`}
        >
          <div className="relative">
            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
            {pendingStudents.length > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-rose-600 text-white rounded-full text-[8px] font-black animate-pulse">
                {pendingStudents.length}
              </span>
            )}
          </div>
          <span className="truncate max-w-full">Approval Siswa</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('teachers')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'teachers'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white/60 text-slate-700 hover:bg-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Dewan Guru</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('security')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'security'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white/60 text-slate-700 hover:bg-white'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-blue-600" />
          <span>Server CBT & Sandi</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('broadcast')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'broadcast'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white/60 text-slate-700 hover:bg-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
          <span>Broadcast</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('grades')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'grades'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white/60 text-slate-700 hover:bg-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Nilai Murid</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('identity')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'identity'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white/60 text-slate-700 hover:bg-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Logo & Info</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('theme')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeAdminTab === 'theme'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white/60 text-slate-700 hover:bg-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Tema Web</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB: BANK SOAL FIRESTORE (CRUD SOAL, PENDAFTAR, HASIL UJIAN) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'bank_soal' && (
        <BankSoalAdminPanel />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-3">
          {/* PENDING APPROVAL ALERT BANNER IF APPLICABLE */}
          {pendingStudents.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black">
                    Perhatian: {pendingStudents.length} Siswa Baru Menunggu Persetujuan
                  </h4>
                  <p className="text-[11px] text-amber-100 font-medium">
                    Murid yang mendaftar belum dapat masuk ke PRABUNET sebelum Anda menyetujui pendaftarannya.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAdminTab('approvals')}
                className="px-4 py-2 bg-white text-slate-950 rounded-xl font-bold text-xs shadow-sm hover:bg-amber-50 transition-all shrink-0 cursor-pointer"
              >
                Tinjau & Setujui Sekarang ({pendingStudents.length})
              </button>
            </div>
          )}

          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Panel Kendali Penuh Kepala Sekolah</span>
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Sistem Aktif 100%
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sebagai Kepala Sekolah, Anda memiliki wewenang tertinggi untuk mengelola seluruh aspek
              ekosistem <strong>PRABUNET LMS</strong>, mulai dari persetujuan pendaftaran murid baru, data dewan guru, logo dan tema sekolah,
              hingga pemantauan dan perbaikan seluruh nilai hasil ujian CBT PB siswa.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => setActiveAdminTab('approvals')}
                className="p-3 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl text-left transition-colors space-y-1 relative"
              >
                <div className="flex justify-between items-center">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  {pendingStudents.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[9px] font-black">
                      {pendingStudents.length} Pending
                    </span>
                  )}
                </div>
                <strong className="text-xs text-emerald-950 block">Persetujuan Siswa Baru</strong>
                <p className="text-[10px] text-emerald-800">Verifikasi & approve akun murid</p>
              </button>

              <button
                onClick={() => setActiveAdminTab('teachers')}
                className="p-3 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 rounded-2xl text-left transition-colors space-y-1"
              >
                <Users className="w-4 h-4 text-blue-700" />
                <strong className="text-xs text-blue-950 block">Kelola Dewan Guru</strong>
                <p className="text-[10px] text-blue-800">Tambah, edit, atau hapus guru</p>
              </button>

              <button
                onClick={() => setActiveAdminTab('security')}
                className="p-3 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 rounded-2xl text-left transition-colors space-y-1"
              >
                <Lock className="w-4 h-4 text-rose-700" />
                <strong className="text-xs text-rose-950 block">Token Keamanan CBT</strong>
                <p className="text-[10px] text-rose-800">Buka kunci layar ujian siswa</p>
              </button>

              <button
                onClick={() => setActiveAdminTab('broadcast')}
                className="p-3 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 rounded-2xl text-left transition-colors space-y-1"
              >
                <Megaphone className="w-4 h-4 text-indigo-700" />
                <strong className="text-xs text-indigo-950 block">Kirim Broadcast</strong>
                <p className="text-[10px] text-indigo-800">Kirim pengumuman langsung</p>
              </button>

              <button
                onClick={() => setActiveAdminTab('grades')}
                className="p-3 bg-purple-50 hover:bg-purple-100/70 border border-purple-200 rounded-2xl text-left transition-colors space-y-1"
              >
                <Award className="w-4 h-4 text-purple-700" />
                <strong className="text-xs text-purple-950 block">Daftar & Edit Nilai</strong>
                <p className="text-[10px] text-purple-800">Koreksi seluruh nilai murid</p>
              </button>

              <button
                onClick={() => setActiveAdminTab('identity')}
                className="p-3 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-2xl text-left transition-colors space-y-1"
              >
                <ImageIcon className="w-4 h-4 text-amber-700" />
                <strong className="text-xs text-amber-950 block">Ubah Logo & Nama</strong>
                <p className="text-[10px] text-amber-800">Pengaturan identitas sekolah</p>
              </button>
            </div>
          </div>

          {/* Current Site Snapshot Card */}
          <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-md space-y-2.5">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400">Identitas Saat Ini:</span>
              <span className="text-amber-400 font-bold uppercase text-[10px]">
                Tema: {siteSettings.themeColor}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <img
                src={siteSettings.logoUrl}
                alt="Logo Aktif"
                className="w-12 h-12 object-contain rounded-xl bg-white/10 p-1 border border-white/20"
              />
              <div>
                <h4 className="text-xs font-extrabold text-white">{siteSettings.siteName}</h4>
                <p className="text-[11px] text-slate-300 font-medium">{siteSettings.schoolName}</p>
                <p className="text-[10px] text-slate-400 italic mt-0.5">"{siteSettings.tagline}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PERSETUJUAN & MANAJEMEN SISWA (STUDENT APPROVALS) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'approvals' && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Header & Stats Banner */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 shadow-inner">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Persetujuan & Manajemen Akun Siswa</span>
                    {pendingStudents.length > 0 && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black animate-pulse">
                        {pendingStudents.length} Perlu Verifikasi
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Siswa baru yang mendaftar wajib disetujui oleh Bapak Kepala Sekolah agar dapat masuk ke PRABUNET.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {pendingStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleApproveAll}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Setujui Semua Pending ({pendingStudents.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={openAddStudentModal}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Siswa Manual</span>
                </button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStudentStatusFilter('all')}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  studentStatusFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-[10px] font-medium opacity-80 block">Total Siswa Terdaftar</span>
                <span className="text-base font-black">{students.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentStatusFilter('pending')}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  studentStatusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm ring-2 ring-amber-300'
                    : 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold block">Menunggu Approval</span>
                  {pendingStudents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  )}
                </div>
                <span className="text-base font-black">{pendingStudents.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentStatusFilter('approved')}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  studentStatusFilter === 'approved'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="text-[10px] font-bold block">Disetujui (Aktif Masuk)</span>
                <span className="text-base font-black">{approvedStudents.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentStatusFilter('rejected')}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  studentStatusFilter === 'rejected'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                    : 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-900'
                }`}
              >
                <span className="text-[10px] font-bold block">Ditolak</span>
                <span className="text-base font-black">{rejectedStudents.length}</span>
              </button>
            </div>

            {/* Filter and Search Controls */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Cari nama siswa, email, rombel, nomor WA..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                {studentSearchQuery && (
                  <button
                    onClick={() => setStudentSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex gap-1.5">
                <select
                  value={studentJurusanFilter}
                  onChange={(e) => setStudentJurusanFilter(e.target.value as any)}
                  className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Semua">Semua Jurusan</option>
                  <option value="DKV">DKV (Desain Komunikasi Visual)</option>
                  <option value="TKJ">TKJ (Teknik Komputer Jaringan)</option>
                  <option value="TBSM">TBSM (Teknik Sepeda Motor)</option>
                </select>

                <select
                  value={studentKelasFilter}
                  onChange={(e) => setStudentKelasFilter(e.target.value as any)}
                  className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Semua">Semua Kelas</option>
                  <option value="X">Kelas X (Sepuluh)</option>
                  <option value="XI">Kelas XI (Sebelas)</option>
                  <option value="XII">Kelas XII (Dua Belas)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students List Table / Cards */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Daftar Siswa ({filteredStudents.length} Data Ditampilkan)
                </span>
              </h4>
              {studentStatusFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('all')}
                  className="text-[10px] text-emerald-700 font-bold hover:underline"
                >
                  Tampilkan Semua
                </button>
              )}
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <UserCheck className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                <p className="text-xs font-bold text-slate-600">Tidak ada siswa yang sesuai dengan filter</p>
                <p className="text-[11px] text-slate-400">
                  Coba ubah kata kunci pencarian atau ganti filter status di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredStudents.map((st) => {
                  const status = st.approvalStatus || 'approved';
                  const isPending = status === 'pending';
                  const isApproved = status === 'approved';
                  const isRejected = status === 'rejected';

                  return (
                    <div
                      key={st.id}
                      className={`p-3 sm:p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isPending
                          ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                          : isRejected
                          ? 'bg-rose-50/40 border-rose-200 opacity-90'
                          : 'bg-white hover:bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        {/* Student Main Info */}
                        <div className="flex items-start sm:items-center space-x-3">
                          <img
                            src={
                              st.avatar ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                st.name
                              )}`
                            }
                            alt={st.name}
                            className="w-10 h-10 rounded-xl bg-slate-100 object-cover border border-slate-200 shrink-0"
                          />
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                                {st.name}
                              </h4>
                              {isPending && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Pending Approval</span>
                                </span>
                              )}
                              {isApproved && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] flex items-center gap-1">
                                  <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Disetujui</span>
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[9px] flex items-center gap-1">
                                  <XCircle className="w-2.5 h-2.5 text-rose-600" />
                                  <span>Ditolak</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 font-medium">
                              <span className="font-mono text-slate-700">{st.email}</span>
                              <span>•</span>
                              <span className="font-bold text-slate-800">
                                {st.rombel || `Kelas ${st.kelas || 'X'} ${st.jurusan || 'DKV'}`}
                              </span>
                              {st.phone && st.phone !== '-' && (
                                <>
                                  <span>•</span>
                                  <span>WA: {st.phone}</span>
                                </>
                              )}
                            </div>

                            {/* Additional metadata timestamps */}
                            <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400 pt-0.5">
                              {st.registeredAt && (
                                <span>Daftar: {st.registeredAt}</span>
                              )}
                              {isApproved && st.approvedAt && (
                                <span className="text-emerald-700 font-medium">
                                  • Disetujui: {st.approvedAt} oleh {st.approvedBy || ADMIN_CREDENTIALS.name}
                                </span>
                              )}
                              {isRejected && st.rejectionReason && (
                                <span className="text-rose-700 font-medium">
                                  • Alasan Tolak: "{st.rejectionReason}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveStudent(st)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                                title="Setujui pendaftaran murid ini"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui (Approve)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(st)}
                                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Tolak pendaftaran murid ini"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditStudentModal(st)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                                title="Edit data siswa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(st)}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                                title="Tangguhkan / Tolak akun ini"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => handleApproveStudent(st)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                              title="Setujui kembali murid ini"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui Ulang</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteStudentAccount(st)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Hapus data siswa secara permanen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: TOKEN CBT (ANTI-CHEAT SECURITY) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'security' && (
        <div className="space-y-4">
          {/* Card 1: Konfigurasi Server Ujian CBT Lokal / IP */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Alamat IP / URL Server Ujian CBT</h3>
                  <p className="text-[11px] text-slate-500">
                    Siswa yang membuka menu CBT akan dialihkan/redirect ke alamat IP server lokal ini
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold flex items-center gap-1">
                <Wifi className="w-3 h-3 text-blue-600" />
                <span>Redirect Aktif</span>
              </span>
            </div>

            <form onSubmit={handleSaveCbtSettings} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat IP Lokal / Link Server Ujian (Contoh: 192.168.1.7/ujian):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customCbtUrl}
                    onChange={(e) => setCustomCbtUrl(e.target.value)}
                    placeholder="Contoh: 192.168.1.7/ujian atau http://192.168.1.7/ujian"
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                  <Server className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Bisa diisi dengan format IP tanpa awalan http (misal: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">192.168.1.7/ujian</code>) atau URL lengkap.
                </p>
              </div>

              {/* Mode Selection */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Metode Akses Menu CBT:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer text-left transition-all ${
                    customCbtMode === 'redirect' ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300' : 'bg-white border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="cbtMode"
                      checked={customCbtMode === 'redirect'}
                      onChange={() => setCustomCbtMode('redirect')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Redirect ke Server Lokal / IP</span>
                      <span className="text-[10px] text-slate-500 block leading-snug">Siswa diarahkan langsung ke {customCbtUrl || '192.168.1.7/ujian'}</span>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer text-left transition-all ${
                    customCbtMode === 'internal' ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300' : 'bg-white border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="cbtMode"
                      checked={customCbtMode === 'internal'}
                      onChange={() => setCustomCbtMode('internal')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Gunakan CBT Internal PRABUNET</span>
                      <span className="text-[10px] text-slate-500 block leading-snug">Menjalankan simulasi soal UNBK / Firestore bawaan aplikasi</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Auto redirect checkbox */}
              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="cbtAutoRedirectCheckbox"
                  checked={customCbtAutoRedirect}
                  onChange={(e) => setCustomCbtAutoRedirect(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="cbtAutoRedirectCheckbox" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Buka otomatis server ujian (countdown 3 detik) saat siswa membuka tab CBT
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                <a
                  href={customCbtUrl.startsWith('http') ? customCbtUrl : `http://${customCbtUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Uji Buka Link</span>
                </a>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Alamat Server CBT</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Sandi Rahasia Kepala Sekolah (Tersembunyi) */}
          <div className="p-4 bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-3xl border-2 border-amber-400/50 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">Sandi Rahasia Kepala Sekolah (Tersembunyi)</h3>
                  <p className="text-[11px] text-amber-800">
                    Kunci master backdoor untuk login langsung tanpa harus mengetik email
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black">
                Akses Khusus
              </span>
            </div>

            <form onSubmit={handleSaveSecretPass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Kata Sandi Rahasia Kepala Sekolah:
                </label>
                <div className="relative">
                  <input
                    type={showSecretPassInAdmin ? 'text' : 'password'}
                    value={customSecretPass}
                    onChange={(e) => setCustomSecretPass(e.target.value)}
                    placeholder="@Purnama165"
                    className="w-full text-xs font-mono font-bold bg-white border border-amber-300 rounded-xl px-3 py-2.5 pr-10 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden shadow-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretPassInAdmin(!showSecretPassInAdmin)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-800"
                    title={showSecretPassInAdmin ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showSecretPassInAdmin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-2xl text-[11px] text-amber-950 leading-relaxed flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Cara Menggunakan Pintu Rahasia:</strong>
                  <span>
                    Ketuk / klik <strong>Logo PRABUNET</strong> di pojok kiri atas sebanyak <strong>5 kali berturut-turut</strong>. Jendela login rahasia akan langsung muncul dan Anda cukup memasukkan sandi ini untuk masuk sebagai Kepala Sekolah.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Sandi Rahasia Kepala Sekolah</span>
              </button>
            </form>
          </div>

          {/* Card 3: Token Buka Kunci CBT (Anti-Curang) */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Token Buka Kunci CBT (Anti-Curang)</h3>
                  <p className="text-[11px] text-slate-500">
                    Atur token manual untuk membuka layar ujian siswa yang terkunci karena ganti tab/keluar aplikasi
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold">
                Proctoring Aktif
              </span>
            </div>

            {/* Current Active Token Banner */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-slate-700">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Token Buka Kunci Saat Ini (Valid untuk Siswa)
                </span>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-amber-400">
                    {cbtUnlockToken || 'SMKPB2026'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyToken}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer shrink-0"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedToken ? 'Tersalin!' : 'Salin Token'}</span>
              </button>
            </div>

            {/* Change Token Form */}
            <form onSubmit={handleSaveToken} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Ketik Token Manual Baru:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: SMKPB2026"
                    className="flex-1 uppercase font-mono font-bold tracking-wider text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomToken}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Buat Token Acak"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Acak</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Simpan Token
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Cara Kerja:</strong> Ketika siswa membuka tab lain, browser minim, atau keluar aplikasi saat ujian CBT berlangsung, sistem otomatis mengunci layar siswa. Guru/Admin cukup memberikan token ini kepada siswa setelah memeriksa alasan pelanggaran.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: BROADCAST SISWA */}
      {/* ========================================================================= */}
      {activeAdminTab === 'broadcast' && (
        <div className="space-y-3.5">
          {/* Create Broadcast Form */}
          <form onSubmit={handleSendBroadcast} className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Kirim Broadcast Pesan / Pengumuman</h3>
                  <p className="text-[11px] text-slate-500">Pesan akan muncul langsung di beranda dashboard seluruh siswa</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Judul Pengumuman</label>
                <input
                  type="text"
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  placeholder="Contoh: Pengumuman Jadwal Ujian CBT STS Ganjil"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Target Siswa</label>
                  <select
                    value={bcTarget}
                    onChange={(e) => setBcTarget(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold"
                  >
                    <option value="SEMUA">Semua Jurusan</option>
                    <option value="DKV">Khusus DKV</option>
                    <option value="TKJ">Khusus TKJ</option>
                    <option value="TBSM">Khusus TBSM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Tingkat Urgensi</label>
                  <select
                    value={bcPriority}
                    onChange={(e) => setBcPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold"
                  >
                    <option value="urgent">🔴 Darurat / Penting</option>
                    <option value="normal">🔵 Informasi Umum</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Isi Pesan Broadcast</label>
              <textarea
                rows={3}
                value={bcMessage}
                onChange={(e) => setBcMessage(e.target.value)}
                placeholder="Tuliskan instruksi atau pengumuman resmi untuk seluruh peserta didik SMK Purnama Bakti..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Broadcast ke Siswa Sekarang</span>
            </button>
          </form>

          {/* Broadcast History List */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-indigo-600" />
                <span>Riwayat Broadcast Aktif ({broadcasts.length})</span>
              </h4>
            </div>

            {broadcasts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">Belum ada siaran broadcast terkirim.</p>
            ) : (
              <div className="space-y-2">
                {broadcasts.map((bc) => (
                  <div
                    key={bc.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${bc.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                          {bc.priority === 'urgent' ? '🔴 Darurat' : '🔵 Info'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
                          Target: {bc.target}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(bc.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900">{bc.title}</h5>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{bc.message}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Oleh: {bc.senderName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        deleteBroadcast(bc.id);
                        showNotificationToast('Broadcast dihapus.');
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 transition-colors"
                      title="Hapus Broadcast"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IDENTITY & LOGO */}
      {/* ========================================================================= */}
      {activeAdminTab === 'identity' && (
        <form onSubmit={handleSaveIdentity} className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>Pengaturan Logo & Identitas Website</span>
            </h3>
            <button
              type="button"
              onClick={handleResetLogo}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Logo Asli</span>
            </button>
          </div>

          {/* Logo Live Preview & Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              <img
                src={customLogoUrl || '/Logo-07(1).png'}
                alt="Pratinjau Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Logo-07(1).png';
                }}
              />
            </div>
            <div className="space-y-1.5 flex-1 w-full">
              <span className="text-xs font-bold text-slate-800 block">Pratinjau Logo Website</span>
              <p className="text-[11px] text-slate-500">
                Unggah file gambar logo (.png, .jpg, .svg) dari perangkat Anda atau masukkan URL gambar.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileLogoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah dari HP / Komputer</span>
                </button>
                <input
                  type="file"
                  ref={fileLogoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Atau Masukkan Tautan / URL Gambar Logo:
            </label>
            <input
              type="text"
              value={customLogoUrl}
              onChange={(e) => setCustomLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png atau /Logo-07(1).png"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Aplikasi / LMS:</label>
            <input
              type="text"
              value={customSiteName}
              onChange={(e) => setCustomSiteName(e.target.value)}
              placeholder="Contoh: PRABUNET LMS"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lembaga / Sekolah:</label>
            <input
              type="text"
              value={customSchoolName}
              onChange={(e) => setCustomSchoolName(e.target.value)}
              placeholder="Contoh: SMK Purnama Bakti"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Slogan / Tagline Sekolah:</label>
            <input
              type="text"
              value={customTagline}
              onChange={(e) => setCustomTagline(e.target.value)}
              placeholder="Contoh: Maju Bersama, Unggul dalam Karya Kejuruan"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Perubahan Identitas & Logo</span>
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: THEME SELECTOR */}
      {/* ========================================================================= */}
      {activeAdminTab === 'theme' && (
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>Pilihan Palet Tema Website SMK Purnama Bakti</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Klik pada salah satu tema di bawah untuk menerapkan warna header, navigasi, dan aksen di seluruh aplikasi secara langsung.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {THEME_OPTIONS.map((th) => {
              const isSelected = siteSettings.themeColor === th.id;
              return (
                <div
                  key={th.id}
                  onClick={() => {
                    updateSiteSettings({ themeColor: th.id });
                    showNotificationToast(`Tema "${th.name}" berhasil diterapkan!`);
                  }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-400/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">{th.name}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Aktif</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">{th.desc}</p>

                  {/* Color Swatch Bar */}
                  <div className="h-6 rounded-xl overflow-hidden flex border border-slate-200 shadow-inner">
                    {th.previewColors.map((col, idx) => (
                      <div key={idx} className="flex-1 h-full" style={{ backgroundColor: col }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TEACHERS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeAdminTab === 'teachers' && (
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Direktori Dewan Guru SMK Purnama Bakti ({teachers.length})</span>
              </h3>
              <button
                onClick={openAddTeacherModal}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Guru</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                placeholder="Cari nama guru, email, atau mata pelajaran..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Teachers List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredTeachers.map((t) => (
                <div
                  key={t.email}
                  className="p-3 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {t.avatar ? (
                          <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          t.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{t.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{t.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTeacherModal(t)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
                        title="Edit Data Guru"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus guru ${t.name} dari sistem SMK Purnama Bakti?`)) {
                            const res = deleteTeacher(t.email);
                            showNotificationToast(res.message);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                        title="Hapus Guru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-700 block">Mata Pelajaran & Kelas:</span>
                    {t.subjects.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-blue-800">• {s.name}</span>
                        <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{s.classes}</span>
                      </div>
                    ))}
                    <div className="pt-1 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>Password: {t.customPassword || 'SMKPBMAJU'}</span>
                      <span>No. Urut: #{t.no}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MASTER GRADEBOOK & EDIT GRADES */}
      {/* ========================================================================= */}
      {activeAdminTab === 'grades' && (
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Master Rekap & Edit Nilai CBT Siswa</span>
              </h3>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                {filteredAttempts.length} Data Nilai
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Sebagai Kepala Sekolah, Anda dapat melihat seluruh nilai murid dari semua guru dan dapat mengedit nilai (PG, Esai, Kelulusan) jika diperlukan.
            </p>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={gradeSearch}
                  onChange={(e) => setGradeSearch(e.target.value)}
                  placeholder="Cari nama siswa atau nama mapel..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-[10px] font-bold text-slate-500 shrink-0">Jurusan:</span>
                {(['Semua', 'DKV', 'TKJ', 'TBSM'] as const).map((jur) => (
                  <button
                    key={jur}
                    onClick={() => setGradeFilterJurusan(jur)}
                    className={`px-2.5 py-1.5 rounded-xl font-bold text-[10px] transition-colors ${
                      gradeFilterJurusan === jur
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {jur}
                  </button>
                ))}
              </div>
            </div>

            {/* Attempts / Grade List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredAttempts.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-1">
                  <Award className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-bold text-slate-700">Belum ada data nilai ujian siswa.</p>
                  <p className="text-[11px] text-slate-400">
                    Nilai siswa yang menyelesaikan CBT PB akan otomatis muncul di sini.
                  </p>
                </div>
              ) : (
                filteredAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            {att.subjectName}
                          </span>
                          <span className="text-[9px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {att.studentClass}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{att.studentName}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{att.examTitle}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-purple-700 font-mono block">
                          {att.totalScore} / {att.maxScore}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            att.isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.isPassed ? 'LULUS' : 'REMEDIAL'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                      <span>
                        PG: <strong>{att.pgScore}</strong> | Esai: <strong>{att.essayScore}</strong> ({att.percentage}%)
                      </span>
                      <button
                        onClick={() => {
                          setEditingAttempt(att);
                          setEditScoreTotal(att.totalScore);
                          setEditScorePg(att.pgScore);
                          setEditScoreEssay(att.essayScore);
                          setEditIsPassed(att.isPassed);
                        }}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Nilai Ini</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TEACHER */}
      {/* ========================================================================= */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{editingTeacherEmail ? 'Edit Data Guru' : 'Tambah Guru Baru SMK PB'}</span>
              </h4>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="text-white/80 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTeacherFormSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar Guru:</label>
                <input
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  placeholder="Contoh: Ir. Muhammad Ridwan, S.Kom., M.T."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi Sekolah:</label>
                <input
                  type="email"
                  value={formTeacherEmail}
                  onChange={(e) => setFormTeacherEmail(e.target.value)}
                  placeholder="nama.guru@smkpurnamabakti.sch.id"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                  <input
                    type="text"
                    value={formTeacherSubject}
                    onChange={(e) => setFormTeacherSubject(e.target.value)}
                    placeholder="Contoh: PRODUK KREATIF"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Kelas:</label>
                  <input
                    type="text"
                    value={formTeacherClasses}
                    onChange={(e) => setFormTeacherClasses(e.target.value)}
                    placeholder="Contoh: XI DKV, XII DKV"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kata Sandi Login:</label>
                  <input
                    type="text"
                    value={formTeacherPassword}
                    onChange={(e) => setFormTeacherPassword(e.target.value)}
                    placeholder="Default: SMKPBMAJU"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. HP / WhatsApp:</label>
                  <input
                    type="text"
                    value={formTeacherPhone}
                    onChange={(e) => setFormTeacherPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20"
                >
                  {editingTeacherEmail ? 'Simpan Perubahan' : 'Daftarkan Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT STUDENT GRADE */}
      {/* ========================================================================= */}
      {editingAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Koreksi & Edit Nilai Siswa</span>
              </h4>
              <button onClick={() => setEditingAttempt(null)} className="text-white/80 hover:text-white font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGradeEdit} className="p-4 space-y-3.5 text-xs">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-purple-950 space-y-1">
                <p className="font-bold text-xs">Siswa: {editingAttempt.studentName}</p>
                <p className="text-[11px] text-purple-800">
                  Ujian: {editingAttempt.examTitle} ({editingAttempt.subjectName})
                </p>
                <p className="text-[10px] text-purple-700">Kelas: {editingAttempt.studentClass}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skor Pilihan Ganda (PG):</label>
                  <input
                    type="number"
                    value={editScorePg}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditScorePg(val);
                      setEditScoreTotal(val + editScoreEssay);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                    min="0"
                    max={editingAttempt.maxScore}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skor Soal Esai:</label>
                  <input
                    type="number"
                    value={editScoreEssay}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditScoreEssay(val);
                      setEditScoreTotal(editScorePg + val);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                    min="0"
                    max={editingAttempt.maxScore}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Nilai Akhir:</label>
                <div className="relative">
                  <input
                    type="number"
                    value={editScoreTotal}
                    onChange={(e) => setEditScoreTotal(Number(e.target.value))}
                    className="w-full bg-purple-50 border-2 border-purple-300 rounded-xl px-3 py-2.5 text-sm text-purple-900 font-mono font-extrabold"
                    min="0"
                    max={editingAttempt.maxScore}
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-purple-600 font-bold">
                    / {editingAttempt.maxScore}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Kelulusan Siswa:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsPassed(true)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      editIsPassed
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✓ LULUS (Tuntas)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsPassed(false)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      !editIsPassed
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✕ REMEDIAL
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAttempt(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-500/20"
                >
                  Simpan Nilai Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT STUDENT REGISTRATION */}
      {/* ========================================================================= */}
      {rejectModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-rose-700 to-red-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <UserX className="w-4 h-4" />
                <span>Tolak Pendaftaran Murid Baru</span>
              </h4>
              <button
                onClick={() => setRejectModalStudent(null)}
                className="text-white/80 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                <p className="text-[11px] text-rose-900 font-bold">
                  Anda akan menolak pendaftaran akun siswa berikut:
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs">
                    {rejectModalStudent.name.charAt(0)}
                  </div>
                  <div>
                    <strong className="text-xs text-rose-950 block">{rejectModalStudent.name}</strong>
                    <span className="text-[11px] text-rose-800">{rejectModalStudent.email} • {rejectModalStudent.rombel || `Kelas ${rejectModalStudent.kelas} ${rejectModalStudent.jurusan}`}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Alasan Penolakan (Akan Dilihat Siswa saat Login):</label>
                <textarea
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Ketik alasan penolakan pendaftaran..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalStudent(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-500/20 transition-colors cursor-pointer"
                >
                  Konfirmasi Tolak Pendaftaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT STUDENT (MANUAL BY ADMIN) */}
      {/* ========================================================================= */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>{editingStudentId ? 'Edit Data Akun Siswa' : 'Tambah Siswa Baru Manual'}</span>
              </h4>
              <button
                onClick={() => {
                  setShowStudentModal(false);
                  setEditingStudentId(null);
                }}
                className="text-white/80 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudentModal} className="p-4 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  value={formStudentName}
                  onChange={(e) => setFormStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizki Pratama"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Siswa (ID Login):</label>
                <input
                  type="email"
                  value={formStudentEmail}
                  onChange={(e) => setFormStudentEmail(e.target.value)}
                  placeholder="Contoh: rizky.dkv@smkpurnamabakti.sch.id"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jurusan / Kompetensi:</label>
                  <select
                    value={formStudentJurusan}
                    onChange={(e) => {
                      const jur = e.target.value as any;
                      setFormStudentJurusan(jur);
                      setFormStudentRombel(`${formStudentKelas} ${jur} 1`);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="DKV">DKV (Desain Visual)</option>
                    <option value="TKJ">TKJ (Komputer Jaringan)</option>
                    <option value="TBSM">TBSM (Sepeda Motor)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas:</label>
                  <select
                    value={formStudentKelas}
                    onChange={(e) => {
                      const kls = e.target.value as any;
                      setFormStudentKelas(kls);
                      setFormStudentRombel(`${kls} ${formStudentJurusan} 1`);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="X">Kelas X (Sepuluh)</option>
                    <option value="XI">Kelas XI (Sebelas)</option>
                    <option value="XII">Kelas XII (Dua Belas)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rombel / Kelas:</label>
                  <input
                    type="text"
                    value={formStudentRombel}
                    onChange={(e) => setFormStudentRombel(e.target.value)}
                    placeholder="Contoh: X DKV 1"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password Akun:</label>
                  <input
                    type="text"
                    value={formStudentPassword}
                    onChange={(e) => setFormStudentPassword(e.target.value)}
                    placeholder="Password login"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / HP:</label>
                <input
                  type="text"
                  value={formStudentPhone}
                  onChange={(e) => setFormStudentPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Akses Approval:</label>
                <select
                  value={formStudentStatus}
                  onChange={(e) => setFormStudentStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="approved">✅ Disetujui (Bisa Langsung Masuk)</option>
                  <option value="pending">⏳ Menunggu Persetujuan (Pending)</option>
                  <option value="rejected">❌ Ditolak (Tidak Bisa Masuk)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentModal(false);
                    setEditingStudentId(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingStudentId ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
