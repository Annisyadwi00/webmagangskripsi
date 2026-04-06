const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authorize = require('../middlewares/auth');

// Admin & Dosen bisa lihat statistik global
router.get('/admin', authorize(['admin', 'dosen']), dashboardController.getAdminStats);

// Mahasiswa cuma bisa lihat statistik pribadinya
router.get('/me', authorize('mahasiswa'), dashboardController.getMahasiswaStats);

module.exports = router;