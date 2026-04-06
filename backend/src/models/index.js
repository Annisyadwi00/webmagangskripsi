const User = require('./User');
const Job = require('./Job');
const Pengajuan = require('./Pengajuan');
const Logbook = require('./Logbook');
const Nilai = require('./Nilai');

// Relasi Mahasiswa (User) ke Pengajuan
User.hasMany(Pengajuan, { foreignKey: 'userId', as: 'daftar_pengajuan' });
Pengajuan.belongsTo(User, { foreignKey: 'userId', as: 'mahasiswa' });

// Relasi Lowongan (Job) ke Pengajuan
Job.hasMany(Pengajuan, { foreignKey: 'jobId', as: 'pelamar' });
Pengajuan.belongsTo(Job, { foreignKey: 'jobId', as: 'lowongan' });

// Relasi Pengajuan ke Logbook (Hanya bisa isi logbook jika pengajuan statusnya 'accepted')
Pengajuan.hasMany(Logbook, { foreignKey: 'pengajuanId', as: 'catatan_harian' });
Logbook.belongsTo(Pengajuan, { foreignKey: 'pengajuanId' });

// Relasi Pengajuan ke Nilai
Pengajuan.hasOne(Nilai, { foreignKey: 'pengajuanId', as: 'hasil_akhir' });
Nilai.belongsTo(Pengajuan, { foreignKey: 'pengajuanId' });

module.exports = { User, Job, Pengajuan, Logbook, Nilai };