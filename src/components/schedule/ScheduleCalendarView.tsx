import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduleItem } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Trash2,
  Sparkles,
  Bell,
  BellRing,
  ExternalLink,
  Download,
  Smartphone,
  Check,
  Lock,
  LogIn,
  Shield,
  Crown,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

export const ScheduleCalendarView: React.FC = () => {
  const { currentUser, schedules, subjects, addSchedule, updateScheduleItem, deleteScheduleItem } = useApp();

  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('Semua');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  // Auth Modal State for locked view
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'admin' | 'teacher' | 'student' | 'register'>('student');

  // Google Calendar & Notification State
  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('prabunet_notif_enabled') === 'true';
  });
  const [notificationMinutesBefore, setNotificationMinutesBefore] = useState<number>(15);
  const [showCalendarSyncModal, setShowCalendarSyncModal] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Schedule form state
  const [formDay, setFormDay] = useState<string>('Senin');
  const [formSubjectName, setFormSubjectName] = useState<string>('');
  const [formStartTime, setFormStartTime] = useState<string>('07:30');
  const [formEndTime, setFormEndTime] = useState<string>('09:00');
  const [formClassGroup, setFormClassGroup] = useState<string>(currentUser?.rombel || 'X DKV 1');
  const [formRoom, setFormRoom] = useState<string>('Lab Multimedia');
  const [formTeacherName, setFormTeacherName] = useState<string>('');

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Filter schedules
  const filteredSchedules = schedules.filter((sch) => {
    const matchesDay = sch.day === selectedDay;
    if (currentUser?.role === 'guru') {
      const matchesTeacher = sch.teacherEmail === currentUser.email || sch.teacherName === currentUser.name;
      return matchesDay && matchesTeacher;
    }
    // For students or guests
    const matchesClass =
      selectedClassFilter === 'Semua' || (sch.classGroup || sch.className || '').toLowerCase().includes(selectedClassFilter.toLowerCase());
    return matchesDay && matchesClass;
  });

  const openCreateModal = () => {
    setEditingScheduleId(null);
    setFormDay(selectedDay);
    setFormSubjectName(subjects[0]?.name || 'Dasar-Dasar Kejuruan DKV');
    setFormStartTime('07:30');
    setFormEndTime('09:00');
    setFormClassGroup(currentUser?.rombel || 'X DKV 1');
    setFormRoom('Lab Komputer 1');
    setFormTeacherName(currentUser?.name || 'Dewan Guru SMK PB');
    setShowModal(true);
  };

  const openEditModal = (sch: ScheduleItem) => {
    setEditingScheduleId(sch.id);
    setFormDay(sch.day);
    setFormSubjectName(sch.subjectName);
    setFormStartTime(sch.startTime || sch.timeStart || '07:30');
    setFormEndTime(sch.endTime || sch.timeEnd || '09:00');
    setFormClassGroup(sch.classGroup || sch.className || 'X DKV 1');
    setFormRoom(sch.room);
    setFormTeacherName(sch.teacherName);
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScheduleId) {
      updateScheduleItem(editingScheduleId, {
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        subjectName: formSubjectName,
        classGroup: formClassGroup,
        room: formRoom,
        teacherName: formTeacherName,
      });
    } else {
      const newSch: ScheduleItem = {
        id: `sch-${Date.now()}`,
        day: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        subjectId: `sbj-custom-${Date.now()}`,
        subjectName: formSubjectName,
        classGroup: formClassGroup,
        room: formRoom,
        teacherName: formTeacherName || (currentUser?.role === 'guru' ? currentUser.name : 'Guru Mata Pelajaran'),
        teacherEmail: currentUser?.email || 'guru@smkpurnamabakti.sch.id',
      };
      addSchedule(newSch);
    }
    setShowModal(false);
  };

  // Google Calendar URL Generator
  const generateGoogleCalendarUrl = (sch: ScheduleItem) => {
    const title = encodeURIComponent(`[PRABUNET] ${sch.subjectName || 'Pelajaran'} (${sch.classGroup || 'Umum'})`);
    const details = encodeURIComponent(
      `Pelajaran: ${sch.subjectName || 'Pelajaran'}\nKelas: ${sch.classGroup || '-'}\nPengampu: ${sch.teacherName || '-'}\nRuangan: ${sch.room || '-'}\nLMS: PRABUNET SMK Purnama Bakti`
    );
    const location = encodeURIComponent(`${sch.room || 'SMK Purnama Bakti'}, SMK Purnama Bakti`);
    
    // Create recurrent weekly event or today's date
    const now = new Date();
    const startTimeFormatted = (sch.startTime || '07:30').replace(/:/g, '');
    const endTimeFormatted = (sch.endTime || '09:00').replace(/:/g, '');
    
    // Format: YYYYMMDDTHHMMSS
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const dates = `${dateStr}T${startTimeFormatted}00/${dateStr}T${endTimeFormatted}00`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}&recur=RRULE:FREQ=WEEKLY`;
  };

  // Export .ICS file for Apple/Google/Android Calendars
  const downloadICSFile = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PRABUNET//Jadwal Pelajaran SMK Purnama Bakti//ID\nCALSCALE:GREGORIAN\n`;
    
    schedules.forEach((sch) => {
      const startClean = (sch.startTime || '07:30').replace(/:/g, '') + '00';
      const endClean = (sch.endTime || '09:00').replace(/:/g, '') + '00';
      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `SUMMARY:[PRABUNET] ${sch.subjectName || 'Pelajaran'} (${sch.classGroup || 'Umum'})\n`;
      icsContent += `DESCRIPTION:Guru: ${sch.teacherName || '-'} | Ruang: ${sch.room || '-'}\n`;
      icsContent += `LOCATION:${sch.room || 'SMK Purnama Bakti'}, SMK Purnama Bakti\n`;
      icsContent += `DTSTART;TZID=Asia/Jakarta:20260901T${startClean}\n`;
      icsContent += `DTEND;TZID=Asia/Jakarta:20260901T${endClean}\n`;
      icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${sch.day === 'Senin' ? 'MO' : sch.day === 'Selasa' ? 'TU' : sch.day === 'Rabu' ? 'WE' : sch.day === 'Kamis' ? 'TH' : sch.day === 'Jumat' ? 'FR' : 'SA'}\n`;
      icsContent += `BEGIN:VALARM\nTRIGGER:-PT15M\nACTION:DISPLAY\nDESCRIPTION:Pengingat Pelajaran ${sch.subjectName || 'Pelajaran'}\nEND:VALARM\n`;
      icsContent += `END:VEVENT\n`;
    });
    
    icsContent += `END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Jadwal_Pelajaran_PRABUNET_${(currentUser?.name || 'Siswa').replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSyncToast('File Kalender (.ics) berhasil diunduh! Buka file untuk menyinkronkan ke kalender HP.');
    setTimeout(() => setSyncToast(null), 4000);
  };

  // Toggle Push Notification Permission & Alert Test
  const handleToggleNotification = async () => {
    if (!isNotificationEnabled) {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('🔔 Notifikasi Jadwal Aktif!', {
              body: 'Anda akan menerima notifikasi di HP 15 menit sebelum jam pelajaran dimulai.',
              icon: '/icon-192.png',
            });
          }
        } catch {
          // fallback
        }
      }
      setIsNotificationEnabled(true);
      localStorage.setItem('prabunet_notif_enabled', 'true');
      setSyncToast('🔔 Notifikasi jam pelajaran HP berhasil diaktifkan!');
      setTimeout(() => setSyncToast(null), 4000);
    } else {
      setIsNotificationEnabled(false);
      localStorage.setItem('prabunet_notif_enabled', 'false');
      setSyncToast('🔕 Notifikasi jam pelajaran dinonaktifkan.');
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  // Render locked screen if user is not authenticated
  if (!currentUser) {
    return (
      <div id="schedule-calendar-locked-view" className="space-y-4 pb-20">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white text-center shadow-xl border border-indigo-900/40 relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[11px] font-extrabold uppercase tracking-wider inline-block mb-2">
            Akses Terkunci • Perlu Autentikasi
          </span>

          <h2 className="text-lg font-black text-white tracking-tight mb-2">
            Jadwal Pelajaran & Kalender Khusus Pengguna
          </h2>

          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed mb-6">
            Untuk menjaga ketertiban data dan privasi kelas, jadwal harian, sinkronisasi kalender HP, dan informasi ruang hanya dapat diakses oleh Siswa, Guru, atau Kepala Sekolah SMK Purnama Bakti yang telah masuk (login).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-sm mx-auto">
            <button
              onClick={() => {
                setAuthMode('student');
                setIsAuthOpen(true);
              }}
              className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Sebagai Siswa</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('teacher');
                setIsAuthOpen(true);
              }}
              className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Shield className="w-4 h-4 text-indigo-300" />
              <span>Masuk Sebagai Guru</span>
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

        {/* Auth Modal when triggered */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={authMode}
        />
      </div>
    );
  }

  return (
    <div id="schedule-calendar-view" className="space-y-3.5 pb-20">
      {/* Toast Notification */}
      {syncToast && (
        <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in zoom-in-95">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncToast}</span>
          </span>
        </div>
      )}

      {/* Header Banner with Google Calendar Sync trigger */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-900 rounded-3xl p-4 text-white shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <CalendarIcon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Jadwal Pelajaran Harian</h2>
              <span className="text-[10px] text-blue-100 font-medium">Terhubung Google Calendar & HP</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowCalendarSyncModal(true)}
              className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer border border-white/25"
              title="Sinkronisasi Google Calendar"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>Sync HP</span>
            </button>
            <button
              id="btn-add-schedule-item"
              onClick={openCreateModal}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Jadwal</span>
            </button>
          </div>
        </div>

        {/* Sync & Notification Quick Bar */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            onClick={handleToggleNotification}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              isNotificationEnabled
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/15'
            }`}
          >
            {isNotificationEnabled ? <BellRing className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> : <Bell className="w-3.5 h-3.5" />}
            <span>{isNotificationEnabled ? 'Notifikasi HP: Aktif' : 'Aktifkan Pengingat HP'}</span>
          </button>

          <span className="text-[10px] text-indigo-200">
            {currentUser?.role === 'guru' ? '👨‍🏫 Guru Pengampu' : '🎓 Siswa PB'}
          </span>
        </div>
      </div>

      {/* Days Tabs Carousel */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-700">Pilih Hari Pelajaran:</span>
          <span className="text-[10px] text-slate-500 font-semibold">{filteredSchedules.length} Mata Pelajaran</span>
        </div>
        <div className="grid grid-cols-6 gap-1 bg-slate-200/70 p-1 rounded-2xl">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              id={`tab-day-${day.toLowerCase()}`}
              onClick={() => setSelectedDay(day)}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Class filter for student or guest */}
      {currentUser?.role !== 'guru' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-slate-500 shrink-0">Filter Tingkat:</span>
          {['Semua', 'X', 'XI', 'XII', 'DKV', 'TKJ', 'TBSM'].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClassFilter(cls)}
              className={`px-2.5 py-1 rounded-xl font-bold shrink-0 text-[10px] transition-colors cursor-pointer ${
                selectedClassFilter === cls
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      )}

      {/* Schedule Items List */}
      <div className="space-y-2.5">
        {filteredSchedules.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
            <CalendarIcon className="w-9 h-9 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Tidak ada jadwal pada hari {selectedDay}</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Anda dapat menambahkan jadwal pelajaran baru sesuai kebutuhan belajar atau mengajar.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal Hari {selectedDay}</span>
            </button>
          </div>
        ) : (
          filteredSchedules.map((sch) => (
            <div
              key={sch.id}
              className="p-3.5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-2 relative group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-100">
                      {sch.startTime} - {sch.endTime} WIB
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
                      {sch.classGroup}
                    </span>
                    {isNotificationEnabled && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[9px] flex items-center gap-0.5 border border-emerald-200">
                        <Bell className="w-2.5 h-2.5" />
                        <span>Pengingat HP Aktif</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{sch.subjectName}</h4>
                </div>

                {/* Quick Google Calendar Button & Edit & Delete */}
                <div className="flex items-center gap-1">
                  <a
                    href={generateGoogleCalendarUrl(sch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 text-[10px] font-bold bg-slate-50 border border-slate-200 px-2"
                    title="Buka di Google Calendar"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>G-Cal</span>
                  </a>
                  <button
                    onClick={() => openEditModal(sch)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Jadwal Ini"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus jadwal ${sch.subjectName}?`)) {
                        deleteScheduleItem(sch.id);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sch.teacherName}</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{sch.room}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* GOOGLE CALENDAR & PUSH NOTIFICATION MODAL */}
      {showCalendarSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span>Integrasi Google Calendar & Notifikasi HP</span>
              </h4>
              <button
                onClick={() => setShowCalendarSyncModal(false)}
                className="text-white/80 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1.5 text-slate-700">
                <p className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pengingat Jam Pelajaran Otomatis di HP</span>
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  HP Anda akan otomatis memunculkan alarm/notifikasi sebelum jam mata pelajaran dimulai agar siswa dan guru tidak ketinggalan jadwal kelas.
                </p>
              </div>

              {/* Push Notification Switch */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Notifikasi Browser / HP</h5>
                  <p className="text-[10px] text-slate-500">Muncul di status bar HP 15 menit sebelum mapel</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotification}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isNotificationEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      isNotificationEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Download .ICS for native phone calendars */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={downloadICSFile}
                  className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Download Kalender HP (.ICS File)</span>
                </button>

                <p className="text-[10px] text-slate-500 text-center">
                  Kompatibel dengan Google Calendar, Apple Calendar, Samsung Calendar & Microsoft Outlook.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCalendarSyncModal(false)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT SCHEDULE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-800 p-4 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                <span>{editingScheduleId ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran Baru'}</span>
              </h4>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white font-bold p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hari Pelajaran:</label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Mata Pelajaran:</label>
                <input
                  type="text"
                  value={formSubjectName}
                  onChange={(e) => setFormSubjectName(e.target.value)}
                  placeholder="Contoh: Pemrograman Berorientasi Objek"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Mulai:</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Selesai:</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rombel / Kelas:</label>
                  <input
                    type="text"
                    value={formClassGroup}
                    onChange={(e) => setFormClassGroup(e.target.value)}
                    placeholder="Contoh: X DKV 1"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ruangan / Lab:</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="Contoh: Lab Multimedia"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Guru Pengampu:</label>
                <input
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  placeholder="Nama guru mata pelajaran"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  {editingScheduleId ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
