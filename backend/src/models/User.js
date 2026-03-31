const { DataTypes } = require('sequelize');
const db = require('../config/db');

const User = db.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('mahasiswa', 'dosen', 'admin'),
    allowNull: false,
  },
  // Tambahkan field spesifik kampus
  npm: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true, // Null jika admin/dosen
  },
  prodi: {
    type: DataTypes.ENUM('Informatika', 'Sistem Informasi'),
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verificationCode: DataTypes.STRING,
  verificationExpires: DataTypes.DATE,
}, {
  timestamps: true,
});

module.exports = User;