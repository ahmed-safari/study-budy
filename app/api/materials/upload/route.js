// pages/api/material/upload.js
import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/database";

export async function POST(request) {
  // Extract sessionId from the URL parameter
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  const body = await request.json();
  console.log("Request body: ", body);
  console.log("Session ID: ", sessionId);

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ["application/pdf"], // Allow PDFs for this upload.
          tokenPayload: JSON.stringify({ sessionId }), // Pass sessionId in token payload
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Blob upload completed", blob);

        try {
          // Parse the token payload to get the session ID
          const payload = JSON.parse(tokenPayload || "{}");
          const sessionIdFromToken = payload.sessionId || sessionId;

          // Extract file information from the blob
          const { name, size, type, url } = blob;

          // Create the material in the database
          const material = await prisma.material.create({
            data: {
              title: name.split(".")[0], // Use filename (without extension) as title
              type: type,
              link: url,
              fileName: name,
              studySessionId: sessionIdFromToken,
            },
          });

          console.log("Material saved to database", material);
          return { success: true, materialId: material.id };
        } catch (dbError) {
          console.error("Failed to save material to database:", dbError);
          return { success: false, error: dbError.message };
        }
      },
    });

    console.log("Upload requested successfully: ", jsonResponse);
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
