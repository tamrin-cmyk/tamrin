/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subject, ClassSession, Student, Grade, Attendance, Journal, User, UserRole, Schedule } from './types';

export const DEFAULT_USERS: User[] = [
  {
    uid: 'user_1',
    nama: 'Tamrin, S.Pd.',
    email: 'tamrinspd25@gmail.com',
    role: UserRole.ADMIN
  },
  {
    uid: 'user_2',
    nama: 'Ahmad Subarjo, S.Kom.',
    email: 'ahmad@guruku.sch.id',
    role: UserRole.GURU
  }
];

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub_1', namaMapel: 'Matematika', kodeMapel: 'MTK-IX', kkm: 75, semester: 'Ganjil', tahunAjaran: '2025/2026' },
  { id: 'sub_2', namaMapel: 'Ilmu Pengetahuan Alam (IPA)', kodeMapel: 'IPA-IX', kkm: 75, semester: 'Ganjil', tahunAjaran: '2025/2026' },
  { id: 'sub_3', namaMapel: 'Bahasa Indonesia', kodeMapel: 'BIN-IX', kkm: 75, semester: 'Ganjil', tahunAjaran: '2025/2026' },
  { id: 'sub_4', namaMapel: 'Bahasa Inggris', kodeMapel: 'BIG-IX', kkm: 75, semester: 'Ganjil', tahunAjaran: '2025/2026' },
  { id: 'sub_5', namaMapel: 'Pendidikan Jasmani & Kesehatan', kodeMapel: 'PJK-IX', kkm: 70, semester: 'Ganjil', tahunAjaran: '2025/2026' }
];

export const DEFAULT_CLASSES: ClassSession[] = [
  { id: 'cls_1', namaKelas: 'Kelas IX-A', tingkat: 'IX', waliKelas: 'Tamrin, S.Pd.' },
  { id: 'cls_2', namaKelas: 'Kelas IX-B', tingkat: 'IX', waliKelas: 'Siti Aminah, S.Pd.' },
  { id: 'cls_3', namaKelas: 'Kelas VIII-A', tingkat: 'VIII', waliKelas: 'Budi Santoso, M.Pd.' },
  { id: 'cls_4', namaKelas: 'Kelas VII-A', tingkat: 'VII', waliKelas: 'Dewi Lestari, S.S.' }
];

export const DEFAULT_STUDENTS: Student[] = [
  { id: 'std_1', nisn: '0087654321', nama: 'Aditya Pratama', jk: 'L', kelas: 'Kelas IX-A', alamat: 'Jl. Pemuda No. 12, Surabaya', noHpOrangTua: '081234567890' },
  { id: 'std_2', nisn: '0087654322', nama: 'Bunga Citra Lestari', jk: 'P', kelas: 'Kelas IX-A', alamat: 'Jl. Merdeka No. 45, Surabaya', noHpOrangTua: '081298765432' },
  { id: 'std_3', nisn: '0087654323', nama: 'Candra Wijaya', jk: 'L', kelas: 'Kelas IX-A', alamat: 'Perum Gading Indah B-4, Surabaya', noHpOrangTua: '085678901234' },
  { id: 'std_4', nisn: '0087654324', nama: 'Dian Sastrowardoyo', jk: 'P', kelas: 'Kelas IX-B', alamat: 'Jl. Dharmawangsa No. 8, Surabaya', noHpOrangTua: '081377889900' },
  { id: 'std_5', nisn: '0087654325', nama: 'Eko Prasetyo', jk: 'L', kelas: 'Kelas IX-B', alamat: 'Jl. Kenanga Timur 15, Surabaya', noHpOrangTua: '082100998877' },
  { id: 'std_6', nisn: '0087654326', nama: 'Fatimah Az-Zahra', jk: 'P', kelas: 'Kelas IX-A', alamat: 'Jl. Airlangga No. 3, Surabaya', noHpOrangTua: '081244332211' },
  { id: 'std_7', nisn: '0087654327', nama: 'Gilang Ramadhan', jk: 'L', kelas: 'Kelas VIII-A', alamat: 'Jl. Gubeng Kertajaya 4, Surabaya', noHpOrangTua: '085711223344' },
  { id: 'std_8', nisn: '0087654328', nama: 'Hana Olivia', jk: 'P', kelas: 'Kelas VIII-A', alamat: 'Jl. Manyar Sabrangan No. 22, Surabaya', noHpOrangTua: '089900112233' }
];

export const DEFAULT_GRADES: Grade[] = [
  { id: 'grd_1', studentId: 'std_1', subjectId: 'sub_1', tugas: 80, uts: 75, uas: 85, praktik: 80, nilaiAkhir: 80.5, status: 'Tuntas' },
  { id: 'grd_2', studentId: 'std_2', subjectId: 'sub_1', tugas: 90, uts: 85, uas: 88, praktik: 90, nilaiAkhir: 87.7, status: 'Tuntas' },
  { id: 'grd_3', studentId: 'std_3', subjectId: 'sub_1', tugas: 60, uts: 70, uas: 65, praktik: 70, nilaiAkhir: 66.0, status: 'Belum Tuntas' },
  { id: 'grd_4', studentId: 'std_4', subjectId: 'sub_1', tugas: 85, uts: 80, uas: 75, praktik: 80, nilaiAkhir: 79.0, status: 'Tuntas' },
  { id: 'grd_5', studentId: 'std_1', subjectId: 'sub_2', tugas: 82, uts: 78, uas: 80, praktik: 85, nilaiAkhir: 80.3, status: 'Tuntas' },
  { id: 'grd_6', studentId: 'std_2', subjectId: 'sub_2', tugas: 88, uts: 90, uas: 85, praktik: 90, nilaiAkhir: 87.6, status: 'Tuntas' }
];

export const DEFAULT_ATTENDANCE: Attendance[] = [
  // Today's dates (2026-06-21)
  { id: 'att_1', studentId: 'std_1', tanggal: '2026-06-21', status: 'Hadir' },
  { id: 'att_2', studentId: 'std_2', tanggal: '2026-06-21', status: 'Hadir' },
  { id: 'att_3', studentId: 'std_3', tanggal: '2026-06-21', status: 'Izin' },
  { id: 'att_4', studentId: 'std_4', tanggal: '2026-06-21', status: 'Sakit' },
  { id: 'att_5', studentId: 'std_5', tanggal: '2026-06-21', status: 'Hadir' },
  { id: 'att_6', studentId: 'std_6', tanggal: '2026-06-21', status: 'Hadir' },
  
  // Previous dates
  { id: 'att_11', studentId: 'std_1', tanggal: '2026-06-20', status: 'Hadir' },
  { id: 'att_12', studentId: 'std_2', tanggal: '2026-06-20', status: 'Hadir' },
  { id: 'att_13', studentId: 'std_3', tanggal: '2026-06-20', status: 'Hadir' },
  { id: 'att_14', studentId: 'std_4', tanggal: '2026-06-20', status: 'Hadir' },
  { id: 'att_15', studentId: 'std_5', tanggal: '2026-06-20', status: 'Alfa' }
];

export const DEFAULT_JOURNALS: Journal[] = [
  {
    id: 'jnl_1',
    guruId: 'user_1',
    guruNama: 'Tamrin, S.Pd.',
    tanggal: '2026-06-15',
    kelas: 'Kelas IX-A',
    mataPelajaran: 'Matematika',
    materi: 'Persamaan Kuadrat dan Fungsi Kuadrat',
    metode: 'Diskusi Kelompok & Latihan Soal',
    catatan: 'Siswa dapat memahami penyelesaian akar kuadrat dengan memfaktorkan. Aditya Pratama perlu bimbingan ekstra.',
    status: 'Publish'
  },
  {
    id: 'jnl_2',
    guruId: 'user_1',
    guruNama: 'Tamrin, S.Pd.',
    tanggal: '2026-06-18',
    kelas: 'Kelas IX-A',
    mataPelajaran: 'Matematika',
    materi: 'Grafik Fungsi Kuadrat',
    metode: 'Presentasi & Praktik Desain Grafik Geogebra',
    catatan: 'Kelas sangat aktif. Tugas nomor 1-5 diselesaikan di kelas dengan baik.',
    status: 'Publish'
  },
  {
    id: 'jnl_3',
    guruId: 'user_2',
    guruNama: 'Ahmad Subarjo, S.Kom.',
    tanggal: '2026-06-19',
    kelas: 'Kelas IX-B',
    mataPelajaran: 'Bahasa Indonesia',
    materi: 'Menulis Teks Pidato Persuasif',
    metode: 'Ceramah Interaktif & Penulisan Mandiri',
    catatan: 'Siswa mulai merancang kerangka pidato bertema Kebersihan Lingkungan Sekolah.',
    status: 'Draft'
  }
];

export const DEFAULT_SCHEDULES: Schedule[] = [
  {
    id: 'sch_1',
    hari: 'Senin',
    kelasNama: 'Kelas IX-A',
    subjectNama: 'Matematika',
    guruNama: 'Tamrin, S.Pd.',
    jamMulai: '07:30',
    jamSelesai: '09:00'
  },
  {
    id: 'sch_2',
    hari: 'Senin',
    kelasNama: 'Kelas IX-A',
    subjectNama: 'Ilmu Pengetahuan Alam (IPA)',
    guruNama: 'Dewi Lestari, S.S.',
    jamMulai: '09:15',
    jamSelesai: '10:45'
  },
  {
    id: 'sch_3',
    hari: 'Selasa',
    kelasNama: 'Kelas IX-B',
    subjectNama: 'Bahasa Indonesia',
    guruNama: 'Ahmad Subarjo, S.Kom.',
    jamMulai: '08:00',
    jamSelesai: '09:30'
  },
  {
    id: 'sch_4',
    hari: 'Rabu',
    kelasNama: 'Kelas VIII-A',
    subjectNama: 'Bahasa Inggris',
    guruNama: 'Budi Santoso, M.Pd.',
    jamMulai: '10:00',
    jamSelesai: '11:30'
  }
];

export function initializeLocalStorage() {
  if (!localStorage.getItem('guruku_users')) {
    localStorage.setItem('guruku_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('guruku_subjects')) {
    localStorage.setItem('guruku_subjects', JSON.stringify(DEFAULT_SUBJECTS));
  }
  if (!localStorage.getItem('guruku_classes')) {
    localStorage.setItem('guruku_classes', JSON.stringify(DEFAULT_CLASSES));
  }
  if (!localStorage.getItem('guruku_students')) {
    localStorage.setItem('guruku_students', JSON.stringify(DEFAULT_STUDENTS));
  }
  if (!localStorage.getItem('guruku_grades')) {
    localStorage.setItem('guruku_grades', JSON.stringify(DEFAULT_GRADES));
  }
  if (!localStorage.getItem('guruku_attendance')) {
    localStorage.setItem('guruku_attendance', JSON.stringify(DEFAULT_ATTENDANCE));
  }
  if (!localStorage.getItem('guruku_journals')) {
    localStorage.setItem('guruku_journals', JSON.stringify(DEFAULT_JOURNALS));
  }
  if (!localStorage.getItem('guruku_schedules')) {
    localStorage.setItem('guruku_schedules', JSON.stringify(DEFAULT_SCHEDULES));
  }
}
