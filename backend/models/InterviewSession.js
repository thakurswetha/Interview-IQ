const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    answerText: { type: String, default: '' },
    durationSeconds: { type: Number, default: 0 },
    speakingPaceWpm: { type: Number, default: 0 },
    fillerWordsCount: { type: Number, default: 0 },
    answeredAt: { type: Date, default: Date.now },
    evaluation: {
      score: { type: Number, default: 0 },
      categoryScores: {
        technicalCorrectness: { type: Number, default: 0 },
        clarity: { type: Number, default: 0 },
        relevance: { type: Number, default: 0 },
        completeness: { type: Number, default: 0 },
        starStructure: { type: Number, default: 0 }
      },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      missingConcepts: [{ type: String }],
      suggestedAnswer: { type: String, default: '' },
      feedback: { type: String, default: '' }
    }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    category: {
      type: String,
      enum: ['Technical', 'HR', 'Behavioral', 'Project-Based', 'Follow-Up', 'General'],
      default: 'Technical'
    },
    expectedKeyConcepts: [{ type: String }],
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    isFollowUp: { type: Boolean, default: false },
    parentQuestionId: { type: String, default: null }
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription'
    },
    targetRole: {
      type: String,
      default: 'Software Engineer'
    },
    interviewType: {
      type: String,
      enum: ['Technical', 'HR', 'Behavioral', 'Project-Based', 'Mixed'],
      default: 'Mixed'
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    totalQuestionsTarget: {
      type: Number,
      default: 5
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['configured', 'in-progress', 'completed', 'abandoned'],
      default: 'configured'
    },
    interviewerPersona: {
      name: { type: String, default: 'Alex Morgan' },
      title: { type: String, default: 'Senior Engineering Lead' },
      avatarStyle: { type: String, default: 'modern-tech' }
    },
    questions: [questionSchema],
    answers: [answerSchema],
    overallScore: {
      type: Number,
      default: 0
    },
    startedAt: Date,
    completedAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);

