const express = require('express');
const router = express.Router();
const {
  getReportBySessionId,
  getHistory,
  getAnalytics
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/history', getHistory);
router.get('/analytics', getAnalytics);
router.get('/:sessionId', getReportBySessionId);

module.exports = router;

