# Local Environment Setup & Installation Guide
## Project: InterviewIQ – AI-Powered Personalized Interview & Career Readiness Platform

This guide provides end-to-end instructions for setting up, configuring, and executing the InterviewIQ platform locally or deploying to production.

---

## 1. Prerequisites

Before installing, ensure your environment has:
- **Node.js**: v18.0.0 or higher (v20+ or v24 recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on port 27017, OR a free MongoDB Atlas cloud cluster URI.
  *(Note: The backend `config/db.js` includes an automatic local mongod launcher fallback if MongoDB is installed locally at `C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe`)*
- Modern web browser: Google Chrome, Microsoft Edge, or Firefox (Chrome or Edge recommended for native Web Speech SpeechRecognition support).

---

## 2. Repository Installation

Clone or open the workspace folder:
```bash
cd InterviewIQ
```

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

---

## 3. Environment Configuration

### Backend Configuration (`backend/.env`)
Copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```

Review and adjust variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/interviewiq
JWT_SECRET=interviewiq_super_secret_jwt_key_2026_capstone_academic_secure
JWT_EXPIRES_IN=7d
AI_API_KEY=your_gemini_or_openai_api_key_here
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **AI Provider Configuration Note**:
> - If `AI_API_KEY` is provided, the backend connects natively to the Google Gemini API (or OpenAI if `AI_PROVIDER=openai`).
> - If `AI_API_KEY` is blank or omitted, the application automatically engages its **Intelligent Deterministic Rule Engine**. This provides realistic, context-specific questions, adaptive follow-ups, rubric scoring, and chatbot responses with zero external API dependencies—ensuring 100% reliability during academic evaluations!

---

## 4. Running the Application

### Option A: Running Backend and Frontend in Separate Terminals

**Terminal 1 (Backend Server)**:
```bash
cd backend
npm start
# Server listens at http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

**Terminal 2 (Frontend Client)**:
```bash
cd frontend
npm run dev
# Frontend Vite dev server starts at http://localhost:5173
```

Open your browser to: **http://localhost:5173**

---

## 5. Verification & Testing

To execute the automated end-to-end backend test suite:
```bash
cd backend
npm test
```
The test suite validates:
1. Health check & configuration
2. User registration & duplicate email handling
3. User authentication & JWT issuance
4. Profile retrieval and update
5. Resume persistence & parsing
6. Job description creation & skill overlap match calculation
7. Dynamic question generation
8. Candidate answer submission & WPM / filler word communication analysis
9. AI rubric answer scoring (technical & behavioral STAR criteria)
10. Adaptive follow-up question generation
11. Interview session completion & report synthesis
12. Performance analytics & historical trend generation
13. AI Career Coach assistant chat

---

## 6. Examiner Demonstration Quick-Start Workflow
For an evaluator or academic reviewer:
1. Navigate to **http://localhost:5173**.
2. Click **Get Started Free** and register a candidate account (e.g., `Alex Turner`).
3. Click **Upload Resume** -> Click **Load Sample Candidate Resume** (one-click instant resume loader).
4. Review the extracted skills, projects, and education on the **Resume Analysis** dashboard.
5. Click **Target Role Matcher** -> Click **Load Sample Full Stack JD** -> Click **Analyze Skill Match**.
6. Observe the explainable skill match score, matched vs missing skills, and prep topics.
7. Click **Start Mock Interview for This Role** -> Configure difficulty, persona, and length -> Click **Enter Live AI Interview Room**.
8. Grant microphone & webcam permissions (or use the simulated text fallback).
9. Watch the animated avatar speak the question with synchronized lip-sync and audio waves.
10. Answer via voice or type in your response, then click **Submit & Next Question**.
11. Complete the interview to review the **Radar Competency Chart**, communication metrics, and question-by-question rubrics.
12. Ask the **Ask AI Coach** floating assistant any question (e.g. *"Give me 3 tips for the STAR method"*).

