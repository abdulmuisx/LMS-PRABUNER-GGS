import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, ExamAttempt, Question, StudentAnswer } from '../../types';
import { CbtUnbkSimulator } from './CbtUnbkSimulator';
import { FirestoreExamRunner } from './FirestoreExamRunner';
import {
  HelpCircle,
  Plus,
  Play,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Sparkles,
  BarChart3,
  Search,
  Eye,
  Trash2,
  Filter,
  Lock,
  LogIn,
  Shield,
  Crown,
  Database,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

export const ExamHubView: React.FC = () => {
  const { currentUser, exams, examAttempts, addExam, deleteExam, subjects, gradeExamEssay } = useApp();

  const [activeTakingExam, setActiveTakingExam] = useState<Exam | null>(null);
  const [selectedSubTab, setSelectedSubTab] = useState<'available' | 'history' | 'manage'>('available');
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [inspectAttempt, setInspectAttempt] = useState<ExamAttempt | null>(null);
  const [manualEssayGradeMap, setManualEssayGradeMap] = useState<Record<string, number>>({});
  const [essayFeedback, setEssayFeedback] = useState<string>('Jawaban esai telah diperiksa dan dinilai oleh guru.');
  const [isTakingFirestoreExam, setIsTakingFirestoreExam] = useState<boolean>(false);

  // Auth Modal State for locked view
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'teacher' | 'student' | 'register'>('student');

  // If taking Firestore Exam
  if (isTakingFirestoreExam) {
    return <FirestoreExamRunner onExit={() => setIsTakingFirestoreExam(false)} />;
  }

  // If student is not logged in, render locked screen
  if (!currentUser) {
    return (
      <div id="cbt-pb-locked-view" className="space-y-4 pb-20 animate-in fade-in">
        {/* CBT Locked Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 rounded-3xl p-6 text-white text-center shadow-xl border border-amber-900/50 relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 text-amber-400 mx-auto flex items-center justify-center mb-3.5 shadow-inner">
            <Lock className="w-8 h-8 animate-pulse text-amber-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-[11px] font-bold backdrop-blur-xs text-amber-200 mb-2 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>CBT UNBK Simulator • SMK Purnama Bakti</span>
          </div>

          <h2 className="text-lg font-black text-white tracking-tight mb-2">
            Portal Ujian CBT PB Terkunci
          </h2>

          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed mb-6">
            Simulasi Ujian CBT UNBK, Sumatif Tengah Semester (STS), Sumatif Akhir Semester (SAS), serta riwayat nilai hanya dapat diakses oleh Siswa dan Dewan Guru SMK Purnama Bakti yang telah masuk (login).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-sm mx-auto">
            <button
              onClick={() => {
                setAuthMode('student');
                setIsAuthOpen(true);
              }}
              className="py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Ikuti Ujian (Siswa)</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('teacher');
                setIsAuthOpen(true);
              }}
              className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Shield className="w-4 h-4 text-amber-300" />
              <span>Masuk Kelola Soal (Guru)</span>
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

        {/* Feature Highlights (CBT Info) */}
        <div className="p-4 bg-slate-100 rounded-3xl border border-slate-200 text-center space-y-1.5">
          <HelpCircle className="w-6 h-6 text-amber-600 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">Fitur CBT Anti-Curang & Timer Otomatis</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            Dilengkapi deteksi blur/keluar layar, acak opsi jawaban, koreksi instan nilai PG & B/S, serta penilaian esai terpadu.
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

  // New Exam Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newDuration, setNewDuration] = useState(45);
  const [newPassingGrade, setNewPassingGrade] = useState(75);
  const [newQuestions, setNewQuestions] = useState<Question[]>([
    {
      id: `q-init-1`,
      type: 'pg',
      questionText: 'Apa fungsi utama dari software desain grafis berbasis vektor?',
      options: [
        { key: 'A', text: 'Mengolah foto raster beresolusi tetap' },
        { key: 'B', text: 'Membuat grafis berbasis garis dan kurva matematis tanpa pecah saat diperbesar' },
        { key: 'C', text: 'Melakukan video editing multi-track' },
        { key: 'D', text: 'Membuat animasi 3D frame-by-frame' },
      ],
      correctAnswer: 'B',
      scoreWeight: 20,
      explanation: 'Grafis vektor menggunakan formula matematika sehingga scalable tanpa kehilangan ketajaman.',
    },
    {
      id: `q-init-2`,
      type: 'true_false',
      questionText: 'Resolusi 300 DPI adalah standar minimal untuk materi cetak offset profesional.',
      correctAnswer: 'BENAR',
      scoreWeight: 20,
      explanation: '300 DPI adalah standar industri percetakan.',
    },
    {
      id: `q-init-3`,
      type: 'essay',
      questionText: 'Jelaskan perbedaan antara model warna RGB dan CMYK beserta peruntukan medianya!',
      correctAnswer: 'RGB untuk media digital/layar monitor (aditif), sedangkan CMYK untuk media cetak/tinta fisik (subtraktif).',
      scoreWeight: 60,
      explanation: 'RGB (Red Green Blue) dan CMYK (Cyan Magenta Yellow Key/Black).',
    },
  ]);

  // If student is currently taking an exam, render the full CBT Simulator!
  if (activeTakingExam) {
    return <CbtUnbkSimulator exam={activeTakingExam} onExit={() => setActiveTakingExam(null)} />;
  }

  // Student specific attempts
  const myAttempts = examAttempts.filter(
    (att) => att.studentId === currentUser?.id || att.studentEmail === currentUser?.email
  );

  const handleAddQuestionToNewExam = (type: 'pg' | 'essay' | 'true_false') => {
    const qCount = newQuestions.length + 1;
    if (type === 'pg') {
      setNewQuestions([
        ...newQuestions,
        {
          id: `q-new-${Date.now()}-${qCount}`,
          type: 'pg',
          questionText: `Pertanyaan Pilihan Ganda #${qCount}: Jelaskan konsep...`,
          options: [
            { key: 'A', text: 'Pilihan Jawaban A' },
            { key: 'B', text: 'Pilihan Jawaban B' },
            { key: 'C', text: 'Pilihan Jawaban C' },
            { key: 'D', text: 'Pilihan Jawaban D' },
          ],
          correctAnswer: 'A',
          scoreWeight: 20,
        },
      ]);
    } else if (type === 'true_false') {
      setNewQuestions([
        ...newQuestions,
        {
          id: `q-new-${Date.now()}-${qCount}`,
          type: 'true_false',
          questionText: `Pernyataan #${qCount}: Komputer membutuhkan IP Address untuk saling berkomunikasi di jaringan lokal.`,
          correctAnswer: 'BENAR',
          scoreWeight: 20,
        },
      ]);
    } else {
      setNewQuestions([
        ...newQuestions,
        {
          id: `q-new-${Date.now()}-${qCount}`,
          type: 'essay',
          questionText: `Soal Uraian Esai #${qCount}: Uraikan langkah-langkah dalam...`,
          correctAnswer: 'Kunci pedoman penilaian esai guru.',
          scoreWeight: 40,
        },
      ]);
    }
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    const sbj = subjects.find((s) => s.id === newSubjectId) || subjects[0];
    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      title: newTitle || `Ujian CBT ${sbj.name}`,
      code: newCode || `CBT-${sbj.code}-${Date.now().toString().slice(-3)}`,
      subjectId: sbj.id,
      subjectName: sbj.name,
      teacherId: currentUser?.id || 't-abdul',
      teacherName: currentUser?.name || sbj.teacherName,
      targetJenjang: sbj.jenjang,
      targetJurusan: sbj.jurusan,
      durationMinutes: Number(newDuration) || 45,
      passingGrade: Number(newPassingGrade) || 75,
      questions: newQuestions,
      createdAt: new Date().toLocaleDateString('id-ID'),
      isPublished: true,
    };

    addExam(newExam);
    setShowCreateExamModal(false);
    setNewTitle('');
    setNewCode('');
  };

  const handleSaveEssayGrading = () => {
    if (!inspectAttempt) return;
    Object.entries(manualEssayGradeMap).forEach(([qId, score]) => {
      gradeExamEssay(inspectAttempt.id, qId, score as number, essayFeedback);
    });
    setInspectAttempt(null);
  };

  return (
    <div id="exam-hub-container" className="space-y-3.5 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 rounded-2xl p-4 text-white shadow-md space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-white" />
            <h2 className="text-sm font-bold tracking-tight">Portal Ujian CBT PB (STS & SAS) PRABUNET</h2>
          </div>
          {currentUser?.role === 'guru' && (
            <button
              onClick={() => setShowCreateExamModal(true)}
              className="px-2.5 py-1 bg-white text-slate-900 hover:bg-amber-50 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-orange-600" />
              <span>Buat Paket Soal</span>
            </button>
          )}
        </div>
        <p className="text-xs text-amber-100">
          Ujian online responsif dengan timer, koreksi otomatis (PG & B/S), dan penilaian esai guru.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="grid grid-cols-2 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
        <button
          onClick={() => setSelectedSubTab('available')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            selectedSubTab === 'available' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Daftar Ujian ({exams.length})</span>
        </button>
        <button
          onClick={() => setSelectedSubTab('history')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            selectedSubTab === 'history' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>
            {currentUser?.role === 'guru'
              ? `Hasil Siswa (${examAttempts.length})`
              : `Riwayat Nilai (${myAttempts.length})`}
          </span>
        </button>
      </div>

      {/* SUBTAB 1: AVAILABLE EXAMS */}
      {selectedSubTab === 'available' && (
        <div className="space-y-3">
          {/* Real-time Firestore CBT Exam Card */}
          <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl border border-blue-500/30 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-400/30 mb-1.5">
                  <Database className="w-3 h-3 text-blue-400" />
                  <span>Koleksi Cloud Firestore (bank_soal)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
                </div>
                <h4 className="text-sm font-black text-white">
                  Ujian CBT Real-Time Cloud Firestore
                </h4>
                <p className="text-[11px] text-blue-100/90 leading-relaxed mt-1">
                  Soal disinkronisasi langsung via <code>onSnapshot</code> dari panel admin dengan auto-save per butir soal ke koleksi <code>hasil_ujian</code>.
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
              <span className="text-[11px] text-blue-200">
                Pengerjaan bertahap & aman saat jaringan terputus
              </span>
              <button
                onClick={() => setIsTakingFirestoreExam(true)}
                className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai Ujian Firestore (Real-Time)</span>
              </button>
            </div>
          </div>
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-orange-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-mono text-[10px] font-bold">
                      {exam.code}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                      Kelas {exam.targetJenjang} • {exam.targetJurusan}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{exam.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mapel: {exam.subjectName}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    KKM: {exam.passingGrade}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 rounded-xl px-3 text-[11px] text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.durationMinutes} Menit</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.questions.length} Butir Soal</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                  <span>{exam.teacherName ? exam.teacherName.split(' ')[0] : 'Guru'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {currentUser?.role === 'guru' && (
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                    title="Hapus Ujian"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setActiveTakingExam(exam)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentUser?.role === 'guru' ? 'Simulasi / Pratinjau Ujian CBT' : 'Mulai Kerjakan Ujian CBT'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: EXAM RESULTS / STUDENT ATTEMPTS */}
      {selectedSubTab === 'history' && (
        <div className="space-y-2.5">
          {(currentUser?.role === 'guru' ? examAttempts : myAttempts).length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-1">
              <BarChart3 className="w-8 h-8 mx-auto text-slate-300 mb-1" />
              <p className="text-xs font-semibold">Belum ada riwayat hasil ujian CBT yang tersimpan.</p>
            </div>
          ) : (
            (currentUser?.role === 'guru' ? examAttempts : myAttempts).map((att) => (
              <div
                key={att.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                      {att.subjectName}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{att.examTitle}</h4>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>
                        {att.studentName} ({att.studentClass})
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-blue-700 font-mono">
                      {att.totalScore} / {att.maxScore}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        att.isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {att.isPassed ? 'LULUS' : 'REMEDIAL'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>PG: {att.pgScore} | Esai: {att.essayScore}</span>
                  {currentUser?.role === 'guru' ? (
                    <button
                      onClick={() => {
                        setInspectAttempt(att);
                        const initialGrade: Record<string, number> = {};
                        // prep essay grades
                        Object.keys(att.answers).forEach((qId) => {
                          if (att.answers[qId].manualScore !== undefined) {
                            initialGrade[qId] = att.answers[qId].manualScore || 0;
                          }
                        });
                        setManualEssayGradeMap(initialGrade);
                      }}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Koreksi Esai Siswa</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      Selesai dalam {Math.round(att.timeSpentSeconds / 60)} menit
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: TEACHER CREATE EXAM */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-3.5 text-white flex items-center justify-between shrink-0">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Buat Paket Soal Ujian CBT Baru</span>
              </h4>
              <button
                onClick={() => setShowCreateExamModal(false)}
                className="text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Ujian:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Penilaian Akhir Semester Ganjil 2025/2026"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Ujian:</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Contoh: CBT-DKV-01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran:</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi (Menit):</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    min={5}
                    max={180}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">KKM / Nilai Lulus:</label>
                  <input
                    type="number"
                    value={newPassingGrade}
                    onChange={(e) => setNewPassingGrade(Number(e.target.value))}
                    min={50}
                    max={100}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Questions List & Builder */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    Daftar Butir Soal ({newQuestions.length} Butir):
                  </span>
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => handleAddQuestionToNewExam('pg')}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold shrink-0"
                  >
                    + Pilihan Ganda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestionToNewExam('true_false')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold shrink-0"
                  >
                    + Benar / Salah
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestionToNewExam('essay')}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold shrink-0"
                  >
                    + Soal Esai
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {newQuestions.map((q, idx) => (
                    <div key={q.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-orange-700">
                          #{idx + 1} • {q.type === 'pg' ? 'Pilihan Ganda' : q.type === 'true_false' ? 'Benar / Salah' : 'Esai'}
                        </span>
                        <span className="text-slate-500">Bobot: {q.scoreWeight} Poin</span>
                      </div>
                      <p className="text-[11px] text-slate-800 line-clamp-2">{q.questionText}</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">Kunci: {q.correctAnswer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md shadow-orange-500/20"
                >
                  Terbitkan Paket Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEACHER ESSAY GRADING */}
      {inspectAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-800 p-3.5 text-white flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-xs font-bold">Penilaian Esai & Verifikasi Ujian</h4>
                <p className="text-[10px] text-blue-100">
                  {inspectAttempt.studentName} • {inspectAttempt.studentClass}
                </p>
              </div>
              <button
                onClick={() => setInspectAttempt(null)}
                className="text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Skor Otomatis PG & B/S:</span>
                  <span className="text-blue-800">{inspectAttempt.pgScore} Poin</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Skor Esai Saat Ini:</span>
                  <span className="text-indigo-800">{inspectAttempt.essayScore} Poin</span>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-slate-800">Jawaban Esai Siswa:</h5>
                {(Object.entries(inspectAttempt.answers) as [string, StudentAnswer][]).map(([qId, ans], idx) => {
                  return (
                    <div key={qId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-700 block">Butir #{idx + 1}</span>
                      <div className="p-2 bg-white rounded border border-slate-200 text-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-1">Teks Jawaban Siswa:</span>
                        <p className="text-[11px] leading-relaxed">{ans.answer || '<Tidak Dijawab>'}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <label className="text-[11px] font-bold text-slate-700">Input Nilai Guru:</label>
                        <input
                          type="number"
                          defaultValue={ans.manualScore || 30}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setManualEssayGradeMap((prev) => ({ ...prev, [qId]: val }));
                          }}
                          min={0}
                          max={100}
                          className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-blue-700"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Evaluasi Guru:</label>
                <textarea
                  value={essayFeedback}
                  onChange={(e) => setEssayFeedback(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setInspectAttempt(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEssayGrading}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20"
                >
                  Simpan Nilai Akhir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
