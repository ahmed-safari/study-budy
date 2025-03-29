// pages/api/material/upload.js
import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/database";

export async function POST(request) {
  const body = await request.json();
  console.log("Request body: ", body);

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ["application/pdf"], // Allow PDFs for this upload.
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Blob upload completed", blob, tokenPayload);
        // Optionally, perform post-upload processing here.

        // For example, save the blob information to your database.
        const { name, size, type, url } = blob;
        // Sechema:
        // id          String      @id @default(cuid())
        // title       String?
        // description String?
        // type        String
        // link        String?
        // fileName    String?
        // rawContent  String?

        // studySessionId String
        // studySession   StudySession @relation(fields: [studySessionId], references: [id])
        prisma.material.create({
          data: {
            type: type,
            link: url,
            fileName: name,
            studySessionId: "some-session-id", // Replace with actual session ID
          },
        });
        console.log("Material saved to database", { name, size, type, url });
      },
    });

    console.log("Upload requested successfully: ", jsonResponse);

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
