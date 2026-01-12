---
title: Advanced UX - "Search as You Type" (Debounce & Cancel)
---

Fitur _Instant Search_ (hasil muncul saat mengetik) sangat disukai user, tapi ini adalah **mimpi buruk** bagi performa server jika tidak ditangani dengan benar.

Tanpa optimasi, mengetik "CHICKEN" (7 huruf) akan menembakkan **7 request** API secara beruntun.

1. C
2. CH
3. CHI
   ...
4. CHICKEN

Kita akan memperbaiki ini menggunakan dua teknik "Ninja" Frontend: **Debouncing** dan **Cancellation**.

---

## Konsep: Masalah "Chatty" & "Race Condition"

1.  **Chatty (Boros):** Mengetik cepat membuat puluhan request yang sebenarnya tidak perlu. Kita cuma butuh hasil request terakhir ("CHICKEN").
2.  **Race Condition (Balapan):** Request "CHI" (ke-3) mungkin lambat dan baru sampai _setelah_ request "CHICKEN" (ke-7) selesai ditampilkan. Akibatnya, UI tiba-tiba berubah kembali menampilkan hasil "CHI" yang basi.

Solusi:

- **Debounce:** Tunggu user _berhenti mengetik_ selama X milidetik (misal 500ms), baru kirim request.
- **AbortController:** Jika request baru mau dikirim, request lama yang masih _loading_ harus dibunuh (Abort).

---

## Praktik: Meng-upgrade "MasterCheff"

Kita tidak perlu mengubah HTML. Kita hanya merombak total logika JavaScript di `app.js`.

### Kode JavaScript (Updated `app.js`)

Perhatikan variabel `searchTimeout` (untuk Debounce) dan `currentController` (untuk Cancel).

```javascript
// Setup Axios
const mealApi = axios.create({
  baseURL: 'https://www.themealdb.com/api/json/v1/1',
  timeout: 10000,
});

// DOM Elements
const el = {
  input: document.getElementById('searchInput'),
  // Kita hapus tombol cari karena sekarang otomatis
  grid: document.getElementById('results'),
  loader: document.getElementById('loader'),
  msg: document.getElementById('message'),
};

// --- GLOBAL VARIABLES (STATE) ---
let searchTimeout = null; // Timer untuk Debounce
let currentController = null; // Remot kontrol untuk Abort Request

// --- UI HELPERS ---
function createCard(meal) {
  return `
        <div class="card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
            <div class="card-body">
                <h3>${meal.strMeal}</h3>
                <p>🌍 ${meal.strArea} | 📂 ${meal.strCategory}</p>
            </div>
        </div>
    `;
}

function setUIState(state, message = '') {
  if (state === 'LOADING') {
    el.loader.classList.remove('hidden');
    el.msg.classList.add('hidden');
  } else if (state === 'IDLE') {
    el.loader.classList.add('hidden');
  } else {
    el.loader.classList.add('hidden');
    el.grid.innerHTML = ''; // Bersihkan grid
    el.msg.classList.remove('hidden');
    el.msg.innerHTML = message;
  }
}

// --- CORE LOGIC: FETCH DATA ---
async function fetchRecipes(keyword) {
  // 1. Matikan request lama (jika ada) sebelum membuat yang baru!
  if (currentController) {
    currentController.abort();
    console.log('🚧 Request lama dibatalkan (Aborted).');
  }

  // 2. Buat controller baru
  currentController = new AbortController();

  setUIState('LOADING');
  console.log(`🔎 Mencari: "${keyword}"...`);

  try {
    const response = await mealApi.get('/search.php', {
      params: { s: keyword },
      signal: currentController.signal, // Pasang sinyal abort di sini
    });

    const meals = response.data.meals;

    setUIState('IDLE'); // Matikan loader

    if (meals === null) {
      el.grid.innerHTML = '';
      setUIState('EMPTY', `Tidak ada resep untuk <strong>"${keyword}"</strong>`);
    } else {
      el.msg.classList.add('hidden'); // Sembunyikan pesan kosong
      el.grid.innerHTML = meals.map(createCard).join('');
    }
  } catch (error) {
    // 3. Filter Error: Apakah ini error beneran atau cuma "Cancel"?
    if (axios.isCancel(error)) {
      // Jika dicancel, JANGAN ubah UI. Biarkan loading spinner jalan
      // karena pasti ada request baru yang segera menggantikannya.
      console.log(`🛑 Fetch "${keyword}" dibatalkan.`);
    } else {
      console.error('Error Asli:', error);
      setUIState('ERROR', 'Gagal memuat data.');
    }
  }
}

// --- LOGIC: DEBOUNCE INPUT ---
el.input.addEventListener('input', (e) => {
  const keyword = e.target.value.trim();

  // Reset timer setiap kali user ngetik huruf baru
  if (searchTimeout) clearTimeout(searchTimeout);

  if (!keyword) {
    el.grid.innerHTML = '';
    el.msg.classList.add('hidden');
    el.loader.classList.add('hidden');
    return;
  }

  // Tunggu 500ms (setengah detik)
  // Jika user ngetik lagi sebelum 500ms, timer di-reset (baris di atas).
  // Jika user diam selama 500ms, barulah fungsi fetchRecipes dijalankan.
  searchTimeout = setTimeout(() => {
    fetchRecipes(keyword);
  }, 500);
});
```

### Cara Kerja Debounce (Visualisasi)

User mengetik "BEEF" dengan cepat.

1.  Ketik "B" -> Timer di-set 500ms.
2.  (100ms kemudian) Ketik "E" -> Timer lama dibuang, timer baru 500ms di-set.
3.  (100ms kemudian) Ketik "E" -> Timer lama dibuang, timer baru 500ms di-set.
4.  (100ms kemudian) Ketik "F" -> Timer lama dibuang, timer baru 500ms di-set.
5.  User diam...
6.  (500ms kemudian) Timer habis -> **JALAN!** `fetchRecipes('BEEF')`.

Hasil: Hanya **1 Request** yang dikirim, bukan 4. Hemat bandwidth!

### Cara Kerja Abort (Visualisasi)

User mengetik lambat: "A" ... (tunggu 1 detik) ... "P" ... (tunggu 1 detik).

1.  Request "A" dikirim. Loading...
2.  User ngetik "P" (jadi "AP"). Timer Debounce jalan -> Request "AP" dikirim.
3.  Di baris pertama `fetchRecipes`, `currentController.abort()` dipanggil.
4.  Request "A" (yang mungkin masih muter-muter di server) langsung dimatikan browser.
5.  Browser fokus hanya ke Request "AP".

Hasil: UI selalu menampilkan hasil terbaru ("AP"), tidak mungkin tertimpa hasil lama ("A").

---

Di **Sesi 15**, kita akan mencoba merusak aplikasi ini (dengan sengaja). Kita akan mensimulasikan kondisi di mana API TheMealDB sedang _down_ atau _super lambat_ menggunakan **Beeceptor**, dan melatih aplikasi kita agar "Tahan Banting" (Resilient).
