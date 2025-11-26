const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// ROUTES
// ===============================
const jobRoutes = require("./routes/jobs");
const pengajuanRoutes = require("./routes/pengajuan");
const logbookRoutes = require("./routes/logbook");
const nilaiRoutes = require("./routes/nilai");
const authRoutes = require("./routes/auth"); // LOGIN BACKEND

app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/pengajuan", pengajuanRoutes);
app.use("/api/v1/logbook", logbookRoutes);
app.use("/api/v1/nilai", nilaiRoutes);
app.use("/api/v1/auth", authRoutes);

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("API Portal Magang UNSIKA berjalan ✔");
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ error: err.message });
});

module.exports = app;
