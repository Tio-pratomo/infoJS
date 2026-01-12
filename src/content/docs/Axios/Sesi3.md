---
title: 'Request Config yang Komplit!'
---

## Request Config (Pengaturan Pesan)

Di sesi ini, kita akan membahas lebih dalam mengenai objek config yang sering kita sertakan saat mengirim permintaan dengan Axios.

Objek config ini seperti "formulir detail pengiriman" yang sangat lengkap, di mana Anda bisa menentukan berbagai macam pengaturan untuk "paket" data yang akan Anda kirim.

Semakin detail Anda mengisi formulir ini, semakin tepat "kurir" Axios akan mengirimkan pesan Anda. Berikut adalah isi dari objek config yang bisa Anda gunakan untuk menyesuaikan permintaan Axios Anda:

### a. Pengaturan Dasar

- **url**: Ini adalah URL server yang akan digunakan untuk request. Ibaratnya, ini adalah alamat tujuan utama dari "paket" Anda.

  Contoh: `url: '/users'`

- **method**: Ini adalah metode HTTP request yang akan digunakan saat membuat permintaan. Ini menentukan jenis operasi yang Anda lakukan (misalnya, 'get' untuk mengambil data, 'post' untuk mengirim data baru, dll.). Defaultnya adalah 'get'.

  Contoh: `method: 'post'`

### b. Pengaturan Alamat Tambahan

- **baseURL**:

  baseURL akan ditambahkan ke url kecuali url bersifat absolut. Ini sangat mudah untuk menyetel baseURL untuk sebuah contoh axios untuk memberikan URL relatif ke metode-metode pada contoh tersebut.

  Analogi:
  Jika Anda sering mengirim paket ke kompleks perumahan yang sama (misal, "Komplek Harmoni"), Anda bisa mengatur "Komplek Harmoni" sebagai baseURL.

  Jadi, ketika Anda ingin mengirim ke "Blok A No. 5", Anda cukup menulis "Blok A No. 5" saja tanpa perlu menulis ulang "Komplek Harmoni".

  Contoh: `baseURL: https://some-domain.com/api`

### c. Mengubah Data Sebelum/Sesudah Dikirim

- **transformRequest**:
  Fungsi ini memungkinkan perubahan pada request data sebelum dikirim ke server. Ini hanya berlaku untuk metode request 'PUT', 'POST', 'PATCH', dan 'DELETE' . Fungsi terakhir dalam array harus mengembalikan string atau instance dari Buffer, ArrayBuffer, FormData, atau Stream. Anda juga dapat memodifikasi objek header.
  Analogi: Seperti Anda bisa "mengemas ulang" isi paket sebelum diserahkan ke kurir.
  Contoh:

  ```js
  transformRequest: [
    function (data, headers) {
      // Lakukan apa pun yang Anda inginkan untuk mengubah data
      return data;
    },
  ];
  ```

- **transformResponse**:
  Fungsi ini memungkinkan perubahan pada response data sebelum diteruskan ke then/ catch.
  Analogi: Seperti Anda bisa "membuka dan memproses" isi paket segera setelah diterima dari kurir, sebelum Anda benar-benar menggunakannya.
  Contoh:

  ```js
  transformResponse: [
    function (data) {
      // Lakukan apa pun yang Anda inginkan untuk mengubah data
      return data;
    },
  ];
  ```

### d. Pengaturan Header dan Parameter

- **headers**:
  Ini adalah header kustom yang akan dikirim. Header ini seperti "catatan khusus" yang Anda tempel di luar paket, yang berisi informasi tambahan untuk penerima (misal, "Ini paket penting!" atau "Perlu tanda tangan penerima").

  Contoh: `headers: {'X-Requested-With': 'XMLHttpRequest'}`

- **params**:
  Ini adalah parameter URL yang akan dikirim bersama request. Ini harus berupa objek biasa atau objek URLSearchParams.

  > [!important] Penting
  >
  > parameter yang `null` atau `undefined` tidak akan ditampilkan di URL.
  > Analogi: Ini seperti menuliskan beberapa detail tambahan di alamat.
  > Contoh: alamat.com/produk?id=123& warna=biru. Data id=123 dan warna=biru adalah params.

  Contoh:

  ```js
  params: {
    ID: 12345;
  }
  ```

- **paramsSerializer**:
  Ini adalah fungsi opsional yang bertanggung jawab untuk menserialisasi params. Berguna jika Anda memiliki cara khusus untuk mengubah objek params menjadi format string URL.

  Contoh:

  ```js
    paramsSerializer: function (params) {
        return Qs.stringify(params, {arrayFormat: 'brackets'})
    }
  ```

### e. Pengaturan Data yang Dikirim

- **data**:
  Ini adalah data yang akan dikirim sebagai badan request. Ini hanya berlaku untuk metode request 'PUT', 'POST', 'DELETE', dan 'PATCH'.

  Ketika transformRequest tidak diatur, ini harus berupa string, objek biasa, ArrayBuffer, ArrayBufferView, URLSearchParams, FormData, File, Blob (hanya browser), atau Stream, Buffer (hanya Node).

  Analogi: Ini adalah "isi sebenarnya" dari paket Anda.

  Contoh:

  ```js
  data: {
    firstName: 'Fred';
  }
  ```

  Contoh Alternatif (untuk data string):

  ```js
  data: 'Country=Brasil&City=Belo Horizonte';
  ```

### f. Pengaturan Waktu dan Keamanan

- **timeout**:
  Ini menentukan jumlah milidetik sebelum request habis waktu. Jika request memakan waktu lebih lama dari timeout, request akan dibatalkan.
  Defaultnya adalah `0` (tidak ada timeout).

  Analogi: Seperti Anda menetapkan batas waktu untuk kurir. Jika paket tidak sampai atau tidak ada kabar dalam waktu tertentu, Anda akan membatalkan pesanan.

  Contoh: `timeout: 1000` (1 detik)

- **withCredentials**:
  Ini menunjukkan apakah permintaan Akses-Kontrol lintas situs harus dilakukan menggunakan kredensial. Defaultnya `false`.

- **auth**:
  Ini menunjukkan bahwa otentikasi Dasar HTTP harus digunakan, dan menyediakan kredensial. Ini akan mengatur header Authorization, menimpa header kustom Authorization yang sudah ada.

  Contoh:

  ```js
    auth: {
        username: 'janedoe',
        password: 's00pers3cret'
    }
  ```

- **xsrfCookieName**: Ini adalah nama cookie yang akan digunakan sebagai nilai untuk token XSRF. Defaultnya `'XSRF-TOKEN'`.

- **xsrfHeaderName**: Ini adalah nama header http yang membawa nilai token XSRF. Defaultnya `'X-XSRF-TOKEN'`.

- **cancelToken**:
  Ini menentukan token pembatalan yang dapat digunakan untuk membatalkan request. (Akan dibahas lebih lanjut di topik pembatalan request jika dibutuhkan).

  Contoh: `cancelToken: new CancelToken(function (cancel) {})`

### g. Pengaturan Respons dan Progres

- **responseType**:
  Ini menunjukkan jenis data yang akan direspons oleh server. Pilihannya adalah: 'arraybuffer', 'document', 'json', 'text', 'stream' (browser saja: 'blob'). Defaultnya `'json'`.

  Contoh: `responseType: 'json'`

- **responseEncoding**:
  Ini menunjukkan encoding yang akan digunakan untuk mendekode respons (hanya Node.js).
  Catatan: Diabaikan untuk responseType 'stream' atau permintaan sisi klien. Defaultnya `'utf8'`.

- **onUploadProgress**:
  Ini memungkinkan penanganan event progress untuk upload (hanya browser).
  Analogi: Seperti Anda bisa melacak "persentase paket yang sudah dimasukkan ke truk kurir".

  Contoh:

  ```js
    onUploadProgress: function (progressEvent) {
    // Lakukan apa pun yang Anda inginkan dengan event progress asli
    }
  ```

- **onDownloadProgress**:
  Ini memungkinkan penanganan event progress untuk download (hanya browser).
  Analogi: Seperti Anda bisa melacak "persentase paket yang sudah dikeluarkan dari truk kurir".

  Contoh:

  ```js
    onDownloadProgress: function (progressEvent) {
    // Lakukan apa pun yang Anda inginkan dengan event progress asli
    }
  ```

### h. Pengaturan Lanjutan (Biasanya untuk Node.js)

- **adapter**: Ini memungkinkan penanganan kustom dari request yang membuat pengujian lebih mudah. Anda harus mengembalikan Promise dan menyediakan respons yang valid.

- **maxContentLength**: Ini mendefinisikan ukuran maksimum konten respons http dalam byte yang diizinkan di node.js.

- **maxBodyLength**: Ini (opsi Node saja) mendefinisikan ukuran maksimum konten request http dalam byte yang diizinkan.

- **validateStatus**:
  Ini mendefinisikan apakah akan me-resolve atau me-reject promise untuk kode status respons HTTP tertentu.
  Jika validateStatus mengembalikan true (atau diatur ke null atau undefined), promise akan di-resolve; jika tidak, promise akan di-reject. Defaultnya adalah status antara 200 dan 300.

  Contoh:

  ```js
    validateStatus: function (status) {
        return status >= 200 && status < 300; // default
    }
  ```

- **maxRedirects**: Ini mendefinisikan jumlah maksimum pengalihan yang harus diikuti di node.js. Jika diatur ke 0, tidak ada pengalihan yang akan diikuti. Defaultnya `5`.

- **socketPath**:
  Ini mendefinisikan Soket UNIX yang akan digunakan di node.js.
  Contoh: `'/var/run/docker.sock'` untuk mengirim request ke daemon docker.
  Hanya socketPath atau proxy yang dapat ditentukan. Jika keduanya ditentukan, socketPath yang digunakan.

- **httpAgent dan httpsAgent**:
  Ini mendefinisikan agen kustom yang akan digunakan saat melakukan request http dan https, masing-masing, di node.js. Ini memungkinkan opsi ditambahkan seperti keepAlive yang tidak diaktifkan secara default.

  Contoh:

  ```js
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
  ```

- **proxy**:
  Ini mendefinisikan nama host, port, dan protokol server proxy. Anda juga dapat mendefinisikan proxy menggunakan variabel lingkungan konvensional http_proxy dan https_proxy.

  Jika Anda menggunakan variabel lingkungan untuk konfigurasi proxy Anda, Anda juga dapat mendefinisikan variabel lingkungan no_proxy sebagai daftar domain yang dipisahkan koma yang tidak boleh di-proxy.

  Gunakan false untuk menonaktifkan proxy, mengabaikan variabel lingkungan. auth menunjukkan bahwa otentikasi Dasar HTTP harus digunakan untuk terhubung ke proxy, dan menyediakan kredensial.

  Ini akan mengatur header Proxy-Authorization, menimpa header kustom Proxy-Authorization yang sudah ada. Jika server proxy menggunakan HTTPS, maka Anda harus mengatur protokol ke https.

  Analogi: Jika jaringan Anda mengharuskan semua "paket" melewati sebuah "pos pemeriksaan" (proxy server) sebelum ke tujuan akhir, Anda bisa mengaturnya di sini.

  Contoh:

  ```js
    proxy: {
      protocol: 'https',
      host: '127.0.0.1',
      port: 9000,
      auth: {
        username: 'mikeymike',
        password: 'rapunz3l'
      }
    }

  ```

- **decompress**:
  Ini menunjukkan apakah isi respons harus didekompresi secara otomatis. Jika diatur ke true, juga akan menghapus header 'content-encoding' dari objek respons dari semua respons yang didekompresi.
  Ini hanya Node (XHR tidak dapat mematikan dekompresi). Defaultnya `true`.
  Cukup gunakan yang Anda butuhkan sesuai dengan kebutuhan aplikasi Anda.

Wah, cukup banyak ya pengaturan yang bisa kita lakukan! Tapi jangan khawatir, Anda tidak perlu menggunakan semuanya sekaligus.
