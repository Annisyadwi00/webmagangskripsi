const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const VERIFICATION_EXPIRES_IN_MINUTES = 15;

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
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(
      Date.now() + VERIFICATION_EXPIRES_IN_MINUTES * 60 * 1000
    );
    const user = await User.create({
      id: "user_" + uuidv4(),
      name,
      email,
      password: hashed,
      role,
      isVerified: false,
      verificationCode: await bcrypt.hash(verificationCode, 10),
      verificationExpires,
    });

    try {
      await sendVerificationEmail({
        to: email,
        name,
        code: verificationCode,
        expiresAt: verificationExpires,
      });
    } catch (emailErr) {
      console.error("Gagal mengirim email verifikasi:", emailErr.message);
      return res.status(500).json({
        msg: "Registrasi gagal mengirim email verifikasi. Silakan coba lagi atau hubungi admin.",
      });
    }

    const responsePayload = {
      msg: "Registrasi berhasil. Kami telah mengirimkan kode verifikasi ke email Anda.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      verificationExpiresAt: verificationExpires,
    };

    if (process.env.NODE_ENV !== "production") {
      responsePayload.debugCode = verificationCode;
    }

    res.status(201).json(responsePayload);
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
    if (user.isVerified === false) {
      return res.status(403).json({
        msg: "Email belum diverifikasi. Silakan cek email Anda untuk kode verifikasi.",
      });
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
// =======================================
// VERIFY EMAIL
// POST /api/v1/auth/verify-code
// =======================================
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ msg: "Email dan kode verifikasi wajib diisi." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan." });
    }

    if (user.isVerified) {
      return res.json({ msg: "Email sudah terverifikasi." });
    }

    if (!user.verificationCode || !user.verificationExpires) {
      return res
        .status(400)
        .json({ msg: "Tidak ada kode verifikasi. Silakan minta kode baru." });
    }

    const now = new Date();
    if (now > user.verificationExpires) {
      return res
        .status(400)
        .json({ msg: "Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru." });
    }

    const isValidCode = await bcrypt.compare(code, user.verificationCode);
    if (!isValidCode) {
      return res.status(400).json({ msg: "Kode verifikasi salah." });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    res.json({ msg: "Email berhasil diverifikasi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================
// RESEND VERIFICATION CODE
// POST /api/v1/auth/resend-code
// =======================================
router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email wajib diisi." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan." });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "Email sudah diverifikasi." });
    }

    const newCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRES_IN_MINUTES * 60 * 1000);

    user.verificationCode = await bcrypt.hash(newCode, 10);
    user.verificationExpires = expiresAt;
    await user.save();

    try {
      await sendVerificationEmail({
        to: email,
        name: user.name,
        code: newCode,
        expiresAt,
      });
    } catch (emailErr) {
      console.error("Gagal mengirim ulang email verifikasi:", emailErr.message);
      return res.status(500).json({
        msg: "Gagal mengirim ulang kode verifikasi. Silakan coba lagi atau hubungi admin.",
      });
    }
    
    const responsePayload = {
      msg: "Kode verifikasi baru telah dikirim ke email Anda.",
      verificationExpiresAt: expiresAt,
    };

    if (process.env.NODE_ENV !== "production") {
      responsePayload.debugCode = newCode;
    }

    res.json(responsePayload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
