# 🤖 AI Study Assistant

> **Your personal AI-powered study companion — learn smarter, understand better, and revise faster.**

AI Study Assistant is a modern, full-stack AI learning platform built for students. It combines AI chat, PDF/document understanding, summaries, quizzes, flashcards, chat history, profiles, and PWA support into one study workspace.

Instead of switching between multiple tools, students can **ask questions, upload study material, practice, and revise from one place.**

---

## ✨ Features

### 🤖 AI Study Chat

Ask the AI about almost any study topic.

- Ask questions about school subjects
- Get simple explanations
- Understand difficult concepts
- Ask follow-up questions
- Study topics outside uploaded documents
- Continue conversations naturally
- Get exam-focused explanations

---

### 📄 PDF & Document Study

Upload your study PDFs and use them as AI context.

You can:

- Upload PDF study material
- Process documents
- Ask questions about uploaded PDFs
- Find information inside notes
- Understand difficult sections
- Get explanations based on your documents
- Continue studying from previously uploaded material

The document content is processed into smaller chunks so relevant information can be provided to the AI when answering questions.

---

### 📝 AI Summarization

Turn long study material into concise notes.

Useful for:

- Chapter revision
- Exam preparation
- Long PDFs
- Class notes
- Quick revision
- Last-minute study

---

### 🧠 AI Quiz Generator

Generate AI-powered quizzes to test your knowledge.

Use quizzes to:

- Test understanding
- Practice concepts
- Prepare for exams
- Improve active recall
- Identify weak topics

---

### 📚 AI Flashcards

Generate flashcards for fast revision.

Flashcards can be useful for:

- Definitions
- Formulas
- Important facts
- Concepts
- Vocabulary
- Exam revision

---

### 💬 Chat History

Previous conversations can be saved and accessed again.

Students can:

- View recent chats
- Continue previous conversations
- Open specific conversations
- Keep their study history organized

---

### 👤 User Profiles

Users have their own profile.

Profile features include:

- Name
- Email
- Profile avatar
- Account information
- Dynamic avatar loading

The dashboard automatically displays the user's profile information.

---

### 🖼️ Dynamic Profile Avatar

Profile avatars are loaded dynamically through the profile avatar API.

Example:

<img
  src="/api/profile/avatar/view"
  alt={profile.name || "Profile avatar"}
  className="h-full w-full object-cover"
/>
