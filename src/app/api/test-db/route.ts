import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users =
      await prisma.user.count();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "DATABASE TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
