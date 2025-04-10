// fileProcessors.js
import fetch from "node-fetch";
import { OpenAI } from "openai";
import pdfParse from "pdf-parse";

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
    // Add more processors as needed:
    // 'audio/mpeg': new AudioProcessor(),
    // 'video/mp4': new VideoProcessor(),
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
    return prisma.material.update({
      where: { id: materialId },
      data: { status },
    });
  }
}

/**
 * PDF Processor
 */
class PdfProcessor extends FileProcessor {
  async process(fileUrl, { materialId, prisma, updateProgress }) {
    try {
      // Update status to processing
      await this.updateStatus(materialId, "processing", prisma);

      if (updateProgress) updateProgress(20, "Downloading PDF file...");

      // Download the PDF
      const pdfBuffer = await this.downloadFile(fileUrl);

      if (updateProgress) updateProgress(40, "Extracting text from PDF...");

      // Extract text from PDF
      const pdfData = await pdfParse(pdfBuffer);
      const extractedText = pdfData.text;

      if (updateProgress) updateProgress(80, "Storing extracted text...");

      // Save the extracted text to the database
      await prisma.material.update({
        where: { id: materialId },
        data: {
          rawContent: extractedText,
          status: "completed",
        },
      });

      if (updateProgress) updateProgress(100, "Processing complete");

      return {
        success: true,
        text: extractedText,
      };
    } catch (error) {
      console.error("PDF processing error:", error);

      // Update status to error
      await this.updateStatus(materialId, "error", prisma);

      if (updateProgress) updateProgress(100, "Error processing file");

      return {
        success: false,
        error: error.message,
      };
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
  const processor = getFileProcessor(fileType);
  return processor.process(fileUrl, options);
}
