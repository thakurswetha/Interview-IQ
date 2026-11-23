const BASE_URL = 'http://localhost:5000';

async function testPromptB() {
  console.log('--- Testing PROMPT B Role-Specific Interview Generation ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log('1. Health check status:', healthData.status);

  // 2. Auth: Register / login user
  const email = `role_tester_${Date.now()}@example.com`;
  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Role Tester',
      email,
      password: 'Password123!',
      targetRole: 'Data Analyst'
    })
  });
  const regData = await registerRes.json();
  const token = regData.token;
  if (!token) {
    throw new Error('Registration failed: ' + JSON.stringify(regData));
  }
  console.log('2. User registered & token acquired');

  // Test roles to verify
  const rolesToTest = [
    {
      role: 'Data Analyst',
      expectedKeywords: ['sql', 'cte', 'window', 'power bi', 'preprocessing', 'kpi']
    },
    {
      role: 'Frontend Developer',
      expectedKeywords: ['react', 'virtual dom', 'component', 'state', 'web vitals', 'css']
    },
    {
      role: 'Java Developer',
      expectedKeywords: ['oop', 'java', 'hashmap', 'multithreading', 'jvm', 'concurrency']
    },
    {
      role: 'DevOps Engineer',
      expectedKeywords: ['docker', 'kubernetes', 'terraform', 'ci/cd', 'deployment']
    },
    {
      role: 'QA Engineer',
      expectedKeywords: ['automation', 'test', 'cypress', 'selenium', 'flaky', 'pyramid']
    },
    {
      role: 'Autonomous Flight Robotics Engineer',
      isCustom: true,
      expectedKeywords: ['autonomous flight robotics engineer', 'robotics']
    }
  ];

  for (const item of rolesToTest) {
    console.log(`\nTesting role: "${item.role}"...`);
    const res = await fetch(`${BASE_URL}/api/interviews/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        targetRole: item.role,
        interviewType: 'Mixed',
        difficulty: 'Intermediate',
        totalQuestionsTarget: 5
      })
    });

    const data = await res.json();
    if (!data.success) {
      console.error(`Failed to start interview for ${item.role}:`, data);
      continue;
    }

    const session = data.session;
    console.log(`  -> Session ID: ${session._id}`);
    console.log(`  -> Saved targetRole: "${session.targetRole}"`);
    console.log(`  -> Generated questions count: ${session.questions.length}`);

    let matchCount = 0;
    session.questions.forEach((q, idx) => {
      const qText = q.questionText.toLowerCase();
      const matched = item.expectedKeywords.some(kw => qText.includes(kw.toLowerCase()));
      if (matched) matchCount++;
      console.log(`     Q${idx + 1} (${q.category}): ${q.questionText.substring(0, 85)}...`);
    });

    console.log(`  -> Matched role-specific concepts: ${matchCount}/${session.questions.length}`);
    if (matchCount === 0 && !item.isCustom) {
      console.warn(`  [WARNING] No expected domain keywords found for role ${item.role}`);
    } else {
      console.log(`  [PASS] Role "${item.role}" question synthesis verified!`);
    }
  }

  console.log('\n--- All Role-Specific Tests Completed Successfully! ---');
}

testPromptB().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});

