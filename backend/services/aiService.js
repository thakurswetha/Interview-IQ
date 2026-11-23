/**
 * AI Service for InterviewIQ
 * Supports:
 * 1. Live Google Gemini API (REST) or OpenAI API when AI_API_KEY is configured
 * 2. High-fidelity deterministic Fallback & Simulation Engine when credentials are not configured or external API is unreachable
 */

// Helper: Count filler words
function analyzeCommunicationIndicators(text, durationSeconds = 30) {
  if (!text || typeof text !== 'string') {
    return { fillerWordsCount: 0, speakingPaceWpm: 0, detectedFillers: [] };
  }

  const fillerRegex = /\b(um|uh|like|you know|basically|actually|literally|so yeah|kind of|sort of|i mean)\b/gi;
  const matches = text.match(fillerRegex) || [];

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(durationSeconds / 60, 0.25);
  const speakingPaceWpm = Math.round(wordCount / minutes);

  return {
    fillerWordsCount: matches.length,
    speakingPaceWpm,
    detectedFillers: Array.from(new Set(matches.map(m => m.toLowerCase())))
  };
}

// Low-level HTTP call to configured Generative AI provider
async function callGenAI(prompt, systemInstruction = '', temperature = 0.7) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_api_key') || apiKey === 'undefined') {
    return null; // Triggers deterministic fallback
  }

  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const model = process.env.AI_MODEL || (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash');

  try {
    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          ...(systemInstruction ? [{ role: 'user', parts: [{ text: `System Instructions: ${systemInstruction}` }] }] : []),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[AI Service] Gemini API returned error (${res.status}):`, errorText);
        return null;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return rawText;
    } else if (provider === 'openai') {
      const url = 'https://api.openai.com/v1/chat/completions';
      const payload = {
        model,
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
        temperature,
        response_format: { type: 'json_object' }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[AI Service] OpenAI API returned error (${res.status}):`, errorText);
        return null;
      }

      const data = await res.json();
      return data?.choices?.[0]?.message?.content;
    }
  } catch (err) {
    console.warn('[AI Service] Network error or timeout while calling external AI API:', err.message);
    return null;
  }

  return null;
}

// -------------------------------------------------------------
// 1. QUESTION GENERATION
// -------------------------------------------------------------
async function generateInterviewQuestions({ resume, jobDescription, targetRole, interviewType = 'Mixed', difficulty = 'Intermediate', count = 5 }) {
  const candidateSkills = [
    ...(resume?.parsedSkills?.technical || []),
    ...(resume?.parsedSkills?.frameworks || []),
    ...(resume?.parsedSkills?.tools || [])
  ];

  const candidateProjects = resume?.parsedProjects || [];
  const candidateExperience = resume?.parsedExperience || [];
  const candidateEducation = resume?.parsedEducation || [];
  const isFresher = !candidateExperience || candidateExperience.length === 0;

  const effectiveRole = targetRole?.trim() || jobDescription?.jobTitle || 'Software Engineer';
  const requiredSkills = jobDescription?.requiredSkills || [];

  const projectSummaries = candidateProjects.map(p =>
    `• "${p.title}": ${p.description || ''} (Technologies: ${(p.technologies || []).join(', ') || 'N/A'})`
  ).join('\n') || 'None listed';

  const expSummaries = candidateExperience.map(e =>
    `• ${e.role} at ${e.company} (${e.duration || 'N/A'}): ${(e.highlights || []).join('; ') || ''}`
  ).join('\n') || (isFresher ? 'FRESHER / RECENT GRADUATE (No prior corporate work experience. DO NOT fabricate previous employers or ask corporate management questions)' : 'None listed');

  const eduSummaries = candidateEducation.map(ed =>
    `• ${ed.degree} from ${ed.institution} (${ed.year || 'N/A'})`
  ).join('\n') || 'Degree in Computer Science or related engineering field';

  const prompt = `
Generate a structured JSON list of ${count} interview questions for a candidate.
Target Role: "${effectiveRole}"
Interview Type: "${interviewType}" (Options: Technical, HR, Behavioral, Project-Based, Mixed)
Difficulty Level: "${difficulty}" (Options: Beginner, Intermediate, Advanced)

CANDIDATE RESUME CONTEXT:
Candidate Skills: ${candidateSkills.join(', ') || 'Core role skills'}
Candidate Projects:
${projectSummaries}
Work Experience / Internships:
${expSummaries}
Education:
${eduSummaries}
Target Job Skills: ${requiredSkills.join(', ') || 'Industry standard competencies'}

CRITICAL INSTRUCTIONS FOR RESUME GROUNDING:
1. GROUNDED IN RESUME: Ground at least 2 questions directly in the candidate's actual projects listed above, citing the exact project name (e.g. "${candidateProjects[0]?.title || 'their primary project'}"). Probe the architecture, design choices, data flow, or trade-offs.
2. TAILOR TO VERIFIED SKILLS: Connect their listed skills (${candidateSkills.slice(0, 5).join(', ') || 'their primary skills'}) to the target role "${effectiveRole}".
3. FRESHER SENSITIVITY: If candidate is a Fresher (no work experience), DO NOT invent past employers or ask corporate management questions. Ask foundational problem-solving questions, academic project questions, or how they learned their stack.
4. ROLE SPECIALIZATION FOR "${effectiveRole}":
- If Data Analyst / BI / SQL: Ask about SQL queries (joins, window functions, CTEs), data preprocessing, dashboard design (Power BI/Tableau), and business KPI reporting.
- If Frontend / React Developer: Ask about component lifecycle, virtual DOM diffing, state management, CSS layouts, and web performance (Core Web Vitals).
- If Java Developer: Ask about OOP design, Java Collections internals (HashMap vs ConcurrentHashMap), multithreading/concurrency, and JVM memory/garbage collection.
- If Backend / Node.js Developer: Ask about REST/GraphQL API design, database indexing, caching strategies (Redis), microservices, and asynchronous architecture.
- If Data Engineer: Ask about distributed computing (Spark), ETL/ELT pipeline design, data warehousing (Star/Snowflake), and data quality monitoring.
- If AI / ML / Generative AI Engineer: Ask about model evaluation (Precision/Recall/F1/ROC-AUC), Transformers, RAG architectures, embeddings, and prompt engineering.
- If DevOps / Cloud Engineer: Ask about Docker multi-stage builds, Kubernetes orchestration, Terraform IaC, and CI/CD automation pipelines.
- If QA / Test Engineer: Ask about automated testing frameworks (Cypress/Selenium/Playwright), test pyramid, flaky test resolution, and regression strategies.
- If Cybersecurity: Ask about OWASP Top 10 vulnerabilities, incident response, TLS/PKI, and Zero Trust access control.
- If Product Manager / Business Analyst: Ask about PRD requirements, feature prioritization frameworks (RICE), KPI definition, and stakeholder alignment.

Respond ONLY with valid JSON following this exact schema:
{
  "questions": [
    {
      "questionId": "q1",
      "questionText": "Question string",
      "category": "Technical",
      "difficulty": "${difficulty}",
      "expectedKeyConcepts": ["concept1", "concept2"],
      "isFollowUp": false
    }
  ]
}
`;

  const aiResponse = await callGenAI(prompt, 'You are an expert principal engineering interviewer and hiring manager.');
  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return {
          questions: parsed.questions.map((q, idx) => ({
            questionId: `q_${Date.now()}_${idx + 1}`,
            questionText: q.questionText,
            category: q.category || interviewType,
            expectedKeyConcepts: q.expectedKeyConcepts || [],
            difficulty: q.difficulty || difficulty,
            isFollowUp: false
          })),
          isDemoMode: false,
          aiModel: process.env.AI_MODEL || 'Gemini 1.5 Flash'
        };
      }
    } catch (e) {
      console.warn('[AI Service] Failed to parse AI JSON output, falling back to deterministic bank.');
    }
  }

  // Deterministic Fallback Engine with deep resume grounding & role-specific specialization
  return {
    questions: getDeterministicQuestions(interviewType, difficulty, candidateSkills, candidateProjects, effectiveRole, count, candidateExperience, candidateEducation),
    isDemoMode: true,
    aiModel: 'InterviewIQ Intelligent Rule Engine (Demo Fallback)'
  };
}

function getDeterministicQuestions(
  interviewType,
  difficulty,
  skills = [],
  projects = [],
  role = 'Software Engineer',
  count = 5,
  experience = [],
  education = []
) {
  const topSkill = skills[0] || 'Technical Stack';
  const secondSkill = skills[1] || 'Core Architecture';
  const thirdSkill = skills[2] || 'Data Layer';

  // Normalize projects (handles array of strings or array of objects)
  const normalizedProjects = (projects || []).map(p => {
    if (typeof p === 'string') return { title: p, technologies: [] };
    return p;
  });

  const firstProj = normalizedProjects[0] || { title: `recent ${role} implementation`, technologies: [topSkill] };
  const firstProjTitle = firstProj.title || `recent ${role} implementation`;
  const firstProjTech = (firstProj.technologies && firstProj.technologies.length > 0)
    ? firstProj.technologies.join(', ')
    : topSkill;

  const secondProj = normalizedProjects[1];
  const secondProjTitle = secondProj?.title;
  const secondProjTech = (secondProj?.technologies && secondProj.technologies.length > 0)
    ? secondProj.technologies.join(', ')
    : secondSkill;

  const isFresher = !experience || experience.length === 0;
  const candidateDegree = education[0]?.degree || 'Computer Science / Engineering';
  const candidateCompany = experience[0]?.company;
  const candidateJobRole = experience[0]?.role || role;
  const lowerRole = (role || '').toLowerCase();

  // Role Category Detection
  const isDataAnalyst = lowerRole.includes('data analyst') || lowerRole.includes('business analyst') || lowerRole.includes('bi analyst') || lowerRole.includes('power bi') || lowerRole.includes('sql developer') || lowerRole.includes('product analyst');
  const isDataEngineer = lowerRole.includes('data engineer') || lowerRole.includes('etl') || lowerRole.includes('big data');
  const isDataScientist = lowerRole.includes('data scientist');
  const isFrontend = lowerRole.includes('frontend') || lowerRole.includes('react') || lowerRole.includes('ui developer') || lowerRole.includes('mobile');
  const isJava = lowerRole.includes('java');
  const isPython = lowerRole.includes('python');
  const isBackend = lowerRole.includes('backend') || lowerRole.includes('node') || lowerRole.includes('api');
  const isAIML = lowerRole.includes('ai') || lowerRole.includes('machine learning') || lowerRole.includes('nlp') || lowerRole.includes('generative');
  const isDevOps = lowerRole.includes('devops') || lowerRole.includes('cloud') || lowerRole.includes('aws') || lowerRole.includes('azure') || lowerRole.includes('site reliability') || lowerRole.includes('sre');
  const isQA = lowerRole.includes('qa') || lowerRole.includes('test') || lowerRole.includes('automation test') || lowerRole.includes('quality');
  const isSecurity = lowerRole.includes('security') || lowerRole.includes('cyber');
  const isDBA = lowerRole.includes('database') || lowerRole.includes('dba');
  const isProduct = lowerRole.includes('product manager') || lowerRole.includes('technical business analyst');

  // Role-Specific Technical Banks
  let roleTechnicalQuestions = [];

  if (isDataAnalyst) {
    roleTechnicalQuestions = [
      {
        questionText: `Can you walk me through how you write complex SQL queries using Common Table Expressions (CTEs) and window functions like ROW_NUMBER(), RANK(), or LEAD()/LAG() to extract business reporting insights?`,
        category: 'Technical',
        expectedKeyConcepts: ['Window functions (PARTITION BY / ORDER BY)', 'CTEs vs subqueries', 'Aggregation logic', 'Query optimization']
      },
      {
        questionText: `How do you handle messy real-world datasets during preprocessing—specifically dealing with missing values, duplicate records, outliers, and schema mismatches?`,
        category: 'Technical',
        expectedKeyConcepts: ['Data imputation', 'Deduplication', 'Outlier detection methods (IQR / Z-score)', 'Data validation rules']
      },
      {
        questionText: `When designing executive dashboards in Power BI or Tableau, how do you model the data, choose the right visual metrics, and ensure fast report render speeds?`,
        category: 'Technical',
        expectedKeyConcepts: ['Star schema data modeling', 'DAX / Calculated fields', 'Visual hierarchy', 'Dashboard performance tuning']
      },
      {
        questionText: `Describe how you calculate and present core business KPIs (such as churn rate, customer lifetime value, or conversion funnels) to non-technical stakeholders.`,
        category: 'Technical',
        expectedKeyConcepts: ['Metric definition', 'Cohort analysis', 'Actionable storytelling', 'Executive presentation']
      },
      {
        questionText: `How do you choose between inner joins, outer joins, and cross joins when combining disparate data tables, and how do you ensure join cardinality doesn't skew aggregated totals?`,
        category: 'Technical',
        expectedKeyConcepts: ['Join types and behavior', 'Cartesian product prevention', 'Granularity verification', 'Primary-foreign key consistency']
      }
    ];
  } else if (isDataEngineer) {
    roleTechnicalQuestions = [
      {
        questionText: `How do you architect scalable ETL/ELT pipelines that ingest high-volume batch and streaming data, ensuring idempotency and schema evolution?`,
        category: 'Technical',
        expectedKeyConcepts: ['Idempotent data ingestion', 'Schema registry / evolution', 'Batch vs streaming architectures', 'Error handling & dead-letter queues']
      },
      {
        questionText: `When working with distributed computing engines like Apache Spark or PySpark, how do you diagnose partition skew, optimize shuffle operations, and manage memory caching?`,
        category: 'Technical',
        expectedKeyConcepts: ['Data partition skew & salting', 'Shuffle partition tuning', 'Broadcast joins', 'Spark execution plan analysis']
      },
      {
        questionText: `Compare Star schema versus Snowflake schema in modern cloud data warehouses (Snowflake, BigQuery), and explain how you model Slowly Changing Dimensions (SCD Type 1 vs Type 2).`,
        category: 'Technical',
        expectedKeyConcepts: ['Star vs Snowflake normalization', 'Fact and Dimension table design', 'SCD Type 2 timestamping', 'Surrogate keys']
      },
      {
        questionText: `How do you orchestrate data workflows with tools like Apache Airflow, and how do you enforce automated data quality validation before downstream consumption?`,
        category: 'Technical',
        expectedKeyConcepts: ['DAG dependency management', 'Idempotent task retries', 'Great Expectations / data assertions', 'Pipeline alerting']
      }
    ];
  } else if (isDataScientist) {
    roleTechnicalQuestions = [
      {
        questionText: `How do you decide whether an analytical problem should be framed as classification, regression, clustering, or time-series forecasting, and how do you prevent data leakage during feature engineering?`,
        category: 'Technical',
        expectedKeyConcepts: ['Problem formulation', 'Target leakage prevention', 'Feature scaling & encoding', 'Cross-validation splits']
      },
      {
        questionText: `When dealing with severe class imbalance in machine learning models, how do you choose appropriate evaluation metrics and sampling techniques?`,
        category: 'Technical',
        expectedKeyConcepts: ['Precision-Recall AUC vs ROC-AUC', 'F1-Score / Balanced Accuracy', 'SMOTE / Undersampling', 'Cost-sensitive learning']
      },
      {
        questionText: `Explain the bias-variance trade-off. What concrete techniques do you use to detect and mitigate overfitting in tree-based ensemble models like XGBoost or Random Forests?`,
        category: 'Technical',
        expectedKeyConcepts: ['Bias-variance decomposition', 'Hyperparameter regularization', 'Tree depth & shrinkage (learning rate)', 'Out-of-fold validation']
      }
    ];
  } else if (isFrontend) {
    roleTechnicalQuestions = [
      {
        questionText: `Can you walk me through the React component lifecycle and virtual DOM reconciliation algorithm? How do key props and useMemo/useCallback prevent unnecessary re-renders?`,
        category: 'Technical',
        expectedKeyConcepts: ['Virtual DOM diffing algorithm', 'Fiber tree reconciliation', 'Memoization trade-offs', 'Stable function references']
      },
      {
        questionText: `How do you approach state management in a large-scale React application? When would you choose local state versus Context API versus external stores like Redux or Zustand?`,
        category: 'Technical',
        expectedKeyConcepts: ['Global vs local state boundaries', 'Context re-render pitfalls', 'Predictable state transitions', 'Async data fetching state']
      },
      {
        questionText: `How do you optimize Core Web Vitals (LCP, FID/INP, CLS) and frontend bundle size in a production web application?`,
        category: 'Technical',
        expectedKeyConcepts: ['Code-splitting & lazy loading', 'Asset compression & modern formats', 'Layout shift prevention', 'Critical CSS & script deferral']
      },
      {
        questionText: `How do you implement modern responsive layouts using CSS Flexbox and CSS Grid, and what practices do you follow for web accessibility (WCAG / ARIA)?`,
        category: 'Technical',
        expectedKeyConcepts: ['CSS Grid vs Flexbox use cases', 'Semantic HTML5', 'Keyboard navigation & focus management', 'ARIA roles & contrast ratios']
      }
    ];
  } else if (isJava) {
    roleTechnicalQuestions = [
      {
        questionText: `How do core Object-Oriented Programming principles—encapsulation, inheritance, polymorphism, and abstraction—guide your design when building modular enterprise Java applications?`,
        category: 'Technical',
        expectedKeyConcepts: ['SOLID principles in Java', 'Composition over inheritance', 'Interface contracts', 'Polymorphic dispatch']
      },
      {
        questionText: `Explain the internal working of Java HashMap. What happens during hash collision, how does bucket treeification work, and how does ConcurrentHashMap achieve thread safety without locking the entire table?`,
        category: 'Technical',
        expectedKeyConcepts: ['HashCode & equals contracts', 'Hash collision & red-black trees', 'ConcurrentHashMap segment/CAS locking', 'Load factor & rehashing']
      },
      {
        questionText: `How do you manage multithreading and concurrency in Java? Compare synchronized blocks, ReentrantLock, ExecutorService thread pools, and CompletableFuture.`,
        category: 'Technical',
        expectedKeyConcepts: ['Thread pool sizing & queues', 'Atomic variables & memory visibility (volatile)', 'Deadlock prevention', 'Asynchronous non-blocking composition']
      },
      {
        questionText: `Can you walk through the JVM memory architecture (Heap vs Stack, Metaspace) and how garbage collection algorithms (G1GC, ZGC) reclaim memory?`,
        category: 'Technical',
        expectedKeyConcepts: ['Young vs Old generation heap', 'Stop-the-world pauses', 'Garbage collection tuning', 'Memory leak diagnosis (Heap dumps)']
      }
    ];
  } else if (isPython) {
    roleTechnicalQuestions = [
      {
        questionText: `How does Python manage memory, reference counting, and garbage collection? What are the practical implications of the Global Interpreter Lock (GIL) on multi-core CPU concurrency?`,
        category: 'Technical',
        expectedKeyConcepts: ['Reference counting & cyclic GC', 'Global Interpreter Lock (GIL)', 'Multiprocessing vs Multithreading', 'Memory profilers']
      },
      {
        questionText: `Explain decorators, generators, and context managers in Python. In what real-world scenarios have you implemented custom generators or decorators to optimize performance or maintainability?`,
        category: 'Technical',
        expectedKeyConcepts: ['Function closures & decorators', 'Yield & lazy evaluation memory savings', '__enter__ and __exit__ protocol', 'Readability & DRY principles']
      },
      {
        questionText: `When building backend APIs or data pipelines in Python, how do you handle asynchronous I/O with asyncio, and how do you optimize ORM query performance?`,
        category: 'Technical',
        expectedKeyConcepts: ['Async/await event loop', 'Coroutines and task groups', 'N+1 query problem prevention (select_related / prefetch_related)', 'Connection pooling']
      }
    ];
  } else if (isAIML) {
    roleTechnicalQuestions = [
      {
        questionText: `Can you explain the Transformer architecture, multi-head self-attention mechanisms, and how positional encodings enable parallel sequence processing?`,
        category: 'Technical',
        expectedKeyConcepts: ['Self-attention formula (Q, K, V)', 'Multi-head projection', 'Feedforward layers & residual connections', 'Positional embeddings']
      },
      {
        questionText: `When building Retrieval-Augmented Generation (RAG) systems, how do you optimize document chunking, embedding generation, vector database indexing, and re-ranking to minimize hallucinations?`,
        category: 'Technical',
        expectedKeyConcepts: ['Chunking strategies (semantic vs fixed-size)', 'Embedding model trade-offs', 'Vector similarity metrics (Cosine, Dot product)', 'Cross-encoder re-ranking & ground truth verification']
      },
      {
        questionText: `What strategies do you use for parameter-efficient fine-tuning (PEFT / LoRA) of Large Language Models, and how do you systematically guard against prompt injection and toxic outputs?`,
        category: 'Technical',
        expectedKeyConcepts: ['Low-Rank Adaptation (LoRA / QLoRA)', 'Adapter weights vs full fine-tuning', 'Prompt sanitization & guardrails', 'Model alignment (RLHF / DPO)']
      },
      {
        questionText: `How do you evaluate generative AI and traditional NLP outputs using quantitative metrics like BLEU, ROUGE, Perplexity, or LLM-as-a-judge frameworks?`,
        category: 'Technical',
        expectedKeyConcepts: ['ROUGE n-gram overlap', 'Faithfulness and answer relevancy metrics', 'Grounding evaluation', 'Evaluation latency and cost trade-offs']
      }
    ];
  } else if (isDevOps) {
    roleTechnicalQuestions = [
      {
        questionText: `How do you write efficient, secure multi-stage Dockerfiles, and what best practices do you follow to minimize image size and eliminate vulnerability surfaces?`,
        category: 'Technical',
        expectedKeyConcepts: ['Multi-stage build separation', 'Non-root user execution', 'Layer caching optimization', 'Minimal base images (Alpine/Distroless)']
      },
      {
        questionText: `Walk me through Kubernetes architecture: how do the Control Plane, Kubelet, Pods, Services, and Ingress controllers interact to maintain high availability and self-healing?`,
        category: 'Technical',
        expectedKeyConcepts: ['Control plane components (API server, etcd, scheduler)', 'Pod lifecycle & readiness/liveness probes', 'Service discovery & ClusterIP/NodePort', 'Horizontal Pod Autoscaler (HPA)']
      },
      {
        questionText: `How do you manage Infrastructure as Code (IaC) using Terraform, handle remote state locking with DynamoDB/S3, and detect or remediate configuration drift?`,
        category: 'Technical',
        expectedKeyConcepts: ['Terraform state management & locking', 'Modular infrastructure design', 'Drift detection & plan validation', 'Secrets management in IaC']
      },
      {
        questionText: `Describe your approach to designing a zero-downtime CI/CD deployment pipeline (blue/green or canary) with automated rollback triggers based on error rate metrics.`,
        category: 'Technical',
        expectedKeyConcepts: ['Canary vs Blue-Green deployment', 'Automated health gates & metric thresholds', 'Database migration rollback strategies', 'Pipeline artifact versioning']
      }
    ];
  } else if (isQA) {
    roleTechnicalQuestions = [
      {
        questionText: `How do you structure an end-to-end automation test framework using tools like Cypress, Playwright, or Selenium using the Page Object Model (POM) pattern?`,
        category: 'Technical',
        expectedKeyConcepts: ['Page Object Model architecture', 'Selector resiliency strategies', 'Test setup and teardown hooks', 'Cross-browser execution']
      },
      {
        questionText: `How do you tackle flaky tests caused by asynchronous timing, network delays, or dynamic DOM elements in continuous integration runs?`,
        category: 'Technical',
        expectedKeyConcepts: ['Explicit waits vs arbitrary sleeps', 'Network stubbing & API mocking', 'Deterministic test data creation', 'Retry mechanisms and flakiness tracking']
      },
      {
        questionText: `Explain the Test Pyramid concept. How do you balance unit tests, integration tests, API tests, and UI tests to maintain fast feedback loops and broad coverage?`,
        category: 'Technical',
        expectedKeyConcepts: ['Unit test speed and granularity', 'Contract / API test efficiency', 'UI test maintenance cost', 'Code coverage vs risk-based testing']
      },
      {
        questionText: `Walk me through your defect triage and lifecycle management process: from identifying an elusive edge-case bug to verification in staging and production.`,
        category: 'Technical',
        expectedKeyConcepts: ['Reproduction steps & environment isolation', 'Severity vs priority classification', 'Root-cause analysis', 'Regression verification']
      }
    ];
  } else if (isSecurity) {
    roleTechnicalQuestions = [
      {
        questionText: `Walk through the OWASP Top 10 vulnerabilities—focusing on SQL Injection, Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF). How do modern frameworks defend against each?`,
        category: 'Technical',
        expectedKeyConcepts: ['Parameterized queries / prepared statements', 'Content Security Policy (CSP) & output encoding', 'SameSite cookies & CSRF tokens', 'Input sanitization boundaries']
      },
      {
        questionText: `How do you investigate a suspected security breach or credential stuffing attack using SIEM logs, intrusion detection systems, and threat intelligence feeds?`,
        category: 'Technical',
        expectedKeyConcepts: ['Log correlation & anomaly detection', 'Incident response lifecycle (NIST / SANS)', 'Indicator of Compromise (IoC) analysis', 'Containment & remediation steps']
      },
      {
        questionText: `Explain the difference between symmetric and asymmetric encryption, TLS 1.3 handshake mechanics, and how certificates and PKI establish trust.`,
        category: 'Technical',
        expectedKeyConcepts: ['AES-256 vs RSA/ECC', 'Diffie-Hellman ephemeral key exchange', 'Certificate authorities and trust chains', 'Zero Trust transport security']
      }
    ];
  } else if (isDBA) {
    roleTechnicalQuestions = [
      {
        questionText: `How do B-tree and LSM-tree index structures work under the hood, and how do you analyze query execution plans (EXPLAIN ANALYZE) to identify slow index scans versus sequential scans?`,
        category: 'Technical',
        expectedKeyConcepts: ['B-Tree depth and balancing', 'Composite index column ordering', 'Query cost analysis and table scans', 'Covering indexes']
      },
      {
        questionText: `What strategies do you use for database high availability, synchronous vs asynchronous replication, automated failover, and Point-In-Time Recovery (PITR)?`,
        category: 'Technical',
        expectedKeyConcepts: ['Write-Ahead Logging (WAL)', 'Replication lag monitoring', 'Split-brain prevention (quorum)', 'Automated backup validation']
      }
    ];
  } else if (isProduct) {
    roleTechnicalQuestions = [
      {
        questionText: `How do you write a comprehensive Product Requirements Document (PRD) and translate high-level business goals into clear user stories with testable acceptance criteria?`,
        category: 'Technical',
        expectedKeyConcepts: ['PRD structure & problem definition', 'User story mapping', 'Gherkin / Given-When-Then acceptance criteria', 'Technical feasibility checks']
      },
      {
        questionText: `When faced with competing priorities from engineering, sales, and executive leadership, what framework (e.g., RICE, MoSCoW) do you use to prioritize roadmap features?`,
        category: 'Technical',
        expectedKeyConcepts: ['RICE scoring model (Reach, Impact, Confidence, Effort)', 'Stakeholder alignment', 'Opportunity cost evaluation', 'Trade-off communication']
      },
      {
        questionText: `How do you define the North Star metric for a digital product, and how do you design and interpret A/B tests to make data-backed product decisions?`,
        category: 'Technical',
        expectedKeyConcepts: ['North Star vs supporting metrics', 'Hypothesis formulation', 'Statistical significance (p-values & sample size)', 'Guardrail metrics']
      }
    ];
  } else {
    // Backend Developer / Software Engineer / Custom Role
    roleTechnicalQuestions = [
      {
        questionText: `In the context of ${role}, can you walk me through the execution lifecycle and performance trade-offs when working with ${topSkill} in high-throughput environments?`,
        category: 'Technical',
        expectedKeyConcepts: [`${topSkill} internals`, 'Memory management', 'Asynchronous processing', 'Performance profiling']
      },
      {
        questionText: `How do you structure database queries, indexing, and connection pooling in ${thirdSkill} to prevent latency spikes and maintain data integrity?`,
        category: 'Technical',
        expectedKeyConcepts: ['Indexing strategies', 'Query optimization', 'Connection pooling', 'Transaction isolation']
      },
      {
        questionText: `When designing scalable microservices or REST APIs for ${role} responsibilities, how do you approach authentication, rate limiting, and fault tolerance?`,
        category: 'Technical',
        expectedKeyConcepts: ['JWT/OAuth2 security', 'Rate limiting middleware', 'Circuit breaker pattern', 'Observability & logging']
      },
      {
        questionText: `Could you compare the trade-offs between relational databases versus document databases for an event-driven system within a ${role} domain?`,
        category: 'Technical',
        expectedKeyConcepts: ['ACID vs BASE consistency', 'Schema flexibility', 'Sharding & partitioning', 'Write throughput']
      },
      {
        questionText: `How do you implement CI/CD pipelines, containerization with Docker, and automated integration tests in your day-to-day workflow as a ${role}?`,
        category: 'Technical',
        expectedKeyConcepts: ['Container orchestration', 'Automated test suites', 'Zero-downtime deployment', 'Configuration management']
      }
    ];
  }

  const questionBank = {
    Technical: roleTechnicalQuestions,
    Behavioral: isFresher ? [
      {
        questionText: `As an aspiring ${role}, can you describe a challenging problem you faced while developing "${firstProjTitle}" or during your coursework in ${candidateDegree}? How did you break down the problem and arrive at a solution?`,
        category: 'Behavioral',
        expectedKeyConcepts: ['Structured problem solving', 'Self-directed research', 'Resourcefulness', 'Iterative debugging']
      },
      {
        questionText: `Tell me about a time when you had to collaborate with peers or teammates on a project. How did you handle conflicting ideas or distribute tasks effectively?`,
        category: 'Behavioral',
        expectedKeyConcepts: ['Communication & empathy', 'Task delegation', 'Active listening', 'Team delivery']
      },
      {
        questionText: `Can you share an experience where you had to quickly learn an unfamiliar technology (such as ${topSkill} or ${secondSkill}) from documentation to complete a milestone on time?`,
        category: 'Behavioral',
        expectedKeyConcepts: ['Learning agility', 'Hands-on experimentation', 'Time management', 'Continuous improvement']
      },
      {
        questionText: `Give an example of a goal you set for yourself in a past project that you were unable to achieve completely. What happened and what did you learn?`,
        category: 'Behavioral',
        expectedKeyConcepts: ['Accountability', 'Reflection', 'Iterative improvement', 'Resilience']
      }
    ] : [
      {
        questionText: `At ${candidateCompany || 'your previous role'} as ${candidateJobRole}, tell me about a time you diagnosed and resolved a high-severity production roadblock or critical bug.`,
        category: 'Behavioral',
        expectedKeyConcepts: ['Situation & Task', 'Root-cause analysis', 'Decisive action', 'Measured result (STAR method)']
      },
      {
        questionText: `Describe a situation at ${candidateCompany || 'work'} where you had a disagreement with a team member or stakeholder regarding a technical design decision for ${role}. How did you resolve it?`,
        category: 'Behavioral',
        expectedKeyConcepts: ['Constructive dialogue', 'Data-driven trade-offs', 'Stakeholder alignment', 'Empathy']
      },
      {
        questionText: `Can you share an experience where you had to balance technical debt versus delivering new features under a tight deadline as a ${role}?`,
        category: 'Behavioral',
        expectedKeyConcepts: ['Pragmatism', 'Risk assessment', 'Refactoring strategy', 'Transparent communication']
      },
      {
        questionText: `Give an example of a goal you set for yourself in a past project that you were unable to achieve completely. What happened and what did you learn?`,
        category: 'Behavioral',
        expectedKeyConcepts: ['Accountability', 'Reflection', 'Iterative improvement', 'Resilience']
      }
    ],
    HR: isFresher ? [
      {
        questionText: `As a candidate with a strong foundation in ${candidateDegree}, why are you particularly interested in starting your career as a ${role}, and what unique value do your projects demonstrate?`,
        category: 'HR',
        expectedKeyConcepts: ['Role alignment', 'Academic foundation', 'Eagerness to learn', 'Cultural fit']
      },
      {
        questionText: `Where do you see yourself technically and professionally in this ${role} domain over the next 2 to 3 years?`,
        category: 'HR',
        expectedKeyConcepts: ['Continuous learning', 'Leadership aspirations', 'Technical mastery', 'Mentorship']
      },
      {
        questionText: `How do you prioritize competing deadlines and manage context switching when working under pressure?`,
        category: 'HR',
        expectedKeyConcepts: ['Prioritization frameworks', 'Transparent communication', 'Time management']
      }
    ] : [
      {
        questionText: `Building upon your experience at ${candidateCompany || 'your previous company'}, why are you particularly interested in this ${role} position, and what unique value do you bring?`,
        category: 'HR',
        expectedKeyConcepts: ['Company alignment', 'Career trajectory', 'Value proposition', 'Culture fit']
      },
      {
        questionText: `Where do you see yourself technically and professionally in this ${role} domain over the next 2 to 3 years?`,
        category: 'HR',
        expectedKeyConcepts: ['Continuous learning', 'Leadership aspirations', 'Technical mastery', 'Mentorship']
      },
      {
        questionText: `How do you prioritize competing deadlines when multiple stakeholders request high-priority deliverables simultaneously?`,
        category: 'HR',
        expectedKeyConcepts: ['Prioritization frameworks', 'Transparent communication', 'Stakeholder management']
      }
    ],
    'Project-Based': [
      {
        questionText: `In your project "${firstProjTitle}", you worked with ${firstProjTech}. Can you explain the end-to-end architecture, the key technical trade-offs you evaluated, and how you ensured scalability?`,
        category: 'Project-Based',
        expectedKeyConcepts: [`${firstProjTitle} architecture`, `${firstProjTech} implementation`, 'Design trade-offs', 'Scalability & performance']
      },
      {
        questionText: secondProjTitle
          ? `Regarding your project "${secondProjTitle}" utilizing ${secondProjTech}, what was the most difficult technical bug or performance bottleneck you encountered, and how did you resolve it?`
          : `How did you design error handling, edge-case validation, and automated testing for "${firstProjTitle}"?`,
        category: 'Project-Based',
        expectedKeyConcepts: ['Edge cases & error handling', 'Debugging methodology', 'Resilience patterns', 'Code quality']
      },
      {
        questionText: `If you were tasked with re-architecting "${firstProjTitle}" to handle 10x user traffic with strict sub-100ms latency SLAs, what specific caching, database, and infrastructure optimizations would you introduce?`,
        category: 'Project-Based',
        expectedKeyConcepts: ['Horizontal scaling', 'Distributed caching', 'Database indexing', 'Asynchronous processing']
      }
    ]
  };

  let selected = [];
  if (interviewType === 'Technical') {
    selected = [...questionBank.Technical, ...questionBank['Project-Based']];
  } else if (interviewType === 'Behavioral') {
    selected = questionBank.Behavioral;
  } else if (interviewType === 'HR') {
    selected = questionBank.HR;
  } else if (interviewType === 'Project-Based') {
    selected = questionBank['Project-Based'];
  } else {
    // Mixed: balanced selection highlighting the role-specific questions
    selected = [
      questionBank.Technical[0] || roleTechnicalQuestions[0],
      questionBank['Project-Based'][0],
      questionBank.Technical[1] || roleTechnicalQuestions[1] || questionBank.Technical[0],
      questionBank.Behavioral[0],
      questionBank.HR[0],
      questionBank.Technical[2] || roleTechnicalQuestions[2] || questionBank.Technical[0]
    ];
  }

  return selected.slice(0, count).map((item, idx) => ({
    questionId: `q_det_${Date.now()}_${idx + 1}`,
    questionText: item.questionText,
    category: item.category,
    difficulty: difficulty,
    expectedKeyConcepts: item.expectedKeyConcepts,
    isFollowUp: false
  }));
}

// -------------------------------------------------------------
// 2. ADAPTIVE FOLLOW-UP QUESTION ENGINE
// -------------------------------------------------------------
async function generateFollowUpQuestion({ currentQuestion, candidateAnswer, interviewType, difficulty, resume, jobDescription }) {
  if (!candidateAnswer || candidateAnswer.trim().length < 15) {
    return {
      hasFollowUp: true,
      followUpQuestion: {
        questionId: `q_fu_${Date.now()}`,
        questionText: `Could you elaborate further on that? Specifically, what concrete steps or implementation details can you share from your hands-on experience?`,
        category: 'Follow-Up',
        difficulty,
        isFollowUp: true,
        parentQuestionId: currentQuestion.questionId
      },
      reason: 'Candidate provided a brief initial answer; prompting for concrete depth.'
    };
  }

  const prompt = `
You are a senior tech lead conducting an interview.
Current Question: "${currentQuestion.questionText}"
Candidate's Answer: "${candidateAnswer}"
Interview Type: "${interviewType}"
Difficulty: "${difficulty}"

Analyze whether the candidate's answer raises an interesting technical nuance, omitted an important edge case, or needs a clarifying follow-up question.
Generate a targeted, adaptive follow-up question that builds directly on what they just said.

Respond ONLY with valid JSON in this schema:
{
  "hasFollowUp": true,
  "followUpText": "Adaptive follow-up question string",
  "reason": "Brief explanation of why this follow-up probes deeper"
}
`;

  const aiResponse = await callGenAI(prompt, 'You are an incisive technical interviewer probing candidate knowledge.');
  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.followUpText) {
        return {
          hasFollowUp: true,
          followUpQuestion: {
            questionId: `q_fu_${Date.now()}`,
            questionText: parsed.followUpText,
            category: 'Follow-Up',
            difficulty,
            isFollowUp: true,
            parentQuestionId: currentQuestion.questionId
          },
          reason: parsed.reason || 'AI generated adaptive probe based on your answer.'
        };
      }
    } catch (_) {}
  }

  // Deterministic adaptive follow-up logic grounded in answer + resume context
  const answerLower = candidateAnswer.toLowerCase();
  const topProj = resume?.parsedProjects?.[0]?.title;
  let followUpText = `Interesting perspective. How did you measure the trade-offs of that approach, and what would you do differently if constraints changed?`;

  if (topProj && (currentQuestion.questionText.includes(topProj) || answerLower.includes(topProj.toLowerCase()))) {
    followUpText = `Regarding your implementation in "${topProj}", what specific metrics (such as query latency, error rates, model accuracy, or memory consumption) did you monitor to validate your technical design?`;
  } else if (answerLower.includes('sql') || answerLower.includes('database')) {
    followUpText = `You mentioned database operations. How would you handle index fragmentation and maintain sub-50ms query response times as data volume scales into millions of records?`;
  } else if (answerLower.includes('react') || answerLower.includes('frontend')) {
    followUpText = `Regarding your frontend implementation, how did you prevent unnecessary re-renders, and how did you manage complex shared state across unrelated components?`;
  } else if (answerLower.includes('api') || answerLower.includes('backend') || answerLower.includes('node')) {
    followUpText = `Can you expand on how you handled edge cases like network timeouts, API idempotency, and concurrent client requests in that service?`;
  } else if (currentQuestion.category === 'Behavioral' || answerLower.includes('team')) {
    followUpText = `Following up on that: what was the quantifiable outcome of your actions, and what feedback did you receive from your team or supervisor afterward?`;
  }

  return {
    hasFollowUp: true,
    followUpQuestion: {
      questionId: `q_fu_${Date.now()}`,
      questionText: followUpText,
      category: 'Follow-Up',
      difficulty,
      isFollowUp: true,
      parentQuestionId: currentQuestion.questionId
    },
    reason: 'Adaptive deep-dive based on mentioned technical elements.'
  };
}

// -------------------------------------------------------------
// 3. ANSWER EVALUATION ENGINE (Rubric & STAR Framework)
// -------------------------------------------------------------
async function evaluateAnswer({ question, answerText, durationSeconds = 45, interviewType = 'Technical', difficulty = 'Intermediate' }) {
  const commIndicators = analyzeCommunicationIndicators(answerText, durationSeconds);
  const wordCount = (answerText || '').trim().split(/\s+/).filter(Boolean).length;

  if (wordCount < 5) {
    return {
      score: 20,
      categoryScores: {
        technicalCorrectness: 20,
        clarity: 25,
        relevance: 20,
        completeness: 15,
        starStructure: 20
      },
      communicationIndicators: commIndicators,
      strengths: ['Candidate attempted to answer.'],
      weaknesses: ['Response was extremely brief or incomplete.', 'Lacked concrete technical details or examples.'],
      missingConcepts: question.expectedKeyConcepts || ['Detailed explanation', 'Practical implementation'],
      suggestedAnswer: `A comprehensive answer should state the definition, explain the architecture or reasoning, provide a concrete example, and highlight trade-offs.`,
      feedback: 'Please expand your answers with technical depth, real examples, and structured explanations.',
      isDemoMode: true
    };
  }

  const prompt = `
You are an expert technical interviewer evaluating an interview response.
Question: "${question.questionText}"
Category: "${question.category || interviewType}"
Expected Concepts: ${(question.expectedKeyConcepts || []).join(', ') || 'Industry standard best practices'}
Candidate's Response: "${answerText}"
Duration: ${durationSeconds} seconds (${wordCount} words)

Evaluate the answer strictly based on evidence in the text.
For Technical questions: evaluate technical correctness, relevance, completeness, clarity, problem-solving.
For Behavioral questions: evaluate using the STAR framework (Situation, Task, Action, Result).
Communication indicators: Word count is ${wordCount}, speaking pace is ~${commIndicators.speakingPaceWpm} WPM.

Respond ONLY with valid JSON in this schema:
{
  "score": 85, // integer 0-100
  "categoryScores": {
    "technicalCorrectness": 85,
    "clarity": 80,
    "relevance": 90,
    "completeness": 80,
    "starStructure": 80
  },
  "strengths": ["Clear explanation of concept X", "Good practical example"],
  "weaknesses": ["Did not mention edge case Y", "Pacing could be tighter"],
  "missingConcepts": ["concept A", "concept B"],
  "suggestedAnswer": "A high-scoring model answer that thoroughly addresses the question...",
  "feedback": "Actionable feedback explaining why this score was given."
}
`;

  const aiResponse = await callGenAI(prompt, 'You are an objective, encouraging, and rigorous technical evaluator.');
  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.score !== undefined) {
        return {
          score: Math.min(Math.max(parsed.score, 0), 100),
          categoryScores: {
            technicalCorrectness: parsed.categoryScores?.technicalCorrectness || 75,
            clarity: parsed.categoryScores?.clarity || 75,
            relevance: parsed.categoryScores?.relevance || 75,
            completeness: parsed.categoryScores?.completeness || 70,
            starStructure: parsed.categoryScores?.starStructure || 70
          },
          communicationIndicators: commIndicators,
          strengths: parsed.strengths || ['Good communication of core idea'],
          weaknesses: parsed.weaknesses || ['Could include more metrics or trade-offs'],
          missingConcepts: parsed.missingConcepts || [],
          suggestedAnswer: parsed.suggestedAnswer || 'A model response covering fundamentals and architecture trade-offs.',
          feedback: parsed.feedback || 'Solid attempt with good clarity.',
          isDemoMode: false
        };
      }
    } catch (_) {}
  }

  // Deterministic evaluation engine
  let score = 70;
  const strengths = [];
  const weaknesses = [];

  // Relevance check
  const matchedConcepts = (question.expectedKeyConcepts || []).filter(c =>
    answerText.toLowerCase().includes(c.toLowerCase())
  );

  if (matchedConcepts.length > 0) {
    score += Math.min(matchedConcepts.length * 8, 20);
    strengths.push(`Addressed key concepts: ${matchedConcepts.join(', ')}.`);
  } else {
    weaknesses.push('Did not explicitly reference standard key terminology for this topic.');
  }

  // Length & depth check
  if (wordCount >= 60) {
    score += 8;
    strengths.push('Provided a thorough, structured explanation with sufficient context.');
  } else if (wordCount < 25) {
    score -= 15;
    weaknesses.push('Answer was somewhat brief; could include more real-world examples.');
  }

  // Filler words check
  if (commIndicators.fillerWordsCount > 4) {
    score -= 5;
    weaknesses.push(`Noticeable use of filler words (${commIndicators.detectedFillers.join(', ')}).`);
  } else {
    strengths.push('Concise articulation with minimal filler hesitation.');
  }

  score = Math.min(Math.max(score, 35), 95);

  const missingConcepts = (question.expectedKeyConcepts || []).filter(c => !matchedConcepts.includes(c));

  return {
    score,
    categoryScores: {
      technicalCorrectness: Math.round(score * 0.95),
      clarity: Math.min(score + 3, 98),
      relevance: Math.min(score + 5, 100),
      completeness: Math.max(score - 6, 40),
      starStructure: question.category === 'Behavioral' ? Math.round(score * 0.9) : 80
    },
    communicationIndicators: commIndicators,
    strengths: strengths.length ? strengths : ['Clear intent and willingness to tackle the problem.'],
    weaknesses: weaknesses.length ? weaknesses : ['Could provide more quantitative metrics on project results.'],
    missingConcepts: missingConcepts.length ? missingConcepts : ['In-depth edge case considerations'],
    suggestedAnswer: `In an ideal answer to "${question.questionText}", begin by clearly stating the definition or context, provide a concrete example from your work, explain how you tackled any hurdles, and conclude with the measured impact or lesson learned.`,
    feedback: `Your response scored ${score}/100. ${strengths[0] || ''} For next time: ${weaknesses[0] || 'Provide more detailed examples.'}`,
    isDemoMode: true
  };
}

// -------------------------------------------------------------
// 4. CAREER & INTERVIEW CHATBOT ASSISTANT
// -------------------------------------------------------------
async function generateChatbotResponse({ messages = [], context = {} }) {
  const latestMessage = messages[messages.length - 1]?.text || 'Hello';

  const systemPrompt = `
You are InterviewIQ Coach, an elite AI Career & Interview Preparation Mentor.
Your role:
- Help users prepare for technical, HR, and behavioral interviews.
- Review resume bullet points and suggest STAR-aligned improvements.
- Explain complex CS/Software Engineering concepts simply.
- Generate mock practice questions and provide constructive feedback.
- Help students and fresh graduates overcome interview anxiety.
Always keep responses encouraging, highly practical, structured with bullet points, and actionable.
`;

  const conversationHistory = messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
  const fullPrompt = `${conversationHistory}\nASSISTANT:`;

  const aiResponse = await callGenAI(fullPrompt, systemPrompt, 0.6);
  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      if (parsed.reply) return parsed.reply;
      if (parsed.response) return parsed.response;
    } catch (_) {
      // If AI returned plain string
      return aiResponse;
    }
  }

  // Deterministic fallback responses
  const qLower = latestMessage.toLowerCase();
  if (qLower.includes('resume') || qLower.includes('bullet')) {
    return `Here is a proven framework to optimize your resume bullet points for technical roles:
1. **Action Verb + Context + Technology + Quantifiable Result**:
   - *Before:* "Worked on backend APIs using Node.js."
   - *After:* "Architected 12 RESTful microservices using Node.js & Redis, reducing endpoint latency by 38% and supporting 15,000+ daily active users."
2. **Prioritize Impact Over Duties**: Always show *what happened* because of your code.
3. Would you like me to rewrite a specific bullet point from your resume right now?`;
  }

  if (qLower.includes('star') || qLower.includes('behavioral')) {
    return `The **STAR Method** is the gold standard for answering behavioral questions:
- **S – Situation**: Set the scene in 1-2 sentences (company, project, team).
- **T – Task**: What was your specific responsibility or the roadblock?
- **A – Action**: What exact steps did *you* take? Mention technologies, trade-offs, and communication.
- **R – Result**: What was the outcome? Use numbers if possible (e.g., delivered 2 weeks early, 0 regressions).

Try answering: *"Tell me about a time you had a technical disagreement with a team member."* and I'll review it!`;
  }

  if (qLower.includes('sql') || qLower.includes('database')) {
    return `In technical interviews, database questions usually test 4 core areas:
1. **Indexing & Execution Plans**: How B-Trees work, composite indexes, and index selectivity.
2. **ACID Properties**: Atomicity, Consistency, Isolation levels, and Durability.
3. **Joins vs Subqueries**: INNER vs LEFT vs FULL OUTER JOINs, and handling NULLs.
4. **Sharding vs Replication**: Horizontal scaling vs Read replicas.

Would you like to practice a mock SQL question now?`;
  }

  return `Welcome to **InterviewIQ AI Career Coach**! I'm here to help you ace your interviews. Here are a few things we can do together:
- **Practice Mock Questions**: Ask me for technical or behavioral questions tailored to your target role.
- **Answer Polish**: Paste your answer to any interview question and I'll grade it using industry rubrics.
- **Resume Polish**: Share a bullet point from your resume and I'll make it high-impact.
- **Technical Concepts**: Ask me to break down System Design, React internals, SQL, or Algorithms.

What would you like to focus on today?`;
}

module.exports = {
  callGenAI,
  generateInterviewQuestions,
  generateFollowUpQuestion,
  evaluateAnswer,
  generateChatbotResponse,
  analyzeCommunicationIndicators
};
