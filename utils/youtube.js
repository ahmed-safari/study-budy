// utils/youtube.js
import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";

/**
 * Fetches YouTube video metadata using ytdl-core.
 * @param {string} url - The YouTube video URL.
 * @returns {Promise<Object>} - An object containing title, thumbnailUrl, and duration.
 */
export async function fetchYouTubeMetadata(url) {
  try {
    console.log("Fetching YouTube metadata for", url);
    const info = await ytdl.getInfo(url);

    console.log(info);
    const { title, lengthSeconds, thumbnails } = info.videoDetails;
    // Choose the highest resolution thumbnail available.
    const thumbnailUrl = thumbnails[thumbnails.length - 1].url;
    const totalSeconds = parseInt(lengthSeconds, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    return { title, thumbnailUrl, duration };
  } catch (error) {
    console.error("Error fetching YouTube metadata:", error);
    throw error;
  }
}

/**
 * Downloads the audio from a YouTube video as an MP3 file using ytdl-core.
 * @param {string} url - The YouTube video URL.
 * @param {string} outputDir - The directory where the audio file will be saved.
 * @returns {Promise<string>} - Resolves with the absolute path to the downloaded audio file.
 */
export function downloadYouTubeAudio(url, outputDir) {
  return new Promise((resolve, reject) => {
    try {
      const videoID = ytdl.getURLVideoID(url);
      if (!videoID) {
        return reject(new Error("Invalid YouTube URL"));
      }
      const outputPath = path.join(outputDir, `${videoID}.mp3`);
      // Get only the highest-quality audio stream.
      const audioStream = ytdl(url, {
        quality: "highestaudio",
        filter: "audioonly",
      });
      const writeStream = fs.createWriteStream(outputPath);
      audioStream.pipe(writeStream);
      writeStream.on("finish", () => resolve(outputPath));
      writeStream.on("error", reject);
      audioStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}
