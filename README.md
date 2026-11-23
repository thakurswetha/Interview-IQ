# Interview-IQ
# InterviewIQ – AI-Powered Personalized Interview and Career Readiness Platform

<p align="center">
  <strong>Practice Smarter. Interview Better. Build Confidence.</strong>
</p>

InterviewIQ is an AI-powered interview preparation platform designed to help students and job seekers prepare for interviews through personalized questions, resume analysis, job-role matching, mock interviews, and performance evaluation.

Developed as a B.Tech capstone project at **SR University**, InterviewIQ aims to make interview preparation more practical, interactive, and personalized.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Limitations](#limitations)
- [Future Enhancements](#future-enhancements)
- [Team Members](#team-members)
- [Mentor](#mentor)

---

## Overview

Many students prepare for interviews by reading questions and studying theoretical concepts. However, answering questions confidently in a real interview environment requires practice, communication skills, and structured preparation.

InterviewIQ addresses this challenge by providing a personalized interview practice environment.

Users can upload their resumes, select a target job role, identify relevant skills, practice interview questions, and review their performance through structured feedback.

The platform combines AI-assisted features with application-level validation and evaluation logic to create a more guided interview preparation experience.

## Problem Statement

Traditional interview preparation platforms often provide generic questions that may not reflect an individual's resume, skills, projects, or target job role.

InterviewIQ aims to address this gap by connecting resume information, job requirements, personalized interview questions, and performance tracking in one platform.

## Key Features

### 1. Resume Upload and Validation
- Upload resumes in PDF and DOCX formats.
- Validate uploaded resume files and content.
- Extract relevant information such as skills, education, and projects.
- Organize extracted information into an editable profile.

### 2. Job Description Matching
- Compare resume skills with job requirements.
- Generate an estimated job match percentage.
- Identify matching and missing skills.
- Help users understand areas that need improvement.

### 3. Personalized Interview Questions
- Generate questions based on the selected job role.
- Support multiple interview categories.
- Allow users to enter custom job titles.
- Provide different difficulty levels.

### 4. AI-Powered Mock Interviews
- Interactive interview environment with an animated AI interviewer.
- Support voice-based and text-based responses.
- Webcam preview during interview practice.
- Configurable interview length and question categories.

### 5. Answer Evaluation and Feedback
- Evaluate responses using a structured assessment rubric.
- Consider technical correctness, relevance, clarity, completeness, and STAR-method alignment.
- Provide feedback to help improve interview answers.
- Track performance across interview sessions.

### 6. Performance Analytics
- Display completed interview sessions.
- Track scores and performance trends.
- Provide session-wise performance breakdowns.
- Help users identify areas for improvement.

### 7. Authentication and Data Protection
- User authentication.
- Password hashing.
- User-specific data access and authorization checks.

---

## How It Works

The InterviewIQ workflow follows these steps:

1. **Register or Log In:** Access the platform through a user account.
2. **Upload Resume:** Submit a resume in PDF or DOCX format.
3. **Analyze Profile:** Extract relevant skills, education, and project details.
4. **Select Target Role:** Choose a job role or enter a custom designation.
5. **Match Job Requirements:** Compare the resume against a target job description.
6. **Configure Interview:** Select interview category, difficulty, and question count.
7. **Start Mock Interview:** Answer questions through voice or text.
8. **Review Feedback:** View evaluation results and suggestions.
9. **Track Progress:** Analyze performance across completed sessions.

---

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| Database ODM | Mongoose |
| AI Integration | As implemented in the project |
| Development Environment | Visual Studio Code |
| Version Control | Git and GitHub |

---

## Project Architecture

InterviewIQ follows a client-server architecture.

```text
                 INTERVIEWIQ
                      |
          +-----------+-----------+
          |                       |
       Frontend                Backend
       React.js              Node.js
          |                 Express.js
          |                       |
          +---------- API --------+
                                  |
                              MongoDB
                                  |
                         User and Project Data
```

**Frontend:** Handles the user interface, resume upload, interview configuration, mock interview experience, and analytics.

**Backend:** Handles API requests, authentication, application logic, resume processing, interview workflows, and evaluation.

**Database:** Stores application data and user-related information.

---

## Installation and Setup

Follow these steps to run InterviewIQ locally.

### Prerequisites

Install the following before starting:

- [Node.js](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a configured MongoDB database
- [Visual Studio Code](https://code.visualstudio.com/)
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project directory:

```bash
cd InterviewIQ
```

### 2. Backend Setup

Open the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory and configure the required environment variables.

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

### 4. Start the Application

Start the backend using the script defined in its `package.json`. For example:

```bash
npm run dev
```

Start the frontend in another terminal using its configured development script:

```bash
npm run dev
```

Open the local frontend URL displayed in the terminal, commonly:

```text
http://localhost:5173
```

**Note:** The commands and port numbers should match the actual scripts and configuration in your repository.

---

## Environment Variables

Create a `.env` file in the backend directory.

Example configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional API keys or configuration variables required by your implementation.

**Important:** Never upload real passwords, database credentials, API keys, JWT secrets, or private configuration files to GitHub.

Add `.env` to your `.gitignore` file.

---

## Screenshots

Add screenshots of your actual application in this section.

| Application Module | Screenshot |
|---|---|
| Dashboard | Add dashboard screenshot |
| Resume Analysis | Add resume analysis screenshot |
| Job Role Selection | Add role selection screenshot |
| Interview Configuration | Add interview setup screenshot |
| Mock Interview | Add interview room screenshot |
| Performance Analytics | Add analytics screenshot |

---

## Limitations

- Browser-based speech recognition depends on browser support and permissions.
- Speech-to-text transcription may occasionally contain errors.
- The job match percentage is an estimate based on skill overlap, not an actual hiring decision.
- Evaluation scores have not yet been validated against a large-scale human evaluator study.
- InterviewIQ is intended for interview practice and learning, not as a replacement for professional recruitment decisions.

---

## Future Enhancements

- Integration of a code-execution environment for technical coding rounds.
- Company-specific interview question collections.
- Mentor review mode for recorded interview sessions.
- Improved speech recognition and transcription accuracy.
- Validation of evaluation scores against human interviewers.
- More detailed learning recommendations and progress analytics.

---

## Team Members

**B.Tech – Computer Science and Engineering**  
**School of Computer Science & AI**  
**SR University, Warangal, Telangana, India**

| Name | Enrollment Number |
|---|---|
| Thakur Swetha Bai | 2303A51317 |
| Vutukuru Sai Anand | 2303A51310 |
| Kodam Asritha | 2303A51288 |
| Uppara Sai Vaikalpika | 2303A51961 |

## Project Mentor

**B. Girirajan**  
Associate Professor  
School of Computer Science & AI, SR University

---

## Acknowledgement

We sincerely thank our project mentor, **B. Girirajan**, and the School of Computer Science & AI at SR University for their guidance and support throughout the development of InterviewIQ.

This project provided us with an opportunity to apply our technical knowledge, strengthen our problem-solving abilities, and gain practical experience in developing an AI-powered application.

---

## Project Information

**Project Name:** InterviewIQ  
**Project Type:** B.Tech Capstone Project  
**Domain:** Artificial Intelligence | Interview Preparation | Career Readiness  
**Institution:** SR University

---

<p align="center">
  <strong>InterviewIQ – Prepare with Purpose. Perform with Confidence.</strong>
</p>
