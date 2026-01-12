---
title: 'Tree & Binary Search Tree'
---

Selamat datang di sesi teori terakhir sebelum kita masuk ke project! Kita akan membahas **Tree**, sebuah bentuk Graph spesial yang sangat terstruktur dan efisien.

Tree adalah fondasi dari banyak hal, mulai dari struktur folder di komputer (File System) hingga cara database mengindeks data agar pencarian menjadi super cepat.

## Materi: Konsep Dasar Tree

### Apa Itu Tree?

Tree adalah struktur data non-linear hierarkis yang terdiri dari node-node yang terhubung. Tree merupakan Graph, tetapi dengan 2 aturan ketat:

1.  Hanya ada **satu Root Node** (paling atas).
2.  **Tidak boleh ada siklus** (loop), artinya hanya ada satu jalur unik antara dua node mana pun.

### Terminologi Tree

- **Root**: Node paling atas, tidak punya "parent".
- **Parent**: Node yang memiliki anak.
- **Child**: Node yang merupakan turunan dari node lain.
- **Leaf**: Node paling bawah, tidak punya "child".
- **Edge**: Garis penghubung antar node.
- **Height**: Jarak terjauh dari Root ke Leaf.
- **Depth**: Jarak dari Root ke suatu node tertentu.

### Apa Itu Binary Tree?

Jenis Tree yang paling umum, di mana setiap Node hanya boleh memiliki **maksimal 2 anak**: satu anak kiri (`left`) dan satu anak kanan (`right`).

---

## Materi & Praktik: Binary Search Tree (BST)

BST adalah jenis Binary Tree yang "pintar". Ia memiliki satu aturan tambahan yang sangat kuat:
**Aturan BST:** Untuk setiap node, semua nilai di _subtree_ **kiri** harus **lebih kecil**, dan semua nilai di _subtree_ **kanan** harus **lebih besar**.

Aturan ini membuat pencarian data menjadi sangat efisien, dengan kompleksitas waktu rata-rata **O(log n)**. Jauh lebih cepat dari Array O(n) untuk data besar.

### Implementasi BST di JavaScript

Kita akan membuat BST sederhana untuk menyimpan dan mencari angka.

```javascript
class Node {
  constructor(data) {
    this.data = data;
    this.left = null; // Anak kiri (lebih kecil)
    this.right = null; // Anak kanan (lebih besar)
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  // Menambah data ke BST
  insert(data) {
    const newNode = new Node(data);
    if (!this.root) {
      this.root = newNode;
      return this;
    }

    let current = this.root;
    while (true) {
      // Jika data sama, abaikan (atau tambahkan counter)
      if (data === current.data) return undefined;

      if (data < current.data) {
        // Ke kiri
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        // Ke kanan
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }

  // Mencari data di BST
  find(data) {
    if (!this.root) return false;

    let current = this.root;
    while (current) {
      if (data === current.data) return true; // Ditemukan!

      if (data < current.data) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return false; // Tidak ditemukan
  }
}

// Simulasi
const bst = new BinarySearchTree();
bst.insert(10);
bst.insert(5);
bst.insert(15);
bst.insert(3);
bst.insert(7);

/* 
Struktur Tree yang terbentuk:
      10
     /  \
    5    15
   / \
  3   7
*/

console.log(bst.find(7)); // Output: true (hanya butuh 3 langkah: 10 -> 5 -> 7)
console.log(bst.find(100)); // Output: false
```

### Perbandingan Pencarian

Bayangkan mencari angka `7` di antara 1 juta data.

- **Array (Unsorted)**: Bisa butuh 1 juta perbandingan.
- **BST (Balanced)**: Hanya butuh sekitar 20 perbandingan! `O(log 1,000,000) ≈ 20`.

---

**Selamat! Anda Telah Menyelesaikan Semua Sesi Teori.**
Anda sekarang memiliki bekal pengetahuan yang solid dari Array, Object, Stack, Queue, Linked List, Graph, hingga Tree.

Di **Sesi Terakhir (Project)**, kita akan menggunakan semua konsep ini untuk membangun sesuatu yang nyata.
