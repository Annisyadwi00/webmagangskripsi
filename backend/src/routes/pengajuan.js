const express = require('express');
const router = express.Router();
const pengajuanController = require('../controllers/pengajuanController');
const auth = require('../middlewares/auth');

// Route hanya bertugas memetakan URL ke fungsi di Controller
router.post('/apply', auth, pengajuanController.submitPengajuan);

module.exports = router;