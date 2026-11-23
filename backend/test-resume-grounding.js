const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { app, startServer } = require('./server');

// Helper to create a genuine minimal PDF with exact XREF table calculation
function createExactPdf(lines) {
  const wrappedLines = [];
  lines.forEach(l => {
    let line = l;
    while (line.length > 50) {
      let cut = line.lastIndexOf(' ', 50);
      if (cut === -1) cut = 50;
      wrappedLines.push(line.substring(0, cut).trim());
      line = line.substring(cut).trim();
    }
    if (line.length > 0) wrappedLines.push(line);
  });

  let streamContent = 'BT /F1 10 Tf 40 750 Td 14 TL ';
  wrappedLines.forEach((l, i) => {
    const escaped = l.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    if (i > 0) streamContent += 'T* ';
    streamContent += `(${escaped}) Tj `;
  });
  streamContent += 'ET';

  const o1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const o2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const o3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  const o4 = `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  const o5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  const header = '%PDF-1.4\n';
  const off1 = header.length;
  const off2 = off1 + o1.length;
  const off3 = off2 + o2.length;
  const off4 = off3 + o3.length;
  const off5 = off4 + o4.length;
  const xrefOffset = off5 + o5.length;

  const pad = (n) => String(n).padStart(10, '0');
  const xref = 'xref\n0 6\n0000000000 65535 f \n' +
    pad(off1) + ' 00000 n \n' +
    pad(off2) + ' 00000 n \n' +
    pad(off3) + ' 00000 n \n' +
    pad(off4) + ' 00000 n \n' +
    pad(off5) + ' 00000 n \n';

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(header + o1 + o2 + o3 + o4 + o5 + xref + trailer);
}

// Helper to create a genuine minimal DOCX package with text content
async function createDocxBuffer(paragraphs) {
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
  );

  const bodyXml = paragraphs
    .map(p => `<w:p><w:r><w:t>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r></w:p>`)
    .join('');

  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${bodyXml}</w:body></w:document>`
  );

  return await zip.generateAsync({ type: 'nodebuffer' });
}

async function runResumeAndGroundingSuite() {
  console.log('\n================================================================');
  console.log(' INTERVIEWIQ – STRICT RESUME VALIDATION & GROUNDING TEST SUITE');
  console.log('================================================================\n');

  const server = await startServer(5003);
  const baseUrl = 'http://127.0.0.1:5003';

  let passCount = 0;
  let failCount = 0;

  function assert(title, condition, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${title} -> ${detail}`);
      failCount++;
    }
  }

  // Helper for authenticated JSON requests
  async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  // Helper for authenticated multipart/form-data upload
  async function uploadFile(endpoint, fileBuffer, fileName, mimeType, token) {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('resume', blob, fileName);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  try {
    // 1. Setup Test Users
    console.log('--- Setting Up Test Accounts ---');
    const userAEmail = `candidate_a_${Date.now()}@example.com`;
    const regARes = await apiRequest('/api/auth/register', 'POST', {
      name: 'Thakur Swetha',
      email: userAEmail,
      password: 'Password123!'
    });
    const tokenA = regARes.data.token;
    assert('Register Candidate A', regARes.status === 201 && !!tokenA, JSON.stringify(regARes.data));

    const userBEmail = `candidate_b_${Date.now()}@example.com`;
    const regBRes = await apiRequest('/api/auth/register', 'POST', {
      name: 'Bob Miller',
      email: userBEmail,
      password: 'Password123!'
    });
    const tokenB = regBRes.data.token;
    assert('Register Candidate B (No Resume / Cross-user test)', regBRes.status === 201 && !!tokenB);

    // 2. PART A: Reject Invalid Formats (doc, png, xlsx)
    console.log('\n--- PART A: File Format Rejections ---');

    // Test: Legacy .doc rejected
    const docRes = await uploadFile(
      '/api/resumes/upload',
      Buffer.from('Legacy Word DOC binary data'),
      'my_resume.doc',
      'application/msword',
      tokenA
    );
    assert(
      'Reject Legacy .doc format',
      docRes.status === 400 && docRes.data.message === 'Only PDF and DOCX resume files are supported.',
      JSON.stringify(docRes.data)
    );

    // Test: PNG image rejected
    const pngRes = await uploadFile(
      '/api/resumes/upload',
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      'resume_screenshot.png',
      'image/png',
      tokenA
    );
    assert(
      'Reject Image .png format',
      pngRes.status === 400 && pngRes.data.message === 'Only PDF and DOCX resume files are supported.',
      JSON.stringify(pngRes.data)
    );

    // Test: Excel spreadsheet rejected
    const xlsxRes = await uploadFile(
      '/api/resumes/upload',
      Buffer.from('fake xlsx bytes'),
      'skills_matrix.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      tokenA
    );
    assert(
      'Reject Excel .xlsx format',
      xlsxRes.status === 400 && xlsxRes.data.message === 'Only PDF and DOCX resume files are supported.',
      JSON.stringify(xlsxRes.data)
    );

    // 3. PART A: File Signature / Magic Bytes Validation
    console.log('\n--- PART A: Magic Bytes / Signature Verification ---');

    // Test: Renamed plain text file named .pdf (fails magic bytes)
    const renamedFakePdf = await uploadFile(
      '/api/resumes/upload',
      Buffer.from('This is a plain text file renamed to resume.pdf'),
      'fake_renamed.pdf',
      'application/pdf',
      tokenA
    );
    assert(
      'Reject Renamed non-PDF file (invalid magic bytes)',
      renamedFakePdf.status === 400 && renamedFakePdf.data.message === 'Only PDF and DOCX resume files are supported.',
      JSON.stringify(renamedFakePdf.data)
    );

    // Test: Empty 0-byte file named .pdf
    const emptyPdfRes = await uploadFile(
      '/api/resumes/upload',
      Buffer.alloc(0),
      'empty.pdf',
      'application/pdf',
      tokenA
    );
    assert(
      'Reject Empty 0-byte file',
      emptyPdfRes.status === 400 && emptyPdfRes.data.message === 'Only PDF and DOCX resume files are supported.',
      JSON.stringify(emptyPdfRes.data)
    );

    // 4. PART A: Semantic Content Validation (Reject Invoices, Assignments, Certificates)
    console.log('\n--- PART A: Semantic Content Validation (Non-Resume Rejection) ---');

    // Test: Invoice document disguised as valid PDF
    const invoicePdf = createExactPdf([
      'INVOICE #40921',
      'Bill To: Global Enterprises LLC',
      'Ship To: 100 Main Street, Suite 400',
      'Tax Invoice Date: November 11, 2026',
      'Description: Cloud Hosting Services',
      'Subtotal: $4,500.00',
      'Tax: $382.50',
      'Amount Due: $4,882.50',
      'Balance Due: $4,882.50',
      'Payment Method: Wire Transfer'
    ]);
    const invoiceRes = await uploadFile('/api/resumes/upload', invoicePdf, 'Invoice_Nov2026.pdf', 'application/pdf', tokenA);
    assert(
      'Reject Invoice Document',
      invoiceRes.status === 400 && invoiceRes.data.message === 'This document does not appear to contain valid resume information.',
      JSON.stringify(invoiceRes.data)
    );

    // Test: Academic Assignment disguised as valid PDF
    const assignmentPdf = createExactPdf([
      'Course CS301: Algorithms and Data Structures',
      'Assignment 1 - Homework Problem Set',
      'Due Date: November 25, 2026',
      'Submitted by Student ID: 202409812',
      'Problem Set Overview: Implement Dijkstra shortest path',
      'Grading Rubric and Criteria:',
      '- Correctness: 50 points',
      '- Complexity Analysis: 30 points'
    ]);
    const assignmentRes = await uploadFile('/api/resumes/upload', assignmentPdf, 'CS301_Assignment_1.pdf', 'application/pdf', tokenA);
    assert(
      'Reject Academic Assignment Document',
      assignmentRes.status === 400 && assignmentRes.data.message === 'This document does not appear to contain valid resume information.',
      JSON.stringify(assignmentRes.data)
    );

    // Test: Standalone Certificate of Completion disguised as valid PDF
    const certificatePdf = createExactPdf([
      'CERTIFICATE OF COMPLETION',
      'This is to certify that Johnathan Doe',
      'has successfully completed the course in Web Development',
      'is hereby awarded this certificate of achievement',
      'Authorized Signature: Dean of Academic Affairs',
      'Certificate ID: CERT-8942-X1'
    ]);
    const certificateRes = await uploadFile('/api/resumes/upload', certificatePdf, 'Certificate_Of_Completion.pdf', 'application/pdf', tokenA);
    assert(
      'Reject Standalone Certificate Document',
      certificateRes.status === 400 && certificateRes.data.message === 'This document does not appear to contain valid resume information.',
      JSON.stringify(certificateRes.data)
    );

    // 5. PART A: Valid PDF & DOCX Resume Uploads
    console.log('\n--- PART A: Valid PDF & DOCX Resume Uploads ---');

    // Valid Candidate PDF Resume (using real candidate file with verified projects)
    const realPdfBuffer = fs.readFileSync(path.resolve(__dirname, 'uploads', '1794074039112-UPDATED_AND_FINAL_SD.pdf'));
    const validPdfRes = await uploadFile('/api/resumes/upload', realPdfBuffer, 'Thakur_Swetha_Resume.pdf', 'application/pdf', tokenA);
    assert(
      'Upload & Parse Valid PDF Resume',
      validPdfRes.status === 201 && validPdfRes.data.message === 'Resume uploaded and parsed successfully.',
      JSON.stringify(validPdfRes.data)
    );
    const resumeAId = validPdfRes.data.resume?._id;
    assert('Resume A parsed skills and projects persisted', !!resumeAId && validPdfRes.data.resume.parsedSkills.technical.length >= 3);
    console.log(`    ℹ️ Parsed Resume Projects: ${validPdfRes.data.resume.parsedProjects?.map(p => p.title).join(', ')}`);

    // Valid Java DOCX Resume
    const validDocxBuffer = await createDocxBuffer([
      'Samantha Reed',
      'Senior Java Backend Developer',
      'Email: samantha.reed@example.com | Phone: 555-234-5678 | GitHub: github.com/sreed',
      'PROFESSIONAL SUMMARY',
      'Java Software Engineer with 4 years building high-throughput Spring Boot microservices and Kafka streaming architectures.',
      'TECHNICAL SKILLS',
      'Languages: Java, SQL, Python, JavaScript',
      'Frameworks: Spring Boot, Hibernate, Express',
      'Tools & Cloud: Docker, Kubernetes, AWS, Git, PostgreSQL, Kafka',
      'EDUCATION',
      'Bachelor of Technology in Computer Science | Global Institute of Technology | 2018 - 2022',
      'PROJECTS',
      'Distributed Order Engine – High-Throughput Processing',
      'Engineered a Spring Boot microservice handling 5000 transactions per second with Kafka and PostgreSQL.',
      'WORK EXPERIENCE',
      'Backend Software Engineer | CloudScale Systems | 2022 - Present',
      'Designed REST APIs and reduced database query latency by 35% across 20+ microservices.'
    ]);
    const validDocxRes = await uploadFile(
      '/api/resumes/upload',
      validDocxBuffer,
      'Samantha_Reed_Java_Resume.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      tokenA
    );
    assert(
      'Upload & Parse Valid DOCX Resume',
      validDocxRes.status === 201 && validDocxRes.data.message === 'Resume uploaded and parsed successfully.',
      JSON.stringify(validDocxRes.data)
    );

    // 6. PART A: Fresher Resume Upload (No Work Experience)
    console.log('\n--- PART A: Fresher Resume Support (No Prior Work Experience) ---');
    const fresherUserEmail = `fresher_${Date.now()}@example.com`;
    const regFresherRes = await apiRequest('/api/auth/register', 'POST', {
      name: 'V. Sai Anand',
      email: fresherUserEmail,
      password: 'Password123!'
    });
    const fresherToken = regFresherRes.data.token;

    // Use authentic fresher resume file on disk
    const fresherPdfBuffer = fs.readFileSync(path.resolve(__dirname, 'uploads', '1794300526375-V_Sai_Anand_fresher_.pdf'));
    const fresherUploadRes = await uploadFile('/api/resumes/upload', fresherPdfBuffer, 'V_Sai_Anand_Fresher.pdf', 'application/pdf', fresherToken);
    assert(
      'Accept Fresher Resume Without Work Experience',
      fresherUploadRes.status === 201 && fresherUploadRes.data.message === 'Resume uploaded and parsed successfully.',
      JSON.stringify(fresherUploadRes.data)
    );
    const fresherResumeId = fresherUploadRes.data.resume?._id;
    assert(
      'Fresher projects & education extracted correctly',
      !!fresherResumeId && fresherUploadRes.data.resume.parsedProjects.length >= 1
    );
    console.log(`    ℹ️ Fresher Parsed Projects: ${fresherUploadRes.data.resume.parsedProjects?.map(p => p.title).join(', ')}`);

    // 7. PART B: Guard against starting interview without a resume & Ownership
    console.log('\n--- PART B: Resume Required Guard & Ownership Authorization ---');

    // User B has NO uploaded resume -> must be rejected with clear 400 instruction
    const noResumeStart = await apiRequest(
      '/api/interviews/start',
      'POST',
      { targetRole: 'Frontend Developer', totalQuestionsTarget: 5 },
      tokenB
    );
    assert(
      'Prevent starting interview without uploaded resume',
      noResumeStart.status === 400 && noResumeStart.data.message === 'Please upload and select a valid parsed resume before starting your interview.',
      JSON.stringify(noResumeStart.data)
    );

    // User B tries to use User A's resumeId -> 403 Forbidden
    const crossUserStart = await apiRequest(
      '/api/interviews/start',
      'POST',
      { resumeId: resumeAId, targetRole: 'Software Engineer', totalQuestionsTarget: 5 },
      tokenB
    );
    assert(
      'Reject Cross-User Resume Access (Ownership authorization)',
      crossUserStart.status === 403 && crossUserStart.data.message === 'Unauthorized to use this resume',
      JSON.stringify(crossUserStart.data)
    );

    // 8. PART B: Resume-Grounded Interview Question Generation
    console.log('\n--- PART B: Resume-Grounded Interview Question Generation ---');

    // Candidate A (with real resume containing Customer Churn Analytics, Fake News Detection, DermaFit)
    const interviewARes = await apiRequest(
      '/api/interviews/start',
      'POST',
      {
        resumeId: resumeAId,
        targetRole: 'Data Analyst',
        interviewType: 'Mixed',
        difficulty: 'Intermediate',
        totalQuestionsTarget: 5
      },
      tokenA
    );
    assert(
      'Start Interview for Candidate A',
      interviewARes.status === 201 && !!interviewARes.data.session,
      JSON.stringify(interviewARes.data)
    );

    const questionsA = interviewARes.data.session?.questions || [];
    const hasProjectQuote = questionsA.some(
      q => q.questionText.includes('Customer Churn Analytics') || q.questionText.includes('Fake News Detection') || q.questionText.includes('DermaFit')
    );
    assert(
      'Questions explicitly quote actual candidate project name',
      hasProjectQuote,
      `Questions generated: ${questionsA.map(q => q.questionText)}`
    );

    // Candidate Fresher (Sai Anand - Fresher with projects Food Delivery App Interface, Medico Asst App)
    const fresherInterviewRes = await apiRequest(
      '/api/interviews/start',
      'POST',
      {
        resumeId: fresherResumeId,
        targetRole: 'Frontend Developer',
        interviewType: 'Mixed',
        difficulty: 'Beginner',
        totalQuestionsTarget: 5
      },
      fresherToken
    );
    assert(
      'Start Interview for Fresher Candidate',
      fresherInterviewRes.status === 201 && !!fresherInterviewRes.data.session,
      JSON.stringify(fresherInterviewRes.data)
    );

    const fresherQuestions = fresherInterviewRes.data.session?.questions || [];
    const fresherQuestionsText = fresherQuestions.map(q => q.questionText).join(' ');

    const hasFresherProjectQuote = fresherQuestions.some(
      q => q.questionText.includes('Food Delivery App Interface') || q.questionText.includes('Medico Asst App')
    );
    assert(
      'Fresher questions quote candidate project "Food Delivery App Interface"',
      hasFresherProjectQuote,
      `Fresher questions: ${fresherQuestions.map(q => q.questionText)}`
    );

    // Verify fresher questions do NOT invent past company/employer
    const noFabricatedCompany = !fresherQuestionsText.includes('At your previous role as') && !fresherQuestionsText.includes('at your previous company');
    assert(
      'Fresher questions do NOT fabricate past employers or corporate tenure',
      noFabricatedCompany
    );

    // 9. PART B: Adaptive Follow-Up Questioning
    console.log('\n--- PART B: Adaptive Follow-Up Questioning ---');
    const sessionIdA = interviewARes.data.session?._id;
    const firstQId = questionsA[0]?.questionId;

    const answerRes = await apiRequest(
      `/api/interviews/${sessionIdA}/answer`,
      'POST',
      {
        questionId: firstQId,
        answerText: 'In my Customer Churn Analytics project, I built interactive Tableau dashboards and optimized SQL queries to monitor retention and churn across 50,000 customer records.',
        durationSeconds: 50
      },
      tokenA
    );
    assert(
      'Submit Answer & Receive Evaluation + Adaptive Follow-Up',
      answerRes.status === 200 && answerRes.data.success === true,
      JSON.stringify(answerRes.data)
    );
    assert(
      'Adaptive Follow-Up Generated & Linked to Resume/Answer',
      answerRes.data.followUpAdded === true && !!answerRes.data.followUpQuestion?.questionText,
      JSON.stringify(answerRes.data.followUpQuestion)
    );
    console.log(`    ℹ️ Adaptive Follow-Up: "${answerRes.data.followUpQuestion?.questionText}"`);

  } catch (err) {
    console.error('💥 Test suite crashed with error:', err);
    failCount++;
  } finally {
    console.log('\n================================================================');
    console.log(`📊 FINAL RESULT: ${passCount} passed, ${failCount} failed`);
    console.log('================================================================\n');
    server.close();
    process.exit(failCount > 0 ? 1 : 0);
  }
}

runResumeAndGroundingSuite();
