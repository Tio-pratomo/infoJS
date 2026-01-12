---
title: File Handling dan Media Upload
---

Setelah menguasai animasi dan UI patterns, saatnya kita menangani salah satu fitur paling umum dalam aplikasi web: **upload file**. Sesi ini akan membahas cara mengimplementasikan upload file yang robust dengan **progress tracking**, **validasi**, **preview**, dan **drag-and-drop** menggunakan Datastar dan Node.js.

## Pengantar: Kenapa Upload File Itu Rumit?

Upload file berbeda dengan pengiriman data JSON biasa karena:

- **Format berbeda**: File dikirim sebagai `multipart/form-data`, bukan JSON
- **Size besar**: Memerlukan streaming dan progress tracking
- **Validasi kompleks**: Tipe file, ukuran, dimensi (untuk image)
- **Security risks**: File upload adalah vektor serangan umum
- **Storage management**: Perlu sistem penyimpanan file yang tepat

Untuk Node.js/Express, kita akan menggunakan **Multer**—middleware paling populer untuk handling file upload.

## Setup Dasar: Instalasi Multer

**Install dependencies:**

```bash
npm install express multer
```

**Struktur project:**

```
project/
├── server.js
├── uploads/          # Folder untuk menyimpan file
├── public/
│   └── index.html
└── package.json
```

## Implementasi Dasar: Single File Upload

Mari kita mulai dengan implementasi upload file tunggal yang sederhana.

**File: `server.js` (Backend Node.js)**

```js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// Konfigurasi Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter untuk validasi
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP allowed."),
      false
    );
  }
};

// Inisialisasi Multer dengan config
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max 5MB
  },
});

// Endpoint upload single file
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No file uploaded",
    });
  }

  // Sukses upload
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: true,
    message: "File uploaded successfully",
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`,
    },
    uploadComplete: true,
  });
});

// Error handler untuk Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File terlalu besar. Maksimal 5MB.",
      });
    }
  }

  res.status(400).json({
    error: error.message || "Upload failed",
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Penjelasan Backend:**

1. **`multer.diskStorage()`**: Konfigurasi penyimpanan file ke disk
2. **`destination`**: Folder tujuan upload
3. **`filename`**: Logic untuk generate nama file unik (mencegah overwrite)
4. **`fileFilter`**: Validasi tipe file di server
5. **`limits`**: Batasan ukuran file (5MB)
6. **`upload.single('file')`**: Middleware untuk handle single file dengan field name 'file'

**File: `public/index.html` (Frontend)**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>File Upload - Datastar</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 40px 20px;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 30px;
      }

      .upload-area {
        border: 3px dashed #ddd;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        background: #f9f9f9;
        cursor: pointer;
        transition: all 0.3s;
      }

      .upload-area:hover {
        border-color: #667eea;
        background: #f0f0ff;
      }

      .upload-area.dragging {
        border-color: #667eea;
        background: #e8f0fe;
        transform: scale(1.02);
      }

      .upload-icon {
        font-size: 48px;
        margin-bottom: 10px;
      }

      input[type="file"] {
        display: none;
      }

      .file-info {
        margin: 20px 0;
        padding: 15px;
        background: #f0f0f0;
        border-radius: 6px;
        display: none;
      }

      .file-info.show {
        display: block;
      }

      .progress-container {
        margin: 20px 0;
        display: none;
      }

      .progress-container.show {
        display: block;
      }

      progress {
        width: 100%;
        height: 20px;
        border-radius: 10px;
      }

      progress::-webkit-progress-bar {
        background: #f0f0f0;
        border-radius: 10px;
      }

      progress::-webkit-progress-value {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
      }

      .progress-text {
        text-align: center;
        margin-top: 8px;
        color: #666;
        font-size: 14px;
      }

      .preview-container {
        margin: 20px 0;
        text-align: center;
        display: none;
      }

      .preview-container.show {
        display: block;
      }

      .preview-image {
        max-width: 100%;
        max-height: 300px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      button {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .message {
        margin-top: 20px;
        padding: 12px;
        border-radius: 6px;
        text-align: center;
        display: none;
      }

      .message.show {
        display: block;
      }

      .message.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .message.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div class="container">
      <div
        data-signals='{
            "selectedFile": null,
            "fileName": "",
            "fileSize": 0,
            "fileType": "",
            "previewUrl": "",
            "uploadProgress": 0,
            "isUploading": false,
            "uploadComplete": false,
            "uploadedFileUrl": "",
            "message": "",
            "messageType": ""
        }'
      >
        <h1>📤 Upload File dengan Datastar</h1>

        <!-- Upload Area -->
        <div
          class="upload-area"
          id="uploadArea"
          data-on-click="document.getElementById('fileInput').click()"
        >
          <div class="upload-icon">📁</div>
          <p><strong>Klik untuk memilih file</strong></p>
          <p style="color: #999; font-size: 14px; margin-top: 5px;">
            atau drag & drop file di sini
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">
            Max 5MB • JPEG, PNG, GIF, WebP
          </p>
        </div>

        <input type="file" id="fileInput" accept="image/*" />

        <!-- File Info -->
        <div class="file-info" data-class="show:$fileName">
          <p><strong>File:</strong> <span data-text="$fileName"></span></p>
          <p>
            <strong>Size:</strong>
            <span data-text="($fileSize / 1024).toFixed(2) + ' KB'"></span>
          </p>
          <p><strong>Type:</strong> <span data-text="$fileType"></span></p>
        </div>

        <!-- Preview -->
        <div class="preview-container" data-class="show:$previewUrl">
          <img
            class="preview-image"
            data-attr-src="$previewUrl"
            alt="Preview"
          />
        </div>

        <!-- Progress Bar -->
        <div class="progress-container" data-class="show:$isUploading">
          <progress max="100" data-attr-value="$uploadProgress"></progress>
          <div class="progress-text">
            <span data-text="$uploadProgress + '%'"></span> uploaded
          </div>
        </div>

        <!-- Upload Button -->
        <button
          data-on-click="@post('/upload', {}, { form: true })"
          data-attr-disabled="!$fileName || $isUploading"
          data-show="!$uploadComplete"
        >
          <span data-show="!$isUploading">Upload File</span>
          <span data-show="$isUploading">Uploading...</span>
        </button>

        <!-- Success Preview -->
        <div
          data-show="$uploadComplete"
          style="text-align: center; margin-top: 20px;"
        >
          <p style="color: #155724; font-weight: 600; margin-bottom: 10px;">
            ✅ Upload Berhasil!
          </p>
          <img
            data-attr-src="$uploadedFileUrl"
            alt="Uploaded"
            style="max-width: 100%; border-radius: 8px;"
          />
          <button
            data-on-click="$uploadComplete = false; $fileName = ''; $previewUrl = ''; document.getElementById('fileInput').value = ''"
            style="margin-top: 15px;"
          >
            Upload File Lain
          </button>
        </div>

        <!-- Message -->
        <div
          class="message"
          data-class="show:$message, success:$messageType === 'success', error:$messageType === 'error'"
          data-text="$message"
        ></div>
      </div>
    </div>

    <script>
      // File input change handler
      const fileInput = document.getElementById("fileInput");
      const uploadArea = document.getElementById("uploadArea");

      fileInput.addEventListener("change", (e) => {
        handleFiles(e.target.files);
      });

      // Drag and drop handlers
      uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("dragging");
      });

      uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragging");
      });

      uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("dragging");
        handleFiles(e.dataTransfer.files);
      });

      // Handle file selection
      function handleFiles(files) {
        if (files.length === 0) return;

        const file = files;

        // Update Datastar signals manually via custom event
        window.dispatchEvent(
          new CustomEvent("datastar-signal-patch", {
            detail: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              uploadComplete: false,
              message: "",
            },
          })
        );

        // Generate preview untuk image
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            window.dispatchEvent(
              new CustomEvent("datastar-signal-patch", {
                detail: { previewUrl: e.target.result },
              })
            );
          };
          reader.readAsDataURL(file);
        }
      }

      // Track upload progress
      document.addEventListener("datastar-fetch", (e) => {
        if (e.detail.type === "start" && e.detail.url.includes("/upload")) {
          // Set uploading state
          window.dispatchEvent(
            new CustomEvent("datastar-signal-patch", {
              detail: { isUploading: true, uploadProgress: 0 },
            })
          );

          // Simulate progress (real progress requires XMLHttpRequest)
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            if (progress >= 90) {
              clearInterval(interval);
            }
            window.dispatchEvent(
              new CustomEvent("datastar-signal-patch", {
                detail: { uploadProgress: progress },
              })
            );
          }, 200);
        }

        if (e.detail.type === "end") {
          window.dispatchEvent(
            new CustomEvent("datastar-signal-patch", {
              detail: {
                isUploading: false,
                uploadProgress: 100,
              },
            })
          );
        }
      });
    </script>
  </body>
</html>
```

**Penjelasan Frontend:**

1. **Drag & Drop**: Event handlers untuk `dragover`, `dragleave`, dan `drop`
2. **File Preview**: Menggunakan `FileReader` API untuk generate preview image
3. **Progress Simulation**: Progress bar yang update secara simulasi (untuk real progress, perlu XMLHttpRequest)
4. **Datastar Integration**: Upload menggunakan `@post()` dengan option `{ form: true }` untuk multipart
5. **Custom Events**: Menggunakan `datastar-signal-patch` event untuk update sinyal dari vanilla JS

**Alur Upload:**

1. User pilih file (klik atau drag-drop)
2. File info dan preview ditampilkan
3. User klik "Upload File"
4. Datastar kirim POST `/upload` dengan `form: true`
5. Progress bar animate
6. Server terima, validasi, simpan file
7. Server kembalikan patch sinyal dengan URL file
8. UI menampilkan hasil upload

## Multiple Files Upload

Untuk upload beberapa file sekaligus:

**Backend adjustment:**

```js
// Ganti upload.single() dengan upload.array()
app.post("/upload-multiple", upload.array("files", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const uploadedFiles = req.files.map((file) => ({
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    url: `/uploads/${file.filename}`,
  }));

  res.json({
    success: true,
    message: `${req.files.length} files uploaded`,
    files: uploadedFiles,
  });
});
```

**Frontend adjustment:**

```html
<input type="file" id="fileInput" accept="image/*" multiple />
```

## Real Progress Tracking dengan XMLHttpRequest

Untuk mendapatkan real upload progress (bukan simulasi), kita perlu menggunakan XMLHttpRequest:

```html
<script>
  function uploadWithProgress(file, onProgress, onComplete) {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    // Handle completion
    xhr.addEventListener("loadend", () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        onComplete(null, response);
      } else {
        onComplete(new Error("Upload failed"));
      }
    });

    xhr.open("POST", "/upload");
    xhr.send(formData);
  }

  // Usage
  uploadWithProgress(
    selectedFile,
    (progress) => {
      // Update Datastar signal
      window.dispatchEvent(
        new CustomEvent("datastar-signal-patch", {
          detail: { uploadProgress: Math.round(progress) },
        })
      );
    },
    (error, result) => {
      if (error) {
        console.error("Upload failed:", error);
      } else {
        console.log("Upload success:", result);
      }
    }
  );
</script>
```

## Real Progress Tracking dengan Axios

```html
<script>
  function uploadWithProgress(file, onProgress, onComplete) {
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentComplete =
              (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(percentComplete);
          }
        },
      })
      .then((response) => {
        onComplete(null, response.data);
      })
      .catch((error) => {
        onComplete(error);
      });
  }
</script>
```

## Tabel Ringkasan Upload Patterns

| Feature               | Implementation                 | Kompleksitas | Priority |
| :-------------------- | :----------------------------- | :----------- | :------- |
| **Single File**       | `upload.single('file')`        | Rendah       | Tinggi   |
| **Multiple Files**    | `upload.array('files', max)`   | Rendah       | Tinggi   |
| **Drag & Drop**       | HTML5 DataTransfer API         | Menengah     | Tinggi   |
| **Preview**           | FileReader API                 | Rendah       | Tinggi   |
| **Progress (Real)**   | XMLHttpRequest upload.progress | Menengah     | Sedang   |
| **Validation Client** | File type/size check di JS     | Rendah       | Tinggi   |
| **Validation Server** | Multer fileFilter + limits     | Rendah       | Tinggi   |

## Security Best Practices

**Validasi ganda**: Selalu validasi di client DAN server

**File type whitelist**: Hanya allow tipe file yang dibutuhkan

**Size limits**: Batasi ukuran file untuk prevent DoS

**Unique filenames**: Generate nama unik untuk prevent overwrite dan path traversal

**Scan malware**: Gunakan antivirus scanner untuk production

**Secure storage**: Jangan simpan file di folder public yang executable

Di **Sesi 8**, kita akan fokus pada **performance optimization** dan **debugging tools** untuk memastikan aplikasi Datastar Anda berjalan dengan optimal!
