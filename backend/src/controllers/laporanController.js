const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const auth = require("../middlewares/auth");
const LaporanAkhir = require("../models/LaporanAkhir");

// GET all laporan (mahasiswa terbatas ke miliknya)
router.get("/", auth(["admin", "dosen", "mahasiswa"]), async (req, res) => {
  try {
    const { mahasiswaId } = req.query;
    const where = {};

    if (req.user.role === "mahasiswa") {
      where.mahasiswaId = req.user.id;
    } else if (mahasiswaId) {
      where.mahasiswaId = mahasiswaId;
    }

    const data = await LaporanAkhir.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET detail laporan
router.get(
  "/:id",
  auth(["admin", "dosen", "mahasiswa"]),
  async (req, res) => {
    try {
      const laporan = await LaporanAkhir.findOne({ where: { id: req.params.id } });
      if (!laporan) {
        return res.status(404).json({ msg: "Laporan tidak ditemukan." });
      }

      if (req.user.role === "mahasiswa" && laporan.mahasiswaId !== req.user.id) {
        return res.status(403).json({ msg: "Tidak punya akses." });
      }

      res.json(laporan);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// CREATE laporan akhir (mahasiswa)
router.post("/", auth(["mahasiswa"]), async (req, res) => {
  try {
    const { linkLaporan, tanggalUnggah } = req.body;

    if (!linkLaporan) {
      return res.status(400).json({ msg: "Link atau berkas laporan wajib diisi." });
    }

    const laporan = await LaporanAkhir.create({
      id: "laporan_" + uuidv4(),
      mahasiswaId: req.user.id,
      linkLaporan,
      tanggalUnggah: tanggalUnggah || new Date(),
      statusVerifikasi: "pending",
    });

    res.status(201).json(laporan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE laporan akhir
router.put(
  "/:id",
  auth(["admin", "dosen", "mahasiswa"]),
  async (req, res) => {
    try {
      const laporan = await LaporanAkhir.findOne({ where: { id: req.params.id } });
      if (!laporan) {
        return res.status(404).json({ msg: "Laporan tidak ditemukan." });
      }

      if (req.user.role === "mahasiswa" && laporan.mahasiswaId !== req.user.id) {
        return res.status(403).json({ msg: "Tidak punya akses." });
      }

      const payload = {};
      const { linkLaporan, tanggalUnggah, statusVerifikasi } = req.body;

      if (linkLaporan) payload.linkLaporan = linkLaporan;
      if (tanggalUnggah) payload.tanggalUnggah = tanggalUnggah;

      if (statusVerifikasi && ["admin", "dosen"].includes(req.user.role)) {
        payload.statusVerifikasi = statusVerifikasi;
      }

      await laporan.update(payload);
      res.json(laporan);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE laporan akhir
router.delete(
  "/:id",
  auth(["admin", "dosen", "mahasiswa"]),
  async (req, res) => {
    try {
      const laporan = await LaporanAkhir.findOne({ where: { id: req.params.id } });
      if (!laporan) {
        return res.status(404).json({ msg: "Laporan tidak ditemukan." });
      }

      if (req.user.role === "mahasiswa" && laporan.mahasiswaId !== req.user.id) {
        return res.status(403).json({ msg: "Tidak punya akses." });
      }

      await LaporanAkhir.destroy({ where: { id: req.params.id } });
      res.json({ msg: "Laporan berhasil dihapus." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;