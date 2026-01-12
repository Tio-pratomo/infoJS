---
title: Security dan Production Best Practices
---

Setelah membangun aplikasi yang cepat dan optimal, kini saatnya memastikan aplikasi **aman dari serangan** dan siap untuk **production**. Sesi ini membahas implementasi security layers, authentication/authorization, dan best practices deployment.

## Pengantar: Security First Mindset

Keamanan bukan fitur tambahan—ia adalah **fundamental requirement**. Satu vulnerability bisa mengakibatkan:

- **Data breach**: Pencurian data sensitif user
- **Financial loss**: Kerugian finansial langsung atau denda GDPR
- **Reputation damage**: Kehilangan kepercayaan user
- **Legal liability**: Tuntutan hukum dari user yang terdampak

**OWASP Top 10 2025** vulnerabilities yang paling sering terjadi:

1. Broken Access Control
2. Cryptographic Failures
3. Injection (SQL, XSS)
4. Insecure Design
5. Security Misconfiguration

## CSRF Protection — Cross-Site Request Forgery

**CSRF** adalah serangan di mana attacker memaksa user untuk melakukan aksi yang tidak diinginkan pada aplikasi yang mereka sudah authenticated.

### Contoh Serangan CSRF

```html
<!-- Website jahat (evil.com) -->
<img src="https://bank.com/transfer?to=attacker&amount=1000" />
```

Jika user sudah login ke `bank.com`, browser otomatis mengirim cookie session, dan transfer terjadi tanpa sepengetahuan user.

### Implementasi CSRF Protection di Datastar

Untuk aplikasi modern, gunakan **Double Submit Cookie** pattern atau **CSRF Token**.

**Install `csurf` middleware:**

```bash
npm install csurf cookie-parser
```

**Backend: `server.js`**

```js
import express from "express";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setup CSRF protection
const csrfProtection = csrf({ cookie: true });

// Serve static files
app.use(express.static("public"));

// GET: Render halaman dengan CSRF token
app.get("/", csrfProtection, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API endpoint untuk mendapatkan CSRF token
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// POST endpoint yang dilindungi CSRF
app.post("/api/transfer", csrfProtection, (req, res) => {
  const { to, amount } = req.body;

  // Jika CSRF token tidak valid, csurf middleware akan reject dengan 403
  // Jika sampai sini, berarti token valid

  console.log(`Transfer $${amount} to ${to}`);

  res.json({
    success: true,
    message: "Transfer berhasil",
    transaction: { to, amount },
  });
});

// Error handler untuk CSRF
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403).json({
      error: "Invalid CSRF token. Possible CSRF attack detected.",
    });
  } else {
    next(err);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Frontend: `public/index.html`**

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CSRF Protection - Datastar</title>
    <style>
      body {
        font-family: sans-serif;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
      }

      .form-group {
        margin-bottom: 15px;
      }

      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
      }

      input {
        width: 100%;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 6px;
      }

      button {
        padding: 12px 24px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }

      .message {
        margin-top: 20px;
        padding: 12px;
        border-radius: 6px;
        display: none;
      }

      .message.show {
        display: block;
      }

      .message.success {
        background: #d4edda;
        color: #155724;
      }

      .message.error {
        background: #f8d7da;
        color: #721c24;
      }
    </style>
  </head>
  <body>
    <script src="https://cdn.jsdelivr.net/npm/@datastar/core@latest"></script>

    <div
      data-signals='{
        "csrfToken": "",
        "to": "",
        "amount": "",
        "message": "",
        "messageType": ""
    }'
    >
      <h1>🔒 Transfer Aman dengan CSRF Protection</h1>

      <form
        data-on-submit.prevent="@post('/api/transfer', { to: $to, amount: $amount, _csrf: $csrfToken })"
      >
        <div class="form-group">
          <label>Transfer ke:</label>
          <input
            type="text"
            data-bind-value="$to"
            placeholder="Username tujuan"
          />
        </div>

        <div class="form-group">
          <label>Jumlah:</label>
          <input type="number" data-bind-value="$amount" placeholder="0" />
        </div>

        <button type="submit">Transfer</button>
      </form>

      <div
        class="message"
        data-class="show:$message, success:$messageType === 'success', error:$messageType === 'error'"
        data-text="$message"
      ></div>
    </div>

    <script>
      // Fetch CSRF token saat halaman dimuat
      window.addEventListener("load", async () => {
        try {
          const response = await fetch("/api/csrf-token");
          const data = await response.json();

          // Update sinyal dengan CSRF token
          window.dispatchEvent(
            new CustomEvent("datastar-signal-patch", {
              detail: { csrfToken: data.csrfToken },
            })
          );

          console.log("CSRF token loaded:", data.csrfToken);
        } catch (error) {
          console.error("Failed to load CSRF token:", error);
        }
      });
    </script>
  </body>
</html>
```

**Penjelasan:**

1. **Token generation**: Server generate CSRF token unik per session
2. **Token delivery**: Token dikirim ke client via API endpoint
3. **Token validation**: Setiap POST/PUT/DELETE harus include token
4. **Automatic rejection**: `csurf` middleware otomatis reject request tanpa token valid

## XSS Prevention — Cross-Site Scripting

**XSS** adalah serangan di mana attacker inject malicious script ke dalam web page.

### Jenis-Jenis XSS

**Reflected XSS**: Script dalam URL yang di-reflect ke response

```
https://bank.com/search?q=<script>alert('XSS')</script>
```

**Stored XSS**: Script disimpan di database (misal: comment)

```html
<div>
  Comment:
  <script>
    steal_cookies();
  </script>
</div>
```

**DOM-based XSS**: Script dieksekusi via client-side JavaScript

### Pencegahan XSS di Datastar

**1. Escape HTML di Backend**

```js
function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.post("/comment", (req, res) => {
  const { comment } = req.body;

  // Escape semua user input
  const safeComment = escapeHtml(comment);

  res.setHeader("Content-Type", "text/html");
  res.send(`
        <div class="comment">
            <p>${safeComment}</p>
        </div>
    `);
});
```

**2. Content Security Policy (CSP)**

CSP adalah HTTP header yang membatasi sumber resource yang boleh diload.

```js
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';"
  );
  next();
});
```

**3. Sanitize Input dengan DOMPurify**

Untuk rich text input (seperti WYSIWYG editor):

```bash
npm install isomorphic-dompurify
```

```js
import DOMPurify from "isomorphic-dompurify";

app.post("/blog", (req, res) => {
  const { content } = req.body;

  // Sanitize HTML content
  const cleanContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["p", "b", "i", "em", "strong", "a", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "title"],
  });

  res.json({ content: cleanContent });
});
```

## Rate Limiting — Prevent Brute Force & DoS

**Rate limiting** membatasi jumlah request dari satu IP dalam periode waktu tertentu.

**Install `express-rate-limit`:**

```bash
npm install express-rate-limit
```

**Implementasi:**

```js
import rateLimit from "express-rate-limit";

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Max 100 requests per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: "Terlalu banyak request dari IP ini, coba lagi nanti.",
});

// Strict limiter untuk endpoint sensitif
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 login attempts per 15 menit
  skipSuccessfulRequests: true, // Hanya hitung failed requests
  message: "Terlalu banyak login attempts. Coba lagi dalam 15 menit.",
});

// Apply limiters
app.use("/api/", globalLimiter);
app.post("/api/login", authLimiter, (req, res) => {
  // Login logic
});
```

**Advanced: Custom key generator (per user, bukan per IP):**

```js
const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    // Rate limit per user ID jika authenticated
    return req.user?.id || req.ip;
  },
});
```

## Authentication & Authorization Pattern

### JWT-Based Authentication

**Install dependencies:**

```bash
npm install jsonwebtoken bcryptjs
```

**Backend implementation:**

```js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const users = []; // Simulasi DB

// Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  // Validasi
  if (!username || !password || password.length < 8) {
    return res.status(400).json({
      error: "Password minimal 8 karakter",
    });
  }

  // Check duplicate
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({
      error: "Username sudah digunakan",
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    role: "user",
  };
  users.push(user);

  res.json({
    success: true,
    message: "Registrasi berhasil",
  });
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({
      error: "Username atau password salah",
    });
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({
      error: "Username atau password salah",
    });
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

// Middleware untuk verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" "); // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Access token diperlukan",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: "Token tidak valid atau expired",
      });
    }
    req.user = user;
    next();
  });
}

// Protected endpoint
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    user: req.user,
  });
});

// Role-based authorization
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        error: "Akses ditolak. Role tidak sesuai.",
      });
    }
    next();
  };
}

// Admin-only endpoint
app.delete(
  "/api/users/:id",
  authenticateToken,
  requireRole("admin"),
  (req, res) => {
    // Delete user logic
    res.json({ success: true });
  }
);
```

**Frontend dengan Datastar:**

```html
<div
  data-signals='{
    "token": "",
    "user": null,
    "isAuthenticated": false
}'
  data-persist="token:local"
>
  <!-- Login Form -->
  <form data-on-submit.prevent="@post('/api/login')">
    <input type="text" data-bind-value="$username" />
    <input type="password" data-bind-value="$password" />
    <button type="submit">Login</button>
  </form>

  <!-- Protected Content -->
  <div data-show="$isAuthenticated">
    <button
      data-on-click="@get('/api/profile', {}, {
            headers: { 'Authorization': 'Bearer ' + $token }
        })"
    >
      Load Profile
    </button>
  </div>
</div>
```

## Environment Variables & Secrets Management

**Jangan hardcode secrets di code!**

**Install `dotenv`:**

```bash
npm install dotenv
```

**`.env` file:**

```
NODE_ENV=production
PORT=3000
JWT_SECRET=super-secret-key-change-me
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
CSRF_SECRET=another-secret-key
```

**Load di aplikasi:**

```js
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
```

**`.gitignore`:**

```
node_modules/
.env
uploads/
*.log
```

## Security Headers

Tambahkan security headers untuk protect aplikasi:

```js
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  next();
});
```

Atau gunakan `helmet` middleware:

```bash
npm install helmet
```

```js
import helmet from "helmet";
app.use(helmet());
```

## Input Validation dengan Joi

Validasi robust untuk semua user input:

```bash
npm install joi
```

```js
import Joi from "joi";

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{8,30}$/)
    .required(),
  age: Joi.number().integer().min(18).max(120).optional(),
});

app.post("/api/register", (req, res) => {
  const { error, value } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details.message,
    });
  }

  // value adalah data yang sudah tervalidasi
  // Lanjutkan register logic
});
```

## Production Checklist

### Deployment

- ✅ Set `NODE_ENV=production`
- ✅ Use process manager (PM2, systemd)
- ✅ Enable HTTPS dengan Let's Encrypt
- ✅ Configure reverse proxy (Nginx, Caddy)
- ✅ Setup monitoring (New Relic, Datadog)
- ✅ Configure logging (Winston, Pino)
- ✅ Database migrations dan backups
- ✅ CDN untuk static assets

### Security

- ✅ CSRF protection enabled
- ✅ Rate limiting configured
- ✅ Input validation di semua endpoints
- ✅ XSS escaping di semua output
- ✅ Security headers configured
- ✅ JWT expiration set
- ✅ Secrets di environment variables
- ✅ HTTPS enforced
- ✅ Regular security audits

## Tabel Security Layers

| Layer                | Tool/Technique     | Priority | Complexity |
| :------------------- | :----------------- | :------- | :--------- |
| **CSRF Protection**  | csurf middleware   | Tinggi   | Rendah     |
| **XSS Prevention**   | HTML escaping, CSP | Tinggi   | Rendah     |
| **Rate Limiting**    | express-rate-limit | Tinggi   | Rendah     |
| **Authentication**   | JWT + bcrypt       | Tinggi   | Menengah   |
| **Input Validation** | Joi                | Tinggi   | Rendah     |
| **Security Headers** | helmet             | Tinggi   | Rendah     |
| **HTTPS**            | Let's Encrypt      | Tinggi   | Rendah     |

Dengan mengimplementasikan security layers ini, aplikasi Datastar Anda siap untuk production dengan proteksi berlapis terhadap serangan umum!

Di **Sesi 10** (final), kita akan membangun **aplikasi e-commerce lengkap** yang menggabungkan semua konsep dari 9 sesi sebelumnya!
