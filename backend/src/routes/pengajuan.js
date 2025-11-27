const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Pengajuan = require("../models/Pengajuan");
const auth = require("../middlewares/auth");

const allowedStatusMahasiswa = ["menunggu", "dibimbing", "selesai"];


// ===============================
// 1. GET ALL PENGAJUAN (untuk dosen/admin)
// ===============================
router.get("/", auth(["admin", "dosen"]), async (req, res) => {
  try {
    const list = await Pengajuan.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 2. GET PENGAJUAN BY ID (detail mahasiswa & dosen)
// ===============================
router.get("/:id", auth(["admin", "dosen", "mahasiswa"]), async (req, res) => {
  try {
    const data = await Pengajuan.findOne({
      where: { id: req.params.id },
    });

    if (!data) {
      return res.status(404).json({ msg: "Pengajuan tidak ditemukan." });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 3. CREATE PENGAJUAN (mahasiswa)
// ===============================
router.post("/", auth("mahasiswa"), async (req, res) => {
  try {
    const {
      mahasiswaId,
      nama_mahasiswa,
      email,
      posisi,
      perusahaan,
      link_dokumen,
    } = req.body;

    if (
      !mahasiswaId ||
      !nama_mahasiswa ||
      !email ||
      !posisi ||
      !perusahaan ||
      !link_dokumen
    ) {
      return res.status(400).json({ msg: "Semua field wajib diisi." });
    }

    const newData = await Pengajuan.create({
      id: "pengajuan_" + uuidv4(),
      mahasiswaId,
      nama_mahasiswa,
      email,
      posisi,
      perusahaan,
      link_dokumen,
      status: "pending",
    });

    res.json(newData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 4. APPROVE PENGAJUAN (dosen)
// ===============================
router.patch("/:id/approve", auth(["admin", "dosen"]), async (req, res) => {
  try {
    const exists = await Pengajuan.findOne({
      where: { id: req.params.id },
    });

    if (!exists) {
      return res.status(404).json({ msg: "Pengajuan tidak ditemukan." });
    }

    await Pengajuan.update(
      { status: "disetujui" },
      { where: { id: req.params.id } }
    );

    res.json({ msg: "Pengajuan disetujui." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 5. REJECT PENGAJUAN (dosen)
// ===============================
router.patch("/:id/reject", auth(["admin", "dosen"]), async (req, res) => {
  try {
    const exists = await Pengajuan.findOne({
      where: { id: req.params.id },
    });

    if (!exists) {
      return res.status(404).json({ msg: "Pengajuan tidak ditemukan." });
    }

    await Pengajuan.update(
      { status: "ditolak" },
      { where: { id: req.params.id } }
    );

    res.json({ msg: "Pengajuan ditolak." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// ===============================
// 6. VERIFY & ASSIGN DOSEN (admin)
// ===============================
router.patch("/:id/verify", auth("admin"), async (req, res) => {
  try {
    const { dosenPembimbingId, statusMahasiswa } = req.body;

    if (!dosenPembimbingId || !statusMahasiswa) {
      return res.status(400).json({
        msg: "dosenPembimbingId dan statusMahasiswa wajib diisi.",
      });
    }

    if (!allowedStatusMahasiswa.includes(statusMahasiswa)) {
      return res.status(400).json({ msg: "Status mahasiswa tidak valid." });
    }

    const exists = await Pengajuan.findOne({ where: { id: req.params.id } });

    if (!exists) {
      return res.status(404).json({ msg: "Pengajuan tidak ditemukan." });
    }

    await Pengajuan.update(
      {
        status: "disetujui",
        dosenPembimbingId,
        statusMahasiswa,
      },
      { where: { id: req.params.id } }
    );

    res.json({ msg: "Pengajuan diverifikasi dan dosen pembimbing ditetapkan." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
