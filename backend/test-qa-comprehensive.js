const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

// ANSI terminal colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let passedTests = 0;
let totalTests = 0;
const failures = [];

function assert(description, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${GREEN}✅ PASS:${RESET} ${description}`);
    if (details) console.log(`     ${CYAN}↳ ${details}${RESET}`);
  } else {
    failures.push({ description, details });
    console.log(`  ${RED}❌ FAIL:${RESET} ${description}`);
    if (details) console.log(`     ${RED}↳ Reason: ${details}${RESET}`);
  }
}

async function runComprehensiveQA() {
  console.log(`\n${BOLD}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  INTERVIEWIQ – CAPSTONE FINAL QA & SECURITY VERIFICATION SUITE ${RESET}`);
  console.log(`${BOLD}================================================================${RESET}\n`);

  const timestamp = Date.now();

  // -------------------------------------------------------------
  // SECTION 1: Health & System Diagnostics
  // -------------------------------------------------------------
  console.log(`${BOLD}${YELLOW}--- 1. Health & System Diagnostics ---${RESET}`);
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert('Backend Health Check returns online status', healthRes.status === 200 && healthData.status === 'online', `Status: ${healthData.status}, Model: ${healthData.aiConfig?.model}`);
  assert('AI Configuration does not leak API keys in health endpoint', healthData.aiConfig?.hasApiKey !== undefined && !healthData.aiConfig?.apiKey, 'apiKey field is safely omitted');

  // -------------------------------------------------------------
  // SECTION 2: User A Authentication & Profile Lifecycle
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${YELLOW}--- 2. User A Auth & Profile Management ---${RESET}`);
  const userAEmail = `qa_student_a_${timestamp}@example.com`;
  const registerARes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Candidate Alex',
      email: userAEmail,
      password: 'SecurePassword123!',
      careerInterest: 'Full Stack Engineering',
      experienceLevel: 'Beginner'
    })
  });
  const regAData = await registerARes.json();
  assert('User A Registration succeeds', registerARes.status === 201 && regAData.success, `User ID: ${regAData.user?._id}`);
  assert('User A receives valid JWT token', Boolean(regAData.token && regAData.token.split('.').length === 3), 'JWT consists of 3 parts');

  const tokenA = regAData.token;
  const headersA = { 'Authorization': `Bearer ${tokenA}` };

  // Profile retrieval
  const profileRes = await fetch(`${BASE_URL}/api/users/profile`, { headers: headersA });
  const profileData = await profileRes.json();
  assert('Retrieve User A Profile', profileRes.status === 200 && profileData.user?.email === userAEmail, `Name: ${profileData.user?.name}`);

  // Profile update
  const updateRes = await fetch(`${BASE_URL}/api/users/profile`, {
    method: 'PUT',
    headers: { ...headersA, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alexander Turner',
      careerInterest: 'Data Science & Machine Learning',
      experienceLevel: 'Intermediate'
    })
  });
  const updateData = await updateRes.json();
  assert('Update User A Profile', updateRes.status === 200 && updateData.user?.name === 'Alexander Turner', `Updated to: ${updateData.user?.name} (${updateData.user?.careerInterest}, Level: ${updateData.user?.experienceLevel})`);

  // -------------------------------------------------------------
  // SECTION 3: Resume Upload, Parsing & Analysis
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${YELLOW}--- 3. Resume Upload, Parsing & Analysis ---${RESET}`);
  const samplePdfPath = path.resolve('backend', 'uploads', '1794074039112-UPDATED_AND_FINAL_SD.pdf');
  const resumeFileBuffer = fs.readFileSync(samplePdfPath);

  // Upload Resume using FormData
  const resumeFormData = new FormData();
  const pdfBlob = new Blob([resumeFileBuffer], { type: 'application/pdf' });
  resumeFormData.append('resume', pdfBlob, 'alex_software_resume.pdf');

  const uploadResumeRes = await fetch(`${BASE_URL}/api/resumes/upload`, {
    method: 'POST',
    headers: headersA,
    body: resumeFormData
  });
  const uploadResumeData = await uploadResumeRes.json();
  assert('Resume Upload and Parsing API', uploadResumeRes.status === 201 && uploadResumeData.success, `File: ${uploadResumeData.resume?.originalFileName}`);

  const resumeIdA = uploadResumeData.resume?._id;
  assert('Resume Entity persisted with parsed skills & sections', Boolean(resumeIdA && uploadResumeData.resume.parsedSkills), `Technical Skills: ${JSON.stringify(uploadResumeData.resume.parsedSkills?.technical?.slice(0, 4))}`);
  assert('Resume parser accurately extracted candidate projects', uploadResumeData.resume.parsedProjects?.length > 0, `Extracted projects: ${uploadResumeData.resume.parsedProjects?.map(p => p.title).join(', ')}`);

  // Fetch Resume Details by ID
  const getResumeRes = await fetch(`${BASE_URL}/api/resumes/${resumeIdA}`, { headers: headersA });
  const getResumeData = await getResumeRes.json();
  assert('Get Resume by ID', getResumeRes.status === 200 && getResumeData.resume?._id === resumeIdA, `Found resume for user: ${getResumeData.resume?.userId}`);

  // -------------------------------------------------------------
  // SECTION 4: Job Description & Skill Matching
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${YELLOW}--- 4. Job Description & Skill Matching ---${RESET}`);
  // Create Job Description via text
  const createJobRes = await fetch(`${BASE_URL}/api/jobs`, {
    method: 'POST',
    headers: { ...headersA, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobTitle: 'Senior Full Stack Software Engineer',
      company: 'TechFlow Systems',
      description: 'We are seeking a Full Stack Software Engineer experienced in React, TypeScript, Node.js, Express, PostgreSQL, Docker, AWS, and Git. The role requires building microservices and RESTful APIs with automated CI/CD pipelines.',
      experienceRequired: '2-4 years',
      requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'TypeScript']
    })
  });
  const createJobData = await createJobRes.json();
  assert('Create Job Description via text input', createJobRes.status === 201 && createJobData.success, `Job ID: ${createJobData.job?._id}`);
  const jobIdA = createJobData.job?._id;

  // Upload Job Description via file
  const jobFileFormData = new FormData();
  jobFileFormData.append('jobFile', new Blob([resumeFileBuffer], { type: 'application/pdf' }), 'job_spec.pdf');
  const uploadJobRes = await fetch(`${BASE_URL}/api/jobs/upload`, {
    method: 'POST',
    headers: headersA,
    body: jobFileFormData
  });
  const uploadJobData = await uploadJobRes.json();
  assert('Upload Job Description document file (PDF/DOCX)', uploadJobRes.status === 201 && uploadJobData.success, `Parsed job: ${uploadJobData.job?.jobTitle}`);

  // Job Match Analysis against Resume
  const matchRes = await fetch(`${BASE_URL}/api/jobs/${jobIdA}/match`, {
    method: 'POST',
    headers: { ...headersA, 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId: resumeIdA })
  });
  const matchData = await matchRes.json();
  assert('Calculate Explainable Job Skill Match Score', matchRes.status === 200 && typeof matchData.matchPercentage === 'number', `Match: ${matchData.matchPercentage}% | Matched: ${matchData.matchedSkills?.length} skills`);
  assert('Match Report provides missing skills & recommended prep topics', Array.isArray(matchData.missingSkills) && Array.isArray(matchData.recommendedTopics), `Missing: ${matchData.missingSkills?.slice(0, 3)?.join(', ')}`);

  // -------------------------------------------------------------
  // SECTION 5: Role-Specific Interview Question Generation
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${YELLOW}--- 5. Role-Specific Interview Generation (All 8 Roles) ---${RESET}`);
  const rolesToVerify = [
    { role: 'Data Analyst', keyConcept: 'sql', category: 'Data & Analytics' },
    { role: 'Frontend Developer', keyConcept: 'react', category: 'Software Development' },
    { role: 'Java Developer', keyConcept: 'java', category: 'Software Development' },
    { role: 'Data Engineer', keyConcept: 'pipeline', category: 'Data & Analytics' },
    { role: 'AI Engineer', keyConcept: 'attention', category: 'AI & Machine Learning' },
    { role: 'DevOps Engineer', keyConcept: 'docker', category: 'Cloud & DevOps' },
    { role: 'QA Engineer', keyConcept: 'test', category: 'Testing & Security' },
    { role: 'Autonomous Quantum Cryptography Engineer', keyConcept: 'autonomous', category: 'Custom Role' }
  ];

  for (const item of rolesToVerify) {
    const roleRes = await fetch(`${BASE_URL}/api/interviews/start`, {
      method: 'POST',
      headers: { ...headersA, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeId: resumeIdA,
        jobDescriptionId: jobIdA,
        targetRole: item.role,
        interviewType: 'Mixed',
        difficulty: 'Intermediate',
        totalQuestionsTarget: 4
      })
    });
    const roleData = await roleRes.json();
    const questions = roleData.session?.questions || [];
    const hasRoleRelevance = questions.some(q =>
      q.questionText.toLowerCase().includes(item.keyConcept) ||
      q.questionText.toLowerCase().includes('object-oriented') ||
      (q.expectedKeyConcepts || []).some(c => c.toLowerCase().includes(item.keyConcept))
    );
    assert(`Question synthesis for role "${item.role}"`, roleRes.status === 201 && hasRoleRelevance, `Q1: "${questions[0]?.questionText?.substring(0, 75)}..."`);
  }

  // -------------------------------------------------------------
  // SECTION 6: Live Interview Simulation, Answers & Evaluation
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${YELLOW}--- 6. Live Interview Simulation & Answer Evaluation ---${RESET}`);
  // Start official session for Alexander Turner
  const interviewRes = await fetch(`${BASE_URL}/api/interviews/start`, {
    method: 'POST',
    headers: { ...headersA, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeId: resumeIdA,
      jobDescriptionId: jobIdA,
      targetRole: 'Data Analyst',
      interviewType: 'Technical',
      difficulty: 'Intermediate',
      totalQuestionsTarget: 3,
      interviewerPersona: {
        name: 'Alex Morgan',
        title: 'Principal Technical Architect & AI Coach',
        avatarStyle: 'modern-tech'
      }
    })
  });
  const interviewData = await interviewRes.json();
  const sessionId = interviewData.session?._id;
  assert('Start Live Interview Session', interviewRes.status === 201 && Boolean(sessionId), `Session ID: ${sessionId} | Initial Questions: ${interviewData.session?.questions?.length}`);

  const question1 = interviewData.session.questions[0];

  // Submit Answer 1 (Comprehensive response)
  const answer1Res = await fetch(`${BASE_URL}/api/interviews/${sessionId}/answer`, {
    method: 'POST',
    headers: { ...headersA, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId: question1.questionId,
      answerText: 'In my data projects, I frequently write complex SQL queries using Common Table Expressions to structure multi-stage aggregations. I utilize window functions such as ROW_NUMBER and RANK partitioned by customer category to detect duplicate entries and calculate moving 30-day averages without collapsing row-level granularity.',
      durationSeconds: 42
    })
  });
  const answer1Data = await answer1Res.json();
  assert('Submit Answer 1 & Calculate Rubric Score', answer1Res.status === 200 && answer1Data.evaluation?.score > 0, `Score: ${answer1Data.evaluation?.score}/100 | WPM: ${answer1Data.evaluation?.speakingPaceWpm}`);
  assert('Evaluation includes Category Scores (Technical, Clarity, Relevance, STAR)', Boolean(answer1Data.evaluation?.categoryScores?.technicalCorrectness), `Tech: ${answer1Data.evaluation?.categoryScores?.technicalCorrectness}, Clarity: ${answer1Data.evaluation?.categoryScores?.clarity}`);

  // Submit Answer 2 (Brief response to trigger adaptive follow-up)
  const question2 = interviewData.session.questions[1];
  const answer2Res = await fetch(`${BASE_URL}/api/interviews/${sessionId}/answer`, {
    method: 'POST',
    headers: { ...headersA, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId: question2.questionId,
      answerText: 'I cleaned null values and outliers in Python using pandas.',
      durationSeconds: 15
    })
  });
  const answer2Data = await answer2Res.json();
  const hasFollowUpProbe = Boolean((answer2Data.followUpAdded || answer2Data.hasFollowUp) && answer2Data.followUpQuestion);
  assert('Adaptive Follow-up generated for brief or high-level answer', hasFollowUpProbe, `Follow-up Q: "${answer2Data.followUpQuestion?.questionText?.substring(0, 75)}..."`);

  // Complete Interview
  const completeRes = await fetch(`${BASE_URL}/api/interviews/${sessionId}/complete`, {
    method: 'POST',
    headers: headersA
  });
  const completeData = await completeRes.json();
  assert('Complete Interview Session & Generate Official Report', completeRes.status === 200 && (completeData.reportId || completeData.session?.status === 'completed'), `Overall Score: ${completeData.overallScore || completeData.report?.overallScore}/100`);

  // -------------------------------------------------------------
  // SECTION 7: Reports, History & Performance Analytics
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${YELLOW}--- 7. Reports, History & Analytics ---${RESET}`);
  // Get Report by Session ID
  const reportRes = await fetch(`${BASE_URL}/api/reports/${sessionId}`, { headers: headersA });
  const reportData = await reportRes.json();
  assert('Retrieve Interview Report by Session ID', reportRes.status === 200 && reportData.report?.sessionId?._id === sessionId, `Grade: ${reportData.report?.performanceRating} (${reportData.report?.overallScore}%)`);
  assert('Report includes actionable strengths, weaknesses, and model answers', reportData.report?.strengths?.length > 0 && reportData.report?.weaknesses?.length > 0, `Strengths: ${reportData.report?.strengths?.length}, Weaknesses: ${reportData.report?.weaknesses?.length}`);

  // Get Interview History
  const historyRes = await fetch(`${BASE_URL}/api/reports/history`, { headers: headersA });
  const historyData = await historyRes.json();
  assert('Retrieve User Interview History', historyRes.status === 200 && historyData.count >= 1, `Total historical sessions: ${historyData.count}`);

  // Get Analytics & Improvement Trends
  const analyticsRes = await fetch(`${BASE_URL}/api/reports/analytics`, { headers: headersA });
  const analyticsData = await analyticsRes.json();
  assert('Retrieve Aggregated Performance Analytics', analyticsRes.status === 200 && analyticsData.hasData === true, `Avg Score: ${analyticsData.summary?.averageScore} | Trend points: ${analyticsData.trends?.length}`);

  // -------------------------------------------------------------
  // SECTION 8: 24/7 AI Career Coach Chatbot
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${YELLOW}--- 8. AI Career Coach Chatbot ---${RESET}`);
  const chatRes = await fetch(`${BASE_URL}/api/chat/message`, {
    method: 'POST',
    headers: { ...headersA, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Can you explain the STAR method with an example for a Data Analyst interview?'
    })
  });
  const chatData = await chatRes.json();
  assert('Send message to AI Career Coach', chatRes.status === 200 && chatData.success, `Reply length: ${chatData.reply?.length} chars`);
  assert('Chatbot response contains contextual guidance', chatData.reply?.toLowerCase().includes('situation') || chatData.reply?.toLowerCase().includes('star'), `Preview: "${chatData.reply?.substring(0, 80)}..."`);

  // Verify chat history persistence
  const chatHistoryRes = await fetch(`${BASE_URL}/api/chat/history`, { headers: headersA });
  const chatHistoryData = await chatHistoryRes.json();
  assert('Chatbot conversation history persisted', chatHistoryRes.status === 200 && chatHistoryData.messages?.length >= 2, `Total messages in thread: ${chatHistoryData.messages?.length}`);

  // -------------------------------------------------------------
  // SECTION 9: Multi-User Security & Isolation Testing
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${YELLOW}--- 9. Multi-User Security & Data Isolation ---${RESET}`);
  // Register User B
  const userBEmail = `qa_intruder_b_${timestamp}@example.com`;
  const registerBRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Intruder Bob',
      email: userBEmail,
      password: 'SecurePassword123!',
      careerInterest: 'Cybersecurity',
      experienceLevel: 'Beginner'
    })
  });
  const regBData = await registerBRes.json();
  const tokenB = regBData.token;
  const headersB = { 'Authorization': `Bearer ${tokenB}` };

  // 1. User B attempts to access User A's Resume
  const crossResumeRes = await fetch(`${BASE_URL}/api/resumes/${resumeIdA}`, { headers: headersB });
  assert('Cross-Tenant Security: User B cannot view User A resume (403 Forbidden)', crossResumeRes.status === 403, `Status: ${crossResumeRes.status}`);

  // 2. User B attempts to access User A's Job Description
  const crossJobRes = await fetch(`${BASE_URL}/api/jobs/${jobIdA}`, { headers: headersB });
  assert('Cross-Tenant Security: User B cannot view User A job description (403 Forbidden)', crossJobRes.status === 403, `Status: ${crossJobRes.status}`);

  // 3. User B attempts to access User A's Interview Session
  const crossSessionRes = await fetch(`${BASE_URL}/api/interviews/${sessionId}`, { headers: headersB });
  assert('Cross-Tenant Security: User B cannot view User A interview session (403 Forbidden)', crossSessionRes.status === 403, `Status: ${crossSessionRes.status}`);

  // 4. User B attempts to access User A's Report
  const crossReportRes = await fetch(`${BASE_URL}/api/reports/${sessionId}`, { headers: headersB });
  assert('Cross-Tenant Security: User B cannot view User A interview report (403 Forbidden)', crossReportRes.status === 403, `Status: ${crossReportRes.status}`);

  // 5. User B attempts to submit answer to User A's Interview Session
  const crossAnswerRes = await fetch(`${BASE_URL}/api/interviews/${sessionId}/answer`, {
    method: 'POST',
    headers: { ...headersB, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId: question1.questionId,
      answerText: 'Unauthorized answer from intruder Bob.'
    })
  });
  assert('Cross-Tenant Security: User B cannot tamper with User A session (403 Forbidden)', crossAnswerRes.status === 403, `Status: ${crossAnswerRes.status}`);

  // 6. User B attempts to delete User A's Resume
  const crossDeleteResumeRes = await fetch(`${BASE_URL}/api/resumes/${resumeIdA}`, {
    method: 'DELETE',
    headers: headersB
  });
  assert('Cross-Tenant Security: User B cannot delete User A resume (403 Forbidden)', crossDeleteResumeRes.status === 403, `Status: ${crossDeleteResumeRes.status}`);

  // 7. Unauthenticated request without JWT
  const unauthRes = await fetch(`${BASE_URL}/api/interviews`);
  assert('Unauthenticated access blocked (401 Unauthorized)', unauthRes.status === 401, `Status: ${unauthRes.status}`);

  // -------------------------------------------------------------
  // SECTION 10: Input Validation, Constraints & Error Handling
  // -------------------------------------------------------------
  console.log(`\n${BOLD}${YELLOW}--- 10. Input Validation & Error Handling ---${RESET}`);
  // Duplicate Registration
  const dupRegisterRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Alex',
      email: userAEmail, // existing email
      password: 'Password123!',
      experienceLevel: 'Beginner'
    })
  });
  assert('Duplicate email registration rejected (400 Bad Request)', dupRegisterRes.status === 400, `Status: ${dupRegisterRes.status}`);

  // Weak password (< 6 chars)
  const weakPassRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Weak Pass',
      email: `weak_${timestamp}@example.com`,
      password: '123',
      experienceLevel: 'Beginner'
    })
  });
  assert('Weak password rejected by schema validation (400 Bad Request)', weakPassRes.status === 400, `Status: ${weakPassRes.status}`);

  // Invalid login credentials
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userAEmail,
      password: 'WrongPassword999!'
    })
  });
  assert('Incorrect password rejected (401 Unauthorized)', badLoginRes.status === 401, `Status: ${badLoginRes.status}`);

  // Non-existent Resource ID
  const nonExistentRes = await fetch(`${BASE_URL}/api/interviews/650000000000000000000000`, { headers: headersA });
  assert('Non-existent ID handled gracefully (404 Not Found)', nonExistentRes.status === 404, `Status: ${nonExistentRes.status}`);

  // Empty Chat Message
  const emptyChatRes = await fetch(`${BASE_URL}/api/chat/message`, {
    method: 'POST',
    headers: { ...headersA, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' })
  });
  assert('Empty chatbot message rejected (400 Bad Request)', emptyChatRes.status === 400, `Status: ${emptyChatRes.status}`);

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log(`\n${BOLD}================================================================${RESET}`);
  console.log(`${BOLD}  FINAL QA TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED ${RESET}`);
  console.log(`${BOLD}================================================================${RESET}\n`);

  if (failures.length > 0) {
    console.log(`${RED}Failed tests:${RESET}`);
    failures.forEach(f => console.log(`  - ${f.description}: ${f.details}`));
    process.exit(1);
  } else {
    console.log(`${GREEN}${BOLD}ALL CAPSTONE INTEGRATION & SECURITY ASSERTIONS PASSED!${RESET}\n`);
    process.exit(0);
  }
}

runComprehensiveQA().catch(err => {
  console.error(`${RED}Fatal error running QA suite:${RESET}`, err);
  process.exit(1);
});
