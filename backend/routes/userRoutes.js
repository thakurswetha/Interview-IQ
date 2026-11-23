const express = require('express');
const router = express.Router();
const { getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', getMe);
router.put('/profile', updateProfile);

module.exports = router;

