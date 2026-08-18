import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  console.log("🔥 REGISTER API CALLED");

  try {
    const body = await request.json();

    console.log("📦 Request body received");

    const name = String(body.name || "").trim();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    console.log("📧 Email:", email);
    console.log("👤 Name:", name);
    console.log("🔑 Password received:", password.length > 0);

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    console.log("🔎 Checking if user already exists...");

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      console.log("⚠️ User already exists");

      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    console.log("🔐 Hashing password...");

    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("👤 Creating user...");

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    console.log("✅ USER CREATED:", user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);

    if (error instanceof Error) {
      console.error("❌ ERROR MESSAGE:", error.message);
      console.error("❌ ERROR STACK:", error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create account.",
      },
      { status: 500 }
    );
  }
}