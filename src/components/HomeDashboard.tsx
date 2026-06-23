/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, School, Users, FileText, ArrowRight, Brain, Milestone, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { Subject, ClassSession, Student, Journal, Grade } from '../types';

interface HomeDashboardProps {
  subjects: Subject[];
  classes: ClassSession[];
  students: Student[];
  journals: Journal[];
  grades: Grade[];
  userName: string;
  onNavigate: (module: string) => void;
}

export default function HomeDashboard({
  subjects,
  classes,
  students,
  journals,
  grades,
  userName,
  onNavigate
}: HomeDashboardProps) {
  
  // Calculate analytics
  const totalSubjects = subjects.length;
  const totalClasses = classes.length;
  const totalStudents = students.length;
  const totalJournals = journals.length;
  
  // Calculate average grade
  const validGrades = grades.filter(g => g.nilaiAkhir > 0);
  const averageGrade = validGrades.length > 0
    ? (validGrades.reduce((sum, g) => sum + g.nilaiAkhir, 0) / validGrades.length).toFixed(1)
    : '0';

  // Calculate passing rate (>=75)
  const passedStudentsNum = validGrades.filter(g => g.nilaiAkhir >= 75).length;
  const passingRate = validGrades.length > 0
    ? Math.round((passedStudentsNum / validGrades.length) * 100)
    : 0;

  // Render hand-crafted gorgeous SVG Area Chart for Average Grades per Subject
  const chartHeight = 140;
  const chartWidth = 500;
  const chartPadding = 30;

  const subjectAverages = subjects.map(sub => {
    const subGrades = grades.filter(g => g.subjectId === sub.id && g.nilaiAkhir > 0);
    const avg = subGrades.length > 0
      ? Number((subGrades.reduce((sum, g) => sum + g.nilaiAkhir, 0) / subGrades.length).toFixed(1))
      : 70; // fallback default
    return { name: sub.namaMapel, avg };
  });

  // Calculate points for polygon/polyline path representation
  const maxVal = 100;
  const points = subjectAverages.map((sub, idx) => {
    const x = chartPadding + (idx * (chartWidth - chartPadding * 2)) / (Math.max(1, subjectAverages.length - 1));
    const y = chartHeight - chartPadding - ((sub.avg / maxVal) * (chartHeight - chartPadding * 2));
    return { x, y, name: sub.name, avg: sub.avg };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') 
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z`
    : '';

  return (
    <div className="space-y-6" id="home-dashboard-root">
      {/* Hero Banner Component (Deep Indigo Premium Wave Gradient) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-300 via-indigo-600 to-indigo-900 pointer-events-none"></div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-1 bg-indigo-500/30 border border-indigo-400/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            Sistem Sinkronisasi Firebase Aktif
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-none uppercase">
              Selamat Datang
            </h1>
            <h2 className="text-lg md:text-xl font-medium text-indigo-100">
              Halo, <span className="font-extrabold text-white">{userName}</span>!
            </h2>
          </div>
          <p className="text-sm md:text-base text-indigo-100/80 leading-relaxed font-light">
            Sistem administrasi, input nilai, absensi, siswa, dan jurnal mengajar Anda telah sinkronisasi secara penuh dengan cloud storage dan server Firebase.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('grades')}
              className="px-5 py-2.5 bg-white text-indigo-800 hover:bg-slate-100 active:scale-95 transition rounded-xl text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Input Nilai
            </button>
            <button
              onClick={() => onNavigate('journals')}
              className="px-5 py-2.5 bg-indigo-600/60 hover:bg-indigo-600 border border-indigo-400/40 active:scale-95 transition rounded-xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Tulis Jurnal
            </button>
            <button
              onClick={() => onNavigate('integration')}
              className="px-5 py-2.5 bg-transparent hover:bg-white/10 active:scale-95 transition rounded-xl text-sm font-medium text-indigo-100 flex items-center gap-1.5 cursor-pointer"
            >
              Panduan GAS
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Cards 4 Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1 - Mapel */}
        <div 
          onClick={() => onNavigate('subjects')}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-100 dark:hover:border-slate-700 transition duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition duration-300">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">Mapel</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-slate-100">{totalSubjects}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Mata Pelajaran Aktif</p>
          </div>
        </div>

        {/* Card 2 - Kelas */}
        <div 
          onClick={() => onNavigate('classes')}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-emerald-100 dark:hover:border-slate-700 transition duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition duration-300">
              <School className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Kelas</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-slate-100">{totalClasses}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Kelas dalam Pengawasan</p>
          </div>
        </div>

        {/* Card 3 - Siswa */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-orange-100 dark:hover:border-slate-700 transition duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-50 dark:bg-orange-950/40 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition duration-300">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full">Siswa</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-slate-100">{totalStudents}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Total Siswa Terdaftar</p>
          </div>
        </div>

        {/* Card 4 - Jurnal */}
        <div 
          onClick={() => onNavigate('journals')}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-purple-100 dark:hover:border-slate-700 transition duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition duration-300">
              <FileText className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">Jurnal</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-slate-100">{totalJournals}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Jurnal Pengajaran Masuk</p>
          </div>
        </div>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg flex items-center gap-1.5">
                <Brain className="w-5 h-5 text-indigo-500" />
                Rata-Rata Nilai per Mata Pelajaran
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Analisis ketercapaian KKM siswa secara komparatif.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600">{averageGrade}</span>
              <p className="text-[10px] text-slate-400 font-medium">Rata-Rata Global</p>
            </div>
          </div>

          {/* Render Area Chart */}
          <div className="relative pt-4 overflow-hidden">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid Lines */}
              <line x1={chartPadding} y1={chartPadding} x2={chartWidth - chartPadding} y2={chartPadding} stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
              <line x1={chartPadding} y1={chartHeight / 2} x2={chartWidth - chartPadding} y2={chartHeight / 2} stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
              <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />

              {/* Y Axis Labels */}
              <text x={chartPadding - 5} y={chartPadding + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-400">100</text>
              <text x={chartPadding - 5} y={chartHeight / 2 + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-400">50</text>
              <text x={chartPadding - 5} y={chartHeight - chartPadding + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-400">0</text>

              {/* Gradient Area definition */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Filled Area */}
              {areaD && (
                <path d={areaD} fill="url(#chartGradient)" className="transition-all duration-700 ease-out" />
              )}

              {/* Polyline Path */}
              {pathD && (
                <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-out" />
              )}

              {/* Points circles and Tooltip Labels */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  {/* Outer glow ring on hover */}
                  <circle cx={p.x} cy={p.y} r="7" className="fill-indigo-300 dark:fill-indigo-900/60 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  {/* Central node point */}
                  <circle cx={p.x} cy={p.y} r="4.5" className="fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-1.5 shadow-md" />
                  {/* Floating Grade Text value */}
                  <text 
                    x={p.x} 
                    y={p.y - 10} 
                    textAnchor="middle" 
                    className="text-[10px] font-black fill-indigo-700 dark:fill-indigo-400 group-hover:scale-110 group-hover:-translate-y-1 transition duration-200"
                  >
                    {p.avg}
                  </text>
                  {/* Subject Name underneath */}
                  <text 
                    x={p.x} 
                    y={chartHeight - chartPadding + 14} 
                    textAnchor="middle" 
                    className="text-[8px] md:text-[9px] font-medium fill-slate-500 dark:fill-slate-400"
                  >
                    {p.name.length > 10 ? p.name.substring(0, 8) + '..' : p.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Quick Analytics & Stats Overview Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-1.5">
              <Milestone className="w-5 h-5 text-emerald-500" />
              Kelulusan & KKM Global
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Statistik kelulusan KKM mata pelajaran di semua rombel.</p>
          </div>

          <div className="my-6 flex items-center justify-center relative">
            {/* Hand-crafted circular donut percentage */}
            <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
              <circle cx="50" cy="50" r="40" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="10" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out" 
                strokeWidth="10" 
                strokeDasharray={`${2.512 * passingRate} 251.2`}
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2.5xl font-black text-slate-800 dark:text-white leading-none tracking-tight">{passingRate}%</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tuntas KKM</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Siswa Tuntas (&gt;= 75)
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{passedStudentsNum} Murid</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-red-400" />
                Siswa Belum Tuntas
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{validGrades.length - passedStudentsNum} Murid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
