const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Pengajuan = db.define('Pengajuan', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  userId: { // Foreign Key ke User (Mahasiswa)
    type: DataTypes.STRING,
    allowNull: false,
  },
  jobId: { // Foreign Key ke Job
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'interview', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
  cvUrl: {
    type: DataTypes.STRING,
    allowNull: true, // Nanti diisi setelah upload file
  },
  catatanAdmin: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Pengajuan;