const express = require("express");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const User = require("../models/user");
const auth = require("../middlewares/auth");

const router = express.Router();

// Semua rute profil harus login
router.use(auth());

// Ambil data profil user yang sedang login
router.get("/", async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan." });
    }

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

// Perbarui profil user yang sedang login
router.put("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan." });
    }

    if (!name && !email && !password) {
      return res.status(400).json({ msg: "Tidak ada data yang diperbarui." });
    }

    if (email) {
      const isStudent = email.endsWith("@student.unsika.ac.id");
      const isStaff = email.endsWith("@staff.unsika.ac.id");

      if (user.role === "mahasiswa" && !isStudent) {
        return res
          .status(400)
          .json({ msg: "Email mahasiswa harus menggunakan domain @student.unsika.ac.id." });
      }

      if (user.role !== "mahasiswa" && !isStaff) {
        return res
          .status(400)
          .json({ msg: "Email dosen/admin harus menggunakan domain @staff.unsika.ac.id." });
      }

      const existing = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
      if (existing) {
        return res.status(400).json({ msg: "Email sudah digunakan pengguna lain." });
      }

      user.email = email;
    }

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

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

module.exports = router;