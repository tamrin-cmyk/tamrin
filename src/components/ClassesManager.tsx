/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, AlertTriangle, X, Sparkles } from 'lucide-react';
import { ClassSession } from '../types';

interface ClassesManagerProps {
  classes: ClassSession[];
  onAdd: (cls: Omit<ClassSession, 'id'>) => void;
  onEdit: (cls: ClassSession) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export default function ClassesManager({
  classes,
  onAdd,
  onEdit,
  onDelete,
  isAdmin
}: ClassesManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  
  // Form values
  const [namaKelas, setNamaKelas] = useState('');
  const [tingkat, setTingkat] = useState('IX');
  const [waliKelas, setWaliKelas] = useState('');

  const handleOpenAdd = () => {
    setEditingClass(null);
    setNamaKelas('');
    setTingkat('IX');
    setWaliKelas('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassSession) => {
    setEditingClass(cls);
    setNamaKelas(cls.namaKelas);
    setTingkat(cls.tingkat);
    setWaliKelas(cls.waliKelas);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas || !waliKelas) {
      alert('Nama kelas dan Wali kelas wajib diisi!');
      return;
    }

    if (editingClass) {
      onEdit({
        id: editingClass.id,
        namaKelas,
        tingkat,
        waliKelas
      });
    } else {
      onAdd({
        namaKelas,
        tingkat,
        waliKelas
      });
    }
    setIsModalOpen(false);
  };

  const filteredClasses = classes.filter(cls => 
    cls.namaKelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.tingkat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.waliKelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6" id="classes-manager-root">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Daftar Kelas Aktif
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Kelola kelas, rombongan belajar (rombel), dan wali kelas pendamping.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Kelas
          </button>
        )}
      </div>

      {/* Warning limitation if not admin */}
      {!isAdmin && (
        <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 text-amber-800 dark:text-amber-400 text-xs rounded-xl">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span><b>Akses Terbatas:</b> Hanya Administrator yang memiliki ijin mematangkan data rombel dan wali kelas.</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          <Search className="w-4.5 h-4.5" />
        </span>
        <input
          type="text"
          placeholder="Cari berdasarkan nama kelas, tingkat, atau wali kelas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* List Bento-like Card layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <div 
              key={cls.id} 
              className="border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 rounded-2xl p-5 shadow-xs hover:border-indigo-100 dark:hover:border-slate-700 hover:shadow-xs transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold font-mono text-xs rounded-full">
                    Tingkat {cls.tingkat}
                  </span>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(cls)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(cls.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-4">
                  {cls.namaKelas}
                </h3>
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Wali Kelas</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  {cls.waliKelas}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-4 text-center py-10 text-slate-400 text-xs">
            Belum ada data kelas yang terdaftar.
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 relative animate-fadeIn"
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
              {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Kelas</label>
                <input
                  type="text"
                  placeholder="Misal: Kelas VII-A, Kelas IX-C"
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tingkat</label>
                <select
                  value={tingkat}
                  onChange={(e) => setTingkat(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="VII">VII (Tujuh)</option>
                  <option value="VIII">VIII (Delapan)</option>
                  <option value="IX">IX (Sembilan)</option>
                  <option value="X">X (Sepuluh)</option>
                  <option value="XI">XI (Sebelas)</option>
                  <option value="XII">XII (Duabelas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Wali Kelas</label>
                <input
                  type="text"
                  placeholder="Misal: Siti Aminah, S.Pd."
                  value={waliKelas}
                  onChange={(e) => setWaliKelas(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
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
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
