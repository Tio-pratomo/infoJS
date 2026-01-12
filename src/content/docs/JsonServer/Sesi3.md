---
title: Memanipulasi Data (POST, PUT, PATCH, DELETE)
---

Di sesi ini, kita akan belajar cara menambahkan, memperbarui, dan menghapus data menggunakan metode HTTP yang berbeda. Ini adalah fondasi dari aplikasi web yang dinamis, di mana pengguna dapat berinteraksi dan mengubah data.

Bayangkan file **db.json** kita adalah sebuah rak buku.

- GET = Membaca buku-buku yang ada di rak.
- POST = Menambahkan buku baru ke dalam rak.
- PUT / PATCH = Mengganti atau memperbaiki buku yang sudah ada.
- DELETE = Membuang buku dari rak.

Untuk mencoba metode ini, kita tidak bisa langsung menggunakan browser karena browser secara default hanya melakukan permintaan GET. Kita akan menggunakan alat seperti Postman, Insomnia, atau ekstensi VS Code seperti Thunder Client(berbayar).

## 1. Menambahkan Data Baru (POST)

Untuk menambahkan data baru, kita menggunakan metode POST. JSON Server akan secara otomatis menambahkan id unik ke data yang Anda kirim.

- Tujuan: Menambahkan produk baru ke dalam daftar.
- Metode: **POST**
- URL: `http://localhost:3030/products`
- Body (Data yang dikirim):

  ```json wrap
  {
    "title": "Product 6",
    "category": "fashion",
    "price": 5000,
    "description": "This is description about product 6"
  }
  ```

- Cara Penerapan:

1. Buka Postman atau Thunder Client.
2. Pilih metode POST.
3. Masukkan URL di atas.
4. Pilih tab Body dan pastikan jenisnya adalah raw dan formatnya JSON.
5. Masukkan kode JSON di atas ke dalam body.
6. Tekan tombol Send.

Jika berhasil, Anda akan mendapatkan respons berupa objek produk baru, termasuk id yang sudah ditambahkan oleh JSON Server. Jika Anda membuka kembali file **db.json**, Anda akan melihat produk baru ini sudah ditambahkan.

## 2. Memperbarui Seluruh Data (PUT)

Metode PUT digunakan untuk memperbarui seluruh objek data yang sudah ada. Ini berarti Anda harus mengirimkan seluruh data objek, bahkan properti yang tidak berubah.

- Tujuan: Memperbarui produk dengan id=1.
- Metode: **PUT**
- URL: `http://localhost:3030/products/1`
- Body (Data yang dikirim):

  ```json wrap
  {
    "id": 1,
    "title": "Product 1 (UPDATED)",
    "category": "electronics",
    "price": 4500,
    "description": "This is description about product 1, with an updated title and price."
  }
  ```

- Cara Penerapan:

  1. Pilih metode PUT.
  2. Masukkan URL dengan id produk yang ingin Anda perbarui.
  3. Pilih tab Body, jenis raw dan format JSON.
  4. Masukkan kode JSON di atas ke dalam body. Pastikan Anda juga menyertakan id di dalam body.
  5. Tekan Send.

> **Perlu diingat**
>
> jika Anda hanya mengirimkan **title** dan **price** saja, **maka properti category dan description akan dihapus dari objek**.

## 3. Memperbarui Sebagian Data (PATCH)

Metode PATCH lebih efisien daripada PUT. Ini digunakan untuk memperbarui hanya sebagian dari objek data tanpa harus mengirimkan seluruh objek.

- Tujuan: Hanya memperbarui price produk dengan id=2.
- Metode: **PATCH**
- URL: `http://localhost:3030/products/2`
- Body (Data yang dikirim):

  ```json wrap
  {
    "price": 5000
  }
  ```

- Cara Penerapan:

1. Pilih metode PATCH.
2. Masukkan URL dengan id produk yang ingin Anda perbarui.
3. Pilih tab Body, jenis raw dan format JSON.
4. Masukkan kode JSON di atas.
5. Tekan Send.

**Hanya properti price yang akan diperbarui, sedangkan properti lain seperti title dan category akan tetap utuh.**

## 4. Menghapus Data (DELETE)

Menghapus data adalah proses yang paling sederhana. Anda hanya perlu menentukan id dari item yang ingin dihapus.

- Tujuan: Menghapus produk dengan id=6.
- Metode: **DELETE**
- URL: `http://localhost:3030/products/6`
- Cara Penerapan:

1. Pilih metode DELETE.
2. Masukkan URL dengan id produk yang ingin Anda hapus.
3. Tekan Send.

Jika berhasil, Anda akan mendapatkan respons kosong {} dan produk dengan id=6 akan hilang dari file db.json Anda.

Dengan menguasai empat metode ini, Anda sudah memiliki kemampuan dasar untuk berinteraksi dengan API secara penuh. Sesi berikutnya akan membahas bagaimana JSON Server menangani hubungan antar data (relasi).
