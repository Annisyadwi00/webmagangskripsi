const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('Web Developer', 'Mobile Developer', 'Data Science', 'UI/UX', 'Network', 'Other'),
      defaultValue: 'Other',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Tambahkan Slot/Kuota
    quota: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    // Tambahkan Deadline
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Link pendaftaran eksternal atau portal perusahaan"
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active',
    },
  },
  {
    timestamps: true,
    tableName: "jobs",
  }
);

module.exports = Job;