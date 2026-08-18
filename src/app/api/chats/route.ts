import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const chats = await prisma.chat.findMany({
      where: {
        userId: session.user.id,
      },

      orderBy: {
        updatedAt: "desc",
      },

      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      chats,
    });
  } catch (error) {
    console.error("GET /api/chats ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load chats.",
      },
      {
        status: 500,
      }
    );
  }
}