# AI Study Assistant

> Your personal AI-powered study companion for learning, practicing, and revising smarter.

**AI Study Assistant** is a modern AI-powered study platform designed for students. It lets you ask questions, study uploaded PDFs, generate summaries, create quizzes and flashcards, and continue previous conversations — all from one place.

The goal is simple: **make studying easier, more interactive, and more effective.**

---

## ✨ Features

### 🤖 AI Study Chat

Ask the AI questions about:

- School subjects
- Difficult concepts
- General academic topics
- Uploaded study material
- Exam preparation
- Revision topics

### 📄 PDF Study & Document Q&A

Upload study PDFs and interact with them using AI.

You can:

- Ask questions about PDFs
- Find information from notes
- Understand difficult sections
- Get explanations from uploaded material
- Use documents as study context

### 📝 AI Summarization

Turn lengthy study material into concise revision-friendly notes.

### 🧠 AI Quizzes

Generate AI-powered quizzes to:

- Test your understanding
- Practice before exams
- Identify weak areas
- Improve active recall

### 📚 AI Flashcards

Create flashcards for:

- Definitions
- Formulas
- Important facts
- Concepts
- Quick revision

### 💬 Chat History

Previous conversations can be saved and accessed again so you can continue studying from where you stopped.

### 👤 User Profiles

Each user can have:

- Name
- Email
- Profile avatar
- Account information

### 🌙 Dark & Light Mode

Switch between light and dark themes. Your preference is saved locally.

### 📱 Progressive Web App

AI Study Assistant supports installation as a Progressive Web App for an app-like experience.

### ⚡ Responsive UI

Designed for:

- Desktop
- Laptop
- Tablet
- Mobile

---

## 🖥️ Dashboard

The dashboard provides access to:

- Profile
- Recent chats
- Uploaded documents
- Quick study actions
- AI chat
- PDF uploads
- Quizzes
- Flashcards
- PWA installation
- Theme controls

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack React framework |
| React | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| Prisma | Database ORM |
| PostgreSQL / Neon | Database |
| OpenRouter | AI model access |
| Vercel Blob | File storage |
| React Markdown | Markdown rendering |
| remark-gfm | GitHub Flavored Markdown |
| remark-math | Math expressions |
| rehype-katex | Math rendering |
| Lucide React | UI icons |
| PWA | Installable web application |

---

## 🏗️ Architecture

```text
┌──────────────────────────────────────────────┐
│                  Frontend                    │
│                                              │
│   Next.js + React + TypeScript + Tailwind   │
│                                              │
│   Dashboard │ Chat │ Profile │ Documents    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 API Routes                   │
│                                              │
│  Authentication │ Chat │ Documents │ Quiz   │
│  Profile │ Avatar │ Chat History             │
└───────────────┬──────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌───────────────┐
│   Prisma     │  │  OpenRouter   │
│              │  │               │
│ PostgreSQL   │  │   AI Models   │
│ / Neon       │  │               │
└──────────────┘  └───────────────┘
        │
        ▼
┌──────────────────────┐
│    Vercel Blob       │
│                      │
│ Uploaded PDF / Files │
└──────────────────────┘
