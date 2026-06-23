/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  GURU = 'guru'
}

export interface User {
  uid: string;
  nama: string;
  email: string;
  role: UserRole;
  subjectId?: string; // Optional specialty
}

export interface Subject {
  id: string;
  namaMapel: string;
  kodeMapel: string;
  kkm: number;
  semester: string;
  tahunAjaran: string;
}

export interface ClassSession {
  id: string;
  namaKelas: string;
  tingkat: string;
  waliKelas: string; // nama guru
}

export interface Student {
  id: string;
  nisn: string;
  nama: string;
  jk: 'L' | 'P';
  kelas: string; // namaKelas or classId
  alamat: string;
  noHpOrangTua: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  tugas: number;
  uts: number;
  uas: number;
  praktik: number;
  nilaiAkhir: number;
  status: 'Tuntas' | 'Belum Tuntas';
}

export interface Attendance {
  id: string;
  studentId: string;
  tanggal: string; // YYYY-MM-DD
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa' | 'Terlambat';
}

export interface Journal {
  id: string;
  guruId: string;
  guruNama: string;
  tanggal: string; // YYYY-MM-DD
  kelas: string; // Nama Kelas
  mataPelajaran: string; // Nama Mapel
  materi: string;
  metode: string;
  catatan: string;
  status: 'Draft' | 'Publish';
  scheduleId?: string; // Linked learning schedule
}

export interface Schedule {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  kelasNama: string; // e.g. "Kelas IX-A"
  subjectNama: string; // e.g. "Matematika"
  guruNama: string; // e.g. "Tamrin, S.Pd."
  jamMulai: string; // e.g. "07:30"
  jamSelesai: string; // e.g. "09:00"
}

