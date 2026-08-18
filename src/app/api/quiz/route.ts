import { generateText } from "ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openrouter } from "@/lib/openrouter";

export const runtime = "nodejs";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("=================================");
    console.log("QUIZ REQUEST BODY:", body);
    console.log("=================================");

    // -----------------------------------------
    // Get topic
    // -----------------------------------------

    const rawTopic =
      body.topic ??
      body.quizTopic ??
      body.question ??
      body.prompt ??
      "";

    const topic =
      typeof rawTopic === "string"
        ? rawTopic.trim()
        : "";

    // -----------------------------------------
    // Get document ID
    // -----------------------------------------

    const documentId =
      typeof body.documentId === "string" &&
      body.documentId.trim()
        ? body.documentId.trim()
        : null;

    // -----------------------------------------
    // Difficulty
    // -----------------------------------------

    const difficulty =
      body.difficulty === "easy" ||
      body.difficulty === "hard"
        ? body.difficulty
        : "medium";

    // -----------------------------------------
    // Question count
    // -----------------------------------------

    const questionCount =
      typeof body.questionCount === "number" &&
      body.questionCount >= 1 &&
      body.questionCount <= 20
        ? Math.floor(body.questionCount)
        : 5;

    // -----------------------------------------
    // Debug
    // -----------------------------------------

    console.log("QUIZ TOPIC:", topic);
    console.log("DOCUMENT ID:", documentId);
    console.log("DIFFICULTY:", difficulty);
    console.log("QUESTION COUNT:", questionCount);

    // -----------------------------------------
    // Validate topic
    // -----------------------------------------

    if (!topic) {
      return NextResponse.json(
        {
          error:
            "Quiz topic is required. Please enter a topic such as 'Photosynthesis'.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // Get PDF context
    // -----------------------------------------

    let documentContext = "";

    if (documentId) {
      const chunks =
        await prisma.documentChunk.findMany({
          where: {
            documentId,
          },
          orderBy: {
            chunkIndex: "asc",
          },
        });

      documentContext = chunks
        .map((chunk) => chunk.content)
        .join("\n\n")
        .trim();

      console.log(
        "PDF CHUNKS FOUND:",
        chunks.length
      );
    }

    // -----------------------------------------
    // System prompt
    // -----------------------------------------

    let systemPrompt = `
You are an expert AI quiz generator for students.

Generate a high-quality multiple-choice quiz.

The quiz should be educational, accurate, and appropriate for the requested topic.

RULES:

- Generate exactly ${questionCount} questions.
- Each question must have exactly 4 options.
- Only ONE option must be correct.
- correctAnswer must be the ZERO-BASED index of the correct option.
- Valid correctAnswer values are 0, 1, 2, or 3.
- Include a short explanation for every answer.
- Questions should test understanding, not only memorization.
- Avoid duplicate questions.
- Avoid ambiguous questions.
- Do not invent facts.
- Keep questions clear and student-friendly.

DIFFICULTY:

${difficulty}

IMPORTANT OUTPUT RULE:

Return ONLY valid JSON.

Do not use Markdown.
Do not use code fences.
Do not add any text before or after the JSON.

The JSON must have this structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Short explanation"
    }
  ]
}
`;

    // -----------------------------------------
    // Add PDF context
    // -----------------------------------------

    if (documentContext) {
      systemPrompt += `

The student has uploaded study material.

Use the study material as the PRIMARY source when the quiz topic is related to it.

Do not invent information that contradicts the study material.

If the requested topic is not covered by the study material, you may use general educational knowledge.

STUDY MATERIAL:

${documentContext}
`;
    }

    // -----------------------------------------
    // User prompt
    // -----------------------------------------

    const prompt = `
Create a ${difficulty} multiple-choice quiz about:

"${topic}"

Generate exactly ${questionCount} questions.

Each question must contain:

- question
- exactly 4 options
- correctAnswer as a zero-based number
- explanation

Return ONLY valid JSON.
`;

    // -----------------------------------------
    // Generate quiz
    // -----------------------------------------

    console.log("GENERATING QUIZ...");

    const result = await generateText({
      model: openrouter(
        "openai/gpt-oss-20b:free"
      ),

      system: systemPrompt,

      prompt,
    });

    // -----------------------------------------
    // Clean AI response
    // -----------------------------------------

    let rawText = result.text.trim();

    rawText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    console.log(
      "RAW QUIZ RESPONSE:",
      rawText
    );

    // -----------------------------------------
    // Parse JSON
    // -----------------------------------------

    let parsed: {
      questions?: QuizQuestion[];
    };

    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      console.error(
        "QUIZ JSON PARSE ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "The AI returned an invalid quiz format. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // Validate questions array
    // -----------------------------------------

    if (
      !parsed.questions ||
      !Array.isArray(parsed.questions)
    ) {
      return NextResponse.json(
        {
          error:
            "The AI did not return valid quiz questions.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // Validate and clean questions
    // -----------------------------------------

    const questions: QuizQuestion[] =
      parsed.questions
        .slice(0, questionCount)
        .map((item) => {
          const options =
            Array.isArray(item.options)
              ? item.options
                  .filter(
                    (option) =>
                      typeof option ===
                      "string"
                  )
                  .map((option) =>
                    option.trim()
                  )
                  .slice(0, 4)
              : [];

          let correctAnswer =
            Number(item.correctAnswer);

          if (
            !Number.isInteger(
              correctAnswer
            ) ||
            correctAnswer < 0 ||
            correctAnswer > 3
          ) {
            correctAnswer = 0;
          }

          return {
            question:
              typeof item.question ===
              "string"
                ? item.question.trim()
                : "",

            options,

            correctAnswer,

            explanation:
              typeof item.explanation ===
              "string"
                ? item.explanation.trim()
                : "",
          };
        })
        .filter(
          (item) =>
            item.question &&
            item.options.length === 4
        );

    // -----------------------------------------
    // Make sure questions exist
    // -----------------------------------------

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid quiz questions were generated. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // Return
    // -----------------------------------------

    console.log(
      `QUIZ SUCCESS: ${questions.length} questions`
    );

    return NextResponse.json({
      questions,
      topic,
      difficulty,
      documentUsed:
        Boolean(documentContext),
    });
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "QUIZ API ERROR:",
      error
    );

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate quiz.",
      },
      {
        status: 500,
      }
    );
  }
}