---
title: Studi Kasus Real-World (TheMealDB) - Fetching & Rendering
---

Mulai titik ini, kita tidak lagi bermain dengan "kode mainan". Kita akan membangun aplikasi **Pencari Resep (Recipe Finder)** menggunakan API publik nyata: **TheMealDB**.

Tantangan di dunia nyata bukan hanya soal mengambil data, tapi memahami **struktur data** yang diberikan oleh penyedia API. Setiap API punya keunikannya sendiri.

## Analisis API: TheMealDB

Sebelum ngoding, seorang developer harus membaca dokumentasi/respon API dulu.
Coba buka URL ini di browser:
`https://www.themealdb.com/api/json/v1/1/search.php?s=chicken`

**Temuan Penting:**

1.  **Struktur:** Data tidak langsung berupa array, tapi dibungkus objek: `{ "meals": [...] }`.
2.  **Null State:** Jika kita mencari makanan aneh (misal: "kambingguling"), API ini **TIDAK error 404**, melainkan tetap **200 OK** tapi isinya `{ "meals": null }`. Ini jebakan umum bagi pemula!

---

## Praktik: Membangun Recipe Finder

Kita akan membuat aplikasi yang bisa mencari resep, menampilkan Grid foto makanan, dan menangani kondisi "Data Tidak Ditemukan" dengan benar.

### 1. Struktur HTML & CSS (`index.html`)

Kita buat tampilan yang agak cantik menggunakan CSS Grid agar terlihat seperti aplikasi modern.

```html wrap
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MasterCheff - Cari Resep</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <style>
      /* Reset & Base Styles */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: 'Segoe UI', sans-serif;
        background-color: #f4f4f9;
        padding: 20px;
      }

      /* Container */
      .container {
        max-width: 800px;
        margin: 0 auto;
      }

      /* Header & Search */
      header {
        text-align: center;
        margin-bottom: 30px;
      }
      h1 {
        color: #ff6b6b;
        margin-bottom: 20px;
      }

      .search-box {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      input {
        padding: 12px;
        width: 70%;
        border: 1px solid #ddd;
        border-radius: 25px;
        outline: none;
        font-size: 16px;
      }
      button {
        padding: 12px 25px;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: bold;
        transition: 0.3s;
      }
      button:hover {
        background: #ee5253;
      }
      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      /* Results Grid */
      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 30px;
      }

      /* Recipe Card */
      .card {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }
      .card:hover {
        transform: translateY(-5px);
      }
      .card img {
        width: 100%;
        height: 150px;
        object-fit: cover;
      }
      .card-body {
        padding: 15px;
      }
      .card h3 {
        font-size: 16px;
        margin-bottom: 5px;
        color: #333;
      }
      .card p {
        font-size: 12px;
        color: #777;
      }
      .card .tag {
        display: inline-block;
        background: #e0f2f1;
        color: #009688;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        margin-top: 8px;
      }

      /* States */
      .state-msg {
        text-align: center;
        margin-top: 50px;
        color: #666;
        font-size: 18px;
      }
      .hidden {
        display: none;
      }
      .loader {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #ff6b6b;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>👨‍🍳 MasterCheff</h1>
        <div class="search-box">
          <input type="text" id="searchInput" placeholder="Cari resep (contoh: beef, cake)..." />
          <button id="searchBtn">Cari</button>
        </div>
      </header>

      <!-- State: Loading -->
      <div id="loader" class="loader hidden"></div>

      <!-- State: Error/Empty -->
      <div id="message" class="state-msg hidden"></div>

      <!-- State: Success (Grid) -->
      <div id="results" class="results-grid"></div>
    </div>

    <script type="module" src="./app.js"></script>
  </body>
</html>
```

### 2. Logic JavaScript (`app.js`)

Di sini kita menerapkan best practice: `axios.create` dan penanganan `null` dari TheMealDB.

```javascript wrap
// 1. Setup Axios Instance
// Base URL kita set ke API root
const mealApi = axios.create({
  baseURL: 'https://www.themealdb.com/api/json/v1/1',
  timeout: 10000, // 10 detik
});

// DOM Elements
const el = {
  input: document.getElementById('searchInput'),
  btn: document.getElementById('searchBtn'),
  grid: document.getElementById('results'),
  loader: document.getElementById('loader'),
  msg: document.getElementById('message'),
};

// Fungsi Render Card HTML
function createCard(meal) {
  return `
        <div class="card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
            <div class="card-body">
                <h3>${meal.strMeal}</h3>
                <p>🌍 ${meal.strArea} | 📂 ${meal.strCategory}</p>
                <a href="${meal.strYoutube}" target="_blank" class="tag">📺 Tonton Video</a>
            </div>
        </div>
    `;
}

// Fungsi Update UI State
function setUIState(state, message = '') {
  // Reset semua
  el.loader.classList.add('hidden');
  el.msg.classList.add('hidden');
  el.grid.innerHTML = '';
  el.btn.disabled = false;

  if (state === 'LOADING') {
    el.loader.classList.remove('hidden');
    el.btn.disabled = true;
  } else if (state === 'ERROR' || state === 'EMPTY') {
    el.msg.classList.remove('hidden');
    el.msg.innerHTML = message;
  }
}

// --- CORE LOGIC ---
async function searchRecipes() {
  const keyword = el.input.value.trim();

  if (!keyword) {
    alert('Mohon isi kata kunci pencarian!');
    return;
  }

  setUIState('LOADING');

  try {
    // REQUEST AXIOS
    // Perhatikan penggunaan 'params' untuk query string (?s=keyword)
    const response = await mealApi.get('/search.php', {
      params: { s: keyword },
    });

    // ANALISIS RESPON THEMEALDB
    // API ini mengembalikan { meals: [...] } atau { meals: null }
    const meals = response.data.meals;

    if (meals === null) {
      // Kasus: Sukses tapi Tidak Ada Data (Contoh: "asdfg")
      setUIState(
        'EMPTY',
        `
                <p>Yah, resep <strong>"${keyword}"</strong> tidak ditemukan. 🥬</p>
                <small>Coba kata kunci lain bahasa Inggris, misal: "chicken".</small>
            `
      );
    } else {
      // Kasus: Ada Data
      const html = meals.map((meal) => createCard(meal)).join('');
      el.grid.innerHTML = html;
    }
  } catch (error) {
    // Kasus: Error Jaringan / Server
    console.error('Error Fetching:', error);

    let errorMsg = 'Terjadi kesalahan koneksi.';
    if (error.response) {
      errorMsg = `Server Error: ${error.response.status}`;
    }

    setUIState(
      'ERROR',
      `❌ ${errorMsg} <br> <button onclick="window.location.reload()">Refresh</button>`
    );
  }
}

// Event Listeners
el.btn.addEventListener('click', searchRecipes);

// Biar bisa tekan Enter di input
el.input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchRecipes();
});
```

## Analisis Poin Penting (Real World)

1.  **`params: { s: keyword }`**:
    Alih-alih mengetik manual `` `/search.php?s=${keyword}` ``, kita membiarkan Axios menyusun URL-nya. Ini lebih aman (URL Encoding otomatis) dan lebih rapi. Jika keyword mengandung spasi (misal: "apple pie"), Axios otomatis mengubahnya jadi "apple%20pie".

2.  **Handling `response.data.meals === null`**:
    Inilah yang membedakan tutorial pemula dengan _real world_. Kita tidak hanya mengecek error catch, tapi juga mengecek **Logika Bisnis** API tersebut. API TheMealDB tidak error saat data kosong, dia cuma bilang `null`. UI kita harus siap menangani itu.

3.  **UI Feedback**:
    Perhatikan fungsi `setUIState`. Kita mematikan tombol cari (`el.btn.disabled = true`) saat loading. Ini UX pattern wajib untuk mencegah user menekan tombol berkali-kali ("Double Submit") yang bisa memboroskan kuota API.

---

Coba jalankan aplikasinya. Masukkan kata kunci seperti: `beef`, `pie`, `chicken`, atau coba kata acak `blablabla` untuk melihat pesan kosongnya.

Di **Sesi 14**, kita akan menyempurnakan aplikasi ini. Saat ini user harus tekan tombol "Cari". Di sesi depan, kita akan buat fitur **"Search as You Type"** (Cari saat mengetik) yang canggih menggunakan teknik **Debounce** dan **Cancel Token** agar tidak memboroskan request.
