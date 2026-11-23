const mongoose = require('mongoose');

const interviewReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
      unique: true,
      index: true
    },
    candidateName: {
      type: String,
      default: 'Candidate'
    },
    targetRole: {
      type: String,
      default: 'Software Engineer'
    },
    interviewType: {
      type: String,
      default: 'Mixed'
    },
    difficulty: {
      type: String,
      default: 'Intermediate'
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    questionsAnswered: {
      type: Number,
      default: 0
    },
    overallScore: {
      type: Number,
      default: 0
    },
    categoryScores: {
      technicalKnowledge: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      answerRelevance: { type: Number, default: 0 },
      starStructure: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 }
    },
    communicationIndicators: {
      averageSpeakingPaceWpm: { type: Number, default: 0 },
      totalFillerWords: { type: Number, default: 0 },
      averageAnswerDurationSeconds: { type: Number, default: 0 }
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    recommendedTopics: [{ type: String }],
    questionFeedback: [
      {
        questionId: String,
        questionText: String,
        candidateAnswer: String,
        score: Number,
        category: String,
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        suggestedAnswer: String,
        feedback: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('InterviewReport', interviewReportSchema);

