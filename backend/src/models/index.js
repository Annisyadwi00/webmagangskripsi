const User = require('./user');
const Job = require('./job');
const Pengajuan = require('./pengajuan');

// Relasi Mahasiswa -> Pengajuan
User.hasMany(Pengajuan, { foreignKey: 'userId' });
Pengajuan.belongsTo(User, { foreignKey: 'userId', as: 'mahasiswa' });

// Relasi Job -> Pengajuan
Job.hasMany(Pengajuan, { foreignKey: 'jobId' });
Pengajuan.belongsTo(Job, { foreignKey: 'jobId', as: 'lowongan' });

// Di models/index.js
Logbook.belongsTo(User, { foreignKey: 'mahasiswaId', as: 'mahasiswa' });
Logbook.belongsTo(User, { foreignKey: 'dosenPembimbingId', as: 'pembimbing' });
Logbook.belongsTo(Pengajuan, { foreignKey: 'pengajuanId' });

// Di models/index.js
Nilai.belongsTo(User, { foreignKey: 'mahasiswaId', as: 'mahasiswa' });
Nilai.belongsTo(Pengajuan, { foreignKey: 'pengajuanId', as: 'detail_magang' });

module.exports = { User, Job, Pengajuan };