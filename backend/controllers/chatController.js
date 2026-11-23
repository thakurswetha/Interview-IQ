const ChatHistory = require('../models/ChatHistory');
const { generateChatbotResponse } = require('../services/aiService');

// @desc    Send message to AI Career & Interview Coach
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    let chat = await ChatHistory.findOne({ userId: req.user._id });
    if (!chat) {
      chat = new ChatHistory({
        userId: req.user._id,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      sender: 'user',
      text: message.trim(),
      timestamp: new Date()
    });

    // Generate AI response
    const aiReply = await generateChatbotResponse({
      messages: chat.messages.slice(-10),
      context: {
        userName: req.user.name,
        careerInterest: req.user.careerInterest,
        experienceLevel: req.user.experienceLevel
      }
    });

    // Add assistant message
    chat.messages.push({
      sender: 'assistant',
      text: aiReply,
      timestamp: new Date()
    });

    await chat.save();

    res.status(200).json({
      success: true,
      reply: aiReply,
      messages: chat.messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res, next) => {
  try {
    let chat = await ChatHistory.findOne({ userId: req.user._id });

    if (!chat || chat.messages.length === 0) {
      // Return default welcome message
      const defaultWelcome = {
        sender: 'assistant',
        text: `Hi ${req.user.name || 'there'}! 👋 I'm your **InterviewIQ Career Coach**.\n\nI can help you review resume bullet points, explain system design or algorithms, run quick mock Q&A drills, or share proven behavioral interview strategies (like the STAR method).\n\nWhat would you like to prepare for today?`,
        timestamp: new Date()
      };

      if (!chat) {
        chat = await ChatHistory.create({
          userId: req.user._id,
          messages: [defaultWelcome]
        });
      } else {
        chat.messages.push(defaultWelcome);
        await chat.save();
      }
    }

    res.status(200).json({
      success: true,
      messages: chat.messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chat/clear
// @access  Private
const clearChatHistory = async (req, res, next) => {
  try {
    await ChatHistory.findOneAndDelete({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory
};

