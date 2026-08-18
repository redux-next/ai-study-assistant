"use client";

import Link from "next/link";

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  FileText,
  GraduationCap,
  Loader2,
  Menu,
  MessageCircle,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
  Zap,
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

type ToolModeInfo = {
  id: ToolMode;
  label: string;
  description: string;
  icon: typeof MessageCircle;
};

/* =========================================================
   TOOL MODES
========================================================= */

const toolModes: ToolModeInfo[] = [
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
    description: "Understand difficult topics",
    icon: GraduationCap,
  },
  {
    id: "quiz",
    label: "Quiz",
    description: "Test your knowledge",
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
   SUGGESTED QUESTIONS
========================================================= */

const suggestedQuestions = [
  "Explain Newton's second law in simple words.",
  "Solve x² + 5x + 6 = 0 step by step.",
  "Explain this topic like I'm preparing for an exam.",
  "Give me the most important points to remember.",
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
    <p className="mb-3 leading-7 last:mb-0">
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
    <blockquote className="my-4 rounded-r-xl border-l-4 border-primary/40 bg-muted/40 px-4 py-3 italic">
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
    <tr className="transition hover:bg-muted/40">
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
   MARKDOWN
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
     CHAT
  ------------------------------------------------------- */

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [recentChats, setRecentChats] =
    useState<ChatItem[]>([]);

  const [currentChatId, setCurrentChatId] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     INPUT
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
     TOOLS
  ------------------------------------------------------- */

  const [toolMode, setToolMode] =
    useState<ToolMode>("chat");

  const [showTools, setShowTools] =
    useState(false);

  const [showChats, setShowChats] =
    useState(false);

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  const [error, setError] =
    useState("");

  /* -------------------------------------------------------
     COPYING
  ------------------------------------------------------- */

  const [copiedMessage, setCopiedMessage] =
    useState<number | null>(null);

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

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const toolsRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadRecentChats();
  }, []);

  /* =========================================================
     URL PARAMETERS
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
  }, [
    messages,
    loading,
    quizData,
    flashcards,
  ]);

  /* =========================================================
     OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    function handleClick(
      event: MouseEvent
    ) {
      if (
        toolsRef.current &&
        !toolsRef.current.contains(
          event.target as Node
        )
      ) {
        setShowTools(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick
      );
    };
  }, []);

  /* =========================================================
     ESCAPE KEY
  ========================================================= */

  useEffect(() => {
    function handleEscape(
      event: globalThis.KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setShowTools(false);
        setShowChats(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =========================================================
     AUTO RESIZE TEXTAREA
  ========================================================= */

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        160
      )}px`;
  }, [input]);

  /* =========================================================
     LOAD CHATS
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

      setRecentChats(
        Array.isArray(chats)
          ? chats
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load chats:",
        error
      );

      setRecentChats([]);
    } finally {
      setLoadingChats(false);
    }
  }

  /* =========================================================
     LOAD CHAT
  ========================================================= */

  async function loadChat(
    chatId: string
  ) {
    try {
      setError("");
      setLoadingChat(true);
      setShowChats(false);

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
     NEW CHAT
  ========================================================= */

  function startNewChat() {
    setCurrentChatId(null);
    setMessages([]);
    setInput("");
    setDocumentId(null);
    setDocumentName("");
    setToolMode("chat");
    setError("");
    resetToolState();

    setShowChats(false);

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
        "Delete this chat permanently?"
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
     RESET TOOLS
  ========================================================= */

  function resetToolState() {
    setQuizData(null);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizFinished(false);

    setFlashcards([]);
    setFlashcardIndex(0);
    setShowFlashcardAnswer(false);
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
      mode === "summarize"
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
      setInput("");
      return;
    }

    if (
      mode === "flashcards"
    ) {
      setInput("");
    }
  }

  /* =========================================================
     UPLOAD PDF
  ========================================================= */

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const isPdf =
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
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
            content: `📄 **${file.name}** uploaded successfully.\n\n⏳ I'm processing your document...`,
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
              "✅ **PDF processed successfully!**\n\nYou can now ask me questions about the document, request a summary, create a quiz, or generate flashcards.",
          },
        ]
      );

      setToolMode("chat");

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
      loading ||
      uploading
    ) {
      return;
    }

    setError("");
    setInput("");

    const userMessage: Message =
      {
        role: "user",
        content: question,
        createdAt:
          new Date().toISOString(),
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
            createdAt:
              new Date().toISOString(),
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

        setFlashcardIndex(0);

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
     RETRY
  ========================================================= */

  function retryLastMessage() {
    const lastUserMessage =
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role ===
            "user"
        );

    if (!lastUserMessage) {
      return;
    }

    setInput(
      lastUserMessage.content
    );

    textareaRef.current?.focus();
  }

  /* =========================================================
     COPY MESSAGE
  ========================================================= */

  async function copyMessage(
    content: string,
    index: number
  ) {
    try {
      await navigator.clipboard.writeText(
        content
      );

      setCopiedMessage(index);

      window.setTimeout(() => {
        setCopiedMessage(
          null
        );
      }, 1500);
    } catch (error) {
      console.error(
        "COPY ERROR:",
        error
      );
    }
  }

  /* =========================================================
     GENERATE QUIZ
  ========================================================= */

  async function generateQuiz() {
    if (loading) {
      return;
    }

    if (!documentId) {
      setError(
        "Upload a PDF before generating a quiz."
      );
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
     NEXT QUESTION
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
    setSelectedAnswer(null);
    setQuizFinished(false);
  }

  /* =========================================================
     FLASHCARDS
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
     FORMAT TIME
  ========================================================= */

  function formatTime(
    date?: string
  ) {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  }

  /* =========================================================
     KEYBOARD HANDLER
  ========================================================= */

  function handleTextareaKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background shadow-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          showChats
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* SIDEBAR HEADER */}

        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>

            StudyAI
          </Link>

          <button
            type="button"
            onClick={() =>
              setShowChats(false)
            }
            className="rounded-lg p-2 hover:bg-muted lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* NEW CHAT */}

        <div className="p-3">
          <button
            type="button"
            onClick={
              startNewChat
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />

            New Chat
          </button>
        </div>

        {/* RECENT */}

        <div className="px-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent chats
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loadingChats ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : recentChats.length ===
            0 ? (
            <div className="px-3 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
              </div>

              <p className="mt-3 text-sm font-medium">
                No chats yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Start your first conversation.
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
                      className="mr-1 rounded-lg p-2 text-muted-foreground opacity-0 transition hover:bg-background hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
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

      {/* MOBILE OVERLAY */}

      {showChats && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setShowChats(false)
          }
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/90 px-3 backdrop-blur-md sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() =>
                setShowChats(true)
              }
              className="rounded-xl border p-2 hover:bg-muted lg:hidden"
              aria-label="Open chats"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-muted sm:flex"
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

              {documentName ? (
                <div className="flex min-w-0 items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />

                  <p className="truncate text-xs text-muted-foreground">
                    {documentName}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  AI Study Assistant
                </p>
              )}
            </div>
          </div>

          <UserMenu />
        </header>

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div className="border-b bg-background/80 px-3 py-3 sm:px-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
            {/* TOOL SELECTOR */}

            <div
              ref={toolsRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setShowTools(
                    (value) =>
                      !value
                  )
                }
                className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"
              >
                <CurrentToolIcon className="h-4 w-4 text-primary" />

                <span>
                  {currentTool?.label ||
                    "Chat"}
                </span>

                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {showTools && (
                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border bg-background p-2 shadow-2xl">
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
                          className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-muted ${
                            toolMode ===
                            tool.id
                              ? "bg-primary/10"
                              : ""
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {
                                tool.label
                              }
                            </p>

                            <p className="truncate text-xs text-muted-foreground">
                              {
                                tool.description
                              }
                            </p>
                          </div>

                          {toolMode ===
                            tool.id && (
                            <Check className="ml-auto h-4 w-4 text-primary" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* DOCUMENT BUTTONS */}

            <div className="flex items-center gap-2">
              {documentId && (
                <button
                  type="button"
                  onClick={
                    removeDocument
                  }
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition hover:bg-muted"
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
                className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mx-auto w-full max-w-5xl px-4 pt-4">
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
              <X className="mt-0.5 h-4 w-4 shrink-0" />

              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  Something went wrong
                </p>

                <p className="mt-0.5">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="rounded-lg p-1 hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================
            CHAT AREA
        =================================================== */}

        <div className="flex-1 overflow-y-auto px-3 py-6 sm:px-4">
          <div className="mx-auto max-w-5xl space-y-6">
            {loadingChat ? (
              <div className="flex min-h-[55vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Loading conversation...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {messages.length ===
                  0 &&
                  !quizData &&
                  flashcards.length ===
                    0 && (
                    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>

                      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        What would you like to learn?
                      </h2>

                      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        Ask questions, solve problems,
                        understand difficult topics, or
                        upload a PDF and study with AI.
                      </p>

                      {/* QUICK ACTIONS */}

                      <div className="mt-7 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                        {suggestedQuestions.map(
                          (
                            question
                          ) => (
                            <button
                              key={
                                question
                              }
                              type="button"
                              onClick={() =>
                                setInput(
                                  question
                                )
                              }
                              className="rounded-xl border bg-card p-3 text-left text-sm transition hover:border-primary/40 hover:bg-primary/5"
                            >
                              <span className="text-muted-foreground">
                                {question}
                              </span>
                            </button>
                          )
                        )}
                      </div>

                      {/* FEATURES */}

                      <div className="mt-6 flex flex-wrap justify-center gap-2">
                        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                          <Zap className="h-3.5 w-3.5 text-primary" />
                          AI explanations
                        </div>

                        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          PDF analysis
                        </div>

                        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                          <Brain className="h-3.5 w-3.5 text-primary" />
                          Quizzes
                        </div>

                        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          Flashcards
                        </div>
                      </div>
                    </div>
                  )}

                {/* =================================================
                    MESSAGES
                ================================================= */}

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
                      className={`group flex ${
                        message.role ===
                        "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[96%] flex-col gap-1 sm:max-w-[85%] ${
                          message.role ===
                          "user"
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.role ===
                            "user"
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md border bg-card"
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

                        {/* MESSAGE ACTIONS */}

                        <div
                          className={`flex items-center gap-2 px-1 text-[10px] text-muted-foreground ${
                            message.role ===
                            "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {message.createdAt && (
                            <span>
                              {formatTime(
                                message.createdAt
                              )}
                            </span>
                          )}

                          {message.role ===
                            "assistant" && (
                            <button
                              type="button"
                              onClick={() =>
                                copyMessage(
                                  message.content,
                                  index
                                )
                              }
                              className="flex items-center gap-1 rounded-md px-1.5 py-1 opacity-0 transition hover:bg-muted group-hover:opacity-100"
                            >
                              {copiedMessage ===
                              index ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Clipboard className="h-3 w-3" />
                                  Copy
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* =================================================
                    THINKING
                ================================================= */}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3 rounded-2xl rounded-bl-md border bg-card px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                      </div>

                      <span className="text-sm text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}

                {/* =================================================
                    RETRY
                ================================================= */}

                {error &&
                  !loading &&
                  messages.some(
                    (message) =>
                      message.role ===
                      "user"
                  ) && (
                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={
                          retryLastMessage
                        }
                        className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-muted"
                      >
                        <RefreshCw className="h-4 w-4" />

                        Retry
                      </button>
                    </div>
                  )}

                {/* =================================================
                    QUIZ READY
                ================================================= */}

                {toolMode ===
                  "quiz" &&
                  !quizData &&
                  documentId && (
                    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                      <div className="bg-primary/5 p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <Brain className="h-6 w-6 text-primary" />
                          </div>

                          <div>
                            <h2 className="font-semibold">
                              Ready for a quiz?
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              I'll create 10 questions
                              based on your uploaded
                              document.
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
                          className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4" />
                          )}

                          {loading
                            ? "Generating..."
                            : "Generate Quiz"}
                        </button>
                      </div>
                    </div>
                  )}

                {/* =================================================
                    QUIZ
                ================================================= */}

                {quizData &&
                  currentQuizQuestion && (
                    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                      {!quizFinished ? (
                        <>
                          <div className="border-b bg-muted/30 p-5">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">
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
                                    "Knowledge Quiz"}
                                </h2>
                              </div>

                              <div className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                                {quizScore} pts
                              </div>
                            </div>

                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                  width: `${
                                    ((quizIndex +
                                      1) /
                                      quizData
                                        .questions
                                        .length) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="p-5 sm:p-6">
                            <div className="mb-6 text-base font-medium leading-8 sm:text-lg">
                              <MarkdownContent
                                content={
                                  currentQuizQuestion.question
                                }
                              />
                            </div>

                            <div className="space-y-3">
                              {currentQuizQuestion.options.map(
                                (
                                  option,
                                  optionIndex
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
                                    "w-full rounded-xl border p-4 text-left transition hover:border-primary/50 hover:bg-primary/5";

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
                                    } else {
                                      className =
                                        "w-full rounded-xl border p-4 text-left opacity-60";
                                    }
                                  }

                                  return (
                                    <button
                                      key={`${option}-${optionIndex}`}
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
                                      <div className="flex gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                                          {String.fromCharCode(
                                            65 +
                                              optionIndex
                                          )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <MarkdownContent
                                            content={
                                              option
                                            }
                                          />
                                        </div>

                                        {selectedAnswer &&
                                          isCorrect && (
                                            <Check className="h-5 w-5 shrink-0 text-green-500" />
                                          )}
                                      </div>
                                    </button>
                                  );
                                }
                              )}
                            </div>

                            {/* EXPLANATION */}

                            {selectedAnswer &&
                              currentQuizQuestion.explanation && (
                                <div className="mt-5 rounded-xl bg-muted/50 p-4">
                                  <p className="mb-2 text-sm font-semibold">
                                    Explanation
                                  </p>

                                  <MarkdownContent
                                    content={
                                      currentQuizQuestion.explanation
                                    }
                                  />
                                </div>
                              )}

                            {selectedAnswer && (
                              <button
                                type="button"
                                onClick={
                                  nextQuizQuestion
                                }
                                className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
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
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-8 w-8 text-primary" />
                          </div>

                          <h2 className="mt-5 text-2xl font-bold">
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

                          <div className="mx-auto mt-5 max-w-xs">
                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${
                                    (quizScore /
                                      quizData
                                        .questions
                                        .length) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                              {Math.round(
                                (quizScore /
                                  quizData
                                    .questions
                                    .length) *
                                  100
                              )}
                              % score
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={
                              resetQuiz
                            }
                            className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                          >
                            Try Again
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {/* =================================================
                    FLASHCARDS
                ================================================= */}

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
                        className="group min-h-[320px] w-full rounded-3xl border bg-card p-8 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {showFlashcardAnswer
                              ? "ANSWER"
                              : "QUESTION"}
                          </span>

                          <span className="text-xs font-medium text-muted-foreground">
                            {flashcardIndex +
                              1}{" "}
                            /{" "}
                            {
                              flashcards.length
                            }
                          </span>
                        </div>

                        <div className="flex min-h-[230px] items-center justify-center py-8">
                          <MarkdownContent
                            content={
                              showFlashcardAnswer
                                ? currentFlashcard.answer
                                : currentFlashcard.question
                            }
                          />
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Click to{" "}
                          {showFlashcardAnswer
                            ? "see question"
                            : "reveal answer"}
                        </p>
                      </button>

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          disabled={
                            flashcardIndex ===
                            0
                          }
                          onClick={
                            previousFlashcard
                          }
                          className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>

                        <div className="text-xs text-muted-foreground">
                          {Math.round(
                            ((flashcardIndex +
                              1) /
                              flashcards.length) *
                              100
                          )}
                          % complete
                        </div>

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
                          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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

        {/* =====================================================
            INPUT AREA
        ===================================================== */}

        <div className="sticky bottom-0 border-t bg-background/95 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-4">
          <div className="mx-auto max-w-5xl">
            {/* DOCUMENT STATUS */}

            {documentId && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 shrink-0" />

                <span className="truncate">
                  {documentName}
                </span>

                <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-green-500" />
              </div>
            )}

            {/* INPUT */}

            <form
              onSubmit={
                sendMessage
              }
              className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-lg shadow-black/5"
            >
              <button
                type="button"
                disabled={
                  uploading
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted disabled:opacity-50"
                title="Attach PDF"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <textarea
                ref={
                  textareaRef
                }
                value={input}
                onChange={(
                  event
                ) =>
                  setInput(
                    event.target
                      .value
                  )
                }
                onKeyDown={
                  handleTextareaKeyDown
                }
                placeholder={
                  toolMode ===
                  "chat"
                    ? "Ask anything..."
                    : documentId
                      ? `Use ${currentTool?.label.toLowerCase()} mode...`
                      : "Upload a PDF or ask anything..."
                }
                rows={1}
                disabled={
                  loading
                }
                className="max-h-40 min-h-10 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  uploading ||
                  !input.trim()
                }
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                title="Send message"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-[10px] text-muted-foreground sm:text-[11px]">
                Enter to send · Shift + Enter for new line
              </p>

              <p className="hidden text-[10px] text-muted-foreground sm:block">
                AI can make mistakes
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}