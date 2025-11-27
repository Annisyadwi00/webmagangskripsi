const express = require("express");
const { fn, col } = require("sequelize");
const Pengajuan = require("../models/Pengajuan");
const Logbook = require("../models/Logbook");
const Nilai = require("../models/Nilai");

const router = express.Router();

// Endpoint ringkasan dashboard dengan filter per peran
router.get("/", async (req, res) => {
  try {
    const role = req.query.role || "mahasiswa";
    const mahasiswaId = req.query.mahasiswaId;

    const filterByMahasiswa = role === "mahasiswa" && mahasiswaId;

    const pengajuanWhere = filterByMahasiswa ? { mahasiswaId } : {};
    const logbookWhere = filterByMahasiswa ? { mahasiswaId } : {};
    const nilaiWhere = filterByMahasiswa ? { mahasiswaId } : {};

    // Hitung jumlah pengajuan per status
    const pengajuanCounts = await Pengajuan.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("status")), "count"],
      ],
      where: pengajuanWhere,
      group: ["status"],
    });

    const pengajuanSummary = {
      pending: 0,
      disetujui: 0,
      ditolak: 0,
    };

    pengajuanCounts.forEach((item) => {
      const status = item.get("status");
      const count = Number(item.get("count")) || 0;
      if (pengajuanSummary[status] !== undefined) {
        pengajuanSummary[status] = count;
      }
    });

    // Progress logbook
    const totalLogbook = await Logbook.count({ where: logbookWhere });
    const mahasiswaDenganLogbook = await Logbook.count({
      where: logbookWhere,
      distinct: true,
      col: "mahasiswaId",
    });
    const rataRataLogbook = mahasiswaDenganLogbook
      ? Number((totalLogbook / mahasiswaDenganLogbook).toFixed(2))
      : 0;

    // Nilai dan kelengkapan laporan (diasumsikan nilai terisi setelah laporan dikumpulkan)
    const nilaiList = await Nilai.findAll({ where: nilaiWhere });
    const totalNilai = nilaiList.length;
    const totalNilaiScore = nilaiList.reduce((sum, n) => sum + n.nilai, 0);
    const rataRataNilai = totalNilai
      ? Number((totalNilaiScore / totalNilai).toFixed(2))
      : null;

    const approvedPengajuan = await Pengajuan.count({
      where: { ...pengajuanWhere, status: "disetujui" },
    });
    const laporanCompletion = approvedPengajuan
      ? Math.round((totalNilai / approvedPengajuan) * 100)
      : 0;

    res.json({
      role,
      filter: filterByMahasiswa ? { mahasiswaId } : "semua",
      pengajuan: pengajuanSummary,
      logbook: {
        total: totalLogbook,
        mahasiswaAktif: mahasiswaDenganLogbook,
        rataRataPerMahasiswa: rataRataLogbook,
        progresMahasiswa: filterByMahasiswa ? totalLogbook : undefined,
      },
      laporan: {
        selesai: totalNilai,
        target: approvedPengajuan,
        persentase: laporanCompletion,
      },
      nilai: {
        rataRata: rataRataNilai,
        total: totalNilai,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;