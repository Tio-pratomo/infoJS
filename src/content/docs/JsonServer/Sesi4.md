---
title: Menangani Relasi Data (Relationships)
---

Sekarang kita akan masuk ke Sesi 4, di mana kita akan belajar tentang bagaimana JSON Server mengelola hubungan antar data, atau yang sering disebut "relasi".

Dalam sebuah aplikasi nyata, data seringkali saling berhubungan. Misalnya, sebuah produk mungkin memiliki banyak ulasan (reviews). JSON Server menyediakan cara mudah untuk menangani relasi ini.

Bayangkan kita punya dua rak buku yang berbeda: satu untuk Buku dan satu lagi untuk Identitas Penulis. Setiap buku memiliki informasi tentang penulisnya, tetapi informasi penulis lengkap (nama, bio, dll.) ada di rak penulis.

Ketika kita mengambil buku, kita juga ingin tahu detail penulisnya tanpa harus mencarinya secara terpisah.
File **db.json** kita sudah memiliki contoh relasi: setiap ulasan (reviews) memiliki properti **productId** yang mengacu pada id produk yang diulas.

## Menyertakan Data Terkait (Nesting)

JSON Server memungkinkan kita mengambil data dari dua resource yang saling berhubungan dalam satu permintaan. Ini sangat berguna untuk mengurangi jumlah panggilan API dari front-end.

- Tujuan: Mengambil semua produk dan menyertakan ulasan yang terkait dengan setiap produk.
- URL: `http://localhost:3030/products?_embed=reviews`

Query parameter **\_embed** (atau **\_expand**) akan "menyematkan" data dari resource lain ke dalam hasil respons.

**\_embed=reviews**: Menambahkan array reviews ke setiap objek produk yang memiliki id yang cocok dengan productId di objek ulasan.

**Contoh Respons :**

```json wrap
[
  {
    "id": 1,
    "title": "Product 1 (UPDATED)",
    "category": "electronics",
    "price": 4500,
    "description": "...",
    "reviews": [
      {
        "id": 1,
        "rating": 3,
        "comment": "Review 1 for product id 1",
        "productId": 1
      },
      {
        "id": 2,
        "rating": 4,
        "comment": "Review 2 for product id 1",
        "productId": 1
      }
    ]
  }
  // ...produk lainnya tanpa reviews karena tidak ada yang memiliki reviews
]
```

Anda juga bisa melakukan hal yang sama untuk mengambil detail produk dan ulasannya:

URL: `http://localhost:3030/products/1?_embed=reviews`

## Relasi Satu ke Banyak (\_expand)

Kadang-kadang, relasi data berjalan ke arah yang berlawanan. Misalnya, dari ulasan, kita ingin tahu detail produknya. Di sini kita menggunakan \_expand.

- Tujuan: Mengambil semua ulasan dan menyertakan data produk yang terkait dengan setiap ulasan.
- URL: `http://localhost:3030/reviews?_expand=product`

Query parameter \_expand akan "mengembangkan" objek terkait.

\_expand=product: Akan mencari id produk yang cocok dengan productId di setiap objek ulasan, lalu menambahkan seluruh objek produk tersebut sebagai properti product.

**Contoh Respons :**

```json wrap
[
  {
    "id": 1,
    "rating": 3,
    "comment": "Review 1 for product id 1",
    "productId": 1,
    "product": {
      "id": 1,
      "title": "Product 1 (UPDATED)",
      "category": "electronics",
      "price": 4500,
      "description": "..."
    }
  }
  // ...ulasan lainnya
]
```

## Menggunakan Relasi dengan Metode Lain

Anda juga bisa menggabungkan relasi dengan metode-metode lain yang sudah kita pelajari, seperti filter dan pagination.

- Tujuan: Mengambil produk yang harganya di atas 3000 dan menyertakan ulasannya.
- URL: `http://localhost:3030/products?price_gte=3000&_embed=reviews`

Dengan berakhirnya Sesi 4 ini, Anda sudah memiliki pemahaman yang kuat tentang bagaimana JSON Server bisa digunakan untuk mensimulasikan API yang lebih kompleks, termasuk relasi data. Ini sangat membantu untuk membangun aplikasi front-end yang terhubung dengan data dari berbagai sumber.
