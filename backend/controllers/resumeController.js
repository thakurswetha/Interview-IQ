const fs = require('fs');
const Resume = require('../models/Resume');
const {
  parseResumeFile,
  verifyMagicBytes,
  validateResumeContent
} = require('../services/resumeParserService');

// @desc    Upload and parse resume file (PDF or DOCX)
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and DOCX resume files are supported.'
      });
    }

    const { path: filePath, originalname, mimetype, size } = req.file;

    // 1. Authoritative backend signature / magic bytes validation
    try {
      verifyMagicBytes(filePath);
    } catch (magicErr) {
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
      return res.status(400).json({
        success: false,
        message: 'Only PDF and DOCX resume files are supported.'
      });
    }

    // 2. Extract text and parse resume sections
    let parsedData;
    try {
      parsedData = await parseResumeFile(filePath, mimetype);
    } catch (parseErr) {
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
      return res.status(400).json({
        success: false,
        message: 'This document does not appear to contain valid resume information.'
      });
    }

    // 3. Meaningful resume content validation
    const validation = validateResumeContent(parsedData.extractedText, parsedData);
    if (!validation.isValid) {
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
      return res.status(400).json({
        success: false,
        message: 'This document does not appear to contain valid resume information.'
      });
    }

    // 4. Persistence
    const existingCount = await Resume.countDocuments({ userId: req.user._id });
    const isPrimary = existingCount === 0;

    const resume = await Resume.create({
      userId: req.user._id,
      originalFileName: originalname,
      filePath,
      fileSize: size,
      mimeType: mimetype,
      extractedText: parsedData.extractedText,
      summary: parsedData.summary,
      parsedSkills: parsedData.parsedSkills,
      parsedEducation: parsedData.parsedEducation,
      parsedProjects: parsedData.parsedProjects,
      parsedExperience: parsedData.parsedExperience,
      keywords: parsedData.keywords,
      isPrimary
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      resume
    });
  } catch (error) {
    // Clean up uploaded file if parsing or DB save failed
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}
    }
    next(error);
  }
};

// @desc    Get all resumes of logged in user
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Ownership check
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this resume' });
    }

    res.status(200).json({
      success: true,
      resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update and correct parsed resume info
// @route   PUT /api/resumes/:id
// @access  Private
const updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this resume' });
    }

    const { parsedSkills, parsedEducation, parsedProjects, parsedExperience, summary, isPrimary } = req.body;

    if (parsedSkills) resume.parsedSkills = parsedSkills;
    if (parsedEducation) resume.parsedEducation = parsedEducation;
    if (parsedProjects) resume.parsedProjects = parsedProjects;
    if (parsedExperience) resume.parsedExperience = parsedExperience;
    if (summary !== undefined) resume.summary = summary;
    if (isPrimary !== undefined) {
      if (isPrimary) {
        await Resume.updateMany({ userId: req.user._id }, { isPrimary: false });
      }
      resume.isPrimary = isPrimary;
    }

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume parsed data updated successfully',
      resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this resume' });
    }

    // Delete file from disk
    if (fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (_) {}
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume
};

