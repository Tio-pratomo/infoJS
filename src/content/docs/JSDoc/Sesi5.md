---
title: Mengembangkan Dokumentasi Anda
---

Oke, kita sampai di sesi terakhir.  
Di sesi ini, kita akan fokus pada fitur-fitur tambahan yang membuat dokumentasi Anda lebih lengkap dan profesional, serta langkah-langkah untuk menghasilkan berkas HTML akhirnya.

---

## Tutorial (@tutorial)

Terkadang, Anda ingin membuat halaman dokumentasi yang lebih dari sekadar referensi kode.  
Misalnya, membuat tutorial, panduan penggunaan, atau contoh kasus terpisah.

JSDoc memungkinkan ini dengan tag `@tutorial`.

### 1. Buat Berkas Tutorial

Buat berkas HTML atau Markdown baru di dalam folder proyek Anda.  
Misalnya, `tutorial_memulai.html`:

```html
<h1>Memulai dengan Proyek</h1>
<p>
  Tutorial ini akan memandu Anda melalui langkah-langkah awal untuk menggunakan perpustakaan kami.
</p>
```

### 2. Tambahkan Tag @tutorial

Di dalam salah satu komentar JSDoc Anda, gunakan tag `@tutorial` untuk menautkan fungsi ke berkas tutorial tersebut:

```js
/**
 * Fungsi utama untuk menginisialisasi aplikasi.
 * @tutorial tutorial_memulai
 */
function inisialisasiAplikasi() {
  // ...
}
```

Ketika dokumentasi dibuat, JSDoc akan menambahkan tautan ke tutorial ini di halaman dokumentasi fungsi `inisialisasiAplikasi`.

---

## Menggunakan README.md sebagai Beranda

Sebagian besar proyek memiliki berkas `README.md` di root directory.
Anda bisa mengonfigurasi JSDoc agar menjadikannya halaman beranda dokumentasi.

### 1. Buat Berkas README.md

Contoh sederhana:

```md
# Nama Proyek

Ini adalah dokumentasi API untuk proyek saya.

## Instalasi

...
```

### 2. Konfigurasi JSDoc

Gunakan berkas konfigurasi `jsdoc.json` untuk memberi tahu JSDoc agar menggunakan `README.md` sebagai home page.

---

## Membangun Dokumentasi

Sekarang, kita siap untuk mengompilasi semua komentar JSDoc dan berkas tutorial/README menjadi dokumentasi HTML yang utuh.

### Langkah 1: Membuat Berkas Konfigurasi

Buat file bernama `jsdoc.json` di root proyek, lalu isi dengan:

```json
{
  "source": {
    "include": ["."],
    "includePattern": ".js$",
    "excludePattern": "(node_modules/|docs)"
  },
  "opts": {
    "encoding": "utf8",
    "destination": "./docs",
    "recurse": true,
    "readme": "./README.md",
    "tutorials": "./"
  }
}
```

**Penjelasan singkat:**

- **source** → lokasi file JS yang dipindai

  - `include: ["."]` → semua file di folder proyek
  - `includePattern: ".js$"` → hanya file `.js`
  - `excludePattern: "(node_modules/|docs)"` → skip `node_modules` dan `docs`

- **opts** → konfigurasi output

  - `destination: "./docs"` → hasil dokumentasi ke folder `docs`
  - `recurse: true` → scan semua sub-folder
  - `readme: "./README.md"` → gunakan README sebagai home page
  - `tutorials: "./"` → cari file tutorial di root

---

### Langkah 2: Menambahkan Skrip npm

Agar lebih mudah, tambahkan skrip `docs` ke `package.json`:

```json
"scripts": {
  "docs": "jsdoc -c jsdoc.json",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

---

### Langkah 3: Menjalankan Perintah

Jalankan di terminal:

```bash
npm run docs
```

Jika berhasil, akan terbentuk folder baru bernama `docs` berisi `index.html`.
Buka `docs/index.html` di browser Anda, maka dokumentasi siap dipakai.

---

## Kesimpulan

Selamat 🎉 Anda telah berhasil membuat dokumentasi profesional dengan JSDoc.

Di sesi ini, Anda belajar:

- Membuat **tutorial terpisah** dengan `@tutorial`
- Menggunakan **README.md sebagai home page**
- Mengatur **jsdoc.json** untuk konfigurasi
- Menjalankan **npm run docs** agar build lebih praktis

Dengan ini, Anda sudah punya pemahaman lengkap JSDoc: dari dasar hingga menghasilkan dokumentasi yang rapi dan komprehensif.
