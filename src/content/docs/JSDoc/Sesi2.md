---
title: Tag pada JSDoc
---

JSDoc memiliki banyak tag untuk membantu Anda mendokumentasikan kode. Menggunakan tag ini akan membuat kode Anda lebih rapi, terstruktur, dan mudah dipahami oleh orang lain.

## Tag Deskripsi

**@description** → Untuk deskripsi panjang.

```js
/**
 * @description Fungsi ini adalah...
 */
```

**@summary** → Untuk deskripsi singkat, biasanya satu baris.

```js
/**
 * @summary Menampilkan nama pengguna.
 */
```

**@see** → Untuk merujuk ke halaman atau fungsi lain.

```js
/**
 * @see {@link https://example.com/docs}
 */
```

---

## Tag Fungsi

**@param** → Mendokumentasikan parameter (input) fungsi.

```js
/**
 * @param {string} userName  Nama pengguna.
 */
```

**@returns** → Mendokumentasikan nilai yang dikembalikan (output).

```js
/**
 * @returns {number} Panjang string.
 */
```

**@throws** → Mendokumentasikan kesalahan yang mungkin terjadi.

```js
/**
 * @throws {Error} Jika ID tidak ditemukan.
 */
```

**@example** → Memberikan contoh kode yang bisa langsung dicoba.

```js
/**
 * @example
 * const result = add(1, 2); // 3
 */
```

---

## Tag Tipe

**@type** → Menentukan tipe data sebuah variabel.

```js
/** @type {string} */
const nama = 'Budi';
```

**@typedef** → Membuat "tipe data kustom" untuk objek yang kompleks.

```js
/**
 * @typedef {object} User
 * @property {number} id
 */
```

**@callback** → Mendokumentasikan tipe data untuk fungsi callback.

```js
/**
 * @callback DoneCallback
 * @param {string} message  Pesan.
 */
```

---

## Tag Kelas dan Modul

**@class**, **@classdesc**, **@extends**

```js
/**
 * @class
 * @extends Vehicle
 */
class Car extends Vehicle {}
```

**@module** → Mendokumentasikan sebuah file JavaScript sebagai modul.
**@file** → Mendokumentasikan file secara keseluruhan.

---

## Tag Tambahan

**@private** → Kode hanya untuk penggunaan internal.
**@public** → Kode bisa diakses dari luar.
**@deprecated** → Menandai bahwa kode sudah usang.

```js
/**
 * @deprecated Gunakan fungsi baru `hitungTotal`.
 */
```

**@author**
**@version**
**@since**

Semua tag ini dapat digabungkan di komentar JSDoc untuk memberikan informasi yang lengkap dan terstruktur.
