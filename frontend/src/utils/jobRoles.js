export const JOB_CATEGORIES = [
  'All Roles',
  'Software Development',
  'Data & Analytics',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'Testing & Security',
  'Other Technology Roles'
];

export const JOB_ROLES = [
  // Software Development
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'Software Development',
    description: 'Algorithms, data structures, system design, and general full-lifecycle software delivery.'
  },
  {
    id: 'full-stack-developer',
    name: 'Full Stack Developer',
    category: 'Software Development',
    description: 'End-to-end web apps, client-server data flow, REST APIs, and database integration.'
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    category: 'Software Development',
    description: 'Modern JavaScript, React, UI component architecture, state management, and web performance.'
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    category: 'Software Development',
    description: 'Server architectures, microservices, database schemas, caching, and secure API design.'
  },
  {
    id: 'java-developer',
    name: 'Java Developer',
    category: 'Software Development',
    description: 'Core Java, OOP principles, Collections, multithreading, Spring Boot, and JVM internals.'
  },
  {
    id: 'python-developer',
    name: 'Python Developer',
    category: 'Software Development',
    description: 'Asyncio, OOP/functional patterns, Django/FastAPI, ORM optimizations, and data scripting.'
  },
  {
    id: 'react-developer',
    name: 'React Developer',
    category: 'Software Development',
    description: 'React hooks, virtual DOM reconciliation, state stores (Redux/Zustand), and Core Web Vitals.'
  },
  {
    id: 'node-developer',
    name: 'Node.js Developer',
    category: 'Software Development',
    description: 'Node.js event loop, asynchronous I/O, Express middleware, worker threads, and API scaling.'
  },
  {
    id: 'mobile-app-developer',
    name: 'Mobile App Developer',
    category: 'Software Development',
    description: 'Cross-platform (React Native/Flutter) or native mobile apps, offline caching, and mobile UX.'
  },

  // Data and Analytics
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'Data & Analytics',
    description: 'SQL window functions, data cleaning, exploratory analysis, Power BI / Tableau dashboards, and KPIs.'
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    category: 'Data & Analytics',
    description: 'Translating business requirements into data metrics, workflow analysis, and stakeholder reporting.'
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    category: 'Data & Analytics',
    description: 'Statistical modeling, predictive algorithms, hypothesis testing, feature engineering, and Python ML.'
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    category: 'Data & Analytics',
    description: 'ETL/ELT pipelines, distributed processing with Apache Spark, data warehousing, and lakehouse design.'
  },
  {
    id: 'bi-analyst',
    name: 'Business Intelligence Analyst',
    category: 'Data & Analytics',
    description: 'Enterprise data modeling, dimensional modeling, automated reporting, and interactive BI suites.'
  },
  {
    id: 'power-bi-developer',
    name: 'Power BI Developer',
    category: 'Data & Analytics',
    description: 'DAX formulas, Power Query transformations, data governance, and executive visualization decks.'
  },
  {
    id: 'sql-developer',
    name: 'SQL Developer',
    category: 'Data & Analytics',
    description: 'Advanced relational SQL, query tuning, stored procedures, indexing strategies, and database schemas.'
  },
  {
    id: 'product-analyst',
    name: 'Product Analyst',
    category: 'Data & Analytics',
    description: 'User engagement metrics, cohort retention, funnel analysis, and A/B test statistical analysis.'
  },

  // AI and Machine Learning
  {
    id: 'ai-engineer',
    name: 'AI Engineer',
    category: 'AI & Machine Learning',
    description: 'Production AI systems, model deployment, API integrations, and practical intelligence workflows.'
  },
  {
    id: 'ml-engineer',
    name: 'Machine Learning Engineer',
    category: 'AI & Machine Learning',
    description: 'Model training pipelines, hyperparameter tuning, loss optimization, MLOps, and model serving.'
  },
  {
    id: 'nlp-engineer',
    name: 'NLP Engineer',
    category: 'AI & Machine Learning',
    description: 'Tokenization, transformers, embeddings, sentiment classification, and semantic search.'
  },
  {
    id: 'genai-engineer',
    name: 'Generative AI Engineer',
    category: 'AI & Machine Learning',
    description: 'RAG architectures, vector databases, prompt engineering, PEFT/LoRA fine-tuning, and LLM guardrails.'
  },

  // Cloud and DevOps
  {
    id: 'cloud-engineer',
    name: 'Cloud Engineer',
    category: 'Cloud & DevOps',
    description: 'Cloud infrastructure (AWS/Azure/GCP), IAM permissions, serverless architectures, and networking.'
  },
  {
    id: 'aws-engineer',
    name: 'AWS Engineer',
    category: 'Cloud & DevOps',
    description: 'AWS ecosystem (EC2, S3, Lambda, ECS, RDS), VPC networking, security groups, and Cost Optimization.'
  },
  {
    id: 'azure-engineer',
    name: 'Azure Engineer',
    category: 'Cloud & DevOps',
    description: 'Azure Cloud services, Azure DevOps pipelines, Entra ID authentication, and hybrid deployments.'
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    category: 'Cloud & DevOps',
    description: 'CI/CD automation, Docker containers, Kubernetes, Terraform IaC, and monitoring pipelines.'
  },
  {
    id: 'sre',
    name: 'Site Reliability Engineer',
    category: 'Cloud & DevOps',
    description: 'SLOs/SLAs, incident response, high availability, chaos engineering, and distributed tracing.'
  },

  // Testing and Security
  {
    id: 'qa-engineer',
    name: 'QA Engineer',
    category: 'Testing & Security',
    description: 'Manual and automated quality assurance, test case design, defect tracking, and regression testing.'
  },
  {
    id: 'automation-test-engineer',
    name: 'Automation Test Engineer',
    category: 'Testing & Security',
    description: 'Cypress, Selenium, Playwright, test pyramid strategy, API testing, and CI pipeline test execution.'
  },
  {
    id: 'software-test-engineer',
    name: 'Software Test Engineer',
    category: 'Testing & Security',
    description: 'Functional testing, performance load testing, boundary analysis, and cross-platform verification.'
  },
  {
    id: 'cybersecurity-analyst',
    name: 'Cybersecurity Analyst',
    category: 'Testing & Security',
    description: 'OWASP Top 10 web vulnerabilities, threat analysis, SIEM log monitoring, and Zero Trust security.'
  },

  // Other Technology Roles
  {
    id: 'dba',
    name: 'Database Administrator',
    category: 'Other Technology Roles',
    description: 'Database health, B-tree indexing, backup & point-in-time recovery, replication, and query optimization.'
  },
  {
    id: 'system-engineer',
    name: 'System Engineer',
    category: 'Other Technology Roles',
    description: 'Operating systems (Linux/Windows), server administration, networking protocols, and systems infrastructure.'
  },
  {
    id: 'tech-support-engineer',
    name: 'Technical Support Engineer',
    category: 'Other Technology Roles',
    description: 'Technical troubleshooting, root cause analysis, customer escalations, and technical documentation.'
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    category: 'Other Technology Roles',
    description: 'Product Requirements Documents (PRDs), roadmap prioritization (RICE), user stories, and feature launches.'
  },
  {
    id: 'tech-business-analyst',
    name: 'Technical Business Analyst',
    category: 'Other Technology Roles',
    description: 'Bridging engineering and business, technical specification authoring, and system flow modeling.'
  }
];

