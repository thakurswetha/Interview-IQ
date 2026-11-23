# REST API Specification & Endpoint Documentation
## Project: InterviewIQ – AI-Powered Personalized Interview & Career Readiness Platform

All protected endpoints require the following HTTP Header:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints (`/api/auth`)

### POST `/api/auth/register`
Creates a new candidate account.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "education": "B.Tech Computer Science",
    "careerInterest": "Full Stack Software Engineer",
    "experienceLevel": "Beginner"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "_id": "674...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "experienceLevel": "Beginner"
    }
  }
  ```

### POST `/api/auth/login`
Authenticates an existing user.
- **Access**: Public
- **Request Body**: `{ "email": "jane@example.com", "password": "Password123!" }`
- **Response (200 OK)**: Returns JWT token and sanitized user profile.

### GET `/api/auth/me`
Retrieves currently authenticated candidate profile.
- **Access**: Private (Bearer Token)
- **Response (200 OK)**: `{ "success": true, "user": { ... } }`

### POST `/api/auth/forgot-password`
Simulates password reset workflow or issues reset token.
- **Access**: Public
- **Request Body**: `{ "email": "jane@example.com" }`
- **Response (200 OK)**: `{ "success": true, "message": "...", "demoResetToken": "..." }`

---

## 2. User Profile Management (`/api/users`)

### GET `/api/users/profile`
Returns current profile details.

### PUT `/api/users/profile`
Updates candidate profile fields.
- **Request Body**: `{ "bio": "...", "targetIndustry": "...", "careerInterest": "..." }`
- **Response (200 OK)**: Returns updated user document.

---

## 3. Resume Intelligence (`/api/resumes`)

### POST `/api/resumes/upload`
Uploads and parses a PDF or DOCX resume.
- **Access**: Private
- **Content-Type**: `multipart/form-data`
- **Payload**: `resume: <Binary File>`
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "resume": {
      "_id": "674...",
      "originalFileName": "Resume.pdf",
      "parsedSkills": {
        "technical": ["JavaScript", "Python"],
        "frameworks": ["React", "Express"],
        "tools": ["Docker", "PostgreSQL"],
        "softSkills": ["Problem Solving"]
      },
      "parsedEducation": [...],
      "parsedProjects": [...],
      "parsedExperience": [...],
      "summary": "..."
    }
  }
  ```

### GET `/api/resumes`
Lists all resumes uploaded by the current user.

### GET `/api/resumes/:id`
Retrieves single parsed resume (enforces user ownership).

### PUT `/api/resumes/:id`
Allows candidate to review and correct parsed skills, education, projects, or summary.

### DELETE `/api/resumes/:id`
Deletes resume document and removes physical file from disk.

---

## 4. Job Description Matching (`/api/jobs`)

### POST `/api/jobs`
Saves a job description and auto-extracts requirements.
- **Request Body**:
  ```json
  {
    "jobTitle": "Full Stack Engineer",
    "company": "Stripe",
    "description": "We are seeking a React and Node.js developer..."
  }
  ```

### GET `/api/jobs`
Lists user's saved job descriptions.

### POST `/api/jobs/:id/match`
Compares job requirements against candidate's resume.
- **Request Body**: `{ "resumeId": "674..." }`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "matchPercentage": 78,
    "matchedSkills": ["React", "Node.js", "Docker"],
    "partiallyMatchedSkills": ["PostgreSQL"],
    "missingSkills": ["AWS Lambda"],
    "recommendedTopics": ["Practical implementation of AWS Lambda"],
    "focusAreas": ["Deep-dive technical questions into React, Node.js"]
  }
  ```

---

## 5. Mock Interview Sessions (`/api/interviews`)

### POST `/api/interviews/start`
Initializes a new AI mock interview session.
- **Request Body**:
  ```json
  {
    "resumeId": "674...",
    "jobDescriptionId": "674...",
    "interviewType": "Mixed",
    "difficulty": "Intermediate",
    "totalQuestionsTarget": 5,
    "interviewerPersona": {
      "name": "Alex Morgan",
      "title": "Principal Technical Architect",
      "avatarStyle": "modern-tech"
    }
  }
  ```
- **Response (201 Created)**: Returns session object with generated questions array.

### GET `/api/interviews/:id`
Retrieves live interview session state, questions, answers, and interviewer persona.

### POST `/api/interviews/:id/answer`
Submits candidate answer for current question, calculates speaking pace and filler words, evaluates via AI rubric, and checks for adaptive follow-up.
- **Request Body**:
  ```json
  {
    "questionId": "q_1",
    "answerText": "In our application we used React for UI state and Node.js with Express...",
    "durationSeconds": 45
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "evaluation": {
      "score": 82,
      "categoryScores": { "technicalCorrectness": 85, "clarity": 80 },
      "strengths": ["Clear explanation of component state"],
      "weaknesses": ["Could mention caching trade-offs"],
      "suggestedAnswer": "..."
    },
    "followUpAdded": true,
    "followUpQuestion": {
      "questionId": "q_fu_...",
      "questionText": "How would you handle race conditions in that state flow?",
      "isFollowUp": true
    },
    "nextQuestionIndex": 1,
    "isFinished": false
  }
  ```

### POST `/api/interviews/:id/complete`
Concludes session, calculates overall score, and generates `InterviewReport`.

---

## 6. Performance Reports & Analytics (`/api/reports`)

### GET `/api/reports/:sessionId`
Retrieves complete evaluation scorecard for an interview session.

### GET `/api/reports/history`
Returns chronological list of candidate's past interview reports.

### GET `/api/reports/analytics`
Computes aggregate metrics across all historical interviews:
- Overall average score & highest score
- Radar category averages (Technical, Communication, Relevance, STAR, Completeness)
- Multi-session trend arrays for Recharts line and bar graphs
- Recurring weakness frequency distribution
- Personalized curriculum recommendations

---

## 7. AI Career Coach Chatbot (`/api/chat`)

### POST `/api/chat/message`
Sends user message to AI coach and returns reply.
- **Request Body**: `{ "message": "How do I answer tell me about a time you failed?" }`
- **Response (200 OK)**: `{ "success": true, "reply": "...", "messages": [...] }`

### GET `/api/chat/history`
Loads chat conversation history.

### DELETE `/api/chat/clear`
Clears chat history.

