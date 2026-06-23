/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  initializeLocalStorage,
  DEFAULT_SUBJECTS,
  DEFAULT_CLASSES,
  DEFAULT_STUDENTS,
  DEFAULT_GRADES,
  DEFAULT_ATTENDANCE,
  DEFAULT_JOURNALS
} from './dummyData';

// Icons
import {
  LayoutDashboard,
  BookOpen,
  School,
  Users,
  FileSpreadsheet,
  CalendarDays,
  FileCheck2,
  Lock,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
  Bell,
  Menu,
  X,
  Server,
  Sparkles,
  Printer
} from 'lucide-react';

// Views
import HomeDashboard from './components/HomeDashboard';
import SubjectsManager from './components/SubjectsManager';
import ClassesManager from './components/ClassesManager';
import StudentsManager from './components/StudentsManager';
import GradesManager from './components/GradesManager';
import AttendanceManager from './components/AttendanceManager';
import JournalsManager from './components/JournalsManager';
import ReportsManager from './components/ReportsManager';
import ProfileView from './components/ProfileView';
import AuthScreen from './components/AuthScreen';
import IntegrationPanel from './components/IntegrationPanel';
import SchedulesManager from './components/SchedulesManager';
import { User, UserRole, Subject, ClassSession, Student, Grade, Attendance, Journal, Schedule } from './types';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core Database States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Prefill state for creating Journal from Schedule reference
  const [journalPrefill, setJournalPrefill] = useState<{ kelas: string; mataPelajaran: string; scheduleId: string } | null>(null);

  // Navigation states
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings & Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('guruku_dark_mode') === 'true';
  });

  // Notifications State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 'n1', text: 'Sistem Sinkronisasi Firebase Terhubung.', unread: true },
    { id: 'n2', text: 'Aditya Pratama dinilai di Mapel Matematika.', unread: true },
    { id: 'n3', text: 'Format Template Siswa siap diunduh.', unread: false }
  ]);

  // Load and Bootstrap Local Database
  useEffect(() => {
    initializeLocalStorage();

    // Set States
    setSubjects(JSON.parse(localStorage.getItem('guruku_subjects') || '[]'));
    setClasses(JSON.parse(localStorage.getItem('guruku_classes') || '[]'));
    setStudents(JSON.parse(localStorage.getItem('guruku_students') || '[]'));
    setGrades(JSON.parse(localStorage.getItem('guruku_grades') || '[]'));
    setAttendance(JSON.parse(localStorage.getItem('guruku_attendance') || '[]'));
    setJournals(JSON.parse(localStorage.getItem('guruku_journals') || '[]'));
    setSchedules(JSON.parse(localStorage.getItem('guruku_schedules') || '[]'));

    // Check pre-auth
    const savedUser = localStorage.getItem('guruku_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync state changes with localStorage
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Dark Mode side effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('guruku_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('guruku_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Handle Authentication
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('guruku_current_user', JSON.stringify(user));
    addNotification(`Selamat datang kembali, ${user.nama}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('guruku_current_user');
  };

  const handleUpdateRole = (role: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      localStorage.setItem('guruku_current_user', JSON.stringify(updated));
      addNotification(`Mode Simulasi: Peran beralih ke ${role.toUpperCase()}`);
    }
  };

  // Add Notification utility
  const addNotification = (text: string) => {
    const newNotif = { id: `n_${Date.now()}`, text, unread: true };
    setNotifications(prev => [newNotif, ...prev.slice(0, 5)]);
  };

  const handleClearNotif = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // 1. Mata Pelajaran (Subject) CRUD
  const handleAddSubject = (newSub: Omit<Subject, 'id'>) => {
    const sub: Subject = { ...newSub, id: `sub_${Date.now()}` };
    const updated = [sub, ...subjects];
    setSubjects(updated);
    saveState('guruku_subjects', updated);
    addNotification(`Mapel ${sub.namaMapel} berhasil ditambahkan.`);
  };

  const handleEditSubject = (updatedSub: Subject) => {
    const updated = subjects.map(s => s.id === updatedSub.id ? updatedSub : s);
    setSubjects(updated);
    saveState('guruku_subjects', updated);
    addNotification(`Mapel ${updatedSub.namaMapel} diperbarui.`);
  };

  const handleDeleteSubject = (id: string) => {
    const sub = subjects.find(s => s.id === id);
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    saveState('guruku_subjects', updated);
    addNotification(`Mapel ${sub?.namaMapel || ''} dihapus.`);
  };

  // 2. Kelas (Classes) CRUD
  const handleAddClass = (newCls: Omit<ClassSession, 'id'>) => {
    const cls: ClassSession = { ...newCls, id: `cls_${Date.now()}` };
    const updated = [cls, ...classes];
    setClasses(updated);
    saveState('guruku_classes', updated);
    addNotification(`Kelas ${cls.namaKelas} berhasil ditambahkan.`);
  };

  const handleEditClass = (updatedCls: ClassSession) => {
    const updated = classes.map(c => c.id === updatedCls.id ? updatedCls : c);
    setClasses(updated);
    saveState('guruku_classes', updated);
    addNotification(`Kelas ${updatedCls.namaKelas} diperbarui.`);
  };

  const handleDeleteClass = (id: string) => {
    const cls = classes.find(c => c.id === id);
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    saveState('guruku_classes', updated);
    addNotification(`Kelas ${cls?.namaKelas || ''} dihapus.`);
  };

  // 3. Siswa (Students) CRUD
  const handleAddStudent = (newStd: Omit<Student, 'id'>) => {
    const std: Student = { ...newStd, id: `std_${Date.now()}` };
    const updated = [std, ...students];
    setStudents(updated);
    saveState('guruku_students', updated);
    addNotification(`Siswa ${std.nama} berhasil terdaftar.`);
  };

  const handleEditStudent = (updatedStd: Student) => {
    const updated = students.map(s => s.id === updatedStd.id ? updatedStd : s);
    setStudents(updated);
    saveState('guruku_students', updated);
    addNotification(`Data biodata ${updatedStd.nama} diupdate.`);
  };

  const handleDeleteStudent = (id: string) => {
    const std = students.find(s => s.id === id);
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveState('guruku_students', updated);
    addNotification(`Siswa ${std?.nama || ''} telah dihapus.`);
  };

  const handleImportStudents = (newStudents: Omit<Student, 'id'>[]) => {
    const withIds = newStudents.map(s => ({
      ...s,
      id: `std_imported_${Math.floor(Math.random() * 100000)}_${Date.now()}`
    }));
    const updated = [...withIds, ...students];
    setStudents(updated);
    saveState('guruku_students', updated);
    addNotification(`${newStudents.length} siswa baru berhasil di-import.`);
  };

  // 4. Nilai (Grade) CRUD
  const handleUpsertGrade = (gradeToUpsert: Omit<Grade, 'id'> & { id?: string }) => {
    let updated: Grade[];
    if (gradeToUpsert.id) {
      // update
      updated = grades.map(g => g.id === gradeToUpsert.id ? (gradeToUpsert as Grade) : g);
    } else {
      // create
      const newGrade: Grade = {
        ...gradeToUpsert,
        id: `grd_${Date.now()}`
      } as Grade;
      updated = [newGrade, ...grades];
    }
    setGrades(updated);
    saveState('guruku_grades', updated);
    
    const murid = students.find(s => s.id === gradeToUpsert.studentId);
    addNotification(`Nilai ${murid?.nama || ''} berhasil disimpan.`);
  };

  // 5. Absensi (Attendance) Record
  const handleSaveAttendance = (records: Omit<Attendance, 'id'>[]) => {
    // filter existing elements on exact date and studentId, then merge new input
    const base = [...attendance];
    records.forEach(newRec => {
      const idx = base.findIndex(a => a.studentId === newRec.studentId && a.tanggal === newRec.tanggal);
      if (idx !== -1) {
        base[idx].status = newRec.status;
      } else {
        base.push({
          ...newRec,
          id: `att_${Math.floor(Math.random() * 1000000)}_${Date.now()}`
        });
      }
    });

    setAttendance(base);
    saveState('guruku_attendance', base);
    addNotification(`Absensi tanggal ${records[0]?.tanggal} berhasil divalidasi.`);
  };

  // 6. Jurnal Mengajar CRUD
  const handleAddJournal = (newJnl: Omit<Journal, 'id' | 'guruId' | 'guruNama'>) => {
    const jnl: Journal = {
      ...newJnl,
      id: `jnl_${Date.now()}`,
      guruId: currentUser?.uid || 'user_1',
      guruNama: currentUser?.nama || 'Tamrin, S.Pd.'
    };
    const updated = [jnl, ...journals];
    setJournals(updated);
    saveState('guruku_journals', updated);
    addNotification(`Jurnal KBM ${jnl.materi} dipublish.`);
  };

  const handleEditJournal = (updatedJnl: Journal) => {
    const updated = journals.map(j => j.id === updatedJnl.id ? updatedJnl : j);
    setJournals(updated);
    saveState('guruku_journals', updated);
    addNotification(`Jurnal KBM diperbarui.`);
  };

  const handleDeleteJournal = (id: string) => {
    const jnl = journals.find(j => j.id === id);
    const updated = journals.filter(j => j.id !== id);
    setJournals(updated);
    saveState('guruku_journals', updated);
    addNotification(`Jurnal KBM dihapus.`);
  };

  // 7. Jadwal Pembelajaran CRUD
  const handleAddSchedule = (newSch: Omit<Schedule, 'id'>) => {
    const sch: Schedule = { ...newSch, id: `sch_${Date.now()}` };
    const updated = [sch, ...schedules];
    setSchedules(updated);
    saveState('guruku_schedules', updated);
    addNotification(`Jadwal baru hari ${sch.hari} untuk ${sch.kelasNama} berhasil dibuat.`);
  };

  const handleEditSchedule = (updatedSch: Schedule) => {
    const updated = schedules.map(s => s.id === updatedSch.id ? updatedSch : s);
    setSchedules(updated);
    saveState('guruku_schedules', updated);
    addNotification(`Jadwal mengajar diperbarui.`);
  };

  const handleDeleteSchedule = (id: string) => {
    const sch = schedules.find(s => s.id === id);
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    saveState('guruku_schedules', updated);
    addNotification(`Jadwal mengajar hari ${sch?.hari || ''} kelas ${sch?.kelasNama || ''} dihapus.`);
  };

  const handleWriteJournalFromSchedule = (sch: Schedule) => {
    setJournalPrefill({
      kelas: sch.kelasNama,
      mataPelajaran: sch.subjectNama,
      scheduleId: sch.id
    });
    setActiveModule('journals');
    addNotification(`Menulis Jurnal KBM rujukan Jadwal ${sch.kelasNama} — ${sch.subjectNama}`);
  };

  // Access constraints helper
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Unread notification count
  const unreadCount = notifications.filter(n => n.unread).length;

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 transition-colors duration-305 relative overflow-hidden" id="applet-shell">
      {/* Background Ambient Blobs for Frosted Glass Depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] max-w-[600px] rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] max-w-[500px] rounded-full bg-purple-400/15 dark:bg-purple-600/10 blur-[100px] animate-blob-delayed"></div>
        <div className="absolute top-[45%] right-[25%] w-[30vw] h-[30vw] max-w-[450px] rounded-full bg-emerald-300/10 dark:bg-emerald-500/5 blur-[110px] animate-blob"></div>
      </div>

      {/* SIDEBAR VIEW */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-850 w-64 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between select-none">
          {/* Logo Brand */}
          <div>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-850">
              <span className="text-xl font-black text-slate-850 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <span className="text-2xl">📚</span>
                GuruKu <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold font-sans">SaaS</span>
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="px-4 py-4 space-y-7 overflow-y-auto max-h-[calc(100vh-170px)]">
              {/* Sekilas / Utama */}
              <div className="space-y-1.5">
                <span className="px-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">Pilar Dashboard</span>
                
                <button
                  onClick={() => { setActiveModule('dashboard'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'dashboard'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-800 dark:hover:text-slate-250'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </span>
                </button>

                {/* Mata Pelajaran */}
                <button
                  onClick={() => { setActiveModule('subjects'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'subjects'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-855'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4" />
                    Mata Pelajaran
                  </span>
                  {!isAdmin && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                {/* Kelas */}
                <button
                  onClick={() => { setActiveModule('classes'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'classes'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-855'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <School className="w-4 h-4" />
                    Kelas
                  </span>
                  {!isAdmin && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                {/* Siswa */}
                <button
                  onClick={() => { setActiveModule('students'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'students'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-855'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    Siswa / Siswi
                  </span>
                  {!isAdmin && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>

              {/* Akademik Sub */}
              <div className="space-y-1.5">
                <span className="px-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">Administrasi Akademik</span>
                
                {/* Nilai */}
                <button
                  onClick={() => { setActiveModule('grades'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'grades'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-855'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    Nilai Siswa
                  </span>
                </button>

                {/* Absensi */}
                <button
                  onClick={() => { setActiveModule('attendance'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'attendance'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-855'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CalendarDays className="w-4 h-4" />
                    Absensi Siswa
                  </span>
                </button>

                {/* Jadwal Pembelajaran */}
                <button
                  onClick={() => { setActiveModule('schedules'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'schedules'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-855'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CalendarDays className="w-4 h-4 text-emerald-500" />
                    Jadwal Pembelajaran
                  </span>
                </button>

                {/* Jurnal */}
                <button
                  onClick={() => { setActiveModule('journals'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'journals'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-855'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileCheck2 className="w-4 h-4" />
                    Jurnal Mengajar
                  </span>
                </button>
              </div>

              {/* Laporan Sub */}
              <div className="space-y-1.5">
                <span className="px-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">Laporan Resmi</span>
                
                <button
                  onClick={() => { setActiveModule('reports'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'reports'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:text-slate-855'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Printer className="w-4 h-4" />
                    Cetak Dokumen
                  </span>
                </button>
              </div>

              {/* Apps Script Hub */}
              <div className="space-y-1.5">
                <span className="px-3 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">Deployment GAS</span>
                
                <button
                  onClick={() => { setActiveModule('integration'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left text-xs font-semibold cursor-pointer transition ${
                    activeModule === 'integration'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold border-l-2 border-indigo-650'
                      : 'text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
                  }`}
                >
                  <span className="flex items-center gap-2.5 font-bold">
                    <Server className="w-4 h-4 text-orange-500" />
                    GAS & Firebase Hub
                  </span>
                </button>
              </div>
            </nav>
          </div>

          {/* Bottom logout / User detail */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
            <button
              onClick={() => { setActiveModule('profile'); setIsSidebarOpen(false); }}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-850/40 text-left text-xs transition rounded-xl w-full cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600">
                {currentUser.nama.substring(0, 2)}
              </div>
              <div className="truncate">
                <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{currentUser.nama}</p>
                <p className="text-[10px] text-slate-400 font-mono capitalize truncate">{currentUser.role}</p>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-550 hover:bg-rose-50/50 dark:hover:bg-rose-950/25 rounded-xl text-xs font-bold text-left transition text-rose-500 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Keluar Akun
            </button>
          </div>
        </div>
      </aside>

      {/* OFF-CANVAS BACKDROP ON MOBILE */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/45 dark:bg-slate-950/70 z-30 backdrop-blur-xxs"
        ></div>
      )}

      {/* CORE FRAME CONTAINER */}
      <div className="flex-1 flex flex-col lg:pl-64 overflow-hidden">
        {/* HEADER TOOLBAR bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850/80 flex items-center justify-between px-4 md:px-6 select-none flex-shrink-0 z-20">
          
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-550 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-medium text-xs md:text-sm text-slate-400 flex items-center gap-1">
              <span>GuruKu Portal</span>
              <span>/</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 capitalize">
                {activeModule === 'dashboard' ? 'Dashboard Utama' : 
                 activeModule === 'subjects' ? 'Mata Pelajaran' :
                 activeModule === 'classes' ? 'Kelompok Kelas' :
                 activeModule === 'students' ? 'Pangkalan Siswa' :
                 activeModule === 'grades' ? 'Asesmen Nilai' :
                 activeModule === 'attendance' ? 'Presensi Absensi' :
                 activeModule === 'schedules' ? 'Jadwal Pembelajaran' :
                 activeModule === 'journals' ? 'Jurnal Mengajar' :
                 activeModule === 'reports' ? 'Laporan Cetak' :
                 activeModule === 'profile' ? 'Profil Guru' :
                 activeModule === 'integration' ? 'Backend Sync GAS' : 'Menu'}
              </span>
            </span>
          </div>

          {/* Central status check */}
          <div className="hidden md:flex bg-slate-50 dark:bg-slate-950/60 pl-3 pr-4 py-1.5 rounded-full border border-slate-150/50 dark:border-slate-800/80 items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">Firebase Hub:</span>
            <div className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute"></span>
              <span className="text-[11px] font-black font-mono text-emerald-600 dark:text-emerald-400">🟢 Connected</span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 dark:text-slate-400 cursor-pointer"
              title="Ganti Tema Visual"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notification drop selector */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-slate-550 relative cursor-pointer"
                title={`${unreadCount} Pemberitahuan baru`}
              >
                <Bell className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-white dark:border-slate-900"></span>
                )}
              </button>

              {isNotifOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 text-xs text-slate-700 dark:text-slate-350"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Notifikasi</span>
                    <button 
                      onClick={handleClearNotif}
                      className="text-[10px] text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Tandai Dibaca
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="p-2 rounded-xl bg-slate-50/40 hover:bg-slate-50/60 dark:bg-slate-950/20 transition text-[11px] leading-relaxed relative">
                        {n.unread && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>}
                        {n.text}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsNotifOpen(false)}
                    className="w-full text-center py-1 text-[10px] text-slate-400 hover:text-slate-600"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>

            {/* Profile brief banner */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-150 dark:border-slate-850">
              <div 
                onClick={() => setActiveModule('profile')}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs cursor-pointer select-none ring-2 ring-slate-100 dark:ring-slate-800"
              >
                {currentUser.nama.substring(0, 2)}
              </div>
              <div className="hidden lg:block text-left text-xs max-w-[80px]">
                <p className="font-bold text-slate-705 dark:text-slate-200 truncate leading-none">{currentUser.nama.split(',')[0]}</p>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5 capitalize">{currentUser.role}</span>
              </div>
            </div>

          </div>
        </header>

        {/* WORKSPACE CENTRAL WRAPPER SCREEN */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-12">
          
          <div className="max-w-7xl mx-auto">
            {activeModule === 'dashboard' && (
              <HomeDashboard
                subjects={subjects}
                classes={classes}
                students={students}
                journals={journals}
                grades={grades}
                userName={currentUser.nama}
                onNavigate={(mod) => {
                  if (currentUser.role === UserRole.GURU && ['subjects', 'classes', 'students'].includes(mod)) {
                    alert('🔒 Hak Akses Terbatas: Menu ini hanya dapat diatur oleh administrator.');
                    return;
                  }
                  setActiveModule(mod);
                }}
              />
            )}

            {activeModule === 'subjects' && (
              <SubjectsManager
                subjects={subjects}
                onAdd={handleAddSubject}
                onEdit={handleEditSubject}
                onDelete={handleDeleteSubject}
                isAdmin={isAdmin}
              />
            )}

            {activeModule === 'classes' && (
              <ClassesManager
                classes={classes}
                onAdd={handleAddClass}
                onEdit={handleEditClass}
                onDelete={handleDeleteClass}
                isAdmin={isAdmin}
              />
            )}

            {activeModule === 'students' && (
              <StudentsManager
                students={students}
                classes={classes}
                onAdd={handleAddStudent}
                onEdit={handleEditStudent}
                onDelete={handleDeleteStudent}
                onImport={handleImportStudents}
                isAdmin={isAdmin}
              />
            )}

            {activeModule === 'grades' && (
              <GradesManager
                grades={grades}
                students={students}
                subjects={subjects}
                classes={classes}
                onUpsertGrade={handleUpsertGrade}
              />
            )}

            {activeModule === 'attendance' && (
              <AttendanceManager
                attendance={attendance}
                students={students}
                classes={classes}
                onSaveAttendance={handleSaveAttendance}
              />
            )}

            {activeModule === 'journals' && (
              <JournalsManager
                journals={journals}
                classes={classes}
                subjects={subjects}
                schedules={schedules}
                prefill={journalPrefill}
                onClearPrefill={() => setJournalPrefill(null)}
                onAdd={handleAddJournal}
                onEdit={handleEditJournal}
                onDelete={handleDeleteJournal}
                isAdmin={isAdmin}
              />
            )}

            {activeModule === 'schedules' && (
              <SchedulesManager
                schedules={schedules}
                classes={classes}
                subjects={subjects}
                onAdd={handleAddSchedule}
                onEdit={handleEditSchedule}
                onDelete={handleDeleteSchedule}
                onWriteJournalFromSchedule={handleWriteJournalFromSchedule}
                isAdmin={isAdmin}
              />
            )}

            {activeModule === 'reports' && (
              <ReportsManager
                students={students}
                subjects={subjects}
                classes={classes}
                grades={grades}
                attendance={attendance}
                journals={journals}
              />
            )}

            {activeModule === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onUpdateRole={handleUpdateRole}
              />
            )}

            {activeModule === 'integration' && (
              <IntegrationPanel />
            )}
          </div>

        </main>
      </div>

    </div>
  );
}
