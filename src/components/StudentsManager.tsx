/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Download, Upload, AlertCircle, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Student, ClassSession } from '../types';

interface StudentsManagerProps {
  students: Student[];
  classes: ClassSession[];
  onAdd: (student: Omit<Student, 'id'>) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
  onImport: (importedStudents: Omit<Student, 'id'>[]) => void;
  isAdmin: boolean;
}

export default function StudentsManager({
  students,
  classes,
  onAdd,
  onEdit,
  onDelete,
  onImport,
  isAdmin
}: StudentsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form States
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [selectedClass, setSelectedClass] = useState('');
  const [alamat, setAlamat] = useState('');
  const [noHpOrangTua, setNoHpOrangTua] = useState('');

  // Drag & Drop / Upload Simulations
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setNisn('');
    setNama('');
    setJk('L');
    setSelectedClass(classes.length > 0 ? classes[0].namaKelas : '');
    setAlamat('');
    setNoHpOrangTua('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (std: Student) => {
    setEditingStudent(std);
    setNisn(std.nisn);
    setNama(std.nama);
    setJk(std.jk);
    setSelectedClass(std.kelas);
    setAlamat(std.alamat);
    setNoHpOrangTua(std.noHpOrangTua);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn || !nama || !selectedClass) {
      alert('NISN, Nama Lengkap, dan Kelas wajib diisi!');
      return;
    }

    if (editingStudent) {
      onEdit({
        id: editingStudent.id,
        nisn,
        nama,
        jk,
        kelas: selectedClass,
        alamat,
        noHpOrangTua
      });
    } else {
      onAdd({
        nisn,
        nama,
        jk,
        kelas: selectedClass,
        alamat,
        noHpOrangTua
      });
    }
    setIsModalOpen(false);
  };

  // Drag and Drop Handles
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processSimulatedFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      alert('Ekstensi file salah! Gunakan file .xlsx, .xls, atau .csv');
      return;
    }

    setImportStatus('loading');
    
    // Simulate Parsing Excel with delay
    setTimeout(() => {
      const mockImported: Omit<Student, 'id'>[] = [
        { nisn: '0087654401', nama: 'Farhan Ramadhan', jk: 'L', kelas: classes.length > 0 ? classes[0].namaKelas : 'Kelas IX-A', alamat: 'Jl. Rungkut Madya No. 90', noHpOrangTua: '081223344551' },
        { nisn: '0087654402', nama: 'Indah Kusuma', jk: 'P', kelas: classes.length > 0 ? classes[0].namaKelas : 'Kelas IX-A', alamat: 'Jl. Menur Pumpungan 12', noHpOrangTua: '081222333444' },
        { nisn: '0087654403', nama: 'Khairul Anwar', jk: 'L', kelas: classes.length > 1 ? classes[1].namaKelas : 'Kelas IX-B', alamat: 'Jl. Raya Dharmahusada 11A', noHpOrangTua: '081344556677' }
      ];

      onImport(mockImported);
      setImportCount(mockImported.length);
      setImportStatus('success');
      
      setTimeout(() => {
        setImportStatus('idle');
      }, 5000);
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSimulatedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSimulatedFile(e.target.files[0]);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = 'ID,NISN,Nama Siswa,Jenis Kelamin,Kelas,Alamat,No HP Orang Tua\n';
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers 
      + students.map(s => `"${s.id}","${s.nisn}","${s.nama}","${s.jk}","${s.kelas}","${s.alamat}","${s.noHpOrangTua}"`).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GuruKu_Data_Siswa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters & Searches
  const filteredStudents = students.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.nisn.includes(searchTerm) || 
                        s.alamat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = classFilter === '' || s.kelas === classFilter;
    return matchSearch && matchClass;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6" id="students-manager-root">
      
      {/* Import & Export Tools Panel (collapsible or dashboard header) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Siswa Table/List Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Pangkalan Data Siswa
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Kelola identitas, NISN resmi kemendikbud, serta alamat wali siswa.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              {isAdmin && (
                <button
                  onClick={handleOpenAdd}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Siswa
                </button>
              )}
            </div>
          </div>

          {/* Search + Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari siswa berdasarkan nama, NISN..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 dark:text-slate-350"
              >
                <option value="">Semua Kelas</option>
                {classes.map(c => (
                  <option key={c.id} value={c.namaKelas}>{c.namaKelas}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-200/5">
                  <th className="px-4 py-3">NISN</th>
                  <th className="px-4 py-3">Nama Lengkap</th>
                  <th className="px-4 py-3 text-center">JK</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Alamat / No. HP</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-350">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-850 dark:text-slate-200">{std.nisn}</td>
                      <td className="px-4 py-3 bg-gradient-to-r from-transparent to-slate-50/30 font-semibold">{std.nama}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          std.jk === 'L' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40' : 'bg-pink-50 text-pink-600 dark:bg-pink-950/40'
                        }`}>
                          {std.jk}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-500">{std.kelas}</td>
                      <td className="px-4 py-3 space-y-0.5">
                        <p className="truncate max-w-[150px]">{std.alamat}</p>
                        <p className="text-[10px] font-mono text-emerald-600">{std.noHpOrangTua}</p>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(std)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded hover:text-indigo-600 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(std.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-slate-400">
                      Siswa tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Menampilkan {startIndex + 1} - {Math.min(filteredStudents.length, startIndex + itemsPerPage)} dari {filteredStudents.length} siswa
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drag and Drop / Excel Import Sidebar Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-1.5">
              <Upload className="w-5 h-5 text-indigo-500" />
              Sistem Import Siswa
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Import massal data siswa menggunakan excel atau csv (Drag & Drop).</p>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => isAdmin && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition duration-200 flex flex-col items-center justify-center space-y-3 cursor-pointer ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20' 
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-850/10'
            } ${!isAdmin ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
              disabled={!isAdmin}
            />

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-full text-indigo-600">
              <Download className="w-6 h-6 transform rotate-180 animate-bounce" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Drag & Drop File Excel/CSV Anda di Sini
              </p>
              <p className="text-[10px] text-slate-400">
                Atau klik untuk browse file dari laptop Anda.
              </p>
            </div>

            <span className="text-[9px] bg-slate-150 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono font-bold">
              Format: NISN, Nama, JK, Kelas, Alamat, NoHP
            </span>
          </div>

          {/* Import States Log */}
          {importStatus === 'loading' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">Sedang menguraikan data berkas spreadsheet (simulasi)...</span>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/35 space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-xs font-bold">Berhasil Mengunggah Berkas!</span>
              </div>
              <p className="text-[10px] text-emerald-600/80">
                Data <b>{importCount} Siswa baru</b> telah diekstrak secara otomatis dan ditambahkan ke basis data Firestore.
              </p>
            </div>
          )}

          {/* Download Template Sim */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-700 dark:text-slate-400">Unduh Format Excel</span>
              <p className="text-[10px] text-slate-400">Gunakan template ini sebelum melakukan import.</p>
            </div>
            <a
              href="#download-template"
              onClick={(e) => {
                e.preventDefault();
                alert('Mengunduh Berkas Format_Siswa_GuruKu.xlsx (Simulasi Template)');
              }}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold transition"
            >
              Unduh Template
            </a>
          </div>

        </div>

      </div>

      {/* CRUD Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
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
              {editingStudent ? 'Edit Biodata Siswa' : 'Registrasi Siswa Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Misal: 0087654321"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis Kelamin</label>
                  <select
                    value={jk}
                    onChange={(e) => setJk(e.target.value as 'L' | 'P')}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 dark:text-slate-350"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  placeholder="Misal: Aditya Pratama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas Aktif</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 dark:text-slate-250"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.namaKelas}>{c.namaKelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No HP Orang Tua / Wali</label>
                  <input
                    type="text"
                    placeholder="Misal: 0812345678"
                    value={noHpOrangTua}
                    onChange={(e) => setNoHpOrangTua(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alamat Domisili</label>
                <textarea
                  placeholder="Isikan alamat lengkap tempat tinggal siswa saat ini..."
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer"
                >
                  Simpan Biodata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
