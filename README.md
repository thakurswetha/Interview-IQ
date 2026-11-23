# InterviewIQ – AI-Powered Personalized Interview & Career Readiness Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6.4-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x%20%7C%20Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Test Suite](https://img.shields.io/badge/QA%20Tests-46%2F46%20Passing-brightgreen.svg)](backend/test-qa-comprehensive.js)

---

## 1. Project Overview & Executive Summary

**InterviewIQ** is an enterprise-grade, AI-powered mock interview and career readiness web platform engineered for students, graduates, and aspiring software professionals. 

The platform bridges the critical divide between academic learning and real-world hiring by simulating realistic, voice-enabled technical and behavioral interviews. It features an interactive animated AI interviewer avatar, real-time speech recognition, live webcam preview, dynamic role-specific question generation across 33+ engineering disciplines, automated rubric evaluation (including the STAR framework), and multi-session performance analytics.

### Key Objectives:
- **Democratize Interview Coaching**: Provide high-fidelity, personalized interview practice accessible 24/7 without costly human tutors.
- **Role-Specific Realism**: Generate authentic domain questions spanning Software Engineering, Data & Analytics, AI/ML, Cloud/DevOps, QA/Testing, and Security, or any user-defined custom role.
- **Multimodal Interaction**: Synchronize visual facial avatar cues with speech synthesis and voice-to-text recognition with instant text-input fallback.
- **Explainable, Actionable Feedback**: Provide transparent rubric scoring, communication pace (WPM), filler word detection, and model answers rather than opaque numerical scores.

---

## 2. Problem Statement & Need

Traditional interview preparation suffers from three major flaws:
1. **Passive Practice**: Candidates memorize static interview question banks (e.g., LeetCode, blog posts) without rehearsing verbal articulation under time pressure.
2. **High Cost of Human Mock Interviews**: Professional human mock interviewers charge \$100–\$250/hour, making continuous practice inaccessible to most college students.
3. **Subjective & Delayed Feedback**: Peer mock interviews lack standardized scoring rubrics, resulting in inconsistent feedback on technical completeness and delivery cadence.

**InterviewIQ** solves these challenges by combining document intelligence (resume parsing and job description matching) with an interactive conversational AI avatar and an objective 5-factor scoring engine.

---

## 3. System Architecture

InterviewIQ follows a modular, multi-tier **Client-Server REST Architecture**:

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  React 18 + Vite SPA | Tailwind CSS Dark Navy UI | Lucide Icons | Recharts       |
|  - Web Speech API (SpeechRecognition + SpeechSynthesis)                           |
|  - MediaDevices API (Webcam video stream)                                         |
|  - Axios Client with JWT Bearer Interceptors & Reactive Toast System              |
+-----------------------------------------------------------------------------------+
                                       |
                                       | HTTPS / JSON & Multipart REST API
                                       v
+-----------------------------------------------------------------------------------+
|                             BACKEND API GATEWAY                                   |
|  Node.js (v24.x) + Express.js REST Engine                                         |
|  - Auth Middleware: JWT Verification, Stateless Session, bcrypt Password Hashing  |
|  - Multer Ingestion: PDF/DOCX file validation & disk storage                      |
|  - CORS, Rate Limiting & Centralized Express Error Handling                       |
+-----------------------------------------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
+------------------------------------+ +--------------------------------------------+
|        INTELLIGENCE SERVICES       | |             PERSISTENCE LAYER              |
| - AI Service (Gemini REST Gateway  | | MongoDB 8.x via Mongoose ODM               |
|   + Deterministic Rule Engine)     | | - Users Collection (bcrypt, enums)         |
| - Resume Parser (pdf-parse/mammoth | | - Resumes Collection (skills, projects)    |
|   + Taxonomy Extraction)           | | - JobDescriptions Collection (requirements)|
| - Job Matcher (Skill graph overlap | | - InterviewSessions (questions, answers)   |
|   & explainable math)              | | - InterviewReports (rubric grades, trends) |
| - Communication Analyzer (WPM,     | | - ChatHistories (coach message memory)     |
|   filler word regex)               | +--------------------------------------------+
+------------------------------------+
```

---

## 4. Technology Stack

### Frontend:
- **Framework**: React.js (v18.3) with Vite 6 build pipeline.
- **Styling**: Tailwind CSS (v3.4) with Dark Navy palette (`#0B1120`, `#0F172A`) and glassmorphic panels.
- **Routing**: React Router DOM (v6) with protected client routes.
- **Data Visualization**: Recharts (Radar, Line, Area, and Bar charts).
- **Icons**: Lucide React.
- **Voice & Media**: HTML5 MediaDevices API, Web Speech API (`SpeechSynthesis` & `SpeechRecognition`), `canvas-confetti`.

### Backend:
- **Runtime**: Node.js (v24.x) & Express.js REST architecture.
- **Database**: MongoDB 8.x via Mongoose ODM (supports local instance or MongoDB Atlas).
- **Security**: JSON Web Tokens (JWT), bcryptjs password hashing, rate limiting, and CORS.
- **Document Extractors**: `pdf-parse` (binary PDF streams) and `mammoth` (DOCX OpenXML).
- **AI Engine**: Modular GenAI Gateway supporting Google Gemini 1.5 Flash / OpenAI GPT-4o-mini with an intelligent, role-aware rule-engine fallback.

---

## 5. Expanded Job Role Taxonomy (33+ Roles Supported)

InterviewIQ supports specialized question synthesis across 6 primary industry categories plus custom definitions:

| Category | Supported Job Roles | Core Technical Focus Areas |
| :--- | :--- | :--- |
| **Software Development** | Software Engineer, Full Stack Developer, Frontend Developer, Backend Developer, Java Developer, Python Developer, React Developer, Node.js Developer, Mobile App Developer | OOP, JVM/GC, Event Loop, Virtual DOM, React Lifecycle, Async I/O, REST/GraphQL, Algorithms. |
| **Data and Analytics** | Data Analyst, Business Analyst, Data Scientist, Data Engineer, Business Intelligence Analyst, Power BI Developer, SQL Developer, Product Analyst | Window functions (`ROW_NUMBER`, `RANK`), CTEs, Power BI/Tableau, ETL pipelines, Spark, Star Schema. |
| **AI and Machine Learning** | AI Engineer, Machine Learning Engineer, NLP Engineer, Generative AI Engineer | Transformers, Attention mechanism, RAG architectures, Vector DBs, LoRA/PEFT, Precision/Recall. |
| **Cloud and DevOps** | Cloud Engineer, AWS Engineer, Azure Engineer, DevOps Engineer, Site Reliability Engineer | Multi-stage Dockerfiles, Kubernetes Control Plane/Pods/Services, Terraform IaC, CI/CD pipelines. |
| **Testing and Security** | QA Engineer, Automation Test Engineer, Software Test Engineer, Cybersecurity Analyst | Cypress/Selenium POM, Flaky tests, Test Pyramid, OWASP Top 10 (SQLi, XSS, CSRF), Zero Trust, SIEM. |
| **Other Technology Roles**| Database Administrator, System Engineer, Technical Support Engineer, Product Manager, Technical Business Analyst | B-Tree indexing, Replication, HA/PITR, PRDs, RICE scoring, North Star metrics, A/B testing. |
| **Custom Job Role** | **Other / Custom Job Role** | User inputs custom title (e.g. *Autonomous Flight Engineer*); AI synthesizes custom technical questions. |

---

## 6. Core Modules & Capabilities

1. **Secure Authentication & Multi-Tenancy**:
   - Encrypted registration with bcrypt password hashing (minimum 6 characters enforced).
   - Stateless JWT authorization with protected API route guards and 7-day expiration.
   - Strict tenant isolation: users can never view, update, or tamper with another candidate's resumes, jobs, sessions, or reports (returns `403 Forbidden`).

2. **Resume Intelligence & Taxonomy Extraction**:
   - Multipart PDF/DOCX resume file upload.
   - Text extraction via `pdf-parse` and `mammoth` with fallback UTF-8 readers.
   - Auto-categorizes skills into Technical, Frameworks, Tools, and Soft Skills.
   - Extracts candidate projects, education credentials, and career keywords.
   - Interactive profile editor allowing candidates to correct parsed data.

3. **Job Description & Skill Match Analysis**:
   - Supports job description text input or document upload (PDF/DOCX).
   - Generates an explainable match percentage ($15\%–98\%$) based on direct and related skill overlaps.
   - Identifies missing required skills and generates prioritized study topics.

4. **Human-Like Animated AI Interviewer**:
   - Visual SVG avatar with synchronized lip-sync mouth movement during speech synthesis.
   - Periodic randomized eye blinking and expressive pupil shifts.
   - Three distinct avatar states: `speaking`, `listening`, and `thinking`.
   - Selectable interviewer personas: Alex Morgan (Technical Architect), Sarah Chen (Talent Director), David Kim (Staff Systems Engineer).

5. **Live Voice & Video Mock Interview Room**:
   - Real-time candidate webcam video preview with camera and mic toggles.
   - Web Speech API speech-to-text with continuous transcription.
   - Browser speech synthesis audio narration with customizable pacing.
   - Text fallback input with instant manual editing.
   - Elapsed timer and live question progression indicators.

6. **Adaptive Questioning Engine**:
   - Analyzes candidate answers in real time.
   - If an answer is brief or introduces a technical nuance, the system dynamically injects an adaptive follow-up probe.

7. **STAR Rubric & Performance Analytics**:
   - Evaluates technical accuracy, clarity, completeness, and behavioral STAR structure.
   - Analyzes speaking cadence (Words Per Minute) and filler word occurrences (`um`, `like`, `basically`).
   - Generates printable PDF scorecards, Recharts radar charts, multi-session trendlines, and customized preparation recommendations.

8. **24/7 AI Career Coach Chatbot**:
   - Persistent floating chat widget available across all authenticated views.
   - Retains multi-turn conversation memory in MongoDB for persistent resume reviews and rapid mock drilling.

---

## 7. Database Schema & Collections

| Collection | Schema Highlights & Relationships |
| :--- | :--- |
| **`users`** | `name`, `email` (unique, lowercase), `passwordHash`, `education`, `careerInterest`, `experienceLevel` (enum: Beginner, Intermediate, Advanced, Fresh Graduate), `targetIndustry`, `resetPasswordToken`. |
| **`resumes`** | `userId` (ref: User), `originalFileName`, `filePath`, `parsedSkills` (technical, frameworks, tools, softSkills), `parsedProjects`, `parsedEducation`, `extractedText`, `isPrimary`. |
| **`jobdescriptions`** | `userId` (ref: User), `jobTitle`, `company`, `description`, `requiredSkills`, `matchAnalysis` (matchPercentage, matchedSkills, missingSkills, recommendedTopics). |
| **`interviewsessions`**| `userId` (ref: User), `resumeId`, `jobDescriptionId`, `targetRole`, `interviewType` (Mixed, Technical, Behavioral, Project-Based, HR), `difficulty`, `interviewerPersona`, `questions` (subdocument array), `answers` (subdocument array), `status`. |
| **`interviewreports`** | `sessionId` (ref: InterviewSession), `userId` (ref: User), `overallScore`, `categoryBreakdown`, `strengths`, `weaknesses`, `missingConcepts`, `communicationMetrics` (WPM, fillerWordsCount), `performanceRating`. |
| **`chathistories`** | `userId` (ref: User), `messages` array (`sender`: user/assistant, `text`, `timestamp`). |

---

## 8. REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` – Register new user with validated email, name, password ($\ge 6$ chars), and experience level.
- `POST /api/auth/login` – Authenticate user and receive JWT bearer token.
- `GET /api/auth/me` – Retrieve current authenticated user profile.
- `POST /api/auth/forgot-password` – Generate secure password reset token.
- `POST /api/auth/reset-password/:token` – Reset password with verified token.

### User Profile (`/api/users`)
- `GET /api/users/profile` – Get current user profile details.
- `PUT /api/users/profile` – Update candidate name, target role, and career interest.

### Resume Intelligence (`/api/resumes`)
- `POST /api/resumes/upload` – Multipart upload PDF/DOCX; extracts skills, projects, and education.
- `GET /api/resumes` – List all uploaded resumes for authenticated user.
- `GET /api/resumes/:id` – Retrieve parsed resume by ID (enforces ownership).
- `PUT /api/resumes/:id` – Save manual edits to extracted resume fields.
- `DELETE /api/resumes/:id` – Delete resume record and associated file.

### Job Descriptions & Matching (`/api/jobs`)
- `POST /api/jobs` – Save job description via text input with auto-skill extraction.
- `POST /api/jobs/upload` – Upload job description document (PDF/DOCX).
- `GET /api/jobs` – List all job descriptions for current user.
- `POST /api/jobs/:id/match` – Analyze skill overlap between resume and job description.
- `DELETE /api/jobs/:id` – Delete job description document.

### Interview Suite (`/api/interviews`)
- `POST /api/interviews/start` – Initialize interview session with role-specific questions.
- `GET /api/interviews` – List user's historical interview sessions.
- `GET /api/interviews/:id` – Get live session state and question deck.
- `POST /api/interviews/:id/answer` – Submit speech/text answer, calculate rubric score, and trigger adaptive follow-ups.
- `POST /api/interviews/:id/complete` – Conclude interview and generate comprehensive report.

### Reports & Analytics (`/api/reports`)
- `GET /api/reports/:sessionId` – Get detailed performance scorecard by session ID.
- `GET /api/reports/history` – Get all historical reports for authenticated user.
- `GET /api/reports/analytics` – Get aggregated category trends, average scores, and recurring weaknesses.

### AI Career Coach (`/api/chat`)
- `POST /api/chat/message` – Send message to AI coach; receives guidance and updates chat memory.
- `GET /api/chat/history` – Get complete chat message history for authenticated user.
- `DELETE /api/chat/history` – Clear chat message history.

---

## 9. Installation & Execution Guide

### Prerequisites
- **Node.js**: v18.x or v20.x or v24.x installed.
- **MongoDB**: Local MongoDB instance running on port `27017` or MongoDB Atlas connection string.
- **Git**: Installed.

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/InterviewIQ.git
cd InterviewIQ

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Environment Configuration
Create `backend/.env` file with the following configuration:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/interviewiq
JWT_SECRET=interviewiq_super_secret_jwt_key_2026_capstone_academic_secure
JWT_EXPIRES_IN=7d
AI_API_KEY=
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(Leaving `AI_API_KEY` empty activates the Intelligent Rule Engine fallback, guaranteeing 100% functionality and test pass rates without external API dependencies or network latency).*

### Step 3: Run the Application

**Terminal 1 (Backend Server)**:
```bash
cd backend
npm start
# Server listens on http://localhost:5000
# Connected to MongoDB on 127.0.0.1:27017
```

**Terminal 2 (Frontend Dev Server)**:
```bash
cd frontend
npm run dev
# Vite dev server running on http://localhost:5173
```

Open your browser to: **http://localhost:5173**

---

## 10. Automated Testing & Verification Results

InterviewIQ includes two comprehensive automated test suites executed against the live application:

### Test Suite 1: Comprehensive Capstone QA & Security Suite (`backend/test-qa-comprehensive.js`)
```bash
node backend/test-qa-comprehensive.js
```
**Results: 46 / 46 Assertions Passed (100% Pass Rate)**
- **Section 1: Health & System Diagnostics**: 2/2 Passed (Status online, zero API key leakage).
- **Section 2: User Auth & Profile Lifecycle**: 4/4 Passed (Registration, JWT token, profile retrieval & updates).
- **Section 3: Resume Ingestion & Parsing**: 4/4 Passed (Real PDF parsing, skill extraction, project extraction, ID retrieval).
- **Section 4: Job Description & Match Engine**: 4/4 Passed (Text creation, document parsing, explainable match %, missing skills).
- **Section 5: Role-Specific Interview Generation**: 8/8 Passed (Data Analyst, Frontend Developer, Java Developer, Data Engineer, AI Engineer, DevOps Engineer, QA Engineer, Custom Role).
- **Section 6: Live Simulation & Answer Evaluation**: 5/5 Passed (Session creation, rubric scoring, category breakdowns, adaptive follow-up, session completion).
- **Section 7: Reports, History & Analytics**: 4/4 Passed (Report retrieval, strengths/weaknesses, history listing, aggregate trendlines).
- **Section 8: AI Career Coach Chatbot**: 3/3 Passed (Message dispatch, STAR advice generation, conversation history persistence).
- **Section 9: Multi-User Security & Isolation**: 7/7 Passed (Cross-tenant resume, JD, session, report, and answer blocking with 403 Forbidden; unauth blocking with 401).
- **Section 10: Input Validation & Constraints**: 5/5 Passed (Duplicate email 400, password $<6$ chars 400, bad login 401, non-existent ID 404, empty chat 400).

### Test Suite 2: Core End-to-End Regression Suite (`backend/test-backend.js`)
```bash
node backend/test-backend.js
```
**Results: 18 / 18 Endpoints Passed (100% Pass Rate)**

### Frontend Production Build
```bash
npm run build --prefix frontend
```
**Result: 2082 modules transformed, built in 22.78s with 0 errors.**

---

## 11. Security & Privacy Architecture

- **Stateless Authorization**: All protected endpoints require a signed `Bearer <JWT>` header verified by `middleware/auth.js`.
- **Zero API Key Exposure**: All AI credentials (`AI_API_KEY`) remain strictly isolated on the backend. The client never receives or stores external API tokens.
- **Strict Tenant Sandboxing**: Every database lookup verifies `resource.userId.toString() === req.user._id.toString()`. Unauthorized requests are rejected with `403 Forbidden`.
- **File Upload Safety**: Multer disk storage restricts uploads to `.pdf`, `.docx`, and `.doc` with a strict 10MB file size ceiling and sanitized filenames.
- **Sanitized Passwords**: Passwords are encrypted using salted bcrypt hashing ($10$ rounds) before saving to MongoDB and are omitted from all JSON responses.

---

## 12. Academic Viva & Examiner Evaluation Guide

When presenting InterviewIQ for academic evaluation or viva, highlight these architectural distinctions:

1. **How is the AI interviewer avatar animated?**
   - The avatar in `AnimatedAvatar.jsx` is rendered using vector SVG elements with dynamic CSS transforms. When `SpeechSynthesis` is vocalizing a question, the mouth SVG path interpolates vertically in real time, pausing during silent intervals and transitioning between `speaking`, `listening`, and `thinking` states.

2. **How does the system ensure role-specific relevance?**
   - In `backend/services/aiService.js`, the generation engine inspects `targetRole`. It applies specialized domain question banks for 33+ roles (e.g., SQL CTEs/window functions for Data Analysts, JVM memory and `HashMap` concurrency for Java Developers, and multi-stage Docker builds for DevOps Engineers). Custom roles dynamically integrate candidate skills and custom titles.

3. **How is adaptive questioning achieved?**
   - In `interviewController.js`, answer submissions trigger `generateFollowUpQuestion`. If a candidate's answer is brief or introduces specific architectural concepts, the system synthesizes an adaptive follow-up question and increments `totalQuestionsTarget` dynamically.

4. **How are communication indicators measured without video AI?**
   - The system tracks answer audio duration and analyzes speech-to-text word counts to compute Words Per Minute (optimal: 120–150 WPM). Regex pattern matching detects filler hesitation words (`um`, `uh`, `like`, `basically`, `you know`), providing actionable delivery feedback without pseudo-scientific facial emotion bias.

---

## 13. Limitations & Future Scope

### Current Limitations:
- **Browser Speech Recognition Support**: Web Speech API is natively supported in Chromium-based browsers (Google Chrome, Microsoft Edge, Brave). In other browsers (e.g., Firefox), the platform gracefully provides the integrated text answer editor.
- **Audio Output Device Selection**: Relies on browser-default audio output devices for text-to-speech playback.

### Future Enhancements:
- **Real-Time Code Execution Sandbox**: Integrating a sandboxed Monaco code editor with Docker-based code execution for live technical coding rounds.
- **Company-Specific Question Packs**: Curated question banks tailored to specific hiring loops (e.g., FAANG, consulting firms, high-frequency trading).
- **Peer & Mentor Review Mode**: Allowing verified alumni or industry mentors to review recorded mock sessions and annotate timestamped feedback.

---

## 14. License

Distributed under the **ISC License**. Developed with precision for professional interview intelligence and career readiness.
