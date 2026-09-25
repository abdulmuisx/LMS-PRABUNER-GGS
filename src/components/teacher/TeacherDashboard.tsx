import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, MeetingModule, Exam, Question, ScheduleItem, LKPDSubmission, ExamAttempt, StudentAnswer } from '../../types';
import {
  Calendar,
  BookOpen,
  FileCheck2,
  HelpCircle,
  Plus,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle,
  Edit3,
  Award,
  Trash2,
  Eye,
  FileText,
  Send,
  Download,
  AlertCircle,
  Sliders,
  ChevronDown,
  Layers,
  GraduationCap,
  Lock,
  Shield,
  KeyRound,
  Save,
  Phone,
  Camera,
  User as UserIcon,
  Check,
  RotateCcw,
  ShieldCheck,
  Megaphone,
  Radio,
} from 'lucide-react';

export interface TeacherDashboardProps {
  onSelectSubject?: (sbj: Subject) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSelectSubject }) => {
  const {
    currentUser,
    subjects,
    schedules,
    exams,
    examAttempts,
    lkpdSubmissions,
    getMeetingsForSubject,
    updateMeetingModule,
    addExam,
    updateExam,
    deleteExam,
    gradeExamEssay,
    gradeLKPD,
    addScheduleItem,
    deleteScheduleItem,
    setSelectedSubject,
    updateUserProfile,
    changePassword,
    broadcasts,
    addBroadcast,
    deleteBroadcast,
  } = useApp();

  const [activeTeacherView, setActiveTeacherView] = useState<'schedule' | 'curriculum' | 'examBuilder' | 'grading' | 'broadcast' | 'profile'>('schedule');

  // Teacher Broadcast state
  const [teacherBcTitle, setTeacherBcTitle] = useState('');
  const [teacherBcMessage, setTeacherBcMessage] = useState('');
  const [teacherBcTarget, setTeacherBcTarget] = useState<'SEMUA' | 'DKV' | 'TKJ' | 'TBSM'>('SEMUA');
  const [teacherBcPriority, setTeacherBcPriority] = useState<'normal' | 'urgent'>('normal');
  const [bcSuccessToast, setBcSuccessToast] = useState<string | null>(null);

  // Filter subjects taught by this teacher
  const teacherSubjects = subjects.filter(
    (s) => s.teacherEmail.toLowerCase() === currentUser?.email.toLowerCase()
  );
  const currentSubjectList = teacherSubjects.length > 0 ? teacherSubjects : subjects;

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    currentSubjectList[0]?.id || subjects[0]?.id || ''
  );

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || {
    id: 'sbj-dkv-1',
    name: 'Dasar Desain Komunikasi Visual',
    code: 'DKV-X-01',
    jurusan: 'DKV' as const,
    jenjang: 'X' as const,
    teacherName: 'Mr Dr. Abdul Muis, M.M., Gr.',
    teacherEmail: 'abdul_muis@smkpurnamabakti.sch.id',
    targetClasses: ['X DKV 1', 'X DKV 2'],
    icon: 'Palette',
    color: 'indigo',
    totalMeetings: 30,
  };
  const meetings = activeSubject?.id ? getMeetingsForSubject(activeSubject.id) : [];

  // Schedules for this teacher
  const teacherSchedules = schedules.filter(
    (sch) => sch.teacherEmail.toLowerCase() === currentUser?.email.toLowerCase()
  );
  const [selectedDay, setSelectedDay] = useState<'Semua' | 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Semua');

  // Filtered schedules
  const displayedSchedules = (teacherSchedules.length > 0 ? teacherSchedules : schedules).filter(
    (s) => selectedDay === 'Semua' || s.day === selectedDay
  );

  // Search & Filters
  const [meetingSearch, setMeetingSearch] = useState('');
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState<MeetingModule | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<MeetingModule | null>(null);

  // Exam Builder & Question Isolation State
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examScopeFilter, setExamScopeFilter] = useState<'mine' | 'all'>('mine');
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubjectId, setNewExamSubjectId] = useState(activeSubject?.id || '');
  const [newExamTargetClasses, setNewExamTargetClasses] = useState(activeSubject?.targetClasses?.join(', ') || 'X DKV');
  const [newExamDuration, setNewExamDuration] = useState(45);
  const [newExamPassingGrade, setNewExamPassingGrade] = useState(75);
  const [newExamQuestions, setNewExamQuestions] = useState<Question[]>([
    {
      id: `q-${Date.now()}-1`,
      number: 1,
      type: 'pg',
      questionText: 'Jelaskan konsep dasar materi ini...',
      options: [
        { key: 'A', text: 'Pilihan Jawaban A' },
        { key: 'B', text: 'Pilihan Jawaban B' },
        { key: 'C', text: 'Pilihan Jawaban C' },
        { key: 'D', text: 'Pilihan Jawaban D' },
      ],
      correctAnswer: 'A',
      explanation: 'Penjelasan kunci jawaban',
      scoreWeight: 20,
    },
  ]);

  // Exam Ownership helper
  const isExamOwner = (ex: Exam) => {
    if (currentUser?.role === 'admin') return true;
    const emailMatches = ex.teacherEmail?.toLowerCase() === currentUser?.email?.toLowerCase();
    const nameMatches = currentUser?.name && ex.teacherName?.toLowerCase() === currentUser.name.toLowerCase();
    return emailMatches || nameMatches;
  };

  // Exam Grading Modal
  const [gradingAttempt, setGradingAttempt] = useState<ExamAttempt | null>(null);
  const [essayScores, setEssayScores] = useState<Record<string, { score: number; feedback: string }>>({});

  // LKPD Grading Modal
  const [gradingLKPDItem, setGradingLKPDItem] = useState<LKPDSubmission | null>(null);
  const [lkpdScoreInput, setLkpdScoreInput] = useState<number>(85);
  const [lkpdFeedbackInput, setLkpdFeedbackInput] = useState<string>('Pengerjaan sangat baik dan sesuai instruksi.');

  // Teacher Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileTitle, setProfileTitle] = useState(currentUser?.title || 'Guru Pengampu Kejuruan');
  const [profileNip, setProfileNip] = useState(currentUser?.nisn || '19880512 201503 1 002');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '0812-3456-7890');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
  const [profileBio, setProfileBio] = useState('Mendidik dengan hati, membimbing dengan keahlian teknologi terkini di SMK Purnama Bakti.');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Change Password Form State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);

  // Add Schedule Modal
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newSchDay, setNewSchDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Senin');
  const [newSchClass, setNewSchClass] = useState(activeSubject?.targetClasses?.[0] || 'X DKV');
  const [newSchTimeStart, setNewSchTimeStart] = useState('07:30');
  const [newSchTimeEnd, setNewSchTimeEnd] = useState('09:30');
  const [newSchRoom, setNewSchRoom] = useState('Ruang Teori 1.01');
  const [newSchTopic, setNewSchTopic] = useState('Pembahasan Modul Teori & Praktik LKPD');

  // Open Exam Editor
  const handleOpenEditExam = (ex: Exam) => {
    if (!isExamOwner(ex)) {
      alert(`Anda tidak memiliki izin mengedit soal milik ${ex.teacherName}. Hanya guru pengampu yang berhak mengedit butir soal.`);
      return;
    }
    setEditingExamId(ex.id);
    setNewExamTitle(ex.title);
    setNewExamSubjectId(ex.subjectId);
    setNewExamTargetClasses(ex.targetClasses ? ex.targetClasses.join(', ') : '');
    setNewExamDuration(ex.durationMinutes);
    setNewExamPassingGrade(ex.passingGrade);
    setNewExamQuestions(ex.questions && ex.questions.length > 0 ? ex.questions : [
      {
        id: `q-${Date.now()}-1`,
        number: 1,
        type: 'pg',
        questionText: 'Pertanyaan pertama...',
        options: [
          { key: 'A', text: 'Pilihan A' },
          { key: 'B', text: 'Pilihan B' },
          { key: 'C', text: 'Pilihan C' },
          { key: 'D', text: 'Pilihan D' },
        ],
        correctAnswer: 'A',
        explanation: 'Kunci jawaban',
        scoreWeight: 20,
      }
    ]);
    setIsCreatingExam(true);
  };

  // Helper to add question to exam
  const handleAddQuestion = (type: 'pg' | 'essay' | 'true_false') => {
    const nextNum = newExamQuestions.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}-${nextNum}`,
      number: nextNum,
      type,
      questionText: type === 'pg' ? 'Tuliskan pertanyaan pilihan ganda disini...' : type === 'essay' ? 'Tuliskan instruksi pertanyaan esai mendalam...' : 'Tuliskan pernyataan benar atau salah disini...',
      options:
        type === 'pg'
          ? [
              { key: 'A', text: 'Pilihan A' },
              { key: 'B', text: 'Pilihan B' },
              { key: 'C', text: 'Pilihan C' },
              { key: 'D', text: 'Pilihan D' },
            ]
          : type === 'true_false'
          ? [
              { key: 'BENAR', text: 'Benar' },
              { key: 'SALAH', text: 'Salah' },
            ]
          : undefined,
      correctAnswer: type === 'pg' ? 'A' : type === 'true_false' ? 'BENAR' : '',
      explanation: 'Penjelasan rubrik penilaian',
      scoreWeight: 20,
    };
    setNewExamQuestions([...newExamQuestions, newQ]);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    const sbj = subjects.find((s) => s.id === newExamSubjectId) || activeSubject;
    
    if (editingExamId) {
      updateExam(editingExamId, {
        title: newExamTitle,
        subjectId: sbj.id,
        subjectName: sbj.name,
        targetClasses: newExamTargetClasses.split(',').map((c) => c.trim()),
        durationMinutes: Number(newExamDuration),
        passingGrade: Number(newExamPassingGrade),
        totalQuestions: newExamQuestions.length,
        questions: newExamQuestions,
      });
    } else {
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        code: `EXAM-${sbj.jurusan}-${Date.now().toString().slice(-4)}`,
        title: newExamTitle,
        subjectId: sbj.id,
        subjectName: sbj.name,
        teacherEmail: currentUser?.email || sbj.teacherEmail,
        teacherName: currentUser?.name || sbj.teacherName,
        jurusan: sbj.jurusan,
        jenjang: sbj.jenjang,
        targetClasses: newExamTargetClasses.split(',').map((c) => c.trim()),
        durationMinutes: Number(newExamDuration),
        passingGrade: Number(newExamPassingGrade),
        totalQuestions: newExamQuestions.length,
        instructions: [
          'Kerjakan soal secara mandiri dan jujur.',
          'Waktu akan dihitung mundur secara otomatis.',
          'Klik tombol selesai jika telah menyelesaikan semua soal.',
        ],
        isActive: true,
        questions: newExamQuestions,
        createdAt: new Date().toISOString().split('T')[0],
      };
      addExam(newExam);
    }

    setIsCreatingExam(false);
    setEditingExamId(null);
    setNewExamTitle('');
    setNewExamQuestions([]);
  };

  // Profile Save Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName,
      title: profileTitle,
      nisn: profileNip,
      phone: profilePhone,
      avatar: profileAvatar,
    });
    setProfileSuccessMsg('Profil dan data guru Anda berhasil diperbarui di sistem PRABUNET.');
    setTimeout(() => setProfileSuccessMsg(null), 4000);
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg(null);
    setPassSuccessMsg(null);

    if (newPass.length < 5) {
      setPassErrorMsg('Kata sandi baru minimal 5 karakter.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    const res = changePassword(oldPass, newPass);
    if (res.success) {
      setPassSuccessMsg(res.message);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassErrorMsg(res.message);
    }
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newSch: ScheduleItem = {
      id: `sch-${Date.now()}`,
      teacherEmail: currentUser?.email || activeSubject.teacherEmail,
      teacherName: currentUser?.name || activeSubject.teacherName,
      subjectName: activeSubject.name,
      className: newSchClass,
      day: newSchDay,
      timeStart: newSchTimeStart,
      timeEnd: newSchTimeEnd,
      room: newSchRoom,
      topic: newSchTopic,
      meetingNumber: 1,
    };
    addScheduleItem(newSch);
    setIsAddingSchedule(false);
  };

  const handleTeacherSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherBcTitle.trim() || !teacherBcMessage.trim()) return;
    addBroadcast({
      senderRole: 'teacher',
      senderName: currentUser?.name || 'Dewan Guru SMK PB',
      title: teacherBcTitle.trim(),
      message: teacherBcMessage.trim(),
      target: teacherBcTarget,
      priority: teacherBcPriority,
    });
    setTeacherBcTitle('');
    setTeacherBcMessage('');
    setBcSuccessToast('Pengumuman broadcast berhasil disiarkan kepada peserta didik!');
    setTimeout(() => setBcSuccessToast(null), 3500);
  };

  // Scoped Grading Logic: only submissions for subjects/exams taught by this teacher
  const teacherSubjectIds = new Set(teacherSubjects.map((s) => s.id));
  const isSubjectOrExamTaught = (examTitle?: string, subjectName?: string, subjectId?: string) => {
    if (currentUser?.role === 'admin') return true;
    const matchesSubject = teacherSubjects.some(
      (ts) => ts.id === subjectId || ts.name.toLowerCase() === subjectName?.toLowerCase()
    );
    const ex = exams.find((e) => e.title === examTitle);
    const matchesExam = ex ? isExamOwner(ex) : false;
    return matchesSubject || matchesExam;
  };

  const scopedExamAttempts = currentUser?.role === 'admin'
    ? examAttempts
    : examAttempts.filter((att) => isSubjectOrExamTaught(att.examTitle, undefined, undefined));

  const scopedLkpdSubmissions = currentUser?.role === 'admin'
    ? lkpdSubmissions
    : lkpdSubmissions.filter((sub) => isSubjectOrExamTaught(undefined, sub.subjectName, sub.subjectId));

  // Scoped Exams list
  const filteredExams = exams.filter((ex) => {
    if (examScopeFilter === 'mine') {
      return isExamOwner(ex);
    }
    return true;
  });

  return (
    <div id="teacher-dashboard-view" className="space-y-4 pb-20">
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
          <GraduationCap className="w-36 h-36" />
        </div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-medium backdrop-blur-xs mb-1.5 text-blue-100">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Portal Guru SMK Purnama Bakti</span>
            </div>
            <h2 className="text-base font-bold tracking-tight">{currentUser?.name}</h2>
            <p className="text-xs text-blue-100/90 font-mono mt-0.5">{currentUser?.email}</p>
            <p className="text-[11px] text-blue-200 mt-1">
              Guru Tetap SMK PB • {currentUser?.title || 'Dewan Guru'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-6 h-6 text-white" />
            )}
          </div>
        </div>

        {/* Classes Taught Badges */}
        <div className="mt-3 pt-3 border-t border-white/15 flex flex-wrap gap-1.5 items-center text-[11px]">
          <span className="text-blue-200 font-semibold">Mapel & Kelas Diampu:</span>
          {currentSubjectList.slice(0, 3).map((s) => (
            <span key={s.id} className="bg-white/15 px-2 py-0.5 rounded-md text-white font-medium">
              {s.name} ({s.targetClasses.join(', ')})
            </span>
          ))}
          {currentSubjectList.length > 3 && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px] text-white">
              +{currentSubjectList.length - 3} lainnya
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sub-tabs for Teacher */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
        <button
          id="btn-tab-kalender"
          onClick={() => setActiveTeacherView('schedule')}
          className={`py-2 px-0.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
            activeTeacherView === 'schedule'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[9px] leading-tight">Kalender</span>
        </button>
        <button
          id="btn-tab-curriculum"
          onClick={() => setActiveTeacherView('curriculum')}
          className={`py-2 px-0.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
            activeTeacherView === 'curriculum'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="text-[9px] leading-tight">30 Modul</span>
        </button>
        <button
          id="btn-tab-exambuilder"
          onClick={() => setActiveTeacherView('examBuilder')}
          className={`py-2 px-0.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
            activeTeacherView === 'examBuilder'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="text-[9px] leading-tight">Bank Soal</span>
        </button>
        <button
          id="btn-tab-grading"
          onClick={() => setActiveTeacherView('grading')}
          className={`py-2 px-0.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
            activeTeacherView === 'grading'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span className="text-[9px] leading-tight">Koreksi</span>
        </button>
        <button
          id="btn-tab-broadcast"
          onClick={() => setActiveTeacherView('broadcast')}
          className={`py-2 px-0.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
            activeTeacherView === 'broadcast'
              ? 'bg-white text-indigo-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[9px] leading-tight">Broadcast</span>
        </button>
        <button
          id="btn-tab-teacher-profile"
          onClick={() => setActiveTeacherView('profile')}
          className={`py-2 px-0.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all ${
            activeTeacherView === 'profile'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span className="text-[9px] leading-tight">Profil</span>
        </button>
      </div>

      {/* VIEW 1: KALENDER MENGAJAR */}
      {activeTeacherView === 'schedule' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Jadwal & Kalender Ngajar Guru
              </h3>
            </div>
            <button
              id="btn-open-add-schedule"
              onClick={() => setIsAddingSchedule(true)}
              className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal</span>
            </button>
          </div>

          {/* Day Filter Pills */}
          <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none text-xs">
            {(['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule List */}
          <div className="space-y-2">
            {displayedSchedules.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">Tidak ada jadwal mengajar pada hari {selectedDay}.</p>
              </div>
            ) : (
              displayedSchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {sch.day}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        {sch.className}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{sch.timeStart} - {sch.timeEnd}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{sch.subjectName}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{sch.room}</span>
                    </p>
                  </div>

                  {sch.topic && (
                    <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 border border-slate-100 flex items-start gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">Topik Pembelajaran: </span>
                        <span>{sch.topic}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 font-medium">Guru: {sch.teacherName}</span>
                    <button
                      onClick={() => deleteScheduleItem(sch.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: 30 MODUL PERTEMUAN & LKPD */}
      {activeTeacherView === 'curriculum' && (
        <div className="space-y-3">
          {/* Subject Switcher Header */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <label className="block text-xs font-bold text-slate-700">Pilih Mata Pelajaran:</label>
            <div className="relative">
              <select
                id="select-subject-teacher"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 pr-8 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {currentSubjectList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} ({s.jenjang} • {s.jurusan})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
              <span>Target Kelas: <strong>{activeSubject.targetClasses.join(', ')}</strong></span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Lengkap 30 Pertemuan & LKPD
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={meetingSearch}
              onChange={(e) => setMeetingSearch(e.target.value)}
              placeholder="Cari topik atau nomor pertemuan (1-30)..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* 30 Meetings List */}
          <div className="space-y-2">
            {meetings
              .filter(
                (m) =>
                  m.title.toLowerCase().includes(meetingSearch.toLowerCase()) ||
                  m.meetingNumber.toString().includes(meetingSearch) ||
                  m.theme.toLowerCase().includes(meetingSearch.toLowerCase())
              )
              .map((m) => (
                <div
                  key={m.meetingNumber}
                  className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 transition-all shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {m.meetingNumber}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          Pertemuan {m.meetingNumber} • {m.theme}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{m.title}</h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {m.learningObjective}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>LKPD Tersedia</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedMeetingDetail(m)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Buka Modul</span>
                      </button>
                      <button
                        onClick={() => setEditingMeeting(m)}
                        className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW 3: PEMBUAT SOAL & UJIAN CBT */}
      {activeTeacherView === 'examBuilder' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bank Soal & Ujian CBT
              </h3>
            </div>
            {!isCreatingExam && (
              <button
                id="btn-create-new-exam"
                onClick={() => {
                  setIsCreatingExam(true);
                  setNewExamTitle(`Ujian Harian ${activeSubject.name}`);
                  setNewExamSubjectId(activeSubject.id);
                  setNewExamTargetClasses(activeSubject.targetClasses.join(', '));
                  setNewExamQuestions([
                    {
                      id: `q-${Date.now()}-1`,
                      number: 1,
                      type: 'pg',
                      questionText: 'Pertanyaan pilihan ganda butir 1...',
                      options: [
                        { key: 'A', text: 'Opsi Jawaban A' },
                        { key: 'B', text: 'Opsi Jawaban B' },
                        { key: 'C', text: 'Opsi Jawaban C' },
                        { key: 'D', text: 'Opsi Jawaban D' },
                      ],
                      correctAnswer: 'A',
                      explanation: 'Kunci jawaban A karena...',
                      scoreWeight: 20,
                    },
                    {
                      id: `q-${Date.now()}-2`,
                      number: 2,
                      type: 'true_false',
                      questionText: 'Pernyataan benar atau salah butir 2...',
                      options: [
                        { key: 'BENAR', text: 'Benar' },
                        { key: 'SALAH', text: 'Salah' },
                      ],
                      correctAnswer: 'BENAR',
                      explanation: 'Penjelasan status kebenaran',
                      scoreWeight: 20,
                    },
                    {
                      id: `q-${Date.now()}-3`,
                      number: 3,
                      type: 'essay',
                      questionText: 'Pertanyaan esai dan pemecahan masalah butir 3...',
                      correctAnswer: 'Kriteria jawaban lengkap:...',
                      explanation: 'Rubrik penilaian esai',
                      scoreWeight: 20,
                    },
                  ]);
                }}
                className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Ujian Baru</span>
              </button>
            )}
          </div>

          {/* Form Buat Ujian Baru */}
          {isCreatingExam ? (
            <form onSubmit={handleSaveExam} className="p-4 bg-white rounded-2xl border border-blue-300 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>Formulir Buat Ujian CBT PB (STS / SAS) Baru</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingExam(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Ujian / Penilaian:</label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="Contoh: PTS Administrasi Jaringan Semester Ganjil"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                  <select
                    value={newExamSubjectId}
                    onChange={(e) => setNewExamSubjectId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {currentSubjectList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.jenjang})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Kelas:</label>
                  <input
                    type="text"
                    value={newExamTargetClasses}
                    onChange={(e) => setNewExamTargetClasses(e.target.value)}
                    placeholder="XI TKJ A, XI TKJ B"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durasi Pengerjaan (Menit):</label>
                  <input
                    type="number"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(Number(e.target.value))}
                    min={10}
                    max={180}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">KKM / Nilai Kelulusan:</label>
                  <input
                    type="number"
                    value={newExamPassingGrade}
                    onChange={(e) => setNewExamPassingGrade(Number(e.target.value))}
                    min={50}
                    max={100}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Question Creator */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Daftar Butir Soal ({newExamQuestions.length} Soal)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('pg')}
                      className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-2 py-1 rounded-lg"
                    >
                      + Pilihan Ganda
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('true_false')}
                      className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-2 py-1 rounded-lg"
                    >
                      + Benar/Salah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('essay')}
                      className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-2 py-1 rounded-lg"
                    >
                      + Soal Essai
                    </button>
                  </div>
                </div>

                {newExamQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Soal #{idx + 1} ({q.type === 'pg' ? 'Pilihan Ganda' : q.type === 'true_false' ? 'Benar / Salah' : 'Esai'})
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-slate-600">Bobot Nilai:</label>
                        <input
                          type="number"
                          min={1}
                          value={q.scoreWeight === 0 ? '' : q.scoreWeight}
                          placeholder="0"
                          onChange={(e) => {
                            const raw = e.target.value;
                            const val = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                            setNewExamQuestions((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, scoreWeight: val } : item))
                            );
                          }}
                          className="w-16 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewExamQuestions(newExamQuestions.filter((_, i) => i !== idx));
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={q.questionText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewExamQuestions((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, questionText: val } : item))
                        );
                      }}
                      rows={2}
                      placeholder="Ketik teks butir pertanyaan..."
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      required
                    />

                    {/* PG Options */}
                    {q.type === 'pg' && q.options && (
                      <div className="space-y-1.5 pl-2 border-l-2 border-blue-400">
                        <span className="text-[11px] font-semibold text-slate-600 block">Pilihan Jawaban & Kunci:</span>
                        {q.options.map((opt, optIdx) => (
                          <div key={opt.key} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setNewExamQuestions((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, correctAnswer: opt.key } : item
                                  )
                                );
                              }}
                              className={`w-6 h-6 rounded-md text-xs font-bold shrink-0 transition-colors ${
                                q.correctAnswer === opt.key
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {opt.key}
                            </button>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newText = e.target.value;
                                setNewExamQuestions((prev) =>
                                  prev.map((item, i) => {
                                    if (i !== idx || !item.options) return item;
                                    const updatedOpts = [...item.options];
                                    updatedOpts[optIdx] = { ...updatedOpts[optIdx], text: newText };
                                    return { ...item, options: updatedOpts };
                                  })
                                );
                              }}
                              placeholder={`Teks pilihan ${opt.key}`}
                              className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True False */}
                    {q.type === 'true_false' && (
                      <div className="flex items-center gap-3 pl-2 border-l-2 border-amber-400">
                        <span className="text-[11px] font-semibold text-slate-600">Kunci Jawaban:</span>
                        {(['BENAR', 'SALAH'] as const).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setNewExamQuestions((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, correctAnswer: key } : item
                                )
                              );
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              q.correctAnswer === key
                                ? 'bg-amber-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Essay answer guide */}
                    {q.type === 'essay' && (
                      <div className="pl-2 border-l-2 border-indigo-400">
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Rubrik Kunci / Kriteria Jawaban Lengkap (Pedoman Penilaian):
                        </label>
                        <input
                          type="text"
                          value={q.correctAnswer}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewExamQuestions((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, correctAnswer: val } : item))
                            );
                          }}
                          placeholder="Poin penting yang harus ada dalam jawaban siswa..."
                          className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingExam(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Simpan & Publikasikan Ujian
                </button>
              </div>
            </form>
          ) : (
            /* List of existing exams */
            <div className="space-y-3">
              {/* Exam Scope Filter & Security Notice */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/70 p-2.5 rounded-2xl border border-blue-200 text-xs">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Otoritas Bank Soal Guru:</span>
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-blue-200">
                  <button
                    type="button"
                    onClick={() => setExamScopeFilter('mine')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      examScopeFilter === 'mine'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Soal Saya ({exams.filter(isExamOwner).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamScopeFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      examScopeFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua Soal SMK ({exams.length})
                  </button>
                </div>
              </div>

              {filteredExams.length === 0 ? (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
                  <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Belum ada butir soal ujian pada kategori ini.</p>
                  <p className="text-[11px] text-slate-500">
                    Klik tombol "Buat Paket Ujian Baru" di atas untuk menyusun butir soal CBT untuk siswa.
                  </p>
                </div>
              ) : (
                filteredExams.map((ex) => {
                  const isOwner = isExamOwner(ex);
                  return (
                    <div
                      key={ex.id}
                      className={`p-3.5 bg-white rounded-2xl border transition-all shadow-xs flex flex-col gap-2.5 ${
                        isOwner ? 'border-blue-200/80' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                            {ex.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            Aktif CBT
                          </span>
                        </div>
                        {isOwner ? (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3 text-blue-600" />
                            <span>Soal Anda</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-700" />
                            <span>Hanya Baca</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{ex.title}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {ex.subjectName} • Target: {ex.targetClasses ? ex.targetClasses.join(', ') : 'Semua Kelas'}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl text-center text-[10px] font-semibold text-slate-700 border border-slate-100">
                        <div>
                          <span className="text-slate-400 block font-normal text-[9px]">Durasi</span>
                          <span className="font-bold text-slate-900">{ex.durationMinutes} Menit</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-normal text-[9px]">Jumlah Soal</span>
                          <span className="font-bold text-slate-900">{ex.questions?.length || ex.totalQuestions} Butir</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-normal text-[9px]">KKM Kelulusan</span>
                          <span className="font-bold text-blue-700">{ex.passingGrade}</span>
                        </div>
                      </div>

                      <div className="pt-1.5 flex items-center justify-between text-xs border-t border-slate-100">
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[160px]">
                          Guru: {ex.teacherName}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isOwner ? (
                            <>
                              <button
                                id={`btn-edit-exam-${ex.id}`}
                                onClick={() => handleOpenEditExam(ex)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit Soal</span>
                              </button>
                              <button
                                id={`btn-delete-exam-${ex.id}`}
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus paket soal "${ex.title}"?`)) {
                                    deleteExam(ex.id);
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors"
                                title="Hapus Ujian"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Terkunci (Milik Pengampu)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: KOREKSI NILAI & LKPD (Dibatasi Hanya Mapel yang Diampu Guru Tersebut) */}
      {activeTeacherView === 'grading' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Koreksi Ujian & Penilaian LKPD
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
              Hak Pengampu
            </span>
          </div>

          {/* Privacy & Scope Banner */}
          <div className="p-2.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-start gap-2 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Akses Nilai Siswa Terlindungi:</span>
              <p className="text-[11px] text-blue-800/90 leading-tight mt-0.5">
                Hanya menampilkan data pengerjaan ujian dan pengumpulan LKPD untuk mata pelajaran yang Anda ampu (
                {currentSubjectList.map((s) => s.name).join(', ')}).
              </p>
            </div>
          </div>

          {/* Section 1: Exam Submissions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Hasil Pengerjaan Ujian CBT Siswa</span>
            </h4>

            {scopedExamAttempts.length === 0 ? (
              <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                <FileCheck2 className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">Belum ada data pengerjaan ujian masuk untuk mapel Anda.</p>
                <p className="text-[11px] text-slate-400">Nilai akan otomatis terdata saat siswa menyelesaikan CBT.</p>
              </div>
            ) : (
              scopedExamAttempts.map((att) => (
                <div
                  key={att.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{att.studentName}</h5>
                      <p className="text-[10px] text-slate-500">
                        {att.studentClass} • {att.studentEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        Nilai: {att.totalScore} / {att.maxScore}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-700 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {att.examTitle}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      att.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {att.isPassed ? '✓ Lulus KKM' : '⚠ Perlu Remedial'}
                    </span>

                    <button
                      id={`btn-grade-essay-${att.id}`}
                      onClick={() => setGradingAttempt(att)}
                      className="text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Koreksi Esai & Feedback</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section 2: LKPD Submissions */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Pengumpulan Lembar Kerja Peserta Didik (LKPD)</span>
            </h4>

            {scopedLkpdSubmissions.length === 0 ? (
              <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">Belum ada pengumpulan LKPD masuk untuk mapel Anda.</p>
              </div>
            ) : (
              scopedLkpdSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{sub.studentName}</h5>
                      <p className="text-[10px] text-slate-500">
                        {sub.studentClass} • Pertemuan {sub.meetingNumber} ({sub.subjectName})
                      </p>
                    </div>
                    {sub.score !== undefined ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Skor: {sub.score}/100
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Menunggu Penilaian
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    "{sub.content}"
                  </p>

                  {sub.fileName && (
                    <div className="text-[10px] text-blue-700 font-mono flex items-center gap-1 bg-blue-50/60 p-1.5 rounded-lg">
                      <Download className="w-3 h-3" />
                      <span>{sub.fileName}</span>
                    </div>
                  )}

                  {sub.feedback && (
                    <div className="text-[10px] text-emerald-800 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                      <strong>Catatan / Umpan Balik Guru: </strong> {sub.feedback}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setGradingLKPDItem(sub);
                        setLkpdScoreInput(sub.score || 85);
                        setLkpdFeedbackInput(sub.feedback || 'Pengerjaan tugas sangat baik dan tuntas.');
                      }}
                      className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>{sub.score ? 'Ubah Nilai & Feedback' : 'Beri Nilai & Feedback'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: EDIT PROFIL & DATA GURU */}
      {activeTeacherView === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Manajemen Profil & Akun Guru
            </h3>
          </div>

          {/* Success Banner */}
          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Profile Edit Card */}
          <form
            onSubmit={handleSaveProfile}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Biodata & Data Pendidik</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">ID: {currentUser?.id}</span>
            </div>

            {/* Avatar Preview & Quick Select */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Foto Profil Guru:</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="URL Foto (https://...)"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setProfileAvatar(
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        )
                      }
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                    >
                      Avatar 1
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileAvatar(
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                        )
                      }
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                    >
                      Avatar 2
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileAvatar('')}
                      className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan / Gelar Profesi:</label>
                <input
                  type="text"
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP / NUPTK:</label>
                <input
                  type="text"
                  value={profileNip}
                  onChange={(e) => setProfileNip(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / Telepon:</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Motto Mengajar / Catatan Pendidik:</label>
              <textarea
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                rows={2}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>

          {/* Change Password Card */}
          <form
            onSubmit={handleChangePassword}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Ubah Kata Sandi Akun</span>
              </h4>
              <span className="text-[10px] text-slate-400">Keamanan Login</span>
            </div>

            {passSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs">
                {passSuccessMsg}
              </div>
            )}
            {passErrorMsg && (
              <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs">
                {passErrorMsg}
              </div>
            )}

            <div className="space-y-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Lama:</label>
                <input
                  type="password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="Masukkan sandi lama..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru:</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Minimal 5 karakter..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru:</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Ulangi kata sandi baru..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Perbarui Kata Sandi</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: BROADCAST GURU KE SISWA */}
      {activeTeacherView === 'broadcast' && (
        <div className="space-y-4">
          {bcSuccessToast && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bcSuccessToast}</span>
            </div>
          )}

          {/* Form Kirim Broadcast */}
          <form
            onSubmit={handleTeacherSendBroadcast}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3.5 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Kirim Broadcast / Pengumuman Guru</h3>
                  <p className="text-[11px] text-slate-500">Pesan instruksi tugas, materi, atau jadwal ke siswa</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Siaran:</label>
                <input
                  type="text"
                  value={teacherBcTitle}
                  onChange={(e) => setTeacherBcTitle(e.target.value)}
                  placeholder="Contoh: Pengumpulan LKPD Pertemuan 3 batas jam 17:00"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Siswa:</label>
                  <select
                    value={teacherBcTarget}
                    onChange={(e) => setTeacherBcTarget(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                  >
                    <option value="SEMUA">Semua Jurusan</option>
                    <option value="DKV">Khusus DKV</option>
                    <option value="TKJ">Khusus TKJ</option>
                    <option value="TBSM">Khusus TBSM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioritas:</label>
                  <select
                    value={teacherBcPriority}
                    onChange={(e) => setTeacherBcPriority(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                  >
                    <option value="normal">🔵 Info Penting</option>
                    <option value="urgent">🔴 Mendesak</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Isi Pesan Siaran Guru:</label>
              <textarea
                rows={3}
                value={teacherBcMessage}
                onChange={(e) => setTeacherBcMessage(e.target.value)}
                placeholder="Tuliskan petunjuk, pengingat tugas, atau informasi penting untuk siswa didik..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Broadcast Sekarang</span>
            </button>
          </form>

          {/* Daftar Broadcast Aktif */}
          <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-indigo-600" />
                <span>Semua Siaran Broadcast Aktif ({broadcasts.length})</span>
              </h4>
            </div>

            {broadcasts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">Belum ada pengumuman broadcast.</p>
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
                          {bc.priority === 'urgent' ? '🔴 Mendesak' : '🔵 Info'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
                          {bc.target === 'SEMUA' ? 'Semua Jurusan' : `Jurusan ${bc.target}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(bc.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900">{bc.title}</h5>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{bc.message}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Pengirim: {bc.senderName}</p>
                    </div>
                    {bc.senderName === currentUser?.name && (
                      <button
                        type="button"
                        onClick={() => deleteBroadcast(bc.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 transition-colors"
                        title="Hapus Broadcast"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DETAIL MODUL PERTEMUAN */}
      {selectedMeetingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[88vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Modul Pembelajaran SMK Purnama Bakti
                </span>
                <h3 className="text-sm font-bold">
                  Pertemuan {selectedMeetingDetail.meetingNumber}: {selectedMeetingDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMeetingDetail(null)}
                className="text-white/80 hover:text-white p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  Capaian & Tujuan Pembelajaran:
                </h4>
                <p className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl leading-relaxed text-slate-800">
                  {selectedMeetingDetail.learningObjective}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Ringkasan Teori & Materi Ajar:
                </h4>
                <p className="whitespace-pre-line leading-relaxed p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {selectedMeetingDetail.theorySummary}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-xs">Uraian Modul Mendalam:</h4>
                <div className="p-3 bg-white border border-slate-200 rounded-xl whitespace-pre-line leading-relaxed text-slate-800">
                  {selectedMeetingDetail.detailedContent}
                </div>
              </div>

              {/* LKPD section in modal */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1 text-xs">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  {selectedMeetingDetail.lkpd.title}
                </h4>
                <p className="text-[11px] text-emerald-900">{selectedMeetingDetail.lkpd.description}</p>
                <div className="text-[11px] text-emerald-950 space-y-1">
                  <span className="font-bold">Instruksi Pengerjaan LKPD:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {selectedMeetingDetail.lkpd.instructions.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedMeetingDetail(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MODUL */}
      {editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold">Edit Modul Pertemuan {editingMeeting.meetingNumber}</h3>
              <button onClick={() => setEditingMeeting(null)} className="text-white font-bold text-sm">
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Topik Pertemuan:</label>
                <input
                  type="text"
                  value={editingMeeting.title}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, title: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tujuan Pembelajaran:</label>
                <textarea
                  value={editingMeeting.learningObjective}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, learningObjective: e.target.value })}
                  rows={3}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ringkasan Teori:</label>
                <textarea
                  value={editingMeeting.theorySummary}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, theorySummary: e.target.value })}
                  rows={4}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMeeting(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  updateMeetingModule(activeSubject.id, editingMeeting.meetingNumber, editingMeeting);
                  setEditingMeeting(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH JADWAL */}
      {isAddingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Tambah Jadwal Kalender Ngajar</span>
              </h3>
              <button onClick={() => setIsAddingSchedule(false)} className="text-white font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hari:</label>
                <select
                  value={newSchDay}
                  onChange={(e) => setNewSchDay(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800"
                >
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kelas Sasaran:</label>
                <input
                  type="text"
                  value={newSchClass}
                  onChange={(e) => setNewSchClass(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Mulai:</label>
                  <input
                    type="time"
                    value={newSchTimeStart}
                    onChange={(e) => setNewSchTimeStart(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Selesai:</label>
                  <input
                    type="time"
                    value={newSchTimeEnd}
                    onChange={(e) => setNewSchTimeEnd(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ruangan / Lab / Bengkel:</label>
                <input
                  type="text"
                  value={newSchRoom}
                  onChange={(e) => setNewSchRoom(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Topik Rencana Mengajar:</label>
                <input
                  type="text"
                  value={newSchTopic}
                  onChange={(e) => setNewSchTopic(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSchedule(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KOREKSI ESAI UJIAN */}
      {gradingAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-800 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold">Koreksi Lembar Jawaban Siswa</h3>
                <p className="text-[10px] text-blue-200">
                  {gradingAttempt.studentName} ({gradingAttempt.studentClass})
                </p>
              </div>
              <button onClick={() => setGradingAttempt(null)} className="text-white font-bold text-sm">
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-800 font-semibold block">Skor Pilihan Ganda (Auto):</span>
                  <span className="font-bold text-sm text-blue-900">{gradingAttempt.pgScore} Poin</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-800 font-semibold block">Total Skor Akhir:</span>
                  <span className="font-bold text-sm text-emerald-700">
                    {gradingAttempt.totalScore} / {gradingAttempt.maxScore}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-slate-800">Daftar Jawaban Esai:</h4>

              {(Object.entries(gradingAttempt.answers) as [string, StudentAnswer][])
                .filter(([_, ans]) => ans.answer && ans.answer.length > 5)
                .map(([qId, ans], idx) => (
                  <div key={qId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 text-xs block">Soal Esai #{idx + 1}:</span>
                    <p className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-800">
                      <strong>Jawaban Siswa: </strong>"{ans.answer}"
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Input Skor Guru:</label>
                        <input
                          type="number"
                          defaultValue={ans.manualScore || 15}
                          id={`score-input-${qId}`}
                          className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Catatan / Feedback:</label>
                        <input
                          type="text"
                          defaultValue={ans.teacherFeedback || 'Jawaban relevan.'}
                          id={`feedback-input-${qId}`}
                          className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const scoreEl = document.getElementById(`score-input-${qId}`) as HTMLInputElement;
                        const feedbackEl = document.getElementById(`feedback-input-${qId}`) as HTMLInputElement;
                        const scoreVal = Number(scoreEl?.value || 0);
                        const feedbackVal = feedbackEl?.value || '';
                        gradeExamEssay(gradingAttempt.id, qId, scoreVal, feedbackVal);
                      }}
                      className="w-full py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                    >
                      Simpan Skor Butir Ini
                    </button>
                  </div>
                ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setGradingAttempt(null)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Selesai Koreksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KOREKSI LKPD */}
      {gradingLKPDItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold">Penilaian LKPD Siswa</h3>
              <button onClick={() => setGradingLKPDItem(null)} className="text-white font-bold text-sm">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Siswa & Kelas:</span>
                <span className="font-bold text-slate-900">
                  {gradingLKPDItem.studentName} ({gradingLKPDItem.studentClass})
                </span>
                <p className="text-[11px] text-blue-700">
                  Pertemuan {gradingLKPDItem.meetingNumber} - {gradingLKPDItem.subjectName}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 block mb-1">Teks Laporan Siswa:</span>
                <p className="text-slate-800 leading-relaxed">{gradingLKPDItem.content}</p>
                {gradingLKPDItem.fileName && (
                  <div className="mt-2 text-blue-700 font-mono text-[11px] flex items-center gap-1 font-semibold">
                    <Download className="w-3 h-3" />
                    <span>{gradingLKPDItem.fileName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai LKPD (0 - 100):</label>
                <input
                  type="number"
                  value={lkpdScoreInput}
                  onChange={(e) => setLkpdScoreInput(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full text-sm font-bold text-blue-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Umpan Balik / Catatan Guru:</label>
                <textarea
                  value={lkpdFeedbackInput}
                  onChange={(e) => setLkpdFeedbackInput(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradingLKPDItem(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    gradeLKPD(gradingLKPDItem.id, lkpdScoreInput, lkpdFeedbackInput);
                    setGradingLKPDItem(null);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Nilai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
