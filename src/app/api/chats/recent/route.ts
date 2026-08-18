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

    const userId = session.user.id;

    const chats = await prisma.chat.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 20,
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
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
      success: true,
      chats,
    });
  } catch (error) {
    console.error(
      "GET /api/chats/recent ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load recent chats.",
      },
      {
        status: 500,
      }
    );
  }
}