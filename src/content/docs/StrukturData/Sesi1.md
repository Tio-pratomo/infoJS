---
title: Fundamental Struktur Data
---

Kita akan memulai perjalanan menguasai struktur data dari dasarnya. Memahami _fundamental_ ini krusial karena akan menjadi landasan untuk semua topik lanjutan.

## Apa Itu Struktur Data?

Secara sederhana, **struktur data** adalah cara menyimpan dan mengatur data di dalam komputer agar bisa diakses, dikelola, dan dimodifikasi secara efisien.

Bayangkan Anda memiliki lemari pakaian:

- Jika pakaian dilempar sembarangan ke dalam lemari, Anda bisa menyimpannya dengan cepat, tapi akan sangat sulit mencari baju tertentu nanti.
- Jika pakaian dilipat, dikelompokkan berdasarkan jenis (kaos, celana, jaket), dan disusun rapi, proses menyimpannya butuh waktu lebih lama, tapi mengambilnya menjadi sangat cepat.

Struktur data mirip dengan pengorganisasian lemari tersebut. Kita memilih cara "menyusun" data berdasarkan apa yang paling sering kita lakukan: apakah kita lebih sering **menyimpan** (write) atau **mengambil** (read) data tersebut?

## Mengapa Perlu Belajar Struktur Data?

Dalam pengembangan perangkat lunak modern, data bisa berjumlah jutaan hingga miliaran baris. Tanpa struktur yang tepat:

1.  **Performa Buruk**: Aplikasi menjadi lambat saat mencari data user tertentu di antara 1 juta user lainnya.
2.  **Boros Memori**: Penggunaan RAM komputer menjadi tidak efisien.
3.  **Kode Berantakan**: Logika program menjadi rumit dan sulit di-maintain.

Pemilihan struktur data yang tepat memungkinkan kita membuat aplikasi yang _scalable_ (dapat menangani banyak pengguna) dan _performant_ (cepat).

## Tipe Data Primitif vs Non-Primitif

Sebelum masuk ke struktur yang kompleks, kita harus tahu bahan dasarnya.

### 1. Tipe Data Primitif

Ini adalah unit data paling dasar yang disediakan langsung oleh bahasa pemrograman. Mereka bersifat atomik (tidak bisa dipecah lagi).

- **Integer**: Bilangan bulat (contoh: `10`, `-5`, `0`).
- **Float/Double**: Bilangan desimal (contoh: `3.14`, `0.001`).
- **Boolean**: Logika benar/salah (`true` atau `false`).
- **Char/String**: Karakter teks (contoh: `'A'`, `"Halo"`).

### 2. Tipe Data Non-Primitif (Struktur Data)

Ini adalah tipe data bentukan yang bisa menyimpan kumpulan data primitif atau data lainnya.

- **Linear**: Data disusun secara berurutan. Contoh: `Array`, `Linked List`, `Stack`, `Queue`.
- **Non-Linear**: Data disusun secara hierarkis atau terhubung. Contoh: `Tree`, `Graph`.

## Konsep Big O Notation (Singkat)

Salah satu tolok ukur utama dalam struktur data adalah **Big O Notation**. Ini adalah cara kita mengukur "seberapa lambat" algoritma kita akan berjalan seiring bertambahnya jumlah data (input).

- **O(1) - Constant Time**: Waktu akses selalu sama, tidak peduli berapa banyak datanya. (Contoh: Mengakses index array `arr[5]`). **Terbaik**.
- **O(n) - Linear Time**: Waktu akses bertambah seiring jumlah data. Jika data 10x lipat, waktu juga 10x lipat. (Contoh: Loop mencari data dalam array).
- **O(n^2) - Quadratic Time**: Sangat lambat untuk data besar. (Contoh: Nested loop / loop di dalam loop). **Hindari jika bisa**.

Kita akan membahas Big O lebih detail saat masuk ke materi Array dan Algoritma Sorting nanti.

---

## Praktik Sederhana (JavaScript)

Mari kita lihat perbedaan sederhana antara menyimpan data tanpa struktur yang baik vs menggunakan struktur (Array & Object).

### Tanpa Struktur Data

Kita menyimpan data siswa dalam variabel terpisah. Sangat sulit dikelola jika ada 100 siswa.

```javascript
// Tidak Efisien
let siswa1 = 'Budi';
let siswa2 = 'Siti';
let siswa3 = 'Agus';

// Jika ingin mencari "Siti", kita harus cek satu-satu variabelnya.
```

### Dengan Struktur Data (Array)

Kita mengelompokkan data sejenis ke dalam satu wadah.

```javascript
// Lebih Terstruktur (Linear)
const siswa = ['Budi', 'Siti', 'Agus'];

// Mengakses data jauh lebih mudah
console.log(siswa); // Output: Siti
```

### Dengan Struktur Data (Object/Map)

Kita memberikan label (key) untuk data yang lebih kompleks.

```javascript
// Lebih Terstruktur (Key-Value)
const detailSiswa = {
  nama: 'Siti',
  umur: 20,
  jurusan: 'Informatika',
};

console.log(detailSiswa.jurusan); // Output: Informatika
```

---

Di sesi berikutnya, kita akan masuk ke **Mastering Array**, di mana kita akan membedah struktur data paling populer ini secara mendalam, termasuk cara kerja memorinya.
