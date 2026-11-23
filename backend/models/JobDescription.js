const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    company: {
      type: String,
      default: 'Target Company',
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description text is required']
    },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    responsibilities: [{ type: String }],
    experienceRequired: {
      type: String,
      default: 'Entry to Mid Level'
    },
    matchAnalysis: {
      resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
      },
      matchPercentage: {
        type: Number,
        default: 0
      },
      matchedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      partiallyMatchedSkills: [{ type: String }],
      relevantProjects: [{ type: String }],
      recommendedTopics: [{ type: String }],
      focusAreas: [{ type: String }],
      analyzedAt: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);

