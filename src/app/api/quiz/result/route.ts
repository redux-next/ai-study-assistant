import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const topic =
      typeof body.topic === "string"
        ? body.topic.trim()
        : "";

    const difficulty =
      typeof body.difficulty === "string"
        ? body.difficulty
        : "medium";

    const score =
      typeof body.score === "number"
        ? body.score
        : 0;

    const totalQuestions =
      typeof body.totalQuestions === "number"
        ? body.totalQuestions
        : 0;

    // -----------------------------------------
    // Validate
    // -----------------------------------------

    if (!topic) {
      return NextResponse.json(
        {
          error: "Quiz topic is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      totalQuestions <= 0 ||
      !Number.isInteger(totalQuestions)
    ) {
      return NextResponse.json(
        {
          error:
            "Total question count must be greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      score < 0 ||
      score > totalQuestions ||
      !Number.isInteger(score)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid quiz score.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // Calculate percentage
    // -----------------------------------------

    const percentage =
      Math.round(
        (score / totalQuestions) * 10000
      ) / 100;

    // -----------------------------------------
    // Save result
    // -----------------------------------------

    const quizResult =
      await prisma.quizResult.create({
        data: {
          topic,
          difficulty,
          score,
          totalQuestions,
          percentage,
        },
      });

    // -----------------------------------------
    // Also create study session
    // -----------------------------------------

    await prisma.studySession.create({
      data: {
        type: "quiz",
        topic,
      },
    });

    // -----------------------------------------
    // Return result
    // -----------------------------------------

    return NextResponse.json({
      success: true,
      result: {
        id: quizResult.id,
        topic: quizResult.topic,
        difficulty: quizResult.difficulty,
        score: quizResult.score,
        totalQuestions:
          quizResult.totalQuestions,
        percentage:
          quizResult.percentage,
        createdAt:
          quizResult.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "QUIZ RESULT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save quiz result.",
      },
      {
        status: 500,
      }
    );
  }
}