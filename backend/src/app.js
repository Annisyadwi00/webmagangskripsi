const express = require("express");
const cors = require("cors");
const path = require("path");
const auth = require("./middlewares/auth");
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
const profileRoutes = require("./routes/profile");
const laporanRoutes = require("./routes/laporan");
const dashboardRoutes = require("./routes/dashboard");

app.use("/api/v1/pengajuan", auth(), pengajuanRoutes);
app.use("/api/v1/logbook", auth(), logbookRoutes);
app.use("/api/v1/nilai", auth(), nilaiRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/laporan", auth(), laporanRoutes);
app.use("/api/v1/dashboard", auth(), dashboardRoutes);
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
