import { NextResponse } from "next/server";
import { prisma } from "@/utils/database";
import OpenAI from "openai";
import { put } from "@vercel/blob";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { materialId, title, voice, style, duration } = await request.json();

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
            "Material does not have any content to generate an audio lecture from",
        },
        { status: 400 }
      );
    }

    // Create the audio lecture record in the database with "processing" status
    const audioLecture = await prisma.audioLecture.create({
      data: {
        title: title || `Audio Lecture: ${material.title || "Study Material"}`,
        audioUrl: "", // Will be updated later
        voice: voice || "alloy",
        style: style || null,
        status: "processing",
        materialId: material.id,
      },
    });

    // Start processing in the background
    processAudioLecture(audioLecture.id, material.rawContent, {
      title: title || `Audio Lecture: ${material.title || "Study Material"}`,
      voice: voice || "alloy",
      style: style || null,
      targetDuration: duration || 0, // 0 means no specific target
    }).catch((error) => {
      console.error("Error processing audio lecture:", error);
    });

    return NextResponse.json({
      success: true,
      audioLecture: {
        id: audioLecture.id,
        title: audioLecture.title,
        status: audioLecture.status,
      },
      message:
        "Audio lecture generation started. Check the status endpoint to monitor progress.",
    });
  } catch (error) {
    console.error("Error generating audio lecture:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate audio lecture",
      },
      { status: 500 }
    );
  }
}

/**
 * Process audio lecture asynchronously
 */
async function processAudioLecture(audioLectureId, content, config) {
  try {
    // Generate lecture script first
    const lectureScript = await generateLectureScript(
      content,
      config.title,
      config.targetDuration
    );

    // Update status to indicate script generation is complete
    await prisma.audioLecture.update({
      where: { id: audioLectureId },
      data: {
        status: "generating-audio",
      },
    });

    // Generate audio using OpenAI Text-to-Speech API
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: config.voice, // alloy, echo, fable, onyx, nova, shimmer
      input: lectureScript,
    });

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    // Calculate an estimated duration (roughly 150 words per minute)
    const wordCount = lectureScript.split(/\s+/).length;
    const estimatedDurationSeconds = Math.ceil((wordCount / 150) * 60);

    // Upload the audio to Vercel Blob storage
    const fileName = `${audioLectureId}-${Date.now()}.mp3`;
    const blob = await put(fileName, buffer, {
      contentType: "audio/mpeg",
      access: "public",
    });

    // Update the audio lecture record with the URL and duration
    await prisma.audioLecture.update({
      where: { id: audioLectureId },
      data: {
        audioUrl: blob.url,
        duration: estimatedDurationSeconds,
        status: "ready",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error processing audio lecture:", error);

    // Update the status to error
    await prisma.audioLecture.update({
      where: { id: audioLectureId },
      data: { status: "error" },
    });

    return { success: false, error: error.message };
  }
}

/**
 * Generate a lecture script using OpenAI
 */
async function generateLectureScript(content, title, targetDuration) {
  // Truncate content if it's too long (OpenAI has token limits)
  const truncatedContent =
    content.length > 10000 ? content.substring(0, 10000) + "..." : content;

  // Adjust prompt based on target duration
  let durationInstructions =
    "The total lecture should be 5-10 minutes when read aloud (approximately 750-1500 words)";

  if (targetDuration > 0) {
    // If specific duration is requested, adjust word count (150 words per minute is average speaking pace)
    const targetWords = Math.round(targetDuration * (150 / 60));
    durationInstructions = `The total lecture should be approximately ${targetDuration} seconds when read aloud (target around ${targetWords} words)`;
  }

  const prompt = `
    Based on the following study material, create an engaging lecture script.

    Study Material:
    ${truncatedContent}

    Requirements:
    1. The lecture should be titled: ${title}
    2. Create a conversational, clear explanation of the material
    3. Structure the content logically with clear transitions
    4. Focus on the most important concepts and key points
    5. Include brief introductory and concluding remarks
    6. Keep sentences relatively short for better text-to-speech results
    7. Avoid complex symbols or notations that wouldn't work well in speech
    8. ${durationInstructions}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a professional educator creating engaging and informative audio lectures based on study materials.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const lectureScript = response.choices[0].message.content.trim();
    return lectureScript;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate lecture script: ${error.message}`);
  }
}
