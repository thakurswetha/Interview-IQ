# System Architecture & Technical Specifications
## Project: InterviewIQ – AI-Powered Personalized Interview & Career Readiness Platform
**Academic Capstone Project (8 Credits)**

---

## 1. Executive Architectural Overview

InterviewIQ is an enterprise-grade, multi-user web application engineered to simulate realistic, voice-enabled mock interviews with an animated AI interviewer avatar, dynamic speech recognition, automated rubric grading, and multi-session performance tracking.

The system is architected around a decoupled client-server model:
- **Client Tier**: React 18 single-page application (SPA) bundled with Vite, styled with Tailwind CSS, utilizing React Router v6, Axios interceptors, Recharts data visualization, Lucide React iconography, HTML5 Web Audio/MediaDevices APIs, and Web Speech (Synthesis & Recognition).
- **Application Tier**: Node.js and Express RESTful API server featuring modular controllers, rate limiting, JWT authentication, bcrypt password hashing, and Multer file upload handling.
- **Data Persistence Tier**: MongoDB with Mongoose ODM supporting document relationships, indexing, and strict per-user multi-tenant isolation.
- **AI & NLP Intelligence Tier**: Modular GenAI gateway with native Google Gemini API / OpenAI API integration paired with a deterministic intelligent rule engine fallback ensuring 100% test reliability and zero-failure demonstration.

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|  +--------------------+  +----------------------+  +----------------------------+ |
|  |  React Components  |  |  Speech Synthesis    |  |  MediaDevices / Webcam     | |
|  |  & Tailwind Views  |  |  & SpeechRecognition |  |  Audio Stream Visualizer   | |
|  +---------+----------+  +----------+-----------+  +-------------+--------------+ |
+------------|------------------------|----------------------------|----------------+
             | REST APIs (JSON)       | Web Speech Events          | Video Track
             v                        v                            v
+-----------------------------------------------------------------------------------+
|                         INTERVIEWIQ BACKEND (NODE / EXPRESS)                      |
|                                                                                   |
|   +-----------------------+     +------------------------+                        |
|   |   Auth & Security     |     |   Resume NLP Parser    |                        |
|   |   JWT + Bcrypt        |     |   pdf-parse & mammoth  |                        |
|   +-----------------------+     +------------------------+                        |
|                                                                                   |
|   +-----------------------+     +------------------------+                        |
|   |   Job Match Engine    |     |  Answer Evaluation     |                        |
|   |   Taxonomy Overlap    |     |  Rubrics & STAR Method |                        |
|   +-----------------------+     +------------------------+                        |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |   AI Orchestration Service (Gemini API / Rule-Based Fallback Engine)      |   |
|   +---------------------------------------------------------------------------+   |
+-------------------------------------|---------------------------------------------+
                                      v
+-----------------------------------------------------------------------------------+
|                         PERSISTENCE TIER (MONGODB / MONGOOSE)                     |
|   Collections: Users, Resumes, JobDescriptions, Sessions, Reports, ChatHistories  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Subsystems

### 2.1 Animated AI Interviewer Avatar Subsystem
- **Visual Engine**: SVG-based vector rendering of candidate interviewer personas with multi-layer facial rigging:
  - Eyes: Dynamic blinking cycle (3800ms periodic timer) and gaze adjustment (thinking state looks upward, listening tilts attentiveness).
  - Mouth: Multi-stage open/closed cycle (140ms clock) linked to Web Speech Synthesis activity.
  - Audio Aura: Pulsing radial sound waves and animated equalizers synchronized with phoneme output.
  - Halo/Neural Indicator: Rotating dashed orbital ring and glowing particle effect during AI thinking/evaluation states.
- **Audio Synchronization**: Browser `SpeechSynthesis` API triggers avatar speech on question transition. Event listeners (`onstart`, `onend`, `onerror`) transition states seamlessly from `speaking` to `listening`.
- **Text & Input Fallback**: If browser speech recognition or microphone permissions are unavailable, candidate enters text responses in an integrated synchronized textarea.

### 2.2 Resume Intelligence & Extraction Engine
- **File Ingestion**: Accepts PDF and DOCX files with MIME and size constraints (10MB limit) via Multer.
- **Text Normalization**: `pdf-parse` extracts raw stream buffers; `mammoth` handles OpenXML wordprocessing documents.
- **Taxonomy Matching**: Comprehensive dictionary spanning 120+ technical languages, frameworks, cloud tools, databases, and soft skills with word boundary regex.
- **Section Parsing**: Segregates degrees, institutions, project highlights, and work history.
- **Editable Persistence**: Users can review extracted data, delete inaccurate tags, and manually append custom skills.

### 2.3 Job Description Matching Engine
- **Bidirectional Comparison**: Maps candidate's verified skills against requirements in any pasted or uploaded job description.
- **Partial Matching Graph**: Understands stack relationships (e.g. React -> JavaScript/TypeScript/Redux, Node.js -> Express/REST, PostgreSQL -> Relational SQL).
- **Explainable Scoring**:
  $$\text{Match \%} = \frac{\text{Direct Matches} \times 1.0 + \text{Partial Matches} \times 0.5}{\text{Total Job Requirements}} \times 100$$
- Clearly labeled as an estimated preparation indicator, not a definitive hiring decision.

### 2.4 Adaptive Questioning & Follow-Up Engine
- Considers candidate's previous response depth.
- If response is brief (<15 words) or introduces complex keywords (e.g., "SQL", "distributed", "indexing"), prompts targeted follow-up probes.
- Injects follow-up dynamically into interview session without breaking flow.

### 2.5 Answer Evaluation & STAR Framework Engine
- **Technical Questions**: Correctness, completeness, architectural trade-offs, and conceptual depth.
- **Behavioral Questions**: STAR Method breakdown (Situation, Task, Action, Result).
- **Communication Indicators**:
  - Words Per Minute (WPM) calculation.
  - Filler word frequency counter (`um`, `uh`, `like`, `you know`, `basically`).
  - Answer duration tracking.
- Output: Structured JSON rubric with category scores (0-100), strengths, areas to improve, and model answers.

---

## 3. Security & Multi-Tenancy Architecture
1. **Password Security**: Salted bcrypt hashing (10 salt rounds); plain-text passwords never stored or logged.
2. **Stateless JWT Authentication**: Tokens signed with HS256 secret and validated via `authMiddleware`.
3. **Data Ownership Enforcement**: Every database query on user documents enforces `userId === req.user._id`.
4. **Rate Limiting**: `express-rate-limit` prevents brute-force login and API flooding (300 requests / 15 minutes).
5. **CORS Governance**: Configured with explicit origin whitelists for authorized frontend clients.
6. **Input Sanitization**: Request bodies validated before parsing to prevent injection.

