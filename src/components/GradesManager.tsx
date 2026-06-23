/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, Save, AlertCircle, CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';
import { Student, Subject, Grade, ClassSession } from '../types';

interface GradesManagerProps {
  grades: Grade[];
  students: Student[];
  subjects: Subject[];
  classes: ClassSession[];
  onUpsertGrade: (grade: Omit<Grade, 'id'> & { id?: string }) => void;
}

export default function GradesManager({
  grades,
  students,
  subjects,
  classes,
  onUpsertGrade
}: GradesManagerProps) {
  // Filters
  const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].namaKelas : '');
  const [selectedSubject, setSelectedSubject] = useState(subjects.length > 0 ? subjects[0].id : '');
  const [selectedComponent, setSelectedComponent] = useState<'all' | 'harian' | 'tugas' | 'uts' | 'uas'>('all');
  const [searchStudent, setSearchStudent] = useState('');

  // Local state for scratchpad changes to avoid lagging
  const [editStates, setEditStates] = useState<{[key: string]: {
    tugas: number;
    uts: number;
    uas: number;
    praktik: number;
  }}>({});

  const subjectObj = subjects.find(s => s.id === selectedSubject);
  const subjectKKM = subjectObj ? subjectObj.kkm : 75;

  // Filter students in selected class
  const classStudents = students.filter(s => s.kelas === selectedClass && 
    s.nama.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleLocalChange = (studentId: string, field: 'tugas' | 'uts' | 'uas' | 'praktik', value: string) => {
    const numVal = Math.min(100, Math.max(0, Number(value) || 0));
    
    // Find current values
    const existingGrade = grades.find(g => g.studentId === studentId && g.subjectId === selectedSubject);
    const base = editStates[studentId] || {
      tugas: existingGrade?.tugas || 0,
      uts: existingGrade?.uts || 0,
      uas: existingGrade?.uas || 0,
      praktik: existingGrade?.praktik || 0,
    };

    const updated = {
      ...base,
      [field]: numVal
    };

    setEditStates(prev => ({
      ...prev,
      [studentId]: updated
    }));
  };

  const calculateFinal = (tugas: number, uts: number, uas: number, praktik: number) => {
    return Number(((tugas * 0.20) + (uts * 0.30) + (uas * 0.40) + (praktik * 0.10)).toFixed(1));
  };

  const handleSaveRow = (studentId: string) => {
    const existingGrade = grades.find(g => g.studentId === studentId && g.subjectId === selectedSubject);
    const current = editStates[studentId] || {
      tugas: existingGrade?.tugas || 0,
      uts: existingGrade?.uts || 0,
      uas: existingGrade?.uas || 0,
      praktik: existingGrade?.praktik || 0,
    };

    const finalScore = calculateFinal(current.tugas, current.uts, current.uas, current.praktik);
    const status = finalScore >= subjectKKM ? 'Tuntas' : 'Belum Tuntas';

    onUpsertGrade({
      id: existingGrade?.id, // include if edits
      studentId,
      subjectId: selectedSubject,
      tugas: current.tugas,
      uts: current.uts,
      uas: current.uas,
      praktik: current.praktik,
      nilaiAkhir: finalScore,
      status
    });

    // Remove from temporary edit register to lock and show success
    const newEditStates = { ...editStates };
    delete newEditStates[studentId];
    setEditStates(newEditStates);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6" id="grades-manager-root">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Penginputan Nilai Akademik
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Komposisi Penilaian Kurikulum: Tugas (20%), UTS (30%), UAS (40%), dan Praktik (10%).
        </p>
      </div>

      {/* Grid Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850/30">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rombongan Belajar (Kelas)</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setEditStates({});
            }}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
          >
            {classes.map(c => (
              <option key={c.id} value={c.namaKelas}>{c.namaKelas}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mata Pelajaran (Mapel)</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setEditStates({});
            }}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.namaMapel} (KKM: {s.kkm})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Komponen Nilai</label>
          <select
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value as any)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350 font-bold"
          >
            <option value="all">📊 Semua Komponen</option>
            <option value="harian">📝 Nilai Harian</option>
            <option value="tugas">📔 Tugas</option>
            <option value="uts">🏫 UTS</option>
            <option value="uas">🎓 UAS</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pencarian Siswa</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Info Bar on selected Mapel KKM */}
      <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/40 dark:border-indigo-900/40 flex items-center gap-3 text-xs text-indigo-800 dark:text-indigo-400">
        <Info className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0" />
        <div>
          Kriteria Ketercapaian Tujuan Pembelajaran (KKM) untuk mata pelajaran <b>{subjectObj?.namaMapel}</b> adalah <b className="font-mono bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300">{subjectKKM}</b>. Siswa dengan nilai akhir di bawah batas ini otomatis berstatus <span className="text-red-500 font-bold">Belum Tuntas</span>.
        </div>
      </div>

      {/* Spreadsheet grid */}
      <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left border-collapse table-fixed min-w-[550px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3.5 w-[160px]">Nama Siswa</th>
              {(selectedComponent === 'all' || selectedComponent === 'tugas') && (
                <th className="px-3 py-3.5 text-center w-[90px]">Tugas (20%)</th>
              )}
              {(selectedComponent === 'all' || selectedComponent === 'uts') && (
                <th className="px-3 py-3.5 text-center w-[90px]">UTS (30%)</th>
              )}
              {(selectedComponent === 'all' || selectedComponent === 'uas') && (
                <th className="px-3 py-3.5 text-center w-[90px]">UAS (40%)</th>
              )}
              {(selectedComponent === 'all' || selectedComponent === 'harian') && (
                <th className="px-3 py-3.5 text-center w-[120px]">Nilai Harian (10%)</th>
              )}
              <th className="px-4 py-3.5 text-center w-[110px]">Nilai Akhir</th>
              <th className="px-4 py-3.5 text-center w-[110px]">Status</th>
              <th className="px-4 py-3.5 text-right w-[100px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-350">
            {classStudents.length > 0 ? (
              classStudents.map((std) => {
                const gradeObj = grades.find(g => g.studentId === std.id && g.subjectId === selectedSubject);
                const isLocalDirty = std.id in editStates;
                
                const currentTugas = isLocalDirty ? editStates[std.id].tugas : (gradeObj?.tugas || 0);
                const currentUts = isLocalDirty ? editStates[std.id].uts : (gradeObj?.uts || 0);
                const currentUas = isLocalDirty ? editStates[std.id].uas : (gradeObj?.uas || 0);
                const currentPraktik = isLocalDirty ? editStates[std.id].praktik : (gradeObj?.praktik || 0);
                
                const finalScore = calculateFinal(currentTugas, currentUts, currentUas, currentPraktik);
                const isPassed = finalScore >= subjectKKM;

                return (
                  <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{std.nama}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">NISN: {std.nisn}</div>
                    </td>

                    {/* Tugas */}
                    {(selectedComponent === 'all' || selectedComponent === 'tugas') && (
                      <td className="px-3 py-3 text-center">
                        <input
                          type="text"
                          maxLength={3}
                          value={currentTugas === 0 && !isLocalDirty ? '' : currentTugas}
                          onChange={(e) => handleLocalChange(std.id, 'tugas', e.target.value)}
                          placeholder="0"
                          className="w-16 px-1.5 py-1 text-center bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </td>
                    )}

                    {/* UTS */}
                    {(selectedComponent === 'all' || selectedComponent === 'uts') && (
                      <td className="px-3 py-3 text-center">
                        <input
                          type="text"
                          maxLength={3}
                          value={currentUts === 0 && !isLocalDirty ? '' : currentUts}
                          onChange={(e) => handleLocalChange(std.id, 'uts', e.target.value)}
                          placeholder="0"
                          className="w-16 px-1.5 py-1 text-center bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </td>
                    )}

                    {/* UAS */}
                    {(selectedComponent === 'all' || selectedComponent === 'uas') && (
                      <td className="px-3 py-3 text-center">
                        <input
                          type="text"
                          maxLength={3}
                          value={currentUas === 0 && !isLocalDirty ? '' : currentUas}
                          onChange={(e) => handleLocalChange(std.id, 'uas', e.target.value)}
                          placeholder="0"
                          className="w-16 px-1.5 py-1 text-center bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </td>
                    )}

                    {/* Praktik */}
                    {(selectedComponent === 'all' || selectedComponent === 'harian') && (
                      <td className="px-3 py-3 text-center">
                        <input
                          type="text"
                          maxLength={3}
                          value={currentPraktik === 0 && !isLocalDirty ? '' : currentPraktik}
                          onChange={(e) => handleLocalChange(std.id, 'praktik', e.target.value)}
                          placeholder="0"
                          className="w-16 px-1.5 py-1 text-center bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </td>
                    )}

                    {/* Nilai Akhir */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-black font-mono ${
                        isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}>
                        {finalScore}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${
                        isPassed 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {isPassed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Tuntas
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            Belum Tuntas
                          </>
                        )}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSaveRow(std.id)}
                        disabled={!isLocalDirty}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition ${
                          isLocalDirty 
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-95' 
                            : 'bg-slate-100 dark:bg-slate-850 text-slate-400 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Simpan
                      </button>
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={selectedComponent === 'all' ? 8 : (selectedComponent === 'tugas' || selectedComponent === 'uts' || selectedComponent === 'uas' || selectedComponent === 'harian' ? 5 : 8)} className="px-4 py-10 text-center text-slate-400">
                  Tidak ada murid di dalam rombel <b>{selectedClass}</b> yang mencocokkan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
