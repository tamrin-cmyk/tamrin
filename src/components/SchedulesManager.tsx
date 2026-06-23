/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock, 
  BookOpen, 
  Shield, 
  Sparkles, 
  Filter, 
  X, 
  Save, 
  CalendarDays, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Schedule, ClassSession, Subject, UserRole } from '../types';

interface SchedulesManagerProps {
  schedules: Schedule[];
  classes: ClassSession[];
  subjects: Subject[];
  isAdmin: boolean;
  onAdd: (sch: Omit<Schedule, 'id'>) => void;
  onEdit: (sch: Schedule) => void;
  onDelete: (id: string) => void;
  onWriteJournalFromSchedule: (sch: Schedule) => void;
}

export default function SchedulesManager({
  schedules,
  classes,
  subjects,
  isAdmin,
  onAdd,
  onEdit,
  onDelete,
  onWriteJournalFromSchedule
}: SchedulesManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Semua');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('Semua');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form States
  const [hari, setHari] = useState<Schedule['hari']>('Senin');
  const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].namaKelas : '');
  const [selectedSubject, setSelectedSubject] = useState(subjects.length > 0 ? subjects[0].namaMapel : '');
  const [guruNama, setGuruNama] = useState('');
  const [jamMulai, setJamMulai] = useState('07:30');
  const [jamSelesai, setJamSelesai] = useState('09:00');

  const days: Schedule['hari'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Realtime clock for lock logic
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isScheduleLocked = (sch: Schedule) => {
    if (isAdmin) return false;
    let currentDayIdx = currentTime.getDay();
    if (currentDayIdx === 0) currentDayIdx = 7;

    const daysMap: Record<string, number> = {
      'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7
    };
    const schDayIdx = daysMap[sch.hari] || 0;

    if (currentDayIdx > schDayIdx) return true;

    const currentHour = currentTime.getHours().toString().padStart(2, '0');
    const currentMin = currentTime.getMinutes().toString().padStart(2, '0');
    const timeStr = `${currentHour}:${currentMin}`;

    if (currentDayIdx === schDayIdx && timeStr > sch.jamSelesai) return true;

    return false;
  };

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setHari('Senin');
    setSelectedClass(classes.length > 0 ? classes[0].namaKelas : '');
    setSelectedSubject(subjects.length > 0 ? subjects[0].namaMapel : '');
    setGuruNama('');
    setJamMulai('07:30');
    setJamSelesai('09:00');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch: Schedule) => {
    setEditingSchedule(sch);
    setHari(sch.hari);
    setSelectedClass(sch.kelasNama);
    setSelectedSubject(sch.subjectNama);
    setGuruNama(sch.guruNama);
    setJamMulai(sch.jamMulai);
    setJamSelesai(sch.jamSelesai);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruNama.trim()) {
      alert('Nama guru pengajar wajib diisi!');
      return;
    }

    if (editingSchedule) {
      onEdit({
        ...editingSchedule,
        hari,
        kelasNama: selectedClass,
        subjectNama: selectedSubject,
        guruNama,
        jamMulai,
        jamSelesai
      });
    } else {
      onAdd({
        hari,
        kelasNama: selectedClass,
        subjectNama: selectedSubject,
        guruNama,
        jamMulai,
        jamSelesai
      });
    }
    setIsModalOpen(false);
  };

  // Filters logic
  const filteredSchedules = schedules.filter(sch => {
    const matchesSearch = 
      sch.guruNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.subjectNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.kelasNama.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDay = selectedDayFilter === 'Semua' || sch.hari === selectedDayFilter;
    const matchesClass = selectedClassFilter === 'Semua' || sch.kelasNama === selectedClassFilter;

    return matchesSearch && matchesDay && matchesClass;
  });

  // Group schedules by day for the planner board view
  const getSchedulesByDay = (day: Schedule['hari']) => {
    return schedules
      .filter(sch => sch.hari === day)
      .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6" id="schedules-manager-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Jadwal Pembelajaran Mingguan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola dan koordinasi jadwal KBM sekolah. Guru dapat langsung mengisi Jurnal Mengajar dari rujukan jadwal ini.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Jadwal Baru
          </button>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 px-3.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Mode View Only (Admin bisa mengedit jadwal)
          </div>
        )}
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari guru, kelas, atau mapel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
          />
        </div>

        {/* Filter Hari */}
        <div>
          <select
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Semua">🗓️ Semua Hari</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        {/* Filter Kelas */}
        <div>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Semua">🏫 Semua Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.namaKelas}>{c.namaKelas}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW MODAL TYPE TOGGLE (TABS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* TABULAR LIST OF SCHEDULES */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-4.5 h-4.5 text-indigo-500" />
            Daftar Jadwal ({filteredSchedules.length})
          </h3>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/40 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-850">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Hari</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Jam</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kelas</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Mata Pelajaran</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Guru Pengajar</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((sch) => {
                    const locked = isScheduleLocked(sch);
                    return (
                    <tr 
                      key={sch.id} 
                      className={`transition group text-xs ${
                        locked ? 'bg-slate-50/20 dark:bg-slate-950/50 opacity-60' : 'hover:bg-slate-50/40 dark:hover:bg-slate-950/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">{sch.hari}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium font-sans ${
                          locked ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {sch.jamMulai} - {sch.jamSelesai}
                          {locked && <span className="ml-1 text-[9px] uppercase font-black px-1.5 py-0.5 bg-red-100 dark:bg-red-900 rounded">Lepas Waktu</span>}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{sch.kelasNama}</td>
                      <td className="p-4">
                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                          {sch.subjectNama}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-650 dark:text-slate-350">{sch.guruNama}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Write Journal Action Button */}
                          <button
                            onClick={() => !locked && onWriteJournalFromSchedule(sch)}
                            disabled={locked}
                            title={locked ? "Waktu sudah lewat, tidak dapat mengisi jurnal" : "Tulis Jurnal untuk Jadwal ini"}
                            className={`inline-flex items-center gap-1 px-3 py-1 ${
                              locked 
                                ? 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 cursor-pointer'
                            } text-[10px] font-bold rounded-lg transition`}
                          >
                            {locked ? 'Waktu Habis' : 'Tulis Jurnal'}
                            {!locked && <ArrowRight className="w-3 h-3" />}
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(sch)}
                                className="p-1 px-2 hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-600 rounded transition cursor-pointer"
                                title="Edit Jadwal"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDelete(sch.id)}
                                className="p-1 px-2 hover:bg-red-50 dark:hover:bg-slate-800 text-red-500 rounded transition cursor-pointer"
                                title="Hapus Jadwal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-light">
                      Tidak ada jadwal yang cocok dengan filter / pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* WEEKLY PLANNER SUMMARY CARD BOARD */}
        <div className="bg-slate-50/30 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-150/40 dark:border-slate-800 pb-2">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin-slow" />
            Planner Mingguan Quick-View
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {days.map(day => {
              const daySchedules = getSchedulesByDay(day);
              return (
                <div key={day} className="space-y-1.5">
                  <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/25 px-3 py-1 rounded-lg">
                    <span className="font-bold text-indigo-700 dark:text-indigo-400 text-xs">{day}</span>
                    <span className="text-[10px] font-bold text-slate-400">{daySchedules.length} Kelas</span>
                  </div>

                  {daySchedules.length > 0 ? (
                    <div className="pl-2 space-y-1">
                      {daySchedules.map(sch => {
                        const locked = isScheduleLocked(sch);
                        return (
                        <div 
                          key={sch.id}
                          className={`p-2 bg-white dark:bg-slate-900 border rounded-xl text-[11px] shadow-3xs flex justify-between items-center ${
                            locked ? 'border-slate-50 dark:border-slate-800/50 opacity-50' : 'border-slate-100 dark:border-slate-850 hover:border-indigo-200 dark:hover:border-slate-800'
                          }`}
                        >
                          <div>
                            <p className={`font-bold ${locked ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                              {sch.kelasNama} - {sch.subjectNama}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">{sch.guruNama}</p>
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                            locked ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/80 border-slate-100 dark:border-slate-800/50'
                          }`}>
                            {sch.jamMulai}
                          </span>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic pl-3">Tidak ada jadwal.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CRUD SCHEDULE MODAL (ADMIN ONLY) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-indigo-350 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              {editingSchedule ? 'Edit Jadwal Pembelajaran' : 'Buat Jadwal Pembelajaran'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Hari */}
              <div>
                <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-350 uppercase mb-1">Hari Pembelajaran</label>
                <select
                  value={hari}
                  onChange={(e) => setHari(e.target.value as Schedule['hari'])}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-505"
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Rincian Jam */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-350 uppercase mb-1">Jam Mulai</label>
                  <input
                    type="text"
                    value={jamMulai}
                    placeholder="Contoh: 07:30"
                    onChange={(e) => setJamMulai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-350 uppercase mb-1">Jam Selesai</label>
                  <input
                    type="text"
                    value={jamSelesai}
                    placeholder="Contoh: 09:00"
                    onChange={(e) => setJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Kelas & Mapel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-350 uppercase mb-1">Pilih Kelas</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.namaKelas}>{c.namaKelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-350 uppercase mb-1">Pilih Mapel</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.namaMapel}>{s.namaMapel}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nama Guru (or search from classes) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-350 uppercase mb-1">Nama Guru Pengajar</label>
                <input
                  type="text"
                  value={guruNama}
                  placeholder="Misal: Tamrin, S.Pd."
                  onChange={(e) => setGuruNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
