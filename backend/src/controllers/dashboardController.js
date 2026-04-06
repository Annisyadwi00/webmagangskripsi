const { User, Job, Pengajuan, Logbook } = require('../models');
const { Op } = require('sequelize');

exports.getAdminStats = async (req, res) => {
  try {
    // 1. Hitung Total Mahasiswa (Role Mahasiswa)
    const totalMahasiswa = await User.count({ where: { role: 'mahasiswa' } });

    // 2. Hitung Lowongan yang Masih Aktif & Belum Deadline
    const totalLowongan = await Job.count({ 
      where: { 
        status: 'active',
        deadline: { [Op.gte]: new Date() }
      } 
    });

    // 3. Hitung Mahasiswa yang sudah melapor diterima
    const totalDiterima = await Pengajuan.count({ where: { status: 'accepted' } });

    // 4. Hitung Pengajuan yang butuh Verifikasi (Status Pending)
    const butuhVerifikasi = await Pengajuan.count({ where: { status: 'pending' } });

    res.status(200).json({
      success: true,
      data: {
        mahasiswa: totalMahasiswa,
        lowongan: totalLowongan,
        magangAktif: totalDiterima,
        pendingVerifikasi: butuhVerifikasi
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMahasiswaStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Hitung berapa logbook yang sudah diisi oleh mahasiswa ini
    const totalLogbook = await Logbook.count({ where: { mahasiswaId: userId } });

    // Ambil status pengajuan terakhir
    const statusTerakhir = await Pengajuan.findOne({ 
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: ['status', 'jobId'],
      include: [{ model: Job, as: 'lowongan', attributes: ['company', 'title'] }]
    });

    res.status(200).json({
      success: true,
      data: {
        jumlahLogbook: totalLogbook,
        statusMagang: statusTerakhir || "Belum melapor"
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};