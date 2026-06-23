/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Printer, Sparkles, FileText, CheckCircle2, ChevronDown, X, Save, Calendar } from 'lucide-react';
import { Journal, ClassSession, Subject, Schedule } from '../types';

interface JournalsManagerProps {
  journals: Journal[];
  classes: ClassSession[];
  subjects: Subject[];
  schedules: Schedule[];
  prefill?: { kelas: string; mataPelajaran: string; scheduleId: string } | null;
  onClearPrefill?: () => void;
  onAdd: (jnl: Omit<Journal, 'id' | 'guruId' | 'guruNama'>) => void;
  onEdit: (jnl: Journal) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export default function JournalsManager({
  journals,
  classes,
  subjects,
  schedules,
  prefill,
  onClearPrefill,
  onAdd,
  onEdit,
  onDelete,
  isAdmin
}: JournalsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Realtime clock for schedule validation
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isScheduleLocked = (sch: Schedule) => {
    if (isAdmin) return false;
    let currentDayIdx = currentTime.getDay();
    if (currentDayIdx === 0) currentDayIdx = 7; // Sunday = 7

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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);

  // Form states
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].namaKelas : '');
  const [selectedMapel, setSelectedMapel] = useState(subjects.length > 0 ? subjects[0].namaMapel : '');
  const [materi, setMateri] = useState('');
  const [metode, setMetode] = useState('');
  const [catatan, setCatatan] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Publish'>('Publish');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  // Printable Modal preview
  const [printPreviewJournal, setPrintPreviewJournal] = useState<Journal | null>(null);

  // Auto prefilled handler
  useEffect(() => {
    if (prefill) {
      setEditingJournal(null);
      setTanggal(new Date().toISOString().split('T')[0]);
      setSelectedClass(prefill.kelas);
      setSelectedMapel(prefill.mataPelajaran);
      setSelectedScheduleId(prefill.scheduleId);
      setMateri('');
      setMetode('');
      setCatatan('');
      setStatus('Publish');
      setIsModalOpen(true);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefill]);

  const handleOpenAdd = () => {
    setEditingJournal(null);
    setTanggal(new Date().toISOString().split('T')[0]);
    setSelectedClass(classes.length > 0 ? classes[0].namaKelas : '');
    setSelectedMapel(subjects.length > 0 ? subjects[0].namaMapel : '');
    setMateri('');
    setMetode('');
    setCatatan('');
    setStatus('Publish');
    setSelectedScheduleId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (jnl: Journal) => {
    setEditingJournal(jnl);
    setTanggal(jnl.tanggal);
    setSelectedClass(jnl.kelas);
    setSelectedMapel(jnl.mataPelajaran);
    setMateri(jnl.materi);
    setMetode(jnl.metode);
    setCatatan(jnl.catatan);
    setStatus(jnl.status);
    setSelectedScheduleId(jnl.scheduleId || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materi || !metode || !catatan) {
      alert('Semua isian materi, metode, dan evaluasi catatan wajib diisi!');
      return;
    }

    if (editingJournal) {
      onEdit({
        ...editingJournal,
        tanggal,
        kelas: selectedClass,
        mataPelajaran: selectedMapel,
        materi,
        metode,
        catatan,
        status,
        scheduleId: selectedScheduleId || undefined
      });
    } else {
      onAdd({
        tanggal,
        kelas: selectedClass,
        mataPelajaran: selectedMapel,
        materi,
        metode,
        catatan,
        status,
        scheduleId: selectedScheduleId || undefined
      });
    }
    setIsModalOpen(false);
  };

  const handlePrint = (jnl: Journal) => {
    setPrintPreviewJournal(jnl);
  };

  const triggerNativePrint = () => {
    window.print();
  };

  const filteredJournals = journals.filter(j => 
    j.materi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.mataPelajaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.guruNama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6" id="journals-manager-root">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            Jurnal KBM Harian Guru
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Catatan mengajar harian, materi ajar, metode interaktif, dan asesmen harian.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tulis Jurnal Baru
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <Search className="w-4.5 h-4.5" />
        </span>
        <input
          type="text"
          placeholder="Cari jurnal KBM berdasarkan materi, kelas, mata pelajaran, atau nama guru..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
        />
      </div>

      {/* List layout: Cards or Table */}
      <div className="space-y-4">
        {filteredJournals.length > 0 ? (
          filteredJournals.map((jnl) => (
            <div 
              key={jnl.id} 
              className="border border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/25 p-5 rounded-2xl shadow-xs hover:border-indigo-100 dark:hover:border-slate-850 hover:shadow-xs transition duration-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">{jnl.tanggal}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="px-2.5 py-0.5 bg-indigo-55 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] uppercase rounded-md">
                    {jnl.kelas}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {jnl.mataPelajaran}
                  </span>
                  {jnl.scheduleId && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-100/30 dark:border-emerald-900/20" title="Terhubung dengan Jadwal Pembelajaran Admin">
                        <Calendar className="w-3 h-3" />
                        Terjadwal ({
                          (() => {
                            const sch = schedules.find(s => s.id === jnl.scheduleId);
                            return sch ? `${sch.hari} ${sch.jamMulai}` : 'Jadwal Admin';
                          })()
                        })
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[9px] uppercase font-black rounded-lg ${
                    jnl.status === 'Publish' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40'
                  }`}>
                    {jnl.status}
                  </span>

                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handlePrint(jnl)}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-150 rounded text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                      title="Cetak/Simpan PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(jnl)}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-150 rounded text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                      title="Edit Jurnal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(jnl.id)}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-150 rounded text-slate-500 hover:text-red-500 transition cursor-pointer"
                      title="Hapus Jurnal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Journal details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-xs">
                <div className="md:col-span-3 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Materi Pokok & Sub-tema</span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{jnl.materi}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Metode & Alat Pembelajaran</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{jnl.metode}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Evaluasi & Hambatan Siswa</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 italic leading-relaxed font-light">"{jnl.catatan}"</p>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-850 pt-3 md:pt-0 md:pl-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Guru Pengajar</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{jnl.guruNama}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-2 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ID: {jnl.id}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50/20 dark:bg-slate-950/10 rounded-2xl border border-slate-100 dark:border-slate-850 text-slate-400 text-xs text-light">
            Belum ada rekam Jurnal KBM yang terpasang. Tulis jurnal baru sekarang!
          </div>
        )}
      </div>

      {/* CRUD Journal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              {editingJournal ? 'Edit Jurnal KBM' : 'Tulis Jurnal KBM Harian'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Publikasi Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Draft' | 'Publish')}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300"
                  >
                    <option value="Publish">Publish (Publik)</option>
                    <option value="Draft">Draft (Arsip Pribadi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-normal">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rombel (Kelas)</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.namaKelas}>{c.namaKelas}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                  <select
                    value={selectedMapel}
                    onChange={(e) => setSelectedMapel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-350"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.namaMapel}>{s.namaMapel}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rujukan Jadwal Pelajaran (Admin Master Schedule) */}
              <div className="bg-indigo-50/30 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100/40 dark:border-emerald-950/20">
                <label className="block text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Rujukan Jadwal Mengajar (Buatan Admin)
                </label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => {
                    const schId = e.target.value;
                    setSelectedScheduleId(schId);
                    if (schId) {
                      const sch = schedules.find(s => s.id === schId);
                      if (sch) {
                        setSelectedClass(sch.kelasNama);
                        setSelectedMapel(sch.subjectNama);
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300"
                >
                  <option value="">-- Bebas (Tidak Berdasarkan Jadwal) --</option>
                  {schedules.map(sch => {
                    const locked = isScheduleLocked(sch);
                    return (
                      <option key={sch.id} value={sch.id} disabled={locked}>
                        [{sch.hari}] {sch.kelasNama} — {sch.subjectNama} ({sch.jamMulai} - {sch.jamSelesai}) {locked ? '- (EXPIRED / LEWAT)' : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  Menghubungkan jurnal dengan jadwal akan membantu pelaporan admin mencocokkan realisasi mengajar harian.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Materi Pembelajaran Pokok</label>
                <input
                  type="text"
                  placeholder="Misal: Menyelesaikan akar kuadrat dengan faktorisasi linier..."
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Metode & Alat Bantu KBM</label>
                <textarea
                  placeholder="Misal: Diskusi terarah, Proyeksi Grafik Geogebra, kelompok kecil kelompok unjuk rasa..."
                  value={metode}
                  onChange={(e) => setMetode(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Hambatan & Solusi KBM (Asesmen)</label>
                <textarea
                  placeholder="Isikan catatan kritis seperti evaluasi pengerjaan siswa, remidial, keterlibatan, murid pasif dsb..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-100 dark:shadow-none flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CETAK PDF SIMULATOR OVERLAY MODAL */}
      {printPreviewJournal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl space-y-6">
            
            {/* Modal Controls (Non-printable in standard print layouts) */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm uppercase">
                <FileText className="w-5 h-5 text-indigo-600" />
                Daftar Dokumen PDF Tergenerasi (Cetak)
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={triggerNativePrint}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak PDF (window.print)
                </button>
                <button
                  onClick={() => setPrintPreviewJournal(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="space-y-6 px-2 text-slate-950" id="raw-print-sheet">
              {/* Kop Surat Sekolah */}
              <div className="text-center space-y-1 border-b-4 border-double border-slate-900 pb-4">
                <h1 className="text-xl font-extrabold uppercase tracking-wide">Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi</h1>
                <h2 className="text-base font-bold uppercase">Upt Satuan Pendidikan SMP NEGERI GURUKU MADANI</h2>
                <p className="text-[10px] text-slate-500 font-serif">Jl. Pemuda No. 12, Surabaya Telp. (031) 555-0193 Email: info@gurukumadani.sch.id</p>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center text-sm font-bold uppercase mt-4">
                JURNAL KEGIATAN KBM HARIAN GURU
                <div className="text-[11px] font-mono normal-case tracking-wider text-slate-500 mt-0.5">ID: {printPreviewJournal.id}</div>
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 gap-4 text-xs mt-6 border border-slate-200 p-4 rounded-xl leading-relaxed text-slate-800">
                <div>
                  <div><span className="font-bold">Mata Pelajaran :</span> {printPreviewJournal.mataPelajaran}</div>
                  <div><span className="font-bold">Kelas / Semester :</span> {printPreviewJournal.kelas} / Ganjil</div>
                  <div><span className="font-bold">Tahun Pelajaran :</span> 2025/2026</div>
                  {printPreviewJournal.scheduleId && (
                    <div className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">
                      ✓ Rujukan Jadwal Master Terhubung
                    </div>
                  )}
                </div>
                <div>
                  <div><span className="font-bold">Hari / Tanggal :</span> {printPreviewJournal.tanggal}</div>
                  <div><span className="font-bold">Status Verifikasi :</span> Disetujui (Sinkron Firebase)</div>
                  <div><span className="font-bold">Guru Pengampu :</span> {printPreviewJournal.guruNama}</div>
                  {printPreviewJournal.scheduleId && (
                    <div>
                      <span className="font-bold">Sesi Jadwal Sesuai :</span> {
                        (() => {
                          const sch = schedules.find(s => s.id === printPreviewJournal.scheduleId);
                          return sch ? `${sch.hari} (${sch.jamMulai} - ${sch.jamSelesai})` : 'Jadwal Admin';
                        })()
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Materi dan Jurnal */}
              <div className="space-y-4 text-xs mt-4 leading-relaxed">
                <div className="border border-slate-200 p-4 rounded-xl space-y-2">
                  <h4 className="font-serif font-bold text-slate-800 text-[11px] uppercase border-b pb-1">Materi Pokok yang Diajarkan</h4>
                  <p className="text-slate-800 pl-2 font-medium bg-slate-50/50 py-1.5 rounded">{printPreviewJournal.materi}</p>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl space-y-2">
                  <h4 className="font-serif font-bold text-slate-800 text-[11px] uppercase border-b pb-1">Metode & Integrasi Alat Bantu Pengajaran</h4>
                  <p className="text-slate-800 pl-2 pr-2">{printPreviewJournal.metode}</p>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl space-y-2">
                  <h4 className="font-serif font-bold text-slate-800 text-[11px] uppercase border-b pb-1">Evaluasi Hasil KBM, Observasi Siswa & Solusi</h4>
                  <p className="text-slate-850 pl-2 pr-2 italic font-light">"{printPreviewJournal.catatan}"</p>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="flex justify-between items-center pt-8 mt-12 text-xs">
                <div className="w-1/3 text-center">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala Sekolah SMP Negeri Guruku</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">Prof. Dr. Irwan Santoso, M.Pd.</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. 197405231999031002</p>
                </div>

                <div className="w-1/3 text-center">
                  <p>Surabaya, {printPreviewJournal.tanggal}</p>
                  <p className="font-bold">Guru Mata Pelajaran</p>
                  {/* Beautiful simulated blue ink stamp */}
                  <div className="h-16 flex items-center justify-center">
                    <span className="border-2 border-dashed border-indigo-650 text-indigo-700 font-serif font-extrabold text-[8px] uppercase p-1 rounded-sm transform -rotate-12 select-none">
                      SMPN GURUKU MADANI
                    </span>
                  </div>
                  <p className="font-bold underline">{printPreviewJournal.guruNama}</p>
                  <p className="text-[10px] text-slate-500 font-mono">NIP. - Pengajar Honorer</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
