import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

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

    if (name.length < 2) {
      return NextResponse.json(
        {
          error:
            "Name must contain at least 2 characters.",
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

    if (!email.includes("@")) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error: "Password is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------
    // CHECK EXISTING USER
    // ----------------------------------------

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please sign in instead.",
        },
        {
          status: 409,
        }
      );
    }

    // ----------------------------------------
    // HASH PASSWORD
    // ----------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // ----------------------------------------
    // CREATE USER
    // ----------------------------------------

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },

        select: {
          id: true,
          name: true,
          email: true,
        },
      });

    console.log(
      "REGISTER: User created:",
      user.email
    );

    // ----------------------------------------
    // SUCCESS
    // ----------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully.",
        user,
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    console.error(
      "REGISTER API ERROR:",
      error
    );

    const prismaError =
      error as {
        code?: string;
      };

    // ----------------------------------------
    // DUPLICATE EMAIL
    // ----------------------------------------

    if (
      prismaError?.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // ----------------------------------------
    // DATABASE ERROR
    // ----------------------------------------

    if (
      typeof prismaError?.code ===
        "string" &&
      prismaError.code.startsWith("P")
    ) {
      return NextResponse.json(
        {
          error:
            "Database error while creating your account.",
        },
        {
          status: 500,
        }
      );
    }

    // ----------------------------------------
    // UNKNOWN ERROR
    // ----------------------------------------

    return NextResponse.json(
      {
        error:
          "Unable to create account. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}