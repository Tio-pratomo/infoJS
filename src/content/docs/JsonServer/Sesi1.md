---
title: Pengenalan dan Persiapan
---

Di sesi ini, kita akan mengenal apa itu JSON Server, mengapa JSON Server sangat berguna, dan bagaimana cara mempersiapkannya di komputer Anda.

## Apa itu JSON Server?

Bayangkan Anda adalah seorang desainer interior yang sedang merancang sebuah rumah. Sebelum Anda membeli semua perabot aslinya, Anda pasti akan menggunakan replika atau miniatur untuk menata ruangan. Nah, JSON Server itu seperti miniatur tersebut.

Dengan JSON Server anda dapat membuat "data bohongan", yang bisa Anda gunakan untuk proyek web Anda.
JSON Server adalah sebuah alat yang memungkinkan Anda membuat REST API palsu (dummy) tanpa perlu menulis kode backend yang rumit.

API ini bisa digunakan oleh pengembang front-end untuk mengambil (fetch), menambahkan (POST), memperbarui (PUT/PATCH), atau menghapus (DELETE) data secara asynchronous, sama seperti API sungguhan. Ini sangat membantu karena Anda tidak perlu menunggu pengembang backend menyelesaikan pekerjaannya.

## Mengapa JSON Server Penting bagi Pengembang Front-end?

Sebagai pengembang front-end, Anda seringkali butuh data untuk menampilkan komponen UI Anda. Menunggu API dari backend bisa memakan waktu. Dengan JSON Server, Anda bisa membuat data tiruan sendiri dalam hitungan menit dan mulai mengerjakan tampilan antarmuka (UI) Anda dengan segera.

## Langkah-langkah Persiapan

Sebelum memulai, pastikan Anda sudah menginstal Node.js di komputer Anda. Node.js adalah lingkungan runtime yang diperlukan untuk menjalankan JSON Server.

### Buat Folder Proyek

Buatlah sebuah folder baru untuk proyek kita. Kita bisa beri nama belajar-json-server.

```bash
mkdir belajar-json-server
cd belajar-json-server
```

### Inisialisasi Proyek Node.js

Buka terminal atau command prompt Anda di dalam folder belajar-json-server. Jalankan perintah berikut untuk membuat file package.json secara otomatis. File ini akan menyimpan informasi tentang proyek dan dependensi yang kita gunakan.

```bash
npm init -y
```

### Instal JSON Server

Sekarang, saatnya menginstal JSON Server. Kita akan menginstalnya secara lokal di proyek kita, bukan secara global.

```bash
npm install json-server@0.17.4
```

### Buat File Data

Buatlah sebuah file baru bernama db.json di dalam folder proyek Anda. File ini akan menjadi "database" kita. Isikan kode berikut ke dalam file db.json. Ini adalah contoh data produk dan ulasan yang akan kita gunakan.

```json title="db.json" wrap
{
  "products": [
    {
      "id": 1,
      "title": "Product 1",
      "category": "electronics",
      "price": 4000,
      "description": "This is description about product 1"
    },
    {
      "id": 2,
      "title": "Product 2",
      "category": "electronics",
      "price": 2000,
      "description": "This is description about product 2"
    },
    {
      "id": 3,
      "title": "Product 3",
      "category": "books",
      "price": 1000,
      "description": "This is description about product 3"
    },
    {
      "id": 4,
      "title": "Product 4",
      "category": "fitness",
      "price": 3000,
      "description": "This is description about product 4"
    },
    {
      "id": 5,
      "title": "Product 5",
      "category": "fitness",
      "price": 4000,
      "description": "This is description about product 5"
    }
  ],
  "reviews": [
    {
      "id": 1,
      "rating": 3,
      "comment": "Review 1 for product id 1",
      "productId": 1
    },
    {
      "id": 2,
      "rating": 4,
      "comment": "Review 2 for product id 1",
      "productId": 1
    }
  ]
}
```

### Konfigurasi package.json

Buka file package.json yang sudah Anda buat. Di bagian scripts, tambahkan baris berikut:

```json wrap
"serve:db": "json-server db.json --watch --port 3030"
```

Penjelasan kode:

- **"serve:db" :** Ini adalah nama perintah yang akan kita jalankan.

- **json-server db.json :** Memerintahkan JSON Server untuk menggunakan db.json sebagai sumber data.

- **`--watch` :** Opsi ini membuat server secara otomatis mendeteksi perubahan pada file db.json dan memuat ulang server.

- **`--port 3030` :** Opsi ini menentukan port yang akan digunakan oleh server, dalam kasus ini, port 3030.

### Menjalankan Server

Sekarang, saatnya menjalankan server "API" dummy kita. Ketik perintah ini di terminal Anda:

```bash
npm run serve:db
```

Jika berhasil, Anda akan melihat pesan di terminal yang menunjukkan server sudah berjalan. Anda bisa mengunjungi http://localhost:3030/products atau http://localhost:3030/reviews di browser Anda untuk melihat data JSON yang sudah siap digunakan.

Selamat! Anda sudah berhasil menyiapkan JSON Server. Di sesi berikutnya, kita akan belajar cara berinteraksi dengan API ini, mulai dari mengambil data hingga melakukan filter dan sorting.
