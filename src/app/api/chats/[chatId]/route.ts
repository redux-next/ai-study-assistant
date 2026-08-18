import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
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

    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json(
        {
          error: "Chat ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },

      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        {
          error: "Chat not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error(
      "GET /api/chats/[chatId] ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load chat.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
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

    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json(
        {
          error: "Chat ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },

      select: {
        id: true,
      },
    });

    if (!chat) {
      return NextResponse.json(
        {
          error: "Chat not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/chats/[chatId] ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete chat.",
      },
      {
        status: 500,
      }
    );
  }
}