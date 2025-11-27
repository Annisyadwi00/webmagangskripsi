const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Helper: buat token
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// =======================================
// REGISTER
// POST /api/v1/auth/register
// =======================================
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Nama, email, dan password wajib diisi." });
    }

    // Cek domain
    const isStudent = email.endsWith("@student.unsika.ac.id");
    const isStaff = email.endsWith("@staff.unsika.ac.id");

    if (!isStudent && !isStaff) {
      return res.status(400).json({
        msg: "Gunakan email UNSIKA: @student.unsika.ac.id (mahasiswa) atau @staff.unsika.ac.id (dosen/admin).",
      });
    }

    // Atur role otomatis kalau tidak dikirim
    if (!role) {
      if (isStudent) role = "mahasiswa";
      else role = "dosen"; // default staff = dosen
    }

    // Validasi kombinasi email + role
    if (isStudent && role !== "mahasiswa") {
      return res
        .status(400)
        .json({ msg: "Email @student.unsika.ac.id hanya boleh role mahasiswa." });
    }

    if (isStaff && role === "mahasiswa") {
      return res
        .status(400)
        .json({ msg: "Email @staff.unsika.ac.id tidak boleh role mahasiswa." });
    }

    // Cek email sudah terdaftar
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ msg: "Email sudah terdaftar." });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: "user_" + uuidv4(),
      name,
      email,
      password: hashed,
      role,
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================
// LOGIN
// POST /api/v1/auth/login
// =======================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email dan password wajib diisi." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ msg: "Email atau password salah." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Email atau password salah." });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================
// ME (optional) – cek user dari token
// GET /api/v1/auth/me
// =======================================
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Tidak ada token." });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan." });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Token tidak valid." });
  }
});

module.exports = router;
