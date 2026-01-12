---
title: UI State (Loading, Success, Error, Empty)
---

## Materi: 4 State Wajib dalam Async UI

Setiap kali aplikasi Anda mengambil data dari server, komponen UI Anda harus mampu menangani 4 kondisi (State) ini agar UX-nya bagus:

1.  **Idle/Init:** Kondisi awal, belum ada request.
2.  **Loading:** Request sedang terbang. Tampilkan spinner/skeleton loader. Tombol harus di-disable agar user tidak spam klik.
3.  **Success (Data):** Data berhasil diambil. Tampilkan datanya.
4.  **Error:** Gagal. Tampilkan pesan error yang manusiawi (bukan "Object Object") dan tombol "Coba Lagi".
5.  **Empty (Opsional):** Sukses, tapi datanya kosong array `[]`. Tampilkan pesan "Data Belum Tersedia".

---

## Praktik: Membangun "User Manager" Sederhana

Kita akan membuat aplikasi kecil untuk memuat daftar user, dengan tombol refresh dan penanganan state yang lengkap.

### 1. Struktur HTML (`index.html`)

Ganti isi `<body>` Anda dengan kode berikut. Kita menggunakan CSS sederhana untuk visualisasi state.

```html wrap
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Sesi 10: Axios UI Pattern</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <h1>Daftar Pengguna</h1>

    <!-- 1. Kontrol -->
    <div style="margin-bottom: 20px;">
      <button id="btnLoad" class="btn">Muat Data User</button>
      <button id="btnError" class="btn">Simulasi Error</button>
    </div>

    <!-- 2. State: Loading -->
    <div id="loadingState" class="hidden">
      <p>⏳ Sedang mengambil data dari server...</p>
    </div>

    <!-- 3. State: Error -->
    <div id="errorState" class="error-box hidden">
      <strong>Terjadi Kesalahan!</strong> <span id="errorText"></span> <br /><br />
      <button onclick="app.loadUsers()" class="btn">Coba Lagi</button>
    </div>

    <!-- 4. State: Success (List Data) -->
    <div id="dataList"></div>

    <!-- 5. State: Empty -->
    <div id="emptyState" class="hidden" style="color: #666; font-style: italic;">
      Belum ada data pengguna. Silakan klik tombol Muat.
    </div>

    <script type="module" src="./app.js"></script>
  </body>
</html>
```

Buat file **`style.css`** di root folder untuk latihan ini.

```css wrap
body {
  font-family: sans-serif;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
.card {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
}
.error-box {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  display: none;
}
.btn {
  padding: 8px 16px;
  cursor: pointer;
}
.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Utility Classes untuk Toggle Tampilan */
.hidden {
  display: none !important;
}
```

### 2. Logika JavaScript (`app.js`)

Kita akan menggunakan pola **State Machine** sederhana. Fungsi `render()` bertugas menyalakan/mematikan elemen HTML berdasarkan kondisi variabel saat ini.

```javascript wrap
// Konfigurasi Axios Instance (Biar rapi seperti Sesi 9)
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 3000, // Timeout 3 detik biar kerasa kalau loading lama
});

// --- STATE MANAGEMENT ---
// Kita simpan semua kondisi aplikasi dalam satu objek state
const state = {
  isLoading: false,
  data: [],
  error: null, // null artinya tidak ada error
  isFirstLoad: true, // Untuk menandai tampilan awal
};

// --- DOM ELEMENTS ---
const el = {
  btnLoad: document.getElementById('btnLoad'),
  btnError: document.getElementById('btnError'),
  loading: document.getElementById('loadingState'),
  errorBox: document.getElementById('errorState'),
  errorText: document.getElementById('errorText'),
  list: document.getElementById('dataList'),
  empty: document.getElementById('emptyState'),
};

// --- CORE FUNCTION: RENDER UI ---
// Tugas fungsi ini hanya satu: Menyesuaikan tampilan HTML dengan isi variabel 'state'
function render() {
  // 1. Reset semua tampilan ke hidden dulu
  el.loading.classList.add('hidden');
  el.errorBox.classList.add('hidden');
  el.empty.classList.add('hidden');
  el.list.innerHTML = ''; // Bersihkan list

  // Matikan/Nyalakan tombol saat loading
  el.btnLoad.disabled = state.isLoading;
  el.btnError.disabled = state.isLoading;

  // 2. Logika Tampilan Berdasar State
  if (state.isLoading) {
    el.loading.classList.remove('hidden');
    return; // Kalau lagi loading, jangan tampilkan yg lain
  }

  if (state.error) {
    el.errorBox.classList.remove('hidden');
    el.errorText.textContent = state.error;
    return;
  }

  if (state.data.length > 0) {
    // Render List Data
    const html = state.data
      .map(
        (user) => `
            <div class="card">
                <strong>${user.name}</strong><br>
                <small>📧 ${user.email}</small>
            </div>
        `
      )
      .join('');
    el.list.innerHTML = html;
  } else {
    // Data Kosong
    el.empty.classList.remove('hidden');
    // Jika ini bukan load pertama (artinya user sudah search tapi hasil 0)
    if (!state.isFirstLoad) {
      el.empty.textContent = 'Data tidak ditemukan (Array kosong).';
    }
  }
}

// --- API ACTIONS ---

// Fungsi mengambil data user
async function loadUsers(forceError = false) {
  // Update State: Loading ON, Error Reset
  state.isLoading = true;
  state.error = null;
  state.isFirstLoad = false;
  render(); // Update UI jadi "Loading..."

  try {
    let url = '/users';
    if (forceError) url = '/users-yang-salah'; // Simulasi 404

    // Simulasi delay 1 detik agar loading spinner terlihat
    // (Di production jangan pakai delay buatan ini)
    await new Promise((r) => setTimeout(r, 1000));

    const response = await api.get(url);

    // Update State: Sukses
    state.data = response.data; // Isi array data
  } catch (err) {
    // Update State: Gagal
    state.data = []; // Kosongkan data lama jika error

    if (err.response) {
      state.error = `Server Error: ${err.response.status} - ${err.response.statusText}`;
    } else if (err.request) {
      state.error = 'Gagal terhubung ke server. Periksa koneksi internet.';
    } else {
      state.error = err.message;
    }
  } finally {
    // Apapun yang terjadi (Sukses/Gagal), Loading harus berhenti!
    state.isLoading = false;
    render(); // Update UI terakhir
  }
}

// Expose function ke window agar bisa dipanggil tombol "Coba Lagi" di HTML
window.app = { loadUsers };

// --- EVENT LISTENERS ---
el.btnLoad.addEventListener('click', () => loadUsers(false));
el.btnError.addEventListener('click', () => loadUsers(true)); // Paksa error

// Initial Render
render();
```

### Analisis Pola (Pattern)

Perhatikan pola `try-catch-finally` di fungsi `loadUsers`.

1.  **Sebelum `try`**: Set `isLoading = true` & Hapus error lama. Update UI.
2.  **Di dalam `try`**: Request Axios. Jika berhasil, simpan data ke state.
3.  **Di dalam `catch`**: Tangkap error, format pesannya menjadi string yang enak dibaca user, simpan ke `state.error`.
4.  **Di dalam `finally`**: Set `isLoading = false`. Update UI.

Pola ini menjamin aplikasi Anda tidak akan pernah "stuck" di mode loading selamanya, bahkan jika terjadi error yang tidak terduga sekalipun.

### Hasil Latihan

1.  Klik **"Muat Data User"**: Tulisan "Sedang mengambil..." muncul sebentar, tombol mati, lalu muncul daftar nama.
2.  Klik **"Simulasi Error"**: Loading sebentar, lalu muncul kotak merah error.
3.  Klik **"Coba Lagi"** di kotak error: Aplikasi mencoba me-load ulang (retry manual).

Di **Sesi 11**, kita akan belajar menangani input data dari user: **Upload File** menggunakan `FormData` dan Axios. Kita juga akan membuat progress bar upload sederhana.
