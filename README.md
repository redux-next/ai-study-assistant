# 🧠 AI Study Assistant

An AI-powered study companion built for students.

AI Study Assistant helps students understand difficult topics, study PDFs, ask questions, generate quizzes, create flashcards, summarize study material, and continue previous conversations — all from one modern web application.

---

## ✨ Features

### 🤖 AI Chat

Ask the AI questions about almost any study topic.

You can:

- Ask general academic questions
- Get simple explanations
- Ask follow-up questions
- Learn difficult concepts step-by-step
- Ask questions related to uploaded study material
- Continue previous conversations

---

### 📄 PDF Study Assistant

Upload your study PDFs and interact with them using AI.

Features include:

- PDF upload
- PDF processing
- Document storage
- Text extraction
- Document chunking
- AI-powered document questions
- Context-aware answers
- Open documents directly from the dashboard

This makes the application useful for:

- Textbooks
- Class notes
- Study material
- Question papers
- Revision notes
- Research documents

---

### 📝 AI Summarization

Turn large study material into concise notes.

The AI can help summarize:

- PDF content
- Chapters
- Topics
- Long explanations
- Study notes

---

### 🧠 AI Quizzes

Generate AI-powered quizzes to test your understanding.

The quiz system can be used for:

- Exam preparation
- Chapter revision
- Self-testing
- Concept practice
- Quick revision

---

### 📚 AI Flashcards

Generate flashcards from study material.

Flashcards are useful for:

- Memorization
- Revision
- Important definitions
- Formulas
- Concepts
- Exam preparation

---

### 💬 Chat History

Previous conversations can be stored and accessed from the dashboard.

Users can:

- View recent chats
- Continue previous conversations
- Open specific conversations
- Keep their study history organized

---

### 👤 User Accounts

The application supports user authentication.

Users can:

- Register
- Login
- Logout
- Maintain a personal profile
- Add a profile name
- Use a profile avatar
- Access their own study data

Unauthenticated users are prevented from accessing protected dashboard functionality.

---

### 🖼️ Profile Avatar

Users can have a profile avatar.

The dashboard automatically loads the user's avatar through the profile avatar API.

If an avatar is unavailable, the application automatically falls back to the user's initials.

---

### 🌙 Dark Mode

The application includes light and dark themes.

The selected theme is saved locally so it remains available when the user returns.

---

### 📱 Progressive Web App

AI Study Assistant is designed as a Progressive Web App (PWA).

Supported features include:

- Installable web application
- App-like experience
- Install prompt
- Mobile-friendly interface
- Responsive design
- iOS installation instructions
- Standalone display mode detection

---

### 📊 Dashboard

The dashboard provides a central place to manage studying.

It includes:

- User profile
- Recent chats
- Uploaded documents
- Quick study actions
- AI chat access
- PDF upload access
- Quiz access
- Flashcard access
- PWA installation
- Dark mode
- Study assistant information

---

## 🖥️ Screens

The application contains several major sections.

### Landing Page

Introduces AI Study Assistant and provides access to the application.

### Authentication

Users can register and log in securely.

### Dashboard

The main study workspace showing:

- Profile
- Recent chats
- Documents
- Quick actions
- Application features

### AI Chat

The main AI learning interface.

### Profile

Users can manage their personal profile and avatar.

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- React Markdown

## AI

- OpenRouter
- OpenAI-compatible SDK
- AI-powered text generation

## Database

- PostgreSQL
- Neon Database
- Prisma ORM

## Authentication

- NextAuth.js
- Credentials Provider
- bcryptjs
- JWT sessions

## File Storage

- Vercel Blob

## PWA

- Web App Manifest
- Service Worker
- Installable web application

## Deployment

- Vercel
- GitHub

---

# 🏗️ Project Architecture

The project uses the Next.js App Router architecture.

```text
ai-study-assistant/
│
├── public/
│   ├── icons/
│   ├── developer-avatar.png
│   └── ...
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── chats/
│   │   │   ├── documents/
│   │   │   ├── profile/
│   │   │   └── quiz/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── DashboardClient.tsx
│   │   │
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── UserMenu.tsx
│   │   ├── UploadPdf.tsx
│   │   └── ...
│   │
│   └── lib/
│       ├── auth.ts
│       ├── prisma.ts
│       ├── openrouter.ts
│       └── ...
│
├── .env
├── .gitignore
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
