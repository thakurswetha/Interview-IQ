const { extractSkills } = require('./resumeParserService');

// Map of related skills for partial match detection
const RELATED_SKILL_MAP = {
  'react': ['javascript', 'typescript', 'next.js', 'vue', 'angular', 'redux', 'frontend'],
  'node.js': ['javascript', 'typescript', 'express', 'backend', 'rest', 'nestjs'],
  'python': ['django', 'flask', 'fastapi', 'data science', 'machine learning', 'pandas'],
  'sql': ['postgresql', 'mysql', 'database', 'sqlite', 'nosql', 'mongodb'],
  'postgresql': ['sql', 'mysql', 'database', 'relational database'],
  'mongodb': ['nosql', 'database', 'mongoose', 'document database'],
  'docker': ['kubernetes', 'containers', 'devops', 'ci/cd', 'cloud'],
  'aws': ['cloud', 'gcp', 'azure', 'devops', 'lambda', 's3', 'ec2'],
  'typescript': ['javascript', 'angular', 'react', 'node.js', 'frontend', 'backend'],
  'rest': ['apis', 'http', 'graphql', 'backend', 'web services'],
  'git': ['github', 'gitlab', 'version control']
};

function analyzeJobMatch(resume, jobDescription) {
  // Combine all candidate skills from resume
  const candidateSkillsSet = new Set();
  const allParsedSkills = resume.parsedSkills || {};

  ['technical', 'frameworks', 'tools', 'softSkills'].forEach(cat => {
    (allParsedSkills[cat] || []).forEach(s => candidateSkillsSet.add(s.toLowerCase().trim()));
  });

  // Extract skills from JD text
  const jdSkillsObj = extractSkills(jobDescription.description || '');
  const jdExplicitSkills = jobDescription.requiredSkills || [];

  const targetRequirements = new Set();
  [...jdSkillsObj.technical, ...jdSkillsObj.frameworks, ...jdSkillsObj.tools, ...jdExplicitSkills]
    .forEach(s => {
      if (s && s.trim().length > 1) {
        targetRequirements.add(s.trim());
      }
    });

  const totalRequirements = Array.from(targetRequirements);

  const matchedSkills = [];
  const partiallyMatchedSkills = [];
  const missingSkills = [];

  totalRequirements.forEach(req => {
    const lowerReq = req.toLowerCase();

    // Direct match check
    if (candidateSkillsSet.has(lowerReq)) {
      matchedSkills.push(req);
      return;
    }

    // Partial/related match check
    const related = RELATED_SKILL_MAP[lowerReq] || [];
    const hasRelated = related.some(r => candidateSkillsSet.has(r));

    if (hasRelated) {
      partiallyMatchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  // Calculate explainable estimated match score
  // Direct match = 1.0 weight, Partial match = 0.5 weight
  let matchPercentage = 0;
  if (totalRequirements.length > 0) {
    const score = (matchedSkills.length * 1.0 + partiallyMatchedSkills.length * 0.5) / totalRequirements.length;
    matchPercentage = Math.round(Math.min(Math.max(score * 100, 15), 98));
  } else {
    matchPercentage = 75; // Default baseline if job has no explicit skill keywords
  }

  // Find relevant projects from candidate's resume matching JD keywords
  const relevantProjects = [];
  const candidateProjects = resume.parsedProjects || [];
  candidateProjects.forEach(proj => {
    const projTech = (proj.technologies || []).map(t => t.toLowerCase());
    const matches = matchedSkills.filter(s => projTech.includes(s.toLowerCase()));
    if (matches.length > 0 || projTech.length > 0) {
      relevantProjects.push(`${proj.title} (demonstrates ${matches.slice(0, 3).join(', ') || proj.technologies.slice(0, 3).join(', ')})`);
    }
  });

  // Recommended preparation topics based on missing/partial skills
  const recommendedTopics = [];
  missingSkills.slice(0, 5).forEach(skill => {
    recommendedTopics.push(`Core concepts and practical implementation of ${skill}`);
  });
  partiallyMatchedSkills.slice(0, 3).forEach(skill => {
    recommendedTopics.push(`Bridging knowledge from your existing stack to ${skill}`);
  });
  if (recommendedTopics.length === 0) {
    recommendedTopics.push('System architecture and advanced design patterns');
    recommendedTopics.push('Performance optimization and high-scale best practices');
  }

  // Interview focus areas
  const focusAreas = [];
  if (matchedSkills.length > 0) {
    focusAreas.push(`Deep-dive technical questions into ${matchedSkills.slice(0, 3).join(', ')}`);
  }
  if (missingSkills.length > 0) {
    focusAreas.push(`Conceptual fundamentals and adaptability regarding ${missingSkills.slice(0, 2).join(', ')}`);
  }
  focusAreas.push('Behavioral alignment, teamwork examples (STAR method), and real-world trade-offs');

  return {
    matchPercentage,
    matchedSkills,
    partiallyMatchedSkills,
    missingSkills,
    relevantProjects: relevantProjects.slice(0, 4),
    recommendedTopics: recommendedTopics.slice(0, 6),
    focusAreas: focusAreas.slice(0, 4),
    disclaimer: 'Estimated system-generated skill overlap score based on resume and job description text analysis. This is an indicator for interview readiness and does not guarantee or represent an actual hiring decision.'
  };
}

module.exports = {
  analyzeJobMatch
};

