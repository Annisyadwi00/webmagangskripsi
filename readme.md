# Portal Magang Skripsi
📑 Sistem Informasi Informasi Magang - Fasilkom UNSIKA
Sistem ini dikembangkan sebagai bagian dari penelitian skripsi untuk mempermudah manajemen administrasi magang di Fakultas Ilmu Komputer, Universitas Singaperbangsa Karawang.

🚀 Deskripsi Proyek
Aplikasi berbasis web ini berfungsi sebagai jembatan antara mahasiswa, dosen pembimbing, dan admin fakultas dalam mengelola alur magang, mulai dari pengajuan, pengisian logbook harian, hingga proses penilaian akhir.

🛠️ Tech Stack
Proyek ini dibangun menggunakan teknologi modern:

Backend: Node.js & Express.js

Database: MySQL (Relational Database)

ORM: Sequelize

Authentication: JSON Web Token (JWT) & Bcrypt

Utilities: Mailer (Nodemailer) & UUID

📂 Struktur Folder (MVC)
Proyek ini menerapkan arsitektur Model-View-Controller untuk memastikan kode yang rapi dan mudah dirawat:

controllers/: Logika bisnis dan pengolahan data.

models/: Definisi skema database dan relasi antar tabel.

routes/: Manajemen jalur API (Endpoint).

middlewares/: Proteksi keamanan dan otorisasi user.

utils/: Fungsi pembantu (helper) seperti pengiriman email.

🔑 Fitur Utama
Sistem Registrasi Mahasiswa & Dosen: Validasi otomatis menggunakan domain email resmi @student.unsika.ac.id dan @staff.unsika.ac.id.

Verifikasi Email: Keamanan akun dengan kode verifikasi 6-digit.

Manajemen Lowongan Magang: Admin dapat menambah, mengedit, dan menutup lowongan sesuai kuota.

Logbook Digital: Mahasiswa dapat melaporkan progress harian yang langsung terhubung ke dosen pembimbing.

Sistem Penilaian: Perhitungan nilai akhir transparan antara pihak perusahaan dan dosen.
## Backend setup (fix "Cannot find module 'dotenv'")
1. Buka terminal di folder `backend`.
2. Jalankan install dependensi: `npm install`
   - Ini akan menambahkan paket `dotenv` dan dependensi lain ke folder `node_modules`.
3. Pastikan file `.env` ada di dalam folder `backend` dengan isian contoh:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=portal_magang
   PORT=3000
   ```
4. Setelah install, jalankan server: `npm start`.

> Pesan error `Cannot find module 'dotenv'` biasanya muncul karena belum menjalankan `npm install` atau folder `node_modules` belum terisi lengkap.