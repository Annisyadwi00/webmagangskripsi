const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// ... (semua require kamu yang lain)

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// 1. TARUH KODE REVISI MIDDLEWARE DI SINI (Sebelum Route)
const authorize = function (roles = []) {
  if (!Array.isArray(roles)) roles = [roles];
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "Tidak ada token." });
      }
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ msg: "Tidak punya akses." });
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ msg: "Token tidak valid." });
    }
  };
};

// 2. BARU MASUK KE ROUTE KAMU
router.post("/register", async (req, res) => { ... });
router.post("/login", async (req, res) => { ... });

// 3. CARA PAKAINYA PADA ROUTE TERTENTU
// Contoh: Route 'me' sekarang jadi lebih pendek karena pakai middleware di atas
router.get("/me", authorize(), async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});