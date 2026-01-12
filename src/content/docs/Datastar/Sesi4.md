---
title: Mencapai Pengalaman Real-Time dengan Server-Sent Events (SSE)
---

Banyak aplikasi modern menuntut pembaruan **real-time**—seperti aplikasi obrolan, editor kolaboratif, atau dasbor live. Datastar mendukung kasus penggunaan ini secara native melalui **Server-Sent Events (SSE)**, sebuah teknologi yang memungkinkan server untuk "mendorong" pesan ke klien melalui satu koneksi HTTP yang berumur panjang.

## Pengenalan Server-Sent Events (SSE)

SSE adalah standar web yang memungkinkan server untuk mengirim pembaruan otomatis ke klien melalui koneksi HTTP tunggal yang tetap terbuka. Tidak seperti WebSocket yang menyediakan komunikasi dua arah, SSE adalah komunikasi **satu arah** dari server ke klien—yang sempurna untuk notifikasi, pembaruan data real-time, dan streaming event.

**Keuntungan SSE:**

- Menggunakan HTTP standar (tidak perlu protokol khusus seperti WebSocket)
- Koneksi otomatis dibuka kembali jika terputus
- Dukungan browser yang luas
- Lebih sederhana untuk diimplementasikan dibandingkan WebSocket
- Cocok untuk kasus satu arah (server → klien)

## Memulai Koneksi SSE

Untuk memulai koneksi SSE, backend hanya perlu mengembalikan respons dengan header `Content-Type` berupa `text/event-stream`. Library Datastar di sisi klien akan secara otomatis mendeteksi tipe konten ini dan membuka koneksi `EventSource` ke URL tersebut. Koneksi ini akan tetap terbuka, memungkinkan komunikasi berkelanjutan dari server ke klien.

**Header yang diperlukan:**

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

## Dua Jenis Event Utama di Datastar

Kekuatan sebenarnya dari SSE di Datastar terletak pada pesan terstruktur yang dapat dibawanya. Datastar mendefinisikan dua jenis event utama untuk framework-nya:

### 1. `datastar-patch-signals` — Memperbarui State Reaktif

Event ini digunakan untuk memperbarui penyimpanan sinyal di sisi klien. Isi pesannya adalah objek JSON yang mewakili _patch_ yang akan diterapkan ke sinyal.

**Format event:**

```
event: datastar-patch-signals
data: {"serverTime": "14:23:15", "updateCount": 42}

```

Ketika klien menerima event ini, sinyal `$serverTime` dan `$updateCount` akan diperbarui secara otomatis, dan semua elemen UI yang terikat pada sinyal tersebut akan dirender ulang.

**Fitur penting:**

- **`onlyIfMissing`**: Jika diatur ke `true`, hanya akan menerapkan patch untuk sinyal yang belum ada di klien
- Mengirim sinyal dengan nilai `null` akan menghapusnya dari penyimpanan klien

### 2. `datastar-patch-elements` — Memperbarui DOM

Event ini digunakan untuk memperbarui DOM secara langsung dengan fragmen HTML. Isi pesannya berisi fragmen HTML yang akan digabungkan, bersama dengan parameter opsional yang mengontrol perilaku _morphing_.

**Parameter penting:**

- **`selector`**: Selektor CSS untuk menemukan elemen target
- **`mode`**: Mendefinisikan bagaimana fragmen digabungkan (`outer`, `inner`, `replace`, `prepend`, `append`, `before`, `after`, `remove`)
- **`useViewTransition`**: Jika `true`, patch akan dianimasikan menggunakan View Transitions API

**Contoh kasus:** Aplikasi obrolan dapat menerima event `datastar-patch-elements` dengan fragmen pesan baru dalam mode `append` untuk menambahkan pesan ke bagian bawah percakapan.

## Tabel Ringkasan Event SSE

| Tipe Event                | Tujuan                                   | Contoh Kasus Penggunaan                               | Parameter Kunci                         |
| :------------------------ | :--------------------------------------- | :---------------------------------------------------- | :-------------------------------------- |
| `datastar-patch-signals`  | Memperbarui sinyal reaktif di klien      | Sinkronisasi posisi kursor, memperbarui skor game     | `onlyIfMissing`                         |
| `datastar-patch-elements` | Memperbarui DOM dengan fragmen HTML baru | Memperbarui daftar obrolan, menyegarkan widget dasbor | `selector`, `mode`, `useViewTransition` |

## Contoh Praktis 1: Jam Server Real-Time

Mari kita buat aplikasi sederhana yang menampilkan jam server yang diperbarui setiap detik menggunakan SSE.

**File: `index.html` (Frontend)**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Jam Real-Time - Datastar SSE</title>
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
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      #app {
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        text-align: center;
        min-width: 400px;
      }

      h1 {
        color: #333;
        margin-bottom: 20px;
        font-size: 24px;
      }

      .clock {
        font-size: 64px;
        font-weight: bold;
        color: #667eea;
        margin: 30px 0;
        font-family: "Courier New", monospace;
        letter-spacing: 4px;
      }

      .stats {
        display: flex;
        justify-content: space-around;
        margin: 30px 0;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;
      }

      .stat {
        text-align: center;
      }

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #667eea;
      }

      .stat-label {
        font-size: 12px;
        color: #999;
        margin-top: 5px;
      }

      button {
        padding: 12px 32px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        margin: 5px;
      }

      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .status {
        margin-top: 20px;
        padding: 10px;
        border-radius: 6px;
        font-size: 14px;
      }

      .status.connected {
        background: #d4edda;
        color: #155724;
      }

      .status.disconnected {
        background: #f8d7da;
        color: #721c24;
      }

      .status.idle {
        background: #fff3cd;
        color: #856404;
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div
      id="app"
      data-signals='{
        "serverTime": "00:00:00",
        "updateCount": 0,
        "isConnected": false,
        "startTime": ""
    }'
    >
      <h1>⏰ Jam Server Real-Time</h1>

      <div class="clock" data-text="$serverTime"></div>

      <div class="stats">
        <div class="stat">
          <div class="stat-value" data-text="$updateCount"></div>
          <div class="stat-label">Pembaruan</div>
        </div>
        <div class="stat">
          <div class="stat-value" data-text="$startTime"></div>
          <div class="stat-label">Mulai</div>
        </div>
      </div>

      <button
        data-on-click="@get('/start-sse')"
        data-attr-disabled="$isConnected"
      >
        <span data-show="!$isConnected">🚀 Mulai Streaming</span>
        <span data-show="$isConnected">✓ Sedang Terhubung</span>
      </button>

      <div
        class="status"
        data-class="connected:$isConnected, idle:!$isConnected"
      >
        <span data-show="$isConnected">🟢 Terhubung ke server</span>
        <span data-show="!$isConnected">⚪ Belum terhubung</span>
      </div>
    </div>
  </body>
</html>
```

**Penjelasan Frontend:**

1. **`data-signals`**: Mendeklarasikan state aplikasi termasuk waktu server, jumlah pembaruan, status koneksi.

2. **`data-text="$serverTime"`**: Menampilkan jam yang diperbarui real-time dari server.

3. **`data-on-click="@get('/start-sse')"`**: Memicu permintaan GET yang membuka koneksi SSE.

4. **`data-attr-disabled="$isConnected"`**: Menonaktifkan tombol ketika sudah terhubung.

5. **`data-class="connected:$isConnected"`**: Mengubah styling berdasarkan status koneksi.

**File: `server.js` (Backend Node.js/Express)**

```js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Endpoint SSE untuk streaming waktu real-time
app.get("/start-sse", (req, res) => {
  // Set header SSE yang diperlukan
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Fungsi helper untuk mengirim event SSE
  const sendSSE = (eventName, data) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Kirim patch sinyal awal
  const startTime = new Date().toLocaleTimeString("id-ID");
  sendSSE("datastar-patch-signals", {
    serverTime: startTime,
    updateCount: 1,
    isConnected: true,
    startTime: startTime,
  });

  // Setup interval untuk mengirim pembaruan setiap detik
  let count = 1;
  const interval = setInterval(() => {
    count++;
    const currentTime = new Date().toLocaleTimeString("id-ID");

    sendSSE("datastar-patch-signals", {
      serverTime: currentTime,
      updateCount: count,
    });
  }, 1000);

  // Cleanup ketika koneksi ditutup
  req.on("close", () => {
    clearInterval(interval);
    console.log("Klien memutuskan koneksi SSE");
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log("Buka browser dan klik tombol untuk memulai SSE!");
});
```

**Penjelasan Backend:**

1. **Header SSE**: Tiga header penting untuk membuka koneksi SSE yang valid.

2. **`sendSSE()` helper**: Fungsi untuk mengirim event dengan format SSE yang benar:
   - `event: nama-event\n`
   - `data: JSON.stringify(payload)\n\n`
   - **Penting**: Dua newline (`\n\n`) untuk menandai akhir event.

3. **Patch sinyal awal**: Mengirim data awal termasuk `isConnected: true` untuk mengubah UI.

4. **Interval**: `setInterval()` mengirim pembaruan setiap 1 detik dengan waktu dan counter baru.

5. **Cleanup**: Event `close` pada request untuk membersihkan interval ketika klien disconnect.

**Alur Lengkap:**

1. **User membuka halaman**: UI menampilkan status "Belum terhubung" dengan jam 00:00:00.
2. **User klik "Mulai Streaming"**: Datastar mengirim GET `/start-sse`.
3. **Server membuka koneksi SSE**: Header diatur, koneksi tetap terbuka.
4. **Server mengirim patch awal**: `isConnected: true`, tombol menjadi disabled, status berubah "Terhubung".
5. **Server streaming setiap detik**: Sinyal `$serverTime` dan `$updateCount` diperbarui otomatis.
6. **UI bereaksi real-time**: Jam berubah setiap detik, counter bertambah—tanpa reload.

## Contoh Praktis 2: Aplikasi Chat Real-Time

Mari kita tingkatkan dengan aplikasi chat sederhana yang mendemonstrasikan `datastar-patch-elements` untuk menambahkan pesan baru ke DOM.

**File: `chat.html` (Frontend)**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Chat Real-Time - Datastar SSE</title>
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
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      #app {
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        width: 100%;
        max-width: 600px;
        height: 600px;
        display: flex;
        flex-direction: column;
      }

      .chat-header {
        padding: 20px;
        border-bottom: 2px solid #eee;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
      }

      .chat-header h1 {
        font-size: 20px;
      }

      #messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f9f9f9;
      }

      .message {
        margin-bottom: 15px;
        padding: 12px 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .message-author {
        font-weight: 600;
        color: #667eea;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .message-text {
        color: #333;
        font-size: 14px;
      }

      .message-time {
        color: #999;
        font-size: 11px;
        margin-top: 4px;
      }

      .chat-input {
        padding: 20px;
        border-top: 2px solid #eee;
        display: flex;
        gap: 10px;
      }

      .chat-input input {
        flex: 1;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }

      .chat-input button {
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .chat-input button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div
      id="app"
      data-signals='{
        "username": "User",
        "messageText": "",
        "isConnected": false
    }'
    >
      <div class="chat-header">
        <h1>💬 Chat Real-Time</h1>
        <p style="font-size: 12px; margin-top: 5px;">
          <span data-show="!$isConnected">
            <button
              data-on-click="@get('/join-chat')"
              style="padding: 8px 16px; background: white; color: #667eea; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;"
            >
              Gabung Chat
            </button>
          </span>
          <span data-show="$isConnected">🟢 Terhubung</span>
        </p>
      </div>

      <div id="messages">
        <!-- Pesan akan ditambahkan di sini via SSE -->
      </div>

      <form class="chat-input" data-on-submit.prevent="@post('/send-message')">
        <input
          type="text"
          data-bind-value="$messageText"
          placeholder="Ketik pesan..."
          data-attr-disabled="!$isConnected"
        />
        <button type="submit" data-attr-disabled="!$isConnected">Kirim</button>
      </form>
    </div>
  </body>
</html>
```

**File: `server-chat.js` (Backend)**

```js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Simulasi penyimpanan pesan
const messages = [
  {
    id: 1,
    author: "System",
    text: "Selamat datang di chat room!",
    time: new Date().toLocaleTimeString("id-ID"),
  },
];
let nextId = 2;

// Daftar klien yang terhubung untuk broadcasting
const clients = new Set();

// Endpoint untuk join chat (membuka koneksi SSE)
app.get("/join-chat", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendSSE = (eventName, data) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Tambahkan klien ke daftar
  const client = { res, sendSSE };
  clients.add(client);

  // Kirim status connected
  sendSSE("datastar-patch-signals", { isConnected: true });

  // Kirim pesan-pesan yang sudah ada
  const messagesHTML = messages
    .map(
      (msg) => `
    <div class="message">
      <div class="message-author">${escapeHtml(msg.author)}</div>
      <div class="message-text">${escapeHtml(msg.text)}</div>
      <div class="message-time">${msg.time}</div>
    </div>
  `
    )
    .join("");

  sendSSE("datastar-patch-elements", {
    selector: "#messages",
    content: messagesHTML,
    merge: "inner",
  });

  // Cleanup ketika disconnect
  req.on("close", () => {
    clients.delete(client);
    console.log("Klien disconnect, total klien:", clients.size);
  });
});

// Endpoint untuk mengirim pesan
app.post("/send-message", (req, res) => {
  const { username, messageText } = req.body || {};

  if (!messageText || messageText.trim().length === 0) {
    res.setHeader("Content-Type", "application/json");
    return res.json({ error: "Pesan kosong" });
  }

  // Buat pesan baru
  const newMessage = {
    id: nextId++,
    author: username || "Anonymous",
    text: messageText.trim(),
    time: new Date().toLocaleTimeString("id-ID"),
  };
  messages.push(newMessage);

  // Broadcast pesan ke semua klien yang terhubung
  const messageHTML = `
    <div class="message">
      <div class="message-author">${escapeHtml(newMessage.author)}</div>
      <div class="message-text">${escapeHtml(newMessage.text)}</div>
      <div class="message-time">${newMessage.time}</div>
    </div>
  `;

  clients.forEach((client) => {
    client.sendSSE("datastar-patch-elements", {
      selector: "#messages",
      content: messageHTML,
      merge: "append", // Tambahkan di akhir
    });
  });

  // Reset input pengirim
  res.setHeader("Content-Type", "application/json");
  res.json({ messageText: "" });
});

function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chat server berjalan di http://localhost:${PORT}/chat.html`);
});
```

**Penjelasan Backend Chat:**

1. **`clients` Set**: Menyimpan semua koneksi SSE aktif untuk broadcasting.

2. **`/join-chat` endpoint**:
   - Membuka koneksi SSE
   - Mengirim `isConnected: true`
   - Mengirim history pesan dengan `datastar-patch-elements` dan `merge: 'inner'`

3. **`/send-message` endpoint**:
   - Menerima pesan dari klien
   - Broadcast ke semua klien dengan `datastar-patch-elements` dan `merge: 'append'`
   - Reset input pengirim

4. **Broadcasting**: Loop melalui semua klien dan kirim event SSE ke masing-masing.

**Alur Chat:**

1. User membuka halaman chat
2. User klik "Gabung Chat" → koneksi SSE dibuka
3. User menerima history pesan dan status "Terhubung"
4. User mengetik dan kirim pesan → POST `/send-message`
5. Server broadcast pesan ke **semua klien** via SSE
6. Semua user melihat pesan baru muncul real-time

## Konsep Penting yang Dipelajari di Sesi 4

**Server-Sent Events**: Koneksi HTTP persisten satu arah untuk streaming data dari server ke klien.

**`datastar-patch-signals`**: Memperbarui state reaktif di klien secara real-time.

**`datastar-patch-elements`**: Memperbarui DOM langsung dengan fragmen HTML, mendukung berbagai mode merge.

**Broadcasting**: Server dapat mengirim event ke banyak klien sekaligus untuk sinkronisasi real-time.

**Auto-reconnect**: Browser secara otomatis membuka kembali koneksi SSE yang terputus.

Di **Sesi 5**, Anda akan mempelajari integrasi lanjutan dan pola aplikasi praktis untuk membangun aplikasi yang lebih kompleks dengan Datastar.
