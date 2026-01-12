---
title: Upload File dengan FormData & Progress Bar
---

## Materi: Apa itu FormData?

Normalnya, kita mengirim data JSON (`{ "nama": "Budi" }`). Tapi JSON tidak didesain untuk mengirim file biner (gambar, video).

Untuk file, kita menggunakan standar browser bernama **FormData**. Ini ibarat "amplop coklat" di mana kita bisa memasukkan formulir kertas (text) sekaligus menyisipkan foto fisik (file) di dalamnya.

### Kelebihan Axios untuk Upload

1.  **Otomatis Deteksi:** Anda tidak perlu menulis header `Content-Type: multipart/form-data`. Axios akan mendeteksinya sendiri jika Anda mengirim instance `FormData`.
2.  **Upload Progress:** Axios punya event listener bawaan `onUploadProgress` untuk melacak persentase upload (0% - 100%). Ini sulit dilakukan dengan `fetch` standar.

---

## Praktik: Upload Gambar + Progress Bar

Kita akan membuat simulasi upload file ke server **Beeceptor** (Free Mock API).

> **Catatan:** Karena kita menggunakan layanan Mock gratisan, file tidak benar-benar "tersimpan" selamanya di server, tapi proses pengirimannya (upload stream) adalah nyata.

### 1. Setup HTML (`index.html`)

Tambahkan form upload dan elemen progress bar di `<body>`.

```html wrap
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Sesi 11: Upload Axios</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <style>
      body {
        font-family: sans-serif;
        padding: 20px;
        max-width: 500px;
        margin: 0 auto;
      }

      .upload-area {
        border: 2px dashed #aaa;
        padding: 20px;
        text-align: center;
        margin-bottom: 20px;
        border-radius: 8px;
        background: #f9f9f9;
      }

      /* Progress Bar Styling */
      .progress-container {
        width: 100%;
        background-color: #e0e0e0;
        height: 20px;
        border-radius: 10px;
        margin-top: 10px;
        display: none;
      }
      .progress-bar {
        width: 0%;
        height: 100%;
        background-color: #4caf50;
        border-radius: 10px;
        transition: width 0.3s;
      }

      .status-text {
        margin-top: 10px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <h2>Upload Dokumen</h2>

    <div class="upload-area">
      <!-- Input File -->
      <input type="file" id="fileInput" accept="image/*,.pdf" />
      <br /><br />

      <!-- Input Text Tambahan (misal: Judul Dokumen) -->
      <input
        type="text"
        id="docTitle"
        placeholder="Judul Dokumen (Opsional)"
        style="padding: 5px; width: 80%;"
      />
      <br /><br />

      <button id="btnUpload" disabled>Mulai Upload</button>
    </div>

    <!-- Tampilan Progress -->
    <div id="progressContainer" class="progress-container">
      <div id="progressBar" class="progress-bar"></div>
    </div>
    <p id="status" class="status-text"></p>

    <script type="module" src="./app.js"></script>
  </body>
</html>
```

### 2. Kode JavaScript (`app.js`)

Perhatikan penggunaan `onUploadProgress` di dalam config Axios.

```javascript wrap
// Ambil elemen DOM
const fileInput = document.getElementById('fileInput');
const docTitle = document.getElementById('docTitle');
const btnUpload = document.getElementById('btnUpload');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const statusEl = document.getElementById('status');

// 1. Validasi Sederhana: Tombol aktif cuma kalau ada file
fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    btnUpload.disabled = false;
    statusEl.textContent = `Siap mengupload: ${fileInput.files[0].name}`;
  } else {
    btnUpload.disabled = true;
    statusEl.textContent = '';
  }
});

// 2. Fungsi Upload Utama
btnUpload.addEventListener('click', async () => {
  const file = fileInput.files[0];
  const title = docTitle.value || 'Dokumen Tanpa Judul';

  if (!file) return;

  // --- PERSIAPAN FORM DATA ---
  // Bungkus file dan text jadi satu paket
  const formData = new FormData();
  formData.append('file', file); // Masukkan File
  formData.append('judul', title); // Masukkan Text

  // --- RESET UI ---
  btnUpload.disabled = true; // Kunci tombol biar gak double upload
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';
  statusEl.textContent = 'Sedang Mengupload...';

  try {
    // --- KIRIM REQUEST AXIOS ---
    // Gunakan endpoint Beeceptor (atau httpbin.org/post untuk tes)
    const response = await axios.post('https://httpbin.org/post', formData, {
      // FITUR KUNCI: Listener Progress
      onUploadProgress: (progressEvent) => {
        // progressEvent.loaded = bytes terkirim
        // progressEvent.total = total bytes file

        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

        // Update UI Progress Bar
        progressBar.style.width = `${percentCompleted}%`;
        statusEl.textContent = `Mengupload... ${percentCompleted}%`;

        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });

    // --- SUKSES ---
    statusEl.textContent = '✅ Upload Berhasil!';
    statusEl.style.color = 'green';
    console.log('Server Response:', response.data);
  } catch (error) {
    // --- GAGAL ---
    statusEl.textContent = '❌ Upload Gagal: ' + error.message;
    statusEl.style.color = 'red';
    progressBar.style.backgroundColor = 'red'; // Ubah warna bar jadi merah
  } finally {
    // Cleanup / Re-enable
    btnUpload.disabled = false;
    // Opsional: Clear input setelah sukses
    // fileInput.value = '';
  }
});
```

### Analisis Penting

1.  **`new FormData()`**: Jangan kirim objek JS biasa `{ file: ... }`. Itu tidak akan bekerja. Harus pakai `FormData`.
2.  **`onUploadProgress`**: Fungsi ini dipanggil berkali-kali oleh Axios selama proses pengiriman data. Semakin besar filenya, semakin sering dipanggil.
3.  **Endpoint Test**: Kita menggunakan `https://httpbin.org/post` karena server ini akan memantulkan kembali data yang kita kirim, sehingga kita bisa memastikan filenya "sampai" (lihat di console log bagian `files`).

### Tantangan Mandiri

Coba upload file gambar yang agak besar (misal 2MB - 5MB) agar Anda bisa melihat animasi progress bar berjalan perlahan. Jika file terlalu kecil (10KB), progress bar akan langsung lompat ke 100% karena koneksi internet zaman sekarang terlalu cepat.

Di **Sesi 12**, kita akan melakukan kebalikannya: **Download File** (misal: PDF Invoice) dan menampilkannya progress download-nya ke user.
