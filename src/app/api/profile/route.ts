import { NextResponse } from "next/server";

import { auth } from "@/auth";

import prisma from "@/lib/prisma";

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

    const user =
      await prisma.user.findUnique({
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
    console.error(
      "PROFILE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load profile.",
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
        },
      );
    }

    const body = await request.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const currentPassword =
      typeof body?.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body?.newPassword === "string"
        ? body.newPassword
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error: "Name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          error:
            "Name must contain at least 2 characters.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        {
          status: 400,
        },
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
        },
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
        },
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
          },
        );
      }

      const passwordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!passwordValid) {
        return NextResponse.json(
          {
            error:
              "Current password is incorrect.",
          },
          {
            status: 400,
          },
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
          },
        );
      }

      hashedPassword = await bcrypt.hash(
        newPassword,
        12,
      );
    }

    /*
     * IMPORTANT
     *
     * If avatarUrl is not included in the request,
     * keep the existing avatar.
     *
     * If avatarUrl is null, remove the avatar.
     *
     * If avatarUrl is a string, save the new URL.
     */

    const avatarWasProvided =
      Object.prototype.hasOwnProperty.call(
        body,
        "avatarUrl",
      );

    let avatarUrl = user.avatarUrl;

    if (avatarWasProvided) {
      if (
        body.avatarUrl === null ||
        body.avatarUrl === ""
      ) {
        avatarUrl = null;
      } else if (
        typeof body.avatarUrl === "string"
      ) {
        avatarUrl = body.avatarUrl.trim() || null;
      }
    }

    const updatedUser =
      await prisma.user.update({
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
          createdAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error(
      "PROFILE UPDATE ERROR:",
      error,
    );

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Another account already uses this email.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update profile.",
      },
      {
        status: 500,
      },
    );
  }
}