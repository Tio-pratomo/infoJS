---
title: Membatalkan Request (Cancellation) & Race Condition
---

## Materi: Mengapa Perlu Membatalkan Request?

Bayangkan skenario "User yang Bimbang":

1.  User klik tombol "Load Data A". (Request A jalan...)
2.  Belum selesai loading, user berubah pikiran dan klik "Load Data B". (Request B jalan...)
3.  Tiba-tiba Request A selesai duluan dan menampilkan datanya.
4.  Lalu Request B selesai dan menimpa data A.

Ini disebut **Race Condition**. Namun, skenario terburuknya adalah:

- Request B selesai duluan.
- Lalu Request A (yang sudah basi) baru selesai belakangan dan **menimpa** data B yang benar.
- Hasil: User melihat Data A, padahal dia terakhir meminta Data B.

Solusinya: Saat user klik tombol B, kita harus **Membunuh (Abort)** Request A secara paksa.

### 1. Cara Kerja AbortController di Axios

Konsepnya sederhana: Kita membuat sebuah "remote control" (sinyal) yang kita titipkan ke Axios. Kapanpun kita tekan tombol "stop" di remote itu, Axios akan berhenti bekerja.

```javascript wrap
// 1. Buat controller
const controller = new AbortController();

// 2. Pasang sinyalnya ke config Axios
axios.get('/url', {
  signal: controller.signal,
});

// 3. Batalkan kapanpun dibutuhkan
controller.abort();
```

---

## Praktik: Mencegah Race Condition (Tab Switcher)

Kita akan membuat simulasi UI sederhana: Dua tombol tab (Tab 1 & Tab 2). Jika user klik Tab 1 lalu cepat-cepat klik Tab 2, request Tab 1 harus dibatalkan agar tidak menimpa konten Tab 2.

### Setup HTML

Gunakan file `index.html` yang sama, update bagian body:

```html wrap
<body>
  <h1>Simulasi Tab Switcher (Cek Network Tab & Console)</h1>

  <div style="margin-bottom: 20px;">
    <!-- Tombol untuk memicu request -->
    <button id="btnUser1">Load User 1 (Lambat)</button>
    <button id="btnUser2">Load User 2 (Cepat)</button>
  </div>

  <div style="border: 1px solid #ccc; padding: 10px; min-height: 100px;">
    <h3>Hasil:</h3>
    <p id="status">Idle</p>
    <pre id="output">...</pre>
  </div>

  <script type="module" src="./app.js"></script>
</body>
```

### Kode JavaScript (`app.js`)

```javascript wrap
// Variable global untuk menyimpan controller yang sedang aktif
let activeController = null;

const statusEl = document.getElementById('status');
const outputEl = document.getElementById('output');

// Fungsi reusable untuk mengambil data user
async function loadUser(userId, delay) {
  // -----------------------------------------------------------
  // LANGKAH 1: Batalkan request sebelumnya jika ada
  // -----------------------------------------------------------
  if (activeController) {
    activeController.abort(); // Matikan request lama!
    console.log('🚫 Request sebelumnya dibatalkan.');
  }

  // -----------------------------------------------------------
  // LANGKAH 2: Buat controller baru untuk request ini
  // -----------------------------------------------------------
  activeController = new AbortController();
  const currentSignal = activeController.signal;

  try {
    statusEl.innerText = `Memuat User ${userId}...`;
    outputEl.innerText = 'Loading...';

    // Simulasi delay server menggunakan httpbin
    // User 1 kita set delay 3 detik (lambat)
    // User 2 kita set delay 1 detik (cepat)
    const url = `https://httpbin.org/delay/${delay}`;

    const response = await axios.get(url, {
      signal: currentSignal, // Titipkan sinyal di sini
    });

    // Jika sampai baris ini, berarti request SUKSES dan TIDAK dibatalkan
    statusEl.innerText = `Selesai memuat User ${userId}`;
    outputEl.innerText = `Data User ID: ${userId}\nResponse Server: Sukses`;

    console.log(`✅ Data User ${userId} berhasil ditampilkan.`);
  } catch (error) {
    // -----------------------------------------------------------
    // LANGKAH 3: Tangani Error "Canceled" secara khusus
    // -----------------------------------------------------------
    if (axios.isCancel(error)) {
      // Ini BUKAN error sistem, tapi pembatalan yang disengaja.
      // Jangan tampilkan alert error ke user.
      console.log(`⚠️ Request User ${userId} dibatalkan karena user pindah tab.`);
    } else {
      // Ini baru error beneran (Network/Server error)
      statusEl.innerText = 'Error';
      outputEl.innerText = error.message;
      console.error('Error Fetching:', error);
    }
  } finally {
    // Bersihkan controller jika request ini sudah selesai (baik sukses/gagal)
    // Agar tidak mengganggu request masa depan
    if (activeController && activeController.signal === currentSignal) {
      activeController = null;
    }
  }
}

// Event Listeners
document.getElementById('btnUser1').addEventListener('click', () => {
  // User 1 delay 3 detik
  loadUser(1, 3);
});

document.getElementById('btnUser2').addEventListener('click', () => {
  // User 2 delay 1 detik
  loadUser(2, 1);
});
```

### Cara Menguji (Penting!)

1.  Buka **Developer Tools (F12)** -> Tab **Network**.
2.  Klik tombol **Load User 1 (Lambat)**.
3.  Segera (dalam 1 detik) klik tombol **Load User 2 (Cepat)**.

**Hasil yang diharapkan:**

- Di tab Network, Anda akan melihat request pertama statusnya **(canceled)** berwarna merah.
- Di Console, muncul log: _"Request sebelumnya dibatalkan."_
- Di Layar, teks "Loading..." akan berubah menjadi data User 2. Data User 1 **tidak akan pernah muncul** menimpa User 2, meskipun server User 1 sebenarnya sudah selesai memproses (tapi browser membuang hasilnya).

### Kapan Menggunakan `AbortController`?

1.  **Search Bar (Typeahead):** User ngetik "Jakar...", request cari "Jaka" harus dicancel.
2.  **Tab/Navigasi:** Pindah halaman saat halaman lama belum selesai loading.
3.  **Upload File:** Tombol "Cancel Upload".

Di **Sesi 9**, kita akan masuk ke fitur "Sakti" Axios: **Interceptors**. Ini adalah alasan utama kenapa banyak developer senior lebih memilih Axios daripada Fetch. Kita bisa menyisipkan kode "mata-mata" di setiap request keluar dan masuk.
