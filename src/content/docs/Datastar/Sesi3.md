---
title: Mendorong Interaksi dengan Aksi Backend dan Fetch Requests
---

Dengan pemahaman yang kuat tentang cara mengelola state di frontend, langkah logis berikutnya adalah mempelajari cara memicu perubahan di server. Datastar unggul dalam menjembatani kesenjangan antara interaksi pengguna dan pemrosesan di backend, memungkinkan pembaruan **deklaratif yang dikendalikan oleh server**.

## Pengenalan Aksi (Actions)

Alat utama untuk berinteraksi dengan backend adalah fungsi **Action** dari Datastar, seperti `@get()`, `@post()`, `@put()`, dan `@delete()`. Fungsi-fungsi ini diawali dengan `@` untuk menandakan bahwa mereka adalah aksi aman yang dieksekusi di dalam _sandbox_ menggunakan Fetch API di sisi klien. Mereka biasanya dipasang pada atribut `data-on-*` untuk merespons aksi pengguna.

**Contoh deklarasi aksi:**

```html
<!-- GET request -->
<button data-on-click="@get('/api/items')">Muat Item</button>

<!-- POST request dengan data -->
<button data-on-click="@post('/save-draft', { text: $editorContent })">
  Simpan Draf
</button>

<!-- PUT request dengan ID -->
<button data-on-click="@put('/update/' + $itemId, { name: $newName })">
  Update
</button>

<!-- DELETE request -->
<button data-on-click="@delete('/items/' + $itemId)">Hapus</button>
```

## Mengirim Sinyal dengan Aksi

Secara default, Datastar akan mengirimkan **semua sinyal** yang ada di halaman ke backend bersama dengan aksi.

- Untuk permintaan `GET`, sinyal-sinyal tersebut akan menjadi _query string_ di URL
- Untuk metode lain (seperti `POST`, `PUT`, `DELETE`), mereka akan dikirim dalam _body_ permintaan sebagai JSON

Ini memastikan server selalu memiliki akses ke state sisi klien yang diperlukan untuk membuat keputusan yang tepat.

**Contoh dengan sinyal:**

```html
<div data-signals='{ "userId": 42, "filter": "active" }'>
  <!-- GET akan mengirim: /api/users?userId=42&filter=active -->
  <button data-on-click="@get('/api/users')">Tampilkan Pengguna</button>

  <!-- POST akan mengirim body: { "userId": 42, "filter": "active", "action": "archive" } -->
  <button data-on-click="@post('/api/action', { action: 'archive' })">
    Arsipkan
  </button>
</div>
```

## Penanganan Form dengan `form: true`

Penanganan form adalah kasus penggunaan umum yang ditangani Datastar dengan elegan. Ada mode khusus yaitu `form: true` untuk mengirimkan formulir dengan cara tradisional menggunakan multipart-encoded.

Ketika sebuah aksi dikonfigurasi dengan `form: true`, Datastar akan:

1. Mencari elemen `<form>` terdekat
2. Mengambil datanya
3. Mengirimkannya sebagai _multipart-encoded_
4. **Tidak mengirim sinyal reaktif** bersama permintaan

Ini ideal untuk skenario di mana Anda ingin mengunggah file atau mempertahankan alur pengiriman form konvensional.

**Contoh:**

```html
<form data-on-submit.prevent="@post('/upload', {}, { form: true })">
  <input type="text" name="title" placeholder="Judul" />
  <input type="file" name="image" accept="image/*" />
  <button type="submit">Unggah</button>
</form>
```

## Merespons dari Server: Content-Type Matters

Setelah permintaan dikirim, server dapat merespons dengan beberapa cara. **Perilaku di sisi klien ditentukan oleh header `Content-Type` dari respons server.**

### Response Type 1: `text/html` — Fragment

Respons dianggap sebagai **Fragment**. Datastar akan menggabungkan HTML ini ke dalam DOM, menargetkan elemen berdasarkan ID mereka.

Gunakan untuk: mengganti daftar, menyisipkan elemen baru, menampilkan dialog modal.

```html
<!-- Server mengirim fragmen ini -->
<ul id="item-list">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

### Response Type 2: `application/json` — Patch Sinyal

Respons diinterpretasikan sebagai **patch** untuk penyimpanan sinyal di sisi klien. Payload JSON akan memperbarui nilai-nilai sinyal yang ada.

Contoh: mengirim `{ "count": 10, "status": "ready" }` akan mengubah nilai sinyal `$count` dan `$status` di klien.

Gunakan untuk: memperbarui state aplikasi, reset form, menampilkan pesan validasi.

```js
// Server mengirim patch sinyal
{
  "items": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "newItemName": "",
  "isLoading": false
}
```

### Response Type 3: `text/event-stream` — Server-Sent Events (SSE)

Ini menandakan dimulainya koneksi satu arah yang persisten menggunakan **Server-Sent Events**. Klien akan membuka koneksi ke URL ini, memungkinkan server untuk mendorong pembaruan ke klien kapan saja tanpa klien perlu bertanya (polling).

Ini akan dibahas lebih detail di **Sesi 4**.

### Response Type 4: `text/javascript` — JavaScript

Server dapat mengirim kode JavaScript yang akan dijalankan oleh Datastar di lingkup global. Metode ini kuat tetapi jarang digunakan.

## Event `datastar-fetch`

Setiap aksi _fetch_ di Datastar akan memancarkan event `datastar-fetch`, yang memungkinkan Anda untuk mengimplementasikan indikator loading global, notifikasi, atau analitik.

## Tabel Ringkasan Aksi Datastar

| Aksi        | HTTP Method | Kegunaan                      | Contoh                       |
| :---------- | :---------- | :---------------------------- | :--------------------------- |
| `@get()`    | GET         | Mengambil data dari server    | @get('/api/items')           |
| `@post()`   | POST        | Membuat resource baru         | @post('/api/items')          |
| `@put()`    | PUT         | Memperbarui resource yang ada | @put('/api/items/' + $id)    |
| `@delete()` | DELETE      | Menghapus resource            | @delete('/api/items/' + $id) |

## Contoh Praktis: Todo App dengan CRUD Lengkap

Mari kita bangun aplikasi Todo yang menunjukkan semua operasi CRUD (Create, Read, Update, Delete) dengan Datastar dan Node.js.

**File: `index.html` (Frontend)**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Todo App - Datastar</title>
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
        max-width: 700px;
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
        font-size: 32px;
      }

      .add-todo {
        display: flex;
        gap: 10px;
        margin-bottom: 25px;
      }

      .add-todo input {
        flex: 1;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.3s;
      }

      .add-todo input:focus {
        outline: none;
        border-color: #667eea;
      }

      .add-todo button {
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .add-todo button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
      }

      #todo-list {
        list-style: none;
      }

      .todo-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 8px;
        margin-bottom: 10px;
        transition: all 0.3s;
      }

      .todo-item:hover {
        background: #f0f0f0;
      }

      .todo-item.completed .todo-text {
        text-decoration: line-through;
        color: #999;
      }

      .todo-checkbox {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #667eea;
      }

      .todo-text {
        flex: 1;
        color: #333;
        font-size: 16px;
      }

      .todo-actions {
        display: flex;
        gap: 8px;
      }

      .btn-small {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-edit {
        background: #3498db;
        color: white;
      }

      .btn-edit:hover {
        background: #2980b9;
      }

      .btn-delete {
        background: #e74c3c;
        color: white;
      }

      .btn-delete:hover {
        background: #c0392b;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #999;
      }

      .empty-state p {
        font-size: 18px;
        margin-bottom: 10px;
      }

      .stats {
        display: flex;
        justify-content: space-around;
        margin-top: 25px;
        padding-top: 25px;
        border-top: 2px solid #eee;
      }

      .stat {
        text-align: center;
      }

      .stat-number {
        font-size: 28px;
        font-weight: bold;
        color: #667eea;
      }

      .stat-label {
        color: #999;
        font-size: 12px;
        margin-top: 5px;
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div class="container">
      <div
        id="app"
        data-signals='{
            "todos": [],
            "newTodoText": "",
            "isLoading": false,
            "totalTodos": 0,
            "completedTodos": 0
        }'
      >
        <h1>📝 Todo App</h1>

        <!-- Form Tambah Todo -->
        <div class="add-todo">
          <input
            type="text"
            data-bind-value="$newTodoText"
            placeholder="Tambahkan todo baru..."
            data-on-keyup.enter="@post('/todos')"
          />
          <button
            data-on-click="@post('/todos')"
            data-attr-disabled="$isLoading"
          >
            <span data-show="!$isLoading">Tambah</span>
            <span data-show="$isLoading">Menambah...</span>
          </button>
        </div>

        <!-- Daftar Todo -->
        <div id="todo-list-container">
          <ul id="todo-list">
            <!-- Todo items akan dirender oleh server -->
          </ul>
        </div>

        <!-- Empty State -->
        <div class="empty-state" data-show="$todos.length === 0">
          <p>Belum ada todo. Mulai tambahkan todo baru! 🚀</p>
        </div>

        <!-- Statistik -->
        <div class="stats" data-show="$todos.length > 0">
          <div class="stat">
            <div class="stat-number" data-text="$totalTodos"></div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat">
            <div class="stat-number" data-text="$completedTodos"></div>
            <div class="stat-label">Selesai</div>
          </div>
          <div class="stat">
            <div
              class="stat-number"
              data-text="$totalTodos - $completedTodos"
            ></div>
            <div class="stat-label">Sisa</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
```

**Penjelasan Frontend:**

1. **`data-signals`**: Mendeklarasikan state todo app termasuk daftar todos, input baru, status loading, dan statistik.

2. **`data-bind-value="$newTodoText"`**: Binding dua arah antara input dan sinyal untuk text todo baru.

3. **`data-on-keyup.enter="@post('/todos')"`**: Mengirim todo ketika user menekan Enter.

4. **`@post('/todos')`**: Mengirim POST request ke endpoint `/todos` untuk membuat todo baru. Datastar akan otomatis mengirim `{ newTodoText: "...", ...otherSignals }`.

5. **`data-show="$todos.length === 0"`**: Menampilkan pesan kosong ketika tidak ada todo.

6. **Statistik**: Menampilkan total, selesai, dan sisa todo menggunakan expressions.

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

// Simulasi database: array todo
let todos = [
  { id: 1, text: "Belajar Datastar", completed: false },
  { id: 2, text: "Membuat aplikasi CRUD", completed: true },
];
let nextId = 3;

// Fungsi helper untuk render list todo sebagai HTML fragmen
function renderTodoList(todos) {
  const items = todos
    .map(
      (todo) => `
    <li class="todo-item${todo.completed ? " completed" : ""}">
      <input 
        type="checkbox" 
        class="todo-checkbox"
        ${todo.completed ? "checked" : ""}
        data-on-change="@put('/todos/${todo.id}/toggle')"
      >
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button class="btn-small btn-edit" data-on-click="@get('/todos/${todo.id}/edit')">
          Edit
        </button>
        <button class="btn-small btn-delete" data-on-click="@delete('/todos/${todo.id}')">
          Hapus
        </button>
      </div>
    </li>
  `
    )
    .join("");

  return items;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// GET /todos - Mengambil daftar todo awal
app.get("/todos", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <ul id="todo-list">
      ${renderTodoList(todos)}
    </ul>
  `);
});

// POST /todos - Membuat todo baru
app.post("/todos", (req, res) => {
  const { newTodoText } = req.body || {};

  if (!newTodoText || newTodoText.trim().length === 0) {
    res.setHeader("Content-Type", "application/json");
    return res.json({ error: "Teks todo tidak boleh kosong" });
  }

  const newTodo = {
    id: nextId++,
    text: newTodoText.trim(),
    completed: false,
  };
  todos.push(newTodo);

  // Hitung statistik
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;

  res.setHeader("Content-Type", "application/json");
  res.json({
    todos,
    newTodoText: "", // Reset input
    totalTodos,
    completedTodos,
  });
});

// PUT /todos/:id/toggle - Toggle status completed
app.put("/todos/:id/toggle", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    res.status(404).json({ error: "Todo tidak ditemukan" });
    return;
  }

  todo.completed = !todo.completed;

  // Hitung statistik
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;

  res.setHeader("Content-Type", "application/json");
  res.json({
    todos,
    totalTodos,
    completedTodos,
  });
});

// DELETE /todos/:id - Menghapus todo
app.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Todo tidak ditemukan" });
    return;
  }

  todos.splice(index, 1);

  // Hitung statistik
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;

  res.setHeader("Content-Type", "application/json");
  res.json({
    todos,
    totalTodos,
    completedTodos,
  });
});

// GET /todos/:id/edit - Placeholder untuk edit (bisa di extend)
app.get("/todos/:id/edit", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    res.status(404).json({ error: "Todo tidak ditemukan" });
    return;
  }

  res.setHeader("Content-Type", "application/json");
  res.json({
    editingId: id,
    editingText: todo.text,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log("Todo App siap digunakan!");
});
```

**Penjelasan Backend:**

1. **`app.post('/todos')`**: Menerima todo baru dari klien, memvalidasi, menambahkan ke daftar, lalu mengembalikan **patch sinyal** dengan:
   - Daftar todos yang diperbarui
   - Input reset (`newTodoText: ''`)
   - Statistik diperbarui

2. **`app.put('/todos/:id/toggle')`**: Toggle status completed dan mengembalikan patch sinyal dengan daftar dan statistik yang diperbarui.

3. **`app.delete('/todos/:id')`**: Menghapus todo dan mengembalikan patch sinyal.

4. **`renderTodoList()`**: Fungsi helper yang menghasilkan HTML fragmen untuk render ulang daftar (untuk GET `/todos` awal).

**Alur Lengkap Aplikasi:**

1. **Halaman dimuat**: Frontend menampilkan todo list dari server.
2. **User mengetik dan submit**: Klien mengirim POST `/todos` dengan `{ newTodoText: "Belajar Express" }`.
3. **Server memproses**: Validasi, tambah todo baru, hitung statistik, kembalikan patch sinyal JSON.
4. **Datastar memperbarui**: Sinyal `$todos`, `$newTodoText`, `$totalTodos`, `$completedTodos` diperbarui.
5. **UI bereaksi**: Daftar diperbarui, input direset, statistik ditampilkan.
6. **User toggle/hapus**: Aksi lain (toggle, delete) bekerja dengan pola yang sama.

**Menjalankan Aplikasi:**

```bash
node server.js
```

Kemudian buka `http://localhost:3000` dan mulai tambah, selesaikan, dan hapus todo!

## Konsep Penting yang Dipelajari di Sesi 3

**Aksi Deklaratif**: Gunakan `@get()`, `@post()`, `@put()`, `@delete()` langsung di HTML tanpa JavaScript imperatif.

**Sinyal Otomatis**: Semua sinyal dikirim ke server secara otomatis, sehingga backend selalu punya state klien.

**Content-Type Driven**: Respons server dapat berupa `text/html` (fragmen), `application/json` (patch sinyal), atau `text/event-stream` (SSE).

**Fragment Morphing**: Fragment HTML dari server secara cerdas digabungkan ke DOM berdasarkan ID elemen.

**Patch Sinyal**: Respons JSON memperbarui sinyal klien, sehingga UI bereaksi otomatis.

Di **Sesi 4**, Anda akan mempelajari cara membuat aplikasi dengan **pembaruan real-time** menggunakan Server-Sent Events (SSE).
