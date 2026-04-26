<<<<<<< HEAD
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "orgaura-admin-2026";

const ROOT = __dirname;
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DATA_DIR = path.join(ROOT, "data");
const BLOG_FILE = path.join(DATA_DIR, "blogs.json");
const GALLERY_FILE = path.join(DATA_DIR, "gallery.json");

// Ensure data and uploads folders exist so the app runs on first boot.
function ensureStorage() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BLOG_FILE)) fs.writeFileSync(BLOG_FILE, "[]", "utf8");
  if (!fs.existsSync(GALLERY_FILE)) fs.writeFileSync(GALLERY_FILE, "[]", "utf8");
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function toSlug(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Basic admin protection via password header/body/query.
function requireAdmin(req, res, next) {
  const password =
    req.headers["x-admin-password"] || req.body.adminPassword || req.query.adminPassword;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Unauthorized admin action." });
  }
  return next();
}

ensureStorage();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(ROOT));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safeName = toSlug(path.parse(file.originalname).name) || "file";
    cb(null, `${Date.now()}-${safeName}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Public gallery endpoint for users (read-only).
app.get("/api/gallery", (_req, res) => {
  const items = readJson(GALLERY_FILE).sort((a, b) => b.createdAt - a.createdAt);
  res.json(items);
});

// Public blog endpoint for users (read-only).
app.get("/api/blogs", (_req, res) => {
  const posts = readJson(BLOG_FILE).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(posts);
});

// Admin-only endpoint for uploading gallery images.
app.post("/api/admin/gallery", requireAdmin, upload.array("images", 20), (req, res) => {
  const current = readJson(GALLERY_FILE);
  const newItems = (req.files || []).map((file) => ({
    id: `${Date.now()}-${file.filename}`,
    imageUrl: `/uploads/${file.filename}`,
    createdAt: Date.now(),
  }));
  writeJson(GALLERY_FILE, [...newItems, ...current]);
  res.json({ message: "Gallery images uploaded.", items: newItems });
});

// Admin-only endpoint for publishing blog posts.
app.post("/api/admin/blogs", requireAdmin, upload.single("image"), (req, res) => {
  const { title, content, date } = req.body;
  if (!title || !content || !date) {
    return res.status(400).json({ message: "Title, content, and date are required." });
  }

  const post = {
    id: `${Date.now()}-${toSlug(title)}`,
    title,
    content,
    date,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: Date.now(),
  };

  const current = readJson(BLOG_FILE);
  writeJson(BLOG_FILE, [post, ...current]);
  return res.json({ message: "Blog published.", post });
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(ROOT, "admin.html"));
});

app.listen(PORT, () => {
  console.log(`Org & Aura server running at http://localhost:${PORT}`);
});
=======
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "orgaura-admin-2026";

const ROOT = __dirname;
const UPLOAD_DIR = path.join(ROOT, "uploads");
const DATA_DIR = path.join(ROOT, "data");
const BLOG_FILE = path.join(DATA_DIR, "blogs.json");
const GALLERY_FILE = path.join(DATA_DIR, "gallery.json");

// Ensure data and uploads folders exist so the app runs on first boot.
function ensureStorage() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BLOG_FILE)) fs.writeFileSync(BLOG_FILE, "[]", "utf8");
  if (!fs.existsSync(GALLERY_FILE)) fs.writeFileSync(GALLERY_FILE, "[]", "utf8");
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function toSlug(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Basic admin protection via password header/body/query.
function requireAdmin(req, res, next) {
  const password =
    req.headers["x-admin-password"] || req.body.adminPassword || req.query.adminPassword;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Unauthorized admin action." });
  }
  return next();
}

ensureStorage();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(ROOT));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safeName = toSlug(path.parse(file.originalname).name) || "file";
    cb(null, `${Date.now()}-${safeName}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Public gallery endpoint for users (read-only).
app.get("/api/gallery", (_req, res) => {
  const items = readJson(GALLERY_FILE).sort((a, b) => b.createdAt - a.createdAt);
  res.json(items);
});

// Public blog endpoint for users (read-only).
app.get("/api/blogs", (_req, res) => {
  const posts = readJson(BLOG_FILE).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(posts);
});

// Admin-only endpoint for uploading gallery images.
app.post("/api/admin/gallery", requireAdmin, upload.array("images", 20), (req, res) => {
  const current = readJson(GALLERY_FILE);
  const newItems = (req.files || []).map((file) => ({
    id: `${Date.now()}-${file.filename}`,
    imageUrl: `/uploads/${file.filename}`,
    createdAt: Date.now(),
  }));
  writeJson(GALLERY_FILE, [...newItems, ...current]);
  res.json({ message: "Gallery images uploaded.", items: newItems });
});

// Admin-only endpoint for publishing blog posts.
app.post("/api/admin/blogs", requireAdmin, upload.single("image"), (req, res) => {
  const { title, content, date } = req.body;
  if (!title || !content || !date) {
    return res.status(400).json({ message: "Title, content, and date are required." });
  }

  const post = {
    id: `${Date.now()}-${toSlug(title)}`,
    title,
    content,
    date,
    imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: Date.now(),
  };

  const current = readJson(BLOG_FILE);
  writeJson(BLOG_FILE, [post, ...current]);
  return res.json({ message: "Blog published.", post });
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(ROOT, "admin.html"));
});

app.listen(PORT, () => {
  console.log(`Org & Aura server running at http://localhost:${PORT}`);
});
>>>>>>> a6c3cad80a9fa5d0e21cfcfea8cdae39b6b02287
