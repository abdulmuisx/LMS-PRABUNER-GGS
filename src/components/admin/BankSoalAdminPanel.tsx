import React, { useState, useEffect } from 'react';
import {
  BankSoalDoc,
  PilihanJawaban,
  subscribeBankSoal,
  addSoalToFirestore,
  updateSoalInFirestore,
  deleteSoalFromFirestore,
  toggleStatusSoalInFirestore,
  validateSoalInput,
  seedInitialBankSoalIfEmpty,
  subscribePendaftar,
  PendaftarDoc,
  subscribeHasilUjian,
  HasilUjianDoc,
  updateVerifikasiPendaftar,
} from '../../services/firestoreService';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
  Radio,
  BookOpen,
  Filter,
  Search,
  Check,
  X,
  Users,
  Award,
  Clock,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';

export const BankSoalAdminPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'bank_soal' | 'pendaftar' | 'hasil_ujian'>('bank_soal');

  // Bank Soal States
  const [soalList, setSoalList] = useState<BankSoalDoc[]>([]);
  const [isLoadingSoal, setIsLoadingSoal] = useState<boolean>(true);
  const [soalError, setSoalError] = useState<string | null>(null);

  // Form Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSoalId, setEditingSoalId] = useState<string | null>(null);
  const [pertanyaan, setPertanyaan] = useState<string>('');
  const [kategori, setKategori] = useState<string>('DKV & Kejuruan');
  const [bobotNilai, setBobotNilai] = useState<number>(10);
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [options, setOptions] = useState<PilihanJawaban[]>([
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
  ]);
  const [jawabanBenar, setJawabanBenar] = useState<string>('A');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<'Semua' | 'aktif' | 'nonaktif'>('Semua');

  // Pendaftar State
  const [pendaftarList, setPendaftarList] = useState<PendaftarDoc[]>([]);
  const [isLoadingPendaftar, setIsLoadingPendaftar] = useState<boolean>(false);
  const [pendaftarError, setPendaftarError] = useState<string | null>(null);

  // Hasil Ujian State
  const [hasilList, setHasilList] = useState<HasilUjianDoc[]>([]);
  const [isLoadingHasil, setIsLoadingHasil] = useState<boolean>(false);
  const [hasilError, setHasilError] = useState<string | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time listener for Bank Soal
  useEffect(() => {
    setIsLoadingSoal(true);
    setSoalError(null);

    const unsubscribe = subscribeBankSoal(
      (data) => {
        setSoalList(data);
        setIsLoadingSoal(false);
      },
      (err) => {
        setIsLoadingSoal(false);
        setSoalError(err.message || 'Gagal memuat data dari Firestore');
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time listener for Pendaftar
  useEffect(() => {
    if (activeSubTab === 'pendaftar') {
      setIsLoadingPendaftar(true);
      const unsubscribe = subscribePendaftar(
        (data) => {
          setPendaftarList(data);
          setIsLoadingPendaftar(false);
        },
        (err) => {
          setIsLoadingPendaftar(false);
          setPendaftarError(err.message || 'Gagal memuat data pendaftar');
        }
      );
      return () => unsubscribe();
    }
  }, [activeSubTab]);

  // Real-time listener for Hasil Ujian
  useEffect(() => {
    if (activeSubTab === 'hasil_ujian') {
      setIsLoadingHasil(true);
      const unsubscribe = subscribeHasilUjian(
        (data) => {
          setHasilList(data);
          setIsLoadingHasil(false);
        },
        (err) => {
          setIsLoadingHasil(false);
          setHasilError(err.message || 'Gagal memuat data hasil ujian');
        }
      );
      return () => unsubscribe();
    }
  }, [activeSubTab]);

  // Reset form
  const resetForm = () => {
    setEditingSoalId(null);
    setPertanyaan('');
    setKategori('DKV & Kejuruan');
    setBobotNilai(10);
    setStatus('aktif');
    setOptions([
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ]);
    setJawabanBenar('A');
    setFormError(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (soal: BankSoalDoc) => {
    setEditingSoalId(soal.id);
    setPertanyaan(soal.pertanyaan);
    setKategori(soal.kategori || 'DKV & Kejuruan');
    setBobotNilai(soal.bobotNilai || 10);
    setStatus(soal.status || 'aktif');
    setOptions(
      soal.pilihanJawaban && soal.pilihanJawaban.length >= 2
        ? soal.pilihanJawaban
        : [
            { key: 'A', text: '' },
            { key: 'B', text: '' },
            { key: 'C', text: '' },
            { key: 'D', text: '' },
          ]
    );
    setJawabanBenar(soal.jawabanBenar || 'A');
    setFormError(null);
    setShowModal(true);
  };

  const handleOptionTextChange = (key: string, text: string) => {
    setOptions((prev) => prev.map((opt) => (opt.key === key ? { ...opt, text } : opt)));
  };

  const handleAddOption = () => {
    if (options.length >= 5) return;
    const nextKeys = ['A', 'B', 'C', 'D', 'E'];
    const nextKey = nextKeys[options.length];
    setOptions((prev) => [...prev, { key: nextKey, text: '' }]);
  };

  const handleRemoveOption = (key: string) => {
    if (options.length <= 2) {
      setFormError('Minimal harus ada 2 opsi pilihan jawaban');
      return;
    }
    const filtered = options.filter((opt) => opt.key !== key);
    setOptions(filtered);
    if (jawabanBenar === key && filtered.length > 0) {
      setJawabanBenar(filtered[0].key);
    }
  };

  // Submit form (create or edit)
  const handleSaveSoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = validateSoalInput(pertanyaan, options, jawabanBenar);
    if (!validation.isValid) {
      setFormError(validation.message);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSoalId) {
        await updateSoalInFirestore(editingSoalId, {
          pertanyaan: pertanyaan.trim(),
          pilihanJawaban: options,
          jawabanBenar,
          kategori,
          bobotNilai: Number(bobotNilai) || 10,
          status,
        });
        showToast('Soal berhasil diperbarui di Firestore!');
      } else {
        const nextOrderIndex = soalList.length > 0 ? Math.max(...soalList.map((s) => s.orderIndex || 0)) + 1 : 1;
        await addSoalToFirestore({
          pertanyaan: pertanyaan.trim(),
          pilihanJawaban: options,
          jawabanBenar,
          kategori,
          bobotNilai: Number(bobotNilai) || 10,
          status,
          orderIndex: nextOrderIndex,
        });
        showToast('Soal baru berhasil ditambahkan! Siswa dapat langsung melihatnya.');
      }
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan soal ke Firestore');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSoal = async (id: string, pertanyaanText: string) => {
    if (!window.confirm(`Hapus soal ini dari Firestore?\n"${pertanyaanText.slice(0, 60)}..."`)) return;
    try {
      await deleteSoalFromFirestore(id);
      showToast('Soal berhasil dihapus dari Firestore.');
    } catch (err: any) {
      alert(`Gagal menghapus soal: ${err.message}`);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: 'aktif' | 'nonaktif') => {
    try {
      const nextStatus = await toggleStatusSoalInFirestore(id, currentStatus);
      showToast(`Status soal diubah menjadi ${nextStatus.toUpperCase()}`);
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const handleSeedSampleData = async () => {
    try {
      setIsLoadingSoal(true);
      await seedInitialBankSoalIfEmpty();
      showToast('Berhasil memuat 5 bank soal SMK ke Firestore!');
    } catch (err: any) {
      alert(`Gagal seeding: ${err.message}`);
    } finally {
      setIsLoadingSoal(false);
    }
  };

  // Filtered Soal
  const filteredSoal = soalList.filter((s) => {
    const matchesSearch = s.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kategori?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKategori = filterKategori === 'Semua' || s.kategori === filterKategori;
    const matchesStatus = filterStatus === 'Semua' || s.status === filterStatus;
    return matchesSearch && matchesKategori && matchesStatus;
  });

  const categories = Array.from(new Set(['DKV & Kejuruan', 'TKJ / Jaringan', 'TBSM / Otomotif', 'Budaya Kerja Industri', ...soalList.map((s) => s.kategori).filter(Boolean)]));

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-5 text-white shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-[11px] font-bold text-blue-200 border border-blue-400/30">
            <Database className="w-3.5 h-3.5 text-blue-300" />
            <span>Firebase Cloud Firestore Database</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time onSnapshot Aktif</span>
          </div>
        </div>

        <h3 className="text-lg font-black tracking-tight">
          Pusat Kontrol Firestore & Bank Soal CBT
        </h3>
        <p className="text-xs text-blue-100/90 leading-relaxed max-w-xl">
          Kelola soal ujian real-time, data pendaftar siswa baru, dan log pengerjaan ujian. Setiap perubahan langsung tersinkronisasi ke perangkat siswa tanpa perlu reload halaman.
        </p>

        {/* Sub Navigation Tabs */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => setActiveSubTab('bank_soal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'bank_soal'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bank Soal ({soalList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pendaftar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'pendaftar'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pendaftar Siswa Baru</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hasil_ujian')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'hasil_ujian'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Hasil Ujian Siswa</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BANK SOAL CRUD */}
      {/* ======================================================== */}
      {activeSubTab === 'bank_soal' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 justify-between sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pertanyaan atau kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {soalList.length === 0 && !isLoadingSoal && (
                  <button
                    onClick={handleSeedSampleData}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Muat 5 Soal Contoh</span>
                  </button>
                )}

                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Soal Baru</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="Semua">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="Semua">Semua Status</option>
                <option value="aktif">Aktif (Tampil ke Siswa)</option>
                <option value="nonaktif">Nonaktif (Disembunyikan)</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingSoal && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-700">Menghubungkan ke Firestore & memuat bank soal...</p>
              <p className="text-[11px] text-slate-400">Listener real-time sedang disiapkan.</p>
            </div>
          )}

          {/* Error State */}
          {soalError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <h4 className="text-xs font-bold">Koneksi Firestore Gagal</h4>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">{soalError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Muat Ulang</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingSoal && !soalError && filteredSoal.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Belum Ada Soal di Koleksi Firestore</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Koleksi <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">bank_soal</code> saat ini masih kosong. Buat soal baru atau klik tombol di bawah untuk mengisi contoh data.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={handleSeedSampleData}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  Muat 5 Soal Contoh SMK
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  Buat Soal Manual
                </button>
              </div>
            </div>
          )}

          {/* List Soal */}
          {!isLoadingSoal && filteredSoal.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Menampilkan <strong>{filteredSoal.length}</strong> butir soal</span>
                <span className="text-[11px] text-slate-400">Urutan teratur berdasarkan nomor urut Firestore</span>
              </div>

              {filteredSoal.map((soal, idx) => (
                <div
                  key={soal.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-3 ${
                    soal.status === 'aktif'
                      ? 'border-slate-200 hover:border-blue-300'
                      : 'border-slate-200 bg-slate-50/70 opacity-80'
                  }`}
                >
                  {/* Top Bar Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {soal.kategori || 'Umum'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Bobot: {soal.bobotNilai || 10} Poin
                      </span>
                      {soal.status === 'aktif' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Aktif (Muncul di Siswa)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-amber-600" />
                          <span>Nonaktif (Disembunyikan)</span>
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        title={soal.status === 'aktif' ? 'Nonaktifkan Soal' : 'Aktifkan Soal'}
                        onClick={() => handleToggleStatus(soal.id, soal.status)}
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          soal.status === 'aktif'
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {soal.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>

                      <button
                        title="Edit Soal"
                        onClick={() => handleOpenEditModal(soal)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        title="Hapus Soal"
                        onClick={() => handleDeleteSoal(soal.id, soal.pertanyaan)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pertanyaan */}
                  <div className="text-xs font-bold text-slate-900 leading-relaxed">
                    {soal.pertanyaan}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {soal.pilihanJawaban?.map((opt) => {
                      const isCorrect = opt.key === soal.jawabanBenar;
                      return (
                        <div
                          key={opt.key}
                          className={`p-2 rounded-xl text-[11px] flex items-center gap-2 border transition-all ${
                            isCorrect
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                              : 'bg-slate-50/70 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md font-bold flex items-center justify-center text-[10px] ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="flex-1 truncate">{opt.text}</span>
                          {isCorrect && (
                            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider shrink-0">
                              Kunci Jawaban
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PENDAFTAR SISWA BARU */}
      {/* ======================================================== */}
      {activeSubTab === 'pendaftar' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Data Pendaftar Siswa Baru (Koleksi: <code>pendaftar</code>)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Siswa yang mendaftar melalui formulir registrasi langsung tercatat di sini.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                Total: {pendaftarList.length} Siswa
              </span>
            </div>

            {isLoadingPendaftar && (
              <div className="py-8 text-center text-xs text-slate-500">
                Memuat data pendaftar dari Firestore...
              </div>
            )}

            {pendaftarError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium">
                {pendaftarError}
              </div>
            )}

            {!isLoadingPendaftar && pendaftarList.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                Belum ada pendaftaran siswa baru yang masuk di Firestore.
              </div>
            )}

            {!isLoadingPendaftar && pendaftarList.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">NISN / NIS</th>
                      <th className="py-2.5 px-3">Asal Sekolah</th>
                      <th className="py-2.5 px-3">Jurusan</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendaftarList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.nama}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{p.nisn}</td>
                        <td className="py-2.5 px-3 text-slate-600">{p.asalSekolah || '-'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                            {p.jurusan}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.statusVerifikasi === 'terverifikasi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.statusVerifikasi === 'ditolak'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.statusVerifikasi || 'pending'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1.5">
                          {p.statusVerifikasi !== 'terverifikasi' && (
                            <button
                              onClick={async () => {
                                await updateVerifikasiPendaftar(p.id, 'terverifikasi');
                                showToast(`Siswa ${p.nama} berhasil diverifikasi!`);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Verifikasi
                            </button>
                          )}
                          {p.statusVerifikasi !== 'ditolak' && (
                            <button
                              onClick={async () => {
                                await updateVerifikasiPendaftar(p.id, 'ditolak');
                                showToast(`Pendaftaran ${p.nama} ditolak.`);
                              }}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Tolak
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: HASIL UJIAN SISWA */}
      {/* ======================================================== */}
      {activeSubTab === 'hasil_ujian' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Riwayat & Auto-Save Ujian Siswa (Koleksi: <code>hasil_ujian</code>)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Data progres disimpan bertahap tiap soal terjawab untuk mencegah hilangnya jawaban saat koneksi terputus.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                Total Sesi: {hasilList.length}
              </span>
            </div>

            {isLoadingHasil && (
              <div className="py-8 text-center text-xs text-slate-500">
                Memuat riwayat hasil ujian dari Firestore...
              </div>
            )}

            {hasilError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium">
                {hasilError}
              </div>
            )}

            {!isLoadingHasil && hasilList.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                Belum ada siswa yang mengerjakan ujian CBT Firestore.
              </div>
            )}

            {!isLoadingHasil && hasilList.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">Jurusan</th>
                      <th className="py-2.5 px-3">Progres Jawaban</th>
                      <th className="py-2.5 px-3">Skor Akhir</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Waktu Mulai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hasilList.map((h) => {
                      const answeredCount = Object.keys(h.jawaban || {}).length;
                      return (
                        <tr key={h.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{h.namaSiswa}</td>
                          <td className="py-2.5 px-3 text-slate-600">{h.jurusan || 'Umum'}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-blue-600">
                              {answeredCount} / {h.totalSoal || soalList.length} Soal
                            </span>
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, (answeredCount / (h.totalSoal || 1)) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            <span
                              className={`text-sm ${
                                h.skorAkhir >= 75 ? 'text-emerald-600' : 'text-amber-600'
                              }`}
                            >
                              {h.skorAkhir}
                            </span>
                            <span className="text-[10px] text-slate-400">/100</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                h.status === 'selesai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}
                            >
                              {h.status === 'selesai' ? 'Selesai' : 'Sedang Mengerjakan'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                            {h.waktuMulai ? new Date(h.waktuMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL FORM: TAMBAH / EDIT SOAL */}
      {/* ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {editingSoalId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingSoalId ? 'Edit Soal Firestore' : 'Tambah Soal Baru Firestore'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Perubahan langsung terkirim secara real-time ke halaman siswa.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSoal} className="space-y-3.5">
              {/* Pertanyaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Butir Pertanyaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  placeholder="Ketik pertanyaan soal di sini..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900"
                  required
                />
              </div>

              {/* Kategori & Bobot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori / Mapel
                  </label>
                  <input
                    type="text"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    placeholder="Contoh: DKV, TKJ, TBSM, Matematika..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bobot Nilai
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bobotNilai}
                    onChange={(e) => setBobotNilai(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Publikasi Soal
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('aktif')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                      status === 'aktif'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aktif (Muncul di Siswa)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('nonaktif')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                      status === 'nonaktif'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nonaktif (Sembunyikan)</span>
                  </button>
                </div>
              </div>

              {/* Opsi Pilihan Jawaban */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Pilihan Jawaban (Minimal 2, Tandai 1 Kunci Benar) <span className="text-rose-500">*</span>
                  </label>
                  {options.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Tambah Opsi
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {options.map((opt) => (
                    <div key={opt.key} className="flex items-center gap-2">
                      {/* Radio Kunci Jawaban */}
                      <button
                        type="button"
                        onClick={() => setJawabanBenar(opt.key)}
                        title="Jadikan sebagai Kunci Jawaban Benar"
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                          jawabanBenar === opt.key
                            ? 'bg-emerald-600 text-white shadow-xs scale-105'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {opt.key}
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(opt.key, e.target.value)}
                        placeholder={`Teks pilihan ${opt.key}...`}
                        className={`flex-1 p-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-hidden ${
                          jawabanBenar === opt.key
                            ? 'border-emerald-400 bg-emerald-50/20 ring-1 ring-emerald-300'
                            : 'border-slate-200'
                        }`}
                        required
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.key)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Klik tombol huruf (A, B, C, D, E) untuk memilihnya sebagai kunci jawaban yang benar.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Menyimpan ke Firestore...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingSoalId ? 'Simpan Perubahan' : 'Terbitkan Soal'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
