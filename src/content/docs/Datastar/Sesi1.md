---
title: 'Konsep Inti dan Arsitektur'
---

Selamat datang di perjalanan Anda mempelajari Datastar, sebuah framework ringan yang menata ulang pengembangan web dengan menggabungkan **server-side rendering** dengan interaktivitas di sisi klien.

Untuk membangun aplikasi yang kuat, penting untuk memahami filosofi inti dan cetak biru arsitekturnya.

## Pengantar: Filosofi Datastar

Datastar pada dasarnya adalah sebuah framework **hypermedia**. Artinya, ia menggunakan teknologi web standar seperti HTML dan HTTP sebagai media utama untuk komunikasi antara klien dan server.

Pendekatan ini memungkinkannya untuk mencapai perilaku reaktif tanpa memerlukan framework JavaScript sisi klien yang kompleks atau langkah-langkah build yang rumit, membuatnya mudah diakses dan diintegrasikan ke dalam sistem backend apa pun yang sudah ada.

Fondasi Datastar bertumpu pada tiga pilar utama yang saling berhubungan: **Actions (Aksi)**, **Signals (Sinyal)**, dan **Fragments (Fragmen)**.

Ketiganya diimplementasikan secara deklaratif menggunakan atribut `data-*` langsung di dalam HTML Anda, yang kemudian diproses oleh library Datastar yang berukuran kecil (~300 baris kode). Memahami ketiga pilar ini adalah langkah pertama untuk membuka kekuatan framework ini.

## Pilar 1: Actions (Aksi)

**Actions** adalah cara interaksi pengguna memicu pembaruan. Alih-alih menulis event listener secara imperatif di JavaScript, Anda mendeklarasikannya langsung di elemen HTML Anda.

Atribut aksi yang paling umum adalah `data-on-EVENT`, di mana `EVENT` mewakili sebuah peristiwa seperti `click`, `input`, atau `submit`.

Contohnya, data-on-click="@get('/endpoint')" memberitahu Datastar untuk mengirim permintaan HTTP GET ke endpoint yang ditentukan saat elemen tersebut diklik.

Aksi ini aman secara default. Setiap aksi yang diawali dengan `@` dieksekusi dalam lingkungan **sandbox** di klien, mencegah eksekusi JavaScript yang tidak disengaja dan memaksa pengembang untuk menggunakan metode aman yang telah ditentukan seperti `@get()`, `@post()`, `@put()`, `@delete()`, dan lainnya.

## Pilar 2: Fragments (Fragmen)

**Fragments** adalah potongan HTML **idempotent** (tidak peduli berapa kali dijalankan, hasilnya akan tetap sama) yang dikirim dari server untuk memperbarui DOM.

Ketika sebuah aksi selesai, server dapat mengembalikan sebuah fragmen HTML, biasanya dibungkus dalam sebuah kontainer dengan ID unik.

Datastar mengidentifikasi kontainer ini berdasarkan ID-nya dan secara cerdas menggabungkan konten baru ke dalam DOM yang ada.

Proses ini ditangani oleh **Idiomorph**, sebuah library yang melakukan strategi "morphing", hanya memperbarui bagian-bagian DOM yang berubah sambil mempertahankan state lokal, seperti nilai input dan fokus. Pembaruan selektif ini adalah fitur performa utama.

## Pilar 3: Signals (Sinyal)

**Signals** adalah variabel state reaktif yang ada di klien dan server, dan dijaga agar tetap sinkron secara otomatis. Mereka memungkinkan Anda untuk mendefinisikan state aplikasi yang dibagikan.

Di sisi klien, sinyal ditandai dengan awalan `$` (misalnya, `$searchQuery`) dan biasanya didefinisikan dalam atribut `data-signals` pada elemen HTML.

Contohnya:

```html
<div data-signals="{ searchTerm: '', isLoading: false }"></div>
```

Setiap ekspresi dalam atribut Datastar dapat merujuk sinyal-sinyal ini, dan setiap perubahan pada sinyal akan secara otomatis mengevaluasi ulang ekspresi yang bergantung padanya.

## Arsitektur Keseluruhan: Backend-Driven State

Seluruh arsitektur berputar di sekitar konsep **state yang dikendalikan oleh backend** (_backend-driven state_). Dalam framework sisi klien tradisional, state berada di memori klien.

Dengan Datastar, **server mempertahankan satu-satunya sumber kebenaran** (_single source of truth_) untuk state aplikasi.

Sinyal di sisi klien bertindak sebagai _cache_ atau representasi lokal dari state otoritatif ini.

Ketika pengguna berinteraksi dengan UI melalui sebuah aksi, klien mengirimkan informasi yang diperlukan ke server, yang kemudian memvalidasi aksi terhadap state penuh, memperbarui modelnya, dan mengirimkan kembali set instruksi minimal—baik itu fragmen DOM untuk dirender atau _patch_ ke penyimpanan sinyal—untuk menyinkronkan klien.

## Tabel Perbandingan: Tiga Primitif Inti

| Primitif     | Atribut Deklaratif                           | Tujuan                                       | Contoh                                     |
| :----------- | :------------------------------------------- | :------------------------------------------- | :----------------------------------------- |
| **Action**   | `data-on-click`, `data-on-input`             | Memicu permintaan HTTP ke backend            | data-on-click="@get('/users/'+$userId)"    |
| **Fragment** | Respons dengan `Content-Type: text/html`     | Mengirim potongan HTML parsial dari server   | Fragmen HTML dengan ID unik untuk morphing |
| **Signal**   | `data-signals`, `$signalName` dalam ekspresi | Memelihara state reaktif dan tersinkronisasi | data-signals='{ cartCount: 0 }'            |

## Contoh Praktis: Aplikasi Counter Sederhana

Mari kita lihat contoh sederhana yang menggambarkan ketiga primitif ini bekerja bersamaan. Anda akan membangun sebuah aplikasi counter yang menghitung jumlah klik tombol.

**Setup Proyek Node.js:**

Pertama, buat direktori proyek dan instalasi Express:

```bash
mkdir datastar-counter
cd datastar-counter
npm init -y
npm install express
```

**File: `index.html` (Frontend)**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Counter Datastar</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }
      #counter-container {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      p {
        font-size: 18px;
        color: #333;
        margin-bottom: 20px;
      }
      span {
        font-weight: bold;
        color: #667eea;
        font-size: 24px;
      }
      button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
      }
      button:active {
        transform: translateY(0);
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div id="counter-container" data-signals='{ "count": 0 }'>
      <p>
        Anda telah mengklik tombol sebanyak
        <span data-text="$count"></span> kali.
      </p>
      <button data-on-click="@post('/increment')">Klik untuk Tambah</button>
    </div>
  </body>
</html>
```

**Penjelasan HTML:**

1. **`<script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>`**: Memuat library Datastar dari CDN. Library ini secara otomatis mengaktifkan semua atribut `data-*`.

2. **`data-signals='{ "count": 0 }'`**: Mendeklarasikan state reaktif bernama `count` dengan nilai awal 0. State ini berlaku untuk seluruh elemen dan anak-anaknya.

3. **`data-text="$count"`**: Mengikat teks konten elemen `<span>` ke sinyal `$count`. Setiap kali `$count` berubah, teks akan otomatis diperbarui tanpa perlu refresh halaman.

4. **`data-on-click="@post('/increment')"`**: Mendefinisikan aksi yang dipicu saat tombol diklik. Aksi ini mengirim permintaan HTTP POST ke `/increment`, menyertakan semua sinyal (dalam hal ini `{ count: 0 }`) dalam body permintaan sebagai JSON.

**File: `server.js` (Backend Node.js/Express)**

```js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup untuk mendapatkan __dirname di ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Layani file static (index.html)
app.use(express.static(__dirname));

// Endpoint untuk menangani increment
app.post('/increment', (req, res) => {
  // req.body berisi sinyal dari klien: { count: 0 }
  const state = req.body || {};
  const currentCount = Number(state.count ?? 0);
  const newCount = currentCount + 1;

  // Set header Content-Type ke text/html agar Datastar tahu ini adalah fragmen
  res.setHeader('Content-Type', 'text/html');

  // Kirim fragmen HTML yang diperbarui dengan sinyal baru
  // ID harus sama dengan yang ada di klien agar Datastar bisa melakukan morphing
  res.send(`
    <div id="counter-container" data-signals='{ "count": ${newCount} }'>
      <p>Anda telah mengklik tombol sebanyak <span data-text="$count"></span> kali.</p>
      <button data-on-click="@post('/increment')">Klik untuk Tambah</button>
    </div>
  `);
});

// Reset counter
app.post('/reset', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <div id="counter-container" data-signals='{ "count": 0 }'>
      <p>Anda telah mengklik tombol sebanyak <span data-text="$count"></span> kali.</p>
      <button data-on-click="@post('/increment')">Klik untuk Tambah</button>
    </div>
  `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log('Buka http://localhost:3000 di browser Anda');
});
```

**Penjelasan Backend:**

1. **`app.use(express.json())`**: Middleware untuk mengurai body permintaan JSON. Ini penting agar sinyal dari klien dapat dibaca.

2. **`app.use(express.static(__dirname))`**: Melayani file static (seperti `index.html`) dari direktori root.

3. **`app.post('/increment')`**: Endpoint yang menangani permintaan POST saat tombol diklik.

   - Mengekstrak nilai `count` dari body (`req.body`), default ke 0 jika tidak ada.
   - Menaikkan nilai `count` sebesar 1.
   - Mengirimkan fragmen HTML dengan `Content-Type: text/html` yang berisi:
     - Sinyal yang diperbarui: data-signals='{ "count": 1 }'
     - ID elemen yang sama: `id="counter-container"` (penting agar Datastar tahu elemen mana yang diperbarui).

4. **`app.post('/reset')`**: Endpoint bonus untuk mereset counter kembali ke 0.

**Apa yang Terjadi (Alur Lengkap):**

1. **Pengguna membuka halaman**: Browser menampilkan HTML dengan counter = 0.
2. **Pengguna mengklik tombol**: Datastar mendeteksi event click pada elemen dengan `data-on-click="@post('/increment')`.
3. **Klien mengirim permintaan**: Datastar mengirim POST ke `/increment` dengan body `{ count: 0 }` (sinyal saat ini).
4. **Server memproses**: Backend menerima `{ count: 0 }`, menaikkan menjadi 1, dan mengirimkan fragmen HTML baru dengan `data-signals='{ "count": 1 }'`.
5. **Datastar melakukan morphing**: Library Datastar menerima fragmen HTML dan secara cerdas menggabungkannya ke DOM yang ada.
   - Sinyal `$count` diperbarui menjadi 1.
   - Elemen `<span>` yang terikat ke `$count` secara otomatis diperbarui menampilkan "1".
6. **UI bereaksi**: User melihat teks berubah dari "0 kali" menjadi "1 kali" tanpa refresh halaman.
7. **Prosesnya berulang** setiap kali tombol diklik.

**Menjalankan Aplikasi:**

```bash
node server.js
```

Kemudian buka browser ke `http://localhost:3000`. Klik tombol dan lihat counter berubah secara real-time.

## Konsep Kunci yang Dipelajari di Sesi 1

**Backend-Driven State**: Server adalah sumber kebenaran; klien hanya merender apa yang dikirim server.

**Deklaratif bukan Imperatif**: Alih-alih menulis JavaScript event listener, Anda mendeklarasikan interaksi langsung di HTML menggunakan atribut `data-*`.

**Morphing Cerdas**: Datastar hanya memperbarui bagian DOM yang berubah, mempertahankan state input lokal dan fokus, yang menghasilkan UX yang smooth.

**Sinyal Reaktif**: Sinyal memungkinkan Anda untuk mengikat state ke UI dengan cara yang otomatis—perubahan sinyal langsung tercermin di template.

**HTTP sebagai Media**: Framework ini memanfaatkan standar web (HTML + HTTP) tanpa perlu framework JavaScript yang kompleks di sisi klien.

Sesi 1 telah menetapkan fondasi. Di sesi berikutnya, Anda akan mendalami cara mengelola state yang lebih kompleks dengan signals dan expressions, serta teknik binding yang lebih canggih.
