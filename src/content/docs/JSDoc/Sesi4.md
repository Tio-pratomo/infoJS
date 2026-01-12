---
title: Mendokumentasikan Elemen Lanjutan
---

### Mendokumentasikan Tipe Kustom (@typedef)

Saat kode Anda menjadi lebih kompleks, Anda mungkin memiliki objek dengan struktur yang sering digunakan di beberapa tempat.  
Daripada mendeskripsikan ulang strukturnya setiap kali, Anda bisa membuat "tipe kustom" dengan tag `@typedef`.

Ini sangat berguna untuk menjaga konsistensi dan membuat dokumentasi Anda lebih mudah dibaca.

---

#### Contoh Penggunaan

Berikut adalah contoh penggunaan `@typedef` untuk mendefinisikan tipe kustom **User** yang merepresentasikan data pengguna.

```js
/**
 * @typedef {object} User
 * @property {number} id - User id yang sifatnya unik
 * @property {string} name - Nama lengkap user
 * @property {number} age - Umur user tersebut
 */

/**
 * @param {number} id - wajib mengirim id user
 * @returns {User | undefined} Kembalikan tipe User jika tidak ada kembalikan undefined
 */
function getUser(id) {
  const data = [
    { id: 1234, name: 'Willa', age: 32 },
    { id: 1122, name: 'Toha', age: 14 },
    { id: 3456, name: 'Sulis', age: 31 },
  ];
  return data.find((person) => person.id === id);
}
```

Dalam contoh di atas, kita mendefinisikan tipe kustom bernama `User` yang kemudian digunakan sebagai tipe data kembalian pada fungsi `getUser`.

---

#### Manfaat Menggunakan @typedef

Meskipun Anda bisa langsung mendefinisikan objek dalam JSDoc (`@returns {object}`), menggunakan `@typedef` menawarkan beberapa manfaat utama:

1. **Kejelasan dan Keterbacaan**
   Menggunakan `@typedef` mengubah objek yang ambigu menjadi tipe data yang terstruktur dan bermakna.
   Anda bisa memberikan nama yang deskriptif (misalnya, `User`) yang langsung memberitahu pembaca tentang struktur data yang diharapkan.

2. **Konsistensi dan Penggunaan Kembali**
   Bayangkan Anda memiliki 10 fungsi berbeda yang semuanya menggunakan objek `User`.
   Tanpa `@typedef`, Anda harus menulis ulang struktur objek di setiap fungsi.
   Jika ada perubahan (misalnya menambahkan `email`), Anda harus mengubah semua fungsi.
   Dengan `@typedef`, cukup ubah sekali di definisi tipe, maka seluruh fungsi ikut konsisten.

   Contoh tanpa typedef:

   ```js
   /**
    * @param {{id: number, name: string}} user - Objek user yang berisi ID dan nama.
    */
   ```

3. **Dukungan Editor Kode**
   Editor modern seperti VS Code dapat memahami tipe kustom yang Anda buat.
   Ini mengaktifkan fitur autokomplet dan pemeriksaan tipe, membantu mencegah error dan mempercepat pengembangan.

---

#### Jangkauan (@typedef)

Definisi tipe kustom dengan `@typedef` hanya berlaku di dalam file tempat tipe tersebut didefinisikan.
Untuk menggunakannya di file lain, perlu di-_import_ dengan `@import`.

**File 1: types.js**

```js
/**
 * @typedef {object} User
 * @property {number} id
 * @property {string} name
 * @property {number} age
 */
```

**File 2: userService.js**

```js
/** @typedef {import('./types.js').User} User */

/**
 * @param {User} user
 */
function displayUser(user) {
  console.log(`Halo, ${user.name}!`);
}
```

---

### Mendokumentasikan Kelas

Gunakan `@class`, `@constructor`, `@member`, dan `@method`.

```js
/**
 * Kelas yang merepresentasikan sebuah buku.
 * @class
 */
class Buku {
  /**
   * @constructor
   * @param {string} judul - Judul buku.
   * @param {string} pengarang - Nama pengarang buku.
   */
  constructor(judul, pengarang) {
    /** @member {string} */
    this.judul = judul;

    /** @member {string} */
    this.pengarang = pengarang;
  }

  /**
   * Menampilkan deskripsi singkat tentang buku.
   * @method
   * @returns {string} Deskripsi buku.
   */
  getDeskripsi() {
    return `Buku berjudul "${this.judul}" oleh ${this.pengarang}.`;
  }
}
```

---

### Mendokumentasikan Modul (@module)

Jika Anda menggunakan skema modul (ES6 `import/export`), gunakan `@module` untuk mendokumentasikan berkas.

```js
/**
 * @module utilitas
 * @description Berisi fungsi-fungsi utilitas umum untuk operasi matematika.
 */

/**
 * Menjumlahkan dua angka.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function tambah(a, b) {
  return a + b;
}

/**
 * Mengurangi dua angka.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function kurang(a, b) {
  return a - b;
}
```

---

### Membuat Tautan Antar Halaman (@link)

Gunakan `{@link ...}` untuk membuat tautan internal.

```js
/**
 * Lihat {@link Buku} untuk informasi lebih lanjut.
 * @param {Buku} buku - Objek buku yang akan dicetak.
 * @returns {void}
 */
function cetakBuku(buku) {
  console.log(buku.getDeskripsi());
}
```

---

### Mendokumentasikan Props pada React JS dengan JSDoc

Anda bisa mendokumentasikan props langsung dengan `@param`, atau membuat typedef untuk struktur kompleks.

#### 1. Menggunakan @param

```js
/**
 * Komponen yang menampilkan pesan sapaan.
 * @param {object} props
 * @param {string} props.name - Nama pengguna.
 * @param {number} props.age - Umur pengguna.
 * @returns {JSX.Element}
 */
function Greeting(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>Anda berusia {props.age} tahun.</p>
    </div>
  );
}
```

#### 2. Menggunakan @typedef

```js
/**
 * @typedef {object} UserCardProps
 * @property {object} user - Data user.
 * @property {string} user.name
 * @property {number} user.age
 * @property {function} onUserClick - Dipanggil saat klik kartu.
 * @property {boolean} isPremium
 */

/**
 * Komponen yang menampilkan kartu user.
 * @param {UserCardProps} props
 * @returns {JSX.Element}
 */
function UserCard(props) {
  return (
    <div onClick={() => props.onUserClick(props.user.name)}>
      <h2>{props.user.name}</h2>
      <p>Umur: {props.user.age}</p>
      {props.isPremium && <p>Premium Member</p>}
    </div>
  );
}
```

---

#### Mendokumentasikan Tipe Props yang Berbeda

- **String, Number, Boolean, Array**:
  `@property {string}`, `@property {number}`, `@property {boolean}`, `@property {Array<string>}`
- **Fungsi**:
  `@property {function(string, number): void}`
- **ReactNode**:
  `@property {import("react").ReactNode}`
- **JSX.Element**:
  `@returns {JSX.Element}`

---

Dengan JSDoc, dokumentasi React maupun JavaScript kompleks tetap bisa rapi, jelas, dan terintegrasi dengan editor modern.
