import { generateText } from "ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openrouter } from "@/lib/openrouter";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const topic =
      typeof body.topic === "string"
        ? body.topic.trim()
        : "";

    const documentId =
      typeof body.documentId === "string"
        ? body.documentId
        : null;

    const requestedCardCount =
      Number(body.cardCount);

    const cardCount =
      [5, 10, 15, 20].includes(
        requestedCardCount
      )
        ? requestedCardCount
        : 10;

    // -----------------------------------------
    // Validate topic
    // -----------------------------------------

    if (!topic) {
      return NextResponse.json(
        {
          error: "Flashcard topic is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Get PDF context
    // -----------------------------------------

    let context = "";

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

      context = chunks
        .map((chunk) => chunk.content)
        .join("\n\n")
        .trim();
    }

    // -----------------------------------------
    // System prompt
    // -----------------------------------------

    let systemPrompt = `You are an expert AI flashcard generator for a student learning platform.

Your job is to create accurate, useful educational flashcards.

GENERAL RULES:

- Create exactly ${cardCount} flashcards.
- Each flashcard must contain one clear question and one accurate answer.
- Focus on important concepts, definitions, facts, formulas, terminology, dates, processes, and relationships.
- Keep questions clear and specific.
- Keep answers concise but useful.
- Do not make answers unnecessarily long.
- Do not invent facts.
- Do not create duplicate flashcards.
- Use simple language when possible.
- Preserve important mathematical symbols, formulas, names, dates, and numbers.

OUTPUT FORMAT:

Return ONLY valid JSON.

Do not include:
- Markdown
- Code fences
- Explanations outside the JSON
- Text before or after the JSON

The JSON must have exactly this structure:

{
  "flashcards": [
    {
      "question": "Question text",
      "answer": "Answer text"
    }
  ]
}

IMPORTANT:

- The flashcards array must contain exactly ${cardCount} flashcards.
- question must be a string.
- answer must be a string.
`;

    // -----------------------------------------
    // PDF context
    // -----------------------------------------

    if (context) {
      systemPrompt += `

STUDY MATERIAL:

The student has uploaded a PDF.

When the requested topic relates to the PDF, use the PDF as the PRIMARY source.

Do not contradict the PDF.

Do not invent information that is not supported by the PDF when creating flashcards specifically about the PDF.

If the topic is unrelated to the PDF, you may use your general educational knowledge.

PDF CONTENT:

${context}
`;
    }

    // -----------------------------------------
    // Generate flashcards
    // -----------------------------------------

    const result = await generateText({
      model: openrouter(
        "openai/gpt-oss-20b:free"
      ),

      system: systemPrompt,

      prompt: `
Create ${cardCount} useful study flashcards.

Topic:

${topic}

Return ONLY the required JSON object.
`,
    });

    // -----------------------------------------
    // Parse AI response
    // -----------------------------------------

    let flashcardData;

    try {
      let cleanedText =
        result.text.trim();

      // Remove accidental Markdown code fences
      cleanedText = cleanedText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      flashcardData =
        JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "FLASHCARD JSON PARSE ERROR:",
        parseError
      );

      console.error(
        "AI RESPONSE:",
        result.text
      );

      return NextResponse.json(
        {
          error:
            "The AI returned an invalid flashcard format. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // Validate structure
    // -----------------------------------------

    if (
      !flashcardData ||
      !Array.isArray(
        flashcardData.flashcards
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The AI returned an invalid flashcard structure.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // Validate count
    // -----------------------------------------

    if (
      flashcardData.flashcards.length !==
      cardCount
    ) {
      return NextResponse.json(
        {
          error:
            "The AI did not generate the requested number of flashcards. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // Validate every flashcard
    // -----------------------------------------

    for (const card of flashcardData.flashcards) {
      if (
        typeof card.question !==
          "string" ||
        typeof card.answer !==
          "string" ||
        !card.question.trim() ||
        !card.answer.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "The AI generated an invalid flashcard format. Please try again.",
          },
          {
            status: 500,
          }
        );
      }
    }

    // -----------------------------------------
    // Return flashcards
    // -----------------------------------------

    return NextResponse.json({
      flashcards:
        flashcardData.flashcards,
      topic,
      cardCount,
      documentUsed: Boolean(context),
    });
  } catch (error) {
    console.error(
      "FLASHCARD API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate flashcards.",
      },
      {
        status: 500,
      }
    );
  }
}