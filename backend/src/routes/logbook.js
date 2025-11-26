const express = require("express");
const router = express.Router();
const Logbook = require("../models/Logbook");

// ===============================
// 1. GET LOGBOOK (filter by mahasiswaId)
// ===============================
router.get("/", async (req, res) => {
  try {
    const { mahasiswaId } = req.query;

    const data = await Logbook.findAll({
      where: { mahasiswaId },
      order: [["createdAt", "DESC"]],
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 2. CREATE LOGBOOK
// ===============================
router.post("/", async (req, res) => {
  try {
    const { id, mahasiswaId, nama_mahasiswa, judul, link } = req.body;

    if (!id || !mahasiswaId || !nama_mahasiswa || !judul || !link) {
      return res.status(400).json({ msg: "Semua field wajib diisi." });
    }

    const newData = await Logbook.create({
      id,
      mahasiswaId,
      nama_mahasiswa,
      judul,
      link,
    });

    res.json(newData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 3. DELETE LOGBOOK
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const exists = await Logbook.findOne({ where: { id: req.params.id } });

    if (!exists) {
      return res.status(404).json({ msg: "Logbook tidak ditemukan." });
    }

    await Logbook.destroy({ where: { id: req.params.id } });

    res.json({ msg: "Logbook berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
