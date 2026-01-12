---
title: Mendokumentasikan Tipe Dasar dan Fungsi
---

## Mengaktifkan Pengecekan Tipe di VS Code

VS Code memiliki fitur bawaan yang memanfaatkan komentar JSDoc untuk memberikan _feedback_ langsung tentang tipe data.  
Ini seperti memiliki TypeScript tanpa harus menulis TypeScript!

**Untuk mengaktifkannya, cukup tambahkan baris ini di bagian paling atas berkas JavaScript Anda:**

```js
// @ts-check
```

Setelah menambahkan baris ini, coba ubah kode Anda untuk membuat kesalahan tipe.
Misalnya, memanggil `tambah('1', 2)` atau mendeklarasikan `const number = "21"`.
VS Code akan menampilkan error seperti:

```
Type 'string' is not assignable to type 'number'
```

Peringatan ini membantu menemukan kesalahan lebih awal.

---

## Mendokumentasikan Tipe Data Dasar

Untuk mendokumentasikan variabel, gunakan tag `@type`. Tag ini memberi tahu JSDoc dan _tools_ seperti VS Code tentang jenis data yang diharapkan.

Contoh:

```js
/** @type {string} */
const namaPengguna = 'Alice';

/** @type {number} */
const umurPengguna = 25;

/** @type {boolean} */
const adalahAdmin = true;

/** @type {Array<string>} */
const daftarHobi = ['coding', 'hiking', 'membaca'];

/** @type {object} */
const dataPengguna = {
  nama: 'Bob',
  umur: 30,
};

/** @type {{id: number, name: string}} */
const personal = {
  id: 1234,
  name: 'sulistio',
};
console.log(personal);
```

---

## Mendokumentasikan Fungsi dengan Koleksi Data

```js
/**
 * @param {Array<string>} userNames - Sebuah array nama pengguna.
 * @returns {Array<number>} Panjang tiap nama.
 */
function getUserNameLengths(userNames) {
  return userNames.map((name) => name.length);
}

/**
 * @param {Map<string, number>} userAges - Map berisi nama dan umur.
 */
function displayUserAges(userAges) {
  for (const [name, age] of userAges) {
    console.log(`${name} berusia ${age} tahun.`);
  }
}

/**
 * @param {Set<string>} uniqueTags - Kumpulan tag unik.
 */
function countUniqueTags(uniqueTags) {
  return uniqueTags.size;
}
```

---

## Mendokumentasikan Fungsi

Gunakan `@param` untuk parameter dan `@returns` untuk nilai balikan.

```js
/**
 * Menjumlahkan dua angka.
 * @param {number} angka1 - Angka pertama.
 * @param {number} angka2 - Angka kedua.
 * @returns {number} Hasil penjumlahan.
 */
function tambah(angka1, angka2) {
  return angka1 + angka2;
}
```

**Penjelasan:**

- Baris pertama: deskripsi singkat.
- `@param {tipe} nama - deskripsi`: untuk parameter.
- `@returns {tipe} deskripsi`: untuk hasil fungsi.

---

### Parameter Opsional

Tambahkan kurung siku `[]` di sekitar nama parameter.

```js
/**
 * Mengucapkan salam dengan nama opsional.
 * @param {string} [nama] - Nama orang yang akan disapa.
 * @returns {string} Kalimat salam.
 */
function sapa(nama = 'Tamu') {
  return `Halo, ${nama}!`;
}
```

---

### Fungsi tanpa parameter & tanpa return

```js
/**
 * @returns {void}
 */
function niceGreeting() {
  console.log('Hello world');
}
```

---

### Parameter dengan Objek Terstruktur

Gunakan definisi tipe objek inline.

```js
/**
 * @param {{name: string, age: number}} user - Wajib ada nama dan umur.
 * @returns {void}
 */
function sayHello({ name, age }) {
  console.log(`Hallo nama saya ${name}, umur saya ${age}`);
}

sayHello({ name: 'Ipin', age: 6 });
```
