---
title: Download File & Progress Bar (Blob Handling)
---

Di sesi ini, kita akan menangani file biner yang datang _dari_ server (Download).

Tantangannya bukan hanya mengambil datanya, tetapi bagaimana mengubah aliran data biner (stream) tersebut menjadi file nyata yang bisa disimpan atau dibuka user.

## Materi: Respon Tipe 'Blob'

Secara default, Axios mencoba membaca respon sebagai JSON. Jika Anda mendownload file (PDF, ZIP, Gambar), JSON parsing akan gagal dan merusak data filenya.

Kuncinya ada pada konfigurasi `responseType`.

### 1. `responseType: 'blob'`

Kita harus memberi tahu Axios: _"Jangan baca ini sebagai teks! Baca ini sebagai gumpalan data mentah (Binary Large Object)."_

```javascript
axios.get('/file.pdf', {
  responseType: 'blob', // PENTING!
});
```

### 2. Trik Download di Browser

Browser tidak punya API `saveAs()` yang standar. Trik yang umum digunakan programmer web adalah:

1.  Terima data Blob dari Axios.
2.  Buat URL sementara (`URL.createObjectURL(blob)`).
3.  Buat elemen `<a>` (link) siluman di memori.
4.  Set `href` link ke URL sementara tadi.
5.  Set atribut `download="namafile.pdf"`.
6.  Paksa klik link tersebut secara programatik (`link.click()`).
7.  Hapus URL sementara agar memori tidak bocor.

---

## Praktik: Download Gambar dengan Progress

Kita akan mendownload gambar random ukuran cukup besar (via `picsum.photos`) agar progress bar sempat terlihat berjalan.

### Setup HTML (`index.html`)

Tambahkan bagian ini di bawah form upload yang tadi (atau buat file baru).

```html
<hr style="margin: 40px 0; border: 1px solid #eee;" />

<h2>Download Gambar (Blob)</h2>

<button id="btnDownload" class="btn">⬇️ Download Random Image (HD)</button>

<!-- Progress Bar Download -->
<div id="dlProgressContainer" class="progress-container">
  <div id="dlProgressBar" class="progress-bar" style="background-color: #2196F3;"></div>
</div>

<p id="dlStatus" class="status-text"></p>

<!-- Tempat menampilkan preview gambar setelah download -->
<img
  id="previewImage"
  style="max-width: 100%; margin-top: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: none;"
/>
```

### Kode JavaScript (`app.js`)

Tambahkan logika download ini. Perhatikan trik `window.URL.createObjectURL`.

```javascript
// --- DOM Elements ---
const btnDownload = document.getElementById('btnDownload');
const dlProgressBar = document.getElementById('dlProgressBar');
const dlProgressContainer = document.getElementById('dlProgressContainer');
const dlStatus = document.getElementById('dlStatus');
const previewImage = document.getElementById('previewImage');

btnDownload.addEventListener('click', async () => {
  // 1. Reset UI
  btnDownload.disabled = true;
  dlProgressContainer.style.display = 'block';
  dlProgressBar.style.width = '0%';
  dlStatus.textContent = 'Menghubungkan ke server...';
  previewImage.style.display = 'none';

  try {
    // URL gambar random ukuran besar (biar progress bar kelihatan)
    // Kita tambah timestamp agar tidak di-cache browser
    const fileUrl = `https://picsum.photos/1000/800?random=${Date.now()}`;

    // 2. Request Download
    const response = await axios.get(fileUrl, {
      responseType: 'blob', // WAJIB: Agar respon jadi Blob, bukan string rusak

      // Listener Progress (Mirip Upload, tapi arahnya Download)
      onDownloadProgress: (progressEvent) => {
        const total = progressEvent.total; // Ukuran file (bytes)
        const current = progressEvent.loaded; // Yang sudah diterima

        if (total) {
          const percent = Math.round((current / total) * 100);
          dlProgressBar.style.width = `${percent}%`;
          dlStatus.textContent = `Mendownload... ${percent}%`;
        } else {
          // Kadang server tidak kirim header 'Content-Length', jadi kita gak tau totalnya
          dlStatus.textContent = `Mendownload... (${(current / 1024).toFixed(0)} KB)`;
        }
      },
    });

    // 3. Proses Blob menjadi File/Gambar
    const blob = response.data; // Ini adalah objek Blob

    // Buat URL Objek (URL Virtual di memori browser)
    const objectUrl = window.URL.createObjectURL(blob);

    // --- OPSI A: Tampilkan di <img> ---
    previewImage.src = objectUrl;
    previewImage.style.display = 'block';

    // --- OPSI B: Auto Download ke Komputer User ---
    // (Uncomment kode di bawah ini jika ingin memaksa save file)
    /*
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `gambar-keren-${Date.now()}.jpg`; // Nama file hasil download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        */

    dlStatus.textContent = '✅ Download Selesai!';
    dlStatus.style.color = 'green';

    // PENTING: Bersihkan memori setelah gambar dimuat
    // (Beri jeda sedikit agar <img> sempat me-render)
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    dlStatus.textContent = '❌ Gagal Download: ' + error.message;
    dlStatus.style.color = 'red';
    dlProgressBar.style.backgroundColor = 'red';
  } finally {
    btnDownload.disabled = false;
  }
});
```

### Analisis Penting

1.  **`responseType: 'blob'`**: Jika Anda lupa baris ini, gambar akan terdownload sebagai teks aneh (JFIF...) dan file hasil download akan rusak (corrupt).
2.  **Server `Content-Length`**: Progress bar hanya bisa menghitung `%` jika server mengirim header `Content-Length` (ukuran total file). Beberapa server CDN kadang tidak mengirim ini demi performa, sehingga kita hanya tahu "berapa byte yang sudah masuk" tapi tidak tahu "berapa lagi sisanya".
3.  **Memori Browser**: `URL.createObjectURL` memakan RAM. Biasakan memanggil `URL.revokeObjectURL` setelah file tidak dipakai lagi untuk mencegah kebocoran memori (Memory Leak) pada aplikasi web yang berjalan lama.

---

**Selamat!** Anda telah menyelesaikan materi inti (Core) dari penggunaan Axios. Mulai dari request dasar, error handling, interceptor, hingga manajemen file.

Selanjutnya, kita akan masuk ke **Sesi 13 (Project Nyata)**. Sesuai request Anda, kita akan menggunakan **TheMealDB** untuk membuat aplikasi pencari resep yang cantik dan fungsional. Kita akan menerapkan semua ilmu Sesi 1-12 di sana.
