---
title: Menggunakan Pino Pretty dan Pino HTTP
---

Di sesi sebelumnya, log kita sudah terstruktur dalam format JSON dan bisa diatur level serta timestamp-nya. Tapi, melihat JSON mentah di terminal bisa melelahkan mata.

Di sesi ini, kita akan membuat log di terminal menjadi cantik dan mudah dibaca dengan Pino Pretty. Selain itu, kita juga akan otomatis mencatat setiap "tamu" (permintaan HTTP) yang datang ke aplikasi kita menggunakan Pino HTTP.

Bayangkan ini seperti merias "buku catatan" kita agar lebih indah saat dibaca, dan memasang "penjaga gerbang" otomatis yang mencatat setiap orang yang masuk ke rumah kita.

## Menginstal Pino Pretty

Pino Pretty adalah sebuah "tambahan" atau extention untuk Pino yang mengubah output log JSON menjadi format yang lebih mudah dibaca manusia, lengkap dengan warna-warni yang membantu membedakan log level.

Langkah-langkah Instalasi:

1.  Buka terminal Anda (pastikan Anda berada di direktori proyek pino-auth-app/).

2.  Gunakan pnpm untuk menginstal pino-pretty:

    ```bash
    pnpm add pino-pretty
    ```

    Ini akan menambahkan pino-pretty ke dependensi proyek Anda.

## Mengkonfigurasi Pino Pretty untuk Tampilan Log yang Lebih Indah

Ada dua cara utama untuk menggunakan Pino Pretty:

- Cara 1: Menggunakan pino-pretty sebagai pipe di package.json (Lebih Sederhana untuk Mulai)

- Cara 2: Menggunakan pino-pretty sebagai transport di konfigurasi logger.js (Lebih Fleksibel)

Kita akan fokus pada Cara 2 karena ini lebih fleksibel dan memungkinkan kita mengontrol output ke konsol dan file secara terpisah (yang akan sangat berguna di sesi berikutnya).

## Modifikasi utils/logger.js:

Kita akan mengubah properti transport di konfigurasi Pino kita.

```js title="utils/logger.js"
import pino from 'pino';
import 'dotenv/config';

const logger = pino({
  enabled: process.env.LOG_ENABLE === 'true',
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },

  // *** BAGIAN BARU UNTUK PINO PRETTY ***
  transport: {
    target: 'pino-pretty', // Menentukan bahwa kita ingin menggunakan pino-pretty
    options: {
      colorize: true, // Log akan berwarna di terminal
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', // Format waktu yang lebih ramah manusia
      ignore: 'pid,hostname', // Abaikan properti 'pid' (process ID) dan 'hostname'
      // karena biasanya tidak terlalu dibutuhkan di konsol
      // agar output lebih ringkas
    },
  },
  // **********************************
});

export default logger;
```

### Penjelasan Modifikasi:

- **transport:** Ini adalah properti baru yang kita tambahkan. transport memberi tahu Pino "ke mana" dan "bagaimana" log harus dikirimkan.

- **target: 'pino-pretty':** Ini adalah instruksi langsung ke Pino untuk menggunakan pino-pretty sebagai target pengiriman log.

- **options:** Di sini kita bisa mengatur bagaimana pino-pretty bekerja:

  - **colorize:** true: Mengaktifkan pewarnaan teks di terminal, membuat log level terlihat berbeda.

  - **translateTime: 'SYS:yyyy-mm-dd HH:MM:ss':** Mengubah format waktu menjadi lebih mudah dibaca (tanggal dan waktu sistem). Ada banyak opsi format lain, cek dokumentasi pino-pretty jika penasaran.

  - **ignore: 'pid,hostname':** Properti pid (process ID) dan hostname (nama komputer) otomatis ditambahkan oleh Pino. Dengan ignore, kita bisa menyembunyikannya dari tampilan konsol agar log lebih ringkas dan fokus pada pesan utamanya. Ini sangat berguna di lingkungan pengembangan.

Coba Jalankan Aplikasi Anda:

1.  Simpan perubahan di utils/logger.js.
2.  Jalankan aplikasi: node index.js.
3.  Akses http://localhost:3000/, http://localhost:3000/test-log, atau

    http://localhost:3000/all-log-levels di browser Anda.

Sekarang, lihat terminal Anda!

Log-nya akan terlihat jauh lebih rapi, berwarna, dan mudah dibaca, bukan lagi JSON mentah.

Ini akan sangat membantu saat Anda melakukan debugging atau memantau aplikasi.

## Menginstal Pino HTTP

Pino HTTP adalah middleware khusus Express.js yang berfungsi sebagai "penjaga gerbang" otomatis.

Setiap kali ada permintaan HTTP (seperti membuka halaman web atau mengirim data dari formulir) yang masuk ke aplikasi Anda, Pino HTTP akan otomatis mencatatnya. Ini sangat penting untuk memantau lalu lintas ke aplikasi Anda.

Langkah-langkah Instalasi:

- Kita sudah menginstal pino-http di Sesi 2 dengan perintah:

  ```bash
  pnpm add pino pino-http
  ```

- Jadi, Anda tidak perlu menginstalnya lagi.

## Mengintegrasikan Pino HTTP ke Middleware Express JS

Sekarang, kita akan "memasang" Pino HTTP di aplikasi Express.js Anda, yaitu di file index.js.

**Modifikasi index.js:**

Kita akan menambahkan pino-http sebagai middleware di bagian awal aplikasi Anda.

```js title="index.js"
import express from 'express';
import axios from 'axios';
import pinoHttp from 'pino-http'; // Import pino-http
import logger from './utils/logger.js'; // Import logger kustom kita

const app = express();
const port = process.env.PORT || 3000;

const API_URL = 'https://secrets-api.appbrewery.com/';

// TODO 1: Fill in your values for the 3 types of auth.
const yourUsername = '';
const yourPassword = '';
const yourAPIKey = '';
const yourBearerToken = '';

// Mengatur view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

// *** BAGIAN BARU UNTUK PINO HTTP ***
// Menggunakan pino-http sebagai middleware
// Ini akan mencatat setiap request HTTP yang masuk secara otomatis
// Kita meneruskan objek logger kustom kita ke pinoHttp
app.use(pinoHttp({ logger }));
// ***********************************

app.get('/', (req, res) => {
  // Sekarang, kita bisa menggunakan req.log (dari pino-http) untuk log yang terkait dengan request ini
  req.log.info('Akses ke halaman utama ("/")'); // Log ini akan memiliki konteks request
  res.render('index.ejs', { content: 'API Response.' });
});

// Contoh rute lain untuk melihat logging (sudah ada dari Sesi 3)
app.get('/test-log', (req, res) => {
  req.log.info('Rute /test-log diakses.'); // Menggunakan req.log
  req.log.info({ userId: 123, status: 'success' }, 'Pengujian log dengan detail pengguna.');
  res.send('Lihat konsol terminal Anda untuk melihat log!');
});

app.get('/all-log-levels', (req, res) => {
  req.log.trace('Ini adalah pesan TRACE, sangat detail.'); // Menggunakan req.log
  req.log.debug('Ini adalah pesan DEBUG, untuk membantu pengembangan.');
  req.log.info('Ini adalah pesan INFO, informasi umum.');
  req.log.warn('Ini adalah pesan WARN, potensi masalah.');
  req.log.error('Ini adalah pesan ERROR, ada kesalahan!');
  req.log.fatal('Ini adalah pesan FATAL, aplikasi mungkin berhenti!');
  res.send('Memicu semua level log. Lihat konsol Anda.');
});

// Contoh penggunaan logger untuk server startup (dari Sesi 3)
app.listen(port, () => {
  logger.info(`Server berhasil berjalan di port ${port}`);
  logger.info(`Aplikasi berjalan di lingkungan: ${process.env.NODE_ENV}`);
  logger.info(`Logging aktif: ${process.env.LOG_ENABLE}`);
});

// *** BAGIAN BARU: Menambahkan logger ke rute API dari solution.js (jika perlu) ***
// Jika Anda ingin logger juga mencatat aktivitas di dalam rute /noAuth, /basicAuth, dll.
// Misalnya di rute /noAuth:
app.get('/noAuth', async (req, res) => {
  try {
    const result = await axios.get(API_URL + '/random');
    // Gunakan req.log untuk mencatat keberhasilan
    req.log.info('API /random berhasil diakses.');
    res.render('index.ejs', { content: JSON.stringify(result.data) });
  } catch (error) {
    // Gunakan req.log.error untuk mencatat kesalahan
    req.log.error({ error: error.message, url: req.originalUrl }, 'Gagal mengakses API /random');
    res.status(404).send(error.message);
  }
});

// Anda bisa mengulang pola try-catch dengan req.log di rute-rute lain seperti /basicAuth, /apiKey, /bearerToken
// Ini akan sangat membantu melacak masalah autentikasi atau akses API
app.get('/basicAuth', async (req, res) => {
  try {
    const result = await axios.get(API_URL + '/all?page=2', {
      auth: {
        username: yourUsername,
        password: yourPassword,
      },
    });
    req.log.info({ username: yourUsername }, 'Basic Auth API berhasil diakses.');
    res.render('index.ejs', { content: JSON.stringify(result.data) });
  } catch (error) {
    req.log.error(
      { username: yourUsername, error: error.message, url: req.originalUrl },
      'Gagal mengakses Basic Auth API'
    );
    res.status(404).send(error.message);
  }
});

app.get('/apiKey', async (req, res) => {
  try {
    const result = await axios.get(API_URL + '/filter', {
      params: {
        score: 5,
        apiKey: yourAPIKey,
      },
    });
    req.log.info({ apiKey: yourAPIKey, score: 5 }, 'API Key endpoint berhasil diakses.');
    res.render('index.ejs', { content: JSON.stringify(result.data) });
  } catch (error) {
    req.log.error(
      { apiKey: yourAPIKey, error: error.message, url: req.originalUrl },
      'Gagal mengakses API Key endpoint'
    );
    res.status(404).send(error.message);
  }
});

app.get('/bearerToken', async (req, res) => {
  const config = {
    headers: { Authorization: `Bearer ${yourBearerToken}` },
  };
  try {
    const result = await axios.get(API_URL + '/secrets/42', config);
    req.log.info({ secretId: 42 }, 'Bearer Token endpoint berhasil diakses.');
    res.render('index.ejs', { content: JSON.stringify(result.data) });
  } catch (error) {
    req.log.error(
      { error: error.message, url: req.originalUrl },
      'Gagal mengakses Bearer Token endpoint'
    );
    res.status(404).send(error.message);
  }
});

// Middleware penanganan error (dari Sesi 3, disarankan ada di akhir)
app.use((err, req, res, next) => {
  // req.log tersedia di sini jika error terjadi dalam konteks request
  // Jika tidak ada req, gunakan logger biasa
  const logFn = req && req.log ? req.log.error : logger.error;
  logFn({ err, url: req.originalUrl, method: req.method }, 'Terjadi kesalahan tak terduga!');
  res.status(500).send('Ada yang salah di server kami!');
});
```

### Penjelasan Modifikasi di index.js:

- `app.use(pinoHttp({ logger }));` :

  Ini adalah baris paling penting untuk Pino HTTP.

  Dengan menempatkannya di awal middleware Anda, setiap permintaan yang masuk akan diintersep dan dicatat oleh pino-http.

  Kita meneruskan objek logger kustom kita agar pino-http menggunakan konfigurasi dan transport yang sudah kita siapkan (yaitu, ke konsol dengan pino-pretty).

- `req.log.info(...)`, `req.log.error(...)` :

  Salah satu fitur keren dari pino-http adalah ia akan melampirkan instance logger ke objek req sebagai req.log.

  Ini berarti di dalam setiap rute atau middleware yang dieksekusi setelah pinoHttp, Anda bisa menggunakan req.log alih-alih logger yang global.

  Keuntungannya? Log yang dibuat melalui req.log akan otomatis memiliki konteks permintaan HTTP tersebut (misalnya, ID permintaan, waktu respons, URL), sehingga sangat membantu saat melacak alur permintaan.

- **Implementasi Log di Rute Autentikasi** :

  Saya telah menambahkan contoh penggunaan req.log.info untuk keberhasilan dan req.log.error di dalam blok try-catch pada rute /noAuth, /basicAuth, /apiKey, dan /bearerToken.

  Ini akan sangat membantu Anda melihat log autentikasi berhasil atau gagal, dan detail kesalahannya.

**Coba Jalankan Aplikasi Anda:**

1.  Pastikan semua perubahan di **_utils/logger.js_** dan **_index.js_** sudah disimpan.
2.  Buka terminal di direktori proyek Anda.
3.  Jalankan aplikasi:

    ```bash
    pnpm run dev
    ```

    Atau

    ```bash
    node --env-file=.env index.js
    ```

4.  Buka browser Anda dan akses http://localhost:3000/.
5.  Coba klik tombol-tombol di halaman (No Auth, Basic Auth, API Key, Bearer Token).

    Anda mungkin perlu mengisi yourUsername, yourPassword, yourAPIKey, yourBearerToken di index.js agar berhasil, tetapi bahkan jika gagal, log error akan muncul.

    Perhatikan terminal Anda. Anda akan melihat log yang rapi dan berwarna untuk setiap permintaan HTTP yang masuk, termasuk detail seperti metode, URL, status respons, dan waktu. Jika ada kesalahan, Anda juga akan melihat log error yang detail.

Selamat! Anda telah menyelesaikan Sesi 4.

Log di terminal Anda sekarang sudah cantik berkat Pino Pretty, dan Anda bisa otomatis mencatat setiap permintaan HTTP yang masuk dengan Pino HTTP.

Ini adalah kemajuan besar dalam kemampuan debugging dan monitoring aplikasi Anda!
