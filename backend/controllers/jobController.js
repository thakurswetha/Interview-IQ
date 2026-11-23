const JobDescription = require('../models/JobDescription');
const Resume = require('../models/Resume');
const { extractSkills, extractRawText } = require('../services/resumeParserService');
const { analyzeJobMatch } = require('../services/jobMatchingService');

// @desc    Upload job description document (PDF/DOCX)
// @route   POST /api/jobs/upload
// @access  Private
const uploadJobDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or DOCX job description file.'
      });
    }

    const { path: filePath, originalname, mimetype } = req.file;
    const text = await extractRawText(filePath, mimetype);

    const parsedSkills = extractSkills(text);
    const requiredSkills = [...parsedSkills.technical, ...parsedSkills.frameworks, ...parsedSkills.tools].slice(0, 15);

    const titleFromFilename = originalname.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

    const job = await JobDescription.create({
      userId: req.user._id,
      jobTitle: req.body.jobTitle || titleFromFilename || 'Target Job Role',
      company: req.body.company || 'Target Company',
      description: text,
      experienceRequired: req.body.experienceRequired || 'Entry to Mid Level',
      requiredSkills
    });

    res.status(201).json({
      success: true,
      message: 'Job description document parsed and saved successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / save a job description
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res, next) => {
  try {
    const { jobTitle, company, description, experienceRequired, requiredSkills } = req.body;

    if (!jobTitle || !description) {
      return res.status(400).json({
        success: false,
        message: 'Job title and job description text are required.'
      });
    }

    // Auto-extract skills if not explicitly provided
    let extractedRequired = requiredSkills || [];
    if (!requiredSkills || requiredSkills.length === 0) {
      const parsed = extractSkills(description);
      extractedRequired = [...parsed.technical, ...parsed.frameworks, ...parsed.tools].slice(0, 15);
    }

    const job = await JobDescription.create({
      userId: req.user._id,
      jobTitle,
      company: company || 'Target Company',
      description,
      experienceRequired: experienceRequired || 'Entry to Mid Level',
      requiredSkills: extractedRequired
    });

    res.status(201).json({
      success: true,
      message: 'Job description saved successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for logged in user
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res, next) => {
  try {
    const jobs = await JobDescription.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res, next) => {
  try {
    const job = await JobDescription.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job description not found' });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this job description' });
    }

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Match job description against resume
// @route   POST /api/jobs/:id/match
// @access  Private
const matchJobWithResume = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    const job = await JobDescription.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job description not found' });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    let resume = null;
    if (resumeId) {
      resume = await Resume.findById(resumeId);
    } else {
      // Find user's primary or latest resume
      resume = await Resume.findOne({ userId: req.user._id, isPrimary: true }) ||
               await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'No resume found for matching. Please upload a resume first.'
      });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to use this resume' });
    }

    const matchReport = analyzeJobMatch(resume, job);

    // Save cached match analysis to job document
    job.matchAnalysis = {
      resumeId: resume._id,
      matchPercentage: matchReport.matchPercentage,
      matchedSkills: matchReport.matchedSkills,
      missingSkills: matchReport.missingSkills,
      partiallyMatchedSkills: matchReport.partiallyMatchedSkills,
      relevantProjects: matchReport.relevantProjects,
      recommendedTopics: matchReport.recommendedTopics,
      focusAreas: matchReport.focusAreas,
      analyzedAt: new Date()
    };
    await job.save();

    res.status(200).json({
      success: true,
      jobTitle: job.jobTitle,
      company: job.company,
      resumeId: resume._id,
      resumeFileName: resume.originalFileName,
      ...matchReport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job description
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res, next) => {
  try {
    const job = await JobDescription.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job description not found' });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job description deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadJobDocument,
  createJob,
  getJobs,
  getJobById,
  matchJobWithResume,
  deleteJob
};

