const { Logbook, Pengajuan, Job } = require('../models');
const { Op } = require('sequelize');

/**
 * CREATE LOGBOOK (Mahasiswa)
 * Mengisi catatan harian magang.
 */
exports.createLogbook = async (req, res) => {
  try {
    const { kegiatan, tanggal, progres } = req.body;
    const userId = req.user.id;

    // 1. Validasi: Cek apakah mahasiswa ini sudah DI-ACC magangnya oleh Admin
    const pengajuanAktif = await Pengajuan.findOne({ 
      where: { 
        userId: userId, 
        status: 'accepted' // Hanya yang sudah di-verify admin yang bisa isi logbook
      } 
    });

    if (!pengajuanAktif) {
      return res.status(403).json({ 
        success: false, 
        msg: "Akses ditolak. Kamu belum memiliki laporan magang yang disetujui oleh Admin." 
      });
    }

    // 2. Validasi: Cek apakah sudah mengisi logbook di tanggal yang sama (mencegah double input)
    const existingLog = await Logbook.findOne({
      where: {
        pengajuanId: pengajuanAktif.id,
        tanggal: tanggal
      }
    });

    if (existingLog) {
      return res.status(400).json({ 
        success: false, 
        msg: "Kamu sudah mengisi logbook untuk tanggal ini." 
      });
    }

    // 3. EKSEKUSI: Simpan Logbook
    const logbaru = await Logbook.create({
      id: "log-" + Date.now(),
      pengajuanId: pengajuanAktif.id,
      mahasiswaId: userId, // Opsional jika di model ada
      tanggal,
      kegiatan,
      progres,
      status_verifikasi: 'pending' // Default menunggu paraf dosen/admin
    });

    res.status(201).json({
      success: true,
      msg: "Logbook berhasil disimpan!",
      data: logbaru
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * VERIFIKASI LOGBOOK (Dosen/Admin)
 * Memberikan paraf atau status verifikasi pada logbook mahasiswa.
 */
exports.verifyLogbook = async (req, res) => {
  try {
    const { id } = req.params; // ID Logbook
    const { status, catatan } = req.body; // status: 'verified' atau 'revisi'

    const log = await Logbook.findByPk(id);
    if (!log) return res.status(404).json({ msg: "Logbook tidak ditemukan." });

    log.status_verifikasi = status;
    log.catatan_dosen = catatan; // Pastikan kolom ini ada di model
    await log.save();

    res.json({ success: true, msg: `Logbook telah di-${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET ALL LOGBOOK (Mahasiswa melihat miliknya sendiri)
 */
exports.getLogsByMahasiswa = async (req, res) => {
  try {
    const userId = req.user.id;
    const logs = await Logbook.findAll({
      where: { mahasiswaId: userId },
      order: [['tanggal', 'DESC']]
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};