const express = require("express");
const router = express.Router();
const Logbook = require("../models/logbook");
const auth = require("../middlewares/auth");
// ===============================
// 1// 1. GET LOGBOOK (filter by mahasiswaId atau dosenPembimbingId)
// ===============================
router.get("/", auth(["admin", "dosen", "mahasiswa"]), async (req, res) => {
  try {
    const { mahasiswaId, dosenPembimbingId } = req.query;
    const where = {};

    if (mahasiswaId) where.mahasiswaId = mahasiswaId;
    if (dosenPembimbingId) where.dosenPembimbingId = dosenPembimbingId;

    const data = await Logbook.findAll({
      where,
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
router.post("/", auth("mahasiswa"), async (req, res) => {
  try {
    const { id, mahasiswaId, nama_mahasiswa, judul, link, dosenPembimbingId } = req.body;

    if (!id || !mahasiswaId || !nama_mahasiswa || !judul || !link) {
      return res.status(400).json({ msg: "Semua field wajib diisi." });
    }

    const newData = await Logbook.create({
      id,
      mahasiswaId,
      nama_mahasiswa,
      judul,
      link,
      dosenPembimbingId,
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
router.delete("/:id", auth(["admin", "mahasiswa"]), async (req, res) => {
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
//===============================
// 4. UPDATE FEEDBACK LOGBOOK (Dosen only)
// ===============================
router.patch("/:id/feedback", auth("dosen"), async (req, res) => {
  try {
    const { feedback } = req.body;
    const logbook = await Logbook.findOne({ where: { id: req.params.id } });

    if (!logbook) {
      return res.status(404).json({ msg: "Logbook tidak ditemukan." });
    }

    if (logbook.dosenPembimbingId && logbook.dosenPembimbingId !== req.user.id) {
      return res.status(403).json({ msg: "Tidak memiliki akses ke logbook ini." });
    }

    logbook.dosenPembimbingId = logbook.dosenPembimbingId || req.user.id;
    logbook.feedback = feedback;
    await logbook.save();

    res.json({ msg: "Feedback berhasil disimpan.", data: logbook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
