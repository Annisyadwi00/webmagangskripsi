const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Nilai = sequelize.define(
  "Nilai",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    pengajuanId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Relasi ke pendaftaran magang yang dinilai"
    },
    mahasiswaId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pemberiNilaiId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ID Dosen atau Admin yang menginput nilai"
    },
    // Menggunakan FLOAT agar bisa menampung nilai desimal
    nilai_perusahaan: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    nilai_dosen: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    nilai_akhir: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Hasil kalkulasi bobot nilai"
    },
    link_sertifikat_atau_form: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    timestamps: true,
    tableName: "nilai",
  }
);

module.exports = Nilai;