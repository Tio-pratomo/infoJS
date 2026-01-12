---
title: 'Response Schema'
---

## Memahami Balasan dari Server (Response Schema)

Setelah "kurir" Axios berhasil mengirimkan "pesan" atau "paket" Anda ke server, server akan memprosesnya dan mengirimkan "paket balasan" kembali. Axios akan menerima balasan ini dan mengemasnya ke dalam sebuah objek response yang mudah kita pahami.

Bayangkan response ini seperti "isi lengkap paket balasan" yang Anda terima dari kurir, yang tidak hanya berisi data, tapi juga informasi penting lainnya tentang pengiriman tersebut.

Berikut adalah isi dari objek response yang biasa Anda dapatkan:

- **data**:
  Ini adalah respons yang disediakan oleh server. Ini adalah "isi sebenarnya" dari paket balasan Anda, misalnya data pengguna, daftar produk, atau pesan sukses/gagal dari server.
  Contoh: **{} (Ini bisa berupa objek, array, string, dll. tergantung data dari server).**

- **status**:
  Ini adalah kode status HTTP dari respons server. Ini seperti "kode status pengiriman" (misalnya, 200 OK berarti berhasil, 404 Not Found berarti tidak ditemukan, 500 Internal Server Error berarti ada masalah di server).
  Contoh: **200**

- **statusText**:
  Ini adalah pesan status HTTP dari respons server. Sebagai catatan, sesuai HTTP/2, teks status kosong atau tidak didukung. Ini adalah penjelasan singkat dari kode status.
  Contoh: **'OK'**

- **headers**:
  Ini adalah header HTTP yang direspons oleh server. Semua nama header diubah menjadi huruf kecil dan dapat diakses menggunakan notasi kurung siku.
  Header ini seperti "catatan tempel" di luar paket balasan yang berisi informasi tambahan dari server (misalnya, jenis konten data, tanggal, atau otentikasi).
  Contoh: **{ 'content-type': 'application/json' }**

- **config**:
  Ini adalah konfigurasi yang disediakan ke axios untuk request. Ini adalah salinan dari pengaturan permintaan yang Anda gunakan saat mengirim pesan. Berguna untuk melacak pengaturan mana yang digunakan untuk permintaan tertentu.
  Contoh: **{} (Berisi semua pengaturan config dari permintaan awal)**

- **request**:
  Ini adalah request yang menghasilkan respons ini. Ini adalah instance ClientRequest terakhir di Node.js (dalam pengalihan) dan instance XMLHttpRequest di browser. Ini adalah referensi ke objek permintaan asli yang dibuat.
  Contoh: **{} (Objek permintaan asli)**
