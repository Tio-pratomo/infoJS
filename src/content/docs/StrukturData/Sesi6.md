---
title: 'Double & Circular Linked List'
---

Jika Single Linked List ibarat jalan satu arah (_one-way street_), sekarang kita akan membangun jalan dua arah (_two-way street_) yang lebih fleksibel.

Topik ini adalah kunci untuk fitur-fitur seperti **Playlist Lagu** (Next/Previous), **Browser History** (Back/Forward), dan **Undo/Redo** yang kompleks.

---

## Materi 1: Double Linked List

### Apa Bedanya?

Di Single Linked List, Node hanya memegang tangan teman di depannya (`next`).
Di **Double Linked List**, Node memegang dua tangan:

1.  **Next**: Teman di depan.
2.  **Prev** (Previous): Teman di belakang.

### Keunggulan & Kelemahan

- **Pro:** Bisa jalan mundur! Menghapus Node di akhir (_tail_) jauh lebih cepat (**O(1)**) karena kita tidak perlu traverse dari awal.
- **Kon:** Lebih boros memori (perlu simpan pointer ekstra) dan logika kode sedikit lebih rumit.

### Implementasi Node (Double)

Kita tambahkan properti `prev`. Buatlah kode di bawah ini!

```javascript
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null; // Pointer baru!
  }
}
```

---

## Praktik: Membuat Double Linked List

Setelah implementasi node double linklist, mari kita buat list yang bisa menambah data di awal/akhir dan menghapusnya dengan efisien.

```javascript
class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null; // Kita simpan ekornya juga agar akses akhir O(1)
  }

  // Tambah di AKHIR (Append) - O(1)
  append(data) {
    const newNode = new Node(data);

    if (!this.head) {
      // Jika kosong
      this.head = newNode;
      this.tail = newNode;
      return;
    }

    // Kaitkan tail lama dengan node baru
    this.tail.next = newNode;
    newNode.prev = this.tail;

    // Update tail ke node baru
    this.tail = newNode;
  }

  // Tambah di AWAL (Prepend) - O(1)
  prepend(data) {
    const newNode = new Node(data);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      return;
    }

    newNode.next = this.head;
    this.head.prev = newNode;
    this.head = newNode;
  }

  // Cetak Maju & Mundur
  print() {
    // Maju
    let current = this.head;
    let forward = 'Start -> ';
    while (current) {
      forward += `${current.data} <-> `;
      current = current.next;
    }
    console.log(forward + 'End');

    // Mundur (Bukti Double Linked List!)
    let backward = 'End -> ';
    current = this.tail;
    while (current) {
      backward += `${current.data} <-> `;
      current = current.prev;
    }
    console.log(backward + 'Start');
  }
}

// Simulasi
const history = new DoublyLinkedList();
history.append('Page 1');
history.append('Page 2');
history.prepend('Homepage');

history.print();
// Output Maju: Start -> Homepage <-> Page 1 <-> Page 2 <-> End
// Output Mundur: End -> Page 2 <-> Page 1 <-> Homepage <-> Start
```

---

## Materi 2: Circular Linked List

Bayangkan rantai sepeda. Tidak ada ujungnya, kan? Mata rantai terakhir menyambung kembali ke mata rantai pertama.
Itulah **Circular Linked List**.

### Karakteristik

- Node terakhir (`tail.next`) **tidak** menunjuk ke `null`, melainkan kembali menunjuk ke `head`.
- Bisa berbasis Single atau Double Linked List.

### Kegunaan

- **Playlist Loop**: Setelah lagu terakhir selesai, otomatis kembali ke lagu pertama.
- **Giliran Main Game**: Player 1 -> Player 2 -> Player 3 -> Kembali ke Player 1.
- **CPU Scheduling**: Sistem operasi membagi waktu CPU ke tiap aplikasi secara bergilir (Round Robin).

---

**Tugas Mini:**

1.  Gunakan kode `DoublyLinkedList` di atas.
2.  Tambahkan method `deleteLast()` yang menghapus elemen terakhir.
    - _Hint:_ Gunakan `this.tail` dan `this.tail.prev`. Jangan lupa putuskan hubungan (`next = null`) dari node baru yang jadi tail.
    - Operasi ini harus berjalan **O(1)** (Instant), jauh lebih cepat dari Array `pop` jika datanya jutaan!

---

Anda sekarang sudah menguasai struktur data linear yang paling kompleks! Selanjutnya, di **Sesi 7**, kita akan meninggalkan dunia "garis lurus" dan masuk ke dunia yang saling terhubung rumit: **Graph (Graf)**. Ini adalah dasar dari Google Maps dan Social Network.
