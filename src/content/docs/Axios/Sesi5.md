---
title: 'Axios Instance'
---

## Axios Instance (Cabang Kurir dengan Pengaturan Khusus)

Terkadang, dalam sebuah aplikasi besar, Anda mungkin perlu melakukan banyak permintaan ke server yang sama, atau ke beberapa server yang berbeda, tetapi dengan pengaturan dasar yang selalu sama.

Misalnya, semua permintaan ke api.example.com selalu membutuhkan baseURL yang sama dan Authorization header tertentu.

Daripada menulis pengaturan ini berulang kali di setiap permintaan, Anda bisa membuat "instance baru" atau "cabang kurir" dari Axios dengan konfigurasi khusus yang sudah ditetapkan.

## axios.create([config])

Fungsi ini memungkinkan Anda membuat objek Axios baru yang sudah memiliki konfigurasi dasar. Semua permintaan yang Anda lakukan menggunakan instance ini akan mewarisi konfigurasi dasar tersebut.

**Analogi :**

Ini seperti Anda mendirikan "kantor cabang kurir" sendiri.

Kantor cabang ini punya alamat utama yang sudah ditetapkan (misal, baseURL), jam operasional yang berbeda ( timeout), atau bahkan stempel khusus ( headers) yang selalu diterapkan pada setiap paket yang mereka kirim.

Jadi, Anda tidak perlu memberitahu setiap kurir di cabang tersebut tentang pengaturan ini berulang kali.

**Contoh Pembuatan dan Penggunaan Instance :**

```js {title="JavaScript" wrap="true"}
// Membuat instance Axios baru
const instance = axios.create({
  baseURL: 'https://api.example.com', // Menentukan URL dasar
  timeout: 5000, // Menentukan timeout (opsional)
  headers: {
    // Menentukan header (opsional)
    Authorization: 'Bearer your_token', // Header otorisasi
    'Content-Type': 'application/json', // Tipe konten
  },
});

// Setelah membuat instance, Anda dapat menggunakan instance tersebut
// untuk melakukan permintaan HTTP dengan menggunakan metode yang disediakan oleh Axios,
// misalnya:
instance
  .get('/users') // Permintaan GET ke https://api.example.com/users
  .then((response) => {
    console.log(response.data); // Menampilkan data pengguna
  })
  .catch((error) => {
    console.error(error); // Menampilkan pesan error
  });

// Anda juga bisa membuat instance lain dengan konfigurasi berbeda jika dibutuhkan
const anotherInstance = axios.create({
  baseURL: 'https://another-api.com/v2',
});

anotherInstance.post('/reports', { data: 'some report' });
```

## Penamaan Instance

Untuk penamaan instance Axios, Anda bebas memilih nama variabel apa pun yang sesuai dan mudah dimengerti dalam konteks project Anda.

Tidak ada aturan baku, tetapi ada beberapa praktik umum yang bisa Anda ikuti agar kode lebih terbaca dan terorganisir.

Berikut beberapa alternatif penamaan instance yang umum digunakan, beserta alasannya:

### Sesuai dengan API yang diakses:

- **api**
- **httpClient**
- **myApi**
- **backendApi**
- **authApi**
- **productApi**
- **userService**

**Kapan digunakan :** Ini adalah pendekatan yang paling umum dan disarankan. Jika instance tersebut khusus untuk berinteraksi dengan satu jenis API atau layanan (misalnya, API untuk produk, atau API otentikasi), menamainya sesuai dengan fungsinya akan sangat jelas.

**Contoh :**

```js {title="JavaScript" wrap="true"}
const productApi = axios.create({
  baseURL: 'https://api.example.com/products',
  headers: { Authorization: 'Bearer product_token' },
});

productApi.get('/123'); // Mengambil produk dengan ID 123
```

### Sesuai dengan versi API:

- **apiV1**
- **apiV2**

Kapan digunakan: Jika Anda memiliki beberapa versi API yang berbeda dan perlu berinteraksi dengan keduanya.

**Contoh :**

```js {title="JavaScript" wrap="true"}
const apiV1 = axios.create({
  baseURL: 'https://api.example.com/v1',
});

const apiV2 = axios.create({
  baseURL: 'https://api.example.com/v2',
});

apiV1.get('/users');
apiV2.post('/items');
```

### Nama umum jika hanya ada satu instance utama:

- **instance** (seperti contoh yang sudah kita gunakan)
- **client**
- **http**

Kapan digunakan: Jika aplikasi Anda relatif kecil dan Anda hanya membutuhkan satu instance Axios utama untuk semua permintaan, nama-nama ini cukup jelas.

**Contoh :**

```js {title="JavaScript" wrap="true"}
const client = axios.create({
  baseURL: 'https://my-app-api.com',
});

client.get('/dashboard');
```

### Tips Penting dalam Penamaan:

- **Deskriptif :** Nama harus memberikan gambaran yang jelas tentang tujuan instance tersebut.

- **Konsisten :** Gunakan konvensi penamaan yang sama di seluruh project Anda.

- **Hindari nama generik berlebihan :** Meskipun instance atau client bisa diterima untuk kasus sederhana, untuk project yang lebih kompleks, nama yang lebih spesifik seperti **productApi** atau **authService** akan sangat membantu dalam menjaga keterbacaan kode.

Pada dasarnya, Anda bisa menamainya apa pun, asalkan Anda dan tim Anda (jika ada) dapat dengan mudah memahami apa yang diwakili oleh instance tersebut.

## Instance Methods (Metode yang Tersedia pada Cabang Kurir)

Ketika Anda membuat sebuah instance Axios, instance tersebut juga memiliki metode-metode yang sama dengan Axios global, tetapi dengan konfigurasi dasar yang sudah Anda tetapkan di instance tersebut.

**Contoh :**

- `instance.request(config)`
- `instance.get(url[, config])`
- `instance.delete(url[, config])`
- `instance.head(url[, config])`
- `instance.options(url[, config])`
- `instance.post(url[, data[, config]])`
- `instance.put(url[, data[, config]])`
- `instance.patch(url[, data[, config]])`
- `instance.getUri([config])` (Ini untuk mendapatkan URI lengkap dari request berdasarkan config).

Dengan instance, Anda dapat menjaga kode Anda lebih bersih dan lebih mudah dikelola, terutama ketika bekerja dengan banyak API atau lingkungan yang berbeda.

Demikianlah penjelasan lengkap untuk keempat sesi mengenai Axios. Kita sudah membahas dari dasar apa itu Axios, cara instalasinya, berbagai metode untuk mengirim permintaan, detail konfigurasi yang bisa disesuaikan, hingga bagaimana memahami balasan server dan menggunakan instance Axios.
