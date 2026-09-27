import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { SiteSettings } from '../types';

export interface PilihanJawaban {
  key: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface BankSoalDoc {
  id: string;
  pertanyaan: string;
  pilihanJawaban: PilihanJawaban[];
  jawabanBenar: string; // key of the correct option e.g. 'A'
  kategori: string; // Mapel / Tes Masuk / STS / SAS
  bobotNilai: number;
  status: 'aktif' | 'nonaktif';
  orderIndex: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface PendaftarDoc {
  id: string;
  nama: string;
  nisn: string;
  asalSekolah: string;
  jurusan: string;
  email?: string;
  phone?: string;
  statusVerifikasi: 'pending' | 'terverifikasi' | 'ditolak';
  createdAt: any;
}

export interface HasilUjianDoc {
  id: string;
  idPendaftar: string;
  namaSiswa: string;
  jurusan?: string;
  jawaban: Record<string, string>; // { [soalId]: optionKey }
  skorAkhir: number;
  totalSoal: number;
  status: 'mengerjakan' | 'selesai';
  waktuMulai: string;
  waktuSelesai?: string;
  updatedAt?: any;
}

// -------------------------------------------------------------
// SITE SETTINGS & APP STATE - Realtime Sync & Cross-Device Persistence
// -------------------------------------------------------------

/**
 * Realtime listener for site settings from Firestore (settings/site)
 * Automatically syncs logo, school name, theme, and CBT configuration across all devices
 */
export const subscribeSiteSettings = (
  onData: (settings: Partial<SiteSettings>) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (!isFirebaseConfigured) {
    if (onError) onError(new Error('Firebase belum terkonfigurasi.'));
    return () => {};
  }

  try {
    const docRef = doc(db, 'settings', 'site');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onData(data as Partial<SiteSettings>);
        } else {
          // If settings document does not exist in Firestore yet, seed initial settings
          saveSiteSettingsToFirestore({
            logoUrl: '/Logo-07(1).png',
            siteName: 'PRABUNET',
            schoolName: 'SMK Purnama Bakti',
            tagline: 'SMK Purnama Bakti. International Global Gateway School',
            themeColor: 'blue',
            cbtRedirectUrl: 'http://192.168.1.7/ujian',
            cbtMode: 'redirect',
            cbtAutoRedirect: true,
            secretAdminPassword: '@Purnama165',
          }).catch((err) => console.warn('Initial site settings seed notice:', err));
        }
      },
      (err) => {
        console.warn('Notice listening to site settings in Firestore:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Save / Update site settings in Firestore (settings/site)
 * Makes changes (e.g. logo, school name, theme) instantly visible across all browsers and devices
 */
export const saveSiteSettingsToFirestore = async (
  settings: Partial<SiteSettings>
): Promise<void> => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase belum aktif, penyimpanan hanya lokal.');
    return;
  }

  try {
    const docRef = doc(db, 'settings', 'site');
    // Sanitize any undefined properties to avoid Firestore write errors
    const sanitized: Record<string, any> = {};
    Object.entries(settings).forEach(([key, val]) => {
      if (val !== undefined) {
        sanitized[key] = val;
      }
    });

    await setDoc(
      docRef,
      {
        ...sanitized,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log('Site settings synced to Firestore successfully (settings/site)');
  } catch (err) {
    console.error('Gagal menyimpan site settings ke Firestore:', err);
    throw err;
  }
};

/**
 * Realtime listener for generic shared app state (teachers, students, schedules, exams, broadcasts)
 */
export const subscribeAppState = (
  key: string,
  onData: (data: any) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (!isFirebaseConfigured) return () => {};

  try {
    const docRef = doc(db, 'app_state', key);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const d = snapshot.data();
          if (d && d.payload !== undefined) {
            onData(d.payload);
          }
        }
      },
      (err) => {
        console.warn(`Notice subscribing to app_state/${key}:`, err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Save generic shared app state to Firestore (app_state/{key})
 */
export const saveAppStateToFirestore = async (key: string, payload: any): Promise<void> => {
  if (!isFirebaseConfigured) return;

  try {
    const docRef = doc(db, 'app_state', key);
    await setDoc(
      docRef,
      {
        payload,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`Failed to sync app_state/${key} to Firestore:`, err);
  }
};

// -------------------------------------------------------------
// BANK SOAL - Realtime Listener & CRUD
// -------------------------------------------------------------

/**
 * Realtime listener for all questions (Admin Panel)
 * Ordered consistently by orderIndex ascending
 */
export const subscribeBankSoal = (
  onData: (soalList: BankSoalDoc[]) => void,
  onError: (error: Error) => void
) => {
  if (!isFirebaseConfigured) {
    onError(new Error('Firebase belum terkonfigurasi. Periksa kredensial environment variable.'));
    return () => {};
  }

  try {
    const q = query(collection(db, 'bank_soal'), orderBy('orderIndex', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: BankSoalDoc[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<BankSoalDoc, 'id'>) });
        });
        onData(list);
      },
      (err) => {
        console.error('Error listening to bank_soal:', err);
        onError(err);
      }
    );
  } catch (err: any) {
    onError(err);
    return () => {};
  }
};

/**
 * Realtime listener for active questions only (Student Exam View)
 * Guaranteed consistent order without reshuffling on re-renders
 */
export const subscribeActiveBankSoal = (
  onData: (soalList: BankSoalDoc[]) => void,
  onError: (error: Error) => void
) => {
  if (!isFirebaseConfigured) {
    onError(new Error('Firebase belum terkonfigurasi'));
    return () => {};
  }

  try {
    const q = query(collection(db, 'bank_soal'), orderBy('orderIndex', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: BankSoalDoc[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as Omit<BankSoalDoc, 'id'>;
          if (data.status === 'aktif') {
            list.push({ id: d.id, ...data });
          }
        });
        onData(list);
      },
      (err) => {
        console.error('Error listening to active bank_soal:', err);
        onError(err);
      }
    );
  } catch (err: any) {
    onError(err);
    return () => {};
  }
};

/**
 * Input validation for Soal before Firestore write
 */
export const validateSoalInput = (
  pertanyaan: string,
  pilihanJawaban: PilihanJawaban[],
  jawabanBenar: string
): { isValid: boolean; message: string } => {
  if (!pertanyaan || pertanyaan.trim().length < 3) {
    return { isValid: false, message: 'Pertanyaan tidak boleh kosong (minimal 3 karakter).' };
  }

  const validOptions = pilihanJawaban.filter((p) => p.text.trim().length > 0);
  if (validOptions.length < 2) {
    return { isValid: false, message: 'Harus ada minimal 2 pilihan jawaban yang terisi teksnya.' };
  }

  if (!jawabanBenar || !pilihanJawaban.some((p) => p.key === jawabanBenar && p.text.trim().length > 0)) {
    return { isValid: false, message: 'Pilih salah satu pilihan jawaban sebagai kunci jawaban benar.' };
  }

  return { isValid: true, message: 'Valid' };
};

/**
 * Add a new question to Firestore bank_soal
 */
export const addSoalToFirestore = async (soal: Omit<BankSoalDoc, 'id'>) => {
  const validation = validateSoalInput(soal.pertanyaan, soal.pilihanJawaban, soal.jawabanBenar);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const colRef = collection(db, 'bank_soal');
  const docRef = await addDoc(colRef, {
    ...soal,
    orderIndex: soal.orderIndex ?? Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update an existing question in Firestore
 */
export const updateSoalInFirestore = async (id: string, soal: Partial<BankSoalDoc>) => {
  if (soal.pertanyaan !== undefined || soal.pilihanJawaban !== undefined || soal.jawabanBenar !== undefined) {
    // If updating content, validate
    if (soal.pertanyaan !== undefined && soal.pilihanJawaban !== undefined && soal.jawabanBenar !== undefined) {
      const validation = validateSoalInput(soal.pertanyaan, soal.pilihanJawaban, soal.jawabanBenar);
      if (!validation.isValid) throw new Error(validation.message);
    }
  }

  const docRef = doc(db, 'bank_soal', id);
  await updateDoc(docRef, {
    ...soal,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a question from Firestore
 */
export const deleteSoalFromFirestore = async (id: string) => {
  const docRef = doc(db, 'bank_soal', id);
  await deleteDoc(docRef);
};

/**
 * Toggle active / inactive status of a question
 */
export const toggleStatusSoalInFirestore = async (id: string, currentStatus: 'aktif' | 'nonaktif') => {
  const nextStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
  const docRef = doc(db, 'bank_soal', id);
  await updateDoc(docRef, {
    status: nextStatus,
    updatedAt: serverTimestamp(),
  });
  return nextStatus;
};

// -------------------------------------------------------------
// PENDAFTAR (PPDB / Siswa Baru)
// -------------------------------------------------------------

export const subscribePendaftar = (
  onData: (pendaftarList: PendaftarDoc[]) => void,
  onError: (error: Error) => void
) => {
  if (!isFirebaseConfigured) {
    onError(new Error('Firebase belum terkonfigurasi'));
    return () => {};
  }

  try {
    const q = query(collection(db, 'pendaftar'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: PendaftarDoc[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<PendaftarDoc, 'id'>) });
        });
        onData(list);
      },
      (err) => {
        console.error('Error listening to pendaftar:', err);
        onError(err);
      }
    );
  } catch (err: any) {
    onError(err);
    return () => {};
  }
};

export const registerPendaftarToFirestore = async (
  data: Omit<PendaftarDoc, 'id' | 'statusVerifikasi' | 'createdAt'>
) => {
  if (!data.nama.trim() || !data.nisn.trim()) {
    throw new Error('Nama dan NISN/NIS wajib diisi.');
  }

  const colRef = collection(db, 'pendaftar');
  const docRef = await addDoc(colRef, {
    ...data,
    statusVerifikasi: 'pending',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateVerifikasiPendaftar = async (
  id: string,
  status: 'pending' | 'terverifikasi' | 'ditolak'
) => {
  const docRef = doc(db, 'pendaftar', id);
  await updateDoc(docRef, { statusVerifikasi: status });
};

// -------------------------------------------------------------
// HASIL UJIAN - Incremental Auto-Save & Scoring
// -------------------------------------------------------------

export const subscribeHasilUjian = (
  onData: (list: HasilUjianDoc[]) => void,
  onError: (error: Error) => void
) => {
  if (!isFirebaseConfigured) {
    onError(new Error('Firebase belum terkonfigurasi'));
    return () => {};
  }

  try {
    const q = query(collection(db, 'hasil_ujian'), orderBy('updatedAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: HasilUjianDoc[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<HasilUjianDoc, 'id'>) });
        });
        onData(list);
      },
      (err) => {
        console.error('Error listening to hasil_ujian:', err);
        onError(err);
      }
    );
  } catch (err: any) {
    onError(err);
    return () => {};
  }
};

/**
 * Inisialisasi atau dapatkan sesi ujian siswa untuk auto-save
 */
export const initHasilUjianSession = async (
  idPendaftar: string,
  namaSiswa: string,
  totalSoal: number,
  jurusan?: string
): Promise<string> => {
  const colRef = collection(db, 'hasil_ujian');
  const docRef = await addDoc(colRef, {
    idPendaftar,
    namaSiswa,
    jurusan: jurusan || 'Umum',
    jawaban: {},
    skorAkhir: 0,
    totalSoal,
    status: 'mengerjakan',
    waktuMulai: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Auto-save tiap soal terjawab (incremental persistence)
 */
export const autoSaveJawabanSoal = async (
  hasilUjianId: string,
  soalId: string,
  jawabanOptionKey: string
) => {
  if (!hasilUjianId) return;
  const docRef = doc(db, 'hasil_ujian', hasilUjianId);
  await updateDoc(docRef, {
    [`jawaban.${soalId}`]: jawabanOptionKey,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Finalisasi ujian dengan skor akhir
 */
export const finalizeHasilUjian = async (
  hasilUjianId: string,
  skorAkhir: number
) => {
  if (!hasilUjianId) return;
  const docRef = doc(db, 'hasil_ujian', hasilUjianId);
  await updateDoc(docRef, {
    skorAkhir,
    status: 'selesai',
    waktuSelesai: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Seed initial sample questions into Firestore if bank_soal is empty
 */
export const seedInitialBankSoalIfEmpty = async () => {
  if (!isFirebaseConfigured) return;
  try {
    const colRef = collection(db, 'bank_soal');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) return; // Already has data

    const defaultQuestions: Omit<BankSoalDoc, 'id'>[] = [
      {
        pertanyaan: 'Dalam hierarki Kurikulum Merdeka dan Industri Kreatif, apa fungsi utama dari Color Grading dalam pascaproduksi Desain Komunikasi Visual (DKV)?',
        pilihanJawaban: [
          { key: 'A', text: 'Menghapus noise audio pada video' },
          { key: 'B', text: 'Menyesuaikan mood, atmosfer sinematik, dan konsistensi warna visual cerita' },
          { key: 'C', text: 'Mempercepat proses rendering 3D' },
          { key: 'D', text: 'Mengurangi ukuran file tanpa kompresi visual' },
        ],
        jawabanBenar: 'B',
        kategori: 'DKV & Kejuruan',
        bobotNilai: 10,
        status: 'aktif',
        orderIndex: 1,
      },
      {
        pertanyaan: 'Protokol jaringan yang bertugas memberikan alamat IP otomatis kepada klien dalam jaringan lokal (LAN) adalah...',
        pilihanJawaban: [
          { key: 'A', text: 'DNS (Domain Name System)' },
          { key: 'B', text: 'DHCP (Dynamic Host Configuration Protocol)' },
          { key: 'C', text: 'SMTP (Simple Mail Transfer Protocol)' },
          { key: 'D', text: 'FTP (File Transfer Protocol)' },
        ],
        jawabanBenar: 'B',
        kategori: 'TKJ / Jaringan',
        bobotNilai: 10,
        status: 'aktif',
        orderIndex: 2,
      },
      {
        pertanyaan: 'Pada sistem injeksi sepeda motor (Electronic Fuel Injection / EFI), komponen yang bertugas mendeteksi suhu cairan pendingin mesin adalah...',
        pilihanJawaban: [
          { key: 'A', text: 'ECT / EOT (Engine Coolant/Oil Temperature Sensor)' },
          { key: 'B', text: 'MAP (Manifold Absolute Pressure Sensor)' },
          { key: 'C', text: 'TPS (Throttle Position Sensor)' },
          { key: 'D', text: 'O2 (Oxygen Sensor)' },
        ],
        jawabanBenar: 'A',
        kategori: 'TBSM / Otomotif',
        bobotNilai: 10,
        status: 'aktif',
        orderIndex: 3,
      },
      {
        pertanyaan: 'Pilar utama "SMK Bisa - SMK Hebat" dalam budaya kerja industri 5R/5S yang menekankan pada keteraturan dan pemilahan barang adalah...',
        pilihanJawaban: [
          { key: 'A', text: 'Ringkas (Seiri)' },
          { key: 'B', text: 'Rapi (Seiton)' },
          { key: 'C', text: 'Resik (Seiso)' },
          { key: 'D', text: 'Rawat (Seiketsu)' },
        ],
        jawabanBenar: 'A',
        kategori: 'Budaya Kerja Industri',
        bobotNilai: 10,
        status: 'aktif',
        orderIndex: 4,
      },
      {
        pertanyaan: 'Prinsip desain grafis yang berfungsi untuk menarik perhatian audiens pertama kali pada elemen terpenting dalam poster adalah...',
        pilihanJawaban: [
          { key: 'A', text: 'Emphasis (Pusat Perhatian / Titik Berat)' },
          { key: 'B', text: 'Balance (Keseimbangan)' },
          { key: 'C', text: 'Rhythm (Irama)' },
          { key: 'D', text: 'Proportion (Proporsi)' },
        ],
        jawabanBenar: 'A',
        kategori: 'DKV & Kejuruan',
        bobotNilai: 10,
        status: 'aktif',
        orderIndex: 5,
      },
    ];

    for (const q of defaultQuestions) {
      await addDoc(colRef, {
        ...q,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log('Seeded initial questions to Firestore bank_soal');
  } catch (err) {
    console.warn('Initial seed bank_soal notice:', err);
  }
};
