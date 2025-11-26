const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { v4: uuidv4 } = require("uuid");


// ===============================
// 1. GET ALL JOBS
// ===============================
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 2. GET JOB BY ID
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.id },
    });

    if (!job) {
      return res.status(404).json({ msg: "Lowongan tidak ditemukan." });
    }

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 3. CREATE JOB
// ===============================
router.post("/", async (req, res) => {
  try {
    const { title, company, description, location, link } = req.body;

    if (!title || !company || !location || !link) {
      return res.status(400).json({ msg: "Semua field wajib diisi." });
    }

    const job = await Job.create({
      id: "job_" + uuidv4(),
      title,
      company,
      description,
      location,
      link,
    });

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 4. UPDATE JOB
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const { title, company, description, location, link } = req.body;

    const exists = await Job.findOne({ where: { id: req.params.id } });
    if (!exists) {
      return res.status(404).json({ msg: "Lowongan tidak ditemukan." });
    }

    await Job.update(
      { title, company, description, location, link },
      { where: { id: req.params.id } }
    );

    res.json({ msg: "Lowongan berhasil diperbarui." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 5. DELETE JOB
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const exists = await Job.findOne({ where: { id: req.params.id } });
    if (!exists) {
      return res.status(404).json({ msg: "Lowongan tidak ditemukan." });
    }

    await Job.destroy({
      where: { id: req.params.id },
    });

    res.json({ msg: "Lowongan berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
