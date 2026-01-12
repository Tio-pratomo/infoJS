---
title: Pengenalan dan Persiapan Awal
---

## Apa Itu JSDoc?

Secara sederhana, **JSDoc** adalah sebuah alat yang memungkinkan Anda membuat dokumentasi untuk kode JavaScript Anda. Ia bekerja dengan membaca komentar khusus yang Anda tulis di atas **function**, **class**, atau **variabel**, lalu mengubahnya menjadi halaman web HTML yang rapi dan mudah dibaca.  
Bayangkan Anda bekerja dalam tim. Dengan JSDoc, setiap anggota tim bisa langsung melihat bagaimana sebuah fungsi bekerja, apa saja parameternya, dan apa yang dikembalikannya, tanpa perlu membaca seluruh kode sumber. Ini sangat menghemat waktu dan mencegah kesalahan.

## Alur Kerja JSDoc

Alur kerjanya sangat mudah dan logis:

1. **Menulis Komentar:** Anda akan mulai dengan menulis komentar JSDoc (`/** ... */`) di atas kode Anda. Di dalam komentar ini, Anda akan menggunakan tag-tag khusus seperti `@param` dan `@returns` untuk menjelaskan fungsi Anda.
2. **Menjalankan JSDoc:** Setelah komentar Anda selesai, Anda akan menjalankan JSDoc melalui terminal.
3. **Menghasilkan HTML:** JSDoc akan memproses semua komentar tersebut dan menghasilkan folder baru yang berisi berkas-berkas HTML, CSS, dan JavaScript yang siap Anda buka di peramban web.

---

## Instalasi dan Penyiapan Awal

Sebelum kita mulai menulis kode, kita perlu memastikan semua alat sudah terinstal. Berikut adalah panduan langkah demi langkahnya:

### Langkah 1: Menginstal Node.js

JSDoc berjalan di lingkungan **Node.js**. Node.js adalah lingkungan _runtime_ JavaScript yang memungkinkan Anda menjalankan kode di luar peramban.

- Kunjungi situs resmi Node.js: [https://nodejs.org/](https://nodejs.org/)
- Unduh dan instal versi **LTS** (_Long Term Support_) yang disarankan. Versi ini paling stabil untuk penggunaan umum.
- Setelah instalasi selesai, buka terminal atau Command Prompt dan jalankan perintah berikut untuk memeriksa apakah Node.js dan npm (manajer paket Node.js) sudah terinstal dengan benar:

```bash
node -v
npm -v

```

Jika Anda melihat nomor versi, berarti instalasi berhasil!

### Langkah 2: Menginstal Visual Studio Code (VS Code)

VS Code adalah editor kode yang sangat populer. Kita akan menggunakannya karena dukungan bawaan yang bagus untuk JavaScript dan integrasi dengan JSDoc.

- Kunjungi situs resmi VS Code: [https://code.visualstudio.com/](https://code.visualstudio.com/)
- Unduh dan instal aplikasi sesuai dengan sistem operasi Anda.

### Langkah 3: Menginisialisasi Proyek npm dan Menginstal JSDoc

Sekarang, kita akan membuat folder proyek, menginisialisasi npm, dan menginstal JSDoc sebagai dependensi proyek kita.

1. Buat sebuah folder baru untuk proyek kita, misalnya `proyek-jsdoc`.
2. Buka terminal di dalam folder tersebut.
3. Jalankan perintah berikut untuk menginisialisasi proyek npm. Perintah ini akan membuat berkas `package.json` yang berisi detail proyek Anda.

```bash
   npm init -y

```

4. Instal JSDoc. Kita akan menginstalnya sebagai _dev-dependency_ (dependensi pengembangan) karena kita hanya membutuhkannya saat membuat dokumentasi, bukan saat aplikasi berjalan.

```bash

npm install --save-dev jsdoc

```
