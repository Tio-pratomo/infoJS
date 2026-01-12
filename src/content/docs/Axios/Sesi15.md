---
title: Simulasi Jaringan Buruk & Resilience (Interceptor Retry)
---

Aplikasi yang bagus bukan hanya yang bekerja saat kondisi ideal, tapi yang tetap _elegan_ saat dunia sedang kacau (server down, internet lemot).

Di sesi ini, kita akan meninggalkan sejenak TheMealDB yang "terlalu stabil". Kita butuh server yang _bermasalah_ untuk menguji ketangguhan kode kita. Kita akan menggunakan **Beeceptor** untuk membuat **Mock API** yang sengaja kita setting agar lambat dan sering error.

---

## Materi: Konsep _Resilience_ (Ketangguhan)

Ketangguhan sistem dibangun di atas asumsi pesimis: **"Request pasti akan gagal sesekali."**

Strategi kita:

1.  **Global Timeout:** Jangan biarkan user menunggu lebih dari X detik.
2.  **Auto Retry:** Jika gagal karena _network glitch_ atau _server busy (500/503)_, coba lagi diam-diam. Jangan langsung lapor error ke user.

Untuk Auto Retry, kita tidak akan menggunakan teknik manual (seperti Sesi 7). Kita akan menggunakan **Interceptor** (seperti Sesi 9) agar logika retry ini otomatis berlaku untuk **semua** request di aplikasi kita.

---

## Praktik: Setup Beeceptor (Server Buatan)

1.  Buka [https://beeceptor.com](https://beeceptor.com).
2.  Buat endpoint baru, misal: `my-resilient-app`. URL Anda jadi: `https://my-resilient-app.free.beeceptor.com`.
3.  Di dashboard Beeceptor, cari fitur **"Mocking Rules"**.
4.  Buat Rule baru:
    - **Method:** `GET`
    - **Path:** `/resep-rahasia`
    - **Response Body:** `{ "status": "Sukses Akhirnya!", "data": "Resep Krabby Patty" }`
    - **Delay:** Set ke **4000ms** (4 detik) -> Ini simulasi server super lemot.
    - (Opsional) Anda bisa mematikan/menyalakan rule ini nanti untuk tes error 500.

---

## Praktik: Kode "Axios Pintar" (`app.js`)

Kita akan membuat instance Axios yang sangat canggih. Dia akan otomatis mencoba ulang 3x jika gagal.

### Kode JavaScript

Ganti isi `app.js` dengan kode di bawah. Perhatikan logika di dalam `interceptors.response`.

```javascript wrap
// 1. SETUP AXIOS INSTANCE
const resilientApi = axios.create({
  // Ganti URL ini dengan URL Beeceptor milik Anda sendiri!
  baseURL: 'https://ganti-dengan-nama-endpoint-anda.free.beeceptor.com',

  // Kita set timeout KETAT: 2 detik.
  // Padahal delay Beeceptor 4 detik. Pasti akan TIME OUT!
  timeout: 2000,
});

// 2. LOGIKA INTELLIGENT RETRY (INTERCEPTOR)
resilientApi.interceptors.response.use(
  (response) => {
    // Jika sukses, loloskan saja
    return response;
  },
  async (error) => {
    const config = error.config;

    // Cek 1: Apakah config retry ada? (Default 3x jika tidak diset)
    if (!config || !config.retry) {
      config.retry = 3;
    }

    // Cek 2: Apakah jatah retry sudah habis?
    if (config.retryCount >= config.retry) {
      // Menyerah. Lempar error asli ke UI.
      console.log('❌ Menyerah setelah 3x percobaan.');
      return Promise.reject(error);
    }

    // Inisialisasi hitungan retry
    config.retryCount = config.retryCount || 0;
    config.retryCount += 1;

    // Logika Backoff (Jeda waktu sebelum mencoba lagi)
    // Kita pakai jeda 1 detik agar mudah diamati di Console
    const delay = 1000;

    console.warn(`⚠️ Request Gagal (${error.message}). Mencoba lagi ke-${config.retryCount}...`);

    // Tunggu 1 detik...
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Trik Ajaib: Kirim ulang request menggunakan config yang sama!
    return resilientApi(config);
  }
);

// --- UI SEDERHANA UNTUK TESTING ---
const btn = document.getElementById('searchBtn'); // Pinjam tombol dari HTML sebelumnya
const msg = document.getElementById('message');

if (btn) {
  btn.innerText = 'Test Resilience (Cek Console)';
  btn.onclick = async () => {
    msg.classList.remove('hidden');
    msg.innerHTML = '⏳ Sedang mencoba menghubungi server...';
    console.clear();
    console.log('🚀 Memulai Request...');

    try {
      // Request ke endpoint buatan kita
      const res = await resilientApi.get('/resep-rahasia');

      msg.innerHTML = `✅ BERHASIL: ${JSON.stringify(res.data)}`;
      console.log('Success:', res.data);
    } catch (err) {
      msg.innerHTML = `💀 GAGAL TOTAL: ${err.message}`;
      console.error('Final Error:', err);
    }
  };
}
```

### Skenario Pengujian (Penting!)

**Skenario A: Server Terlalu Lambat (Timeout)**

1.  Set delay Beeceptor: **4 detik**.
2.  Set timeout Axios: **2 detik**.
3.  Jalankan.
4.  **Apa yang terjadi?**
    - Console: "Mencoba lagi ke-1..." (setelah 2 detik).
    - Console: "Mencoba lagi ke-2..."
    - Console: "Mencoba lagi ke-3..."
    - Console: "❌ Menyerah".
    - **Pelajaran:** Retry tidak berguna untuk masalah Timeout yang konsisten (server memang lambat permanen). Tapi berguna jika timeoutnya hanya "kedip" sesekali.

**Skenario B: Server Error Sementara (Flaky)**

1.  Di Beeceptor, ubah "Mocking Rules" agar me-return status **500**.
2.  Jalankan App. (Axios akan retry 3x karena error 500).
3.  **SEGERA** saat Axios sedang retry, ubah/matikan rule di Beeceptor agar normal kembali (Status 200).
4.  **Hasil:** Axios yang tadinya gagal, tiba-tiba berhasil di percobaan ke-2 atau ke-3.
    - UI user menampilkan "Sukses", user tidak pernah tahu bahwa percobaan pertama sebenarnya gagal.
    - Inilah definisi **Resilient App**.

---

Di **Sesi 16 (Terakhir)**, kita akan menggabungkan semuanya ke dalam fitur **CRUD lengkap**. Karena TheMealDB tidak mengizinkan kita menghapus/mengedit resep (Read-Only), kita akan menggunakan **JSONPlaceholder** untuk mensimulasikan fitur "Resep Favorit" (Simpan & Hapus) dengan gaya **Optimistic UI** (UI yang berubah duluan sebelum server menjawab).
