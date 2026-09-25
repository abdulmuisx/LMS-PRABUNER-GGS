export type Role = 'guru' | 'murid' | 'admin';

export type ThemeColor = 'blue' | 'emerald' | 'indigo' | 'purple' | 'rose' | 'amber' | 'darkGold';

export interface SiteSettings {
  logoUrl: string;
  siteName: string;
  schoolName: string;
  tagline: string;
  themeColor: ThemeColor;
  cbtRedirectUrl?: string; // e.g. "http://192.168.1.7/ujian" or "192.168.1.7/ujian"
  cbtMode?: 'redirect' | 'internal'; // 'redirect' (external/local IP) or 'internal' (Firestore)
  cbtAutoRedirect?: boolean;
  secretAdminPassword?: string; // Hidden master password for Kepsek/Admin
}

export type Jurusan = 'DKV' | 'TKJ' | 'TBSM' | 'SEMUA';
export type Jenjang = 'X' | 'XI' | 'XII' | 'SEMUA';
export type ExamCategory = 'STS' | 'SAS' | 'HARIAN' | 'CBT_PB';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  // Specific for teacher
  title?: string;
  subjectsTaught?: string[]; // Subject IDs or Names
  classesTaught?: string[]; // e.g. ["XI TKJ A", "XI DKV"]
  // Specific for student
  jurusan?: 'DKV' | 'TKJ' | 'TBSM';
  kelas?: 'X' | 'XI' | 'XII';
  rombel?: string; // e.g. "X DKV", "XI TKJ A", "XII TBSM"
  academicYear?: string;
  nisn?: string;
  approvalStatus?: ApprovalStatus;
  registeredAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  password?: string;
}

export interface TeacherAccount {
  no: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  nip?: string;
  subjects: {
    name: string;
    classes: string;
  }[];
  customPassword?: string;
}

export interface LKPDTask {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  submissionType: 'text' | 'file' | 'both';
  maxScore: number;
  dueDate?: string;
}

export interface MeetingModule {
  meetingNumber: number; // 1 to 30
  title: string;
  theme: string;
  learningObjective: string;
  theorySummary: string;
  detailedContent: string;
  keyTerms: string[];
  referenceResources?: {
    type: 'video' | 'article' | 'doc';
    title: string;
    url: string;
  }[];
  lkpd: LKPDTask;
  isCompleted?: boolean;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  jurusan: Jurusan;
  jenjang: Jenjang;
  teacherEmail: string;
  teacherName: string;
  targetClasses: string[];
  category: 'Umum' | 'Kejuruan' | 'Pilihan / Mulok';
  icon: string; // Lucide icon name
  color: string;
  description: string;
  totalMeetings: number; // strictly 30
}

export interface ScheduleItem {
  id: string;
  teacherEmail: string;
  teacherName: string;
  subjectId?: string;
  subjectName: string;
  className?: string;
  classGroup?: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | string;
  timeStart?: string;
  startTime?: string;
  timeEnd?: string;
  endTime?: string;
  room: string;
  meetingNumber?: number;
  topic?: string;
}

export type QuestionType = 'pg' | 'essay' | 'true_false';

export interface QuestionOption {
  key: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface Question {
  id: string;
  number?: number;
  type: QuestionType;
  questionText: string;
  image?: string;
  options?: QuestionOption[];
  correctAnswer: string; // 'A', 'B', 'C', 'D', 'E' or 'BENAR' / 'SALAH' or sample answer text for essay
  explanation?: string;
  scoreWeight: number;
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  category?: ExamCategory; // 'STS' | 'SAS' | 'HARIAN' | 'CBT_PB'
  subjectId: string;
  subjectName: string;
  teacherEmail?: string;
  teacherId?: string;
  teacherName: string;
  jurusan?: Jurusan;
  targetJurusan?: string;
  jenjang?: Jenjang;
  targetJenjang?: string;
  targetClasses?: string[];
  durationMinutes: number;
  passingGrade: number; // KKM e.g. 75
  totalQuestions?: number;
  instructions?: string[];
  isActive?: boolean;
  isPublished?: boolean;
  questions: Question[];
  createdAt: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: string;
  isDoubt: boolean;
  isCorrect?: boolean;
  autoScore?: number;
  manualScore?: number;
  teacherFeedback?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentEmail?: string;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  answers: Record<string, StudentAnswer>;
  pgScore: number;
  essayScore: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  status: 'ongoing' | 'submitted' | 'graded';
  tabViolationsCount?: number;
}

export interface BroadcastMessage {
  id: string;
  senderName: string;
  senderRole: 'admin' | 'guru' | 'teacher';
  title: string;
  message: string;
  target: 'SEMUA' | 'DKV' | 'TKJ' | 'TBSM';
  priority: 'normal' | 'urgent';
  createdAt: string;
}

export interface LKPDSubmission {
  id: string;
  subjectId: string;
  subjectName: string;
  meetingNumber: number;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNisn?: string;
  studentEmail?: string;
  content: string;
  fileName?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'exam' | 'assignment' | 'grade';
}
