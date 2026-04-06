const { Pengajuan, Job, User } = require('../models');

/**
 * SUBMIT PENGAJUAN / LAPOR PENERIMAAN MAGANG
 * Controller ini menangani pendaftaran magang sekaligus upload file bukti/CV.
 */
exports.submitPengajuan = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    // 1. Validasi: Apakah ID Lowongan dikirim?
    if (!jobId) {
      return res.status(400).json({ 
        success: false, 
        msg: "ID Lowongan (jobId) wajib disertakan." 
      });
    }

    // 2. Validasi: Apakah file CV/Bukti diupload? (Multer)
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        msg: "Mohon upload berkas bukti pendaftaran/CV dalam format PDF." 
      });
    }

    // 3. Cari detail lowongan di database
    const jobDetail = await Job.findByPk(jobId);
    if (!jobDetail) {
      return res.status(404).json({ 
        success: false, 
        msg: "Lowongan magang tidak ditemukan." 
      });
    }

    // 4. Cek Deadline (Biar mahasiswa gak daftar ke lowongan basi)
    const today = new Date();
    const deadlineDate = new Date(jobDetail.deadline);
    if (jobDetail.status === 'closed' || today > deadlineDate) {
      return res.status(400).json({ 
        success: false, 
        msg: "Maaf, lowongan ini sudah ditutup atau sudah melewati masa deadline." 
      });
    }

    // 5. Cek Duplikasi: Apakah mahasiswa sudah melamar di posisi ini sebelumnya?
    const alreadyApplied = await Pengajuan.findOne({ 
      where: { userId, jobId } 
    });
    
    if (alreadyApplied) {
      return res.status(400).json({ 
        success: false, 
        msg: "Kamu sudah mengirimkan pengajuan untuk posisi ini. Silakan tunggu konfirmasi Admin." 
      });
    }

    // 6. Cek Kuota: Apakah kapasitas magang sudah terpenuhi?
    const acceptedCount = await Pengajuan.count({ 
      where: { jobId, status: 'accepted' } 
    });

    if (acceptedCount >= jobDetail.quota) {
      return res.status(400).json({ 
        success: false, 
        msg: "Maaf, kuota magang untuk posisi ini sudah terpenuhi (penuh)." 
      });
    }

    // 7. EKSEKUSI SIMPAN DATA
    const cvUrl = req.file.filename; // Nama file yang dihasilkan Multer
    const pengajuanBaru = await Pengajuan.create({
      id: "reg_" + Date.now(), // Unique ID berdasarkan timestamp
      userId,
      jobId,
      cvUrl: cvUrl,
      status: 'pending', // Default status butuh verifikasi admin
      tanggalDaftar: new Date()
    });

    // 8. Berikan Response Berhasil
    return res.status(201).json({
      success: true,
      msg: "Pengajuan magang berhasil dikirim dan file berhasil diupload!",
      data: pengajuanBaru
    });

  } catch (error) {
    // Log error di console server untuk debugging
    console.error("Critical Error at submitPengajuan:", error);
    
    return res.status(500).json({ 
      success: false,
      msg: "Terjadi kesalahan internal server saat memproses pengajuan.",
      error: error.message 
    });
  }
};