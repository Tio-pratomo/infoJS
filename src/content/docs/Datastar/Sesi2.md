---
title: 'Menguasai State Frontend dengan Signals dan Expressions'
---

Setelah memahami arsitektur inti Datastar di Sesi 1, kita akan mendalami fitur paling kuatnya: manajemen state frontend melalui **signals** dan **expressions** yang reaktif.

Sesi ini membahas cara mendeklarasikan, mengikat (_bind_), dan memanipulasi state di sisi klien, membentuk dasar untuk semua komponen antarmuka pengguna yang dinamis.

## Deklarasi State dengan `data-signals`

Mekanisme utama untuk mendefinisikan state adalah atribut `data-signals`. Atribut ini harus ditempatkan pada elemen pembungkus (seperti `<div>`) dan menerima objek JSON yang menginisialisasi state reaktif.

**Contoh sederhana:**

```html
<div data-signals='{ "name": "Guest", "isLoggedIn": false }'>
  Selamat datang, <span data-text="$name"></span>
</div>
```

Pada contoh di atas:

- Sinyal `name` diinisialisasi dengan nilai `"Guest"`
- Sinyal `isLoggedIn` diinisialisasi dengan nilai `false`
- Kedua sinyal dapat diakses menggunakan awalan `$` di mana saja dalam elemen dan anak-anaknya (contoh: `$name`, `$isLoggedIn`)

## Sistem Binding: Menghubungkan State ke UI

Datastar menyediakan serangkaian atribut `data-*` khusus yang menciptakan hubungan langsung antara nilai sinyal dan properti elemen DOM. Berikut adalah atribut binding yang paling penting:

### `data-text` — Menampilkan Teks

Atribut ini mengatur konten teks sebuah elemen sesuai nilai sinyal.

```html
<span data-text="$count"></span>
```

Jika `$count` adalah `5`, elemen akan menampilkan teks "5". Setiap kali sinyal berubah, teks diperbarui secara otomatis.

### `data-bind-value` — Two-Way Binding untuk Input

Atribut ini menciptakan hubungan dua arah antara input form dan sinyal. Ketika pengguna mengetik di input, sinyal diperbarui, dan sebaliknya.

```html
<input type="text" data-bind-value="$username" placeholder="Masukkan nama pengguna" />
```

Ketika pengguna mengetik "alice", sinyal `$username` secara otomatis menjadi `"alice"`. Jika sinyal diubah dari luar, input akan menampilkan nilai baru.

### `data-class` — Class CSS Dinamis

Atribut ini secara kondisional mengaktifkan atau menonaktifkan kelas CSS berdasarkan ekspresi sinyal.

```html
<div data-class="is-active:$isActive">Konten</div>
```

Format: `data-class="namaKelas:ekspresi"`. Ketika ekspresi bernilai _truthy_, kelas `is-active` ditambahkan; ketika _falsy_, kelas dihapus.

**Contoh dengan logika kondisional:**

```html
<button data-class="loading:$isLoading, success:$isSuccess">Kirim Data</button>
```

Anda bisa menentukan beberapa kelas dengan memisahkannya dengan koma.

### `data-attr` — Atribut HTML Dinamis

Atribut ini mengatur atribut HTML standar secara dinamis menggunakan ekspresi sinyal.

```html
<img data-attr-src="$profileImageUrl" alt="Profil" />
<a data-attr-href="'/user/' + $userId">Lihat Profil</a>
```

Format: `data-attr-namaAtribut="ekspresi"`. Dalam contoh pertama, atribut `src` diperbarui sesuai nilai `$profileImageUrl`. Pada contoh kedua, atribut `href` dibangun secara dinamis menggunakan ekspresi string.

### `data-show` dan `data-hide` — Kontrol Visibilitas

Atribut ini mengontrol visibilitas elemen dengan mengatur properti CSS `display` menjadi `none` ketika kondisi terpenuhi.

```html
<!-- Tampilkan ketika $isLoggedIn true -->
<div data-show="$isLoggedIn">Anda telah login!</div>

<!-- Sembunyikan ketika $isLoading true -->
<div data-hide="$isLoading">Konten utama</div>
```

## Expressions — Logika Reaktif di Atribut

**Expressions** adalah ekspresi mirip JavaScript yang dievaluasi di dalam atribut Datastar. Mereka mendukung operator logika, kondisional, dan akses properti sinyal.

**Operator yang didukung:**

- **Logika**: `&&` (dan), `||` (atau), `!` (negasi)
- **Ternary**: `kondisi ? nilaiYes : nilaiNo`
- **Akses properti**: `$object.property`, `$array[0]`, `$string.length`
- **Aritmatika**: `+`, `-`, `*`, `/`, `%`
- **Perbandingan**: `==`, `!=`, `<`, `>`, `<=`, `>=`

**Contoh ekspresi:**

```html
<!-- Negasi -->
<div data-show="!$isLoading">Data siap</div>

<!-- Ternary -->
<span data-text="$score > 50 ? 'Lulus' : 'Gagal'"></span>

<!-- Akses properti -->
<p data-text="$user.name + ' (' + $user.age + ' tahun)'"></p>

<!-- Logika kompleks -->
<button data-class="disabled:$isLoading || $formInvalid" data-show="$isLoggedIn && $hasPermission">
  Aksi
</button>
```

**Kata kunci khusus:**

- **`el`**: Mereferensikan elemen HTML tempat atribut tersebut melekat, memungkinkan Anda untuk mengakses properti elemen.

```html
<input
  type="text"
  data-bind-value="$searchTerm"
  data-on-input="@get('/search?q=' + encodeURIComponent($searchTerm))"
/>
```

## Computed Signals — State Turunan Reaktif

Untuk state yang dihitung dari sinyal lain, Datastar menawarkan atribut `data-computed`. Atribut ini mendefinisikan sinyal _read-only_ yang nilainya otomatis diperbarui ketika sinyal sumbernya berubah.

```html
<div data-signals='{ "firstName": "John", "lastName": "Doe" }'>
  <div data-computed="fullName: $firstName + ' ' + $lastName"></div>
  <p>Nama lengkap: <span data-text="$fullName"></span></p>
</div>
```

Ketika `firstName` atau `lastName` berubah, sinyal `fullName` secara otomatis dihitung ulang dan elemen yang menggunakan `$fullName` diperbarui.

## Tabel Ringkasan Atribut Binding

| Atribut           | Kegunaan                                         | Contoh                               |
| :---------------- | :----------------------------------------------- | :----------------------------------- |
| `data-text`       | Menampilkan teks dari sinyal                     | <span data-text="$count"></span>     |
| `data-bind-value` | Two-way binding untuk input/textarea             | <input data-bind-value="$username">  |
| `data-class`      | Menambah/menghapus kelas CSS berdasarkan sinyal  | <div data-class="active:$isActive">  |
| `data-attr-*`     | Mengatur atribut HTML dinamis                    | <img data-attr-src="$imageUrl">      |
| `data-show`       | Tampilkan jika kondisi _truthy_                  | <div data-show="$isVisible">         |
| `data-hide`       | Sembunyikan jika kondisi _truthy_                | <div data-hide="$isLoading">         |
| `data-computed`   | Mendefinisikan sinyal computed (_derived state_) | <div data-computed="total: $a + $b"> |

## Contoh Praktis: Formulir Profil Interaktif dengan Validasi

Mari kita bangun aplikasi yang menggabungkan berbagai atribut binding, expressions, dan computed signals. Aplikasi ini memungkinkan pengguna untuk melihat profil mereka dan mengeditnya dengan validasi real-time.

**File: `index.html` (Frontend)**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Formulir Profil Datastar</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      #profile-form {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 600px;
        width: 100%;
      }

      h2 {
        color: #333;
        margin-bottom: 10px;
        font-size: 28px;
      }

      .subtitle {
        color: #999;
        margin-bottom: 20px;
        font-size: 14px;
      }

      .view-mode {
        margin-bottom: 20px;
      }

      .info-row {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .info-row strong {
        display: inline-block;
        width: 120px;
        color: #555;
      }

      .info-row span {
        color: #333;
        font-weight: 500;
      }

      .edit-mode {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        display: none;
      }

      .edit-mode.active {
        display: block;
      }

      .form-group {
        margin-bottom: 15px;
      }

      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }

      input[type='text'],
      input[type='email'],
      input[type='number'],
      textarea {
        width: 100%;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.3s;
      }

      input[type='text']:focus,
      input[type='email']:focus,
      input[type='number']:focus,
      textarea:focus {
        outline: none;
        border-color: #667eea;
      }

      textarea {
        resize: vertical;
        min-height: 100px;
      }

      .error-message {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 3px;
      }

      .button-group {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }

      button {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        flex: 1;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
      }

      .btn-secondary {
        background: #e0e0e0;
        color: #333;
        flex: 1;
      }

      .btn-secondary:hover {
        background: #d0d0d0;
      }

      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #667eea;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 15px;
      }

      .editing-indicator {
        background: #fff3cd;
        border: 1px solid #ffc107;
        color: #856404;
        padding: 10px 15px;
        border-radius: 6px;
        margin-top: 15px;
        font-size: 13px;
      }

      .success-message {
        background: #d4edda;
        border: 1px solid #28a745;
        color: #155724;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 15px;
        display: none;
      }

      .success-message.show {
        display: block;
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div
      id="profile-form"
      data-signals='{
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "bio": "Pengembang web bersemangat dengan minat pada teknologi modern.",
        "age": 28,
        "isEditing": false,
        "validationErrors": {},
        "isSaving": false,
        "saveSuccess": false
    }'
    >
      <!-- Pesan Sukses -->
      <div class="success-message" data-class="show:$saveSuccess">✓ Profil berhasil disimpan!</div>

      <!-- State Turunan: Nama Lengkap -->
      <div data-computed="fullName: $firstName + ' ' + $lastName"></div>

      <!-- Tampilan Profil (Mode Lihat) -->
      <div class="view-mode" data-show="!$isEditing">
        <div class="avatar" data-text="$firstName.charAt(0)"></div>
        <h2 data-text="$fullName"></h2>
        <p class="subtitle">Anggota sejak 2020</p>

        <div class="info-row">
          <strong>Email:</strong>
          <span data-text="$email"></span>
        </div>
        <div class="info-row">
          <strong>Umur:</strong>
          <span data-text="$age + ' tahun'"></span>
        </div>
        <div class="info-row">
          <strong>Bio:</strong>
          <span data-text="$bio"></span>
        </div>

        <button class="btn-primary" data-on-click="$isEditing = true; $saveSuccess = false">
          Edit Profil
        </button>
      </div>

      <!-- Formulir Edit (Mode Edit) -->
      <form
        class="edit-mode"
        data-class="active:$isEditing"
        data-on-submit.prevent="@post('/save-profile')"
      >
        <h3>Edit Profil</h3>

        <div class="form-group">
          <label>Nama Depan:</label>
          <input type="text" data-bind-value="$firstName" placeholder="Masukkan nama depan" />
          <div class="error-message" data-show="$validationErrors.firstName">
            <span data-text="$validationErrors.firstName"></span>
          </div>
        </div>

        <div class="form-group">
          <label>Nama Belakang:</label>
          <input type="text" data-bind-value="$lastName" placeholder="Masukkan nama belakang" />
          <div class="error-message" data-show="$validationErrors.lastName">
            <span data-text="$validationErrors.lastName"></span>
          </div>
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input type="email" data-bind-value="$email" placeholder="Masukkan email" />
          <div class="error-message" data-show="$validationErrors.email">
            <span data-text="$validationErrors.email"></span>
          </div>
        </div>

        <div class="form-group">
          <label>Umur:</label>
          <input
            type="number"
            data-bind-value="$age"
            min="0"
            max="150"
            placeholder="Masukkan umur"
          />
          <div class="error-message" data-show="$validationErrors.age">
            <span data-text="$validationErrors.age"></span>
          </div>
        </div>

        <div class="form-group">
          <label>Bio:</label>
          <textarea data-bind-value="$bio" placeholder="Ceritakan tentang Anda..."></textarea>
          <div class="error-message" data-show="$validationErrors.bio">
            <span data-text="$validationErrors.bio"></span>
          </div>
        </div>

        <div class="button-group">
          <button type="submit" class="btn-primary" data-attr-disabled="$isSaving">
            <span data-show="!$isSaving">Simpan Perubahan</span>
            <span data-show="$isSaving">Menyimpan...</span>
          </button>
          <button
            type="button"
            class="btn-secondary"
            data-on-click="$isEditing = false; $validationErrors = {}"
          >
            Batal
          </button>
        </div>

        <div class="editing-indicator" data-show="$isEditing">✏️ Anda sedang mengedit profil</div>
      </form>
    </div>
  </body>
</html>
```

**Penjelasan HTML:**

1. **`data-signals`**: Mendeklarasikan seluruh state aplikasi termasuk data profil, status editing, error validasi, dan status penyimpanan.

2. **`data-computed="fullName: ..."`**: Membuat sinyal turunan `fullName` yang otomatis digabungkan dari `firstName` dan `lastName`.

3. **`data-show="!$isEditing"` dan `data-class="active:$isEditing"`**: Mengontrol visibilitas antara tampilan profil dan formulir edit.

4. **`data-text="$firstName.charAt(0)"`**: Menampilkan huruf pertama nama untuk avatar.

5. **`data-bind-value="$firstName"`**: Binding dua arah antara input dan sinyal.

6. **`data-show="$validationErrors.firstName"`**: Menampilkan pesan error jika ada.

7. **`data-on-click="$isEditing = true"`**: Mengubah state lokal tanpa mengirim ke server.

8. **`data-on-submit.prevent="@post('/save-profile')"`**: Mengirim formulir ke server dengan modifier `.prevent` untuk mencegah refresh halaman.

**File: `server.js` (Backend Node.js/Express)**

```js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Endpoint untuk menyimpan profil
app.post('/save-profile', (req, res) => {
  const { firstName, lastName, email, bio, age } = req.body || {};

  // Validasi di sisi server
  const errors = {};
  if (!firstName || String(firstName).trim().length < 2) {
    errors.firstName = 'Nama depan minimal 2 karakter';
  }
  if (!lastName || String(lastName).trim().length < 2) {
    errors.lastName = 'Nama belakang minimal 2 karakter';
  }
  if (!email || !String(email).includes('@')) {
    errors.email = 'Format email tidak valid';
  }
  if (age && (Number(age) < 1 || Number(age) > 150)) {
    errors.age = 'Umur harus antara 1 dan 150 tahun';
  }

  // Jika ada error, kirim patch sinyal dengan error
  if (Object.keys(errors).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      validationErrors: errors,
      isEditing: true,
      isSaving: false,
    });
  }

  // Simulasi penyimpanan ke database
  console.log('Profil disimpan:', { firstName, lastName, email, bio, age });

  // Kirim patch sinyal sukses
  res.setHeader('Content-Type', 'application/json');
  res.json({
    firstName,
    lastName,
    email,
    bio,
    age,
    isEditing: false,
    validationErrors: {},
    isSaving: false,
    saveSuccess: true,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
```

**Penjelasan Backend:**

1. **Menerima data dari form**: Endpoint menerima JSON body dengan data profil.

2. **Validasi di sisi server**: Melakukan validasi lengkap sebelum menyimpan.

3. **Respons dengan patch sinyal**:
   - Jika ada error, kirim `application/json` dengan `validationErrors` dan `isEditing: true` sehingga form tetap terbuka.
   - Jika sukses, kirim data baru, tutup form (`isEditing: false`), kosongkan error, dan set `saveSuccess: true` untuk menampilkan pesan sukses.

**Alur Lengkap:**

1. **User membuka halaman**: Profil ditampilkan dalam mode lihat dengan avatar, nama, email, umur, dan bio.

2. **User klik "Edit Profil"**: Sinyal `$isEditing` berubah menjadi `true`, dan form edit muncul.

3. **User mengubah input**: Setiap perubahan pada input secara otomatis memperbarui sinyal terkait (misalnya `firstName` pada input "Nama Depan").

4. **User klik "Simpan"**: Formulir dikirim ke `/save-profile` dengan aksi `@post('/save-profile')`.

5. **Server memvalidasi**:

   - Jika error, kirim patch sinyal dengan `validationErrors`. Form tetap terbuka, dan error ditampilkan.
   - Jika sukses, kirim patch sinyal dengan data baru dan `isEditing: false`, sehingga tampilan berubah kembali ke mode lihat.

6. **Pesan sukses muncul**: Sinyal `saveSuccess` menjadi `true`, dan pesan sukses ditampilkan selama beberapa detik.

## Konsep Penting yang Dipelajari di Sesi 2

**Deklarasi Reaktif**: State dideklarasikan dalam JSON di atribut `data-signals`, bukan dalam JavaScript.

**Binding Otomatis**: Atribut `data-*` (seperti `data-text`, `data-bind-value`, `data-class`) secara otomatis menjaga UI tetap sinkron dengan state tanpa perlu event listener manual.

**Expressions Aman**: Expressions mendukung sintaks mirip JavaScript tetapi dijalankan dalam sandbox yang aman.

**Computed Signals**: State turunan yang otomatis diperbarui ketika sumber state berubah.

**Two-Way Binding**: Input form secara otomatis memperbarui sinyal, dan sinyal memperbarui input.

Sekarang Anda memiliki pemahaman mendalam tentang manajemen state di frontend. Di **Sesi 3**, Anda akan mempelajari cara memicu aksi di backend dan menangani respons server secara efisien.
