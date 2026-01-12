---
title: CRUD Lengkap & Optimistic UI Update
---

Kita sampai di **Sesi 16**, sesi pamungkas.

Di sini kita akan menerapkan pola pikir _Senior Frontend Developer_: **Optimistic UI**.

Normalnya, developer pemula membuat UX yang "Pesimis":

1. User klik "Hapus".
2. Tampilkan Loading Spinner (User menunggu...).
3. Server menjawab "OK".
4. Baru hapus item dari layar.
   _(Terasa lambat dan kaku)_

**Optimistic UI:**

1. User klik "Hapus".
2. **Langsung hapus** item dari layar (Tanpa loading).
3. Kirim request ke server diam-diam di background.
4. Jika server Error? **Kembalikan (Rollback)** item tadi ke layar + tampilkan pesan error.
   _(Terasa instan dan cepat)_

---

Kita akan membuat fitur **"Daftar Favorit"**. Karena API resep (TheMealDB) hanya bisa baca (Read-Only), kita akan gunakan **JSONPlaceholder** (`/posts`) sebagai pura-pura database favorit kita.

## Praktik: Aplikasi Manajemen Favorit

### 1. Update HTML (`index.html`)

Tambahkan bagian baru di bawah hasil pencarian resep untuk menampung "Resep Favorit".

```html wrap
<!-- Tambahkan di bawah div #results yang lama -->

<hr style="margin: 40px 0; border: 1px solid #ddd;" />

<header>
  <h1>❤️ Resep Favorit Saya</h1>
  <p style="text-align: center; color: #666; margin-bottom: 20px;">
    (Simulasi CRUD menggunakan JSONPlaceholder)
  </p>

  <!-- Form Tambah Manual (Pura-pura simpan resep) -->
  <div class="search-box">
    <input type="text" id="favInput" placeholder="Nama resep favorit baru..." />
    <button id="addFavBtn" style="background-color: #4CAF50;">+ Simpan</button>
  </div>
</header>

<!-- List Favorit -->
<div id="favList" class="results-grid">
  <!-- Item akan muncul di sini -->
</div>
```

### 2. Logic JavaScript (`app.js`)

Kita akan membuat logika CRUD lengkap: **Create** (POST), **Read** (GET), **Delete** (DELETE). Fokus utama ada di fungsi `addFavorite` dan `deleteFavorite`.

```javascript wrap
// --- SETUP API ---
// Kita pakai JSONPlaceholder karena bisa POST/DELETE (walau datanya fake)
const favApi = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
});

// --- STATE LOKAL ---
// Kita butuh copy data di memori browser untuk Optimistic UI
let favorites = [];

// --- DOM ELEMENTS ---
const elFav = {
  input: document.getElementById('favInput'),
  btn: document.getElementById('addFavBtn'),
  list: document.getElementById('favList'),
};

// --- RENDER FUNCTION ---
function renderFavorites() {
  elFav.list.innerHTML = favorites
    .map(
      (item) => `
        <div class="card" id="item-${item.id}">
            <div class="card-body">
                <h3>🍽️ ${item.title}</h3>
                <p>ID: ${item.id}</p>
                <button 
                    onclick="app.deleteFavorite(${item.id})" 
                    style="background-color: #ff4757; margin-top: 10px; font-size: 12px; padding: 8px 15px;">
                    🗑️ Hapus
                </button>
            </div>
        </div>
    `
    )
    .join('');
}

// --- 1. READ (Load Awal) ---
async function loadFavorites() {
  try {
    // Ambil 3 data saja biar gak kebanyakan
    const res = await favApi.get('/posts?_limit=3');
    favorites = res.data; // Simpan ke state
    renderFavorites();
    console.log('✅ Data Favorit dimuat.');
  } catch (err) {
    alert('Gagal memuat favorit: ' + err.message);
  }
}

// --- 2. CREATE (Optimistic) ---
async function addFavorite() {
  const title = elFav.input.value.trim();
  if (!title) return;

  // A. OPTIMISTIC UPDATE
  // Kita buat ID sementara (negative/random) biar bisa dirender langsung
  const tempId = Date.now();
  const newItem = { id: tempId, title: title };

  // Langsung masukkan ke array & render
  favorites.unshift(newItem);
  renderFavorites();

  // Reset input biar user senang
  elFav.input.value = '';

  try {
    // B. KIRIM KE SERVER (Background)
    const res = await favApi.post('/posts', {
      title: title,
      body: 'Isi resep...',
      userId: 1,
    });

    // C. SYNC SERVER RESPONSE
    // Server JSONPlaceholder selalu membalas ID 101 untuk data baru.
    // Di aplikasi nyata, server akan membalas ID asli database (misal: 543).
    // Kita harus update ID sementara tadi dengan ID asli dari server.

    const index = favorites.findIndex((f) => f.id === tempId);
    if (index !== -1) {
      favorites[index].id = res.data.id; // Update ID jadi 101
      renderFavorites(); // Render ulang dengan ID benar
      console.log(`✅ Server: Data tersimpan (ID: ${res.data.id})`);
    }
  } catch (err) {
    // D. ROLLBACK (Jika Gagal)
    alert('Gagal menyimpan! Mengembalikan data...');

    // Hapus item yang tadi kita tambah secara paksa
    favorites = favorites.filter((f) => f.id !== tempId);
    renderFavorites();
  }
}

// --- 3. DELETE (Optimistic) ---
async function deleteFavorite(id) {
  // A. SNAPSHOT (Backup data dulu buat jaga-jaga)
  const previousFavorites = [...favorites];

  // B. OPTIMISTIC UPDATE
  // Langsung hapus dari layar
  favorites = favorites.filter((item) => item.id !== id);
  renderFavorites();

  try {
    // C. KIRIM REQUEST DELETE
    await favApi.delete(`/posts/${id}`);
    console.log(`✅ Server: Data ID ${id} terhapus.`);
  } catch (err) {
    // D. ROLLBACK
    alert('Gagal menghapus! Server error.');
    console.error(err);

    // Kembalikan data seperti semula
    favorites = previousFavorites;
    renderFavorites();
  }
}

// Expose fungsi delete ke window (karena dipanggil via onclick HTML)
window.app = window.app || {};
window.app.deleteFavorite = deleteFavorite;

// Event Listener Tambah
elFav.btn.addEventListener('click', addFavorite);

// Load awal
loadFavorites();
```

### Analisis & Testing

1.  **Test Delete:** Klik tombol "Hapus".
    - **Apa yang terlihat?** Card langsung hilang seketika. UI terasa sangat responsif.
    - **Apa yang terjadi di belakang?** Cek tab Network. Request `DELETE` sebenarnya sedang berjalan.
2.  **Test Rollback (Simulasi Error):**
    - Matikan internet Anda (Offline Mode di Browser).
    - Klik "Hapus". Card hilang.
    - Tunggu 1-2 detik (Axios timeout/error).
    - Muncul Alert "Gagal menghapus!".
    - **Card muncul kembali!** Inilah rollback. Data user aman.

---

### Penutup Materi Axios

Selamat! Anda telah menyelesaikan 16 Sesi perjalanan dari nol hingga menjadi mahir Axios.

**Ringkasan Perjalanan Anda:**

- ✅ **Basic:** GET/POST, Config, Instance.
- ✅ **Robustness:** Error Handling 4xx/5xx, Timeout, Auto Retry.
- ✅ **Performance:** Debounce, Cancel Request (AbortController).
- ✅ **Fitur Pro:** Interceptors, Upload/Download Progress, Blob.
- ✅ **UX Modern:** Optimistic UI Updates.

Materi ini sudah mencakup hampir 90% kebutuhan frontend developer sehari-hari dalam berinteraksi dengan API. Sisa 10%-nya biasanya spesifik kasus (seperti GraphQL, WebSocket, atau enkripsi custom) yang bisa Anda pelajari dengan fondasi kuat yang sudah Anda miliki sekarang.
