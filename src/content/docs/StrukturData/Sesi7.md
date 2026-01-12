---
title: 'Graph Data Structure (Graf)'
---

Anda telah lulus dari struktur data linear (berbaris rapi) ke struktur data **non-linear** yang merepresentasikan kompleksitas dunia nyata.

Hampir semua aplikasi modern yang "pintar" menggunakan **Graph**. Mulai dari rekomendasi teman di Facebook, rute tercepat di Google Maps, hingga cara internet bekerja.

## Materi: Anatomi Graph

### Apa Itu Graph?

Graph bukan grafik diagram batang/lingkaran. Dalam ilmu komputer, Graph adalah kumpulan titik yang saling terhubung.
Terdiri dari dua komponen utama:

1.  **Vertex (Node)**: Titik atau entitas data (misal: Kota Jakarta, User A).
2.  **Edge**: Garis penghubung antar vertex (misal: Jalan Tol, hubungan pertemanan).

Notasi matematika: `G = (V, E)`

### Jenis-Jenis Graph

1.  **Undirected Graph (Tak Berarah)**: Hubungan dua arah setara.
    - Contoh: Teman Facebook (A teman B = B teman A).
2.  **Directed Graph (Berarah / Digraph)**: Hubungan satu arah.
    - Contoh: Follower Instagram (A follow B, belum tentu B follow A).
3.  **Weighted Graph (Berbobot)**: Edge punya nilai/biaya.
    - Contoh: Peta (Jarak Jakarta-Bandung = 150km). Edge-nya punya bobot "150".

### Representasi Graph di Kode

Bagaimana cara menyimpannya di memori? Ada 2 cara populer:

#### 1. Adjacency Matrix (Matriks Ketetanggaan)

Menggunakan tabel 2D (Array of Arrays).

- `1` jika terhubung, `0` jika tidak.
- **Boros memori** jika datanya sedikit tapi node-nya banyak (Sparse Graph).

#### 2. Adjacency List (Daftar Ketetanggaan) - _Paling Sering Dipakai_

Menggunakan Hash Table (Object/Map) di mana Key adalah Node, dan Value adalah Array tetangganya.

- Lebih hemat memori.

---

## Praktik: Implementasi Graph (Adjacency List)

Kita akan membuat simulasi **Jejaring Sosial** sederhana menggunakan `Map`.

```javascript
class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }

  // Menambah User (Vertex)
  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  // Menambah Koneksi Pertemanan (Edge) - Undirected
  addEdge(vertex1, vertex2) {
    // Pastikan kedua vertex ada dulu
    if (!this.adjacencyList.has(vertex1)) this.addVertex(vertex1);
    if (!this.adjacencyList.has(vertex2)) this.addVertex(vertex2);

    // Hubungkan v1 ke v2
    this.adjacencyList.get(vertex1).push(vertex2);
    // Hubungkan v2 ke v1 (Karena Undirected/Saling Berteman)
    this.adjacencyList.get(vertex2).push(vertex1);
  }

  // Menghapus Koneksi
  removeEdge(vertex1, vertex2) {
    // Filter array teman vertex1 untuk hapus vertex2
    this.adjacencyList.set(
      vertex1,
      this.adjacencyList.get(vertex1).filter((v) => v !== vertex2)
    );
    // Lakukan sebaliknya untuk vertex2
    this.adjacencyList.set(
      vertex2,
      this.adjacencyList.get(vertex2).filter((v) => v !== vertex1)
    );
  }

  // Menghapus User (Hapus Vertex & semua relasinya)
  removeVertex(vertex) {
    // Hapus vertex ini dari daftar teman user lain dulu
    const neighbors = this.adjacencyList.get(vertex);
    if (neighbors) {
      for (let neighbor of neighbors) {
        this.removeEdge(neighbor, vertex);
      }
    }
    // Hapus user dari map
    this.adjacencyList.delete(vertex);
  }

  showConnections() {
    for (let [vertex, neighbors] of this.adjacencyList) {
      console.log(`${vertex} berteman dengan: ${neighbors.join(', ')}`);
    }
  }
}

// Simulasi
const facebook = new Graph();

facebook.addVertex('Ahmad');
facebook.addVertex('Budi');
facebook.addVertex('Citra');

facebook.addEdge('Ahmad', 'Budi');
facebook.addEdge('Ahmad', 'Citra');
facebook.addEdge('Budi', 'Citra');

facebook.showConnections();
/* Output:
Ahmad berteman dengan: Budi, Citra
Budi berteman dengan: Ahmad, Citra
Citra berteman dengan: Ahmad, Budi
*/
```

### Tantangan: Graph Traversal (Penelusuran)

Salah satu hal terpenting di Graph adalah cara "jalan-jalan" mengunjungi semua node. Ada 2 algoritma legendaris:

1.  **BFS (Breadth-First Search)**: Melebar. Cek semua tetangga dekat dulu, baru tetangga jauh. (Bagus untuk cari jarak terdekat/Shortest Path).
2.  **DFS (Depth-First Search)**: Mendalam. Telusuri satu jalur sampai mentok, baru balik lagi (backtrack). (Bagus untuk puzzle/maze).

Kita tidak akan implementasi BFS/DFS sekarang karena cukup kompleks, tapi konsep ini wajib Anda tahu untuk sesi interview kerja.

---

**Sesi 7 Selesai.**
Anda sudah membuat jejaring sosial mini! Graph sangat luas, tapi implementasi `Adjacency List` di atas sudah mencakup 80% kebutuhan dasar programmer.

Selanjutnya di **Sesi 8** (Terakhir sebelum Project!), kita akan mempelajari **Tree & Binary Search Tree (BST)**, bentuk spesial dari Graph yang sangat efisien untuk pencarian data.

Siap untuk materi terakhir?
