const express = require('express');
const router = express.Router();
const {
  startInterview,
  getInterviews,
  getInterviewById,
  submitAnswer,
  completeInterview
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/start', startInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);

module.exports = router;

