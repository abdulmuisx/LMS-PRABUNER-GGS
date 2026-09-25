import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BankSoalDoc,
  subscribeActiveBankSoal,
  initHasilUjianSession,
  autoSaveJawabanSoal,
  finalizeHasilUjian,
} from '../../services/firestoreService';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Database,
  Cloud,
  Check,
  Award,
  Sparkles,
  RefreshCw,
  LogOut,
  AlertCircle,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';

interface FirestoreExamRunnerProps {
  onExit: () => void;
}

export const FirestoreExamRunner: React.FC<FirestoreExamRunnerProps> = ({ onExit }) => {
  const { currentUser } = useApp();

  const [questions, setQuestions] = useState<BankSoalDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState<number>(60 * 60); // 60 minutes default
  const [showConfirmFinish, setShowConfirmFinish] = useState<boolean>(false);

  // 1. Subscribe to active questions in real-time
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeActiveBankSoal(
      (data) => {
        // Guaranteed consistent order by orderIndex
        const sorted = [...data].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        setQuestions(sorted);
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        setError(err.message || 'Gagal terhubung ke Firestore');
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Initialize Firestore Exam Session for student auto-save
  useEffect(() => {
    if (questions.length > 0 && !sessionId && !isFinished) {
      const studentId = currentUser?.id || `guest-${Date.now()}`;
      const studentName = currentUser?.name || 'Siswa Calon Pendaftar SMK PB';
      const studentJurusan = currentUser?.jurusan || currentUser?.rombel || 'Kejuruan';

      initHasilUjianSession(studentId, studentName, questions.length, studentJurusan)
        .then((id) => {
          setSessionId(id);
        })
        .catch((err) => {
          console.warn('Could not initialize Firestore session:', err);
        });
    }
  }, [questions, sessionId, isFinished, currentUser]);

  // 3. Timer countdown
  useEffect(() => {
    if (isFinished || isLoading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, isLoading, questions.length]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 4. Handle selecting answer with real-time Firestore auto-save
  const handleSelectOption = async (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));

    // Auto-save immediately to Firestore
    if (sessionId) {
      setSaveStatus('saving');
      try {
        await autoSaveJawabanSoal(sessionId, questionId, optionKey);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveStatus('error');
      }
    }
  };

  // 5. Finalize exam and calculate score
  const handleFinish = async () => {
    setIsFinished(true);
    setShowConfirmFinish(false);

    let totalEarned = 0;
    let maxWeight = 0;

    questions.forEach((q) => {
      const weight = q.bobotNilai || 10;
      maxWeight += weight;
      if (selectedAnswers[q.id] === q.jawabanBenar) {
        totalEarned += weight;
      }
    });

    const calculatedScore = maxWeight > 0 ? Math.round((totalEarned / maxWeight) * 100) : 0;
    setFinalScore(calculatedScore);

    if (sessionId) {
      try {
        await finalizeHasilUjian(sessionId, calculatedScore);
      } catch (err) {
        console.error('Finalize hasil ujian failed:', err);
      }
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold">Sinkronisasi Soal Firestore...</h3>
          <p className="text-xs text-slate-400">Mengambil bank soal aktif dengan urutan konsisten.</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 space-y-4 max-w-md mx-auto text-center">
        <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold">
          {error ? 'Gagal Terhubung ke Firestore' : 'Belum Ada Soal Aktif di Firestore'}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {error || 'Administrator belum mengaktifkan soal ujian di koleksi bank_soal. Silakan hubungi proktor/admin sekolah.'}
        </p>
        <button
          onClick={onExit}
          className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
        >
          Kembali ke Portal
        </button>
      </div>
    );
  }

  // Result View
  if (isFinished) {
    const isPassed = finalScore >= 75;
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl text-center space-y-4">
          <div
            className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
              isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
          >
            <Award className="w-10 h-10" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30 mb-2">
              <Database className="w-3 h-3" />
              <span>Tersimpan di Firestore (hasil_ujian)</span>
            </div>
            <h2 className="text-lg font-black tracking-tight">Ujian CBT Selesai!</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Peserta: <strong className="text-white">{currentUser?.name || 'Siswa'}</strong>
            </p>
          </div>

          {/* Score Box */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold block">
              Skor Perolehan
            </span>
            <div className="text-4xl font-black text-amber-400 tracking-tight">
              {finalScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
            </div>
            <div className="text-xs font-bold">
              {isPassed ? (
                <span className="text-emerald-400">✓ Memenuhi Kriteria Ketuntasan Minimal (KKM 75)</span>
              ) : (
                <span className="text-amber-400">Di Bawah KKM (Perlu Pengayaan / Remedial)</span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-left bg-slate-900/40 p-3 rounded-xl border border-slate-700/50 space-y-1">
            <div className="flex justify-between">
              <span>Total Butir Soal:</span>
              <strong className="text-white">{questions.length} Soal</strong>
            </div>
            <div className="flex justify-between">
              <span>Soal Terjawab:</span>
              <strong className="text-white">{Object.keys(selectedAnswers).length} Soal</strong>
            </div>
            <div className="flex justify-between">
              <span>Status Dokumen:</span>
              <strong className="text-emerald-400">Finalized & Synced</strong>
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs shadow-lg cursor-pointer transition-all active:scale-98"
          >
            Kembali ke Halaman Utama
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx] || questions[0];
  const currentAnswer = selectedAnswers[currentQ?.id];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between pb-8">
      {/* Top Bar Navigation */}
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold">
              Soal {currentIdx + 1} / {questions.length}
            </span>

            {/* Cloud Auto-Save Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-slate-700/60 border border-slate-600">
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-amber-300">Menyimpan...</span>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span className="text-rose-300">Koneksi lemah</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">Auto-save Firestore ✓</span>
                </>
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={() => setShowConfirmFinish(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      </header>

      {/* Main Question Body */}
      <main className="max-w-2xl mx-auto w-full p-4 space-y-4 flex-1">
        {/* Info Meta */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[11px] font-semibold text-slate-300">
              {currentQ.kategori || 'Kejuruan SMK'}
            </span>
            <span>Bobot: {currentQ.bobotNilai || 10} Poin</span>
          </div>
          <span className="text-[11px] text-emerald-400">
            Terjawab: {Object.keys(selectedAnswers).length} dari {questions.length}
          </span>
        </div>

        {/* Question Text Box */}
        <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 shadow-md">
          <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
            {currentQ.pertanyaan}
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-2.5 pt-2">
          {currentQ.pilihanJawaban?.map((opt) => {
            const isSelected = currentAnswer === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(currentQ.id, opt.key)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer active:scale-99 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/50 shadow-md'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {opt.key}
                </span>
                <span className="text-xs sm:text-sm font-medium leading-relaxed">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Nav Buttons */}
      <footer className="max-w-2xl mx-auto w-full px-4 pt-2">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmFinish(true)}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Kumpulkan Ujian</span>
            </button>
          )}
        </div>
      </footer>

      {/* Confirmation Finish Modal */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 border border-slate-700 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Selesaikan Ujian Sekarang?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Anda telah menjawab{' '}
                <strong className="text-amber-400">
                  {Object.keys(selectedAnswers).length} dari {questions.length}
                </strong>{' '}
                soal. Jawaban yang telah tersimpan di Firestore akan dinilai secara otomatis.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmFinish(false)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
