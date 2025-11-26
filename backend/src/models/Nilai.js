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
    },

    nilai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    linkNilai: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mahasiswaId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    nama_mahasiswa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "nilai",
  }
);

module.exports = Nilai;
