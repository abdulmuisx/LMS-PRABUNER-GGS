import { MeetingModule, Subject } from '../types';

// Topic blueprints for 30 meetings per subject category / specific subjects
const DKV_FOTOGRAFI_TOPICS = [
  'Pengenalan Dunia Fotografi & Sejarah Perkembangan Kamera',
  'Anatomi Kamera DSLR & Mirrorless: Sensor, Shutter, & Lensa',
  'Segitiga Eksposur (Exposure Triangle): Aperture (Bukaan Diafragma)',
  'Segitiga Eksposur: Shutter Speed & Efek Motion (Freeze & Panning)',
  'Segitiga Eksposur: ISO & Manajemen Noise pada Gambar',
  'Karakteristik & Jenis Lensa (Prime, Zoom, Wide, Tele, Macro)',
  'Teknik Fokus: Manual Focus vs Autofocus (AF-S, AF-C, Eye AF)',
  'Depth of Field (DoF): Menciptakan Efek Bokeh Estetik',
  'Komposisi Dasar: Rule of Thirds & Golden Ratio',
  'Komposisi Lanjutan: Leading Lines, Framing, & Symmetry',
  'Sudut Pengambilan Gambar (Camera Angle: Low, High, Eye, Bird View)',
  'Karakteristik Cahaya Alami (Golden Hour, Blue Hour, Hard vs Soft Light)',
  'Review Materi & Uji Keterampilan Praktek Outdoor Photography',
  'Pengenalan Lighting Studio: Continuous Light vs Strobe / Flash',
  'Aksesoris Studio: Softbox, Reflector, Diffuser, & Beauty Dish',
  'Teknik 3-Point Lighting (Key Light, Fill Light, Backlight)',
  'Fotografi Still Life & Penataan Objek Produk',
  'Fotografi Potret (Portraiture) & Komunikasi dengan Model',
  'Fotografi Dokumentasi Event & Kecepatan Menangkap Momen',
  'Street Photography & Etika Memotret di Ruang Publik',
  'Format File Foto: RAW vs JPEG serta Color Space (sRGB vs Adobe RGB)',
  'Manajemen File Foto, Ingest Data, & Seleksi di Adobe Lightroom',
  'Teknik Dasar Color Grading & Exposure Correction di Lightroom',
  'Retouching Dasar di Adobe Photoshop (Spot Healing & Clone Stamp)',
  'Teknik Frequency Separation untuk Kulit Portrait Halus Alami',
  'Dodging & Burning untuk Mempertegas Dimensi Visual',
  'Pembuatan Moodboard Fotografi Komersial Berdasarkan Brief Klien',
  'Eksekusi Proyek Foto Komersial Produk UMKM Lokal',
  'Kurasi Karya Terbaik & Penyusunan Layout Portofolio PDF',
  'Presentasi & Pameran Mini Portofolio Fotografi Siswa',
];

const DKV_KOMPUTER_GRAFIS_TOPICS = [
  'Pengenalan Industri Desain Grafis & Standar Perangkat Komputer',
  'Perbedaan Mendasar Grafik Vektor vs Raster (Bitmap) & Resolusi PPI',
  'Antarmuka & Workspace Adobe Illustrator / CorelDraw',
  'Penguasaan Pen Tool & Shape Builder Tool untuk Konstruksi Bentuk',
  'Teori Warna Digital: RGB vs CMYK, Psikologi Warna, & Palet Warna',
  'Teknik Gradasi Warna (Gradients & Mesh Tool)',
  'Prinsip Tipografi Digital: Font Pairing, Tracking, & Kerning',
  'Pembuatan Ikon Vektor Set (Flat Design & Outline Style)',
  'Konstruksi Logo Geometris dengan Grid System',
  'Desain Poster Promosi Vektor Berbasis Visi Komunikasi',
  'Antarmuka & Workspace Adobe Photoshop',
  'Seleksi Presisi: Quick Selection, Lasso, & Pen Tool Masking',
  'Manajemen Layer, Grouping, & Blending Modes',
  'Teknik Layer Masking & Clipping Masking Tanpa Merusak Gambar',
  'Adjustment Layers: Levels, Curves, Hue/Saturation, & Color Balance',
  'Manipulasi Foto (Photo Manipulation) Menggabungkan Multi Objek',
  'Penciptaan Efek Pencahayaan & Bayangan Realistis pada Objek',
  'Desain Banner Media Sosial (Instagram Feed & Carousel)',
  'Desain Spanduk & Baliho dengan Standar Cetak Percetakan Offset',
  'Teknik Mockup Produk 3D (T-Shirt, Kemasan Botol, & Box)',
  'Desain Identitas Visual Perusahaan (Kartu Nama, Kop Surat, Map)',
  'Prinsip Layouting Editorial: Grid Kolom, Margin, & Bleed',
  'Pengenalan Adobe InDesign untuk Buku Katalog & Brosur Lipat Tiga',
  'Desain Kemasan (Packaging Design) & Pembuatan Jaring-Jaring Dieline',
  'Digital Art & Matte Painting Sederhana',
  'Optimalisasi Format Output: PDF Print, SVG, WebP, & PNG Transparan',
  'Manajemen Aset & Kolaborasi Proyek Desain di Cloud',
  'Pengerjaan Proyek Desain Branding Lengkap untuk Usaha Nyata',
  'Finalisasi File Siap Cetak (Color Separation, Crop Marks, Font Outline)',
  'Gelar Karya Desain Grafis & Evaluasi Desain Bersama',
];

const TKJ_ASJ_TOPICS = [
  'Pengenalan Sistem Operasi Jaringan & Peran Server di Industri',
  'Perencanaan Topologi Jaringan Server & Kebutuhan Spesifikasi Hardware',
  'Instalasi Sistem Operasi Server Linux Debian / Ubuntu CLI',
  'Perintah Dasar Linux CLI, File Hierarchy Structure, & Permission CHMOD',
  'Konfigurasi Static IP Address, Gateway, & DNS Resolver di Linux',
  'Manajemen User, Group, & Keamanan Hak Akses Sudoer',
  'Konfigurasi Remote Access Server: OpenSSH & SSH Key Authentication',
  'Konfigurasi DHCP Server (ISC-DHCP-Server) & IP Reservation',
  'Pengenalan Domain Name System (DNS) & Konsep Forward/Reverse Zone',
  'Instalasi & Konfigurasi DNS Server BIND9 Lokal',
  'Troubleshooting DNS dengan Nslookup, Dig, & Ping Test',
  'Instalasi Web Server Apache2 & Nginx',
  'Konfigurasi Virtual Host (Multiple Domains dalam Satu IP)',
  'Instalasi Database Server MariaDB / MySQL & phpMyAdmin',
  'Integrasi Web Server dengan PHP Engine (LAMP / LEMP Stack)',
  'Instalasi & Konfigurasi SSL/TLS Certificate (HTTPS & Let\'s Encrypt)',
  'Konfigurasi FTP Server (ProFTPD / VSFTPD) & User Chroot Jailing',
  'Instalasi File Sharing Server Lintas Platform dengan SAMBA',
  'Konfigurasi NTP Server (Chrony) untuk Sinkronisasi Waktu Jaringan',
  'Konfigurasi Mail Server: Postfix (SMTP), Dovecot (IMAP/POP3)',
  'Instalasi Webmail Client (Roundcube) & Pengujian Kirim Email',
  'Konfigurasi Proxy Server (Squid) & Pemblokiran Konten Situs',
  'Keamanan Server: Konfigurasi Firewall UFW & IPTables',
  'Pencegahan Serangan Brute Force dengan Fail2ban',
  'Monitoring Kinerja Server dengan Htop, Netdata, & Cacti',
  'Teknik Backup Terjadwal Otomatis Menggunakan Cron Job & Rsync',
  'Pengenalan Virtualisasi Server & Container Docker Dasar',
  'Deploy Aplikasi Web Sederhana Menggunakan Docker Compose',
  'Troubleshooting Komprehensif Masalah Jaringan & Layanan Server',
  'Uji Sertifikasi Kompetensi Simulasi Administrasi Server Mandiri',
];

const TBSM_MESIN_TOPICS = [
  'K3 di Bengkel Otomotif Sepeda Motor & Penanganan Limbah Cair',
  'Prinsip Kerja & Siklus Termodinamika Mesin 4-Langkah (4-Tak)',
  'Prinsip Kerja & Karakteristik Mesin 2-Langkah (2-Tak)',
  'Penggunaan Alat Ukur Presisi: Micrometer Luar, Dial Bore Gauge, Feeler Gauge',
  'Konstruksi Kepala Silinder (Cylinder Head) & Mekanisme Katup (Valve Train)',
  'Pemeriksaan & Penyetelan Celah Katup (Valve Clearance Shim & Screw)',
  'Bongkar Pasang & Pengukuran Keausan Camshaft (Noken As) & Rocker Arm',
  'Overhaul Blok Silinder: Pengukuran Keovalan & Ketirusan Silinder',
  'Pemeriksaan Piston, Celah Ring Piston, & Piston Pin',
  'Sistem Pelumasan Mesin: Alur Sirkulasi Oli, Pompa Oli, & Filter',
  'Sistem Pendingin Udara, Sirip Pendingin, & Sistem Radiator Cairan (Coolant)',
  'Prinsip Kerja Sistem Bahan Bakar Karburator Konvensional',
  'Bongkar Pasang, Pembersihan Main Jet, Slow Jet, & Penyetelan Udara Karburator',
  'Troubleshooting Gangguan Karburator (Banjir, Brebet, Campuran Gemuk/Kurus)',
  'Pengenalan Sistem Injeksi Elektronik (Electronic Fuel Injection / EFI)',
  'Fungsi & Cara Kerja Sensor EFI (TP, MAP, IAT, EOT/ECT, O2 Sensor)',
  'Fungsi & Cara Kerja Actuator EFI (Fuel Injector, IACV, Fuel Pump)',
  'Penggunaan Diagnostic Tool (Scanner OBD Motor) Membaca Kode DTC',
  'Reset ECM/ECU & Kalibrasi Sensor Throttle Position (TP Reset)',
  'Pemeriksaan Tekanan Pompa Bahan Bakar (Fuel Pressure Gauge Test)',
  'Mekanisme Kopling Manual: Plat Kopling, Kampas, Pegas, & Rumah Kopling',
  'Pemeriksaan & Penggantian Kampas Kopling Manual',
  'Mekanisme Transmisi Manual (Gearbox, Shift Fork, Drum Selector)',
  'Mekanisme Transmisi Otomatis CVT (V-Belt, Roller Weight, Pulley Primer & Sekunder)',
  'Pemeriksaan Keausan V-Belt, Diameter Roller, & Kampas Ganda Matik',
  'Sistem Pembuangan (Knalpot), Catalytic Converter, & Uji Emisi Gas Buang',
  'Analisa Kerusakan Suara Kasar Mesin (Noise Diagnostic Engine)',
  'Tune Up Komprehensif Mesin Sepeda Motor Sesuai SOP Pabrikan (APM)',
  'Kalkulasi Biaya Jasa Servis & Penggantian Sparepart Mesin',
  'Uji Praktek Troubleshooting & Evaluasi Kelayakan Jalan Mesin',
];

const GENERIC_GENERAL_TOPICS = [
  'Orientasi Pembelajaran, Kontrak Belajar, & Refleksi Awal',
  'Konsep Fundamental & Landasan Teori Utama',
  'Identifikasi Masalah Kontekstual di Dunia Nyata',
  'Metode Analisis & Pendekatan Berpikir Kritis',
  'Studi Kasus 1: Penerapan Konsep pada Kasus Sederhana',
  'Latihan Terbimbing & Penguatan Pemahaman Konseptual',
  'Teknik Pengumpulan & Pemilahan Data yang Relevan',
  'Pengolahan Data & Penarikan Kesimpulan Awal',
  'Diskusi Kelompok: Sintesis Pandangan Beragam',
  'Penyusunan Solusi Berbasis Data & Logika Ilmiah',
  'Penggunaan Instrumen / Tools Pendukung Efektif',
  'Eksplorasi Kasus Lanjutan & Variasi Tantangan',
  'Evaluasi Tengah Semester & Refleksi Capaian Belajar',
  'Pengembangan Kerangka Kerja (Framework) Terapan',
  'Integrasi Nilai Etika, Profesionalisme, & K3',
  'Simulasi & Praktik Mandiri Tahap 1',
  'Analisis Kesalahan Umum (Troubleshooting & Debugging)',
  'Teknik Optimasi & Peningkatan Efisiensi',
  'Studi Kasus 2: Penerapan Konsep pada Industri Terkait',
  'Kolaborasi Tim dalam Menyelesaikan Masalah Kompleks',
  'Pembuatan Laporan Kerja & Dokumentasi Terstruktur',
  'Teknik Presentasi & Komunikasi Gagasan Teknis',
  'Umpan Balik Rekan Sejawat (Peer Review)',
  'Revisi & Penyempurnaan Hasil Proyek',
  'Penerapan Standar Industri & Kualitas Kerja',
  'Persiapan Portofolio & Bukti Belajar Mandiri',
  'Simulasi Uji Praktik Mandiri Tahap 2',
  'Penyusunan Rencana Tindak Lanjut & Penerapan di Magang/PKL',
  'Gelar Karya / Sidang Paparan Hasil Pembelajaran',
  'Evaluasi Akhir Semester & Rangkuman Capaian Pembelajaran',
];

export function getTopicsForSubject(subject: Subject): string[] {
  const name = subject.name.toUpperCase();
  const jurusan = subject.jurusan;

  if (name.includes('FOTOGRAFI')) {
    return DKV_FOTOGRAFI_TOPICS;
  }
  if (name.includes('GRAFIS') || name.includes('SKETSA') || name.includes('DESAIN') || name.includes('TIPOGRAFI') || name.includes('KARYA')) {
    return DKV_KOMPUTER_GRAFIS_TOPICS;
  }
  if (name.includes('JARINGAN') || name.includes('SISTEM') || name.includes('ROBOTIK') || name.includes('ELEKTRONIKA') || name.includes('INFORMATIKA')) {
    return TKJ_ASJ_TOPICS;
  }
  if (name.includes('OTOMOTIF') || name.includes('MESIN') || name.includes('LISTRIK') || name.includes('BENGKEL')) {
    return TBSM_MESIN_TOPICS;
  }

  return GENERIC_GENERAL_TOPICS;
}

export function generate30MeetingsForSubject(subject: Subject): MeetingModule[] {
  const topics = getTopicsForSubject(subject);
  const meetings: MeetingModule[] = [];

  for (let i = 1; i <= 30; i++) {
    const topicTitle = topics[i - 1] || `Materi Pertemuan ${i}: Eksplorasi & Terapan Lanjutan`;
    const theme = i <= 6 ? 'Dasar & Konseptual' : i <= 14 ? 'Praktik Terbimbing & Analisis' : i <= 22 ? 'Aplikasi Lanjutan & Troubleshooting' : 'Proyek Terapan, Portofolio & Uji Mandiri';

    const learningObjective = `Peserta didik mampu memahami, menjelaskan prinsip kerja, serta mempraktikkan secara mandiri prosedur "${topicTitle}" sesuai dengan Standar Operasional Prosedur (SOP) dan Kurikulum Merdeka Kejuruan.`;

    const theorySummary = `Pada Pertemuan ${i}, fokus pembelajaran diarahkan pada penguasaan materi "${topicTitle}". Siswa diajak untuk menelaah konsep dasar, alur kerja teknis, serta standar keselamatan kerja dan mutu yang relevan di bidang industri ${subject.jurusan === 'SEMUA' ? 'pendidikan vokasi' : subject.jurusan}.\n\nPembahasan mencakup telaah teori mendalam, identifikasi komponen/perangkat yang digunakan, analisis penyebab kendala (troubleshooting), serta metode pengujian hasil kerja yang terukur.`;

    const detailedContent = `### 1. Landasan Teori & Konsep Kunci
Materi pada pertemuan ke-${i} ini membahas secara komprehensif mengenai **${topicTitle}**. Dalam konteks ${subject.name}, pemahaman ini menjadi pondasi penting untuk mencapai kompetensi kerja yang dipersyaratkan oleh industri mitra SMK Purnama Bakti.

### 2. Langkah Kerja / Prosedur Standar (SOP)
1. **Persiapan**: Menyiapkan alat pelindung diri (APD), lembar kerja, serta instrumen/software pendukung.
2. **Pemeriksaan Awal**: Melakukan pengecekan kondisi fisik perangkat / file kerja awal.
3. **Eksekusi Langkah Kerja**: Menerapkan instruksi teknis sesuai modul materi ${subject.code}.
4. **Validasi & Pengujian**: Menguji hasil kerja menggunakan parameter keberhasilan yang telah ditentukan.
5. **Pembersihan & Dokumentasi**: Mencatat hasil temuan pada LKPD dan merapikan workstation.

### 3. Tips Praktis & Best Practice Industri
- Selalu patuhi standar ketelitian dan keselamatan kerja (K3).
- Buat catatan ringkas terhadap kendala tak terduga yang muncul selama proses pengerjaan.
- Konsultasikan hasil sementara dengan guru pengampu (${subject.teacherName}) untuk verifikasi kualitas.`;

    const keyTerms = [
      `SOP ${subject.jurusan}`,
      topicTitle.split(' ')[0] || 'Teknik Dasar',
      'Parameter Kualitas',
      'Kurikulum Merdeka SMK',
    ];

    const lkpd = {
      id: `lkpd-${subject.id}-m${i}`,
      title: `LKPD Pertemuan ${i}: ${topicTitle}`,
      description: `Lembar Kerja Peserta Didik untuk menguji pemahaman teori dan kecakapan praktik pada topik "${topicTitle}".`,
      instructions: [
        'Baca ringkasan materi dan modul pembelajaran pertemuan ini dengan seksama.',
        'Lakukan observasi / praktik langsung di bengkel, lab komputer, atau lingkungan belajar mandiri.',
        'Jawab pertanyaan analisis dan lengkapi tabel laporan kerja yang tertera pada lembar LKPD.',
        'Unggah laporan hasil kerja dalam format PDF / ringkasan teks sebelum batas waktu yang ditentukan.',
      ],
      submissionType: 'both' as const,
      maxScore: 100,
      dueDate: `2026-09-${(i % 28) + 1}`,
    };

    meetings.push({
      meetingNumber: i,
      title: topicTitle,
      theme,
      learningObjective,
      theorySummary,
      detailedContent,
      keyTerms,
      referenceResources: [
        {
          type: 'doc',
          title: `Modul Pembelajaran Pertemuan ${i} - ${subject.name}`,
          url: '#',
        },
        {
          type: 'video',
          title: `Video Tutorial Praktik: ${topicTitle}`,
          url: '#',
        },
      ],
      lkpd,
      isCompleted: i <= 3, // mock first 3 completed
    });
  }

  return meetings;
}
