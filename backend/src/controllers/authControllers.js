const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const VERIFICATION_EXPIRES_IN_MINUTES = 15;

// Helper: sign token
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Nama, email, dan password wajib diisi." });
    }

    // Validasi Domain Email UNSIKA
    const isStudent = email.endsWith("@student.unsika.ac.id");
    const isStaff = email.endsWith("@staff.unsika.ac.id");

    if (!isStudent && !isStaff) {
      return res.status(400).json({ msg: "Gunakan email resmi UNSIKA." });
    }

    // Auto-role logic
    if (!role) role = isStudent ? "mahasiswa" : "dosen";

    // Validasi kombinasi email & role
    if ((isStudent && role !== "mahasiswa") || (isStaff && role === "mahasiswa")) {
      return res.status(400).json({ msg: "Kombinasi email dan role tidak valid." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ msg: "Email sudah terdaftar." });

    const hashed = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + VERIFICATION_EXPIRES_IN_MINUTES * 60 * 1000);

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

    await sendVerificationEmail({ to: email, name, code: verificationCode, expiresAt: verificationExpires });

    res.status(201).json({
      msg: "Registrasi berhasil. Cek email untuk kode verifikasi.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    // Keamanan: Pesan error dibuat sama agar tidak mudah ditebak
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ msg: "Email atau password salah." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ msg: "Email belum diverifikasi." });
    }

    res.json({ token: signToken(user), user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    // req.user didapat dari middleware auth.js yang sudah kita pasang di routes
    const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'name', 'email', 'role']
    });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyCode = async (req, res) => {
    // ... pindahkan logika verify-code ke sini ...
};

exports.resendCode = async (req, res) => {
    // ... pindahkan logika resend-code ke sini ...
};