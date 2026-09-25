import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, MeetingModule } from '../../types';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  Video,
  Download,
  Upload,
  Send,
  Sparkles,
  Award,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  User,
  Info,
  Lock,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

interface SubjectDetailViewProps {
  subject: Subject;
  onBack: () => void;
}

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({ subject, onBack }) => {
  const {
    currentUser,
    getMeetingsForSubject,
    updateMeetingModule,
    submitLKPD,
    lkpdSubmissions,
  } = useApp();

  const isStudent = currentUser?.role === 'murid';

  // Access Control Checks:
  let isAccessAllowed = true;
  let restrictionReason = '';
  let restrictionDetail = '';

  if (!currentUser) {
    isAccessAllowed = false;
    restrictionReason = 'Mata pelajaran ini hanya dapat diakses setelah Anda masuk (login).';
    restrictionDetail = 'Silakan masuk menggunakan akun Siswa, Guru, atau Kepala Sekolah untuk membuka materi 30 pertemuan dan LKPD.';
  } else if (isStudent) {
    const studentKelas = currentUser.kelas;
    const studentJurusan = currentUser.jurusan;

    // 1. Grade (Jenjang) Restriction: Class X cannot access Class XI or XII, etc.
    if (studentKelas && subject.jenjang !== 'SEMUA' && subject.jenjang !== studentKelas) {
      isAccessAllowed = false;
      restrictionReason = `Mata pelajaran ini hanya dapat diakses oleh siswa Kelas ${subject.jenjang}.`;
      restrictionDetail = `Akun Anda terdaftar sebagai siswa Kelas ${studentKelas}. Siswa Kelas ${studentKelas} tidak diizinkan mengakses materi atau tugas jenjang kelas lain.`;
    }
    // 2. Department (Jurusan) Restriction: DKV only for DKV, TBSM only for TBSM, TKJ only for TKJ
    else if (
      (subject.category === 'Kejuruan' || subject.jurusan !== 'SEMUA') &&
      studentJurusan &&
      subject.jurusan !== 'SEMUA' &&
      subject.jurusan !== studentJurusan
    ) {
      isAccessAllowed = false;
      restrictionReason = `Mata pelajaran Produktif Kejuruan "${subject.name}" dikhususkan bagi siswa Jurusan ${subject.jurusan}.`;
      restrictionDetail = `Akun Anda terdaftar pada Kompetensi Keahlian ${studentJurusan}. Siswa ${studentJurusan} tidak memiliki hak akses pada materi produktif jurusan ${subject.jurusan}.`;
    }
  }

  const meetings = getMeetingsForSubject(subject.id);
  const [activeMeetingNumber, setActiveMeetingNumber] = useState<number>(1);
  const [activeSection, setActiveSection] = useState<'teori' | 'lkpd' | 'referensi'>('teori');

  // Student LKPD Submission Form State
  const [lkpdTextResponse, setLkpdTextResponse] = useState('');
  const [lkpdFileName, setLkpdFileName] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // If access is restricted for this student, show the Locked Screen
  if (!isAccessAllowed) {
    return (
      <div id="subject-locked-view" className="space-y-4 pb-20 animate-in fade-in">
        {/* Top Back Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Mapel</span>
          </button>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono flex items-center gap-1">
            <Lock className="w-3 h-3 text-rose-600" />
            <span>Akses Dibatasi</span>
          </span>
        </div>

        {/* Lock Warning Card */}
        <div className="p-6 bg-white rounded-3xl border border-rose-200 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Hak Akses Terkunci
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 pt-1">
              Akses Mata Pelajaran Tidak Diizinkan
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              {restrictionReason}
            </p>
          </div>

          {/* Details Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Mata Pelajaran:</span>
              <span className="font-bold text-slate-900">{subject.name} ({subject.code})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Peruntukan:</span>
              <span className="font-bold text-blue-700">
                Kelas {subject.jenjang} • Jurusan {subject.jurusan}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Profil Akun Anda:</span>
              <span className="font-bold text-emerald-700">
                {currentUser?.name} (Kelas {currentUser?.kelas} {currentUser?.jurusan})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic pt-1 leading-relaxed">
              {restrictionDetail}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onBack}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Mata Pelajaran Saya</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentMeeting = meetings.find((m) => m.meetingNumber === activeMeetingNumber) || meetings[0];

  // Check if current student has submitted LKPD for this meeting
  const existingSubmission = lkpdSubmissions.find(
    (sub) =>
      sub.subjectId === subject.id &&
      sub.meetingNumber === activeMeetingNumber &&
      sub.studentId === currentUser?.id
  );

  const completedCount = meetings.filter((m) => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / 30) * 100);

  const handleToggleCompleted = (mNum: number, currentStatus?: boolean) => {
    updateMeetingModule(subject.id, mNum, { isCompleted: !currentStatus });
  };

  const handleLKPDSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !lkpdTextResponse.trim()) return;

    submitLKPD({
      id: `lkpd-sub-${Date.now()}`,
      subjectId: subject.id,
      subjectName: subject.name,
      meetingNumber: activeMeetingNumber,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.rombel || 'X DKV',
      studentNisn: currentUser.nisn || '0078129901',
      content: lkpdTextResponse,
      fileName: lkpdFileName || `LKPD_M${activeMeetingNumber}_${(currentUser?.name || 'Siswa').replace(/\s+/g, '_')}.pdf`,
      submittedAt: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'submitted',
    });

    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
    }, 2500);
  };

  return (
    <div id="subject-detail-container" className="space-y-3 pb-20">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-subjects"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Mapel</span>
        </button>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
          {subject.code}
        </span>
      </div>

      {/* Subject Header Card */}
      <div className={`bg-gradient-to-r ${subject.color} rounded-2xl p-4 text-white shadow-md space-y-2`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold backdrop-blur-xs text-white mb-1">
              <span>Jenjang {subject.jenjang}</span>
              <span>•</span>
              <span>Jurusan {subject.jurusan}</span>
            </div>
            <h2 className="text-base font-bold leading-tight">{subject.name}</h2>
            <p className="text-xs text-white/90 mt-0.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>Guru: {subject.teacherName}</span>
            </p>
          </div>
        </div>

        {/* Progress bar for 30 meetings */}
        <div className="pt-2 border-t border-white/20">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/90 mb-1">
            <span>Kemajuan Belajar:</span>
            <span>{completedCount} dari 30 Pertemuan Selesai ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progressPercent, 4)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Meeting Selector Carousel (1 - 30) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
          <span>Pilih Pertemuan (1 s/d 30):</span>
          <span className="text-blue-600 font-mono">P-{activeMeetingNumber} Terpilih</span>
        </div>
        <div className="flex overflow-x-auto gap-1.5 pb-2 scrollbar-none">
          {meetings.map((m) => (
            <button
              key={m.meetingNumber}
              onClick={() => {
                setActiveMeetingNumber(m.meetingNumber);
                setLkpdTextResponse('');
                setLkpdFileName('');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                activeMeetingNumber === m.meetingNumber
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                  : m.isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {m.isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>P-{m.meetingNumber}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Meeting Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
        {/* Meeting Title & Theme */}
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
              Pertemuan {currentMeeting.meetingNumber} • {currentMeeting.theme}
            </span>
            <button
              onClick={() => handleToggleCompleted(currentMeeting.meetingNumber, currentMeeting.isCompleted)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                currentMeeting.isCompleted
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${currentMeeting.isCompleted ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>{currentMeeting.isCompleted ? 'Telah Dipelajari' : 'Tandai Selesai'}</span>
            </button>
          </div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">{currentMeeting.title}</h3>
        </div>

        {/* Meeting Section Switcher Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSection('teori')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeSection === 'teori' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Materi Teori</span>
          </button>
          <button
            onClick={() => setActiveSection('lkpd')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeSection === 'lkpd' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tugas LKPD</span>
          </button>
          <button
            onClick={() => setActiveSection('referensi')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeSection === 'referensi' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Bahan Ref</span>
          </button>
        </div>

        {/* SECTION 1: TEORI & MODUL */}
        {activeSection === 'teori' && (
          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl">
              <h4 className="font-bold text-blue-950 flex items-center gap-1.5 mb-1 text-xs">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                Capaian & Tujuan Pembelajaran:
              </h4>
              <p className="text-blue-900">{currentMeeting.learningObjective}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1 text-xs">Ringkasan Teori Pokok:</h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-line text-slate-800">
                {currentMeeting.theorySummary}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1 text-xs">Uraian & Modul Praktik Lengkap:</h4>
              <div className="p-3 bg-white border border-slate-200 rounded-xl whitespace-pre-line text-slate-800 space-y-2">
                {currentMeeting.detailedContent}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 items-center pt-2">
              <span className="text-[10px] font-bold text-slate-500">Kata Kunci:</span>
              {currentMeeting.keyTerms.map((term, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                  #{term}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: LKPD INTERACTIVE SUBMISSION */}
        {activeSection === 'lkpd' && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>{currentMeeting.lkpd.title}</span>
                </h4>
                <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                  Maks. 100 Poin
                </span>
              </div>
              <p className="text-emerald-900 leading-relaxed">{currentMeeting.lkpd.description}</p>
              <div className="space-y-1 pt-1">
                <span className="font-bold text-emerald-950 block">Instruksi Pengerjaan:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-emerald-900 text-[11px]">
                  {currentMeeting.lkpd.instructions.map((ins, idx) => (
                    <li key={idx}>{ins}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Submission Status or Input Form */}
            {existingSubmission ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>LKPD Telah Dikumpulkan</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{existingSubmission.submittedAt}</span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">Jawaban / Laporan Terkirim:</span>
                  <p className="text-[11px] leading-relaxed">{existingSubmission.content}</p>
                  {existingSubmission.fileName && (
                    <div className="mt-2 text-blue-700 font-mono text-[11px] flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{existingSubmission.fileName}</span>
                    </div>
                  )}
                </div>

                {existingSubmission.score !== undefined ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>Nilai Guru:</span>
                      <span className="text-sm text-emerald-800">{existingSubmission.score} / 100</span>
                    </div>
                    {existingSubmission.feedback && (
                      <p className="text-[11px]">
                        <strong>Catatan Guru: </strong> {existingSubmission.feedback}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Menunggu verifikasi dan penilaian dari dewan guru pengampu.</span>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleLKPDSubmit} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
                <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Form Pengumpulan LKPD Siswa</span>
                </h5>

                {submissionSuccess && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tugas LKPD berhasil dikirim ke guru pengampu!</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Uraian Jawaban / Ringkasan Hasil Praktik:
                  </label>
                  <textarea
                    value={lkpdTextResponse}
                    onChange={(e) => setLkpdTextResponse(e.target.value)}
                    rows={4}
                    placeholder="Ketikkan ringkasan hasil percobaan, observasi, atau jawaban soal LKPD disini..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lampiran File / Dokumen Laporan (Opsional):
                  </label>
                  <input
                    type="text"
                    value={lkpdFileName}
                    onChange={(e) => setLkpdFileName(e.target.value)}
                    placeholder="Contoh: Laporan_Praktik_NamaSiswa.pdf atau link Google Drive"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Tugas LKPD ke Guru</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* SECTION 3: BAHAN AJAR REFERENSI */}
        {activeSection === 'referensi' && (
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 mb-2">Bahan Pembelajaran Tambahan:</h4>
            {currentMeeting.referenceResources && currentMeeting.referenceResources.length > 0 ? (
              currentMeeting.referenceResources.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      {ref.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">{ref.title}</h5>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {ref.type === 'video' ? 'Video Simulasi & Panduan Praktik' : 'E-Modul Dokumen PDF'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Membuka ${ref.title}`)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs"
                  >
                    Buka
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-500">Tidak ada referensi eksternal.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
