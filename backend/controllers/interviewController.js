const InterviewSession = require('../models/InterviewSession');
const InterviewReport = require('../models/InterviewReport');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const {
  generateInterviewQuestions,
  generateFollowUpQuestion,
  evaluateAnswer,
  analyzeCommunicationIndicators
} = require('../services/aiService');

// @desc    Start / configure a new interview session
// @route   POST /api/interviews/start
// @access  Private
const startInterview = async (req, res, next) => {
  try {
    const {
      resumeId,
      jobDescriptionId,
      targetRole,
      interviewType = 'Mixed',
      difficulty = 'Intermediate',
      totalQuestionsTarget = 5,
      interviewerPersona
    } = req.body;

    let resume = null;
    if (resumeId) {
      resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }
      if (resume.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to use this resume' });
      }
    } else {
      resume = await Resume.findOne({ userId: req.user._id, isPrimary: true }) ||
               await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (!resume) {
        return res.status(400).json({
          success: false,
          message: 'Please upload and select a valid parsed resume before starting your interview.'
        });
      }
    }

    let jobDescription = null;
    if (jobDescriptionId) {
      jobDescription = await JobDescription.findById(jobDescriptionId);
      if (jobDescription && jobDescription.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to use this job description' });
      }
    } else {
      jobDescription = await JobDescription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    const effectiveTargetRole = targetRole?.trim() || jobDescription?.jobTitle || 'Software Engineer';

    // Generate questions using AI / intelligent fallback
    const targetCount = Math.min(Math.max(parseInt(totalQuestionsTarget, 10) || 5, 3), 10);
    const generated = await generateInterviewQuestions({
      resume,
      jobDescription,
      targetRole: effectiveTargetRole,
      interviewType,
      difficulty,
      count: targetCount
    });

    const persona = interviewerPersona || {
      name: 'Alex Morgan',
      title: 'Principal Technical Architect & AI Coach',
      avatarStyle: 'modern-tech'
    };

    const session = await InterviewSession.create({
      userId: req.user._id,
      resumeId: resume?._id,
      jobDescriptionId: jobDescription?._id,
      targetRole: effectiveTargetRole,
      interviewType,
      difficulty,
      totalQuestionsTarget: targetCount,
      currentQuestionIndex: 0,
      status: 'in-progress',
      interviewerPersona: persona,
      questions: generated.questions,
      answers: [],
      startedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Interview session initialized',
      session,
      isDemoMode: generated.isDemoMode,
      aiModel: generated.aiModel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user's interview sessions
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('resumeId', 'originalFileName')
      .populate('jobDescriptionId', 'jobTitle company');

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview session by ID
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id)
      .populate('resumeId', 'originalFileName parsedSkills')
      .populate('jobDescriptionId', 'jobTitle company requiredSkills');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this interview' });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answer to current question & optionally trigger adaptive follow-up
// @route   POST /api/interviews/:id/answer
// @access  Private
const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answerText, durationSeconds = 30 } = req.body;

    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This interview has already been completed.' });
    }

    const currentQuestion = session.questions.find(q => q.questionId === questionId) ||
                           session.questions[session.currentQuestionIndex];

    if (!currentQuestion) {
      return res.status(400).json({ success: false, message: 'Question not found in session' });
    }

    // Communication analysis
    const commIndicators = analyzeCommunicationIndicators(answerText, durationSeconds);

    // AI rubric evaluation
    const evaluation = await evaluateAnswer({
      question: currentQuestion,
      answerText: answerText || '(No answer provided)',
      durationSeconds,
      interviewType: session.interviewType,
      difficulty: session.difficulty
    });

    // Record answer
    session.answers.push({
      questionId: currentQuestion.questionId,
      questionText: currentQuestion.questionText,
      answerText: answerText || '',
      durationSeconds,
      speakingPaceWpm: commIndicators.speakingPaceWpm,
      fillerWordsCount: commIndicators.fillerWordsCount,
      answeredAt: new Date(),
      evaluation: {
        score: evaluation.score,
        categoryScores: evaluation.categoryScores,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        missingConcepts: evaluation.missingConcepts,
        suggestedAnswer: evaluation.suggestedAnswer,
        feedback: evaluation.feedback
      }
    });

    let followUpAdded = false;
    let followUpObj = null;

    // Adaptive follow-up check: only if not already a follow-up and session question count hasn't reached max
    if (!currentQuestion.isFollowUp && session.questions.length < session.totalQuestionsTarget + 2) {
      let resume = null;
      if (session.resumeId) {
        resume = await Resume.findById(session.resumeId);
      }

      const followUpResult = await generateFollowUpQuestion({
        currentQuestion,
        candidateAnswer: answerText,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        resume
      });

      if (followUpResult && followUpResult.hasFollowUp) {
        // Insert follow-up directly after current index
        session.questions.splice(session.currentQuestionIndex + 1, 0, followUpResult.followUpQuestion);
        followUpAdded = true;
        followUpObj = followUpResult.followUpQuestion;
      }
    }

    // Advance question index
    session.currentQuestionIndex += 1;

    const isFinished = session.currentQuestionIndex >= session.questions.length;
    if (isFinished) {
      session.status = 'completed';
      session.completedAt = new Date();

      // Calculate overall average score
      const totalScore = session.answers.reduce((acc, ans) => acc + (ans.evaluation?.score || 0), 0);
      session.overallScore = Math.round(totalScore / Math.max(session.answers.length, 1));
    }

    await session.save();

    // If finished, generate InterviewReport
    let reportId = null;
    if (isFinished) {
      const report = await createOrUpdateReport(session, req.user);
      reportId = report._id;
    }

    res.status(200).json({
      success: true,
      evaluation,
      followUpAdded,
      hasFollowUp: followUpAdded,
      followUpQuestion: followUpObj,
      nextQuestionIndex: session.currentQuestionIndex,
      nextQuestion: session.questions[session.currentQuestionIndex] || null,
      isFinished,
      reportId,
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually end / complete interview session
// @route   POST /api/interviews/:id/complete
// @access  Private
const completeInterview = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    session.status = 'completed';
    session.completedAt = new Date();

    const totalScore = session.answers.reduce((acc, ans) => acc + (ans.evaluation?.score || 0), 0);
    session.overallScore = session.answers.length > 0 ? Math.round(totalScore / session.answers.length) : 50;

    await session.save();

    const report = await createOrUpdateReport(session, req.user);

    res.status(200).json({
      success: true,
      message: 'Interview completed successfully',
      session,
      reportId: report._id,
      overallScore: session.overallScore,
      report
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to synthesize comprehensive report from interview session
async function createOrUpdateReport(session, user) {
  const answers = session.answers || [];

  let sumTech = 0;
  let sumClarity = 0;
  let sumRelevance = 0;
  let sumCompleteness = 0;
  let sumStar = 0;
  let sumWpm = 0;
  let totalFillers = 0;
  let totalDuration = 0;

  const allStrengths = [];
  const allWeaknesses = [];
  const allMissingConcepts = [];

  const questionFeedback = answers.map((ans, idx) => {
    const ev = ans.evaluation || {};
    const cat = ev.categoryScores || {};

    sumTech += (cat.technicalCorrectness || 70);
    sumClarity += (cat.clarity || 70);
    sumRelevance += (cat.relevance || 75);
    sumCompleteness += (cat.completeness || 65);
    sumStar += (cat.starStructure || 70);

    sumWpm += (ans.speakingPaceWpm || 110);
    totalFillers += (ans.fillerWordsCount || 0);
    totalDuration += (ans.durationSeconds || 30);

    if (ev.strengths) allStrengths.push(...ev.strengths);
    if (ev.weaknesses) allWeaknesses.push(...ev.weaknesses);
    if (ev.missingConcepts) allMissingConcepts.push(...ev.missingConcepts);

    return {
      questionId: ans.questionId,
      questionText: ans.questionText,
      candidateAnswer: ans.answerText,
      score: ev.score || 70,
      category: session.questions[idx]?.category || 'Technical',
      strengths: ev.strengths || [],
      weaknesses: ev.weaknesses || [],
      suggestedAnswer: ev.suggestedAnswer || '',
      feedback: ev.feedback || ''
    };
  });

  const count = Math.max(answers.length, 1);
  const avgTech = Math.round(sumTech / count);
  const avgClarity = Math.round(sumClarity / count);
  const avgRelevance = Math.round(sumRelevance / count);
  const avgCompleteness = Math.round(sumCompleteness / count);
  const avgStar = Math.round(sumStar / count);
  const avgWpm = Math.round(sumWpm / count);
  const avgDuration = Math.round(totalDuration / count);

  const overallScore = Math.round((avgTech * 0.35) + (avgClarity * 0.25) + (avgRelevance * 0.25) + (avgCompleteness * 0.15));

  // Synthesize top recommendations
  const uniqueWeaknesses = Array.from(new Set(allWeaknesses)).slice(0, 4);
  const uniqueStrengths = Array.from(new Set(allStrengths)).slice(0, 4);

  const recommendations = [
    avgWpm < 90 ? 'Increase your speaking pace slightly to project greater confidence and fluency.' :
    avgWpm > 165 ? 'Slow down your speaking rate to allow the interviewer to digest complex technical details.' :
    'Maintain your current speaking pace; your articulation tempo is within the ideal professional bracket (110-150 WPM).',
    totalFillers > 6 ? 'Practice pause techniques instead of using filler words ("um", "like", "basically"). Silent pauses sound deliberate and thoughtful.' :
    'Excellent vocal economy with minimal filler hesitation.',
    'Anchor technical descriptions with real-world architectural trade-offs, scalability considerations, or production lessons.'
  ];

  const recommendedTopics = Array.from(new Set(allMissingConcepts)).slice(0, 6);
  if (recommendedTopics.length === 0) {
    recommendedTopics.push('Distributed System Design Patterns', 'Advanced SQL Query Profiling', 'Behavioral STAR Framework Structuring');
  }

  const reportData = {
    userId: session.userId,
    sessionId: session._id,
    candidateName: user.name || 'Candidate',
    targetRole: session.targetRole,
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    totalQuestions: session.questions.length,
    questionsAnswered: answers.length,
    overallScore,
    categoryScores: {
      technicalKnowledge: avgTech,
      communication: avgClarity,
      answerRelevance: avgRelevance,
      starStructure: avgStar,
      problemSolving: avgCompleteness
    },
    communicationIndicators: {
      averageSpeakingPaceWpm: avgWpm,
      totalFillerWords: totalFillers,
      averageAnswerDurationSeconds: avgDuration
    },
    strengths: uniqueStrengths.length ? uniqueStrengths : ['Good foundation and logical explanation flow.'],
    weaknesses: uniqueWeaknesses.length ? uniqueWeaknesses : ['Could incorporate more quantitative results and edge cases.'],
    recommendations,
    recommendedTopics,
    questionFeedback
  };

  const report = await InterviewReport.findOneAndUpdate(
    { sessionId: session._id },
    reportData,
    { upsert: true, new: true }
  );

  return report;
}

module.exports = {
  startInterview,
  getInterviews,
  getInterviewById,
  submitAnswer,
  completeInterview
};

