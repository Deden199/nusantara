# Nusantara Full

Platform hasil undian kota-kota di Indonesia.

## Setup

1. Copy `.env.example` menjadi `.env` di masing-masing folder jika perlu.
2. Jalankan `docker-compose up --build`.
3. Akses frontend di `http://localhost:3000` dan backend API di `http://localhost:4000`.

## Scheduler Hasil Undian

Untuk menghasilkan hasil undian secara otomatis, jalankan scheduler di folder `backend`:

```bash
cd backend
node src/cron/fetchResults.js
```

Scheduler menggunakan loop `setTimeout` untuk membaca jadwal dari tabel `Schedule` dan menjalankan proses penarikan pada waktu berikutnya secara terus menerus.

Beberapa menit sebelum waktu undian (`drawTime`), scheduler juga memanggil fungsi `startLiveDraw(city)` untuk menandai bahwa proses undian sedang berlangsung. Fitur ini memastikan bahwa undian langsung dimulai tepat waktu tanpa duplikasi jika scheduler dijalankan lebih dari sekali.

## Menambah Kota Baru

Gunakan halaman Admin untuk menambah kota baru. Setiap tengah malam server akan membuat hasil undian otomatis.
