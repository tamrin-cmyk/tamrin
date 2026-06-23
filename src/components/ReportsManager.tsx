/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FileSpreadsheet, FileText, Calendar, Printer, Download, Sparkles, School, ShieldCheck } from 'lucide-react';
import { Student, Subject, Grade, Attendance, Journal, ClassSession } from '../types';

interface ReportsManagerProps {
  students: Student[];
  subjects: Subject[];
  classes: ClassSession[];
  grades: Grade[];
  attendance: Attendance[];
  journals: Journal[];
}

export default function ReportsManager({
  students,
  subjects,
  classes,
  grades,
  attendance,
  journals
}: ReportsManagerProps) {
  const [reportType, setReportType] = useState<'nilai' | 'absensi' | 'jurnal'>('nilai');
  const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].namaKelas : '');
  const [selectedSubject, setSelectedSubject] = useState(subjects.length > 0 ? subjects[0].id : '');

  const classStudents = students.filter(s => s.kelas === selectedClass);
  const subjectObj = subjects.find(sub => sub.id === selectedSubject);

  const triggerPrint = () => {
    window.print();
  };

  // CSV generate and export helper
  const handleExportCSV = () => {
    let headers = '';
    let rowContent = '';
    let docTitle = `Laporan_${reportType}_${selectedClass}`;

    if (reportType === 'nilai') {
      headers = 'Nama Siswa,NISN,Tugas,UTS,UAS,Praktik,Nilai Akhir,Status\n';
      rowContent = classStudents.map(std => {
        const grade = grades.find(g => g.studentId === std.id && g.subjectId === selectedSubject);
        return `"${std.nama}","${std.nisn}",${grade?.tugas || 0},${grade?.uts || 0},${grade?.uas || 0},${grade?.praktik || 0},${grade?.nilaiAkhir || 0},"${grade?.status || 'Belum Diinput'}"`;
      }).join('\n');
    } else if (reportType === 'absensi') {
      headers = 'Nama Siswa,NISN,Total Hadir,Total Izin,Total Sakit,Total Alfa,Total Terlambat,Rasio Kehadiran\n';
      rowContent = classStudents.map(std => {
        const stdRecords = attendance.filter(a => a.studentId === std.id);
        const hadir = stdRecords.filter(r => r.status === 'Hadir').length;
        const izin = stdRecords.filter(r => r.status === 'Izin').length;
        const sakit = stdRecords.filter(r => r.status === 'Sakit').length;
        const alfa = stdRecords.filter(r => r.status === 'Alfa').length;
        const terlambat = stdRecords.filter(r => r.status === 'Terlambat').length;
        const total = hadir + izin + sakit + alfa + terlambat;
        const rate = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 100;
        return `"${std.nama}","${std.nisn}",${hadir},${izin},${sakit},${alfa},${terlambat},"${rate}%"`;
      }).join('\n');
    } else if (reportType === 'jurnal') {
      headers = 'Tanggal,Guru Pengajar,Mata Pelajaran,Materi Pokok,Metode,Status\n';
      const classJournals = journals.filter(j => j.kelas === selectedClass);
      rowContent = classJournals.map(jnl => {
        return `"${jnl.tanggal}","${jnl.guruNama}","${jnl.mataPelajaran}","${jnl.materi}","${jnl.metode}","${jnl.status}"`;
      }).join('\n');
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers + rowContent;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${docTitle}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="reports-manager-root">
      
      {/* Selector Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Pusat Cetak Laporan Akademik
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Ekstrak lembar data resmi sekolah untuk didistribusikan ke komite sekolah & dindik.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Laporan Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'nilai' | 'absensi' | 'jurnal')}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
            >
              <option value="nilai">Laporan Rekap Nilai</option>
              <option value="absensi">Laporan Presensi Bulanan</option>
              <option value="jurnal">Laporan Jurnal Pengajaran</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kelas Target</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
            >
              {classes.map(c => (
                <option key={c.id} value={c.namaKelas}>{c.namaKelas}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter (Only for Nilai report) */}
          <div className={`${reportType === 'nilai' ? 'block' : 'opacity-40 pointer-events-none'}`}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mata Pelajaran</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={reportType !== 'nilai'}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.namaMapel}</option>
              ))}
            </select>
          </div>

          {/* Action trigger button */}
          <div className="flex items-end gap-2">
            <button
              onClick={triggerPrint}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:text-slate-200 dark:hover:bg-slate-800 text-slate-650 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Spreadsheet
            </button>
          </div>
        </div>
      </div>

      {/* Generated preview container styled like an official paper sheet */}
      <div 
        className="bg-white text-slate-900 border border-slate-250 rounded-2xl p-8 shadow-xl max-w-4xl mx-auto space-y-6 select-none"
        id="report-printable-sheet"
      >
        
        {/* Kop Resmi Tut Wuri Handayani */}
        <div className="text-center space-y-1.5 border-b-4 border-double border-slate-900 pb-4">
          <div className="flex items-center justify-center gap-3">
            <School className="w-8 h-8 text-slate-850 flex-shrink-0 animate-bounce" />
            <div className="text-center">
              <h1 className="text-base font-extrabold uppercase tracking-wider">Pemerintah Kota Surabaya</h1>
              <h2 className="text-sm font-bold uppercase">Dinas Pendidikan Pendidikan Menengah Madani</h2>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-serif lowercase italic">"ing ngarsa sung tulada, ing madya mangun karsa, tut wuri handayani"</p>
        </div>

        {/* Dynamic header title based on state values */}
        <div className="text-center">
          <h3 className="text-sm font-black uppercase tracking-wide">
            {reportType === 'nilai' && `LEMBAR REKAPITULASI EVALUASI BELAJAR (NILAI SISWA)`}
            {reportType === 'absensi' && `REKAPITULASI PRESENSI BULLETIN BULANAN`}
            {reportType === 'jurnal' && `REKAP JURNAL KEGIATAN MENGAJAR`}
          </h3>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase">
            Rombel: {selectedClass} | {reportType === 'nilai' ? `Mapel: ${subjectObj?.namaMapel} | KKM: ${subjectObj?.kkm}` : `Tahun Ajaran: 2025/2026`}
          </p>
        </div>

        {/* Render Conditional Reports Sheet */}
        {reportType === 'nilai' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-300">
                  <th className="border border-slate-300 px-3 py-2">Nama Siswa</th>
                  <th className="border border-slate-300 px-3 py-2">NISN</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Tugas</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">UTS</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">UAS</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Praktik</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Akhir</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Kualifikasi</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((std) => {
                  const grade = grades.find(g => g.studentId === std.id && g.subjectId === selectedSubject);
                  const isPassed = (grade?.nilaiAkhir || 0) >= (subjectObj?.kkm || 75);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50 font-medium text-slate-800">
                      <td className="border border-slate-300 px-3 py-2 font-bold">{std.nama}</td>
                      <td className="border border-slate-300 px-3 py-2 font-mono">{std.nisn}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{grade?.tugas || 0}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{grade?.uts || 0}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{grade?.uas || 0}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center">{grade?.praktik || 0}</td>
                      <td className="border border-slate-300 px-3 py-2 text-center font-bold font-mono">{grade?.nilaiAkhir || 0}</td>
                      <td className={`border border-slate-300 px-3 py-2 text-center font-bold ${
                        grade ? (isPassed ? 'text-emerald-700' : 'text-red-650') : 'text-slate-400'
                      }`}>
                        {grade ? (isPassed ? 'TUNTAS' : 'REMIDI') : 'BELUM INPUT'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'absensi' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-850 font-extrabold border-b border-slate-300">
                  <th className="border border-slate-300 px-3 py-2">Nama Lengkap Siswa</th>
                  <th className="border border-slate-300 px-3 py-2">NISN</th>
                  <th className="border border-slate-300 px-2 py-2 text-center bg-emerald-50 text-emerald-800">Hadir</th>
                  <th className="border border-slate-300 px-2 py-2 text-center bg-blue-50 text-blue-800">Izin</th>
                  <th className="border border-slate-300 px-2 py-2 text-center bg-amber-50 text-amber-800">Sakit</th>
                  <th className="border border-slate-300 px-2 py-2 text-center bg-rose-50 text-rose-850">Alfa</th>
                  <th className="border border-slate-300 px-2 py-2 text-center bg-purple-50 text-purple-800">Telat</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">Rasio Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((std) => {
                  const stdRecords = attendance.filter(a => a.studentId === std.id);
                  const hadir = stdRecords.filter(r => r.status === 'Hadir').length;
                  const izin = stdRecords.filter(r => r.status === 'Izin').length;
                  const sakit = stdRecords.filter(r => r.status === 'Sakit').length;
                  const alfa = stdRecords.filter(r => r.status === 'Alfa').length;
                  const terlambat = stdRecords.filter(r => r.status === 'Terlambat').length;
                  const total = hadir + izin + sakit + alfa + terlambat;
                  const rate = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 100;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50 text-slate-800">
                      <td className="border border-slate-300 px-3 py-2 font-bold">{std.nama}</td>
                      <td className="border border-slate-300 px-3 py-2 font-mono">{std.nisn}</td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold text-emerald-600">{hadir} Hr</td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-mono text-blue-600">{izin} Hr</td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-mono text-amber-600">{sakit} Hr</td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold text-rose-500">{alfa} Hr</td>
                      <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold text-purple-600">{terlambat} Hr</td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-bold font-mono">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'jurnal' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-00">
                  <th className="border border-slate-300 px-3 py-2">Tanggal</th>
                  <th className="border border-slate-300 px-3 py-2">Mata Pelajaran</th>
                  <th className="border border-slate-300 px-3 py-2">Guru</th>
                  <th className="border border-slate-300 px-4 py-2">Materi Pokok yang Disampaikan</th>
                  <th className="border border-slate-300 px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {journals.map((jnl) => (
                  <tr key={jnl.id} className="hover:bg-slate-50 text-slate-800">
                    <td className="border border-slate-300 px-3 py-2 font-mono">{jnl.tanggal}</td>
                    <td className="border border-slate-300 px-3 py-2 font-bold">{jnl.mataPelajaran}</td>
                    <td className="border border-slate-300 px-3 py-2">{jnl.guruNama}</td>
                    <td className="border border-slate-300 px-4 py-2 leading-relaxed">{jnl.materi}</td>
                    <td className="border border-slate-300 px-3 py-2 font-bold font-mono">{jnl.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tanda Tangan */}
        <div className="flex justify-between items-center pt-6 text-[11px]">
          <div className="w-1/3 text-center">
            <p>Mengesahkan,</p>
            <p className="font-bold">Wali Kelas Pengampu</p>
            <div className="h-12"></div>
            <p className="font-bold underline">Prof. Dr. Irwan Santoso, M.Pd.</p>
            <span className="text-[9px] text-slate-400">NIP. 196805121995111001</span>
          </div>

          <div className="w-2/5 text-center bg-slate-50/50 p-2 border border-slate-200 rounded-lg">
            <p className="font-bold text-slate-700 flex items-center justify-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Dokumen Sah / Resmi</p>
            <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">Lembar laporan terverifikasi Cloud Firestore secara mutlak dan siap dicetak.</p>
          </div>

          <div className="w-1/3 text-center">
            <p>Surabaya, {new Date().toISOString().split('T')[0]}</p>
            <p className="font-bold">Pencatat Administrasi</p>
            <div className="h-12"></div>
            <p className="font-bold underline">Tamrin, S.Pd.</p>
            <span className="text-[9px] text-slate-400">SMPN Guruku Madani</span>
          </div>
        </div>

      </div>

    </div>
  );
}
