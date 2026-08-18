import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ChatMode =
  | "chat"
  | "summarize"
  | "explain"
  | "quiz"
  | "flashcards";

type RequestBody = {
  question?: string;
  documentId?: string | null;
  mode?: ChatMode;
  chatId?: string | null;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown server error.";
}

function buildPrompt(
  question: string,
  mode: ChatMode,
  documentContext: string
) {
  const contextPart = documentContext
    ? `
The student has selected a study document.

Use the following document context when relevant:

---------------- DOCUMENT CONTEXT ----------------
${documentContext}
---------------- END DOCUMENT CONTEXT ------------
`
    : `
No study document has been selected.

Answer using your general knowledge.
`;

  if (mode === "summarize") {
    return `
You are StudyAI, an AI study assistant.

${contextPart}

Summarize the material clearly.

Include:
- Important concepts
- Definitions
- Formulas
- Key facts
- Important examples
- Exam-relevant points

Use Markdown.
Use LaTeX for mathematics.

Student request:
${question}
`;
  }

  if (mode === "explain") {
    return `
You are StudyAI, an AI tutor.

${contextPart}

Explain the requested topic in a simple,
student-friendly way.

Rules:
- Start with the basic idea.
- Explain step by step.
- Use simple examples.
- Include formulas.
- Explain mathematical symbols.
- Use Markdown.
- Use LaTeX for mathematics.

Student request:
${question}
`;
  }

  if (mode === "quiz") {
    return `
You are StudyAI.

${contextPart}

Create a useful practice quiz.

Use Markdown.

Student request:
${question}
`;
  }

  if (mode === "flashcards") {
    return `
You are StudyAI.

${contextPart}

Create useful study flashcards.

Each flashcard should contain:
- Question
- Answer

Use Markdown and LaTeX.

Student request:
${question}
`;
  }

  return `
You are StudyAI, a helpful AI study assistant.

${contextPart}

Answer accurately and clearly.

Rules:
- Explain concepts step by step.
- Use student-friendly language.
- Use headings.
- Use bullet points.
- Use Markdown.
- Use LaTeX for mathematics.
- Mathematical expressions should use:
  $x^2$
  $$E = mc^2$$
- Do not invent information from the document.

Student question:
${question}
`;
}

async function getDocumentContext(
  documentId: string | null | undefined,
  userId: string
): Promise<string> {
  if (!documentId) {
    return "";
  }

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId,
    },

    include: {
      chunks: {
        orderBy: {
          chunkIndex: "asc",
        },
      },
    },
  });

  if (!document) {
    return "";
  }

  return document.chunks
    .map((chunk) => chunk.content)
    .join("\n\n")
    .slice(0, 30000);
}

async function callOpenRouter(
  prompt: string
): Promise<string> {
  const apiKey =
    process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured."
    );
  }

  const model =
    process.env.OPENROUTER_MODEL ||
    "openai/gpt-4o-mini";

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${apiKey}`,

        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ||
          "http://localhost:3000",

        "X-Title": "StudyAI",
      },

      body: JSON.stringify({
        model,

        messages: [
          {
            role: "system",
            content:
              "You are StudyAI, a reliable AI study assistant.",
          },

          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.3,
      }),
    }
  );

  const text = await response.text();

  let data: any = {};

  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "OpenRouter returned invalid JSON."
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        data?.error ||
        `OpenRouter request failed with status ${response.status}.`
    );
  }

  const answer =
    data?.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error(
      "OpenRouter returned an empty response."
    );
  }

  return String(answer);
}

export async function POST(
  request: Request
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;

    const body =
      (await request.json()) as RequestBody;

    const question =
      body.question?.trim() || "";

    const documentId =
      body.documentId || null;

    const mode =
      body.mode || "chat";

    let chatId =
      body.chatId || null;

    if (!question) {
      return NextResponse.json(
        {
          error: "Please enter a question.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Verify document belongs to current user
     */

    if (documentId) {
      const document =
        await prisma.document.findFirst({
          where: {
            id: documentId,
            userId,
          },

          select: {
            id: true,
          },
        });

      if (!document) {
        return NextResponse.json(
          {
            error:
              "The selected document was not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    /*
     * Verify chat belongs to current user
     */

    if (chatId) {
      const existingChat =
        await prisma.chat.findFirst({
          where: {
            id: chatId,
            userId,
          },

          select: {
            id: true,
          },
        });

      if (!existingChat) {
        chatId = null;
      }
    }

    /*
     * Create chat
     */

    if (!chatId) {
      const title =
        question.length > 80
          ? `${question.slice(0, 77)}...`
          : question;

      const newChat =
        await prisma.chat.create({
          data: {
            title:
              title || "New chat",

            userId,
          },
        });

      chatId = newChat.id;
    }

    /*
     * Save user message
     */

    await prisma.message.create({
      data: {
        chatId,
        role: "user",
        content: question,
      },
    });

    /*
     * Document context
     */

    const documentContext =
      await getDocumentContext(
        documentId,
        userId
      );

    /*
     * AI prompt
     */

    const prompt = buildPrompt(
      question,
      mode,
      documentContext
    );

    /*
     * OpenRouter
     */

    const answer =
      await callOpenRouter(prompt);

    /*
     * Save assistant message
     */

    await prisma.message.create({
      data: {
        chatId,
        role: "assistant",
        content: answer,
      },
    });

    /*
     * Update chat
     */

    await prisma.chat.update({
      where: {
        id: chatId,
      },

      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      chatId,
      answer,
      mode,
      documentId,
    });
  } catch (error) {
    console.error(
      "POST /api/chat ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: errorMessage(error),
      },
      {
        status: 500,
      }
    );
  }
}