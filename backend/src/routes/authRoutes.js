const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/me', authController.getMe);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
