const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalFileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    extractedText: {
      type: String,
      default: ''
    },
    summary: {
      type: String,
      default: ''
    },
    parsedSkills: {
      technical: [{ type: String }],
      frameworks: [{ type: String }],
      tools: [{ type: String }],
      softSkills: [{ type: String }]
    },
    parsedEducation: [
      {
        degree: String,
        institution: String,
        year: String,
        grade: String
      }
    ],
    parsedProjects: [
      {
        title: String,
        description: String,
        technologies: [{ type: String }],
        highlights: [{ type: String }]
      }
    ],
    parsedExperience: [
      {
        role: String,
        company: String,
        duration: String,
        highlights: [{ type: String }]
      }
    ],
    keywords: [{ type: String }],
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resume', resumeSchema);

