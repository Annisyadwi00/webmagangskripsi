const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Pengajuan = sequelize.define(
  "Pengajuan",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    mahasiswaId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    nama_mahasiswa: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    posisi: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    perusahaan: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    link_dokumen: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "disetujui", "ditolak", "dinilai", "selesai"),
      defaultValue: "pending",
    },

    dosenPembimbingId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    statusMahasiswa: {
      type: DataTypes.ENUM("menunggu", "dibimbing", "selesai"),
      defaultValue: "menunggu",
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
    tableName: "pengajuan",
  }
);

module.exports = Pengajuan;
