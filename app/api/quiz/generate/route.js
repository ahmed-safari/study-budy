import { NextResponse } from "next/server";
import { prisma } from "@/utils/database";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { materialId, numQuestions, difficulty, questionType } =
      await request.json();

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
          error: "Material does not have any content to generate a quiz from",
        },
        { status: 400 }
      );
    }

    // Set default parameters
    const quizParams = {
      numQuestions: numQuestions || 5,
      difficulty: difficulty || "medium",
      questionType: questionType || "multiple-choice",
    };

    // Generate quiz questions using OpenAI
    const questions = await generateQuizQuestions(
      material.rawContent,
      quizParams
    );

    // Create the quiz in the database
    const quiz = await prisma.quiz.create({
      data: {
        title: `Quiz on ${material.title || "Study Material"}`,
        description: `A ${quizParams.difficulty} difficulty quiz with ${quizParams.numQuestions} ${quizParams.questionType} questions.`,
        difficulty: quizParams.difficulty,
        materialId: material.id,
        questions: {
          create: questions,
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate quiz",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate quiz questions using OpenAI
 */
async function generateQuizQuestions(content, params) {
  // Truncate content if it's too long (OpenAI has token limits)
  const truncatedContent =
    content.length > 15000 ? content.substring(0, 15000) + "..." : content;

  const { numQuestions, difficulty, questionType } = params;

  // Create a prompt for OpenAI to generate quiz questions
  const prompt = `
    Based on the following study material, create ${numQuestions} ${difficulty} difficulty ${questionType} questions.

    Study Material:
    ${truncatedContent}

    Requirements:
    1. Generate exactly ${numQuestions} questions
    2. Make the questions ${difficulty} level difficulty
    3. Each question should have question text and 4 options (for multiple-choice/multi-select) or True/False options
    4. Include the correct answer(s)
    5. Include a brief explanation for each answer
    7. The question type should be "${questionType}" (multiple-choice, multi-select, or true-false)
    6. Return the result in the following JSON format:

    [
      {
        "text": "Question text here",
        "type": "question type here", // "multiple-choice", "multi-select", or "true-false"
        "options": [
          {"id": "a", "text": "Option A"},
          {"id": "b", "text": "Option B"},
          {"id": "c", "text": "Option C"},
          {"id": "d", "text": "Option D"}
        ],
        "correctAnswer": if "multi-select" ? '["a", "c"]' : '"a"'},
        "explanation": "Explanation of why the answer is correct"
      }
    ]

    Notes:
    - For multiple-choice questions, correctAnswer should be a single string (the id of the correct option)
    - For multi-select questions, correctAnswer should be an array of strings (the ids of all correct options)
    - For true-false questions, use only two options with ids "true" and "false"
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a professional educator creating high-quality quiz questions based on study materials.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const responseText = response.choices[0].message.content.trim();

    // Extract the JSON part from the response
    let jsonStr = responseText;

    // If OpenAI wrapped the JSON in markdown code blocks, extract it
    if (responseText.includes("```json")) {
      jsonStr = responseText.split("```json")[1].split("```")[0].trim();
    } else if (responseText.includes("```")) {
      jsonStr = responseText.split("```")[1].split("```")[0].trim();
    }

    // Parse the JSON
    let questions = JSON.parse(jsonStr);

    // Validate and format the questions
    questions = questions.map((q) => ({
      text: q.text,
      type: q.type || questionType,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    }));

    return questions;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate quiz questions: ${error.message}`);
  }
}
