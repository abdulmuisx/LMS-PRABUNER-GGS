import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, Question, StudentAnswer, ExamAttempt } from '../../types';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Info,
  Type,
  Lock,
  ShieldAlert,
  KeyRound,
  RefreshCw,
  AlertOctagon,
  ShieldCheck,
} from 'lucide-react';

interface CbtUnbkSimulatorProps {
  exam: Exam;
  onExit: () => void;
}

export const CbtUnbkSimulator: React.FC<CbtUnbkSimulatorProps> = ({ exam, onExit }) => {
  const { currentUser, submitExamAttempt, cbtUnlockToken } = useApp();

  // Current question index (0-based)
  const [currentIdx, setCurrentIdx] = useState(0);

  // Student answers map: questionId -> StudentAnswer
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});

  // Font size scale: 'normal' | 'large' | 'xl'
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Timer: duration in seconds
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);
  const [resultAttempt, setResultAttempt] = useState<ExamAttempt | null>(null);

  // ==========================================
  // ANTI-CHEAT / PROCTORING LOCKOUT SYSTEM
  // ==========================================
  const [isLocked, setIsLocked] = useState(false);
  const [violationsCount, setViolationsCount] = useState(0);
  const [unlockInputToken, setUnlockInputToken] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockSuccess, setUnlockSuccess] = useState<string | null>(null);
  const [violationLogs, setViolationLogs] = useState<{ time: string; reason: string }[]>([]);

  const startTimeRef = useRef<string>(new Date().toISOString());

  // Proctoring tab/window/blur listener
  useEffect(() => {
    if (isFinished || isLocked) return;

    const triggerLockout = (reason: string) => {
      if (isFinished) return;
      setIsLocked(true);
      setViolationsCount((prev) => prev + 1);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setViolationLogs((prev) => [...prev, { time: timeStr, reason }]);
      setUnlockError(null);
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerLockout('Meninggalkan Tab Ujian / Membuka Tab Baru');
      }
    };

    const handleBlur = () => {
      triggerLockout('Fokus Layar Hilang / Berpindah Aplikasi / Split Screen');
    };

    const handlePageHide = () => {
      triggerLockout('Aplikasi Diminimalkan atau Dialihkan');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isFinished, isLocked]);

  // Handle student typing token to unlock
  const handleUnlockExam = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    const entered = unlockInputToken.trim().toUpperCase();
    const valid = (cbtUnlockToken || 'SMKPB2026').trim().toUpperCase();

    if (entered === valid) {
      setUnlockSuccess('Token Valid! Layar ujian berhasil dibuka. Silakan lanjutkan pengerjaan soal.');
      setTimeout(() => {
        setIsLocked(false);
        setUnlockInputToken('');
        setUnlockSuccess(null);
        setUnlockError(null);
      }, 1000);
    } else {
      setUnlockError('Token Buka Kunci Salah! Hubungi Guru Pengawas Ruangan / Admin SMK Purnama Bakti.');
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (isFinished || isLocked) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, isLocked]);

  const currentQ = exam.questions[currentIdx] || exam.questions[0];

  // Helper formatting for seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Select answer handler
  const handleSelectOption = (questionId: string, optionKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: optionKey,
        isDoubt: prev[questionId]?.isDoubt || false,
      },
    }));
  };

  // Toggle doubt (ragu-ragu)
  const handleToggleDoubt = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: prev[questionId]?.answer || '',
        isDoubt: !prev[questionId]?.isDoubt,
      },
    }));
  };

  // Handle Essay text change
  const handleEssayChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: text,
        isDoubt: prev[questionId]?.isDoubt || false,
      },
    }));
  };

  // Submit and grade the exam
  const handleFinishExam = () => {
    setIsFinished(true);
    setShowConfirmFinishModal(false);

    let totalPgScore = 0;
    let maxPgScore = 0;
    let totalScore = 0;
    let totalMaxScore = 0;

    const evaluatedAnswers: Record<string, StudentAnswer> = {};

    exam.questions.forEach((q) => {
      totalMaxScore += q.scoreWeight;
      const ans = answers[q.id];
      const studentAnsText = ans?.answer?.trim() || '';

      if (q.type === 'pg' || q.type === 'true_false') {
        maxPgScore += q.scoreWeight;
        const isCorrect = studentAnsText.toUpperCase() === q.correctAnswer.toUpperCase();
        const score = isCorrect ? q.scoreWeight : 0;
        totalPgScore += score;
        totalScore += score;

        evaluatedAnswers[q.id] = {
          questionId: q.id,
          answer: studentAnsText,
          isDoubt: ans?.isDoubt || false,
          isCorrect,
          autoScore: score,
        };
      } else {
        // Essay: evaluate if text is given, grant baseline preliminary score for instant feedback
        const hasContent = studentAnsText.length > 10;
        const initialEssayScore = hasContent ? Math.round(q.scoreWeight * 0.8) : 0;
        totalScore += initialEssayScore;

        evaluatedAnswers[q.id] = {
          questionId: q.id,
          answer: studentAnsText,
          isDoubt: ans?.isDoubt || false,
          manualScore: initialEssayScore,
          teacherFeedback: hasContent ? 'Jawaban esai terinput (menunggu verifikasi nilai guru).' : 'Esai kosong / belum dijawab.',
        };
      }
    });

    const percentage = Math.round((totalScore / totalMaxScore) * 100);
    const isPassed = percentage >= exam.passingGrade;

    const attempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      subjectName: exam.subjectName,
      studentId: currentUser?.id || 'std-guest',
      studentName: currentUser?.name || 'Siswa SMK Purnama Bakti',
      studentClass: currentUser?.rombel || 'X DKV',
      studentEmail: currentUser?.email || 'siswa@smkpurnamabakti.sch.id',
      startedAt: startTimeRef.current,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: exam.durationMinutes * 60 - timeLeft,
      answers: evaluatedAnswers,
      pgScore: totalPgScore,
      essayScore: totalScore - totalPgScore,
      totalScore,
      maxScore: totalMaxScore,
      percentage,
      isPassed,
      status: 'submitted',
      tabViolationsCount: violationsCount,
    };

    setResultAttempt(attempt);
    submitExamAttempt(attempt);

    // Trigger celebratory confetti if passed
    if (isPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // fallback
      }
    }
  };

  // Calculation for Question Grid
  const totalAnswered = (Object.values(answers) as StudentAnswer[]).filter((a) => a.answer && a.answer.trim().length > 0).length;
  const totalDoubt = (Object.values(answers) as StudentAnswer[]).filter((a) => a.isDoubt).length;
  const totalUnanswered = exam.questions.length - totalAnswered;

  return (
    <div id="cbt-unbk-container" className="flex flex-col min-h-[580px] bg-slate-100 rounded-2xl overflow-hidden shadow-lg border border-slate-300 relative">
      {/* ========================================================================= */}
      {/* ANTI-CHEAT FULL-SCREEN LOCKOUT OVERLAY */}
      {/* ========================================================================= */}
      {isLocked && !isFinished && (
        <div
          id="cbt-anti-cheat-lock-overlay"
          className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm bg-slate-900 border-2 border-rose-600/80 rounded-3xl p-5 text-center shadow-2xl shadow-rose-950/50 space-y-4">
            {/* Padlock Icon & Pulsing Halo */}
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 bg-rose-600 rounded-full animate-ping opacity-25"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg border border-rose-400 relative z-10">
                <Lock className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>

            {/* Warning Text */}
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider border border-rose-500/40 inline-flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" />
                Sistem Anti-Curang Terpicu
              </span>
              <h3 className="text-base font-black text-white">Layar Ujian Terkunci!</h3>
              <p className="text-[11px] text-slate-300 leading-snug">
                Terdeteksi aktivitas <strong>keluar dari tab, membuka tab baru, atau berpindah aplikasi</strong>.
              </p>
            </div>

            {/* Violation Details */}
            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 text-left space-y-1 text-[11px]">
              <div className="flex justify-between items-center text-slate-400">
                <span>Total Pelanggaran:</span>
                <span className="font-bold text-rose-400 bg-rose-950/80 px-2 py-0.2 rounded border border-rose-800/60">
                  {violationsCount} Kali
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Waktu Pelanggaran:</span>
                <span className="font-mono text-slate-200 text-[10px]">
                  {violationLogs[violationLogs.length - 1]?.time || 'Baru saja'}
                </span>
              </div>
            </div>

            {/* Token Input Form */}
            <form onSubmit={handleUnlockExam} className="space-y-3 pt-1">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  <span>Masukkan Token Buka Kunci (Dari Pengawas / Admin):</span>
                </label>
                <input
                  type="text"
                  value={unlockInputToken}
                  onChange={(e) => setUnlockInputToken(e.target.value.toUpperCase())}
                  placeholder="Contoh: SMKPB2026"
                  className="w-full text-center font-mono tracking-widest text-sm font-black bg-slate-950 border-2 border-slate-700 focus:border-amber-400 text-amber-300 rounded-xl px-3 py-2.5 focus:outline-hidden transition-colors uppercase placeholder:text-slate-600"
                  autoFocus
                  required
                />
              </div>

              {unlockError && (
                <div className="p-2 bg-rose-950/80 border border-rose-600/80 rounded-xl text-[10px] text-rose-200 font-medium flex items-center gap-1.5 text-left animate-in shake">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{unlockError}</span>
                </div>
              )}

              {unlockSuccess && (
                <div className="p-2 bg-emerald-950/80 border border-emerald-600/80 rounded-xl text-[10px] text-emerald-200 font-medium flex items-center gap-1.5 text-left">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{unlockSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <KeyRound className="w-4 h-4" />
                <span>Buka Kunci Layar Ujian</span>
              </button>
            </form>

            <p className="text-[9px] text-slate-400 leading-tight">
              *Token buka kunci dibuat & diatur secara manual oleh Admin/Pengawas di Dashboard Admin.
            </p>
          </div>
        </div>
      )}

      {/* Top CBT Header (UNBK Style) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between shadow-md select-none">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs border border-white/20">
            CBT
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight">{exam.code}</h3>
            <p className="text-[10px] text-blue-200 truncate max-w-[150px]">{exam.title}</p>
          </div>
        </div>

        {/* Live Countdown Timer & Controls */}
        <div className="flex items-center space-x-2">
          {/* Font Size Adjuster */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'sm' ? 'bg-white text-blue-900' : 'text-white'}`}
              title="Ukuran Font Kecil"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize('base')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'base' ? 'bg-white text-blue-900' : 'text-white'}`}
              title="Ukuran Font Normal"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('lg')}
              className={`px-1.5 py-0.5 rounded ${fontSize === 'lg' ? 'bg-white text-blue-900' : 'text-white'}`}
              title="Ukuran Font Besar"
            >
              A+
            </button>
          </div>

          {/* Countdown Clock */}
          {!isFinished && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                timeLeft < 300
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-600/90 text-white border border-emerald-400/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Question Grid Button */}
          {!isFinished && (
            <button
              type="button"
              onClick={() => setShowQuestionGrid(!showQuestionGrid)}
              className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-bold flex items-center gap-1 border border-white/20"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Daftar Soal</span>
            </button>
          )}
        </div>
      </div>

      {/* RESULT VIEW (AFTER EXAM SUBMITTED) */}
      {isFinished && resultAttempt ? (
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-white">
          <div className="text-center py-4 bg-gradient-to-b from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8 text-amber-900" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Ujian CBT Telah Selesai!</h3>
            <p className="text-xs text-slate-600">
              Hasil pengerjaan {resultAttempt.studentName} ({resultAttempt.studentClass})
            </p>

            <div className="py-2">
              <div className="text-3xl font-extrabold text-blue-700 font-mono tracking-tight">
                {resultAttempt.totalScore} <span className="text-sm text-slate-500 font-normal">/ {resultAttempt.maxScore}</span>
              </div>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                  resultAttempt.isPassed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {resultAttempt.isPassed ? '✓ LULUS KKM (KOMPETEN)' : '⚠ PERLU REMEDIAL'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto px-4 text-center text-xs">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Pilihan Ganda</span>
                <strong className="text-blue-900">{resultAttempt.pgScore} Poin</strong>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Soal Esai</span>
                <strong className="text-indigo-900">{resultAttempt.essayScore} Poin</strong>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Waktu Selesai</span>
                <strong className="text-slate-900">{Math.round(resultAttempt.timeSpentSeconds / 60)} Mnt</strong>
              </div>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Pembahasan & Kunci Jawaban Soal</span>
            </h4>

            {exam.questions.map((q, idx) => {
              const ans = resultAttempt.answers[q.id];
              const isCorrect = ans?.isCorrect;

              return (
                <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Soal #{idx + 1} ({q.type === 'pg' ? 'Pilihan Ganda' : q.type === 'true_false' ? 'Benar / Salah' : 'Esai'})
                    </span>
                    {q.type === 'pg' || q.type === 'true_false' ? (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? '✓ Benar (+ ' + q.scoreWeight + ')' : '✗ Salah (0)'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        Skor Esai: {ans?.manualScore || 0} / {q.scoreWeight}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-800 leading-relaxed font-medium">{q.questionText}</p>

                  <div className="p-2 bg-white rounded border border-slate-200 space-y-1">
                    <p className="text-slate-600 text-[11px]">
                      <strong>Jawaban Anda: </strong> {ans?.answer || '<Tidak Dijawab>'}
                    </p>
                    <p className="text-blue-700 text-[11px] font-semibold">
                      <strong>Kunci Jawaban Resmi: </strong> {q.correctAnswer}
                    </p>
                    {q.explanation && (
                      <p className="text-slate-500 text-[10px] pt-1 border-t border-slate-100">
                        <strong>Penjelasan: </strong> {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onExit}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Kembali ke Menu Ujian
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE EXAM INTERACTIVE VIEW */
        <div className="flex-1 flex flex-col p-4 bg-white relative overflow-y-auto">
          {/* Question Meta Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold">
                Soal {currentIdx + 1} / {exam.questions.length}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {currentQ.type === 'pg' ? 'Pilihan Ganda' : currentQ.type === 'true_false' ? 'Benar / Salah' : 'Soal Esai'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Bobot: {currentQ.scoreWeight} Poin</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-4">
            <p
              className={`text-slate-900 leading-relaxed font-medium ${
                fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-sm' : 'text-[13px]'
              }`}
            >
              {currentQ.questionText}
            </p>
          </div>

          {/* Question Options / Input Area */}
          <div className="space-y-2 mb-6 flex-1">
            {/* TYPE 1: PILIHAN GANDA (A, B, C, D, E) */}
            {currentQ.type === 'pg' && currentQ.options && (
              <div className="space-y-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id]?.answer === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt.key)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start space-x-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span
                        className={`flex-1 leading-snug ${
                          fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-sm' : 'text-xs'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 2: BENAR / SALAH */}
            {currentQ.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {(['BENAR', 'SALAH'] as const).map((key) => {
                  const isSelected = answers[currentQ.id]?.answer === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, key)}
                      className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
                        isSelected
                          ? key === 'BENAR'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400'
                            : 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      <span>{key}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 3: ESSAI */}
            {currentQ.type === 'essay' && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">Tulis Jawaban Esai Anda:</label>
                <textarea
                  value={answers[currentQ.id]?.answer || ''}
                  onChange={(e) => handleEssayChange(currentQ.id, e.target.value)}
                  rows={5}
                  placeholder="Ketikkan uraian jawaban esai secara terstruktur dan jelas..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 text-right">
                  Karakter: {(answers[currentQ.id]?.answer || '').length}
                </p>
              </div>
            )}
          </div>

          {/* Bottom UNBK Navigation Bar */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 select-none">
            {/* Prev Question */}
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                currentIdx === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Doubt / Ragu-ragu Toggle (Yellow Checkbox) */}
            <button
              type="button"
              onClick={() => handleToggleDoubt(currentQ.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                answers[currentQ.id]?.isDoubt
                  ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              <input
                type="checkbox"
                checked={answers[currentQ.id]?.isDoubt || false}
                readOnly
                className="w-3.5 h-3.5 text-amber-600 rounded pointer-events-none"
              />
              <span>Ragu-Ragu</span>
            </button>

            {/* Next or Finish Button */}
            {currentIdx < exam.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmFinishModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20"
              >
                <span>Selesai Ujian</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* QUESTION GRID MODAL (DAFTAR NOMOR SOAL) */}
      {showQuestionGrid && !isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-800 to-indigo-800 p-3.5 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4" />
                <span>Daftar Butir Soal CBT</span>
              </h4>
              <button
                onClick={() => setShowQuestionGrid(false)}
                className="text-white/80 hover:text-white p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Legend */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-center">
                <div className="p-1 rounded bg-blue-600 text-white">Sudah Dijawab</div>
                <div className="p-1 rounded bg-amber-400 text-amber-950">Ragu-Ragu</div>
                <div className="p-1 rounded bg-slate-100 border border-slate-300 text-slate-700">Belum</div>
              </div>

              {/* Grid of question numbers */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {exam.questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const hasAnswer = ans?.answer && ans.answer.trim().length > 0;
                  const isDoubt = ans?.isDoubt;

                  let colorClass = 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100';
                  if (isDoubt) {
                    colorClass = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
                  } else if (hasAnswer) {
                    colorClass = 'bg-blue-600 text-white border-blue-600 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentIdx(idx);
                        setShowQuestionGrid(false);
                      }}
                      className={`h-9 rounded-xl text-xs flex items-center justify-center border shadow-xs transition-all ${colorClass} ${
                        currentIdx === idx ? 'ring-2 ring-indigo-500 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">
                  Terisi: {totalAnswered}/{exam.questions.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionGrid(false);
                    setShowConfirmFinishModal(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Selesaikan Ujian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM FINISH MODAL */}
      {showConfirmFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Penyelesaian Ujian</span>
              </h4>
              <button
                onClick={() => setShowConfirmFinishModal(false)}
                className="text-white/80 hover:text-white p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-800">
                Apakah Anda yakin ingin mengakhiri sesi pengerjaan ujian CBT ini sekarang?
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Soal:</span>
                  <span className="font-bold">{exam.questions.length} Butir</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-semibold">Sudah Dijawab:</span>
                  <span className="font-bold text-emerald-800">{totalAnswered} Butir</span>
                </div>
                {totalDoubt > 0 && (
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span>Masih Ragu-Ragu:</span>
                    <span>{totalDoubt} Butir</span>
                  </div>
                )}
                {totalUnanswered > 0 && (
                  <div className="flex justify-between text-rose-700 font-semibold">
                    <span>Belum Dijawab:</span>
                    <span>{totalUnanswered} Butir</span>
                  </div>
                )}
              </div>

              {totalUnanswered > 0 && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Perhatian: Masih ada {totalUnanswered} butir soal yang belum Anda jawab!</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmFinishModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Periksa Kembali
                </button>
                <button
                  type="button"
                  onClick={handleFinishExam}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20"
                >
                  Ya, Kumpulkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
