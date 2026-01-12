---
title: 'Linked List (Senarai Berantai)'
---

Kita memasuki wilayah struktur data yang lebih _advanced_. Jika Array ibarat rak buku yang menyatu, **Linked List** ibarat **perburuan harta karun** (Treasure Hunt).

Anda tidak tahu di mana semua petunjuk berada sekaligus. Anda hanya memegang petunjuk pertama, yang akan mengarahkan Anda ke lokasi petunjuk kedua, dan seterusnya.

## Materi: Konsep & Memory Layout

### Apa Itu Linked List?

Linked List adalah kumpulan data linear di mana setiap elemennya (**Node**) terpisah-pisah di memori (tidak bersebelahan). Setiap Node menyimpan dua hal penting:

1.  **Data**: Nilai yang disimpan (misal: angka 10).
2.  **Pointer (Next)**: Alamat memori menuju Node berikutnya.

### Mengapa Pakai Linked List? (Vs Array)

Masih ingat di Sesi 2 & 4, menghapus data di awal Array (`shift`) itu lambat (**O(n)**)?
Linked List mengatasi masalah itu.

| Fitur                  | Array                         | Linked List                                |
| :--------------------- | :---------------------------- | :----------------------------------------- |
| **Memori**             | Blok besar berurutan          | Tersebar acak (Dynamic)                    |
| **Insert/Delete Awal** | Lambat **O(n)** (Geser semua) | Cepat **O(1)** (Cukup ubah pointer)        |
| **Akses Data**         | Cepat **O(1)** (Pakai index)  | Lambat **O(n)** (Harus telusuri dari awal) |

**Analogi:**

- **Array**: Gerbong kereta api yang dilas mati. Mau tambah gerbong di tengah? Harus potong dan geser gerbong belakangnya.
- **Linked List**: Rantai besi. Mau tambah mata rantai di tengah? Cukup buka kaitannya, selipkan yang baru, kaitkan lagi. Beres!

---

## Praktik: Membuat Single Linked List dari Nol

Di JavaScript, tidak ada _built-in_ Linked List. Kita harus merakitnya sendiri menggunakan `class`.

### 1. Membuat Cetakan Node

Ini adalah unit terkecilnya. Bayangkan ini sebuah kotak yang punya isi data dan tali pengait ke kotak lain.

```javascript
class Node {
  constructor(data) {
    this.data = data; // Isinya
    this.next = null; // Tali pengait (awalnya belum nyambung kemana-mana)
  }
}
```

### 2. Membuat Class LinkedList

Ini adalah pengelolanya. Kita cuma perlu tahu di mana **Kepala (Head)** rantainya.

```javascript
class LinkedList {
  constructor() {
    this.head = null; // Belum ada data, jadi kepalanya kosong
  }

  // Menambah di AWAL (Kekuatan Utama Linked List!) - O(1)
  prepend(data) {
    const newNode = new Node(data);

    // 1. Kaitkan node baru ke head lama
    newNode.next = this.head;

    // 2. Jadikan node baru sebagai head sekarang
    this.head = newNode;
  }

  // Menambah di AKHIR - O(n)
  append(data) {
    const newNode = new Node(data);

    // Jika list kosong, dia jadi head
    if (!this.head) {
      this.head = newNode;
      return;
    }

    // Jika ada isinya, kita harus jalan (traverse) sampai ujung
    let current = this.head;
    while (current.next) {
      current = current.next;
    }

    // Sampai di ujung, kaitkan node baru
    current.next = newNode;
  }

  // Mencetak isi list
  printList() {
    let current = this.head;
    let result = '';
    while (current) {
      result += `${current.data} -> `;
      current = current.next;
    }
    console.log(result + 'null');
  }
}
```

### 3. Simulasi Penggunaan

Mari kita lihat betapa mudahnya menambah data di depan.

```javascript
const myChain = new LinkedList();

myChain.append(10); // 10 -> null
myChain.append(20); // 10 -> 20 -> null

// Operasi Super Cepat (O(1))
myChain.prepend(5); // 5 -> 10 -> 20 -> null

myChain.printList();
// Output: 5 -> 10 -> 20 -> null
```

Bayangkan jika ini Array dengan 1 juta data, `prepend` (seperti `unshift`) akan membuat komputer _hang_ sesaat. Dengan Linked List? _Instan_.

---

Anda baru saja membuat struktur data dinamis pertama Anda! Tapi, Single Linked List punya kelemahan: dia cuma bisa jalan maju (_one way_). Bagaimana kalau kita mau mundur?

Di **Sesi 6**, kita akan meng-upgrade ini menjadi **Double & Circular Linked List**, yang dipakai di tombol _Next/Previous_ pada pemutar musik.
