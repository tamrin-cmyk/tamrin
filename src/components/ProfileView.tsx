/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole } from '../types';
import { UserCheck, Shield, Mail, Key, Sparkles, UserX, ToggleLeft, ToggleRight } from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  onUpdateRole: (role: UserRole) => void;
}

export default function ProfileView({ currentUser, onUpdateRole }: ProfileViewProps) {
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleRoleToggle = () => {
    const nextRole = isAdmin ? UserRole.GURU : UserRole.ADMIN;
    onUpdateRole(nextRole);
    alert(`Simulasi Peran Berubah ke: ${nextRole.toUpperCase()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6" id="profile-view-root">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Profil & Pengaturan Akun Guru
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Kelola data profil, detail verifikasi, serta status autentikasi Firebase.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card details */}
        <div className="lg:col-span-2 border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Avatar block with initials */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-white text-xl shadow-lg border-2 border-white dark:border-slate-850 select-none">
              {currentUser.nama.substring(0, 2)}
            </div>
            
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-lg font-extrabold text-slate-805 dark:text-slate-100">{currentUser.nama}</h3>
              <p className="text-xs font-mono text-slate-400">UID: {currentUser.uid}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Resmi
              </span>
              <p className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> Izin Akses Hak
              </span>
              <p className="font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1">
                <UserCheck className="w-4 h-4" />
                {currentUser.role.toUpperCase()} (Full Control)
              </p>
            </div>
          </div>
        </div>

        {/* Role Simulator Sandbox (crucial for preview!) */}
        <div className="border border-indigo-100/50 dark:border-indigo-900/30 bg-indigo-50/40 dark:bg-indigo-950/20 p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 text-sm uppercase">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              Role Simulator
            </h4>
            <p className="text-xs text-indigo-750 dark:text-indigo-400 leading-relaxed">
              Gunakan saklar di bawah untuk mensimulasikan login guru biasa (restricted) vs admin (full access) saat menguji sistem.
            </p>
          </div>

          <div className="mt-6 border-t border-indigo-100/40/30 pt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
              Peran: <b className="font-mono text-sm underline">{currentUser.role.toUpperCase()}</b>
            </span>
            
            <button
              onClick={handleRoleToggle}
              className="p-1 focus:outline-none transition active:scale-95 text-indigo-600 dark:text-indigo-400 cursor-pointer"
              title="Ganti Peran Pengguna"
            >
              {isAdmin ? (
                <ToggleRight className="w-12 h-12" />
              ) : (
                <ToggleLeft className="w-12 h-12 text-slate-400" />
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
