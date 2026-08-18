import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No image file was provided.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Please upload a JPG, PNG, WEBP, or GIF image.",
        },
        {
          status: 400,
        }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error:
            "Profile photo must be smaller than 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    const extension = extensionMap[file.type];

    if (!extension) {
      return NextResponse.json(
        {
          error: "Unsupported image type.",
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

      select: {
        id: true,
        avatarPathname: true,
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

    const pathname = `avatars/${user.id}-${Date.now()}.${extension}`;

    /*
     * IMPORTANT:
     * Your Vercel Blob store is PRIVATE.
     */
    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: false,
    });

    /*
     * Save the Blob URL + pathname in Prisma.
     */
    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        avatarUrl: blob.url,
        avatarPathname: blob.pathname,
      },
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error(
      "AVATAR UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to upload profile photo.",
      },
      {
        status: 500,
      }
    );
  }
}