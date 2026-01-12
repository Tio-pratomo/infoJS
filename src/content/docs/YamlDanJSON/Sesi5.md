---
title: 'Real-World Examples (AWS, K8s, Azure)'
---

Materi ini, membahas studi kasus nyata penggunaan YAML di ekosistem Cloud modern, termasuk AWS, Kubernetes, dan Azure DevOps. Materi ini dirancang untuk menjembatani teori yang sudah dipelajari dengan implementasi industri.

---

## Materi: Analisis Studi Kasus

Di dunia nyata, YAML tidak berdiri sendiri. Setiap platform memiliki "dialek" dan struktur uniknya masing-masing. Kita akan membedah tiga raksasa teknologi yang menggunakan YAML sebagai tulang punggung konfigurasinya.

### 1. AWS CloudFormation: Infrastructure as Code

AWS CloudFormation menggunakan YAML untuk mendefinisikan infrastruktur cloud (server, database, network).

**Fitur Unik: Intrinsic Functions (`!Ref`, `!Sub`, `!GetAtt`)**
Jika Anda perhatikan dokumen AWS, Anda akan sering melihat tanda seru `!` sebelum sebuah kata. Ini adalah **Tag Khusus** (YAML Tags) yang digunakan CloudFormation untuk fungsi logika.

**Contoh :**

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: Template S3 Sederhana

Parameters:
  NamaBucket:
    Type: String
    Description: Masukkan nama unik untuk bucket Anda

Resources:
  MyS3Bucket:
    Type: 'AWS::S3::Bucket'
    Properties:
      BucketName: !Ref NamaBucket # <--- Perhatikan !Ref
      AccessControl: Private
```

- **Analisis**:
  - `Resources`: Bagian wajib. Mendefinisikan "apa yang ingin dibuat".
  - `!Ref NamaBucket`: Ini bukan string biasa. Tanda `!` memberitahu AWS untuk "mengambil nilai dari parameter `NamaBucket` yang diinput user". Ini adalah contoh penerapan dinamis di YAML.

### 2. Kubernetes (K8s): Orchestration Manifest

File YAML di Kubernetes (sering disebut _manifest_) memiliki struktur yang sangat terstandar dan deklaratif.

**Struktur Anatomi K8s:**
Hampir semua file K8s memiliki 4 pilar utama:

1.  `apiVersion`: Versi API yang digunakan.
2.  `kind`: Jenis resource (Pod, Service, Deployment).
3.  `metadata`: Identitas (nama, label).
4.  `spec`: Spesifikasi "keadaan yang diinginkan" (_desired state_).

**Contoh :**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rss-site
spec:
  replicas: 2 # Jumlah copy aplikasi yang diinginkan
  selector:
    matchLabels:
      app: web
  template: # Template untuk membuat Pod
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: front-end
          image: nginx
```

- **Analisis**:
  - **Nested Complexity**: Perhatikan indentasi yang dalam (`spec` -> `template` -> `spec` -> `containers`). Ini menunjukkan struktur hierarki objek yang kompleks.
  - **List of Objects**: Bagian `containers` diawali dengan `-`, menandakan bahwa satu Pod bisa memiliki _list_ (banyak) container di dalamnya.

### 3. Azure Pipelines: CI/CD Automation

Azure DevOps menggunakan YAML untuk mengatur langkah-langkah otomatisasi (build, test, deploy).

**Fitur Unik: Steps & Tasks**
Azure Pipeline sangat berfokus pada urutan eksekusi (`steps`).

**Contoh :**

```yaml
trigger: none

parameters:
  - name: myString
    type: string
    default: a string

jobs:
  - job: stepList
    steps:
      - script: echo step one # Step 1: Jalankan script shell
      - script: echo step two # Step 2: Jalankan script shell

  - job: myStep
    steps:
      - ${{ parameters.myStep }} # Template Expression
```

- **Analisis**:
  - **Trigger**: Mendefinisikan kapan pipeline jalan (di sini `none`, berarti manual).
  - **Parameters**: Mirip variabel input.
  - **Macro Syntax `${{ ... }}`**: Azure menggunakan sintaks khusus `${{ }}` untuk menyuntikkan nilai parameter atau variabel saat _runtime_. Meskipun ini terlihat seperti string di mata parser YAML standar, Azure Pipeline engine akan memprosesnya secara khusus.

---

## Ringkasan Perbandingan

| Fitur                | AWS CloudFormation          | Kubernetes (K8s)             | Azure Pipelines           |
| :------------------- | :-------------------------- | :--------------------------- | :------------------------ |
| **Fokus Utama**      | Infrastruktur (IaC)         | Orchestration                | Automasi (CI/CD)          |
| **Struktur Khas**    | `Resources`, `Parameters`   | `apiVersion`, `kind`, `spec` | `stages`, `jobs`, `steps` |
| **Keunikan Sintaks** | Tag `!Ref`, `!Sub`, `!Join` | Deep Nesting (Map dalam Map) | Expression `${{ ... }}`   |

---

## Praktik: Identifikasi Pola

1. Buatlah file `` kemudian tulis kode di bawah ini:

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rss-site
  labels:
    app: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: front-end
          image: nginx
          ports:
            - containerPort: 80
        - name: rss-reader
          image: nickchase/rss-php-nginx:v1
          ports:
            - containerPort: 88

---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  labels:
    app: nginx
spec:
  ports:
    - nodePort: 30500
      port: 80
      protocol: TCP
      targetPort: 80
  selector:
    app: nginx
  type: NodePort
```

Simpan dimanapun yang anda suka.

Sekarang, lihat kode `k8s_sample.yml` tersebut, dan temukan bagian `Service`.

1.  Lihat baris `type: NodePort`.
2.  Bandingkan dengan bagian `Deployment` di atasnya.
3.  Perhatikan bahwa keduanya dipisahkan oleh tanda `---`.
    - **Pelajaran Baru**: Tanda `---` di YAML digunakan untuk memisahkan **multiple documents** dalam satu file. Artinya, satu file fisik bisa berisi dua definisi objek yang berbeda secara logis (Deployment dan Service).
