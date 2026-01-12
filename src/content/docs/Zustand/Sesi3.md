---
title: 'Middleware & Persistence (Data Abadi)'
---

Middleware di Zustand berfungsi sebagai "satpam" atau "jembatan" yang memantau setiap perubahan state sebelum atau sesudah perubahan itu terjadi.

Kita akan fokus pada dua middleware paling penting: `persist` (untuk penyimpanan) dan `devtools` (untuk debugging).

## Bagian 1: Materi & Konsep

### 1. Apa itu `persist` middleware?

Secara default, state React hidup di memori RAM (volatile). Middleware `persist` secara otomatis:

1.  Menyimpan state ke `localStorage` (atau sessionStorage/AsyncStorage) setiap kali ada perubahan.
2.  Melakukan _rehydration_ (memuat ulang data) dari storage ke state saat aplikasi pertama kali dibuka.

### 2. Apa itu `devtools` middleware?

Jika Anda pernah pakai Redux, Anda pasti tahu **Redux DevTools Extension**.

Middleware ini menghubungkan Zustand dengan extension tersebut, memungkinkan Anda melihat log perubahan state secara visual (Time Travel Debugging).

### 3. Struktur Middleware

Sintaksnya sedikit unik karena kita membungkus fungsi `create`.
Pola dasar: `create(middleware1(middleware2((set) => ({ ... }))))`.

---

## Bagian 2: Praktik (Membuat Data "Tahan Banting")

Kita akan memodifikasi `useTaskStore.js` dari Sesi 2. Tidak perlu mengubah komponen UI (`TaskInput` atau `TaskList`), karena perubahan ini transparan bagi komponen!

### Langkah 1: Import Middleware

Buka `useTaskStore.js` dan ubah import-nya.

```javascript
import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware'; // Import penting

// Kita definisikan store logic terpisah agar kode lebih bersih (Best Practice)
const taskStore = (set) => ({
  tasks: [], // Mulai dengan array kosong

  addTask: (title) =>
    set(
      (state) => ({
        tasks: [...state.tasks, { id: Date.now(), title, isCompleted: false }],
      }),
      false,
      'tasks/add'
    ), // Parameter ke-3 adalah label action untuk DevTools

  removeTask: (id) =>
    set(
      (state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }),
      false,
      'tasks/remove'
    ),

  toggleTaskStatus: (id) =>
    set(
      (state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        ),
      }),
      false,
      'tasks/toggle'
    ),
});

// Bungkus store logic dengan middleware
const useTaskStore = create(
  devtools(
    persist(taskStore, {
      name: 'my-task-storage', // Kunci unik di LocalStorage
      storage: createJSONStorage(() => localStorage), // Opsional, defaultnya localStorage

      // Fitur Advanced: Partial Persistence
      // Misalnya kita hanya ingin menyimpan tasks, tapi tidak menyimpan state 'isLoading' (jika ada)
      // partialize: (state) => ({ tasks: state.tasks }),
    }),
    { name: 'TaskApp' } // Nama instance di Redux DevTools
  )
);

export default useTaskStore;
```

### Langkah 2: Verifikasi Persistence

1.  Jalankan aplikasi Anda.
2.  Tambah beberapa task: "Belajar Middleware", "Minum Kopi".
3.  **Refresh halaman browser**.
4.  Ajaib! Task Anda masih ada di sana.

**Cara Cek Manual:**

- Buka Browser DevTools (F12) > Tab **Application** > Storage > Local Storage.
- Cari key bernama `my-task-storage`.
- Anda akan melihat JSON string berisi state Anda: `{"state":{"tasks":[...]},"version":0}`.

### Langkah 3: Menangani Hydration Error (Penting untuk Next.js/SSR)

Jika Anda menggunakan **Next.js**, penggunaan `persist` bisa menyebabkan error _"Text content does not match server-rendered HTML"_. Ini terjadi karena di server (SSR) LocalStorage tidak ada, sedangkan di client (browser) data langsung dimuat, sehingga HTML-nya beda.

**Solusi (Custom Hook untuk Hydration Safe):**
Buat file hook utilitas: `useStore.js` (bukan store, tapi helper).

```javascript
// utils/useStore.js
import { useState, useEffect } from 'react';

// Hook ini memastikan komponen hanya merender data store SETELAH mounted di client
const useStore = (store, callback) => {
  const result = store(callback);
  const [data, setData] = useState();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

export default useStore;
```

**Cara Pakai di Komponen (Next.js Only):**

```javascript
// TaskList.jsx
import useTaskStore from './useTaskStore';
import useStore from '../utils/useStore'; // Import helper tadi

const TaskList = () => {
  // Ganti pemanggilan biasa dengan helper
  // const tasks = useTaskStore((state) => state.tasks); // Cara biasa (Rawan Error SSR)
  const tasks = useStore(useTaskStore, (state) => state.tasks); // Cara Aman SSR

  if (!tasks) return <div>Loading tasks...</div>; // Handle state awal sebelum hydration

  // ... sisa kode sama
```

_Catatan: Jika Anda pakai Vite/CRA (Client Side Only), langkah 3 ini opsional._

---

## Bagian 3: Studi Kasus Autentikasi (Token Storage)

Selain Todo List, middleware sangat sering dipakai untuk menyimpan **Token Login**.

### Praktik: Auth Store Sederhana dengan Session Storage

Kadang kita ingin data hilang saat browser ditutup (Session), bukan selamanya (Local).

```javascript
// useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage), // Ganti ke Session Storage!
    }
  )
);

export default useAuthStore;
```

### Ringkasan Poin Kunci Sesi 3:

1.  **Persist**: Middleware sakti untuk menyimpan state ke storage browser. Cukup bungkus konfigurasi store Anda.
2.  **Devtools**: Wajib dipakai saat development untuk melihat log perubahan state.
3.  **Storage Types**: Anda bisa memilih `localStorage` (permanen), `sessionStorage` (sementara), atau bahkan `AsyncStorage` (untuk React Native).
4.  **Hydration**: Hati-hati dengan perbedaan render Server vs Client saat menggunakan data persisten di framework SSR seperti Next.js.

Sekarang aplikasi Anda sudah punya state manajemen yang solid dan data yang persisten. Tapi bagaimana jika aplikasi semakin besar dan butuh interaksi antar-store yang rumit?
