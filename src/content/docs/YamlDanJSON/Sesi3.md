---
title: 'Tipe Data & Struktur Kompleks'
---

Materi ini membahas Tipe Data dan Struktur di YAML. Materi ini mencakup konsep dasar hingga teknik pengelolaan data yang lebih kompleks seperti List dan Dictionary, serta gaya penulisan string.

---

## Materi: Pengetahuan & Konsep

Secara garis besar, data dalam YAML dibagi menjadi dua kategori utama: **Scalar** (Nilai Tunggal) dan **Collection** (Kumpulan Data).

### 1. Scalar (Tipe Data Dasar)

Scalar adalah unit data terkecil dalam YAML. Ini mencakup tipe data standar yang biasa Anda temukan di bahasa pemrograman.

- **String (Teks)**: Tipe data default. Tidak memerlukan tanda kutip kecuali mengandung karakter khusus.
- **Number (Angka)**: Integer (bilangan bulat) atau Float (bilangan desimal).
- **Boolean**: Nilai kebenaran `true` atau `false`.
- **Null**: Merepresentasikan nilai kosong, biasanya ditulis dengan `null` atau `~`.

### 2. Collection: Sequence (List)

Sequence dalam YAML setara dengan **List** di Python atau **Array** di JSON. Sequence adalah daftar nilai yang berurutan.

- **Simbol**: Ditandai dengan tanda hubung `-` diikuti spasi.
- **Gaya Penulisan**:
  - **Block Style**: Menggunakan baris baru dan indentasi (paling umum).
  - **Flow Style**: Menggunakan kurung siku `[]` dalam satu baris (mirip JSON).
- **Nested**: Anda bisa membuat list di dalam list (List bersarang).

### 3. Collection: Dictionary (Map)

Dictionary (juga dikenal sebagai **Map** atau **Object**) adalah kumpulan pasangan Key-Value yang dikelompokkan di bawah satu induk.

- **Key**: Selalu berupa String.
- **Value**: Bisa berupa Scalar, List, atau Dictionary lain (Nested Map).
- Setiap item dalam file YAML pada dasarnya adalah anggota dari setidaknya satu Dictionary.

### 4. String Style (Gaya Penulisan Teks)

YAML memiliki fleksibilitas tinggi dalam menangani string, terutama untuk teks panjang (multiline).

- **Tanpa Kutip**: Default. Contoh: `nama: Budi Santoso`.
- **Quoted (Kutip)**: Wajib digunakan jika nilai mengandung karakter spesial YAML (`:`, `{`, `}`, `[`, `]`, `#`, dll) atau untuk menghindari ambiguitas (misal, kata "Yes" atau "No" bisa dianggap Boolean tanpa kutip).
- **Block Scalar (Multiline)**:
  - **Literal Style (`|`)**: Mempertahankan baris baru (newline) secara harfiah. Cocok untuk menulis blok kode atau alamat.
  - **Folded Style (`>`)**: Mengubah baris baru menjadi spasi. Cocok untuk menulis paragraf panjang agar tetap rapi di satu blok tanpa menjadi satu baris yang sangat panjang di editor.

---

## Praktik: Implementasi Struktur Data

Mari kita buat file konfigurasi kompleks yang menggabungkan semua konsep di atas: Scalar, List, Dictionary, dan String Styles.

### Langkah 1: Studi Kasus

Bayangkan kita sedang membuat konfigurasi untuk sebuah aplikasi web perusahaan "TechCorp". Kita perlu menyimpan data tentang versi aplikasi, detail perusahaan, dan daftar departemen.

### Langkah 2: Menulis Kode

Buat file baru bernama `latihan_tiga.yaml` dan salin kode berikut:

```yaml
# --- Latihan Sesi 3: Data Types & Structures ---

# 1. Scalar Types
app_version: 2.5 # Float
is_live: true # Boolean
maintenance_mode: null # Null

# 2. String Styles
# Menggunakan Folded Style (>) untuk deskripsi panjang
description: >
  Aplikasi ini dirancang untuk memanajemen 
  data karyawan secara terpusat
  dengan efisiensi tinggi.
  (Baris-baris ini akan digabung menjadi satu paragraf saat diproses)

# Menggunakan Literal Style (|) untuk alamat agar format baris terjaga
office_address: |
  TechCorp HQ
  Jalan Jendral Sudirman No. 10
  Jakarta Pusat, 10220

# 3. Dictionary & Sequence (Nested)
departments:
  - name: Engineering
    head: 'Alice' # Quoted string (aman)
    staff_count: 45 # Integer
    tech_stack: # List di dalam Dictionary (Flow Style)
      [Python, Go, Java]

  - name: HR
    head: Bob
    staff_count: 12
    roles: # List di dalam Dictionary (Block Style)
      - Recruiter
      - Trainer
      - Happiness Officer

# 4. Contoh Map bersarang (Nested Map)
metadata:
  created_by: admin
  timestamps:
    created_at: 2023-10-01
    updated_at: 2023-10-05
```

### Langkah 3: Analisis & Validasi

1.  Perhatikan bagaimana `description` menggunakan `>`: Di text editor terlihat 4 baris, tapi saat dibaca program nanti akan dianggap satu baris panjang dengan spasi.
2.  Perhatikan `office_address` menggunakan `|`: Baris baru akan tetap dipertahankan persis seperti yang tertulis.
3.  Validasi file `latihan_tiga.yaml` Anda menggunakan [YAML Validator](https://jsonformatter.org/yaml-viewer) atau [YAML to JSON](https://jsonformatter.org/yaml-to-json) untuk melihat hasil konversinya ke JSON. Anda akan melihat perbedaan jelas antara hasil `description` (jadi satu baris) dan `office_address` (tetap berbaris-baris dengan `\n`).
