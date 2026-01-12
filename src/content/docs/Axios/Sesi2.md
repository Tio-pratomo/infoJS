---
title: Mengirim Pesan dengan Axios
---

## Request Method (Berbagai Cara Mengirim Surat)

Sama seperti Anda bisa mengirim surat dengan berbagai cara (surat biasa, surat kilat, atau bahkan mengirim paket besar), Axios juga menyediakan berbagai metode untuk melakukan permintaan HTTP.

Metode-metode ini sesuai dengan jenis operasi yang ingin Anda lakukan pada data di server.
Berikut adalah beberapa cara utama untuk memberitahu Axios untuk mengirim permintaan:

### **a. Cara Umum (Paling Fleksibel)**

Ini adalah cara paling dasar dan paling fleksibel untuk membuat permintaan dengan Axios, di mana Anda secara eksplisit menentukan semua detail permintaan dalam sebuah objek konfigurasi.

#### `axios({config})`

Anda memberikan Axios sebuah objek config yang berisi semua detail permintaan, seperti url (alamat tujuan), method (jenis permintaan seperti 'GET', 'POST', dll.), dan data yang ingin dikirim.

Ini seperti Anda mengisi formulir pengiriman paket yang sangat lengkap, di mana Anda menuliskan alamat tujuan, jenis paketnya, dan semua detail penting lainnya.

##### Contoh Kode

```js wrap
axios({
  method: 'get', // Jenis permintaan: mengambil data
  url: 'https://api.example.com/users', // Alamat tujuan
  params: {
    // Data yang akan ditambahkan ke URL sebagai parameter
    id: 123,
  },
})
  .then(function (response) {
    // Jika permintaan berhasil, jalankan kode ini
    console.log(response.data); // Menampilkan data yang diterima dari server
  })
  .catch(function (error) {
    // Jika ada kesalahan, jalankan kode ini
    console.error(error); // Menampilkan pesan kesalahan
  });
```

#### `axios.request(config)`

Ini adalah alias (nama lain) dari axios({config}). Fungsinya sama persis, hanya penulisannya sedikit berbeda.

Sama seperti yang di atas, hanya saja ini seperti formulir pengiriman yang sudah ada tulisan "Formulir Permintaan" di judulnya.

##### Contoh Kode

```js {title="JavaScript" wrap="true"}
axios
  .request({
    method: 'post', // Jenis permintaan: mengirim data baru
    url: 'https://api.example.com/products', // Alamat tujuan
    data: {
      // Data yang akan dikirim di badan permintaan
      name: 'Laptop Gaming',
      price: 15000000,
    },
  })
  .then((response) => {
    console.log('Produk berhasil ditambahkan:', response.data);
  })
  .catch((error) => {
    console.error('Gagal menambahkan produk:', error);
  });
```

### **b. Cara Praktis (Untuk Metode Umum)**

Axios menyediakan metode yang lebih singkat dan langsung untuk jenis permintaan HTTP yang paling umum. Ini sangat praktis karena Anda tidak perlu menulis method: 'get' atau method: 'post' secara eksplisit dalam objek konfigurasi.

#### `axios.get(url[, config])`

Digunakan untuk mengambil data dari server. Anda hanya perlu menentukan url (alamat data yang ingin diambil). config bersifat opsional jika Anda perlu pengaturan tambahan.

Ini seperti meminta kurir untuk "mengambilkan" sesuatu dari alamat tertentu.

##### Contoh Kode

```js {title="JavaScript" wrap="true"}
// Mengambil daftar pengguna
axios
  .get('https://api.example.com/users')
  .then((response) => {
    console.log('Daftar Pengguna:', response.data);
  })
  .catch((error) => {
    console.error('Gagal mengambil daftar pengguna:', error);
  });

// Mengambil pengguna dengan ID tertentu, menggunakan config untuk params
axios
  .get('https://api.example.com/user', {
    params: {
      id: 456,
    },
  })
  .then((response) => {
    console.log('Detail Pengguna:', response.data);
  })
  .catch((error) => {
    console.error('Gagal mengambil detail pengguna:', error);
  });
```

#### `axios.post(url[, data[, config]])`

Digunakan untuk mengirim data baru ke server (misalnya, membuat postingan baru, mendaftar pengguna baru). Anda perlu menentukan url dan data yang akan dikirim. config bersifat opsional.

Ini seperti meminta kurir untuk "mengirimkan" sebuah paket baru ke alamat tertentu.

##### Contoh Kode

```js {title="JavaScript" wrap="true"}
// Mengirim data pengguna baru
axios
  .post('https://api.example.com/register', {
    username: 'john.doe',
    email: 'john@example.com',
    password: 'secretpassword',
  })
  .then((response) => {
    console.log('Pendaftaran berhasil:', response.data);
  })
  .catch((error) => {
    console.error('Pendaftaran gagal:', error);
  });
```

#### `axios.put(url[, data[, config]])`

Digunakan untuk memperbarui (update) seluruh sumber daya yang sudah ada di server. Anda perlu url dan data yang akan menggantikan data lama. config opsional.

Ini seperti meminta kurir untuk "mengganti seluruh isi" kotak yang sudah ada di alamat tertentu dengan isi kotak yang baru.

##### Contoh Kode

```js {title="JavaScript" wrap="true"}
// Memperbarui detail produk secara keseluruhan
axios
  .put('https://api.example.com/products/123', {
    id: 123, // ID produk yang diperbarui
    name: 'Laptop Ultra Slim', // Nama baru
    price: 18000000, // Harga baru
    stock: 50, // Stok baru
  })
  .then((response) => {
    console.log('Produk berhasil diperbarui:', response.data);
  })
  .catch((error) => {
    console.error('Gagal memperbarui produk:', error);
  });
```

#### `axios.patch(url[, data[, config]])`

Digunakan untuk memperbarui (update) sebagian sumber daya yang sudah ada di server. Anda perlu url dan data yang berisi hanya bagian yang ingin diubah. config opsional.

Ini seperti meminta kurir untuk "menambahkan atau mengubah sebagian kecil" dari isi kotak yang sudah ada di alamat tertentu, tanpa perlu mengganti seluruh isinya.

##### Contoh Kode

```js {title="JavaScript" wrap="true"}
// Hanya memperbarui stok produk
axios
  .patch('https://api.example.com/products/123', {
    stock: 45, // Hanya mengubah stok
  })
  .then((response) => {
    console.log('Stok produk berhasil diperbarui:', response.data);
  })
  .catch((error) => {
    console.error('Gagal memperbarui stok produk:', error);
  });
```

#### `axios.delete(url[, config])`

Digunakan untuk menghapus sumber daya dari server. Anda hanya perlu menentukan url dari data yang ingin dihapus. config opsional.

Ini seperti meminta kurir untuk "membuang" atau "menghilangkan" sebuah kotak dari alamat tertentu.

##### Contoh Kode

```js {title="JavaScript" wrap="true"}
// Menghapus pengguna dengan ID 789
axios
  .delete('https://api.example.com/users/789')
  .then((response) => {
    console.log('Pengguna berhasil dihapus:', response.data);
  })
  .catch((error) => {
    console.error('Gagal menghapus pengguna:', error);
  });
```

#### `axios.head(url[, config])`

Digunakan untuk mengambil header respons saja, tanpa isi (badan) respons. Berguna untuk memeriksa keberadaan sumber daya atau informasi meta tanpa mengunduh seluruh data.

Ini seperti meminta kurir untuk hanya memberikan informasi "label paket" saja (berat, pengirim, jenis barang) tanpa membuka dan melihat isi paketnya.

##### Contoh Kode

```js {title="JavaScript" wrap="true"}
axios
  .head('https://api.example.com/document.pdf')
  .then((response) => {
    console.log('Header Dokumen:', response.headers);
    // Anda bisa memeriksa 'content-type' atau 'content-length' di sini
  })
  .catch((error) => {
    console.error('Gagal mengambil header dokumen:', error);
  });
```

#### `axios.options(url[, config])`

Digunakan untuk mendapatkan informasi tentang opsi komunikasi yang tersedia untuk sumber daya target. Ini memberi tahu Anda metode HTTP apa saja yang diizinkan untuk URL tersebut.

Ini seperti bertanya kepada kurir, "Metode pengiriman apa saja yang tersedia untuk alamat ini?"

##### Contoh Kode

```js {title="JavaScript" wrap="true"}
axios
  .options('https://api.example.com/users')
  .then((response) => {
    // Biasanya, informasi metode yang diizinkan ada di header 'Allow'
    console.log('Metode yang diizinkan untuk /users:', response.headers.allow);
  })
  .catch((error) => {
    console.error('Gagal mendapatkan opsi:', error);
  });
```

---

Memahami berbagai metode ini akan sangat membantu Anda dalam berinteraksi dengan API server secara efektif.
