const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth"); // Gunakan middleware yang sudah ada

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-code", authController.verifyCode);
router.post("/resend-code", authController.resendCode);

// Di sini kita gunakan middleware auth agar tidak nulis ulang logika JWT
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;