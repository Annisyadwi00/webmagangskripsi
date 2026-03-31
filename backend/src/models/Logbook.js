const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Logbook = sequelize.define(
  "Logbook",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    // Relasi ke Mahasiswa (User)
    mahasiswaId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Relasi ke Pengajuan (Pendaftaran Magang yang aktif)
    pengajuanId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Field Tambahan: Tanggal kegiatan dilaporkan
    tanggal_kegiatan: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi_kegiatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true, // Link dokumen/kodingan/bukti
    },
    dosenPembimbingId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_verifikasi: {
      type: DataTypes.ENUM('pending', 'approved', 'revised'),
      defaultValue: 'pending',
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "logbook",
  }
);

module.exports = Logbook;