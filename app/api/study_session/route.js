import { prisma } from "@/utils/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all study sessions with their materials count
    const sessions = await prisma.studySession.findMany({
      include: {
        materials: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform the data to include material counts
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      title: session.title,
      subject: session.subject,
      description: session.description,
      materialsCount: session.materials.length,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedSessions,
    });
  } catch (error) {
    console.error("Failed to fetch study sessions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch study sessions",
      },
      { status: 500 }
    );
  }
}
