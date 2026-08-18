"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

export function UploadPdf() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "Upload failed");
      }

      const document = JSON.parse(responseText);

      if (!document.id) {
        throw new Error(
          "Upload succeeded but no document ID was returned."
        );
      }

      setFileName(document.originalName);

      // Save the latest document ID
      localStorage.setItem("activeDocumentId", document.id);

      // Process the PDF
      setIsUploading(false);
      setIsProcessing(true);

      const processResponse = await fetch(
        `/api/documents/${document.id}/process`,
        {
          method: "POST",
        }
      );

      const processText = await processResponse.text();

      if (!processResponse.ok) {
        throw new Error(
          processText || "Failed to process the PDF."
        );
      }

      const processData = JSON.parse(processText);

      console.log("PDF PROCESSING:", processData);

      alert("PDF uploaded and processed successfully!");
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading the PDF."
      );
    } finally {
      setIsUploading(false);
      setIsProcessing(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        disabled={isUploading || isProcessing}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />

        {isUploading
          ? "Uploading..."
          : isProcessing
          ? "Processing..."
          : "Upload PDF"}
      </button>

      {fileName && (
        <p className="mt-2 text-sm text-muted-foreground">
          Saved: {fileName}
        </p>
      )}
    </div>
  );
}