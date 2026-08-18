"use client";

import Link from "next/link";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  FileText,
  GraduationCap,
  Loader2,
  MessageCircle,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import UserMenu from "@/components/UserMenu";

import "katex/dist/katex.min.css";

/* =========================================================
   TYPES
========================================================= */

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

type ChatItem = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
};

type ToolMode =
  | "chat"
  | "summarize"
  | "explain"
  | "quiz"
  | "flashcards";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
};

type QuizData = {
  title?: string;
  questions: QuizQuestion[];
};

type Flashcard = {
  question: string;
  answer: string;
};

/* =========================================================
   TOOL MODES
========================================================= */

const toolModes: {
  id: ToolMode;
  label: string;
  description: string;
  icon: typeof MessageCircle;
}[] = [
  {
    id: "chat",
    label: "Chat",
    description: "Ask anything",
    icon: MessageCircle,
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Get a quick summary",
    icon: FileText,
  },
  {
    id: "explain",
    label: "Explain",
    description: "Understand a topic",
    icon: GraduationCap,
  },
  {
    id: "quiz",
    label: "Quiz",
    description: "Test yourself",
    icon: Brain,
  },
  {
    id: "flashcards",
    label: "Flashcards",
    description: "Revise quickly",
    icon: BookOpen,
  },
];

/* =========================================================
   MARKDOWN COMPONENTS
========================================================= */

const markdownComponents = {
  h1: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <h1 className="mb-4 mt-6 text-2xl font-bold tracking-tight first:mt-0">
      {children}
    </h1>
  ),

  h2: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <h2 className="mb-3 mt-5 text-xl font-bold tracking-tight first:mt-0">
      {children}
    </h2>
  ),

  h3: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0">
      {children}
    </h3>
  ),

  h4: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <h4 className="mb-2 mt-3 text-base font-semibold">
      {children}
    </h4>
  ),

  p: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <p className="mb-3 last:mb-0 leading-7">
      {children}
    </p>
  ),

  ul: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <ul className="mb-4 ml-6 list-disc space-y-2">
      {children}
    </ul>
  ),

  ol: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2">
      {children}
    </ol>
  ),

  li: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <li className="pl-1 leading-7">
      {children}
    </li>
  ),

  blockquote: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <blockquote className="my-4 border-l-4 border-primary/40 bg-muted/40 px-4 py-3 italic">
      {children}
    </blockquote>
  ),

  hr: () => (
    <hr className="my-6 border-border" />
  ),

  strong: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <strong className="font-bold text-foreground">
      {children}
    </strong>
  ),

  em: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <em className="italic">
      {children}
    </em>
  ),

  code: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => {
    const isBlock =
      className?.includes("language-");

    if (isBlock) {
      return (
        <code className="block overflow-x-auto whitespace-pre rounded-xl bg-zinc-950 p-4 text-sm text-zinc-100">
          {children}
        </code>
      );
    }

    return (
      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    );
  },

  pre: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <pre className="my-4 overflow-x-auto rounded-xl border bg-zinc-950 p-0">
      {children}
    </pre>
  ),

  table: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <div className="my-4 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),

  thead: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <thead className="bg-muted">
      {children}
    </thead>
  ),

  tbody: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <tbody className="divide-y divide-border">
      {children}
    </tbody>
  ),

  tr: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <tr className="hover:bg-muted/40">
      {children}
    </tr>
  ),

  th: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <th className="border-r px-4 py-3 text-left font-semibold last:border-r-0">
      {children}
    </th>
  ),

  td: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <td className="border-r px-4 py-3 last:border-r-0">
      {children}
    </td>
  ),

  a: ({
    children,
    href,
  }: {
    children?: React.ReactNode;
    href?: string;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),

  del: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => (
    <del className="opacity-70">
      {children}
    </del>
  ),
};

/* =========================================================
   MARKDOWN RENDERER
========================================================= */

function MarkdownContent({
  content,
}: {
  content: string;
}) {
  return (
    <div className="study-markdown text-sm leading-7">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
        ]}
        rehypePlugins={[
          rehypeKatex,
        ]}
        components={
          markdownComponents
        }
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ChatPage() {
  /* -------------------------------------------------------
     CHAT STATE
  ------------------------------------------------------- */

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [recentChats, setRecentChats] =
    useState<ChatItem[]>([]);

  const [currentChatId, setCurrentChatId] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     INPUT / LOADING
  ------------------------------------------------------- */

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingChats, setLoadingChats] =
    useState(true);

  const [loadingChat, setLoadingChat] =
    useState(false);

  /* -------------------------------------------------------
     DOCUMENT
  ------------------------------------------------------- */

  const [uploading, setUploading] =
    useState(false);

  const [documentId, setDocumentId] =
    useState<string | null>(null);

  const [documentName, setDocumentName] =
    useState("");

  /* -------------------------------------------------------
     TOOL MODE
  ------------------------------------------------------- */

  const [toolMode, setToolMode] =
    useState<ToolMode>("chat");

  const [showTools, setShowTools] =
    useState(false);

  const [showChats, setShowChats] =
    useState(true);

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  const [error, setError] =
    useState("");

  /* -------------------------------------------------------
     QUIZ
  ------------------------------------------------------- */

  const [quizData, setQuizData] =
    useState<QuizData | null>(null);

  const [quizIndex, setQuizIndex] =
    useState(0);

  const [quizScore, setQuizScore] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [quizFinished, setQuizFinished] =
    useState(false);

  /* -------------------------------------------------------
     FLASHCARDS
  ------------------------------------------------------- */

  const [flashcards, setFlashcards] =
    useState<Flashcard[]>([]);

  const [flashcardIndex, setFlashcardIndex] =
    useState(0);

  const [
    showFlashcardAnswer,
    setShowFlashcardAnswer,
  ] = useState(false);

  /* -------------------------------------------------------
     REFS
  ------------------------------------------------------- */

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadRecentChats();
  }, []);

  /* =========================================================
     READ URL PARAMETERS
  ========================================================= */

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const chatId =
      params.get("chatId");

    const urlDocumentId =
      params.get("documentId");

    if (urlDocumentId) {
      setDocumentId(
        urlDocumentId
      );
    }

    if (chatId) {
      loadChat(chatId);
    }
  }, []);

  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages, loading]);

  /* =========================================================
     LOAD RECENT CHATS
  ========================================================= */

  async function loadRecentChats() {
    try {
      setLoadingChats(true);

      const response =
        await fetch(
          "/api/chats/recent",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      if (!response.ok) {
        setRecentChats([]);
        return;
      }

      const data =
        await response.json();

      const chats =
        data.chats ||
        data.data ||
        [];

      if (
        Array.isArray(chats)
      ) {
        setRecentChats(
          chats
        );
      } else {
        setRecentChats([]);
      }
    } catch (error) {
      console.error(
        "Failed to load recent chats:",
        error
      );

      setRecentChats([]);
    } finally {
      setLoadingChats(false);
    }
  }

  /* =========================================================
     LOAD SINGLE CHAT
  ========================================================= */

  async function loadChat(
    chatId: string
  ) {
    try {
      setError("");
      setLoadingChat(true);

      const response =
        await fetch(
          `/api/chats/${encodeURIComponent(
            chatId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load chat."
        );
      }

      const chat =
        data.chat;

      if (!chat) {
        throw new Error(
          "Chat was not found."
        );
      }

      setCurrentChatId(
        chat.id
      );

      const loadedMessages =
        Array.isArray(
          chat.messages
        )
          ? chat.messages.map(
              (
                message: Message
              ) => ({
                id:
                  message.id,

                role:
                  message.role ===
                  "user"
                    ? "user"
                    : "assistant",

                content:
                  message.content,

                createdAt:
                  message.createdAt,
              })
            )
          : [];

      setMessages(
        loadedMessages
      );

      const url =
        new URL(
          window.location.href
        );

      url.searchParams.set(
        "chatId",
        chat.id
      );

      window.history.replaceState(
        {},
        "",
        url.toString()
      );
    } catch (error) {
      console.error(
        "LOAD CHAT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load chat."
      );
    } finally {
      setLoadingChat(false);
    }
  }

  /* =========================================================
     START NEW CHAT
  ========================================================= */

  function startNewChat() {
    setCurrentChatId(
      null
    );

    setMessages([]);

    setInput("");

    setDocumentId(null);

    setDocumentName("");

    setToolMode("chat");

    resetToolState();

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.delete(
      "chatId"
    );

    url.searchParams.delete(
      "documentId"
    );

    window.history.replaceState(
      {},
      "",
      url.toString()
    );
  }

  /* =========================================================
     DELETE CHAT
  ========================================================= */

  async function deleteChat(
    chatId: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this chat?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response =
        await fetch(
          `/api/chats/${encodeURIComponent(
            chatId
          )}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete chat."
        );
      }

      setRecentChats(
        (previous) =>
          previous.filter(
            (chat) =>
              chat.id !==
              chatId
          )
      );

      if (
        currentChatId ===
        chatId
      ) {
        startNewChat();
      }
    } catch (error) {
      console.error(
        "DELETE CHAT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete chat."
      );
    }
  }

  /* =========================================================
     RESET QUIZ / FLASHCARD STATE
  ========================================================= */

  function resetToolState() {
    setQuizData(null);

    setQuizIndex(0);

    setQuizScore(0);

    setSelectedAnswer(null);

    setQuizFinished(false);

    setFlashcards([]);

    setFlashcardIndex(0);

    setShowFlashcardAnswer(
      false
    );
  }

  /* =========================================================
     SELECT TOOL
  ========================================================= */

  function selectToolMode(
    mode: ToolMode
  ) {
    setToolMode(mode);

    setShowTools(false);

    resetToolState();

    if (mode === "chat") {
      setInput("");
      return;
    }

    if (
      mode ===
      "summarize"
    ) {
      setInput(
        "Please summarize the uploaded document."
      );
      return;
    }

    if (
      mode === "explain"
    ) {
      setInput(
        "Please explain the main topics from the uploaded document in simple language."
      );
      return;
    }

    if (mode === "quiz") {
      setInput(
        "Create a quiz from the uploaded document."
      );
      return;
    }

    if (
      mode ===
      "flashcards"
    ) {
      setInput(
        "Create flashcards from the uploaded document."
      );
    }
  }

  /* =========================================================
     HANDLE PDF UPLOAD
  ========================================================= */

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.type !==
        "application/pdf" &&
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Please upload a PDF file only."
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    setError("");

    setUploading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const uploadResponse =
        await fetch(
          "/api/documents",
          {
            method: "POST",
            body: formData,
          }
        );

      const uploadData =
        await uploadResponse.json();

      if (
        !uploadResponse.ok
      ) {
        throw new Error(
          uploadData.error ||
            "Failed to upload document."
        );
      }

      const newDocumentId =
        uploadData.document?.id ||
        uploadData.id;

      if (!newDocumentId) {
        throw new Error(
          "Document ID was not returned."
        );
      }

      const newDocumentName =
        uploadData.document
          ?.originalName ||
        uploadData.document
          ?.filename ||
        file.name;

      setDocumentId(
        newDocumentId
      );

      setDocumentName(
        newDocumentName
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",
            content: `📄 **${file.name}** uploaded successfully.\n\nProcessing your document now...`,
          },
        ]
      );

      const processResponse =
        await fetch(
          `/api/documents/${newDocumentId}/process`,
          {
            method: "POST",
          }
        );

      const processData =
        await processResponse.json();

      if (
        !processResponse.ok
      ) {
        throw new Error(
          processData.error ||
            "Failed to process document."
        );
      }

      setMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              "✅ **Your PDF has been processed successfully.** You can now ask questions about it.\n\nYou can also ask mathematical questions such as:\n\n$$E = mc^2$$\n\nor\n\n$$F = ma$$",
          },
        ]
      );

      const url =
        new URL(
          window.location.href
        );

      url.searchParams.set(
        "documentId",
        newDocumentId
      );

      window.history.replaceState(
        {},
        "",
        url.toString()
      );
    } catch (error) {
      console.error(
        "UPLOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );
    } finally {
      setUploading(false);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  async function sendMessage(
    event?: FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    const question =
      input.trim();

    if (
      !question ||
      loading
    ) {
      return;
    }

    setError("");

    setInput("");

    const userMessage: Message =
      {
        role: "user",
        content: question,
      };

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              question,

              documentId,

              mode: toolMode,

              chatId:
                currentChatId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to get a response."
        );
      }

      const answer =
        data.answer ||
        data.response ||
        data.message ||
        "I couldn't generate a response.";

      const returnedChatId =
        data.chatId;

      if (
        returnedChatId &&
        !currentChatId
      ) {
        setCurrentChatId(
          returnedChatId
        );

        const url =
          new URL(
            window.location.href
          );

        url.searchParams.set(
          "chatId",
          returnedChatId
        );

        window.history.replaceState(
          {},
          "",
          url.toString()
        );
      }

      setMessages(
        (previous) => [
          ...previous,
          {
            role: "assistant",
            content: answer,
          },
        ]
      );

      await loadRecentChats();

      if (
        toolMode === "quiz" &&
        data.quiz
      ) {
        setQuizData(
          data.quiz
        );

        setQuizIndex(0);

        setQuizScore(0);

        setQuizFinished(false);

        setSelectedAnswer(null);
      }

      if (
        toolMode ===
          "flashcards" &&
        data.flashcards
      ) {
        setFlashcards(
          data.flashcards
        );

        setFlashcardIndex(
          0
        );

        setShowFlashcardAnswer(
          false
        );
      }
    } catch (error) {
      console.error(
        "CHAT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     GENERATE QUIZ
  ========================================================= */

  async function generateQuiz() {
    if (loading) {
      return;
    }

    setError("");

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/quiz",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              documentId,

              topic:
                documentName ||
                "General",

              difficulty:
                "medium",

              numberOfQuestions: 10,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate quiz."
        );
      }

      const quiz =
        data.quiz ||
        data.data ||
        data;

      if (
        !quiz?.questions ||
        !Array.isArray(
          quiz.questions
        )
      ) {
        throw new Error(
          "Invalid quiz response."
        );
      }

      setQuizData(quiz);

      setQuizIndex(0);

      setQuizScore(0);

      setSelectedAnswer(null);

      setQuizFinished(false);
    } catch (error) {
      console.error(
        "QUIZ ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     ANSWER QUIZ
  ========================================================= */

  function answerQuiz(
    answer: string
  ) {
    if (
      !quizData ||
      selectedAnswer !==
        null ||
      quizFinished
    ) {
      return;
    }

    setSelectedAnswer(
      answer
    );

    const currentQuestion =
      quizData.questions[
        quizIndex
      ];

    const correct =
      answer
        .trim()
        .toLowerCase() ===
      currentQuestion.answer
        .trim()
        .toLowerCase();

    if (correct) {
      setQuizScore(
        (score) =>
          score + 1
      );
    }
  }

  /* =========================================================
     NEXT QUIZ QUESTION
  ========================================================= */

  function nextQuizQuestion() {
    if (!quizData) {
      return;
    }

    if (
      quizIndex <
      quizData.questions
        .length -
        1
    ) {
      setQuizIndex(
        (index) =>
          index + 1
      );

      setSelectedAnswer(
        null
      );

      return;
    }

    setQuizFinished(
      true
    );
  }

  /* =========================================================
     RESET QUIZ
  ========================================================= */

  function resetQuiz() {
    setQuizIndex(0);

    setQuizScore(0);

    setSelectedAnswer(
      null
    );

    setQuizFinished(
      false
    );
  }

  /* =========================================================
     FLASHCARD NAVIGATION
  ========================================================= */

  function nextFlashcard() {
    if (
      flashcardIndex <
      flashcards.length -
        1
    ) {
      setFlashcardIndex(
        (index) =>
          index + 1
      );

      setShowFlashcardAnswer(
        false
      );
    }
  }

  function previousFlashcard() {
    if (
      flashcardIndex >
      0
    ) {
      setFlashcardIndex(
        (index) =>
          index - 1
      );

      setShowFlashcardAnswer(
        false
      );
    }
  }

  /* =========================================================
     REMOVE DOCUMENT
  ========================================================= */

  function removeDocument() {
    setDocumentId(null);

    setDocumentName("");

    resetToolState();

    setMessages(
      (previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "📄 The current document has been removed from this chat.",
        },
      ]
    );

    const url =
      new URL(
        window.location.href
      );

    url.searchParams.delete(
      "documentId"
    );

    window.history.replaceState(
      {},
      "",
      url.toString()
    );
  }

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(
    date?: string
  ) {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "";
    }
  }

  /* =========================================================
     CURRENT TOOL
  ========================================================= */

  const currentTool =
    toolModes.find(
      (tool) =>
        tool.id === toolMode
    );

  const CurrentToolIcon =
    currentTool?.icon ||
    MessageCircle;

  /* =========================================================
     CURRENT QUIZ
  ========================================================= */

  const currentQuizQuestion =
    quizData?.questions[
      quizIndex
    ];

  /* =========================================================
     CURRENT FLASHCARD
  ========================================================= */

  const currentFlashcard =
    flashcards[
      flashcardIndex
    ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="flex min-h-screen bg-background">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          showChats
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Brain className="h-5 w-5 text-primary" />

            StudyAI
          </Link>

          <button
            type="button"
            onClick={() =>
              setShowChats(false)
            }
            className="rounded-lg p-2 hover:bg-muted lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            type="button"
            onClick={
              startNewChat
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />

            New Chat
          </button>
        </div>

        <div className="px-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent chats
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {loadingChats ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : recentChats.length ===
            0 ? (
            <div className="px-3 py-8 text-center">
              <MessageCircle className="mx-auto h-7 w-7 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                No chats yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Start a conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentChats.map(
                (chat) => (
                  <div
                    key={
                      chat.id
                    }
                    className={`group flex items-center gap-1 rounded-xl transition ${
                      currentChatId ===
                      chat.id
                        ? "bg-muted"
                        : "hover:bg-muted/70"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        loadChat(
                          chat.id
                        )
                      }
                      className="min-w-0 flex-1 px-3 py-3 text-left"
                    >
                      <p className="truncate text-sm font-medium">
                        {chat.title ||
                          "Untitled chat"}
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDate(
                          chat.updatedAt ||
                            chat.createdAt
                        )}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteChat(
                          chat.id
                        )
                      }
                      className="mr-1 rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-background hover:text-red-500 group-hover:opacity-100"
                      title="Delete chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </aside>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {showChats && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setShowChats(false)
          }
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setShowChats(true)
              }
              className="rounded-xl border p-2 lg:hidden"
            >
              <MessageCircle className="h-4 w-4" />
            </button>

            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />

              Dashboard
            </Link>

            <div className="hidden h-7 w-px bg-border sm:block" />

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold">
                {currentChatId
                  ? recentChats.find(
                      (chat) =>
                        chat.id ===
                        currentChatId
                    )?.title ||
                    "Study Chat"
                  : "New Chat"}
              </h1>

              {documentName && (
                <p className="truncate text-xs text-muted-foreground">
                  {documentName}
                </p>
              )}
            </div>
          </div>

          <UserMenu />
        </header>

        {/* TOOLBAR */}

        <div className="border-b px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowTools(
                    (value) =>
                      !value
                  )
                }
                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <CurrentToolIcon className="h-4 w-4" />

                {currentTool?.label ||
                  "Chat"}

                <ChevronDown className="h-4 w-4" />
              </button>

              {showTools && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border bg-background p-2 shadow-xl">
                  {toolModes.map(
                    (tool) => {
                      const Icon =
                        tool.icon;

                      return (
                        <button
                          key={
                            tool.id
                          }
                          type="button"
                          onClick={() =>
                            selectToolMode(
                              tool.id
                            )
                          }
                          className={`flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-muted ${
                            toolMode ===
                            tool.id
                              ? "bg-muted"
                              : ""
                          }`}
                        >
                          <Icon className="h-5 w-5" />

                          <div>
                            <p className="text-sm font-medium">
                              {
                                tool.label
                              }
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {
                                tool.description
                              }
                            </p>
                          </div>

                          {toolMode ===
                            tool.id && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {documentId && (
                <button
                  type="button"
                  onClick={
                    removeDocument
                  }
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs hover:bg-muted"
                >
                  <X className="h-4 w-4" />

                  <span className="hidden sm:inline">
                    Remove PDF
                  </span>
                </button>
              )}

              <button
                type="button"
                disabled={
                  uploading
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}

                <span className="hidden sm:inline">
                  {uploading
                    ? "Processing..."
                    : "Upload PDF"}
                </span>
              </button>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={
                  handleFileChange
                }
              />
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mx-auto w-full max-w-5xl px-4 pt-4">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
              {error}
            </div>
          </div>
        )}

        {/* CHAT AREA */}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {loadingChat ? (
              <div className="flex min-h-[50vh] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />

                  Loading conversation...
                </div>
              </div>
            ) : (
              <>
                {/* EMPTY */}

                {messages.length ===
                  0 &&
                  !quizData &&
                  flashcards.length ===
                    0 && (
                    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>

                      <h2 className="text-2xl font-bold">
                        What would you like to learn?
                      </h2>

                      <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        Ask anything about your studies or upload a PDF.
                      </p>

                      <div className="mt-6 max-w-lg rounded-2xl border bg-card p-5 text-left">
                        <p className="mb-3 text-sm font-semibold">
                          ✨ You can ask things like:
                        </p>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>
                            • Explain Newton&apos;s
                            second law.
                          </p>

                          <p>
                            • Solve:
                            {" "}
                            <span className="font-medium">
                              x² + 5x + 6 = 0
                            </span>
                          </p>

                          <p>
                            • Explain
                            {" "}
                            <span className="font-medium">
                              E = mc²
                            </span>
                          </p>

                          <p>
                            • What is
                            {" "}
                            <span className="font-medium">
                              ∫ x² dx
                            </span>
                            ?
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* MESSAGES */}

                {messages.map(
                  (
                    message,
                    index
                  ) => (
                    <div
                      key={
                        message.id ||
                        `${message.role}-${index}`
                      }
                      className={`flex ${
                        message.role ===
                        "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[82%] ${
                          message.role ===
                          "user"
                            ? "bg-primary text-primary-foreground"
                            : "border bg-card"
                        }`}
                      >
                        {message.role ===
                        "assistant" ? (
                          <MarkdownContent
                            content={
                              message.content
                            }
                          />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-7">
                            {
                              message.content
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* THINKING */}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />

                      <span className="text-sm text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}

                {/* QUIZ START */}

                {toolMode ===
                  "quiz" &&
                  !quizData &&
                  documentId && (
                    <div className="rounded-2xl border bg-card p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <Brain className="h-6 w-6" />

                        <div>
                          <h2 className="font-semibold">
                            Ready for a quiz?
                          </h2>

                          <p className="text-sm text-muted-foreground">
                            Test your knowledge from the uploaded document.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={
                          generateQuiz
                        }
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                      >
                        {loading
                          ? "Generating..."
                          : "Generate Quiz"}
                      </button>
                    </div>
                  )}

                {/* QUIZ */}

                {quizData &&
                  currentQuizQuestion && (
                    <div className="rounded-2xl border bg-card p-6">
                      {!quizFinished ? (
                        <>
                          <div className="mb-6 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Question{" "}
                                {quizIndex +
                                  1}{" "}
                                of{" "}
                                {
                                  quizData
                                    .questions
                                    .length
                                }
                              </p>

                              <h2 className="mt-1 font-semibold">
                                {quizData.title ||
                                  "Quiz"}
                              </h2>
                            </div>

                            <div className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium">
                              Score:{" "}
                              {
                                quizScore
                              }
                            </div>
                          </div>

                          <div className="mb-5 text-lg font-medium leading-8">
                            <MarkdownContent
                              content={
                                currentQuizQuestion.question
                              }
                            />
                          </div>

                          <div className="space-y-3">
                            {currentQuizQuestion.options.map(
                              (
                                option
                              ) => {
                                const isSelected =
                                  selectedAnswer ===
                                  option;

                                const isCorrect =
                                  option
                                    .trim()
                                    .toLowerCase() ===
                                  currentQuizQuestion.answer
                                    .trim()
                                    .toLowerCase();

                                let className =
                                  "w-full rounded-xl border p-4 text-left transition hover:bg-muted";

                                if (
                                  selectedAnswer
                                ) {
                                  if (
                                    isCorrect
                                  ) {
                                    className =
                                      "w-full rounded-xl border border-green-500 bg-green-500/10 p-4 text-left";
                                  } else if (
                                    isSelected
                                  ) {
                                    className =
                                      "w-full rounded-xl border border-red-500 bg-red-500/10 p-4 text-left";
                                  }
                                }

                                return (
                                  <button
                                    key={
                                      option
                                    }
                                    type="button"
                                    disabled={
                                      selectedAnswer !==
                                      null
                                    }
                                    onClick={() =>
                                      answerQuiz(
                                        option
                                      )
                                    }
                                    className={
                                      className
                                    }
                                  >
                                    <MarkdownContent
                                      content={
                                        option
                                      }
                                    />
                                  </button>
                                );
                              }
                            )}
                          </div>

                          {selectedAnswer && (
                            <button
                              type="button"
                              onClick={
                                nextQuizQuestion
                              }
                              className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                            >
                              {quizIndex <
                              quizData
                                .questions
                                .length -
                                1
                                ? "Next Question"
                                : "Finish Quiz"}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <Check className="mx-auto h-10 w-10 text-primary" />

                          <h2 className="mt-3 text-2xl font-bold">
                            Quiz Complete!
                          </h2>

                          <p className="mt-2 text-muted-foreground">
                            You scored{" "}
                            <strong>
                              {
                                quizScore
                              }
                            </strong>{" "}
                            out of{" "}
                            {
                              quizData
                                .questions
                                .length
                            }
                          </p>

                          <button
                            type="button"
                            onClick={
                              resetQuiz
                            }
                            className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                          >
                            Try Again
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {/* FLASHCARDS */}

                {flashcards.length >
                  0 &&
                  currentFlashcard && (
                    <div className="mx-auto w-full max-w-2xl">
                      <button
                        type="button"
                        onClick={() =>
                          setShowFlashcardAnswer(
                            (
                              value
                            ) =>
                              !value
                          )
                        }
                        className="min-h-[280px] w-full rounded-3xl border bg-card p-8 text-center shadow-sm transition hover:shadow-md"
                      >
                        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Flashcard{" "}
                          {flashcardIndex +
                            1}{" "}
                          /{" "}
                          {
                            flashcards.length
                          }
                        </p>

                        <div className="mx-auto max-w-none">
                          <MarkdownContent
                            content={
                              showFlashcardAnswer
                                ? currentFlashcard.answer
                                : currentFlashcard.question
                            }
                          />
                        </div>

                        <p className="mt-8 text-xs text-muted-foreground">
                          Click to{" "}
                          {showFlashcardAnswer
                            ? "see question"
                            : "reveal answer"}
                        </p>
                      </button>

                      <div className="mt-4 flex justify-between">
                        <button
                          type="button"
                          disabled={
                            flashcardIndex ===
                            0
                          }
                          onClick={
                            previousFlashcard
                          }
                          className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40"
                        >
                          Previous
                        </button>

                        <button
                          type="button"
                          disabled={
                            flashcardIndex ===
                            flashcards.length -
                              1
                          }
                          onClick={
                            nextFlashcard
                          }
                          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
              </>
            )}

            <div
              ref={
                messagesEndRef
              }
            />
          </div>
        </div>

        {/* INPUT AREA */}

        <div className="sticky bottom-0 border-t bg-background px-4 py-4">
          <div className="mx-auto max-w-5xl">
            {documentId && (
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />

                <span className="truncate">
                  {documentName}
                </span>
              </div>
            )}

            <form
              onSubmit={
                sendMessage
              }
              className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm"
            >
              <button
                type="button"
                disabled={
                  uploading
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <textarea
                value={input}
                onChange={(
                  event
                ) =>
                  setInput(
                    event.target
                      .value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                      "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    sendMessage();
                  }
                }}
                placeholder={
                  toolMode ===
                  "chat"
                    ? "Ask anything..."
                    : `Use ${
                        currentTool?.label.toLowerCase()
                      } mode...`
                }
                rows={1}
                className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !input.trim()
                }
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}