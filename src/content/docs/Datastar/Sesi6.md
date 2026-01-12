---
title: Animasi, Transitions, dan Advanced UI Patterns
---

Setelah menguasai operasi CRUD dan real-time dengan SSE, saatnya kita meningkatkan pengalaman pengguna dengan **animasi yang smooth** dan **UI patterns modern**. Sesi ini akan membahas cara membuat aplikasi yang tidak hanya fungsional, tetapi juga indah dan responsif secara visual.

## Pengantar: Mengapa Animasi Penting?

Animasi bukan hanya soal estetika—mereka memiliki fungsi UX yang penting:

- **Mengurangi cognitive load**: Membantu user memahami perubahan state
- **Memberikan feedback visual**: Konfirmasi bahwa aksi telah diterima
- **Mengurangi perceived latency**: Aplikasi terasa lebih cepat dengan animasi yang tepat
- **Meningkatkan context**: User tetap tahu di mana mereka berada dalam aplikasi
- **Professional polish**: Memberikan kesan aplikasi yang matang dan berkualitas

Datastar dirancang untuk bekerja dengan baik bersama **CSS Transitions** dan **View Transitions API** modern.

## Teknik Animasi Dasar dengan CSS

### 1. Stable IDs untuk CSS Transitions

Teknik paling sederhana adalah menjaga ID elemen tetap sama saat konten berubah. Datastar akan melakukan **morph** yang mempertahankan transisi CSS.

**Contoh: Color Throb**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Color Throb - Datastar</title>
    <style>
      #color-box {
        padding: 40px;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        border-radius: 12px;
        transition: all 0.5s ease-in-out;
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div data-signals='{ "isActive": false }'>
      <button data-on-click="@get('/toggle-color')">Toggle Warna</button>
      <div id="color-box"></div>
    </div>
  </body>
</html>
```

**Backend Node.js:**

```js
import express from "express";
const app = express();

let isBlue = true;

app.get("/toggle-color", (req, res) => {
  isBlue = !isBlue;

  const style = isBlue
    ? "color: #3498db; background-color: #e8f4f8;"
    : "color: #e74c3c; background-color: #fadbd8;";

  res.setHeader("Content-Type", "text/html");
  res.send(`
        <div 
            id="color-box"
            style="${style}"
        >
            ${isBlue ? "Mode Biru" : "Mode Merah"}
        </div>
    `);
});

app.listen(3000);
```

**Kunci teknik ini**: ID `color-box` tetap sama, dan CSS transition `all 0.5s` akan otomatis menganimasikan perubahan warna dan background.

### 2. Fade Out Before Removal

Untuk elemen yang akan dihapus, kita bisa fade out terlebih dahulu sebelum penghapusan final.

**Pattern:**

1. Kirim SSE/fragment dengan `opacity: 0` dan `transition`
2. Tunggu durasi transition
3. Kirim event untuk hapus elemen

**Contoh implementasi:**

```js
app.delete("/items/:id", (req, res) => {
  const id = req.params.id;

  // Step 1: Fade out
  res.setHeader("Content-Type", "text/html");
  res.send(`
        <div 
            id="item-${id}" 
            style="opacity: 0; transition: opacity 0.3s ease-out;"
        >
            <!-- Content -->
        </div>
    `);

  // Step 2: Setelah 300ms, hapus dari array dan kirim update
  setTimeout(() => {
    // Hapus dari database
    items = items.filter((item) => item.id !== Number(id));

    // Kirim list baru tanpa item ini
    // (implementasi tergantung pattern Anda)
  }, 300);
});
```

### 3. Fade In On Addition

Sebaliknya, untuk elemen baru, mulai dengan `opacity: 0` dan transisi ke `opacity: 1`.

```html
<div
  id="new-item"
  style="opacity: 0; transition: opacity 0.5s ease-in;"
  data-on-load="setTimeout(() => { $el.style.opacity = '1'; }, 50)"
>
  Item baru yang fade in
</div>
```

## View Transitions API — Animasi Modern

**View Transitions API** adalah standar web modern yang memberikan animasi otomatis saat konten berubah, tanpa perlu menulis CSS animation kompleks.

### Fitur Utama View Transitions

**Browser default animations**: Crossfade otomatis antara state lama dan baru

**Custom animations**: Kontrol penuh dengan CSS untuk animasi spesifik

**SPA dan MPA support**: Bekerja di single-page dan multi-page apps

**Accessibility**: Tetap menjaga fokus dan reading position

### Dukungan Browser

- ✅ Chrome/Edge 111+ (Full support)
- ✅ Safari 18+ (Full support)
- ⚠️ Firefox (Belum didukung, sedang development)

### Menggunakan View Transitions di Datastar

Datastar secara otomatis mendukung View Transitions API dengan parameter `useViewTransition`.

**Contoh Praktis: Button State Transition**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>View Transitions - Datastar</title>
    <style>
      body {
        font-family: sans-serif;
        padding: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }

      #app {
        background: white;
        padding: 40px;
        border-radius: 12px;
        max-width: 600px;
        margin: 0 auto;
      }

      .status-container {
        margin: 30px 0;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
      }

      .status-pending {
        background: #fff3cd;
        color: #856404;
        view-transition-name: status-box;
      }

      .status-processing {
        background: #cfe2ff;
        color: #084298;
        view-transition-name: status-box;
      }

      .status-complete {
        background: #d4edda;
        color: #155724;
        view-transition-name: status-box;
      }

      /* Custom view transition animation */
      ::view-transition-old(status-box) {
        animation: slideOut 0.3s ease-out;
      }

      ::view-transition-new(status-box) {
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-100px);
          opacity: 0;
        }
      }

      @keyframes slideIn {
        from {
          transform: translateX(100px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      button {
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div id="app" data-signals='{ "status": "pending" }'>
      <h1>🎬 View Transitions Demo</h1>

      <div id="status-container">
        <!-- Content dari server -->
      </div>

      <button data-on-click="@get('/next-status')">
        Lanjut ke Status Berikutnya
      </button>
    </div>
  </body>
</html>
```

**Backend Node.js:**

```js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const statuses = {
  pending: {
    next: "processing",
    label: "⏳ Menunggu",
    class: "status-pending",
  },
  processing: {
    next: "complete",
    label: "⚙️ Sedang Diproses",
    class: "status-processing",
  },
  complete: { next: "pending", label: "✅ Selesai", class: "status-complete" },
};

app.get("/next-status", (req, res) => {
  // Get current status dari query atau default 'pending'
  const currentStatus = req.query.status || "pending";
  const nextStatus = statuses[currentStatus].next;
  const config = statuses[nextStatus];

  res.setHeader("Content-Type", "text/html");
  res.send(`
        <div id="status-container" class="status-container ${config.class}">
            <h2>${config.label}</h2>
            <p>Status saat ini: <strong>${nextStatus}</strong></p>
        </div>
    `);
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
```

**Cara kerja View Transitions:**

1. **`view-transition-name`**: Memberikan nama unik untuk elemen yang akan di-transisi
2. **`::view-transition-old()`**: Pseudo-element untuk state lama
3. **`::view-transition-new()`**: Pseudo-element untuk state baru
4. Browser otomatis membuat snapshot dan menganimasikan perubahan

## Optimistic UI — Instant Feedback

**Optimistic UI** adalah pattern di mana kita update UI secara instant sebelum server merespons, memberikan ilusi kecepatan.

### Konsep Optimistic UI

**Alur tanpa Optimistic UI:**

1. User klik "Like"
2. Kirim request ke server
3. Tunggu response (1-3 detik)
4. Update UI

**Alur dengan Optimistic UI:**

1. User klik "Like"
2. **Update UI instantly** (tombol jadi biru)
3. Kirim request ke server di background
4. Jika sukses: biarkan UI tetap
5. Jika error: **revert UI** ke state sebelumnya

### Implementasi Optimistic UI di Datastar

**Contoh: Like Button dengan Optimistic Update**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Optimistic UI - Datastar</title>
    <style>
      .post {
        background: white;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .like-btn {
        padding: 10px 20px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .like-btn.liked {
        background: #3498db;
        color: white;
        border-color: #3498db;
      }

      .like-btn:active {
        transform: scale(0.95);
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div
      data-signals='{
        "post": {
            "id": 1,
            "likes": 42,
            "isLiked": false
        },
        "optimisticLikes": 42,
        "optimisticIsLiked": false
    }'
    >
      <div class="post">
        <h2>Belajar Datastar dengan Node.js</h2>
        <p>Framework hypermedia modern untuk aplikasi web interaktif.</p>

        <button
          class="like-btn"
          data-class="liked:$optimisticIsLiked"
          data-on-click="
                    $optimisticIsLiked = !$optimisticIsLiked;
                    $optimisticLikes = $optimisticIsLiked ? $optimisticLikes + 1 : $optimisticLikes - 1;
                    @post('/like', { postId: $post.id, isLiked: $optimisticIsLiked })
                "
        >
          <span data-show="!$optimisticIsLiked">👍</span>
          <span data-show="$optimisticIsLiked">💙</span>
          <span data-text="$optimisticLikes"></span>
        </button>
      </div>
    </div>
  </body>
</html>
```

**Backend Node.js:**

```js
app.post("/like", (req, res) => {
  const { postId, isLiked } = req.body;

  // Simulasi delay network
  setTimeout(() => {
    // Simulasi error 20% chance
    if (Math.random() < 0.2) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: "Network error",
        // Revert optimistic state
        optimisticIsLiked: !isLiked,
        optimisticLikes: isLiked ? 41 : 43,
      });
    }

    // Sukses - update database
    // Dalam real app, simpan ke DB di sini

    // Confirm optimistic state
    res.setHeader("Content-Type", "application/json");
    res.json({
      post: {
        id: postId,
        likes: isLiked ? 43 : 41,
        isLiked: isLiked,
      },
    });
  }, 1000);
});
```

**Penjelasan:**

1. **Instant update**: Saat klik, `$optimisticIsLiked` dan `$optimisticLikes` langsung berubah
2. **Background request**: `@post()` berjalan di background
3. **Success**: Server confirm state baru dengan patch sinyal
4. **Error**: Server kirim patch untuk revert ke state lama

## Loading States yang Elegan

### Skeleton Screens

Skeleton screen memberikan placeholder yang mirip konten final, mengurangi perceived loading time.

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <style>
      .skeleton {
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
      }

      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .skeleton-text {
        height: 16px;
        margin-bottom: 8px;
      }

      .skeleton-title {
        height: 24px;
        width: 60%;
        margin-bottom: 12px;
      }

      .skeleton-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div data-signals='{ "isLoading": true }'>
      <button data-on-click="$isLoading = true; @get('/load-content')">
        Load Content
      </button>

      <!-- Skeleton Loading -->
      <div id="content" data-show="$isLoading">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 80%;"></div>
      </div>

      <!-- Real Content -->
      <div id="real-content" data-show="!$isLoading">
        <!-- Content dari server -->
      </div>
    </div>
  </body>
</html>
```

**Backend:**

```js
app.get("/load-content", (req, res) => {
  // Simulasi delay
  setTimeout(() => {
    res.setHeader("Content-Type", "application/json");
    res.json({
      isLoading: false,
      content: "<div>Real content here</div>",
    });
  }, 2000);
});
```

## Tabel Ringkasan Teknik Animasi

| Teknik               | Use Case                          | Kompleksitas | Browser Support |
| :------------------- | :-------------------------------- | :----------- | :-------------- |
| **CSS Transitions**  | Perubahan sederhana (color, size) | Rendah       | Universal       |
| **Stable IDs**       | Morph smooth tanpa code           | Rendah       | Universal       |
| **Fade In/Out**      | Tambah/hapus elemen               | Rendah       | Universal       |
| **View Transitions** | Animasi kompleks otomatis         | Menengah     | Chrome, Safari  |
| **Optimistic UI**    | Instant feedback untuk actions    | Menengah     | Universal       |
| **Skeleton Screens** | Loading state yang natural        | Rendah       | Universal       |

## Best Practices Animasi

**Gunakan durasi yang tepat**: 200-400ms untuk transisi cepat, 500-800ms untuk animasi kompleks

**Easing natural**: `ease-out` untuk entrance, `ease-in` untuk exit, `ease-in-out` untuk loop

**Reduce motion**: Respect user preference dengan `@media (prefers-reduced-motion)`

**Performance**: Gunakan `transform` dan `opacity` untuk animasi, hindari animasi `width`, `height`, `top`, `left`

**Progressive enhancement**: Aplikasi harus tetap berfungsi tanpa animasi

## Kesimpulan Sesi 6

Dengan menguasai teknik animasi ini, aplikasi Datastar Anda akan terasa lebih **responsif**, **modern**, dan **professional**. Kombinasi CSS Transitions, View Transitions API, dan Optimistic UI memberikan pengalaman pengguna yang setara dengan aplikasi SPA modern—tanpa kompleksitas framework berat.

Di **Sesi 7**, kita akan fokus pada **file upload** dengan progress tracking dan preview, melengkapi toolkit Anda untuk aplikasi productionn-ready!
