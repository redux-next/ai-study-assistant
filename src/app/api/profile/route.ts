import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },

      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error("PROFILE GET ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load profile.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: Request) {
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

    const body = await request.json();

    const name = String(body.name || "").trim();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const avatarUrl =
      body.avatarUrl === null ||
      body.avatarUrl === undefined
        ? null
        : String(body.avatarUrl).trim() || null;

    const currentPassword = String(
      body.currentPassword || ""
    );

    const newPassword = String(
      body.newPassword || ""
    );

    if (!name) {
      return NextResponse.json(
        {
          error: "Name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: user.id,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Another account already uses this email.",
        },
        {
          status: 409,
        }
      );
    }

    let hashedPassword = user.password;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            error:
              "Current password is required to change your password.",
          },
          {
            status: 400,
          }
        );
      }

      const passwordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordValid) {
        return NextResponse.json(
          {
            error: "Current password is incorrect.",
          },
          {
            status: 400,
          }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            error:
              "New password must be at least 6 characters.",
          },
          {
            status: 400,
          }
        );
      }

      hashedPassword = await bcrypt.hash(
        newPassword,
        12
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        name,
        email,
        avatarUrl,
        password: hashedPassword,
      },

      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update profile.",
      },
      {
        status: 500,
      }
    );
  }
}