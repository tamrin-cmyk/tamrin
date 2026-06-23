/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calendar, CheckCircle, Info, Sparkles, AlertCircle, Save } from 'lucide-react';
import { Student, Attendance, ClassSession } from '../types';

interface AttendanceManagerProps {
  attendance: Attendance[];
  students: Student[];
  classes: ClassSession[];
  onSaveAttendance: (records: Omit<Attendance, 'id'>[]) => void;
}

export default function AttendanceManager({
  attendance,
  students,
  classes,
  onSaveAttendance
}: AttendanceManagerProps) {
  // Navigation tabs: 'harian' | 'bulanan'
  const [activeTab, setActiveTab] = useState<'harian' | 'bulanan'>('harian');

  // Filters
  const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].namaKelas : '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Temporary scratchpad for harian attendance marks
  // studentId -> 'Hadir' | 'Izin' | 'Sakit' | 'Alfa' | 'Terlambat'
  const [localAttendance, setLocalAttendance] = useState<{[studentId: string]: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa' | 'Terlambat'}>({});

  const classStudents = students.filter(s => s.kelas === selectedClass);

  // Load existing records on selection changes
  const handleMarkChange = (studentId: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa' | 'Terlambat') => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAll = () => {
    const recordsToSave: Omit<Attendance, 'id'>[] = classStudents.map(std => {
      const existingRecord = attendance.find(a => a.studentId === std.id && a.tanggal === selectedDate);
      const status = localAttendance[std.id] || existingRecord?.status || 'Hadir'; // default to Hadir
      return {
        studentId: std.id,
        tanggal: selectedDate,
        status
      };
    });

    onSaveAttendance(recordsToSave);
    alert('Rekam absensi harian berhasil dipublish ke Firebase!');
    setLocalAttendance({});
  };

  // Monthly totals calculation for each student
  const getMonthlyAttendanceSummary = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.studentId === studentId);
    
    const hadir = studentRecords.filter(r => r.status === 'Hadir').length;
    const izin = studentRecords.filter(r => r.status === 'Izin').length;
    const sakit = studentRecords.filter(r => r.status === 'Sakit').length;
    const alfa = studentRecords.filter(r => r.status === 'Alfa').length;
    const terlambat = studentRecords.filter(r => r.status === 'Terlambat').length;
    
    // Both 'Hadir' and 'Terlambat' are present in class
    const total = hadir + izin + sakit + alfa + terlambat;
    const attendanceRate = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 100;

    return { hadir, izin, sakit, alfa, terlambat, attendanceRate };
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6" id="attendance-manager-root">
      
      {/* Header with Navigation tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Pencatatan Presensi & Absensi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Kelola tingkat kehadiran siswa, izin medis, rekapitulasi semester secara real-time.</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('harian')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'harian'
                ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Absensi Harian
          </button>
          <button
            onClick={() => setActiveTab('bulanan')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bulanan'
                ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Rekap Kehadiran
          </button>
        </div>
      </div>

      {/* Primary Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850/50">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setLocalAttendance({});
            }}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
          >
            {classes.map(c => (
              <option key={c.id} value={c.namaKelas}>{c.namaKelas}</option>
            ))}
          </select>
        </div>

        {activeTab === 'harian' && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tanggal Absensi</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setLocalAttendance({});
              }}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
            />
          </div>
        )}
      </div>

      {/* Tabs rendering */}
      {activeTab === 'harian' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse table-fixed min-w-[300px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
                  <th className="px-5 py-3 w-1/2">Nama Siswa</th>
                  <th className="px-4 py-3 text-center w-1/2">Status Presensi / Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {classStudents.length > 0 ? (
                  classStudents.map((std) => {
                    const existingRecord = attendance.find(a => a.studentId === std.id && a.tanggal === selectedDate);
                    const currentStatus = localAttendance[std.id] || existingRecord?.status || 'Hadir';

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/5 transition">
                        <td className="px-5 py-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{std.nama}</span>
                          <span className="block text-[9px] font-mono text-slate-400 mt-0.5">NISN: {std.nisn}</span>
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          <div className="inline-block w-full max-w-[180px]">
                            <select
                              value={currentStatus}
                              onChange={(e) => handleMarkChange(std.id, e.target.value as any)}
                              className={`w-full px-3 py-1.5 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition cursor-pointer ${
                                currentStatus === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30' :
                                currentStatus === 'Izin' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30' :
                                currentStatus === 'Sakit' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30' :
                                currentStatus === 'Terlambat' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30' :
                                'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30'
                              }`}
                            >
                              <option value="Hadir">🟢 Hadir</option>
                              <option value="Izin">🔵 Izin</option>
                              <option value="Sakit">🟡 Sakit</option>
                              <option value="Alfa">🔴 Alfa</option>
                              <option value="Terlambat">🟣 Terlambat</option>
                            </select>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-slate-400">
                      Murid tidak ditemukan dalam rombel ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveAll}
              disabled={classStudents.length === 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md shadow-indigo-150 dark:shadow-none cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Presensi Kelas
            </button>
          </div>
        </div>
      )}

      {activeTab === 'bulanan' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Legend Banner */}
          <div className="p-3 bg-slate-55 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-wrap items-center gap-4 text-xs">
            <span className="font-bold text-slate-400">Keterangan:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Hadir</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Izin</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sakit</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Alfa</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Terlambat</span>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
                  <th className="px-5 py-3 w-[200px]">Nama Lengkap Siswa</th>
                  <th className="px-4 py-3 text-center">Total H</th>
                  <th className="px-4 py-3 text-center">Total I</th>
                  <th className="px-4 py-3 text-center">Total S</th>
                  <th className="px-4 py-3 text-center">Total A</th>
                  <th className="px-4 py-3 text-center">Total T (Terlambat)</th>
                  <th className="px-5 py-3 text-right">Rasio Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-350">
                {classStudents.length > 0 ? (
                  classStudents.map((std) => {
                    const stats = getMonthlyAttendanceSummary(std.id);
                    return (
                      <tr key={std.id} className="hover:bg-slate-50/25 transition">
                        <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">{std.nama}</td>
                        <td className="px-4 py-3 text-center font-bold font-mono text-emerald-600">{stats.hadir}</td>
                        <td className="px-4 py-3 text-center font-bold font-mono text-blue-600">{stats.izin}</td>
                        <td className="px-4 py-3 text-center font-bold font-mono text-amber-600">{stats.sakit}</td>
                        <td className="px-4 py-3 text-center font-bold font-mono text-rose-500">{stats.alfa}</td>
                        <td className="px-4 py-3 text-center font-bold font-mono text-purple-600">{stats.terlambat}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded font-mono font-black text-xs ${
                            stats.attendanceRate >= 90 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                              : stats.attendanceRate >= 75 
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' 
                                : 'bg-red-50 text-red-750 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            {stats.attendanceRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      Siswa tidak ditemukan untuk rombel ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
