const { Pengajuan, Job, User } = require('../models');

exports.submitPengajuan = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    // 1. Analisis Kekurangan: Cek apakah file sudah diupload
    if (!req.file) {
      return res.status(400).json({ msg: "Mohon upload CV dalam format PDF." });
    }

    // 2. Ambil path file yang disimpan multer
    const cvUrl = req.file.filename; 

    // 3. Simpan ke database (Pastikan model Pengajuan punya kolom cvUrl)
    const baru = await Pengajuan.create({
      id: "reg_" + Date.now(),
      userId,
      jobId,
      cvUrl: cvUrl, // Simpan nama filenya saja
      status: 'pending'
    });

    res.status(201).json({ msg: "Pendaftaran berhasil dengan CV terupload!", data: baru });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  try {
    const { jobId } = req.body;
    const userId = req.user.id; // Diambil dari middleware auth

    // 1. Validasi Input
    if (!jobId) {
      return res.status(400).json({ msg: "ID Lowongan (jobId) wajib disertakan." });
    }

    // 2. Cek apakah Job/Lowongan itu ada dan masih buka
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Lowongan tidak ditemukan." });
    }

    // 3. KRITIS: Cek apakah mahasiswa sudah pernah melamar di posisi ini
    const alreadyApplied = await Pengajuan.findOne({ 
      where: { userId, jobId } 
    });
    
    if (alreadyApplied) {
      return res.status(400).json({ 
        msg: "Kamu sudah mengirimkan pengajuan untuk posisi ini. Tunggu konfirmasi admin." 
      });
    }

    //4. Hitung berapa yang sudah diterima di job ini
    const acceptedCount = await Pengajuan.count({ where: { jobId, status: 'accepted' } });
    const jobDetail = await Job.findByPk(jobId);

        if (acceptedCount >= jobDetail.quota) {
        return res.status(400).json({ msg: "Kuota magang sudah terpenuhi." });
        }

    // 5. Eksekusi Simpan Data
    const pengajuanBaru = await Pengajuan.create({
      id: "reg_" + Date.now(), // Atau pakai UUID
      userId,
      jobId,
      status: 'pending', // Default status
      tanggalDaftar: new Date()
    });

    res.status(201).json({
      success: true,
      msg: "Pengajuan magang berhasil dikirim!",
      data: pengajuanBaru
    });

  } catch (error) {
    console.error("Error submitPengajuan:", error);
    res.status(500).json({ 
      success: false,
      msg: "Terjadi kesalahan pada server saat memproses pengajuan.",
      error: error.message 
    });
  }
};