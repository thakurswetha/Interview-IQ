const http = require('http');
const fs = require('fs');
const path = require('path');
const { app, startServer } = require('./server');

// Helper for making HTTP requests to local app
function request(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const port = address.port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: { ...(options.headers || {}) }
    };

    let postData = null;
    if (body) {
      if (typeof body === 'object' && !(body instanceof Buffer)) {
        postData = JSON.stringify(body);
        reqOptions.headers['Content-Type'] = 'application/json';
        reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
      } else {
        postData = body;
      }
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (_) {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.setTimeout(8000, () => {
      req.destroy(new Error(`HTTP request timed out: ${reqOptions.method} ${reqOptions.path}`));
    });

    req.on('error', (err) => {
      console.error(`[HTTP Error] ${reqOptions.method} ${reqOptions.path}:`, err.message);
      reject(err);
    });

    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Starting InterviewIQ Backend End-to-End Test Suite...\n');
  const server = await startServer(5002);

  let authToken = '';
  let userId = '';
  let resumeId = '';
  let jobId = '';
  let sessionId = '';
  let currentQuestionId = '';

  const results = [];
  function assert(testName, condition, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      results.push({ name: testName, pass: true });
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail}`);
      results.push({ name: testName, pass: false, detail });
    }
  }

  try {
    // 1. Health Check
    const health = await request(server, { path: '/api/health', method: 'GET' });
    assert('Health Check Endpoint', health.status === 200 && health.data.status === 'online', JSON.stringify(health.data));

    // 2. User Registration
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await request(server, { path: '/api/auth/register', method: 'POST' }, {
      name: 'Jane Doe',
      email: testEmail,
      password: 'Password123!',
      education: 'B.Tech in Computer Science',
      careerInterest: 'Full Stack Engineer',
      experienceLevel: 'Intermediate'
    });
    assert('User Registration', regRes.status === 201 && regRes.data.success && regRes.data.token, JSON.stringify(regRes.data));
    authToken = regRes.data.token;
    userId = regRes.data.user?._id;

    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // 3. User Login
    const loginRes = await request(server, { path: '/api/auth/login', method: 'POST' }, {
      email: testEmail,
      password: 'Password123!'
    });
    assert('User Login', loginRes.status === 200 && loginRes.data.token, JSON.stringify(loginRes.data));

    // 4. Get Current User Profile (Me)
    const meRes = await request(server, { path: '/api/auth/me', method: 'GET', headers: authHeaders });
    assert('Get Authenticated Profile', meRes.status === 200 && meRes.data.user.name === 'Jane Doe', JSON.stringify(meRes.data));

    // 4b. Forgot Password & Reset Password Flow
    const forgotRes = await request(server, { path: '/api/auth/forgot-password', method: 'POST' }, { email: testEmail });
    assert('Forgot Password Token Generation', forgotRes.status === 200 && forgotRes.data.demoResetToken, JSON.stringify(forgotRes.data));
    const resetRes = await request(server, { path: `/api/auth/reset-password/${forgotRes.data.demoResetToken}`, method: 'POST' }, {
      password: 'NewSecurePassword456!'
    });
    assert('Reset Password Flow with Token', resetRes.status === 200 && resetRes.data.token, JSON.stringify(resetRes.data));
    // Update authToken with newly issued token
    authToken = resetRes.data.token;
    authHeaders.Authorization = `Bearer ${authToken}`;

    // 5. Update Profile
    const updateRes = await request(server, { path: '/api/users/profile', method: 'PUT', headers: authHeaders }, {
      bio: 'Aspiring Full Stack Cloud Engineer with passion for React and Node.js.',
      targetIndustry: 'Enterprise SaaS'
    });
    assert('Update Profile Details', updateRes.status === 200 && updateRes.data.user.bio.includes('Aspiring'), JSON.stringify(updateRes.data));

    // 6. Create / Save Resume (Direct parsing simulation)
    const Resume = require('./models/Resume');
    const dummyResume = await Resume.create({
      userId,
      originalFileName: 'Jane_Doe_Resume.pdf',
      filePath: path.join(__dirname, 'uploads', 'sample_resume.pdf'),
      fileSize: 10240,
      mimeType: 'application/pdf',
      extractedText: 'Jane Doe. Full Stack Engineer. Skills: JavaScript, TypeScript, React, Node.js, Express, SQL, PostgreSQL, MongoDB, Docker, Git. Education: B.Tech in Computer Science 2020-2024. Experience: Software Engineer Intern at Tech Corp. Built REST APIs and React dashboards.',
      summary: 'Experienced Full Stack Engineer with proficiency in React, Node.js, and SQL.',
      parsedSkills: {
        technical: ['JavaScript', 'TypeScript', 'SQL'],
        frameworks: ['React', 'Node.js', 'Express'],
        tools: ['PostgreSQL', 'MongoDB', 'Docker', 'Git'],
        softSkills: ['Communication', 'Problem Solving']
      },
      parsedEducation: [{ degree: 'B.Tech in Computer Science', institution: 'Tech University', year: '2020-2024' }],
      parsedProjects: [{ title: 'Cloud Interview Platform', description: 'Real-time AI mock interview system using React and Node.js.', technologies: ['React', 'Node.js', 'MongoDB'] }],
      parsedExperience: [{ role: 'Software Engineer Intern', company: 'Tech Corp', duration: '2023', highlights: ['Built REST APIs'] }],
      keywords: ['react', 'node.js', 'mongodb', 'docker', 'typescript'],
      isPrimary: true
    });
    resumeId = dummyResume._id.toString();
    assert('Resume Persistence and Model Mapping', Boolean(resumeId), 'Resume ID not found');

    // 7. Get Resumes List
    const resumesList = await request(server, { path: '/api/resumes', method: 'GET', headers: authHeaders });
    assert('Get Resumes List', resumesList.status === 200 && resumesList.data.count >= 1, JSON.stringify(resumesList.data));

    // 8. Create Job Description
    const jobRes = await request(server, { path: '/api/jobs', method: 'POST', headers: authHeaders }, {
      jobTitle: 'Senior Full Stack Developer',
      company: 'InnovateTech Solutions',
      description: 'We are seeking a Senior Full Stack Developer skilled in React, Node.js, TypeScript, PostgreSQL, Docker, AWS, and Microservices. Candidates must have experience designing scalable REST APIs and responsive web interfaces.',
      experienceRequired: '2-4 years'
    });
    assert('Create Job Description', jobRes.status === 201 && jobRes.data.job?._id, JSON.stringify(jobRes.data));
    jobId = jobRes.data.job._id;

    // 9. Match Job Description Against Resume
    const matchRes = await request(server, { path: `/api/jobs/${jobId}/match`, method: 'POST', headers: authHeaders }, {
      resumeId
    });
    assert('Job Skill Match Analysis', matchRes.status === 200 && matchRes.data.matchPercentage > 0 && matchRes.data.matchedSkills.length > 0, JSON.stringify(matchRes.data));
    console.log(`    ℹ️ Job Match Score: ${matchRes.data.matchPercentage}% | Matched: ${matchRes.data.matchedSkills.join(', ')}`);

    // 10. Start Interview Session
    const startRes = await request(server, { path: '/api/interviews/start', method: 'POST', headers: authHeaders }, {
      resumeId,
      jobDescriptionId: jobId,
      interviewType: 'Technical',
      difficulty: 'Intermediate',
      totalQuestionsTarget: 3,
      interviewerPersona: {
        name: 'Alex Morgan',
        title: 'Principal Technical Architect'
      }
    });
    assert('Start Interview Session', startRes.status === 201 && startRes.data.session?.questions?.length >= 3, JSON.stringify(startRes.data));
    sessionId = startRes.data.session._id;
    currentQuestionId = startRes.data.session.questions[0].questionId;
    console.log(`    ℹ️ Generated Question 1: "${startRes.data.session.questions[0].questionText}"`);

    // 11. Submit Answer with Communication and Rubric Evaluation
    const ansRes = await request(server, { path: `/api/interviews/${sessionId}/answer`, method: 'POST', headers: authHeaders }, {
      questionId: currentQuestionId,
      answerText: 'In our application we used React for component state and Node.js with Express for REST endpoints. For PostgreSQL we utilized connection pooling and B-tree indexes on foreign keys to eliminate full table scans. We also used Docker for local container testing and Git for version control.',
      durationSeconds: 42
    });
    assert('Submit Answer & AI Rubric Evaluation', ansRes.status === 200 && ansRes.data.evaluation?.score > 0, JSON.stringify(ansRes.data.evaluation));
    console.log(`    ℹ️ Evaluated Answer Score: ${ansRes.data.evaluation?.score}/100 | WPM: ${ansRes.data.evaluation?.communicationIndicators?.speakingPaceWpm}`);

    // 12. Submit Remaining Answers to Complete Interview
    const nextQ = ansRes.data.nextQuestion;
    if (nextQ) {
      await request(server, { path: `/api/interviews/${sessionId}/answer`, method: 'POST', headers: authHeaders }, {
        questionId: nextQ.questionId,
        answerText: 'To handle concurrency and fault tolerance we implemented rate-limiting middleware, idempotent POST endpoints with UUID keys, and circuit breakers with centralized error handling.',
        durationSeconds: 38
      });
    }

    // 13. Complete Interview & Synthesize Performance Report
    const compRes = await request(server, { path: `/api/interviews/${sessionId}/complete`, method: 'POST', headers: authHeaders });
    assert('Complete Interview & Generate Report', compRes.status === 200 && compRes.data.reportId, JSON.stringify(compRes.data));

    // 14. Get Interview Report by Session ID
    const reportRes = await request(server, { path: `/api/reports/${sessionId}`, method: 'GET', headers: authHeaders });
    assert('Get Interview Performance Report', reportRes.status === 200 && reportRes.data.report?.overallScore > 0, JSON.stringify(reportRes.data));

    // 15. Get Interview History
    const historyRes = await request(server, { path: '/api/reports/history', method: 'GET', headers: authHeaders });
    assert('Get User Interview History', historyRes.status === 200 && historyRes.data.count >= 1, JSON.stringify(historyRes.data));

    // 16. Get Analytics & Improvement Trends
    const analyticsRes = await request(server, { path: '/api/reports/analytics', method: 'GET', headers: authHeaders });
    assert('Get Aggregate Analytics', analyticsRes.status === 200 && analyticsRes.data.hasData, JSON.stringify(analyticsRes.data.summary));

    // 17. Chatbot Interaction
    const chatRes = await request(server, { path: '/api/chat/message', method: 'POST', headers: authHeaders }, {
      message: 'Can you give me 3 tips to improve my STAR framework answers for behavioral interviews?'
    });
    assert('Chatbot Coach Assistant', chatRes.status === 200 && chatRes.data.reply && chatRes.data.reply.length > 20, JSON.stringify(chatRes.data));

    // Summary
    const totalPassed = results.filter(r => r.pass).length;
    console.log(`\n====================================================`);
    console.log(`📊 Test Summary: ${totalPassed} / ${results.length} tests passed!`);
    console.log(`====================================================\n`);

    server.close();
    process.exit(totalPassed === results.length ? 0 : 1);
  } catch (err) {
    console.error('💥 Test Suite Exception:', err);
    server.close();
    process.exit(1);
  }
}

runTests();
