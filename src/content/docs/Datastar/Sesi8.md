---
title: Performance Optimization dan Debugging
---

Setelah membangun aplikasi dengan fitur lengkap, saatnya memastikan aplikasi berjalan dengan **optimal** dan mudah di-**debug**. Sesi ini membahas teknik optimasi performa, pencegahan memory leak, dan tools untuk monitoring aplikasi Datastar di production.

## Pengantar: Mengapa Performance Penting?

Performance bukan hanya soal kecepatan—ia mempengaruhi bisnis secara langsung:

- **Conversion rate**: Setiap 100ms delay menurunkan konversi 1%
- **SEO ranking**: Google Core Web Vitals adalah faktor ranking
- **User experience**: 53% user meninggalkan situs yang load >3 detik
- **Resource cost**: Server dan bandwidth yang efisien = cost lebih rendah

Google menetapkan threshold strict untuk Core Web Vitals:

- **LCP** (Largest Contentful Paint): < 2.5 detik
- **FID/INP** (First Input Delay/Interaction to Next Paint): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## Optimasi Sinyal: Mengurangi Overhead

### 1. Signal Filtering untuk Efisiensi

Secara default, Datastar mengirim **semua sinyal** ke backend. Untuk request yang sering terjadi (seperti search), ini bisa menjadi wasteful. Gunakan **signal filtering** untuk hanya kirim data yang diperlukan.

**Contoh: Search dengan filter sinyal**

```html
<div
  data-signals='{
    "searchTerm": "",
    "user": { "id": 123, "name": "Alice" },
    "token": "secret123",
    "preferences": { "theme": "dark" }
}'
>
  <input
    type="text"
    data-bind-value="$searchTerm"
    data-on-input__debounce.300ms="@get('/search', {}, { 
            filterSignals: { 
                include: /^searchTerm$/, 
                exclude: /token|preferences/ 
            }
        })"
  />
</div>
```

**Backend hanya menerima:**

```json
{ "searchTerm": "datastar" }
```

**Bukan:**

```json
{
  "searchTerm": "datastar",
  "user": { "id": 123, "name": "Alice" },
  "token": "secret123",
  "preferences": { "theme": "dark" }
}
```

### 2. Batch Signal Updates

Untuk update banyak sinyal sekaligus, gunakan satu patch signal daripada multiple patches.

**❌ Tidak efisien:**

```js
app.post("/update", (req, res) => {
  // 3 responses terpisah
  res.json({ name: "Alice" });
  res.json({ email: "alice@example.com" });
  res.json({ status: "active" });
});
```

**✅ Efisien:**

```js
app.post("/update", (req, res) => {
  // 1 response dengan semua updates
  res.json({
    name: "Alice",
    email: "alice@example.com",
    status: "active",
  });
});
```

### 3. Signal Wildcards untuk Batch Operations

Untuk operasi bulk, gunakan wildcards daripada update individual:

```html
<!-- Toggle semua todos sekaligus -->
<button data-on-click="@post('/toggle-all')">Toggle All</button>
```

**Backend:**

```js
app.post("/toggle-all", (req, res) => {
  const { todos } = req.body;

  // Update semua todos
  const updatedTodos = todos.map((todo) => ({
    ...todo,
    completed: !todo.completed,
  }));

  res.json({ todos: updatedTodos });
});
```

## Debounce dan Throttle: Kontrol Frekuensi Request

### Debounce — Tunggu Sampai User Selesai

**Debounce** menunda eksekusi sampai user berhenti berinteraksi untuk durasi tertentu. Perfect untuk search, autocomplete, validasi form.

```html
<!-- Execute 300ms setelah user berhenti mengetik -->
<input
  data-bind-value="$searchTerm"
  data-on-input__debounce.300ms="@get('/search')"
/>
```

**Visualization:**

```
User ketik: a...b...c...d [STOP]
           0ms  50ms 100ms 150ms
Request:                         [300ms] → Execute
```

### Throttle — Batasi Frekuensi Maksimal

**Throttle** membatasi eksekusi maksimal sekali per interval. Perfect untuk scroll events, resize, mouse move.

```html
<!-- Execute maksimal 1x per 500ms -->
<div data-on-scroll__throttle.500ms="@get('/load-more')">
  Infinite scroll content
</div>
```

**Visualization:**

```
User scroll: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
Time:        0ms     500ms    1000ms
Requests:    [req1]  [req2]   [req3]
```

### Tabel Perbandingan Debounce vs Throttle

| Teknik       | Kapan Execute            | Use Case                       |
| :----------- | :----------------------- | :----------------------------- |
| **Debounce** | Setelah user berhenti    | Search, autocomplete, validasi |
| **Throttle** | Maksimal 1x per interval | Scroll, resize, mouse tracking |

## Memory Leak Prevention

Memory leak adalah masalah serius di aplikasi SPA/long-lived pages. Datastar memiliki built-in protections, tapi kita tetap perlu aware.

### 1. SSE Auto-Cancellation

Datastar otomatis **cancel** SSE connections lama saat connection baru dimulai pada elemen yang sama, mencegah memory leak.

```html
<!-- Klik button kedua akan auto-cancel stream pertama -->
<button data-on-click="@get('/stream-1')">Stream 1</button>
<button data-on-click="@get('/stream-2')">Stream 2</button>
```

**Tanpa auto-cancellation:**

- User klik Stream 1 → connection dibuka
- User klik Stream 2 → connection baru dibuka
- **Stream 1 masih terbuka** → memory leak

**Dengan auto-cancellation:**

- User klik Stream 1 → connection dibuka
- User klik Stream 2 → **Stream 1 otomatis ditutup**, connection baru dibuka
- No leak ✅

### 2. Cleanup Event Listeners di Backend

Pastikan cleanup interval/timer saat SSE connection ditutup:

**❌ Memory leak:**

```js
app.get("/stream", (req, res) => {
  const interval = setInterval(() => {
    sendData();
  }, 1000);

  // Interval tidak pernah dibersihkan!
});
```

**✅ Proper cleanup:**

```js
app.get("/stream", (req, res) => {
  const interval = setInterval(() => {
    sendData();
  }, 1000);

  // Cleanup saat client disconnect
  req.on("close", () => {
    clearInterval(interval);
    console.log("Connection closed, interval cleared");
  });
});
```

### 3. Deteksi Memory Leak dengan MemLab

**MemLab** adalah tool open-source dari Meta untuk deteksi memory leak secara otomatis.

**Install MemLab:**

```bash
npm install -g memlab
```

**Buat test scenario (`scenario.js`):**

```js
function url() {
  return "http://localhost:3000";
}

async function action(page) {
  // Navigasi ke halaman target
  await page.click("#upload-button");
  await page.waitForSelector("#file-list");
}

async function back(page) {
  // Kembali ke state awal
  await page.click("#back-button");
}

module.exports = { action, back, url };
```

**Run MemLab:**

```bash
memlab run --scenario scenario.js
```

**Output:**

```
Found 3 potential memory leaks:
1. Detached DOM node: <div id="upload-preview">
2. EventListener not removed: 'dragover' on #dropzone
3. Interval timer not cleared: setInterval() at line 42
```

## Chrome DevTools untuk Performance Audit

Chrome DevTools adalah tool paling powerful untuk analisis performa real-time.

### Performance Tab — Profiling Runtime

**Cara menggunakan:**

1. Buka DevTools: `Ctrl+Shift+I` (Windows) atau `Cmd+Option+I` (Mac)
2. Pilih tab **Performance**
3. Klik **Record** (⏺️)
4. Lakukan interaksi di aplikasi (klik, scroll, dll)
5. Klik **Stop**
6. Analisis hasil

**Metrics yang ditampilkan:**

- **LCP** (Largest Contentful Paint)
- **FID/INP** (First Input Delay / Interaction to Next Paint)
- **CLS** (Cumulative Layout Shift)
- **Long Tasks**: Task >50ms yang block main thread
- **Network Requests**: Timeline loading assets

**Contoh analisis:**

```
Timeline:
0ms     [HTML parse]
100ms   [CSS load]
500ms   [JS execute] ← LONG TASK (200ms)
700ms   [Render]
900ms   [LCP] ✅ < 2.5s
```

### Network Tab — Identify Bottlenecks

**Filters yang berguna:**

- **XHR/Fetch**: Filter hanya API requests
- **JS/CSS**: Filter resource tertentu
- **Size**: Sort by file size untuk find bloat

**Red flags:**

- Request size >1MB untuk assets
- Waterfall requests (loading sequentially)
- Slow TTFB (Time To First Byte) >600ms

### Lighthouse — Automated Audit

**Run Lighthouse:**

1. Buka DevTools
2. Tab **Lighthouse**
3. Pilih **Desktop** atau **Mobile**
4. Klik **Analyze page load**

**Output:**

- Performance score (0-100)
- Opportunities: Specific suggestions (misal: "Eliminate render-blocking resources")
- Diagnostics: Issues detected (misal: "Avoid enormous network payloads")

## Code Splitting untuk Faster Load

Code splitting adalah teknik memecah JavaScript bundle menjadi chunks kecil yang di-load on-demand.

**Untuk Datastar (tanpa bundler):**

Datastar sendiri sudah sangat kecil (~300 baris), tapi untuk custom JS yang besar:

```html
<script>
  // Load heavy library hanya saat dibutuhkan
  document
    .getElementById("chart-button")
    .addEventListener("click", async () => {
      const { Chart } = await import("https://cdn.jsdelivr.net/npm/chart.js");
      renderChart(Chart);
    });
</script>
```

## Caching Strategy

### 1. HTTP Caching untuk Static Assets

**Backend Node.js dengan cache headers:**

```js
app.use(
  "/uploads",
  express.static("uploads", {
    maxAge: "1y", // Cache 1 tahun
    immutable: true,
  })
);

app.use(
  "/static",
  express.static("public", {
    maxAge: "1d", // Cache 1 hari
    etag: true,
  })
);
```

### 2. Datastar Signal Persistence

Untuk state yang perlu dipertahankan antar reload (seperti theme, cart):

```html
<div data-signals='{ "cart": [] }' data-persist="cart:local">
  <!-- cart akan otomatis disimpan ke localStorage -->
</div>
```

### 3. Service Worker untuk Offline Support

**Register service worker:**

```html
<script>
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW registered", reg))
      .catch((err) => console.error("SW registration failed", err));
  }
</script>
```

**`sw.js`:**

```js
const CACHE_NAME = "datastar-v1";
const urlsToCache = [
  "/",
  "/styles.css",
  "https://cdn.jsdelivr.net/npm/@datastar/core@latest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

## Monitoring di Production

### 1. Custom Performance Tracking

**Track fetch duration:**

```html
<script>
  document.addEventListener("datastar-fetch", (e) => {
    if (e.detail.type === "start") {
      e.detail.startTime = performance.now();
    }

    if (e.detail.type === "end") {
      const duration = performance.now() - e.detail.startTime;

      // Send ke analytics
      if (duration > 1000) {
        console.warn(`Slow request: ${e.detail.url} took ${duration}ms`);
        // Send to monitoring service
        fetch("/api/metrics", {
          method: "POST",
          body: JSON.stringify({
            url: e.detail.url,
            duration,
            timestamp: Date.now(),
          }),
        });
      }
    }
  });
</script>
```

### 2. Error Tracking

**Centralized error handler:**

```html
<script>
  // Global error handler
  window.addEventListener("error", (e) => {
    console.error("Global error:", e.error);

    // Send to error tracking service (Sentry, LogRocket, dll)
    fetch("/api/errors", {
      method: "POST",
      body: JSON.stringify({
        message: e.error.message,
        stack: e.error.stack,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    });
  });

  // Datastar-specific errors
  document.addEventListener("datastar-error", (e) => {
    console.error("Datastar error:", e.detail);
  });
</script>
```

## Performance Budget

Tetapkan **performance budget** dan enforce di CI/CD:

**`performance-budget.json`:**

```json
{
  "maxLoadTime": 2500,
  "maxBundleSize": 500000,
  "maxImageSize": 200000,
  "maxRequests": 50
}
```

**CI/CD check:**

```bash
# Jalankan Lighthouse CLI
lighthouse https://your-app.com --budget-path=performance-budget.json --view
```

## Tabel Ringkasan Optimization Techniques

| Teknik                 | Impact | Effort | Priority |
| :--------------------- | :----- | :----- | :------- |
| **Debounce input**     | Tinggi | Rendah | Tinggi   |
| **Signal filtering**   | Sedang | Rendah | Tinggi   |
| **SSE cleanup**        | Tinggi | Rendah | Tinggi   |
| **HTTP caching**       | Tinggi | Rendah | Tinggi   |
| **Code splitting**     | Sedang | Sedang | Sedang   |
| **Service worker**     | Tinggi | Tinggi | Sedang   |
| **MemLab testing**     | Tinggi | Sedang | Sedang   |
| **Performance budget** | Tinggi | Sedang | Tinggi   |

## Best Practices Summary

**Measure first**: Gunakan DevTools dan Lighthouse sebelum optimize

**Focus on quick wins**: Debounce, caching, cleanup = low effort, high impact

**Prevent regressions**: Setup performance budget di CI/CD

**Monitor production**: Track slow requests dan errors

**Test under stress**: Simulate slow network dan old devices

Di **Sesi 9**, kita akan fokus pada **security dan production best practices** untuk memastikan aplikasi Anda tidak hanya cepat, tapi juga aman!
