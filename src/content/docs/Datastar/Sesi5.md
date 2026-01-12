---
title: Integrasi Lanjutan dan Pola Aplikasi Praktis
---

Setelah membahas dasar-dasar sinyal, aksi, dan pembaruan real-time, sesi terakhir ini berfokus pada **teknik integrasi lanjutan** dan **pola praktis** untuk membangun aplikasi yang canggih dengan Datastar.

## Kekuatan Backend Agnostik

Salah satu kekuatan terbesar Datastar adalah sifatnya yang **backend-agnostic**. Ia dapat diintegrasikan dengan bahasa atau framework backend apa pun, termasuk Go, Python, .NET, PHP, Java, dan tentunya **Node.js**. Pola integrasinya konsisten: backend Anda merender halaman HTML awal yang berisi tag skrip Datastar dan sebuah wadah dengan `data-signals`. Interaksi selanjutnya ditangani oleh endpoint backend yang mengembalikan respons spesifik Datastar (`text/html`, `application/json`, atau `text/event-stream`).

**Prinsip integrasi universal:**

1. Render HTML awal dengan sinyal dan atribut Datastar
2. Endpoint backend mengembalikan fragmen HTML, patch sinyal, atau stream SSE
3. Datastar di klien secara otomatis memproses respons berdasarkan Content-Type
4. UI bereaksi tanpa perlu JavaScript imperatif

## Pola Aplikasi Praktis

Beberapa pola aplikasi praktis muncul dari primitif inti Datastar. Berikut adalah pola-pola yang paling sering digunakan:

### Pola 1: Click-to-Edit

Pola ini melibatkan penampilan data dalam mode "lihat", dan saat tombol diklik, tampilan tersebut diganti dengan form yang dapat diedit. Setelah pengguna mengklik simpan, permintaan `@put()` atau `@post()` mengirimkan data yang diperbarui ke server untuk validasi, sebelum menerima _patch_ yang mengalihkan UI kembali ke mode lihat.

**Alur kerja:**

1. UI menampilkan data dalam mode read-only
2. User klik "Edit" → sinyal `$isEditing` berubah jadi `true`, form edit muncul
3. User edit data → two-way binding dengan `data-bind-value`
4. User klik "Simpan" → kirim `@put()` ke server
5. Server validasi → jika valid, kembalikan patch sinyal dengan `isEditing: false`
6. UI kembali ke mode lihat dengan data baru

### Pola 2: Validasi Inline

Saat pengguna mengetik di kolom form, `data-on-input__debounce.Xms` memicu permintaan ke endpoint validasi. Server mengembalikan patch sinyal yang berisi pesan kesalahan, yang kemudian ditampilkan secara real-time.

**Keunggulan:**

- Feedback langsung tanpa submit form
- UX lebih baik karena user tahu error sebelum submit
- Validasi dilakukan di server (single source of truth)

### Pola 3: Pencarian yang Dapat di-Bookmark

Pola ini meningkatkan pengalaman pengguna dengan menyinkronkan kueri pencarian ke parameter URL. Menggunakan atribut `data-query-string`, aplikasi dapat otomatis memperbarui URL. Ini memungkinkan pengguna untuk mem-bookmark atau berbagi tautan yang mewakili status hasil pencarian tertentu.

**Implementasi:**

```html
<div data-query-string="searchTerm">
  <input
    data-bind-value="$searchTerm"
    data-on-input__debounce.300ms="@get('/search')"
  />
</div>
```

URL otomatis menjadi: `?searchTerm=datastar`

### Pola 4: Polling untuk Data Fresh

Untuk menjaga data tetap segar, sebuah komponen dapat menggunakan `data-on-interval.Xms` untuk secara berkala meminta data baru dari server. Server kemudian dapat mendorong pembaruan melalui event `datastar-patch-elements` atau `datastar-patch-signals` jika data telah berubah.

**Contoh:**

```html
<div data-on-interval.5000ms="@get('/check-updates')">
  <!-- Cek update setiap 5 detik -->
</div>
```

### Pola 5: Perlindungan CSRF

Keamanan adalah yang utama. Pola umum melibatkan pembuatan token CSRF di server dan menyematkannya di input tersembunyi atau sinyal. Token ini kemudian disertakan dalam setiap permintaan aksi Datastar, yang divalidasi oleh backend sebelum diproses.

## Tabel Ringkasan Pola Aplikasi

| Pola                   | Kegunaan                              | Atribut Kunci                  | Respons Server             |
| :--------------------- | :------------------------------------ | :----------------------------- | :------------------------- |
| **Click-to-Edit**      | Edit inline tanpa navigasi            | `data-show`, `data-bind-value` | Patch sinyal               |
| **Validasi Inline**    | Validasi real-time saat user mengetik | `data-on-input__debounce.Xms`  | Patch sinyal dengan errors |
| **Pencarian Bookmark** | Search yang dapat disimpan di URL     | `data-query-string`            | Fragment HTML              |
| **Polling**            | Update periodik otomatis              | `data-on-interval.Xms`         | Patch sinyal/fragment      |
| **CSRF Protection**    | Keamanan terhadap serangan CSRF       | Token di sinyal/hidden input   | Validasi di backend        |

## Contoh Praktis: Aplikasi Manajemen Profil Lengkap

Mari kita bangun aplikasi yang menggabungkan semua pola di atas dalam satu implementasi komprehensif.

**File: `profile-advanced.html` (Frontend)**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Manajemen Profil - Datastar Advanced</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 20px;
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
      }

      #app {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      h1 {
        color: #333;
        margin-bottom: 30px;
        text-align: center;
      }

      .profile-section {
        margin-bottom: 30px;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;
      }

      .profile-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .info-row {
        padding: 12px 0;
        border-bottom: 1px solid #eee;
      }

      .info-row strong {
        display: inline-block;
        width: 150px;
        color: #555;
      }

      .info-row span {
        color: #333;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #333;
      }

      input[type="text"],
      input[type="email"],
      textarea {
        width: 100%;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.3s;
      }

      input:focus,
      textarea:focus {
        outline: none;
        border-color: #667eea;
      }

      .error {
        border-color: #e74c3c !important;
      }

      .error-message {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 3px;
      }

      .success-message {
        background: #d4edda;
        border: 1px solid #28a745;
        color: #155724;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 15px;
      }

      button {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        margin-right: 10px;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }

      .btn-secondary {
        background: #e0e0e0;
        color: #333;
      }

      .btn-secondary:hover {
        background: #d0d0d0;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      .search-section {
        margin-top: 40px;
        padding: 20px;
        background: #f0f0f0;
        border-radius: 8px;
      }

      .search-input {
        width: 100%;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 16px;
        margin-bottom: 15px;
      }

      .search-results {
        margin-top: 15px;
      }

      .search-result-item {
        padding: 12px;
        background: white;
        border-radius: 6px;
        margin-bottom: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .loading-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        display: none;
      }

      .loading-indicator.show {
        display: block;
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div class="container">
      <div
        id="app"
        data-signals='{
            "user": {
                "id": 1,
                "name": "Alice Johnson",
                "email": "alice@example.com",
                "bio": "Full-stack developer passionate tentang web modern"
            },
            "isEditing": false,
            "validationErrors": {},
            "isSaving": false,
            "saveSuccess": false,
            "searchTerm": "",
            "searchResults": [],
            "csrfToken": "TOKEN123456"
        }'
        data-query-string="searchTerm"
      >
        <h1>🎯 Manajemen Profil Advanced</h1>

        <!-- Success Message -->
        <div class="success-message" data-show="$saveSuccess">
          ✓ Profil berhasil diperbarui!
        </div>

        <!-- Profile Section -->
        <div class="profile-section">
          <div class="profile-header">
            <h2>Profil Pengguna</h2>
            <button
              class="btn-primary"
              data-show="!$isEditing"
              data-on-click="$isEditing = true; $saveSuccess = false"
            >
              ✏️ Edit Profil
            </button>
          </div>

          <!-- View Mode (Click-to-Edit Pattern) -->
          <div data-show="!$isEditing">
            <div class="info-row">
              <strong>Nama:</strong>
              <span data-text="$user.name"></span>
            </div>
            <div class="info-row">
              <strong>Email:</strong>
              <span data-text="$user.email"></span>
            </div>
            <div class="info-row">
              <strong>Bio:</strong>
              <span data-text="$user.bio"></span>
            </div>
          </div>

          <!-- Edit Mode -->
          <form
            data-show="$isEditing"
            data-on-submit.prevent="$isSaving = true; @put('/users/' + $user.id, { user: $user, csrf: $csrfToken })"
          >
            <div class="form-group">
              <label>Nama:</label>
              <input
                type="text"
                data-bind-value="$user.name"
                data-class="error:$validationErrors.name"
                data-on-input__debounce.500ms="@post('/validate-field', { field: 'name', value: $user.name })"
              />
              <div
                class="error-message"
                data-show="$validationErrors.name"
                data-text="$validationErrors.name"
              ></div>
            </div>

            <div class="form-group">
              <label>Email:</label>
              <input
                type="email"
                data-bind-value="$user.email"
                data-class="error:$validationErrors.email"
                data-on-input__debounce.500ms="@post('/validate-field', { field: 'email', value: $user.email })"
              />
              <div
                class="error-message"
                data-show="$validationErrors.email"
                data-text="$validationErrors.email"
              ></div>
            </div>

            <div class="form-group">
              <label>Bio:</label>
              <textarea
                data-bind-value="$user.bio"
                rows="4"
                data-class="error:$validationErrors.bio"
              ></textarea>
              <div
                class="error-message"
                data-show="$validationErrors.bio"
                data-text="$validationErrors.bio"
              ></div>
            </div>

            <button
              type="submit"
              class="btn-primary"
              data-attr-disabled="$isSaving"
            >
              <span data-show="!$isSaving">💾 Simpan Perubahan</span>
              <span data-show="$isSaving">⏳ Menyimpan...</span>
            </button>
            <button
              type="button"
              class="btn-secondary"
              data-on-click="$isEditing = false; $validationErrors = {}"
            >
              ❌ Batal
            </button>
          </form>
        </div>

        <!-- Search Section (Bookmarkable Search Pattern) -->
        <div class="search-section">
          <h3>🔍 Pencarian Pengguna</h3>
          <input
            type="text"
            class="search-input"
            data-bind-value="$searchTerm"
            data-on-input__debounce.300ms="@get('/search?q=' + encodeURIComponent($searchTerm))"
            placeholder="Cari pengguna... (URL akan otomatis diperbarui)"
          />
          <p style="font-size: 12px; color: #666; margin-bottom: 10px;">
            <span data-show="$searchTerm">
              Hasil untuk: "<strong data-text="$searchTerm"></strong>" (URL:
              ?searchTerm=<span data-text="$searchTerm"></span>)
            </span>
            <span data-show="!$searchTerm">
              Ketik untuk mencari. URL akan otomatis diperbarui dan dapat
              di-bookmark!
            </span>
          </p>

          <div id="search-results" class="search-results">
            <!-- Results dari server akan di-inject di sini -->
          </div>
        </div>
      </div>
    </div>

    <!-- Global Loading Indicator -->
    <div id="loading-indicator" class="loading-indicator">⏳ Memproses...</div>

    <script>
      // Event listener untuk menampilkan loading indicator
      document.addEventListener("datastar-fetch", (e) => {
        const indicator = document.getElementById("loading-indicator");
        if (e.detail.type === "start") {
          indicator.classList.add("show");
        } else {
          indicator.classList.remove("show");
        }
      });
    </script>
  </body>
</html>
```

**File: `server-advanced.js` (Backend Node.js/Express)**

```js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Simulasi database users
const usersDB = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    bio: "Full-stack developer",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    bio: "Frontend enthusiast",
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    bio: "Backend specialist",
  },
];

// CSRF token yang valid (dalam produksi, gunakan session)
const VALID_CSRF_TOKEN = "TOKEN123456";

// Helper untuk escape HTML
function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Validasi field individual (Inline Validation Pattern)
app.post("/validate-field", (req, res) => {
  const { field, value } = req.body || {};
  const errors = {};

  if (field === "name") {
    if (!value || value.trim().length < 2) {
      errors.name = "Nama harus minimal 2 karakter";
    } else {
      errors.name = null; // Clear error
    }
  }

  if (field === "email") {
    if (!value || !value.includes("@")) {
      errors.email = "Format email tidak valid";
    } else {
      errors.email = null; // Clear error
    }
  }

  res.setHeader("Content-Type", "application/json");
  res.json({ validationErrors: errors });
});

// Update profil user (Click-to-Edit Pattern + CSRF Protection)
app.put("/users/:id", (req, res) => {
  const userId = Number(req.params.id);
  const { user, csrf } = req.body || {};

  // CSRF Protection Pattern
  if (csrf !== VALID_CSRF_TOKEN) {
    res.status(403).json({ error: "CSRF token tidak valid" });
    return;
  }

  // Full validation
  const errors = {};
  if (!user?.name || user.name.trim().length < 2) {
    errors.name = "Nama harus minimal 2 karakter";
  }
  if (!user?.email || !user.email.includes("@")) {
    errors.email = "Format email tidak valid";
  }
  if (!user?.bio || user.bio.trim().length < 10) {
    errors.bio = "Bio harus minimal 10 karakter";
  }

  // Jika ada error, kembalikan dengan isEditing tetap true
  if (Object.keys(errors).length > 0) {
    res.setHeader("Content-Type", "application/json");
    return res.json({
      validationErrors: errors,
      isEditing: true,
      isSaving: false,
    });
  }

  // Update database (simulasi)
  const dbUser = usersDB.find((u) => u.id === userId);
  if (dbUser) {
    dbUser.name = user.name.trim();
    dbUser.email = user.email.trim();
    dbUser.bio = user.bio.trim();
  }

  // Sukses: kembalikan data baru dan tutup form
  res.setHeader("Content-Type", "application/json");
  res.json({
    user: {
      id: userId,
      name: user.name.trim(),
      email: user.email.trim(),
      bio: user.bio.trim(),
    },
    isEditing: false,
    validationErrors: {},
    isSaving: false,
    saveSuccess: true,
  });
});

// Pencarian user (Bookmarkable Search Pattern)
app.get("/search", (req, res) => {
  const query = String(req.query.q || "")
    .toLowerCase()
    .trim();

  if (!query) {
    res.setHeader("Content-Type", "text/html");
    return res.send(`
      <div id="search-results">
        <p style="color: #999; font-style: italic;">Ketik untuk mulai mencari...</p>
      </div>
    `);
  }

  // Filter users berdasarkan query
  const results = usersDB.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.bio.toLowerCase().includes(query)
  );

  // Render hasil sebagai fragmen HTML
  const resultsHTML =
    results.length > 0
      ? results
          .map(
            (user) => `
        <div class="search-result-item">
          <strong>${escapeHtml(user.name)}</strong> 
          <span style="color: #999;">(${escapeHtml(user.email)})</span>
          <p style="margin-top: 5px; font-size: 12px; color: #666;">${escapeHtml(user.bio)}</p>
        </div>
      `
          )
          .join("")
      : '<p style="color: #999; font-style: italic;">Tidak ada hasil ditemukan.</p>';

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <div id="search-results" class="search-results">
      ${resultsHTML}
    </div>
  `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(
    `Server berjalan di http://localhost:${PORT}/profile-advanced.html`
  );
  console.log("Fitur yang tersedia:");
  console.log("- Click-to-Edit dengan validasi real-time");
  console.log("- CSRF Protection");
  console.log("- Bookmarkable Search (cek URL saat search)");
  console.log("- Loading indicator global");
});
```

**Penjelasan Implementasi:**

### Click-to-Edit Pattern

1. **Mode lihat**: Data ditampilkan read-only dengan tombol "Edit Profil"
2. **Mode edit**: Klik edit → `$isEditing = true` → form muncul
3. **Submit**: Form dikirim dengan `@put()` + CSRF token
4. **Validasi**: Server cek dan kembalikan error atau sukses

### Inline Validation Pattern

1. **`data-on-input__debounce.500ms`**: Menunggu 500ms setelah user berhenti mengetik
2. **`@post('/validate-field')`**: Kirim field dan value ke server
3. **Server validasi**: Kembalikan patch sinyal dengan error atau null
4. **UI update**: Error message muncul/hilang real-time

### Bookmarkable Search Pattern

1. **`data-query-string="searchTerm"`**: Auto-sync sinyal ke URL
2. **`data-on-input__debounce.300ms`**: Delay untuk efisiensi
3. **`@get('/search?q=...')`**: Kirim query ke server
4. **Fragment HTML**: Server kembalikan hasil sebagai HTML
5. **URL update**: Otomatis jadi `?searchTerm=alice`, bisa di-bookmark!

### CSRF Protection Pattern

1. Token disimpan di sinyal: `csrfToken: "TOKEN123456"`
2. Setiap mutasi mengirim token: `{ user: $user, csrf: $csrfToken }`
3. Server validasi token sebelum proses
4. Reject jika token tidak valid

### Global Loading Indicator

1. Event `datastar-fetch` diemit untuk setiap request
2. `e.detail.type === 'start'` → tampilkan indicator
3. `e.detail.type === 'end'` → sembunyikan indicator
4. Memberikan feedback visual untuk semua operasi

## Fitur Lanjutan Datastar

### `data-persist` — Persistensi State

Menyimpan sinyal ke `localStorage` atau `sessionStorage` untuk mempertahankan state antar reload halaman.

```html
<div data-signals='{ "theme": "dark" }' data-persist="theme:local">
  <!-- theme akan disimpan di localStorage -->
</div>
```

### `data-ref` — Referensi Elemen

Menyimpan referensi ke elemen DOM di sinyal untuk manipulasi programmatic.

```html
<input data-ref="searchInput" type="text" />
<button data-on-click="$refs.searchInput.focus()">Fokus Input</button>
```

### Event Modifiers

Datastar mendukung berbagai modifier untuk kontrol fine-grained:

- **`prevent`**: Mencegah default behavior (`e.preventDefault()`)
- **`stop`**: Menghentikan event propagation (`e.stopPropagation()`)
- **`debounce.Xms`**: Delay eksekusi X milidetik setelah event terakhir
- **`throttle.Xms`**: Maksimal eksekusi sekali setiap X milidetik
- **`once`**: Hanya eksekusi sekali

**Contoh:**

```html
<form data-on-submit.prevent="@post('/submit')">
  <input data-on-input.debounce.500ms="@get('/autocomplete')" />
  <button data-on-click.once="@post('/subscribe')"></button>
</form>
```

## Tools untuk Developer

### Datastar Inspector (Browser Extension)

Tool debugging yang sangat berharga untuk:

- Memeriksa status semua sinyal real-time
- Memantau aktivitas jaringan Datastar
- Melihat patch yang diterapkan
- Timeline event fetch

### IDE Plugins

- **VSCode Extension**: Autocompletion untuk atribut `data-*`
- **IntelliJ Plugin**: Syntax highlighting dan validasi

## Best Practices

**Server sebagai Single Source of Truth**: Selalu validasi dan transformasi data di server, bukan klien.

**Gunakan Debounce**: Untuk input search atau validasi, gunakan debounce untuk mengurangi request.

**CSRF Protection Wajib**: Selalu lindungi endpoint mutasi dengan CSRF token.

**Loading States**: Berikan feedback visual dengan loading indicator atau disabled state.

**Error Handling**: Tangani error dengan graceful, tampilkan pesan yang jelas.

**Semantic HTML**: Gunakan tag HTML yang tepat (form, button, input) untuk aksesibilitas.

## Kesimpulan

Datastar memberdayakan pengembang untuk membangun aplikasi web yang kaya dan interaktif dengan merangkul model **state yang dimiliki server**. Dengan memanfaatkan primitif intinya—**Signals, Fragments, dan Actions**—Anda dapat membangun UI yang deklaratif dan digerakkan oleh state yang berkomunikasi dengan backend melalui interaksi yang jelas.

**Keunggulan Datastar:**

- Tidak perlu build step atau bundler kompleks
- Backend-agnostic, bekerja dengan stack apa pun
- Menggunakan standar web (HTML, HTTP, SSE)
- State reaktif tanpa framework JavaScript yang berat
- Real-time dengan SSE yang sederhana

**Kapan menggunakan Datastar:**

- Aplikasi dengan server-side rendering
- Aplikasi yang butuh interaktivitas tanpa SPA kompleks
- Aplikasi real-time (chat, dashboard, kolaborasi)
- Progressive enhancement dari aplikasi tradisional

Selamat membangun aplikasi modern dengan Datastar dan Node.js! 🚀
