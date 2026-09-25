import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Subject,
  MeetingModule,
  ScheduleItem,
  Exam,
  ExamAttempt,
  LKPDSubmission,
  NotificationItem,
  TeacherAccount,
  StudentAnswer,
  SiteSettings,
  ThemeColor,
  BroadcastMessage,
} from '../types';
import { INITIAL_TEACHERS, DEFAULT_TEACHER_PASSWORD } from '../data/teachersData';
import { INITIAL_STUDENTS } from '../data/studentsData';
import { INITIAL_SUBJECTS } from '../data/subjectsData';
import { INITIAL_SCHEDULES } from '../data/scheduleData';
import { INITIAL_EXAMS } from '../data/sampleExamsData';
import { generate30MeetingsForSubject } from '../data/curriculumService';
import { seedInitialBankSoalIfEmpty } from '../services/firestoreService';

export const ADMIN_CREDENTIALS = {
  name: 'Nishfa Rahmada, S.Kom., MM, Gr',
  email: 'nishfa_rahmada@smkpurnamabakti.sch.id',
  altEmail: 'kepala.sekolah@smkpurnamabakti.sch.id',
  password: '@Purnama165',
  title: 'Kepala Sekolah SMK Purnama Bakti',
  avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
};

const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: '/Logo-07(1).png',
  siteName: 'PRABUNET',
  schoolName: 'SMK Purnama Bakti',
  tagline: 'SMK Purnama Bakti. International Global Gateway School',
  themeColor: 'blue',
};

interface AppContextType {
  currentUser: User | null;
  siteSettings: SiteSettings;
  teachers: TeacherAccount[];
  students: User[];
  subjects: Subject[];
  schedules: ScheduleItem[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  lkpdSubmissions: LKPDSubmission[];
  notifications: NotificationItem[];
  broadcasts: BroadcastMessage[];
  cbtUnlockToken: string;
  activeTab: 'home' | 'schedule' | 'subjects' | 'cbt' | 'account';
  selectedSubject: Subject | null;
  activeExam: Exam | null;
  activeExamAttempt: ExamAttempt | null;
  // Actions
  setActiveTab: (tab: 'home' | 'schedule' | 'subjects' | 'cbt' | 'account') => void;
  setSelectedSubject: (subject: Subject | null) => void;
  setActiveExam: (exam: Exam | null) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  loginAsAdmin: (email?: string, password?: string) => { success: boolean; message: string; user?: User };
  loginAsTeacher: (email: string, password?: string) => { success: boolean; message: string; user?: User };
  loginAsStudent: (email: string, password?: string) => { success: boolean; message: string; user?: User };
  registerStudent: (studentData: Partial<User> & { password?: string }) => { success: boolean; message: string; user?: User };
  logout: () => void;
  updateUserProfile: (updated: Partial<User>) => { success: boolean; message: string };
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  requestPasswordReset: (email: string) => { success: boolean; message: string; simulatedToken?: string };
  resetPasswordWithToken: (email: string, token: string, newPass: string) => { success: boolean; message: string };
  // Student Management & Approval by Admin
  approveStudent: (studentId: string) => { success: boolean; message: string };
  rejectStudent: (studentId: string, reason?: string) => { success: boolean; message: string };
  approveAllPendingStudents: () => { success: boolean; count: number; message: string };
  deleteStudent: (studentId: string) => { success: boolean; message: string };
  updateStudent: (studentId: string, updated: Partial<User>) => { success: boolean; message: string };
  // Teacher management by Admin
  addTeacher: (teacher: TeacherAccount) => { success: boolean; message: string };
  updateTeacher: (teacherEmail: string, updated: Partial<TeacherAccount>) => { success: boolean; message: string };
  deleteTeacher: (teacherEmail: string) => { success: boolean; message: string };
  // Subject & Meetings
  getMeetingsForSubject: (subjectId: string) => MeetingModule[];
  updateMeetingModule: (subjectId: string, meetingNumber: number, updated: Partial<MeetingModule>) => void;
  // Exams & Grading
  addExam: (exam: Exam) => void;
  updateExam: (examId: string, updated: Partial<Exam>) => void;
  deleteExam: (examId: string) => void;
  submitExamAttempt: (attempt: ExamAttempt) => void;
  gradeExamEssay: (attemptId: string, questionId: string, score: number, feedback?: string) => void;
  updateStudentGrade: (attemptId: string, updatedScores: { totalScore?: number; pgScore?: number; essayScore?: number; isPassed?: boolean; notes?: string }) => void;
  submitLKPD: (submission: LKPDSubmission) => void;
  gradeLKPD: (submissionId: string, score: number, feedback: string) => void;
  // Schedule
  addSchedule: (schedule: ScheduleItem) => void;
  addScheduleItem: (schedule: ScheduleItem) => void;
  updateScheduleItem: (scheduleId: string, updated: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (scheduleId: string) => void;
  // Notifications & Broadcasts
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markNotificationRead: (id: string) => void;
  addBroadcast: (broadcast: Omit<BroadcastMessage, 'id' | 'createdAt'>) => void;
  deleteBroadcast: (id: string) => void;
  setCbtUnlockToken: (token: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Site settings (Logo, Theme, School info)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('prabunet_site_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Teachers with stored passwords and custom avatars
  const [teachers, setTeachers] = useState<TeacherAccount[]>(() => {
    const saved = localStorage.getItem('prabunet_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  // Students list (persisted in localStorage for real live registration)
  const [students, setStudents] = useState<User[]>(() => {
    const saved = localStorage.getItem('prabunet_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => ({
            ...s,
            approvalStatus: s.approvalStatus || 'approved',
          }));
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_STUDENTS;
  });

  // Current logged in user (persisted in localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('prabunet_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Subjects
  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);

  // 30 Meetings cache/store per subject ID
  const [subjectMeetings, setSubjectMeetings] = useState<Record<string, MeetingModule[]>>(() => {
    const saved = localStorage.getItem('prabunet_meetings');
    if (saved) return JSON.parse(saved);
    const initial: Record<string, MeetingModule[]> = {};
    INITIAL_SUBJECTS.forEach((subj) => {
      initial[subj.id] = generate30MeetingsForSubject(subj);
    });
    return initial;
  });

  // Schedules (Editable by teachers, students, and admin)
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('prabunet_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  // Exams
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('prabunet_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  // Exam Attempts / Results
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>(() => {
    const saved = localStorage.getItem('prabunet_exam_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  // LKPD Submissions
  const [lkpdSubmissions, setLkpdSubmissions] = useState<LKPDSubmission[]>(() => {
    const saved = localStorage.getItem('prabunet_lkpd_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Selamat Datang di PRABUNET Live!',
      message: 'Portal LMS Resmi SMK Purnama Bakti untuk Kurikulum Merdeka Kejuruan (DKV, TKJ, TBSM).',
      timestamp: 'Baru saja',
      read: false,
      type: 'info',
    },
    {
      id: 'notif-2',
      title: 'Portal Ujian STS & SAS CBT PB Aktif',
      message: 'Ujian Sumatif Tengah Semester (STS) dan Sumatif Akhir Semester (SAS) CBT PB telah siap digunakan.',
      timestamp: '1 jam yang lalu',
      read: false,
      type: 'exam',
    },
  ]);

  // CBT Anti-Cheat Unlock Token
  const [cbtUnlockToken, setCbtUnlockTokenState] = useState<string>(() => {
    const saved = localStorage.getItem('prabunet_cbt_token');
    return saved || 'SMKPB2026';
  });

  const setCbtUnlockToken = (token: string) => {
    const cleanToken = token.trim().toUpperCase();
    setCbtUnlockTokenState(cleanToken);
    localStorage.setItem('prabunet_cbt_token', cleanToken);
  };

  // Broadcast messages (Admin & Guru to Siswa)
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(() => {
    const saved = localStorage.getItem('prabunet_broadcasts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'bc-1',
        senderName: 'Nishfa Rahmada, S.Kom., MM, Gr',
        senderRole: 'admin',
        title: 'Pengumuman Penting Pelaksanaan CBT UNBK & Kedisiplinan',
        message: 'Diberitahukan kepada seluruh siswa agar tertib saat mengerjakan CBT. Jangan membuka tab lain atau keluar aplikasi karena layar ujian akan langsung terkunci otomatis.',
        target: 'SEMUA',
        priority: 'urgent',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('prabunet_broadcasts', JSON.stringify(broadcasts));
  }, [broadcasts]);

  const addBroadcast = (broadcast: Omit<BroadcastMessage, 'id' | 'createdAt'>) => {
    const newBc: BroadcastMessage = {
      ...broadcast,
      id: `bc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBroadcasts((prev) => [newBc, ...prev]);
    addNotification(`📢 Broadcast: ${broadcast.title}`, broadcast.message, 'info');
  };

  const deleteBroadcast = (id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  };

  // Navigation & View states
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'subjects' | 'cbt' | 'account'>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [activeExamAttempt, setActiveExamAttempt] = useState<ExamAttempt | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('prabunet_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    localStorage.setItem('prabunet_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('prabunet_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('prabunet_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('prabunet_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('prabunet_meetings', JSON.stringify(subjectMeetings));
  }, [subjectMeetings]);

  useEffect(() => {
    localStorage.setItem('prabunet_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('prabunet_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('prabunet_exam_attempts', JSON.stringify(examAttempts));
  }, [examAttempts]);

  useEffect(() => {
    localStorage.setItem('prabunet_lkpd_submissions', JSON.stringify(lkpdSubmissions));
  }, [lkpdSubmissions]);

  // Seed initial sample questions into Firestore bank_soal if collection is empty
  useEffect(() => {
    seedInitialBankSoalIfEmpty().catch((err) => {
      console.warn('Initial seed bank_soal notice:', err);
    });
  }, []);

  // Update site settings
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings }));
    addNotification('Pengaturan Diperbarui', 'Logo, tema, dan identitas website berhasil disimpan oleh Kepala Sekolah.', 'info');
  };

  // Dedicated Admin / Kepala Sekolah Login (Nishfa Rahmada, S.Kom., MM, Gr / @Purnama165)
  const loginAsAdmin = (email = ADMIN_CREDENTIALS.email, password = ADMIN_CREDENTIALS.password) => {
    const cleanEmail = email.trim().toLowerCase();
    const validEmails = [
      ADMIN_CREDENTIALS.email.toLowerCase(),
      ADMIN_CREDENTIALS.altEmail.toLowerCase(),
      'admin@smkpurnamabakti.sch.id',
      'kepsek@smkpurnamabakti.sch.id',
    ];

    if (!validEmails.includes(cleanEmail) && !cleanEmail.includes('nishfa') && !cleanEmail.includes('kepala')) {
      return {
        success: false,
        message: 'Email Kepala Sekolah / Admin tidak cocok. Gunakan email resmi Bapak Kepala Sekolah.',
      };
    }

    if (password !== ADMIN_CREDENTIALS.password) {
      return {
        success: false,
        message: 'Kata sandi Kepala Sekolah salah. Pastikan sandi @Purnama165 dimasukkan dengan benar.',
      };
    }

    const adminUser: User = {
      id: 'admin-headmaster',
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      role: 'admin',
      title: ADMIN_CREDENTIALS.title,
      avatar: ADMIN_CREDENTIALS.avatar,
      phone: '0812-9876-5432',
    };

    setCurrentUser(adminUser);
    addNotification(
      'Selamat Datang Kepala Sekolah',
      `Bapak ${ADMIN_CREDENTIALS.name} berhasil masuk ke Ruang Kontrol Utama Kepala Sekolah.`,
      'info'
    );
    return {
      success: true,
      message: `Selamat datang Bapak ${ADMIN_CREDENTIALS.name}! Anda memiliki kontrol penuh atas manajemen sistem sekolah.`,
      user: adminUser,
    };
  };

  // Teacher Login
  const loginAsTeacher = (email: string, password = DEFAULT_TEACHER_PASSWORD) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if headmaster logged in through teacher form
    if (
      (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() ||
        cleanEmail === ADMIN_CREDENTIALS.altEmail.toLowerCase()) &&
      password === ADMIN_CREDENTIALS.password
    ) {
      return loginAsAdmin(email, password);
    }

    const teacher = teachers.find((t) => t.email.toLowerCase() === cleanEmail);

    if (!teacher) {
      return { success: false, message: 'Email guru tidak terdaftar di sistem SMK Purnama Bakti.' };
    }

    const correctPassword = teacher.customPassword || DEFAULT_TEACHER_PASSWORD;
    if (password !== correctPassword) {
      return { success: false, message: 'Kata sandi salah. Password default awal: SMKPBMAJU' };
    }

    const userObj: User = {
      id: `teacher-${teacher.no}`,
      name: teacher.name,
      email: teacher.email,
      role: 'guru',
      title: 'Dewan Guru SMK Purnama Bakti',
      avatar: teacher.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      subjectsTaught: teacher.subjects.map((s) => s.name),
      classesTaught: teacher.subjects.map((s) => s.classes),
    };

    setCurrentUser(userObj);
    addNotification('Login Berhasil', `Selamat bertugas, ${teacher.name}!`, 'info');
    return { success: true, message: `Selamat datang, ${teacher.name}!`, user: userObj };
  };

  // Student Login
  const loginAsStudent = (email: string, password?: string) => {
    const cleanQuery = email.trim().toLowerCase();
    const student = students.find((s) => s.email.toLowerCase() === cleanQuery);

    if (!student) {
      return { success: false, message: 'Akun siswa dengan email tersebut belum terdaftar. Silakan daftar akun baru terlebih dahulu.' };
    }

    if (password && (student as any).password && (student as any).password !== password) {
      return { success: false, message: 'Kata sandi siswa salah. Silakan periksa kembali.' };
    }

    // CHECK APPROVAL STATUS
    const status = student.approvalStatus || 'approved';

    if (status === 'pending') {
      return {
        success: false,
        message: `Akun atas nama "${student.name}" masih dalam status MENUNGGU PERSETUJUAN (PENDING) oleh Admin / Kepala Sekolah (Bapak Nishfa Rahmada). Akses PRABUNET baru dapat dibuka setelah disetujui pihak sekolah.`,
      };
    }

    if (status === 'rejected') {
      return {
        success: false,
        message: `Pendaftaran akun siswa ini telah DITOLAK oleh Admin / Kepala Sekolah.${student.rejectionReason ? ` Alasan: ${student.rejectionReason}` : ' Silakan hubungi admin sekolah.'}`,
      };
    }

    setCurrentUser(student);
    addNotification('Login Siswa Berhasil', `Selamat datang kembali, ${student.name}!`, 'info');
    return { success: true, message: `Selamat datang, ${student.name}!`, user: student };
  };

  // Student Registration (Requires Admin Approval)
  const registerStudent = (studentData: Partial<User> & { password?: string }) => {
    if (!studentData.name || !studentData.email || !studentData.jurusan || !studentData.kelas) {
      return { success: false, message: 'Mohon lengkapi semua data pendaftaran wajib.' };
    }

    const email = studentData.email.trim().toLowerCase();
    const existing = students.find((s) => s.email.toLowerCase() === email);
    if (existing) {
      if (existing.approvalStatus === 'pending') {
        return {
          success: false,
          message: `Email siswa ini sudah didaftarkan sebelumnya dan saat ini masih MENUNGGU PERSETUJUAN dari Admin / Bapak Kepala Sekolah.`,
        };
      }
      return { success: false, message: 'Email siswa tersebut sudah terdaftar. Silakan langsung masuk (login).' };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newStudent: User & { password?: string } = {
      id: `std-${Date.now()}`,
      name: studentData.name.trim(),
      email,
      role: 'murid',
      jurusan: studentData.jurusan,
      kelas: studentData.kelas,
      rombel: studentData.rombel || `${studentData.kelas} ${studentData.jurusan}${studentData.jurusan === 'TKJ' || studentData.jurusan === 'TBSM' ? ' A' : ''}`,
      academicYear: '2026/2027',
      avatar: studentData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      approvalStatus: 'pending',
      registeredAt: nowStr,
      password: studentData.password,
      phone: studentData.phone || '-',
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Note: We deliberately do NOT call setCurrentUser here because the student must be approved first!
    addNotification(
      'Pendaftaran Menunggu Persetujuan',
      `Siswa baru "${newStudent.name}" (${newStudent.rombel}) mendaftar dan menunggu persetujuan Bapak Kepala Sekolah.`,
      'info'
    );

    return {
      success: true,
      message: `Pendaftaran berhasil! Akun atas nama "${newStudent.name}" telah tercatat dan saat ini berstatus MENUNGGU PERSETUJUAN (PENDING APPROVAL) oleh Admin / Kepala Sekolah (Bapak Nishfa Rahmada). Setelah disetujui, Anda dapat langsung masuk ke PRABUNET.`,
      user: newStudent,
    };
  };

  // Student Approval / Rejection Management by Admin / Kepala Sekolah
  const approveStudent = (studentId: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let targetName = '';
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          targetName = s.name;
          return {
            ...s,
            approvalStatus: 'approved',
            approvedAt: nowStr,
            approvedBy: ADMIN_CREDENTIALS.name,
            rejectionReason: undefined,
          };
        }
        return s;
      })
    );
    addNotification(
      'Siswa Berhasil Disetujui',
      `Akun siswa "${targetName || studentId}" telah disetujui oleh Bapak Kepala Sekolah. Siswa kini dapat masuk ke PRABUNET.`,
      'info'
    );
    return {
      success: true,
      message: `Akun siswa "${targetName || studentId}" berhasil disetujui! Siswa kini dapat masuk dan mengakses seluruh materi.`,
    };
  };

  const rejectStudent = (studentId: string, reason = 'Data pendaftaran belum sesuai kriteria verifikasi.') => {
    let targetName = '';
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          targetName = s.name;
          return {
            ...s,
            approvalStatus: 'rejected',
            rejectionReason: reason,
          };
        }
        return s;
      })
    );
    addNotification(
      'Pendaftaran Siswa Ditolak',
      `Pendaftaran akun siswa "${targetName || studentId}" telah ditolak oleh Admin.`,
      'info'
    );
    return {
      success: true,
      message: `Pendaftaran siswa "${targetName || studentId}" telah ditolak.`,
    };
  };

  const approveAllPendingStudents = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let count = 0;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.approvalStatus === 'pending') {
          count++;
          return {
            ...s,
            approvalStatus: 'approved',
            approvedAt: nowStr,
            approvedBy: ADMIN_CREDENTIALS.name,
            rejectionReason: undefined,
          };
        }
        return s;
      })
    );

    if (count > 0) {
      addNotification(
        'Semua Siswa Disetujui',
        `Sebanyak ${count} siswa baru yang pending berhasil disetujui serentak oleh Bapak Kepala Sekolah.`,
        'info'
      );
      return {
        success: true,
        count,
        message: `Berhasil menyetujui ${count} akun siswa sekaligus! Seluruh siswa tersebut kini dapat masuk ke PRABUNET.`,
      };
    }
    return {
      success: false,
      count: 0,
      message: 'Tidak ada akun siswa yang sedang berstatus menunggu persetujuan (pending).',
    };
  };

  const deleteStudent = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    addNotification(
      'Data Siswa Dihapus',
      `Data akun siswa "${target?.name || studentId}" telah dihapus oleh Admin.`,
      'info'
    );
    return { success: true, message: `Data siswa "${target?.name || studentId}" berhasil dihapus.` };
  };

  const updateStudent = (studentId: string, updated: Partial<User>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...updated } : s))
    );
    addNotification('Data Siswa Diperbarui', `Informasi siswa telah diperbarui oleh Admin.`, 'info');
    return { success: true, message: 'Data siswa berhasil diperbarui.' };
  };

  // Teacher Management by Admin / Kepala Sekolah
  const addTeacher = (teacher: TeacherAccount) => {
    const cleanEmail = teacher.email.trim().toLowerCase();
    if (teachers.some((t) => t.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Guru dengan email tersebut sudah ada di daftar.' };
    }
    const nextNo = teachers.length > 0 ? Math.max(...teachers.map((t) => t.no)) + 1 : 1;
    const newTeacherObj: TeacherAccount = {
      ...teacher,
      no: teacher.no || nextNo,
      customPassword: teacher.customPassword || DEFAULT_TEACHER_PASSWORD,
    };
    setTeachers((prev) => [...prev, newTeacherObj]);
    addNotification('Guru Baru Ditambahkan', `${newTeacherObj.name} berhasil didaftarkan ke Dewan Guru.`, 'info');
    return { success: true, message: `Guru ${newTeacherObj.name} berhasil ditambahkan.` };
  };

  const updateTeacher = (teacherEmail: string, updated: Partial<TeacherAccount>) => {
    setTeachers((prev) =>
      prev.map((t) => (t.email.toLowerCase() === teacherEmail.toLowerCase() ? { ...t, ...updated } : t))
    );
    addNotification('Data Guru Diperbarui', `Informasi untuk guru ${teacherEmail} telah diperbarui.`, 'info');
    return { success: true, message: 'Data guru berhasil diperbarui.' };
  };

  const deleteTeacher = (teacherEmail: string) => {
    const target = teachers.find((t) => t.email.toLowerCase() === teacherEmail.toLowerCase());
    setTeachers((prev) => prev.filter((t) => t.email.toLowerCase() !== teacherEmail.toLowerCase()));
    addNotification('Guru Dihapus', `Data guru ${target?.name || teacherEmail} telah dihapus dari sistem.`, 'info');
    return { success: true, message: `Guru ${target?.name || teacherEmail} berhasil dihapus.` };
  };

  // Update user profile (e.g. avatar photo, phone, name)
  const updateUserProfile = (updated: Partial<User>) => {
    if (!currentUser) return { success: false, message: 'Sesi login tidak aktif.' };

    const updatedUser = { ...currentUser, ...updated };
    setCurrentUser(updatedUser);

    // If teacher, update in teachers list too
    if (currentUser.role === 'guru') {
      setTeachers((prev) =>
        prev.map((t) =>
          t.email.toLowerCase() === currentUser.email.toLowerCase()
            ? { ...t, avatar: updated.avatar || t.avatar, name: updated.name || t.name, phone: updated.phone || t.phone }
            : t
        )
      );
    } else if (currentUser.role === 'murid') {
      setStudents((prev) =>
        prev.map((s) => (s.id === currentUser.id ? { ...s, ...updated } : s))
      );
    }

    addNotification('Profil Diperbarui', 'Foto dan informasi profil Anda berhasil disimpan.', 'info');
    return { success: true, message: 'Profil berhasil diperbarui!' };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setSelectedSubject(null);
    setActiveExam(null);
    setActiveExamAttempt(null);
    setActiveTab('home');
  };

  // Change Password
  const changePassword = (oldPass: string, newPass: string) => {
    if (!currentUser) return { success: false, message: 'Sesi login tidak ditemukan.' };
    if (!newPass || newPass.length < 5) {
      return { success: false, message: 'Kata sandi baru minimal harus 5 karakter.' };
    }

    if (currentUser.role === 'admin') {
      if (oldPass !== ADMIN_CREDENTIALS.password) {
        return { success: false, message: 'Kata sandi lama Kepala Sekolah salah.' };
      }
      ADMIN_CREDENTIALS.password = newPass;
      return { success: true, message: 'Kata sandi Kepala Sekolah berhasil diubah!' };
    }

    if (currentUser.role === 'guru') {
      const teacherIndex = teachers.findIndex((t) => t.email.toLowerCase() === currentUser.email.toLowerCase());
      if (teacherIndex === -1) return { success: false, message: 'Data guru tidak ditemukan.' };

      const currentTeacher = teachers[teacherIndex];
      const actualOld = currentTeacher.customPassword || DEFAULT_TEACHER_PASSWORD;

      if (oldPass !== actualOld) {
        return { success: false, message: 'Kata sandi lama tidak sesuai.' };
      }

      const updatedTeachers = [...teachers];
      updatedTeachers[teacherIndex] = {
        ...currentTeacher,
        customPassword: newPass,
      };
      setTeachers(updatedTeachers);
      return { success: true, message: 'Kata sandi guru berhasil diubah! Gunakan kata sandi baru untuk login berikutnya.' };
    }

    return { success: true, message: 'Kata sandi berhasil diperbarui.' };
  };

  // Forgot Password flow
  const requestPasswordReset = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isTeacher = teachers.some((t) => t.email.toLowerCase() === cleanEmail);
    const isStudent = students.some((s) => s.email.toLowerCase() === cleanEmail);
    const isAdmin = cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase();

    if (!isTeacher && !isStudent && !isAdmin) {
      return {
        success: false,
        message: 'Email tidak terdaftar di direktori SMK Purnama Bakti.',
      };
    }

    const simulatedToken = Math.floor(100000 + Math.random() * 900000).toString();
    addNotification(
      'Kode Verifikasi Reset Sandi',
      `Kode verifikasi reset sandi Anda untuk ${cleanEmail} adalah [${simulatedToken}]. Jangan bagikan ke siapapun.`,
      'info'
    );

    return {
      success: true,
      message: `Tautan & kode verifikasi reset sandi berhasil dikirim ke alamat email resmi: ${cleanEmail}. Periksa notifikasi PRABUNET.`,
      simulatedToken,
    };
  };

  const resetPasswordWithToken = (email: string, token: string, newPass: string) => {
    if (!token || token.length < 4) {
      return { success: false, message: 'Kode verifikasi tidak valid.' };
    }
    if (!newPass || newPass.length < 5) {
      return { success: false, message: 'Kata sandi baru minimal 5 karakter.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const teacherIndex = teachers.findIndex((t) => t.email.toLowerCase() === cleanEmail);

    if (teacherIndex !== -1) {
      const updated = [...teachers];
      updated[teacherIndex] = {
        ...updated[teacherIndex],
        customPassword: newPass,
      };
      setTeachers(updated);
      return { success: true, message: 'Kata sandi berhasil direset! Silakan login dengan password baru.' };
    }

    return { success: true, message: 'Kata sandi akun berhasil diperbarui.' };
  };

  // Get or generate 30 meetings for subject
  const getMeetingsForSubject = (subjectId: string): MeetingModule[] => {
    if (subjectMeetings[subjectId] && subjectMeetings[subjectId].length === 30) {
      return subjectMeetings[subjectId];
    }
    const subj = subjects.find((s) => s.id === subjectId);
    if (!subj) return [];
    const generated = generate30MeetingsForSubject(subj);
    setSubjectMeetings((prev) => ({ ...prev, [subjectId]: generated }));
    return generated;
  };

  const updateMeetingModule = (subjectId: string, meetingNumber: number, updated: Partial<MeetingModule>) => {
    setSubjectMeetings((prev) => {
      const currentList = prev[subjectId] || [];
      const updatedList = currentList.map((m) =>
        m.meetingNumber === meetingNumber ? { ...m, ...updated } : m
      );
      return { ...prev, [subjectId]: updatedList };
    });
  };

  // Exam Management
  const addExam = (exam: Exam) => {
    setExams((prev) => [exam, ...prev]);
    addNotification('Ujian Baru Dibuat', `Ujian "${exam.title}" untuk kelas ${exam.targetClasses ? exam.targetClasses.join(', ') : 'Semua'} telah dipublikasikan.`, 'exam');
  };

  const updateExam = (examId: string, updated: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === examId ? { ...e, ...updated } : e)));
  };

  const deleteExam = (examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
  };

  const submitExamAttempt = (attempt: ExamAttempt) => {
    setExamAttempts((prev) => [attempt, ...prev.filter((a) => a.id !== attempt.id)]);
    addNotification(
      'Ujian CBT Selesai',
      `Nilai untuk ${attempt.studentName} pada "${attempt.examTitle}": ${attempt.totalScore} / ${attempt.maxScore}`,
      'grade'
    );
  };

  const gradeExamEssay = (attemptId: string, questionId: string, score: number, feedback?: string) => {
    setExamAttempts((prev) =>
      prev.map((att) => {
        if (att.id !== attemptId) return att;
        const currentAns = att.answers[questionId];
        if (!currentAns) return att;

        const updatedAnswers = {
          ...att.answers,
          [questionId]: {
            ...currentAns,
            manualScore: score,
            teacherFeedback: feedback || currentAns.teacherFeedback,
          },
        };

        let newEssayScore = 0;
        (Object.values(updatedAnswers) as StudentAnswer[]).forEach((ans) => {
          if (ans.manualScore !== undefined) {
            newEssayScore += ans.manualScore;
          }
        });

        const newTotal = att.pgScore + newEssayScore;
        const percentage = Math.round((newTotal / att.maxScore) * 100);

        return {
          ...att,
          answers: updatedAnswers,
          essayScore: newEssayScore,
          totalScore: newTotal,
          percentage,
          isPassed: percentage >= 75,
          status: 'graded',
        };
      })
    );
  };

  // Master Grade editing for Admin / Kepala Sekolah & Guru Pengampu
  const updateStudentGrade = (
    attemptId: string,
    updatedScores: { totalScore?: number; pgScore?: number; essayScore?: number; isPassed?: boolean; notes?: string }
  ) => {
    setExamAttempts((prev) =>
      prev.map((att) => {
        if (att.id !== attemptId) return att;
        const newTotal = updatedScores.totalScore !== undefined ? updatedScores.totalScore : att.totalScore;
        const percentage = Math.round((newTotal / att.maxScore) * 100);
        return {
          ...att,
          totalScore: newTotal,
          pgScore: updatedScores.pgScore !== undefined ? updatedScores.pgScore : att.pgScore,
          essayScore: updatedScores.essayScore !== undefined ? updatedScores.essayScore : att.essayScore,
          isPassed: updatedScores.isPassed !== undefined ? updatedScores.isPassed : percentage >= 75,
          percentage,
          status: 'graded',
        };
      })
    );
    addNotification('Nilai Diperbarui', 'Nilai siswa berhasil diubah dan disimpan.', 'grade');
  };

  // LKPD
  const submitLKPD = (submission: LKPDSubmission) => {
    setLkpdSubmissions((prev) => [submission, ...prev.filter((s) => s.id !== submission.id)]);
    addNotification('LKPD Terkirim', `Tugas LKPD Pertemuan ${submission.meetingNumber} telah dikirim ke guru pengampu.`, 'assignment');
  };

  const gradeLKPD = (submissionId: string, score: number, feedback: string) => {
    setLkpdSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? { ...sub, score, feedback, status: 'graded' }
          : sub
      )
    );
  };

  // Schedule
  const addScheduleItem = (schedule: ScheduleItem) => {
    setSchedules((prev) => [...prev, schedule]);
  };

  const addSchedule = (schedule: ScheduleItem) => {
    addScheduleItem(schedule);
  };

  const updateScheduleItem = (scheduleId: string, updated: Partial<ScheduleItem>) => {
    setSchedules((prev) =>
      prev.map((item) => (item.id === scheduleId ? { ...item, ...updated } : item))
    );
  };

  const deleteScheduleItem = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  // Notifications
  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'info') => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Baru saja',
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const resetAllData = () => {
    localStorage.clear();
    setTeachers(INITIAL_TEACHERS);
    setStudents([]);
    setSchedules(INITIAL_SCHEDULES);
    setExams(INITIAL_EXAMS);
    setSiteSettings(DEFAULT_SETTINGS);
    const initial: Record<string, MeetingModule[]> = {};
    INITIAL_SUBJECTS.forEach((subj) => {
      initial[subj.id] = generate30MeetingsForSubject(subj);
    });
    setSubjectMeetings(initial);
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        siteSettings,
        teachers,
        students,
        subjects,
        schedules,
        exams,
        examAttempts,
        lkpdSubmissions,
        notifications,
        broadcasts,
        cbtUnlockToken,
        activeTab,
        selectedSubject,
        activeExam,
        activeExamAttempt,
        setActiveTab,
        setSelectedSubject,
        setActiveExam,
        updateSiteSettings,
        loginAsAdmin,
        loginAsTeacher,
        loginAsStudent,
        registerStudent,
        logout,
        updateUserProfile,
        changePassword,
        requestPasswordReset,
        resetPasswordWithToken,
        approveStudent,
        rejectStudent,
        approveAllPendingStudents,
        deleteStudent,
        updateStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        getMeetingsForSubject,
        updateMeetingModule,
        addExam,
        updateExam,
        deleteExam,
        submitExamAttempt,
        gradeExamEssay,
        updateStudentGrade,
        submitLKPD,
        gradeLKPD,
        addSchedule,
        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        addNotification,
        markNotificationRead,
        addBroadcast,
        deleteBroadcast,
        setCbtUnlockToken,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
