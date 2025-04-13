// fileProcessors.js
import fetch from "node-fetch";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Process factory that returns the appropriate processor based on file type
 * @param {string} fileType - MIME type of the file
 * @returns {Object} - Processor object with process method
 */
export function getFileProcessor(fileType) {
  const processors = {
    "application/pdf": new PdfProcessor(),
    // Add audio processors
    "audio/mpeg": new AudioProcessor(),
    "audio/mp3": new AudioProcessor(),
    "audio/wav": new AudioProcessor(),
    "audio/x-m4a": new AudioProcessor(),
    "audio/m4a": new AudioProcessor(),
    "audio/mp4": new AudioProcessor(),
    "audio/x-wav": new AudioProcessor(),
  };

  return processors[fileType] || new DefaultProcessor();
}

/**
 * Base processor class with common methods
 */
class FileProcessor {
  async process(fileUrl, options = {}) {
    throw new Error("Process method must be implemented by subclasses");
  }

  /**
   * Download file content from URL
   */
  async downloadFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText}`
      );
    }
    return response.buffer();
  }

  /**
   * Update process status
   */
  async updateStatus(materialId, status, prisma) {
    // Log status update for debugging
    console.log(`Updating material ${materialId} status to: ${status}`);

    try {
      const result = await prisma.material.update({
        where: { id: materialId },
        data: { status },
      });
      console.log(`Status updated successfully for ${materialId}`);
      return result;
    } catch (error) {
      console.error(
        `Failed to update status for material ${materialId}:`,
        error
      );
      throw error;
    }
  }
}

/**
 * PDF Processor using OpenAI API
 */
class PdfProcessor extends FileProcessor {
  async process(fileUrl, { materialId, prisma, updateProgress }) {
    try {
      // Log processing start for tracking
      console.log(
        `Starting processing for material ID: ${materialId}, URL: ${fileUrl}`
      );

      // Update status to processing
      await this.updateStatus(materialId, "processing", prisma);

      if (updateProgress) updateProgress(20, "Downloading PDF file...");

      // Download the PDF
      const pdfBuffer = await this.downloadFile(fileUrl);
      console.log(
        `PDF downloaded successfully for ${materialId}, size: ${pdfBuffer.length} bytes`
      );

      if (updateProgress)
        updateProgress(40, "Sending PDF to OpenAI for processing...");

      // Update status to reflect the current step
      await this.updateStatus(materialId, "Converting to text", prisma);

      // Extract text and generate description in a single API call
      const { extractedText, description } = await this.processWithOpenAI(
        pdfBuffer
      );

      console.log(
        `Text extracted successfully for ${materialId}, length: ${extractedText.length} chars`
      );
      console.log(`Description generated for ${materialId}: ${description}`);

      if (updateProgress) updateProgress(80, "Storing processed content...");

      // Save the extracted text and description to the database
      await prisma.material.update({
        where: { id: materialId },
        data: {
          rawContent: extractedText,
          description: description,
          status: "Ready", // Use consistent status naming
        },
      });
      console.log(`Processing completed for ${materialId}`);

      if (updateProgress) updateProgress(100, "Processing complete");

      return {
        success: true,
        text: extractedText,
        description: description,
      };
    } catch (error) {
      console.error(`PDF processing error for ${materialId}:`, error);

      // Update status to error
      try {
        await this.updateStatus(materialId, "error", prisma);
      } catch (statusError) {
        console.error(
          `Failed to update error status for ${materialId}:`,
          statusError
        );
      }

      if (updateProgress) updateProgress(100, "Error processing file");

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process PDF with OpenAI API to extract text and generate description in one call
   */
  async processWithOpenAI(pdfBuffer) {
    try {
      // Convert buffer to base64 for OpenAI API
      const base64Pdf = pdfBuffer.toString("base64");

      // Call OpenAI API to extract text and generate description in one go
      // Configured to return JSON and handle visual elements properly
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a PDF content extractor that provides responses in JSON format only. When processing a PDF document:" +
              "\n1. Extract ALL text content including headers, paragraphs, bullets, footnotes, and captions." +
              "\n2. Pay special attention to images, graphs, tables, charts, and diagrams - describe their content in detail within the text. Include numerical data from tables, axis labels from charts, and key information from diagrams." +
              "\n3. Create a very concise description (maximum 2 sentences) of what this document is about." +
              "\n4. Always maintain the document's structure and formatting as much as possible." +
              "\nReturn your response as valid JSON with the following format:" +
              "\n{" +
              '\n  "extracted_text": "The full extracted text with all content including descriptions of visual elements",' +
              '\n  "description": "A concise 1-2 sentence description of the document"' +
              "\n}" +
              "\nDO NOT include any text, markdown formatting, or explanation outside the JSON structure.",
          },
          {
            role: "user",
            content: [
              {
                type: "file",
                file: {
                  file_data: `data:application/pdf;base64,${base64Pdf}`,
                  filename: "document.pdf",
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });

      // Parse the JSON response
      const content = response.choices[0]?.message?.content || "";
      let extractedText = "";
      let description = "No description available";

      try {
        const jsonResponse = JSON.parse(content);
        extractedText = jsonResponse.extracted_text || "";
        description = jsonResponse.description || "No description available";
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        // Fallback to using the raw content if JSON parsing fails
        extractedText = content;
      }

      return { extractedText, description };
    } catch (error) {
      console.error("Error using OpenAI API:", error);
      throw new Error(
        `Failed to process PDF using OpenAI API: ${error.message}`
      );
    }
  }
}

/**
 * Audio Processor using OpenAI Whisper API
 */
class AudioProcessor extends FileProcessor {
  async process(fileUrl, { materialId, prisma, updateProgress }) {
    try {
      // Log processing start for tracking
      console.log(
        `Starting audio processing for material ID: ${materialId}, URL: ${fileUrl}`
      );

      // Update status to processing
      await this.updateStatus(materialId, "processing", prisma);

      if (updateProgress) updateProgress(20, "Downloading audio file...");

      // Download the audio file
      const audioBuffer = await this.downloadFile(fileUrl);
      console.log(
        `Audio downloaded successfully for ${materialId}, size: ${audioBuffer.length} bytes`
      );

      if (updateProgress)
        updateProgress(
          40,
          "Sending audio to OpenAI Whisper for transcription..."
        );

      // Update status to reflect the current step
      await this.updateStatus(materialId, "Transcribing audio", prisma);

      // Transcribe audio and generate description in a single API call
      const { transcribedText, description } = await this.transcribeWithWhisper(
        audioBuffer
      );

      console.log(
        `Audio transcribed successfully for ${materialId}, length: ${transcribedText.length} chars`
      );
      console.log(`Description generated for ${materialId}: ${description}`);

      if (updateProgress) updateProgress(80, "Storing transcribed content...");

      // Save the transcribed text and description to the database
      await prisma.material.update({
        where: { id: materialId },
        data: {
          rawContent: transcribedText,
          description: description,
          status: "Ready", // Use consistent status naming
        },
      });
      console.log(`Processing completed for ${materialId}`);

      if (updateProgress) updateProgress(100, "Processing complete");

      return {
        success: true,
        text: transcribedText,
        description: description,
      };
    } catch (error) {
      console.error(`Audio processing error for ${materialId}:`, error);

      // Update status to error
      try {
        await this.updateStatus(materialId, "error", prisma);
      } catch (statusError) {
        console.error(
          `Failed to update error status for ${materialId}:`,
          statusError
        );
      }

      if (updateProgress) updateProgress(100, "Error processing file");

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Transcribe audio with OpenAI Whisper API and generate description
   */
  async transcribeWithWhisper(audioBuffer) {
    try {
      // Create a FormData object with the audio file for the OpenAI API
      // First, we need to create a temporary file for the audio buffer
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
      formData.append("file", audioBlob, "audio.mp3");
      formData.append("model", "whisper-1");
      formData.append("response_format", "verbose_json");

      // Call OpenAI Whisper API to transcribe audio
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" }),
        model: "whisper-1",
        response_format: "verbose_json",
      });

      const transcribedText = transcriptionResponse.text || "";

      // Generate a description from the transcribed text
      let description = "Audio transcription";

      // Only attempt to generate a description if we have enough transcribed text
      if (transcribedText && transcribedText.length > 50) {
        try {
          // Use GPT to generate a brief description of the audio content
          const descriptionResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "Generate a very concise description (maximum 2 sentences) of what this audio transcription is about.",
              },
              {
                role: "user",
                content: transcribedText.substring(0, 1000), // Use first 1000 chars to generate description
              },
            ],
            max_tokens: 100,
          });

          description = descriptionResponse.choices[0].message.content.trim();
        } catch (descError) {
          console.error("Error generating description:", descError);
          // Fall back to default description
        }
      }

      return { transcribedText, description };
    } catch (error) {
      console.error("Error using OpenAI Whisper API:", error);
      throw new Error(
        `Failed to transcribe audio using Whisper API: ${error.message}`
      );
    }
  }
}

/**
 * Default processor for unsupported file types
 */
class DefaultProcessor extends FileProcessor {
  async process(fileUrl, { materialId, prisma }) {
    await this.updateStatus(materialId, "unsupported", prisma);
    return {
      success: false,
      error: "Unsupported file type",
    };
  }
}

/**
 * Process a file based on its type
 * @param {string} fileUrl - URL to the file
 * @param {string} fileType - MIME type of the file
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Processing result
 */
export async function processFile(fileUrl, fileType, options = {}) {
  console.log(
    `Processing file of type ${fileType}, materialId: ${options.materialId}`
  );
  const processor = getFileProcessor(fileType);
  return processor.process(fileUrl, options);
}
