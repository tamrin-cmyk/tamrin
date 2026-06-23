/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, Key, Mail, Shield, Sparkles } from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [email, setEmail] = useState('tamrinspd25@gmail.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Masukkan Email & Kata Kandi!');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate Auth check
    setTimeout(() => {
      setIsLoading(false);
      if (email === 'tamrinspd25@gmail.com') {
        onLogin({
          uid: 'user_1',
          nama: 'Tamrin, S.Pd.',
          email: 'tamrinspd25@gmail.com',
          role: UserRole.ADMIN
        });
      } else if (email.includes('guru') || email === 'ahmad@guruku.sch.id') {
        onLogin({
          uid: 'user_2',
          nama: 'Ahmad Subarjo, S.Kom.',
          email: email,
          role: UserRole.GURU
        });
      } else {
        setError('Kredensial tidak dikenali! Coba login dengan tamrinspd25@gmail.com');
      }
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Auto login as Tamrin
      onLogin({
        uid: 'user_1',
        nama: 'Tamrin, S.Pd.',
        email: 'tamrinspd25@gmail.com',
        role: UserRole.ADMIN
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12" id="auth-screen-root">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Glow effect */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-full text-indigo-600 dark:text-indigo-400">
            <span className="text-2.5xl font-bold">📚</span>
          </div>
          <h1 className="text-2xl font-black text-slate-805 dark:text-slate-100 uppercase tracking-tight">
            GuruKu Academic
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-normal max-w-[280px] mx-auto">
            Sistem Informasi administrasi kurikulum sekolah terpadu dengan sinkronisasi Firebase.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100 text-left font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase">Email Administrator / Guru</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="misal: tamrinspd25@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase">Sandi Akun</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 select-none cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Masuk Sistem
              </>
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <span className="w-full h-[1px] bg-slate-100 dark:bg-slate-800"></span>
          <span>atau</span>
          <span className="w-full h-[1px] bg-slate-100 dark:bg-slate-800"></span>
        </div>

        {/* Mock Google Authenticator Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-850 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Google Login (Mock)
        </button>

        {/* Hints */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100/40 dark:border-indigo-900/40 text-left text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-400 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Kredensial Pengujian Sistem:
          </p>
          <div className="font-mono space-y-0.5">
            <div>• Admin: <b>tamrinspd25@gmail.com</b> (Sandi bebas)</div>
            <div>• Guru: <b>guru@guruku.sch.id</b> (Akses terbatas)</div>
          </div>
        </div>

      </div>
    </div>
  );
}
