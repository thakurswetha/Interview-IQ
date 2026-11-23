const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Comprehensive taxonomy of tech skills, tools, and soft skills
const SKILL_TAXONOMY = {
  technical: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Golang',
    'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'R', 'Dart', 'SQL', 'NoSQL',
    'HTML', 'HTML5', 'CSS', 'CSS3', 'Sass', 'Data Structures', 'Algorithms',
    'Object-Oriented Programming', 'OOP', 'Functional Programming', 'System Design',
    'Microservices', 'REST', 'RESTful APIs', 'GraphQL', 'gRPC', 'WebSockets'
  ],
  frameworks: [
    'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Node.js', 'Express',
    'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Laravel',
    'Ruby on Rails', 'Tailwind CSS', 'Bootstrap', 'Redux', 'Zustand', 'Prisma',
    'Mongoose', 'Hibernate', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy'
  ],
  tools: [
    'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'AWS', 'Amazon Web Services',
    'Google Cloud', 'GCP', 'Azure', 'Linux', 'Unix', 'PostgreSQL', 'MySQL',
    'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase', 'Jenkins', 'GitHub Actions',
    'CI/CD', 'Postman', 'Webpack', 'Vite', 'Kafka', 'RabbitMQ', 'Nginx', 'Jira'
  ],
  softSkills: [
    'Communication', 'Teamwork', 'Collaboration', 'Problem Solving', 'Critical Thinking',
    'Leadership', 'Time Management', 'Adaptability', 'Agile', 'Scrum', 'Mentorship',
    'Work Ethic', 'Fast Learner', 'Attention to Detail', 'Analytical Skills'
  ]
};

// Verify file signature / magic bytes strictly
function verifyMagicBytes(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.pdf' && ext !== '.docx') {
    throw new Error('Only PDF and DOCX resume files are supported.');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error('Only PDF and DOCX resume files are supported.');
  }

  const stat = fs.statSync(filePath);
  if (stat.size < 4) {
    throw new Error('Only PDF and DOCX resume files are supported.');
  }

  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(8);
  fs.readSync(fd, buffer, 0, 8, 0);
  fs.closeSync(fd);

  if (ext === '.pdf') {
    // PDF magic bytes: %PDF- (0x25, 0x50, 0x44, 0x46)
    if (buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
      throw new Error('Only PDF and DOCX resume files are supported.');
    }
  } else if (ext === '.docx') {
    // DOCX is a zip archive with magic bytes: PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      throw new Error('Only PDF and DOCX resume files are supported.');
    }
  }
}

// Semantic validation of extracted resume content
function validateResumeContent(extractedText, parsedData = {}) {
  if (!extractedText || typeof extractedText !== 'string') {
    return {
      isValid: false,
      reason: 'This document does not appear to contain valid resume information.'
    };
  }

  const cleanText = extractedText.trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  if (words.length < 25) {
    return {
      isValid: false,
      reason: 'This document does not appear to contain valid resume information.'
    };
  }

  const lower = cleanText.toLowerCase();

  // 1. Detect disqualifying non-resume documents (invoices, assignments, certificates, financial statements)
  const isInvoice =
    (lower.includes('invoice') || lower.includes('receipt') || lower.includes('bill to')) &&
    (lower.includes('amount due') || lower.includes('subtotal') || lower.includes('tax invoice') || lower.includes('balance due') || lower.includes('unit price') || lower.includes('purchase order'));

  const isAssignment =
    (lower.includes('assignment') || lower.includes('homework') || lower.includes('problem set') || lower.includes('lab experiment')) &&
    (lower.includes('due date') || lower.includes('grading rubric') || lower.includes('submitted by') || lower.includes('course syllabus') || lower.includes('assignment 1') || lower.includes('assignment 2'));

  const isStandaloneCertificate =
    (lower.includes('certificate of completion') || lower.includes('certificate of achievement') || lower.includes('this is to certify that')) &&
    (lower.includes('has successfully completed') || lower.includes('is hereby awarded') || lower.includes('authorized signature'));

  const isFinancialStatement =
    lower.includes('balance sheet') && (lower.includes('assets') || lower.includes('liabilities') || lower.includes('equity') || lower.includes('retained earnings'));

  if (isInvoice || isAssignment || isStandaloneCertificate || isFinancialStatement) {
    return {
      isValid: false,
      reason: 'This document does not appear to contain valid resume information.'
    };
  }

  // 2. Score positive resume characteristics
  let resumeScore = 0;

  // Contact info (email, phone, LinkedIn, GitHub, portfolio)
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cleanText);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(cleanText);
  const hasSocial = /github\.com|linkedin\.com|portfolio/i.test(cleanText);
  if (hasEmail || hasPhone || hasSocial) resumeScore += 2;

  // Skills
  const totalSkillsCount = (parsedData.parsedSkills?.technical?.length || 0) +
    (parsedData.parsedSkills?.frameworks?.length || 0) +
    (parsedData.parsedSkills?.tools?.length || 0);
  const hasSkillsHeader = /\b(skills|technical skills|technologies|proficiencies|languages & frameworks|core competencies)\b/i.test(lower);
  if (totalSkillsCount >= 2 || hasSkillsHeader) resumeScore += 2;

  // Education
  const hasEducationHeader = /\b(education|academic background|academics|qualifications|bachelor|master|b\.tech|b\.e|m\.tech|degree|university|college|gpa|cgpa)\b/i.test(lower);
  if (hasEducationHeader) resumeScore += 2;

  // Projects
  const hasProjectsHeader = /\b(projects|academic projects|personal projects|key projects|featured projects|capstone)\b/i.test(lower);
  if (hasProjectsHeader || (parsedData.parsedProjects && parsedData.parsedProjects.length > 0)) resumeScore += 1;

  // Work experience or internships (Optional for freshers!)
  const hasExpHeader = /\b(experience|work experience|employment history|internship|internships|professional experience)\b/i.test(lower);
  if (hasExpHeader || (parsedData.parsedExperience && parsedData.parsedExperience.length > 0)) resumeScore += 1;

  // Professional summary or objective
  const hasSummaryHeader = /\b(summary|professional summary|career objective|about me|profile)\b/i.test(lower);
  if (hasSummaryHeader) resumeScore += 1;

  // Minimum threshold: 3 points across standard resume markers
  // e.g. Fresher with Education (2) + Skills (2) = 4 points (Accepted)
  // Candidate with Contact (2) + Skills (2) = 4 points (Accepted)
  // Candidate with Education (2) + Projects (1) = 3 points (Accepted)
  if (resumeScore < 3) {
    return {
      isValid: false,
      reason: 'This document does not appear to contain valid resume information.'
    };
  }

  return { isValid: true };
}

// Extract raw text based on file format
async function extractRawText(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text || '';
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    } else {
      throw new Error('Only PDF and DOCX resume files are supported.');
    }
  } catch (err) {
    console.error(`[ResumeParser] Error reading file ${filePath}:`, err.message);
    throw new Error(`Failed to extract text from file: ${err.message}`);
  }
}

// Extract skills from text
function extractSkills(text) {
  const lowerText = ` ${text.toLowerCase()} `;
  const result = {
    technical: [],
    frameworks: [],
    tools: [],
    softSkills: []
  };

  for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
    const matched = new Set();
    for (const skill of skills) {
      // Match with word boundary or punctuation boundary
      const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:^|[\\s,;:.()/-])${escaped}(?:$|[\\s,;:.()/-])`, 'i');
      if (regex.test(lowerText)) {
        matched.add(skill);
      }
    }
    result[category] = Array.from(matched);
  }

  return result;
}

// Extract education sections
function extractEducation(text) {
  const educationList = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const degreeKeywords = [
    'bachelor', 'master', 'b.tech', 'm.tech', 'b.s.', 'b.sc', 'm.s.', 'm.sc',
    'bca', 'mca', 'ph.d', 'phd', 'diploma', 'computer science', 'information technology',
    'engineering', 'high school'
  ];

  const yearRegex = /(?:19|20)\d{2}\s*(?:-|–|to)\s*(?:(?:19|20)\d{2}|present|current)/i;
  const singleYearRegex = /(?:19|20)\d{2}/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    const hasDegree = degreeKeywords.some(deg => lowerLine.includes(deg));
    if (hasDegree) {
      const yearMatch = line.match(yearRegex) || line.match(singleYearRegex) || (lines[i + 1] && lines[i + 1].match(yearRegex));
      const year = yearMatch ? yearMatch[0] : '';
      const institution = lines[i + 1] && !lines[i + 1].match(yearRegex) ? lines[i + 1] : 'University / College';

      educationList.push({
        degree: line,
        institution: institution,
        year: year,
        grade: ''
      });

      if (educationList.length >= 3) break;
    }
  }

  // Fallback if none parsed
  if (educationList.length === 0) {
    educationList.push({
      degree: 'Degree in Computer Science or Related Field',
      institution: 'University / Institute',
      year: 'Relevant Graduation Period',
      grade: ''
    });
  }

  return educationList;
}

// Extract projects
function extractProjects(text) {
  const projects = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let inProjectSection = false;
  let currentProject = null;

  const sectionStopRegex = /^(experience|work experience|professional experience|employment|skills|technical skills|key skills|technologies|education|academic background|certifications|awards|achievements|publications|declaration|interests|contact)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Check project header
    if (lower.match(/^(projects|academic projects|personal projects|key projects|featured projects)/i)) {
      inProjectSection = true;
      continue;
    }

    // Check next section header
    if (inProjectSection && (sectionStopRegex.test(lower) || lower === 'skills' || lower === 'technical skills')) {
      inProjectSection = false;
      if (currentProject) projects.push(currentProject);
      currentProject = null;
      break;
    }

    if (inProjectSection) {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\.\s/.test(line);
      const titleCandidate = line.split(/[–—\-:|]/)[0].trim();
      const hasDashOrColon = line.includes('–') || line.includes('—') || line.includes(' - ') || line.includes(':');
      const isTitleLength = titleCandidate.length >= 3 && titleCandidate.length <= 60;
      const isHeaderLike = !isBullet && isTitleLength && (hasDashOrColon || (!line.endsWith('.') && line.length < 80));

      if (isHeaderLike && !sectionStopRegex.test(titleCandidate.toLowerCase()) && !lower.includes('project description') && !lower.includes('key achievements')) {
        if (currentProject) {
          projects.push(currentProject);
        }
        currentProject = {
          title: titleCandidate,
          description: line,
          technologies: [],
          highlights: []
        };
      } else if (currentProject) {
        if (isBullet) {
          currentProject.highlights.push(line.replace(/^[•\-*\d.]\s*/, ''));
        } else {
          currentProject.description += ` ${line}`;
        }
      }
    }
  }

  if (currentProject && !projects.includes(currentProject)) {
    projects.push(currentProject);
  }

  // Detect tech inside project descriptions
  projects.forEach(p => {
    const fullText = `${p.title} ${p.description} ${p.highlights.join(' ')}`;
    const skills = extractSkills(fullText);
    p.technologies = [...new Set([...skills.technical, ...skills.frameworks, ...skills.tools])].slice(0, 6);
  });

  return projects.filter(p => p.title && !sectionStopRegex.test(p.title.toLowerCase())).slice(0, 5);
}

// Extract work experience
function extractExperience(text) {
  const experiences = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let inExpSection = false;
  let currentExp = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (lower.match(/^(work experience|professional experience|experience|employment history|internships)/i)) {
      inExpSection = true;
      continue;
    }

    if (inExpSection && lower.match(/^(education|projects|skills|certifications|extracurricular)/i)) {
      inExpSection = false;
      if (currentExp) experiences.push(currentExp);
      break;
    }

    if (inExpSection) {
      const yearRegex = /(?:19|20)\d{2}\s*(?:-|–|to)\s*(?:(?:19|20)\d{2}|present|current)/i;
      if (line.match(yearRegex) || (line.length < 60 && !line.startsWith('•') && !line.startsWith('-') && !currentExp)) {
        if (currentExp) experiences.push(currentExp);
        currentExp = {
          role: line.replace(yearRegex, '').trim() || 'Software Engineer',
          company: lines[i + 1] && !lines[i + 1].startsWith('•') ? lines[i + 1] : 'Tech Company',
          duration: (line.match(yearRegex) || [''])[0],
          highlights: []
        };
      } else if (currentExp) {
        if (line.startsWith('•') || line.startsWith('-')) {
          currentExp.highlights.push(line.replace(/^[•\-]\s*/, ''));
        }
      }
    }
  }

  if (currentExp && !experiences.includes(currentExp)) {
    experiences.push(currentExp);
  }

  return experiences.slice(0, 4);
}

// Extract top keywords
function extractKeywords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9#+.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);

  const stopWords = new Set([
    'with', 'from', 'have', 'this', 'that', 'your', 'about', 'work', 'using',
    'been', 'were', 'also', 'will', 'into', 'some', 'than', 'them', 'these',
    'their', 'time', 'more', 'over', 'such', 'only', 'user', 'system'
  ]);

  const freq = {};
  words.forEach(w => {
    if (!stopWords.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(entry => entry[0]);
}

// Main parser function
async function parseResumeFile(filePath, mimeType) {
  const extractedText = await extractRawText(filePath, mimeType);
  const parsedSkills = extractSkills(extractedText);
  const parsedEducation = extractEducation(extractedText);
  const parsedProjects = extractProjects(extractedText);
  const parsedExperience = extractExperience(extractedText);
  const keywords = extractKeywords(extractedText);

  // Generate concise summary
  const allTechSkills = [...parsedSkills.technical, ...parsedSkills.frameworks].slice(0, 5).join(', ');
  const summary = `Software candidate with proficiency in ${allTechSkills || 'core computer science fundamentals'}. Demonstrated hands-on project and academic background with ${parsedSkills.tools.slice(0, 4).join(', ') || 'modern developer tools'}.`;

  return {
    extractedText,
    parsedSkills,
    parsedEducation,
    parsedProjects,
    parsedExperience,
    keywords,
    summary
  };
}

module.exports = {
  extractRawText,
  parseResumeFile,
  extractSkills,
  verifyMagicBytes,
  validateResumeContent
};

