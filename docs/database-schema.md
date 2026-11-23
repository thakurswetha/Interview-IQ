# Database Schema & Data Dictionary
## Project: InterviewIQ – AI-Powered Personalized Interview & Career Readiness Platform

InterviewIQ persists data using MongoDB and Mongoose Object Data Modeling (ODM).

```
                      +------------------+
                      |       User       |
                      +--------+---------+
                               | 1
                               |
             +-----------------+-----------------+
             | 1:N             | 1:N             | 1:N
             v                 v                 v
      +--------------+  +---------------+  +---------------+
      |    Resume    |  | JobDescription|  |  ChatHistory  |
      +-------+------+  +-------+-------+  +---------------+
              |                 |
              +--------+--------+
                       |
                       v 1:N
             +-------------------+
             |  InterviewSession |
             +---------+---------+
                       | 1:1
                       v
             +-------------------+
             |  InterviewReport  |
             +-------------------+
```

---

## 1. User Collection (`users`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Auto-generated document ID |
| `name` | String | Required, Trimmed | Candidate full name |
| `email` | String | Required, Unique, Lowercase | Unique account email |
| `passwordHash` | String | Required | Salted bcrypt hashed password |
| `education` | String | Optional | Academic degree / institution |
| `careerInterest` | String | Default: Software Engineer | Target engineering path |
| `experienceLevel`| String | Enum: Beginner, Fresh Graduate, Intermediate, Advanced | Professional seniority baseline |
| `targetIndustry` | String | Optional | Target industry domain (SaaS, FinTech) |
| `bio` | String | Max 500 chars | Candidate self-summary |
| `resetPasswordToken` | String | Optional | Hash for password reset link |
| `resetPasswordExpires` | Date | Optional | Expiration timestamp |
| `createdAt` / `updatedAt` | Date | Timestamps | Audit tracking |

---

## 2. Resume Collection (`resumes`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Document ID |
| `userId` | ObjectId | Ref: User, Indexed | Foreign key to owner |
| `originalFileName` | String | Required | e.g. `Resume_Alex.pdf` |
| `filePath` | String | Required | Absolute/relative storage path on disk |
| `fileSize` | Number | Required | File size in bytes |
| `mimeType` | String | Required | `application/pdf` or docx format |
| `extractedText` | String | Text | Raw extracted plaintext buffer |
| `summary` | String | Text | Candidate overview snippet |
| `parsedSkills` | Object | Complex | Categorized `{ technical: [], frameworks: [], tools: [], softSkills: [] }` |
| `parsedEducation` | Array | Objects | `[{ degree, institution, year, grade }]` |
| `parsedProjects` | Array | Objects | `[{ title, description, technologies: [] }]` |
| `parsedExperience` | Array | Objects | `[{ role, company, duration, highlights: [] }]` |
| `keywords` | Array | Strings | Top recurring technical keywords |
| `isPrimary` | Boolean | Default: false | Default resume selected for interviews |

---

## 3. JobDescription Collection (`jobdescriptions`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Document ID |
| `userId` | ObjectId | Ref: User, Indexed | Owner ID |
| `jobTitle` | String | Required | e.g. "Senior Full Stack Developer" |
| `company` | String | Default: Target Company | Target hiring company |
| `description` | String | Required | Raw job description body |
| `requiredSkills` | Array | Strings | Parsed / explicit technical requirements |
| `experienceRequired` | String | Default: Mid-Level | Seniority requirement string |
| `matchAnalysis` | Object | Embedded | Cached match result `{ matchPercentage, matchedSkills, missingSkills, partiallyMatchedSkills, recommendedTopics }` |

---

## 4. InterviewSession Collection (`interviewsessions`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Session ID |
| `userId` | ObjectId | Ref: User, Indexed | Owner candidate |
| `resumeId` | ObjectId | Ref: Resume | Resume used for question generation |
| `jobDescriptionId` | ObjectId | Ref: JobDescription | Optional linked job target |
| `targetRole` | String | Required | Role name tested |
| `interviewType` | String | Enum: Technical, HR, Behavioral, Project-Based, Mixed | Category of interview |
| `difficulty` | String | Enum: Beginner, Intermediate, Advanced | Question difficulty tier |
| `totalQuestionsTarget` | Number | Default: 5 | Target number of questions |
| `currentQuestionIndex` | Number | Default: 0 | Pointer to active question |
| `status` | String | Enum: configured, in-progress, completed, abandoned | Session lifecycle state |
| `interviewerPersona` | Object | Embedded | `{ name, title, avatarStyle }` |
| `questions` | Array | Subdocuments | `[{ questionId, questionText, category, expectedKeyConcepts, difficulty, isFollowUp, parentQuestionId }]` |
| `answers` | Array | Subdocuments | `[{ questionId, questionText, answerText, durationSeconds, speakingPaceWpm, fillerWordsCount, evaluation: { score, categoryScores, strengths, weaknesses, suggestedAnswer, feedback } }]` |
| `overallScore` | Number | Default: 0 | Aggregate average score (0-100) |
| `startedAt` / `completedAt` | Date | Timestamps | Session execution time |

---

## 5. InterviewReport Collection (`interviewreports`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Document ID |
| `userId` | ObjectId | Ref: User, Indexed | Candidate owner |
| `sessionId` | ObjectId | Ref: InterviewSession, Unique | 1:1 linked interview session |
| `candidateName` | String | Required | Name at evaluation time |
| `targetRole` | String | Required | Role evaluated |
| `overallScore` | Number | Required (0-100) | Weighted performance score |
| `categoryScores` | Object | Required | `{ technicalKnowledge, communication, answerRelevance, starStructure, problemSolving }` |
| `communicationIndicators` | Object | Required | `{ averageSpeakingPaceWpm, totalFillerWords, averageAnswerDurationSeconds }` |
| `strengths` | Array | Strings | High-level strengths summary |
| `weaknesses` | Array | Strings | Target areas for remediation |
| `recommendations` | Array | Strings | Actionable advice list |
| `recommendedTopics` | Array | Strings | Study topics list |
| `questionFeedback` | Array | Objects | Granular question-by-question breakdown |

---

## 6. ChatHistory Collection (`chathistories`)

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Document ID |
| `userId` | ObjectId | Ref: User, Unique | 1:1 chat thread per candidate |
| `title` | String | Default | Chat session title |
| `messages` | Array | Subdocuments | `[{ sender: 'user' | 'assistant' | 'system', text: String, timestamp: Date }]` |

