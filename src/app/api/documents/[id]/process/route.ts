import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractText } from "unpdf";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("PROCESSING DOCUMENT:", id);

    // --------------------------------------------------
    // 1. Find document
    // --------------------------------------------------

    const document = await prisma.document.findUnique({
      where: {
        id,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          error: "Document not found",
        },
        { status: 404 }
      );
    }

    console.log("DOCUMENT FOUND:", {
      id: document.id,
      filename: document.filename,
      fileUrl: document.fileUrl,
    });

    // --------------------------------------------------
    // 2. Check file URL
    // --------------------------------------------------

    if (!document.fileUrl) {
      return NextResponse.json(
        {
          error: "Document has no file URL",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Check Vercel Blob token
    // --------------------------------------------------

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          error: "BLOB_READ_WRITE_TOKEN is missing",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 4. Download PDF
    // --------------------------------------------------

    console.log("DOWNLOADING PDF...");

    const response = await fetch(document.fileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("BLOB RESPONSE:", response.status);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to download PDF: ${response.status} ${response.statusText}`,
        },
        { status: 500 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        {
          error: "Downloaded PDF is empty",
        },
        { status: 400 }
      );
    }

    console.log(
      "PDF DOWNLOADED:",
      arrayBuffer.byteLength,
      "bytes"
    );

    // --------------------------------------------------
    // 5. Extract text
    // --------------------------------------------------

    console.log("EXTRACTING TEXT...");

    const { text } = await extractText(
      new Uint8Array(arrayBuffer)
    );

    const fullText = Array.isArray(text)
      ? text
          .join("\n\n")
          .replace(/\s+/g, " ")
          .trim()
      : String(text || "")
          .replace(/\s+/g, " ")
          .trim();

    console.log(
      "EXTRACTED CHARACTERS:",
      fullText.length
    );

    // --------------------------------------------------
    // 6. No text found
    // --------------------------------------------------

    if (!fullText) {
      return NextResponse.json(
        {
          error:
            "No text could be extracted from this PDF. This may be a scanned/image-only PDF. Please try a PDF with selectable text.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Create chunks
    // --------------------------------------------------

    const chunkSize = 2000;
    const chunks: string[] = [];

    for (
      let i = 0;
      i < fullText.length;
      i += chunkSize
    ) {
      const chunk = fullText
        .slice(i, i + chunkSize)
        .trim();

      if (chunk.length > 0) {
        chunks.push(chunk);
      }
    }

    console.log(
      "CREATED CHUNKS:",
      chunks.length
    );

    if (chunks.length === 0) {
      return NextResponse.json(
        {
          error: "No document chunks were created",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 8. Delete previous chunks
    // --------------------------------------------------

    await prisma.documentChunk.deleteMany({
      where: {
        documentId: id,
      },
    });

    // --------------------------------------------------
    // 9. Save chunks
    // --------------------------------------------------

    await prisma.documentChunk.createMany({
      data: chunks.map((content, index) => ({
        documentId: id,
        content,
        chunkIndex: index,
      })),
    });

    // --------------------------------------------------
    // 10. Mark document as processed
    // --------------------------------------------------

    await prisma.document.update({
      where: {
        id,
      },
      data: {
        status: "processed",
      },
    });

    // --------------------------------------------------
    // 11. Success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      documentId: id,
      characters: fullText.length,
      chunks: chunks.length,
    });
  } catch (error) {
    console.error(
      "PDF PROCESSING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process PDF",
      },
      { status: 500 }
    );
  }
}