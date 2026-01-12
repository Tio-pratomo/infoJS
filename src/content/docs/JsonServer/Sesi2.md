---
title: Mengambil dan Memanipulasi Data (GET)
---

Di sesi ini, kita akan belajar cara mengambil data dari server, baik itu data tunggal maupun data dengan kriteria tertentu, seperti filter, sorting, dan pagination. Ini adalah dasar dari interaksi Anda sebagai pengembang front-end dengan sebuah API.

## 1. Mengambil Semua Data

Untuk mengambil semua data dari sebuah "resource" (dalam hal ini products atau reviews), Anda hanya perlu mengakses URL dasarnya.

- Tujuan: Mengambil semua produk.
- URL: `http://localhost:3030/products`
- Penjelasan: Saat Anda mengunjungi URL ini, server akan mengembalikan semua data yang ada di dalam array products dari file db.json. Ini adalah cara paling dasar untuk mendapatkan data.

## 2. Mengambil Detail Data (Berdasarkan ID)

Seringkali Anda hanya ingin menampilkan satu item data, misalnya detail dari sebuah produk. Anda bisa melakukannya dengan menambahkan /:id (id unik) di akhir URL resource.

- Tujuan: Mengambil detail produk dengan ID = 1.
- URL: `http://localhost:3030/products/1`
- Penjelasan: JSON Server akan mencari dan mengembalikan objek produk yang memiliki id dengan nilai 1. Anda bisa mengganti angka 1 dengan ID produk lain yang Anda inginkan. Ini juga berlaku untuk resource reviews.

## 3. Memfilter Data

JSON Server memungkinkan Anda memfilter data dengan menambahkan "query parameter" pada URL Anda. Anda bisa memfilter berdasarkan properti apa pun yang ada di data Anda.

- Tujuan: Menampilkan semua produk dengan kategori 'electronics'.

- URL: `http://localhost:3030/products?category=electronics`

- Penjelasan: Tambahkan **?** diikuti oleh namaProperti=nilai di akhir URL. Server akan memindai semua produk dan hanya mengembalikan produk yang properti category-nya memiliki nilai electronics.
  Anda bahkan bisa menggabungkan beberapa filter dengan menggunakan tanda **&**.
- Contoh: `http://localhost:3030/products?category=electronics&price=2000` akan mengembalikan produk elektronik yang harganya 2000.

## 4. Mengurutkan Data (Sorting)

Untuk mengurutkan data, Anda dapat menggunakan query parameter **\_sort** dan **\_order**.

- Tujuan: Mengurutkan produk berdasarkan harga dari yang terkecil.
- URL: `http://localhost:3030/products?_sort=price`
- Penjelasan: Secara default, sort akan mengurutkan data dari yang terkecil ke yang terbesar (ascending).
  Jika Anda ingin mengurutkan dari yang terbesar ke yang terkecil, tambahkan order=desc. Ini hanya berlaku untuk json-server stable version.
  Contoh: `http://localhost:3030/products?_sort=price&_order=desc`

### Mengurutkan dengan Banyak Kriteria (stable version)

Anda juga bisa mengurutkan dengan lebih dari satu properti. Gunakan tanda koma (,) untuk memisahkan properti dan urutannya.

- Tujuan: Mengurutkan produk berdasarkan harga (terbesar ke terkecil), lalu jika ada harga yang sama, urutkan berdasarkan kategori (terkecil ke terbesar).

- URL: `http://localhost:3030/products?_sort=price,category&_order=desc,asc`

- Penjelasan: Server akan memproses price terlebih dahulu dengan urutan desc, lalu untuk data dengan price yang sama, server akan mengurutkannya berdasarkan category dengan urutan asc.

## 5. Menggunakan Operator untuk Filter yang Lebih Canggih

JSON Server juga menyediakan operator untuk memfilter data dengan kondisi tertentu, seperti lebih besar dari, lebih kecil dari, atau tidak sama dengan.

- **\_gte** (Greater Than or Equal): Lebih besar dari atau sama dengan.

- **\_lte** (Less Than or Equal): Lebih kecil dari atau sama dengan.

- **\_ne** (Not Equal): Tidak sama dengan.

- **\_gt**: Lebih besar dari.

- **\_lt** : Kurang dari.

Tujuan: Menampilkan produk yang harganya antara 3000 dan 6000.

URL: `http://localhost:3030/products?price_gte=3000&price_lte=6000`

Jika anda mengakses url di atas, server akan mengembalikan semua produk yang harganya lebih besar dari atau sama dengan 3000, DAN lebih kecil dari atau sama dengan 6000.

## 6. Pencarian Teks Lengkap (Full-text Search)

Fitur ini berguna untuk mencari data di seluruh properti. Namun, ini hanya berlaku pada stable version

- Tujuan: Mencari produk yang mengandung kata "product" atau "electronics".
- URL: `http://localhost:3030/products?q=product`
- Penjelasan: Query parameter q akan mencari teks yang Anda masukkan di seluruh properti dari setiap objek produk.

---

Sesi ini memberikan gambaran dasar tentang bagaimana Anda bisa mengambil dan memanipulasi data yang ada di server. Di sesi berikutnya, kita akan membahas lebih dalam tentang relasi data dan bagaimana JSON Server menanganinya.
