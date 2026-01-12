---
title: 'Reusability & Advanced Keys'
---

Materi ini, membahas fitur-fitur _advanced_ YAML untuk efisiensi dan struktur data yang kompleks. Sesuai permintaan, fokus utama kita adalah pada penggunaan Anchors, Inheritance, dan Complex Keys.

---

## Materi: Pengetahuan & Konsep

Salah satu kekuatan utama YAML adalah kemampuannya untuk menghindari pengulangan kode (_Don't Repeat Yourself_ atau DRY) dan menangani struktur kunci yang tidak biasa.

### 1. Anchors (`&`) dan Aliases (`*`)

Fitur ini memungkinkan kita mendefinisikan data di satu tempat dan menggunakannya kembali di tempat lain dalam file yang sama. Ini sangat berguna untuk file konfigurasi yang panjang.

- **Anchor (`&`)**: Digunakan untuk menandai sebuah blok data agar bisa direferensikan. Simbol `&` diletakkan sebelum nilai atau blok data, diikuti nama referensinya (contoh: `&base_config`).
- **Alias (`*`)**: Digunakan untuk memanggil atau menempelkan data yang sudah ditandai oleh Anchor. Simbol `*` diikuti nama referensinya (contoh: `*base_config`).

### 2. Merge Key / Inheritance (`<<:`)

Bagaimana jika kita ingin menggunakan ulang sebuah konfigurasi (alias) tapi ingin mengubah sedikit bagiannya? Di sinilah **Merge Key** berperan.

- **Fungsi**: Menggabungkan (merge) isi dari sebuah alias ke dalam map saat ini, memungkinkan kita untuk menimpa (_override_) nilai tertentu atau menambahkan properti baru.
- **Sintaks**: Gunakan `<<: *NamaAnchor`.

### 3. Complex Keys (`?`)

Di kebanyakan bahasa, "Key" biasanya berupa string sederhana. Namun, YAML mengizinkan "Complex Keys" di mana Key itu sendiri bisa berupa data multiline atau bahkan list.

- **Penanda**: Diawali dengan tanda tanya `?` diikuti spasi.
- **Pemisah**: Nilai (Value) diawali dengan titik dua `:` pada baris baru.
- **Penggunaan**: Fitur ini jarang digunakan dalam konfigurasi umum (seperti k8s atau docker-compose) tapi berguna untuk pemetaan data yang kompleks secara matematis atau logis.

---

## Praktik: Efisiensi Konfigurasi

Kita akan membuat simulasi konfigurasi _pipeline_ CI/CD yang biasanya memiliki banyak langkah berulang, serta contoh penggunaan Complex Keys.

### Langkah 1: Studi Kasus

Kita memiliki konfigurasi untuk tiga environment: Development, Staging, dan Production.

- Semua environment memiliki pengaturan dasar yang sama (koneksi database default, timeout).
- Environment 'Production' membutuhkan pengaturan memori yang lebih besar (Override).
- Kita juga akan mencoba membuat Key yang berupa List (Complex Key).

### Langkah 2: Menulis Kode

Buat file `latihan_empat.yaml` dan salin kode berikut:

```yaml
# --- Latihan Sesi 4: Advanced Features ---

# 1. Definisi Template (Anchor)
# Kita mendefinisikan 'base_service' sebagai template
definitions:
  common_settings: &base_service
    adapter: postgresql
    host: localhost
    timeout: 30s
    memory: 512MB

# 2. Implementasi (Alias & Merge)
environments:
  # Development: Menggunakan persis apa yang ada di base_service
  development:
    database: dev_db
    config: *base_service # Alias: Copy-paste isi base_service ke sini

  # Staging: Menggunakan base_service tapi menambah properti baru
  staging:
    database: staging_db
    config:
      <<: *base_service # Merge: Ambil semua dari base_service
      mode: verbose # Tambahan properti baru

  # Production: Override nilai memory
  production:
    database: prod_db
    config:
      <<: *base_service # Merge
      host: db.prod.com # Override: host berubah
      memory: 4GB # Override: memory lebih besar

# 3. Complex Keys (Eksperimental)
# Contoh Key yang berupa List, bukan string biasa
? - dev
  - staging
  - prod
: - https://dev.example.com
  - https://staging.example.com
  - https://prod.example.com
```

### Langkah 3: Analisis Hasil

Untuk memahami apa yang terjadi, mari kita lihat bagaimana parser membaca bagian `production`:

**Input (YAML):**

```yaml
production:
  config:
    <<: *base_service
    host: db.prod.com
    memory: 4GB
```

**Output (Logika Data):**

```json
"production": {
  "config": {
    "adapter": "postgresql",  // Diwarisi dari &base_service
    "timeout": "30s",         // Diwarisi dari &base_service
    "host": "db.prod.com",    // Di-override
    "memory": "4GB"           // Di-override
  }
}
```

Perhatikan bahwa `adapter` dan `timeout` otomatis muncul meskipun kita tidak menulisnya ulang di blok `production`. Inilah kekuatan _Inheritance_ di YAML.
