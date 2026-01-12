---
title: 'Pengenalan JSON & Contoh Penulisannya'
---

Materi ini, memulai petualangan Anda ke dunia JSON, "saudara kandung" dari YAML yang mendominasi dunia web development.

---

## Materi: Pengetahuan & Konsep

### 1. Apa itu JSON?

JSON (**J**ava**S**cript **O**bject **N**otation) adalah format pertukaran data yang ringan. Berbeda dengan YAML yang mengandalkan indentasi "bersih", JSON menggunakan tanda kurung kurawal `{}` dan siku `[]`.

- **Fungsi Utama**: Standar _de facto_ untuk komunikasi data antara Client (Browser/Aplikasi HP) dan Server (Backend API).
- **Karakteristik**:
  - **Strict Syntax**: Sangat ketat soal tanda baca. Lupa satu koma `,` saja bisa membuat file error.
  - **Key Wajib String**: Semua Key harus diapit tanda kutip ganda `""` (Contoh: `"nama": "Budi"`).
  - **No Comments**: JSON standar **tidak mendukung komentar**.

Dalam JSON, _value_ hanya boleh berisi **enam** tipe data:

- **string**
- **number**
- **boolean**
- **null**
- **object**
- **array**

Sedangkan key selalu berupa string dengan tanda kutip ganda.

#### Tipe data yang valid di JSON

- **String**: Teks yang diapit tanda kutip ganda, misalnya `"name": "Budi"`, dan ini adalah tipe yang paling sering dipakai untuk data berbasis teks.
- **Number**: Angka tanpa kutip, bisa bilangan bulat atau desimal, misalnya `"age": 30` atau `"price": 99.5`.
- **Boolean**: Nilai logika `true` atau `false`, misalnya `"isActive": true` untuk menandai status hidup/mati sebuah flag.
- **Null**: Menandakan tidak ada nilai, misalnya `"deletedAt": null` ketika field disiapkan tapi belum memiliki data.
- **Object**: Kumpulan pasangan key–value diapit `{}` yang bisa berisi kombinasi semua tipe di atas, misalnya `"user": { "name": "Ali", "age": 20 }`.
- **Array**: Kumpulan terurut diapit `[]`, elemennya boleh campuran tipe (meski best practice sebaiknya seragam), misalnya `"tags": ["node", "go", "devops"]`.

#### Aturan penting terkait tipe data

- **Key selalu string**: Semua key di JSON wajib pakai tanda kutip ganda, misalnya `"city": "Jakarta"`, dan value‑nya boleh salah satu dari enam tipe di atas.
- **Kombinasi bebas tapi terstruktur**: Dalam satu object, Anda bebas menggabungkan string, number, boolean, array, object, maupun null selama sintaks `{}`, `[]`, koma, dan titik dua ditulis dengan benar.

Jika dilihat dari contoh sebelumnya, semua value yang dipakai di JSON (nama, umur, daftar mobil, dsb.) sebenarnya selalu jatuh ke salah satu dari enam tipe data ini.

### 2. Struktur Dasar: Object `{}`

Object adalah kumpulan pasangan Key-Value yang tidak berurutan (setara dengan Dictionary/Map di YAML).

- **Sintaks**: Dimulai `{` dan diakhiri `}`.
- **Contoh**:
  ```json
  {
    "apiVersion": "v1",
    "kind": "Pod"
  }
  ```

### 3. Struktur Utama: Array `[]`

Array adalah daftar nilai yang berurutan (setara dengan Sequence/List di YAML).

- **Sintaks**: Dimulai `[` dan diakhiri `]`.
- **Aturan**:
  - Nilai dipisahkan oleh koma `,`.
  - Indeks dimulai dari 0 (zero-based index).
  - Bisa berisi tipe data campuran (Number, Boolean, String), meskipun praktik terbaik menyarankan tipe data seragam.

**Visualisasi Indeks Array:**

Misal: `[ 10, 20, true, "Nested" ]`

- `[0]` = `10`
- `[1]` = `20`
- `[2]` = `true`

### 4. Nested Array & Object

Kekuatan JSON muncul saat kita menggabungkan Object dan Array secara bersarang (Nested).
Contoh pola umum: "Sebuah Object yang memiliki Key berisi Array dari Object lain".

```json
{
  "cars": [
    { "id": 56, "Title": "Ford" },
    { "id": 50, "Title": "BMW" }
  ]
}
```

- Untuk mengakses "BMW", jalurnya adalah: `Root` -> `cars` (indeks 1) -> `Title`.

---

## Praktik: Transformasi Konfigurasi Pod

Mari kita lihat contoh nyata penggunaan JSON Array pada konfigurasi Kubernetes Pod yang lumayan kompleks.

### Langkah 1 : Buat kode

Buat file dengan nama `pod_jsonarray.json` kemudian tulis kode di bawah ini :

```json
{
  "kind": "Pod",
  "apiVersion": "v1",
  "metadata": {
    "name": "mongo",
    "labels": {
      "name": "mongo",
      "role": "mongo"
    }
  },
  "spec": {
    "volumes": [
      {
        "name": "mongo-disk",
        "gcePersistentDisk": {
          "pdName": "mongo-disk",
          "fsType": "ext4"
        }
      }
    ],
    "containers": [
      {
        "name": "mongo",
        "image": "mongo:latest",
        "ports": [
          {
            "name": "mongo",
            "containerPort": 27017
          }
        ]
      },
      {
        "name": "SQL",
        "image": "SQL:latest",
        "ports": [
          {
            "name": "SQL",
            "containerPort": 2306
          },
          {
            "name": "SQL-Lite",
            "containerPort": 2904
          }
        ]
      }
    ]
  }
}
```

Lalu simpan dimanapun yang anda suka.

### Langkah 2: Analisis Struktur

Perhatikan potongan kode berikut. Fokus pada bagaimana `spec` membungkus `containers` yang merupakan sebuah Array `[]`.

```json
{
  "kind": "Pod",
  "spec": {
    "containers": [
      {
        "name": "mongo",
        "image": "mongo:latest",
        "ports": [{ "containerPort": 27017 }]
      },
      {
        "name": "SQL",
        "image": "SQL:latest",
        "ports": [{ "containerPort": 2306 }, { "containerPort": 2904 }]
      }
    ]
  }
}
```

### Langkah 3: Membedah Hierarki

1.  **Root Object**: `{ ... }` pembungkus utama.
2.  **Key "containers"**: Bernilai Array `[...]`.
3.  **Item 1 (Index 0)**: Object Container Mongo.
    - Di dalamnya ada Key `ports` yang _juga_ merupakan Array `[...]`.
4.  **Item 2 (Index 1)**: Object Container SQL.
    - Perhatikan Array `ports`-nya memiliki **dua** item (port 2306 dan 2904).

**Tips Debugging JSON:**

Jika Anda menulis JSON manual, perhatikan **koma terakhir**. Item terakhir dalam Object atau Array **tidak boleh** ada koma.

- Salah: `[ "A", "B", ]` (Error: Trailing comma)
- Benar: `[ "A", "B" ]`
