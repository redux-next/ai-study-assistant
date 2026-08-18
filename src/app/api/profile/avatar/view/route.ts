import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { get } from "@vercel/blob";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        avatarUrl: true,
      },
    });

    if (!user?.avatarUrl) {
      return new NextResponse("Avatar not found", {
        status: 404,
      });
    }

    /*
     * avatarUrl may contain either:
     *
     * 1. The pathname:
     *    avatars/user-id-123.png
     *
     * 2. The complete Blob URL.
     *
     * We support both.
     */

    let pathname = user.avatarUrl;

    if (pathname.startsWith("http")) {
      try {
        const url = new URL(pathname);
        pathname = decodeURIComponent(
          url.pathname.replace(/^\/+/, "")
        );
      } catch {
        return new NextResponse("Invalid avatar URL", {
          status: 400,
        });
      }
    }

    const blob = await get(pathname, {
      access: "private",
    });

    if (!blob || !blob.stream) {
      return new NextResponse("Avatar not found", {
        status: 404,
      });
    }

    return new NextResponse(blob.stream, {
      status: 200,
      headers: {
        "Content-Type":
          blob.blob?.contentType ||
          "image/jpeg",

        "Cache-Control":
          "private, max-age=3600",

        "Content-Disposition":
          "inline",
      },
    });
  } catch (error) {
    console.error(
      "AVATAR VIEW ERROR:",
      error
    );

    return new NextResponse(
      "Failed to load avatar",
      {
        status: 500,
      }
    );
  }
}