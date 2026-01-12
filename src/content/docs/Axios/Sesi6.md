---
title: Error Handling
---

## Materi: Konsep & Struktur Error Axios

Salah satu perbedaan terbesar (dan fitur terbaik) dari Axios dibandingkan `fetch` bawaan browser adalah bagaimana ia menangani status HTTP.

### 1. Perbedaan Fundamental: Fetch vs Axios

- **Fetch:** Hanya menganggap error jika terjadi masalah jaringan (DNS gagal, offline). Jika server membalas dengan status **404 Not Found** atau **500 Internal Server Error**, `fetch` menganggapnya **SUKSES** (resolve), sehingga Anda harus manual mengecek `if (!response.ok)`.
- **Axios:** Secara otomatis menganggap status code di luar jangkauan 2xx (200-299) sebagai **ERROR** (reject). Ini berarti kode akan langsung loncat ke blok `catch`.

### 2. Anatomi Objek Error Axios

Ketika request gagal, Axios memberikan objek error yang sangat terstruktur. Anda tidak boleh sekadar melakukan `console.log(error)`, tetapi harus membedah isinya untuk tahu apa yang terjadi.

Objek error Axios memiliki 3 properti utama yang harus diperiksa secara berurutan:

1.  **`error.response` (Masalah dari Server)**

    - **Kondisi:** Request berhasil dikirim, dan server merespons, **TAPI** statusnya error (misal: 404, 401, 500).
    - **Isi:** Data respons (`error.response.data`), status code (`error.response.status`), dan headers (`error.response.headers`).
    - **Contoh:** User login tapi password salah (401), atau mencari data yang tidak ada (404).

2.  **`error.request` (Masalah Jaringan/Tidak Ada Respon)**

    - **Kondisi:** Request berhasil dibuat, tapi **TIDAK ADA** jawaban dari server.
    - **Penyebab:** Internet mati, server down, atau terhalang CORS.
    - **Isi:** Instance dari `XMLHttpRequest` (di browser) atau `http.ClientRequest` (di Node.js).

3.  **`error.message` (Masalah Konfigurasi)**
    - **Kondisi:** Terjadi kesalahan saat menyusun request itu sendiri.
    - **Penyebab:** Typo di kode, kesalahan logika coding.

### 3. Diagram Alur Penanganan Error

Pola standar yang akan kita gunakan adalah blok `try-catch` dengan pengecekan bertingkat.

```javascript wrap
try {
  // Lakukan request
  const response = await axios.get('/url');
  console.log('Sukses:', response.data);
} catch (error) {
  if (error.response) {
    // 1. Server merespon dengan status error (4xx, 5xx)
    console.log('Status:', error.response.status);
    console.log('Pesan Server:', error.response.data);
  } else if (error.request) {
    // 2. Tidak ada respon (Network Error / Server Down)
    console.log('Tidak ada respon dari server');
  } else {
    // 3. Error lainnya (Code setup error)
    console.log('Error setup:', error.message);
  }
}
```

---

## Praktik: Simulasi Berbagai Jenis Error

Kita akan menggunakan `jsonplaceholder` untuk mensimulasikan error server (404) dan URL acak untuk mensimulasikan error jaringan.

### Persiapan

Buat file baru atau gunakan file latihan sebelumnya, dan pastikan Axios sudah terimport.

### Latihan 1: Menangani Error 404 (Not Found)

Di sini kita akan mencoba mengambil data Todo dengan ID yang tidak masuk akal.

```javascript wrap
async function getNonExistentData() {
  console.log('--- Mencoba Request Data Tidak Ada (404) ---');
  try {
    // ID 99999 tidak ada di jsonplaceholder
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/99999');

    // Baris ini TIDAK akan dieksekusi karena Axios langsung melempar error
    console.log('Berhasil:', response.data);
  } catch (error) {
    // Tangkap error di sini
    if (error.response) {
      console.error(`❌ Terjadi Error Server!`);
      console.error(`Status Code: ${error.response.status}`); // Output: 404
      console.error(`Headers:`, error.response.headers['content-type']);
    } else {
      console.error('Error lain:', error.message);
    }
  }
}

getNonExistentData();
```

**Analisis:** Bandingkan dengan `fetch`. Jika pakai `fetch`, kode akan masuk ke blok sukses, dan Anda bingung kenapa datanya kosong `{}`. Dengan Axios, ia langsung memberi tahu bahwa ini error.

### Latihan 2: Menangani Network Error

Kita akan mencoba request ke domain yang tidak valid untuk mensimulasikan server mati atau DNS failure.

```javascript wrap
async function simulateNetworkError() {
  console.log('\n--- Mencoba Request ke Server Mati ---');
  try {
    // Domain ini sengaja dibuat salah
    await axios.get('https://domain-ngawur-yang-tidak-ada.com/data');
  } catch (error) {
    if (error.response) {
      // Tidak akan masuk sini karena server tidak ketemu
      console.log('Response Error');
    } else if (error.request) {
      // Akan masuk ke sini
      console.error('Network Error: Server tidak merespon atau offline.');
      // error.code biasanya berisi 'ENOTFOUND' atau sejenisnya
      console.error('Kode Error:', error.code);
    } else {
      console.error('Error:', error.message);
    }
  }
}

simulateNetworkError();
```

### Latihan 3: Mengubah Perilaku Default (`validateStatus`)

Terkadang, Anda mungkin ingin Axios berperilaku seperti `fetch` (tidak error meski status 404), misalnya jika API Anda menganggap 404 sebagai "Data Kosong" yang valid, bukan error sistem.

Kita bisa mengubah opsi `validateStatus` di config.

```javascript wrap
async function customValidation() {
  console.log('\n--- Custom Validate Status (Ala Fetch) ---');
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/99999', {
      // Minta Axios menganggap semua status < 500 sebagai SUKSES
      validateStatus: function (status) {
        return status < 500; // 404 akan dianggap true (sukses)
      },
    });

    console.log(`Request dianggap sukses meski status: ${response.status}`);
    console.log('Data diterima:', response.data); // Biasanya {}
  } catch (error) {
    console.error('Hanya masuk sini jika 500+ atau Network Error');
  }
}

customValidation();
```

### Rangkuman Sesi 6

1.  Axios **reject** promise secara otomatis untuk status HTTP error (4xx, 5xx), berbeda dengan Fetch.
2.  Selalu gunakan struktur `try-catch`.
3.  Cek `error.response` dulu untuk menangani pesan error validasi dari backend (misal: "Email sudah terdaftar").
4.  Cek `error.request` untuk menangani masalah koneksi internet.

Di **Sesi 7**, kita akan menangani masalah yang sering terjadi di dunia nyata: Server lambat. Kita akan belajar **Timeout** dan strategi **Retry** (mencoba ulang otomatis).
