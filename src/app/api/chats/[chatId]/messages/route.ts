import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    // =====================================
    // Get chatId from URL
    // =====================================

    const { chatId } =
      await context.params;

    console.log(
      "MESSAGE API CHAT ID:",
      chatId
    );

    // =====================================
    // Validate chatId
    // =====================================

    if (
      !chatId ||
      typeof chatId !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Chat ID is missing.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================
    // Get request body
    // =====================================

    const body =
      await request.json();

    const role =
      body.role;

    const content =
      body.content;

    if (
      role !== "user" &&
      role !== "assistant"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid message role.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof content !==
        "string" ||
      !content.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Message content is required.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================
    // Check chat exists
    // =====================================

    const chat =
      await prisma.chat.findUnique({
        where: {
          id: chatId,
        },
      });

    if (!chat) {
      return NextResponse.json(
        {
          error:
            "Chat not found.",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================
    // Create message
    // =====================================

    const message =
      await prisma.message.create({
        data: {
          role,
          content:
            content.trim(),
          chatId,
        },
      });

    console.log(
      "MESSAGE SAVED:",
      message.id
    );

    return NextResponse.json(
      {
        message,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "SAVE MESSAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save message.",
      },
      {
        status: 500,
      }
    );
  }
}