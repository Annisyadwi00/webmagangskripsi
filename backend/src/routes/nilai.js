const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Nilai = require("../models/Nilai");
const Pengajuan = require("../models/Pengajuan");


// ================================
// GET NILAI SEMUA (opsional)
// ================================
router.get("/", async (req, res) => {
  try {
    const data = await Nilai.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ================================
// GET NILAI BERDASARKAN PENGAJUAN ID
// ================================
router.get("/:pengajuanId", async (req, res) => {
  try {
    const data = await Nilai.findOne({
      where: { pengajuanId: req.params.pengajuanId },
    });

    if (!data) {
      return res.status(404).json({ msg: "Nilai belum diberikan." });
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ================================
// SIMPAN NILAI (DOSEN)
// ================================
router.post("/:pengajuanId", async (req, res) => {
  try {
    const { nilai, catatan, linkNilai } = req.body;

    if (!nilai || !linkNilai) {
      return res.status(400).json({ msg: "Nilai dan link wajib diisi." });
    }

    // ambil pengajuan untuk info mahasiswa
    const p = await Pengajuan.findOne({
      where: { id: req.params.pengajuanId },
    });

    if (!p) {
      return res.status(404).json({ msg: "Pengajuan tidak ditemukan." });
    }

    const newData = await Nilai.create({
      id: "nilai_" + uuidv4(),
      pengajuanId: req.params.pengajuanId,
      nilai,
      catatan,
      linkNilai,
      mahasiswaId: p.mahasiswaId,
      nama_mahasiswa: p.nama_mahasiswa,
    });

    res.json(newData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
