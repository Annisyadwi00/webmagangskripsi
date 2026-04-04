const express = require('express');
const router = express.Router();
const pengajuanController = require('../controllers/pengajuanController');
const authorize = require('../middlewares/auth'); 
const upload = require('../middlewares/upload'); // Import middleware upload

// Tambahkan upload.single('cv') sebelum controller
router.post('/apply', authorize('mahasiswa'), upload.single('cv'), pengajuanController.submitPengajuan);

module.exports = router;