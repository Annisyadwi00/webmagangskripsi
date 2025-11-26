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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // auto createdAt + updatedAt
    tableName: "jobs",
  }
);

module.exports = Job;
