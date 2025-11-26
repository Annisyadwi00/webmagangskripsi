const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Logbook = sequelize.define(
  "Logbook",
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

    judul: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,  // createdAt & updatedAt
    tableName: "logbook",
  }
);

module.exports = Logbook;
