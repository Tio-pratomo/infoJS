---
title: ' Object & Hash Table'
---

Setelah menguasai Array yang bersifat linear, sekarang kita akan membahas struktur data yang memungkinkan Anda mengakses data secepat kilat tanpa harus mengingat urutannya.

## Materi: Memahami Konsep Hash Table

### Apa Itu Object/Hash Table?

Jika Array adalah lemari dengan laci bernomor urut (0, 1, 2...), **Hash Table** adalah lemari dengan **label khusus** (key). Anda tidak perlu tahu data itu ada di laci nomor berapa, Anda cukup tahu "label"-nya.

Struktur ini menyimpan data dalam pasangan **Key-Value** (Kunci-Nilai).

- **Key**: Label unik untuk mengakses data (misal: "Nama").
- **Value**: Data yang disimpan (misal: "Budi").

### Bagaimana Hash Table Bekerja?

Di balik layar, Hash Table sebenarnya menggunakan Array juga. Tapi, ia punya asisten cerdas bernama **Hashing Function**.

1.  **Input Key**: Anda memasukkan key, misal `"Kucing"`.
2.  **Hashing**: Fungsi hash mengubah teks `"Kucing"` menjadi angka indeks yang unik (misal: index `42`).
3.  **Simpan/Ambil**: Komputer langsung menuju ke laci nomor `42` untuk menyimpan atau mengambil datanya.

Proses ini membuat pencarian data di Hash Table sangat cepat, yaitu **O(1)** (hampir instan), tidak peduli seberapa banyak data yang Anda simpan.

### Hash Collision (Tabrakan Hash)

Kadang-kadang, fungsi hash bisa tidak sengaja menghasilkan nomor laci yang sama untuk dua key yang berbeda (misal: `"Kucing"` dan `"Anjing"` sama-sama dapat index `42`). Ini disebut **Collision**.
Cara mengatasinya:

- **Chaining**: Di dalam laci nomor `42`, kita buat daftar kecil (Linked List) untuk menampung kedua data tersebut.
- **Open Addressing**: Mencari laci kosong terdekat selanjutnya.

---

## Praktik: Object & Map di JavaScript

Di JavaScript, implementasi paling umum dari Hash Table adalah **Object** dan **Map**.

### 1. Menggunakan Object (Basic)

Paling sering digunakan untuk data yang terstruktur. Key di Object biasanya berupa String.

```javascript
// Membuat Object (Hash Table)
const mahasiswa = {
  nim: '10112233', // Key: "nim", Value: "10112233"
  nama: 'Budi Santoso',
  jurusan: 'Teknik Informatika',
};

/**
 * READ (O(1)) - Sangat Cepat!
 * Tidak perlu looping, langsung tembak key-nya.
 */
console.log(mahasiswa.nama); // Output: "Budi Santoso"

console.log(mahasiswa['jurusan']); // Output: "Teknik Informatika"

// INSERT / UPDATE (O(1))
mahasiswa.ipk = 3.75; // Menambah key baru
mahasiswa.nama = 'Budi S.'; // Mengupdate value

// DELETE (O(1))
delete mahasiswa.nim;
```

### 2. Menggunakan Map (Advanced)

**Map** adalah struktur data yang lebih modern (ES6) dan lebih cocok jika Anda butuh Hash Table murni. Kelebihannya dibanding Object:

- Key bisa berupa tipe data apa saja (bukan cuma string).
- Punya properti `.size` untuk cek jumlah data (di Object harus hitung manual).
- Urutan penyisipan data terjaga.

```javascript
const inventory = new Map();

// INSERT
inventory.set('Topi', 50);
inventory.set('Kaos', 100);
inventory.set(123, 'Kode Barang'); // Key bisa berupa number!

// READ
console.log(inventory.get('Topi')); // Output: 50

// CHECK EXISTENCE
if (inventory.has('Kaos')) {
  console.log('Stok kaos tersedia');
}

// DELETE
inventory.delete(123);

// ITERASI (Looping)
inventory.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});
```

### Kapan Pakai Array vs Object?

| Kebutuhan           | Gunakan...     | Alasan                               |
| :------------------ | :------------- | :----------------------------------- |
| Data berurutan      | **Array**      | Butuh index 0, 1, 2...               |
| Akses acak cepat    | **Object/Map** | Butuh akses langsung via key (O(1))  |
| Data sejenis (List) | **Array**      | Contoh: List komentar, List produk   |
| Data satu entitas   | **Object**     | Contoh: User (ada nama, email, umur) |

---

## Tugas Mini

Bayangkan Anda membuat sistem login sederhana. Buatlah sebuah `Map` yang menyimpan _database_ user dengan format:

- Key: Username
- Value: Password

1.  Isi dengan 3 user.
2.  Cek apakah user "admin" ada di database.
3.  Ambil password milik salah satu user.

---

Anda sekarang sudah menguasai dua struktur data paling fundamental: Linear (Array) dan Key-Value (Hash Table). Selanjutnya di **Sesi 4**, kita akan masuk ke struktur data yang mengatur "antrean" dan "tumpukan": **Stack & Queue**.

Siap lanjut?
