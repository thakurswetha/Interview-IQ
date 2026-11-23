const mongoose = require('mongoose');
const InterviewReport = require('../models/InterviewReport');

// @desc    Get report for a specific interview session
// @route   GET /api/reports/:sessionId
// @access  Private
const getReportBySessionId = async (req, res, next) => {
  try {
    const idParam = req.params.sessionId;
    let report = await InterviewReport.findOne({ sessionId: idParam }).populate('sessionId');

    if (!report && mongoose.Types.ObjectId.isValid(idParam)) {
      report = await InterviewReport.findById(idParam).populate('sessionId');
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found for this interview session. The interview may still be in progress.'
      });
    }

    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this report' });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all interview reports (history) for user
// @route   GET /api/reports/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const reports = await InterviewReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sessionId', 'interviewerPersona status startedAt completedAt');

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated analytics & improvement trends
// @route   GET /api/reports/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const reports = await InterviewReport.find({ userId: req.user._id }).sort({ createdAt: 1 });

    if (reports.length === 0) {
      return res.status(200).json({
        success: true,
        hasData: false,
        message: 'No interview sessions completed yet. Complete your first interview to view analytics.',
        summary: {
          totalInterviews: 0,
          averageScore: 0,
          highestScore: 0,
          totalQuestionsAnswered: 0
        },
        trends: [],
        categoryAverages: {
          technicalKnowledge: 0,
          communication: 0,
          answerRelevance: 0,
          starStructure: 0,
          problemSolving: 0
        },
        recurringWeaknesses: [],
        topRecommendations: []
      });
    }

    let totalScore = 0;
    let highestScore = 0;
    let totalQuestions = 0;
    let sumTech = 0;
    let sumComm = 0;
    let sumRel = 0;
    let sumStar = 0;
    let sumProb = 0;

    const weaknessFreq = {};
    const trends = [];

    reports.forEach((rep, idx) => {
      totalScore += rep.overallScore;
      if (rep.overallScore > highestScore) highestScore = rep.overallScore;
      totalQuestions += rep.questionsAnswered;

      sumTech += (rep.categoryScores?.technicalKnowledge || 0);
      sumComm += (rep.categoryScores?.communication || 0);
      sumRel += (rep.categoryScores?.answerRelevance || 0);
      sumStar += (rep.categoryScores?.starStructure || 0);
      sumProb += (rep.categoryScores?.problemSolving || 0);

      (rep.weaknesses || []).forEach(w => {
        weaknessFreq[w] = (weaknessFreq[w] || 0) + 1;
      });

      trends.push({
        sessionNumber: idx + 1,
        date: new Date(rep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        role: rep.targetRole,
        score: rep.overallScore,
        technical: rep.categoryScores?.technicalKnowledge || 0,
        communication: rep.categoryScores?.communication || 0,
        speakingPaceWpm: rep.communicationIndicators?.averageSpeakingPaceWpm || 0,
        fillerWords: rep.communicationIndicators?.totalFillerWords || 0
      });
    });

    const count = reports.length;
    const recurringWeaknesses = Object.entries(weaknessFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text, count]) => ({ text, occurrences: count }));

    res.status(200).json({
      success: true,
      hasData: true,
      summary: {
        totalInterviews: count,
        averageScore: Math.round(totalScore / count),
        highestScore,
        totalQuestionsAnswered: totalQuestions
      },
      categoryAverages: {
        technicalKnowledge: Math.round(sumTech / count),
        communication: Math.round(sumComm / count),
        answerRelevance: Math.round(sumRel / count),
        starStructure: Math.round(sumStar / count),
        problemSolving: Math.round(sumProb / count)
      },
      trends,
      recurringWeaknesses,
      topRecommendations: reports[reports.length - 1].recommendations || []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportBySessionId,
  getHistory,
  getAnalytics
};

