const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  clearChatHistory
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/message', sendMessage);
router.get('/history', getChatHistory);
router.delete('/clear', clearChatHistory);

module.exports = router;

