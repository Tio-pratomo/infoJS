---
title: 'Arsitektur Skala Besar & Async Actions'
---

## Bagian 1: Menangani API Calls (Async Actions)

Salah satu keunggulan utama Zustand dibanding Redux (versi lama) adalah Anda tidak butuh middleware tambahan seperti `redux-thunk` atau `redux-saga` untuk melakukan fetch data.

Di Zustand, action hanyalah fungsi. Jika butuh async, cukup tambahkan keyword `async/await`.

### Praktik: Fetch Data Produk

Kita akan membuat store yang mengambil data dari API publik (FakeStoreAPI).

```javascript title="useProductStore.js"
import { create } from 'zustand';

const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,

  // ASYNC ACTION
  fetchProducts: async () => {
    // 1. Set loading state
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) throw new Error('Gagal mengambil data');

      const data = await response.json();

      // 2. Set data sukses
      set({ products: data, isLoading: false });
    } catch (err) {
      // 3. Set error
      set({ error: err.message, isLoading: false });
    }
  },
}));

export default useProductStore;
```

**Penggunaan di Komponen:**

```javascript
import { useEffect } from 'react';
import useProductStore from './useProductStore';

const ProductList = () => {
  // Ambil state & action
  const { products, isLoading, error, fetchProducts } = useProductStore();

  // Panggil fetch saat komponen mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="border p-4">
          <h3 className="font-bold">{product.title}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## Bagian 2: The Slices Pattern (Memecah Store)

Saat aplikasi membesar, file `store.js` Anda bisa menjadi ribuan baris. **Jangan biarkan ini terjadi.**

Solusi terbaik di Zustand adalah **Slices Pattern**. Kita memecah fitur menjadi file-file kecil, lalu menggabungkannya menjadi satu hook `useStore`.

### Konsep:

- **Slice**: Sebuah fungsi yang menerima `set` dan `get`, lalu mengembalikan objek state bagiannya saja.
- **Bound Store**: Store utama yang menggabungkan semua slice.

### Praktik: E-Commerce Store (Gabungan Cart & Auth)

Kita akan membuat 3 file:

1.  `authSlice.js` (Logika User)
2.  `cartSlice.js` (Logika Keranjang)
3.  `useBoundStore.js` (Store Utama)

**Langkah 1: Buat Auth Slice**

```javascript
// slices/authSlice.js
const createAuthSlice = (set) => ({
  user: null,
  login: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
});

export default createAuthSlice;
```

**Langkah 2: Buat Cart Slice (Yang Bisa Baca Auth!)**

Di sini triknya. Bagaimana jika Cart butuh data User?

Setiap slice menerima parameter `set`, `get` (untuk baca state lain), dan `api`.

```javascript
// slices/cartSlice.js
const createCartSlice = (set, get) => ({
  cartItems: [],

  addToCart: (product) => {
    // Logic: Cek apakah user sudah login menggunakan 'get()'
    // 'get()' mengakses STATE GLOBAL (gabungan semua slice)
    const { user } = get();

    if (!user) {
      alert('Eits, login dulu bos!');
      return;
    }

    set((state) => ({
      cartItems: [...state.cartItems, product],
    }));
  },

  resetCart: () => set({ cartItems: [] }),
});

export default createCartSlice;
```

**Langkah 3: Gabungkan di Bound Store**

```javascript
// useBoundStore.js
import { create } from 'zustand';
import createAuthSlice from './slices/authSlice';
import createCartSlice from './slices/cartSlice';

// Gabungkan slice di sini
const useBoundStore = create((...a) => ({
  ...createAuthSlice(...a), // Spread syntax untuk inject set, get, api
  ...createCartSlice(...a),
}));

export default useBoundStore;
```

**Langkah 4: Penggunaan di UI**

Sekarang Anda hanya perlu satu import untuk semua fitur!

```javascript
import useBoundStore from './useBoundStore';

const Navbar = () => {
  // Bisa ambil state dari Auth Slice DAN Cart Slice sekaligus
  const user = useBoundStore((state) => state.user);
  const cartItems = useBoundStore((state) => state.cartItems);
  const logout = useBoundStore((state) => state.logout);

  return (
    <nav>
      <h1>Toko Online</h1>
      <div>User: {user ? user.name : 'Guest'}</div>
      <div>Cart: {cartItems.length} items</div>
    </nav>
  );
};
```

---

## Bagian 3: Mengakses Store di Luar React

Terkadang Anda perlu mengakses state di luar komponen React, misalnya di dalam fungsi helper utility atau interceptor Axios.

**Caranya: Gunakan `.getState()` dan `.setState()`**

Contoh: Kita ingin menyisipkan token auth ke setiap request API secara otomatis.

```javascript
// api/axiosClient.js
import axios from 'axios';
import useBoundStore from '../store/useBoundStore'; // Import store langsung

const apiClient = axios.create({ baseURL: 'https://api.example.com' });

apiClient.interceptors.request.use((config) => {
  // BACA state secara imperatif (tanpa Hooks)
  const token = useBoundStore.getState().token; // Asumsi ada state token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Contoh lain: Logout paksa jika token expired (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // TULIS state secara imperatif
      useBoundStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Ringkasan Akhir & Best Practices

Selamat! Anda telah menamatkan materi Zustand.

Berikut adalah checklist "Zustand Senior Developer":

1.  **Atomic Selectors**: Selalu ambil yang dibutuhkan saja. `state => state.prop`.
2.  **Flat State**: Usahakan struktur data state sedatar mungkin. Jangan terlalu dalam (`state.data.items.0.details`).
3.  **Action Separation**: Pisahkan logic fetching (async) di dalam action store, biarkan UI bersih.
4.  **Slice Pattern**: Gunakan slices jika kode store sudah lebih dari 100 baris.
5.  **Reset Pattern**: Selalu buat action `resetAll` untuk membersihkan state saat user logout.

```javascript
// Tips Bonus: Pattern Reset Global
const initialState = {
  count: 0,
  list: []
};

const useStore = create((set) => ({
  ...initialState,
  increase: () => ...,
  // Action sakti untuk logout
  reset: () => set(initialState)
}));
```
