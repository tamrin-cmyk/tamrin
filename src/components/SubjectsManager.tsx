/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Download, AlertTriangle, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { Subject } from '../types';

interface SubjectsManagerProps {
  subjects: Subject[];
  onAdd: (sub: Omit<Subject, 'id'>) => void;
  onEdit: (sub: Subject) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export default function SubjectsManager({
  subjects,
  onAdd,
  onEdit,
  onDelete,
  isAdmin
}: SubjectsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [namaMapel, setNamaMapel] = useState('');
  const [kodeMapel, setKodeMapel] = useState('');
  const [kkm, setKkm] = useState(75);
  const [semester, setSemester] = useState('Ganjil');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');

  // Open modal for Add
  const handleOpenAdd = () => {
    setEditingSubject(null);
    setNamaMapel('');
    setKodeMapel('');
    setKkm(75);
    setSemester('Ganjil');
    setTahunAjaran('2025/2026');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setNamaMapel(sub.namaMapel);
    setKodeMapel(sub.kodeMapel);
    setKkm(sub.kkm);
    setSemester(sub.semester);
    setTahunAjaran(sub.tahunAjaran);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMapel || !kodeMapel) {
      alert('Nama mapel dan Kode mapel wajib diisi!');
      return;
    }

    if (editingSubject) {
      onEdit({
        id: editingSubject.id,
        namaMapel,
        kodeMapel,
        kkm: Number(kkm),
        semester,
        tahunAjaran
      });
    } else {
      onAdd({
        namaMapel,
        kodeMapel,
        kkm: Number(kkm),
        semester,
        tahunAjaran
      });
    }
    setIsModalOpen(false);
  };

  // Handle local export excel simulation
  const handleExportExcel = () => {
    const headers = 'ID,Nama Mapel,Kode Mapel,KKM,Semester,Tahun Ajaran\n';
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers 
      + subjects.map(s => `"${s.id}","${s.namaMapel}","${s.kodeMapel}",${s.kkm},"${s.semester}","${s.tahunAjaran}"`).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GuruKu_Mata_Pelajaran_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  // Filter and search
  const filteredSubjects = subjects.filter(sub => 
    sub.namaMapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.kodeMapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.tahunAjaran.includes(searchTerm)
  );

  // Pagination
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubjects = filteredSubjects.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6" id="subjects-manager-root">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Mata Pelajaran (Mapel)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Kelola mata pelajaran dan batasan KKM sekolah dasar/menengah.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 text-slate-700 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Mapel
            </button>
          )}
        </div>
      </div>

      {/* Warning if not admin */}
      {!isAdmin && (
        <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 text-amber-800 dark:text-amber-400 text-xs rounded-xl">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span><b>Akses Terbatas:</b> Anda login sebagai Guru. Anda hanya dapat melihat (Read-Only) data master Mata Pelajaran. Perubahan hanya bisa dilakukan oleh Administrator.</span>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <Search className="w-4.5 h-4.5" />
        </span>
        <input
          type="text"
          placeholder="Cari berdasarkan nama mapel, kode mapel, atau tahun ajaran..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/45 focus:border-indigo-500 transition"
        />
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">Kode Mapel</th>
              <th className="px-6 py-4">Nama Mata Pelajaran</th>
              <th className="px-6 py-4 text-center">KKM (Kriteria Kelulusan)</th>
              <th className="px-6 py-4">Semester</th>
              <th className="px-6 py-4">Tahun Ajaran</th>
              {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
            {paginatedSubjects.length > 0 ? (
              paginatedSubjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{sub.kodeMapel}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{sub.namaMapel}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2.5 py-1 text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-lg">
                      {sub.kkm}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{sub.semester}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{sub.tahunAjaran}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                        title="Edit Mapel"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(sub.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-red-500 transition cursor-pointer"
                        title="Hapus Mapel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="px-6 py-10 text-center text-slate-400 text-xs">
                  Tidak ada mata pelajaran ditemukan yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Row */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Menampilkan {startIndex + 1} - {Math.min(filteredSubjects.length, startIndex + itemsPerPage)} dari {filteredSubjects.length} mapel
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CRUD Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="subject-modal">
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

            <h3 className="text-lg font-bold text-slate-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Mapel</label>
                <input
                  type="text"
                  placeholder="Misal: Matematika, Penjasorkes"
                  value={namaMapel}
                  onChange={(e) => setNamaMapel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    placeholder="Misal: MTK-IX"
                    value={kodeMapel}
                    onChange={(e) => setKodeMapel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">KKM Kelulusan</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={kkm}
                    onChange={(e) => setKkm(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    placeholder="Misal: 2025/2026"
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
