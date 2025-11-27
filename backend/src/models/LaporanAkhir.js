const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LaporanAkhir = sequelize.define(
  "LaporanAkhir",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    mahasiswaId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    linkLaporan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    tanggalUnggah: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    statusVerifikasi: {
      type: DataTypes.ENUM("pending", "disetujui", "ditolak"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    tableName: "laporan_akhir",
  }
);

module.exports = LaporanAkhir;