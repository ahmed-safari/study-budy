import { NextResponse } from "next/server";
import { prisma } from "@/utils/database";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { materialId, title } = await request.json();

    // Validate input
    if (!materialId) {
      return NextResponse.json(
        { success: false, error: "Material ID is required" },
        { status: 400 }
      );
    }

    // Get the material with raw content
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      );
    }

    if (!material.rawContent) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Material does not have any content to generate a summary from",
        },
        { status: 400 }
      );
    }

    // Generate summary using OpenAI
    const summary = await generateSummary(
      material.rawContent,
      title || `Summary of ${material.title || "Study Material"}`
    );

    // Create the summary in the database
    const summaryRecord = await prisma.summary.create({
      data: {
        title: title || `Summary of ${material.title || "Study Material"}`,
        content: summary,
        materialId: material.id,
      },
    });

    return NextResponse.json({
      success: true,
      summary: summaryRecord,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate summary",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate summary using OpenAI
 */
async function generateSummary(content, title) {
  // Truncate content if it's too long (OpenAI has token limits)
  const truncatedContent =
    content.length > 15000 ? content.substring(0, 15000) + "..." : content;

  // Create a prompt for OpenAI to generate summary
  const prompt = `
    Based on the following study material, create a comprehensive summary in markdown format.

    Study Material:
    ${truncatedContent}

    Requirements:
    1. The summary should be titled: ${title}
    2. Structure the summary with clear headings (using markdown # syntax) for main topics
    3. Use subheadings (##, ###) for subtopics
    4. Include bullet points for key concepts
    5. Include examples where appropriate
    6. Explain complex ideas clearly
    7. Format the output in well-structured markdown
    8. Include a brief summary at the beginning
    9. Group related concepts together
    10. Use bold and italic formatting to highlight key terms
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a professional educator creating high-quality study notes and summaries based on study materials.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const summaryText = response.choices[0].message.content.trim();
    return summaryText;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}
