---
title: Axios Interceptors (Satpam API)
---

## Materi: Apa itu Interceptors?

Bayangkan Axios sebagai sebuah gedung perkantoran.

1.  **Request Interceptor** adalah **Satpam di Pintu Masuk**. Sebelum surat (request) keluar dari gedung, satpam mengecek: "Apakah ada prangko (Token)?", "Apakah alamatnya benar?". Jika belum ada, satpam yang menempelkannya.
2.  **Response Interceptor** adalah **Resepsionis di Meja Terima**. Saat paket balasan (response) datang, resepsionis mengecek: "Apakah paketnya rusak (Error)?", "Apakah isinya benda aneh (401 Unauthorized)?". Resepsionis membereskan masalah umum sebelum paket diantar ke meja Anda.

### Mengapa Menggunakan Interceptors?

Tanpa Interceptors, Anda akan mengulang kode berkali-kali (Prinsip _DRY - Don't Repeat Yourself_ yang dilanggar):

- **Tanpa Interceptor:**

  ```javascript wrap
  // Halaman Home
  axios.get('/api', { headers: { Authorization: token } });

  // Halaman Profile
  axios.get('/profile', { headers: { Authorization: token } }); // Diulang terus!
  ```

- **Dengan Interceptor:**
  Cukup setup sekali, otomatis semua request akan membawa token.

---

## Praktik: Membuat Instance dengan "Kecerdasan Buatan"

Kita tidak akan mengotori Axios global. Kita akan membuat _Instance_ khusus yang sudah dipasangi "alat penyadap" (Interceptors).

### Skenario Latihan

1.  **Otomatisasi Token:** Menyisipkan "Fake Token" ke setiap request secara otomatis.
2.  **Global Error Handling:** Jika server merespon "401 Unauthorized", kita otomatis "Log Out" user (simulasi dengan console log).
3.  **Pengukur Waktu:** Menghitung berapa lama durasi request berjalan.

### Kode Praktik (`app.js`)

Salin kode ini ke `app.js`. Perhatikan komentar di dalamnya karena itu adalah penjelasan intinya.

```javascript wrap title="app.js"
// 1. Membuat Instance Khusus
// Ini ibarat membuat kantor cabang kurir khusus
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
});

// =================================================================
// BAGIAN 1: REQUEST INTERCEPTOR (Sebelum request terbang ke server)
// =================================================================
api.interceptors.request.use(
  (config) => {
    // Aksi 1: Menyisipkan Token Otentikasi
    const fakeToken = 'Bearer TOKEN_RAHASIA_12345';
    config.headers['Authorization'] = fakeToken;

    // Aksi 2: Mencatat waktu mulai (untuk mengukur durasi)
    // Kita tempelkan properti custom 'metadata' ke config
    config.metadata = { startTime: new Date() };

    console.log(`[Request] Mengirim ke: ${config.url}`);

    // PENTING: Harus me-return config!
    // Kalau lupa, request akan macet di sini selamanya.
    return config;
  },
  (error) => {
    // Jika ada error saat MENYUSUN request (jarang terjadi)
    return Promise.reject(error);
  }
);

// =================================================================
// BAGIAN 2: RESPONSE INTERCEPTOR (Setelah respon diterima, sebelum masuk .then)
// =================================================================
api.interceptors.response.use(
  (response) => {
    // Hitung durasi
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`[Response] : Sukses dalam ${duration}ms`);

    // (Opsional) Data Unpacking
    // Kita bisa langsung mengembalikan response.data agar di UI tidak perlu ketik .data lagi
    // return response.data;

    // Tapi untuk latihan ini, kita kembalikan full response biar standar
    return response;
  },
  (error) => {
    // Global Error Handler
    // Ini tempat terbaik menangani error umum seperti:
    // - 401 (Token Expired) -> Redirect ke Login
    // - 500 (Server Error) -> Tampilkan Toast/Notifikasi "Server Sedang Gangguan"

    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        console.error(`[Interceptor] 🚨 404 Terdeteksi! Halaman tidak ditemukan.`);
        // Anda bisa melakukan redirect halaman di sini, misal:
        // window.location.href = '/not-found';
      }
    }

    // PENTING: Kita harus tetap melempar error ini agar tombol di UI tahu kalau request gagal
    // sehingga loading spinner bisa berhenti.
    return Promise.reject(error);
  }
);

// =================================================================
// PENGUJIAN
// =================================================================

async function testInterceptors() {
  console.log('--- Mulai Test Interceptor ---');

  // Test 1: Request Sukses
  try {
    // Perhatikan: Kita TIDAK menulis header Authorization di sini
    // Tapi nanti cek di tab Network, pasti ada header Authorization-nya.
    await api.get('/todos/1');
  } catch (err) {
    console.error('Error Test 1:', err.message);
  }

  console.log('\n--- Test Error 404 ---');

  // Test 2: Request Error (404)
  try {
    // Request ke ID ngawur untuk memicu interceptor error
    await api.get('/todos/99999');
  } catch (err) {
    console.log('UI menangkap error, tapi Interceptor sudah melapor duluan di atas.');
  }
}

// Jalankan
testInterceptors();
```

### Cara Memeriksa Hasil (Developer Tools)

1.  Jalankan kode di browser.
2.  Buka **Console**: Anda akan melihat log `[Request] 🛫` dan `[Response] ✅`. Ini bukti interceptor bekerja.
3.  Buka tab **Network**:
    - Klik request `1` (todos/1).
    - Lihat bagian **Request Headers**.
    - Cari `Authorization`. Anda akan melihat nilainya: `Bearer TOKEN_RAHASIA_12345`.
    - Padahal di kode `api.get('/todos/1')`, kita sama sekali tidak menulis headers. Itulah keajaiban Request Interceptor.

### Rangkuman Sesi 9

1.  **Interceptor** adalah tempat terbaik untuk logika yang berulang (logging, auth headers, error handling global).
2.  Selalu gunakan `axios.create()` agar interceptor tidak mencemari global scope.
3.  Jangan lupa `return config` (di request) dan `return response` atau `Promise.reject(error)` (di response).

Di **Sesi 10**, kita akan mulai masuk ke tahap yang lebih visual. Kita akan menghubungkan semua ilmu Axios ini (Instance, Error Handling, Interceptor) ke dalam **UI State** yang nyata: Menangani Loading Spinner, Pesan Error, dan Data Empty State.
