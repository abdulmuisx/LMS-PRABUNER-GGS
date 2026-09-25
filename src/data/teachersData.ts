import { TeacherAccount } from '../types';

export const DEFAULT_TEACHER_PASSWORD = 'SMKPBMAJU';

export const INITIAL_TEACHERS: TeacherAccount[] = [
  {
    no: 1,
    name: 'Mr. Ryan Burhanis S., S.Pd.',
    email: 'ryan_sultan@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'B. INGGRIS',
        classes: 'XI TKJ A, XI DKV, XI TBSM A DAN XI TBSM B',
      },
    ],
  },
  {
    no: 2,
    name: 'Mrs. Rany Larach, M.Pd., Gr.',
    email: 'rany_larach@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'MATEMATIKA',
        classes: 'X, XI (DKV, TBSM A, DAN TBSM B)',
      },
    ],
  },
  {
    no: 3,
    name: 'Mrs. Intan Afrianti, M.Pd., Gr.',
    email: 'intan_afrianti@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'MATEMATIKA',
        classes: 'XI (TKJ A DAN TKJ B), XII',
      },
    ],
  },
  {
    no: 4,
    name: 'Mr Dr. Abdul Muis, M.M., Gr.',
    email: 'abdul_muis@smkpurnamabakti.sch.id',
    subjects: [
      { name: 'PROJECT KARYA', classes: 'XII DKV' },
      { name: 'UI/UX DESAIN', classes: 'XII DKV' },
      { name: 'FOTOGRAFI DAN VIDEOGRAFI', classes: 'XII DKV' },
      { name: 'PRODUK KREATIF', classes: 'XI DKV' },
      { name: 'ADMINISTRASI SISTEM JARINGAN', classes: 'XII TKJ' },
    ],
  },
  {
    no: 5,
    name: 'Deri Arisandi, S.Kom.',
    email: 'deri@smkpurnamabakti.sch.id',
    subjects: [
      { name: 'KOMPUTER GRAFIS LANJUTAN', classes: 'XI DKV' },
      { name: 'FOTOGRAFI LANJUTAN', classes: 'XI DKV' },
      { name: 'VIDEOGRAFI DAN MOTION GRAFIK', classes: 'XI DKV' },
      { name: 'FOTOGRAFI DASAR', classes: 'X DKV' },
      { name: 'KOMPUTER GRAFIS DASAR', classes: 'X DKV' },
      { name: 'TEKNIK PEMASARAN DIGITAL', classes: 'XI DKV' },
    ],
  },
  {
    no: 6,
    name: 'Mr. Muhamad Baidhawi, S.Sos.',
    email: 'baidhawi@smkpurnamabakti.sch.id',
    subjects: [
      { name: 'SKETSA DAN ILUSTRASI DASAR', classes: 'X DKV' },
      { name: 'KOMPOSISI TIPOGRAFI', classes: 'X DKV' },
      { name: 'SENI KRIYA', classes: 'X DKV' },
    ],
  },
  {
    no: 7,
    name: 'Ms. Harul Aini M., S.Sos.',
    email: 'harul@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'B. ARAB',
        classes: 'X (DKV DAN TBSM A DAN TBSM B), XII (SEMUA JURUSAN)',
      },
      {
        name: 'B. ARAB',
        classes: 'X TKJ A DAN B',
      },
    ],
  },
  {
    no: 8,
    name: 'Mr. Supriyadi',
    email: 'supriyadi@smkpurnamabakti.sch.id',
    subjects: [
      { name: 'ADMINISTRASI SISTEM JARINGAN', classes: 'XI TKJ A DAN B' },
      { name: 'TEKNOLOGI LAYANAN JARINGAN', classes: 'XI TKJ A DAN B' },
      { name: 'TEKNOLOGI LAYANAN JARINGAN', classes: 'XII TKJ' },
    ],
  },
  {
    no: 9,
    name: 'Mr. Aryanada Putra',
    email: 'aryanandaputra@smkpurnamabakti.sch.id',
    subjects: [
      { name: 'ELEKTRONIKA', classes: 'X, XI TKJ A DAN B' },
      { name: 'SISTEM KOMPUTER', classes: 'X TKJ B' },
      { name: 'ROBOTIK', classes: 'XII TKJ' },
    ],
  },
  {
    no: 10,
    name: 'Ms. Desifa Ramdani Minhar, S.Ap.',
    email: 'desifa@smkpurnamabakti.sch.id',
    subjects: [
      { name: 'INFORMATIKA', classes: 'X (SEMUA JURUSAN)' },
      { name: 'PENDIDIKAN PANCASILA', classes: 'XI (TKJ A DAN TKJ B)' },
    ],
  },
  {
    no: 11,
    name: 'Mr. Ferry J Suherman, S.Pd',
    email: 'ferry@smkpurnamabakti.sch.id',
    subjects: [
      { name: 'PEMELIHARAAN DASAR TEKNIK OTOMOTIF', classes: 'X TBSM A' },
      { name: 'GAMBAR TEKNIK OTOMOTIF', classes: 'X TBSM A DAN TBSM B' },
      {
        name: 'PEMELIHARAAN LISTRIK SEPEDA MOTOR',
        classes: 'XI TBSM A DAN XI TBSM B, XII TBSM',
      },
    ],
  },
  {
    no: 12,
    name: 'Mr. Reza Ahmad Musyafi, S.Kom',
    email: 'reza_ahmad@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'PEMELIHARAAN MESIN SEPEDA MOTOR',
        classes: 'XI TBSM A DAN XI TBSM B, XII TBSM',
      },
      {
        name: 'PEMELIHARAAN BENGKEL SEPEDA MOTOR',
        classes: 'XI TBSM A DAN XI TBSM B',
      },
    ],
  },
  {
    no: 13,
    name: 'Mrs. Kadinem, S.Pd',
    email: 'kadinem@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'B. INGGRIS',
        classes: 'X (TBSM A DAN TBSM B, TKJ B, DKV)',
      },
      {
        name: 'B. INGGRIS',
        classes: 'XII SEMUA JURUSAN',
      },
    ],
  },
  {
    no: 14,
    name: 'Mr. Alfan Subkhi, S.Kom.',
    email: 'alfan@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'B. JEPANG',
        classes: 'X (DKV DAN TBSM), XI, XII SEMUA JURUSAN',
      },
      {
        name: 'B. JEPANG',
        classes: 'X TKJ A DAN B',
      },
      {
        name: 'SISTEM KOMPUTER',
        classes: 'X TKJ A',
      },
    ],
  },
  {
    no: 15,
    name: 'Mr. Fathi Khairullah, S.Pd',
    email: 'fathi@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'PAI',
        classes: 'X, XI, XII (SEMUA JURUSAN)',
      },
      {
        name: 'B. ARAB',
        classes: 'XI SEMUA JURUSAN',
      },
    ],
  },
  {
    no: 16,
    name: 'Mr Ahmad Fauzan, S.Pd.',
    email: 'fauzanjamal@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'PJOK',
        classes: 'X (DKV, TKJ A DAN TKJ B), XI, XII (SEMUA JURUSAN)',
      },
      {
        name: 'PEMELIHARAAN DASAR TEKNIK OTOMOTIF',
        classes: 'X TBSM B',
      },
      {
        name: 'PENGELOLAAN BENGKEL SEPEDA MOTOR',
        classes: 'XII TBSM',
      },
    ],
  },
  {
    no: 17,
    name: 'M. Rikbal Riansyah',
    email: 'rikbal@smkpurnamabakti.sch.id',
    subjects: [
      {
        name: 'DASAR TEKNIK OTOMOTIF',
        classes: 'X TBSM A DAN X TBSM B',
      },
      {
        name: 'PJOK',
        classes: 'X (TBSM A DAN TBSM B)',
      },
    ],
  },
];
