const path = require("path");

// ===============================
// LOAD ENV
// ===============================
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

console.log("ENV Loaded:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("PORT:", process.env.PORT);

// ===============================
// IMPORT APP & DATABASE
// ===============================
const app = require("./app");
const sequelize = require("./config/db");

// ===============================
// SERVER CONFIG
// ===============================
const PORT = process.env.PORT || 3000;
const SHOULD_SYNC = process.env.DB_SYNC !== "false";

// ===============================
// CONNECT DATABASE & RUN SERVER
// ===============================
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✔ Database terkoneksi dengan baik.");

     if (SHOULD_SYNC) {
      // Pastikan struktur tabel selaras dengan model terbaru agar error kolom hilang
      await sequelize.sync({ alter: true });
      console.log("✔ Skema database telah disinkronkan (alter mode).");
    }

    app.listen(PORT, () => {
      console.log(`✔ Server berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("✘ Gagal koneksi database:", err.message);
  }
})();
