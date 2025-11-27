const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Nilai = require("../models/Nilai");
const Pengajuan = require("../models/Pengajuan");
const auth = require("../middlewares/auth");


// khusus dosen
router.use(auth("dosen"));

// ================================
// GET NILAI SEMUA (opsional)
// ================================
router.get("/", auth(["admin", "dosen"]), async (req, res) => {
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
router.get("/:pengajuanId", auth(["admin", "dosen", "mahasiswa"]), async (req, res) => {
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
router.post("/:pengajuanId", auth(["admin", "dosen"]), async (req, res) => {
  try {
    const { nilai, catatan, linkNilai } = req.body;

     if (nilai === undefined || nilai === null || !linkNilai) {
      return res.status(400).json({ msg: "Nilai dan link wajib diisi." });
    }

const nilaiAngka = Number(nilai);

    if (!Number.isFinite(nilaiAngka) || nilaiAngka < 0 || nilaiAngka > 100) {
      return res
        .status(400)
        .json({ msg: "Nilai harus berupa angka 0 hingga 100." });
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
      nilai: nilaiAngka,
      catatan,
      linkNilai,
      mahasiswaId: p.mahasiswaId,
      nama_mahasiswa: p.nama_mahasiswa,
    });

     await Pengajuan.update(
      { status: "dinilai" },
      { where: { id: req.params.pengajuanId } }
    );


    res.json(newData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
