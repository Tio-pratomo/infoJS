---
title: Menangani Server Lambat (Timeout & Retry Strategy)
---

## Materi: Mengapa Timeout Itu Penting?

Secara default, Axios tidak memiliki batas waktu (timeout). Jika server macet atau jaringan user "nyangkut" (packet loss), browser akan terus menunggu sampai user menutup tab. Ini UX yang buruk.

### 1. Konfigurasi Timeout di Axios

Berbeda dengan `fetch` yang butuh `AbortController` + `setTimeout` manual, Axios punya properti bawaan `timeout` dalam milidetik.

```javascript wrap
// Contoh konfigurasi
{
  timeout: 5000; // Batas waktu 5 detik. Lebih dari ini = ERROR.
}
```

Jika waktu habis, Axios akan melempar error dengan code: **`ECONNABORTED`**.

### 2. Strategi Retry (Coba Lagi) & Exponential Backoff

Jika request gagal karena timeout atau jaringan kedip, kita sebaiknya mencobanya lagi secara otomatis (_Auto Retry_). Tapi ada aturannya:

1.  **Idempotency (Keamanan):**
    - ✅ **Aman di-retry:** `GET` (ambil data), `PUT` (update total), `DELETE`.
    - ❌ **Bahaya di-retry:** `POST` (transaksi/bayar). Jangan sampai user terdebit 2x karena kita retry otomatis.
2.  **Exponential Backoff:**
    Jangan retry langsung detik itu juga (spamming). Beri jeda yang semakin lama.
    - Gagal 1 → Tunggu 1 detik
    - Gagal 2 → Tunggu 2 detik
    - Gagal 3 → Tunggu 4 detik → Menyerah.

---

## Praktik: Implementasi Timeout dan Retry Manual

Kita akan menggunakan **httpbin.org** untuk mensimulasikan server yang lambat.

### Setup Awal

Buat file `index.html` sederhana untuk menjalankan kode di browser.

```html wrap
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Sesi 7: Timeout & Retry</title>
    <!-- Load Axios via CDN -->
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  </head>
  <body>
    <h1>Cek Console (F12) untuk melihat hasil</h1>
    <script type="module" src="./app.js"></script>
  </body>
</html>
```

### Latihan 1: Memaksa Error Timeout

Buat file `app.js` (atau tulis di dalam tag `<script>`):

Kita akan meminta server merespon dalam **3 detik**, tapi kita set batas waktu Axios hanya **1 detik**.

```javascript wrap title="app.js"
// Fungsi helper untuk delay (opsional, untuk simulasi visual)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testTimeout() {
  console.log('Memulai Request dengan Timeout ketat (1 detik)...');

  try {
    // httpbin.org/delay/3 akan menunggu 3 detik baru merespon
    const response = await axios.get('https://httpbin.org/delay/3', {
      timeout: 1000, // Kita tidak sabaran, hanya mau nunggu 1 detik
    });

    console.log('Berhasil (Tidak mungkin tercapai):', response.data);
  } catch (error) {
    // Cek apakah error disebabkan oleh Timeout
    if (error.code === 'ECONNABORTED') {
      console.error(`❌ Request Timeout! Batas waktu ${error.config.timeout}ms terlampaui.`);
    } else {
      console.error('Error lain:', error.message);
    }
  }
}

// Jalankan fungsi
testTimeout();
```

### Latihan 2: Membuat Helper `fetchWithRetry`

Karena kita belum belajar Interceptor (Sesi 9), kita akan membuat fungsi pembungkus (_wrapper function_) untuk melakukan logika "Coba Lagi". Ini adalah logika algoritma dasar yang sangat berguna.

```javascript wrap
/**
 * Helper function untuk melakukan request dengan strategi Retry
 * @param {Function} requestFn - Fungsi request axios (misal: () => axios.get(...))
 * @param {number} retries - Jumlah maksimal percobaan
 * @param {number} delay - Waktu tunggu awal (ms)
 */
async function fetchWithRetry(requestFn, retries = 3, delay = 1000) {
  try {
    return await requestFn();
  } catch (error) {
    // Stop retry jika:
    // 1. Jatah retry habis
    // 2. Errornya adalah 4xx (Client Error) -> Percuma retry kalau requestnya salah (misal 404/401)
    // 3. Error bukan timeout/network (opsional, tergantung kebutuhan)
    const isClientError =
      error.response && error.response.status >= 400 && error.response.status < 500;

    if (retries === 0 || isClientError) {
      throw error; // Lempar error terakhir ke pemanggil utama
    }

    console.warn(`Request gagal. Mencoba lagi dalam ${delay}ms... (Sisa retry: ${retries})`);

    // Tunggu sesuai delay (Backoff)
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Panggil diri sendiri secara rekursif (Recursive Call)
    // Delay dikali 2 untuk Exponential Backoff (1s -> 2s -> 4s)
    return fetchWithRetry(requestFn, retries - 1, delay * 2);
  }
}

// --- Cara Penggunaan ---

async function runRetryDemo() {
  console.log('\n--- Demo Retry Strategy ---');

  // URL ini akan selalu timeout karena kita set timeout 500ms, tapi delay server 2 detik
  const myRequest = () => axios.get('https://httpbin.org/delay/2', { timeout: 500 });

  try {
    await fetchWithRetry(myRequest, 3, 1000);
    console.log('Sukses!');
  } catch (error) {
    console.error('❌ GAGAL TOTAL setelah 3x percobaan.');
    if (error.code === 'ECONNABORTED') {
      console.error('Penyebab akhir: Timeout terus-menerus.');
    }
  }
}

// Jalankan setelah demo timeout selesai (opsional pakai setTimeout agar log rapi)
setTimeout(runRetryDemo, 2000);
```

### Analisis Kode

1.  **Rekursif:** Fungsi `fetchWithRetry` memanggil dirinya sendiri jika gagal, mengurangi jatah `retries` satu per satu.
2.  **Backoff:** Perhatikan `delay * 2`. Ini membuat jeda tunggu makin lama, memberi kesempatan server untuk "bernapas" jika sedang down.
3.  **Client Error Filter:** Kita menambahkan `if (isClientError) throw`. Jika errornya **404 Not Found** atau **400 Bad Request**, tidak ada gunanya mencoba ulang 100 kali pun, hasilnya akan tetap sama. Retry hanya berguna untuk error yang bersifat _sementara_ (500 Server Error, Timeout, Network Error).

Di **Sesi 8**, kita akan membahas kebalikan dari Retry: Bagaimana jika user berubah pikiran? Kita akan belajar cara **Membatalkan Request (Cancel Token/AbortController)** agar aplikasi tidak lambat karena memproses data yang sudah tidak dibutuhkan user.
