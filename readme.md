# Portal Magang Skripsi

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