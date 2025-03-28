"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import {
  File,
  X,
  Link,
  Youtube,
  FileText,
  FileAudio,
  FileVideo,
  Trash2,
  Loader,
  CheckCircle,
  Image,
  Clock,
} from "lucide-react";
import { upload } from "@vercel/blob/client";

// Upload a PDF file using Vercel Blob – note that this returns a blob object containing an "id" for polling.
async function uploadPdfFile(file, setProcessingStatus) {
  // get the sessionId from the URL
  const sessionId = useParams().sessionId;
  // Here we set an initial temporary status using a temp ID.
  const tempMaterialId = Math.random().toString(36).substring(7);
  setProcessingStatus((prev) => ({
    ...prev,
    [tempMaterialId]: { progress: 0, statusText: "Uploading" },
  }));

  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/materials/upload?sessionId=" + sessionId,
  });

  // Use the blob.id if provided; otherwise, fall back to our tempMaterialId.
  const materialId = blob.id || tempMaterialId;
  // Start polling the material status after upload is complete.
  pollMaterialStatus(materialId, setProcessingStatus);
  return materialId;
}

// Poll the material status every 3 seconds by calling /materials/[materialId]/.
function pollMaterialStatus(materialId, setProcessingStatus) {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/materials/${materialId}/`);
      const data = await res.json();
      // Map returned statuses to a progress value (adjust as needed).
      const statusMap = {
        "Converting to text": 25,
        "Skimming Through": 50,
        Summarizing: 75,
        Ready: 100,
      };
      const progress = statusMap[data.material_status] || 0;
      setProcessingStatus((prev) => ({
        ...prev,
        [materialId]: {
          ...prev[materialId],
          progress,
          statusText: data.material_status,
        },
      }));
      if (data.material_status === "Ready") {
        clearInterval(interval);
      }
    } catch (err) {
      console.error("Error polling material status:", err);
    }
  }, 3000);
}

// import { fetchYouTubeMetadata } from "@/utils/youtube";

// ---------------------
// Header Component
// ---------------------
const Header = () => (
  <header className="mb-8 text-center">
    <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
      Upload Study Materials
    </h1>
    <p className="mt-2 text-gray-700">
      Manage your study resources with style and efficiency.
    </p>
  </header>
);

// ---------------------
// Footer Component
// ---------------------
const Footer = () => (
  <footer className="mt-12 text-center text-sm text-gray-500">
    <p>&copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
  </footer>
);

// ---------------------
// File Upload Component
// ---------------------
const FileUpload = ({ handleDrop, handleFileChange, fileInputId }) => (
  <Card className="bg-white shadow-lg border rounded-lg overflow-hidden transition hover:shadow-xl">
    <CardContent className="p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Upload Files</h2>
      <div
        className="border border-dashed rounded-lg p-6 text-center transition hover:border-gray-600 hover:bg-gray-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <File className="h-8 w-8 text-gray-600 mb-2" />
          <p className="text-gray-700">Drop your files here</p>
          <p className="text-sm text-gray-500 mb-4">
            Supported: PDF, DOCX, MP4, MP3, WAV
          </p>
          <Button
            onClick={() => document.getElementById(fileInputId).click()}
            className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            Browse Files
          </Button>
          <input
            id={fileInputId}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.docx,.mp4,.mp3,.wav"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-500">Max file size: 100MB</p>
    </CardContent>
  </Card>
);

// ---------------------
// Link Upload Component
// ---------------------
const LinkUpload = ({
  currentLink,
  setCurrentLink,
  handleAddLink,
  links,
  handleRemoveLink,
  youtubeLoading,
}) => (
  <Card className="bg-white shadow-lg border rounded-lg overflow-hidden transition hover:shadow-xl">
    <CardContent className="p-6">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Add Links</h2>
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Paste YouTube or resource URL"
          value={currentLink}
          onChange={(e) => setCurrentLink(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddLink()}
          className="flex-1 border"
        />
        <Button
          onClick={handleAddLink}
          disabled={youtubeLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          {youtubeLoading ? <Loader className="h-5 w-5 animate-spin" /> : "Add"}
        </Button>
      </div>
      {links.map((link) => (
        <div
          key={link.id}
          className="flex items-center justify-between p-3 border rounded mb-2"
        >
          <div className="flex items-center space-x-2">
            {link.isYouTube ? (
              <Youtube className="h-5 w-5 text-red-600" />
            ) : (
              <Link className="h-5 w-5 text-blue-600" />
            )}
            <span className="text-sm text-gray-800 truncate">{link.url}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveLink(link.id)}
            className="p-1"
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      ))}
    </CardContent>
  </Card>
);

// ---------------------
// File Preview Component
// ---------------------
const FilePreview = ({
  file,
  isUploading,
  processingStatus,
  processingPhases,
  formatFileSize,
  getProgressGradient,
  handleRemoveFile,
  getFileIcon,
}) => (
  <div
    className="p-4 border rounded transition hover:shadow-md"
    style={{ borderColor: file.color }}
  >
    <div className="flex items-start">
      <div className="mr-4">
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: `${file.color}20` }}
        >
          {getFileIcon(file.type)}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <span className="font-medium text-gray-800">{file.title}</span>
          <Badge variant="outline" className="text-xs">
            {file.subject || "No subject"}
          </Badge>
        </div>
        {isUploading ? (
          <>
            <p className="text-sm text-gray-600">
              {processingPhases.file[processingStatus[file.id]?.phase || 0]}
            </p>
            <div className="h-2 rounded-full overflow-hidden bg-gray-200 mt-1">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${processingStatus[file.id]?.progress || 0}%`,
                  background: getProgressGradient(
                    processingStatus[file.id]?.progress || 0
                  ),
                }}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
          </>
        )}
        <div className="flex justify-end mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFile(file.id)}
            className="p-1"
          >
            <Trash2 className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// ---------------------
// Link Preview Component
// ---------------------
const LinkPreview = ({
  link,
  isUploading,
  processingStatus,
  processingPhases,
  getProgressGradient,
  handleRemoveLink,
}) => (
  <div
    className="p-4 border rounded transition hover:shadow-md"
    style={{ borderColor: link.isYouTube ? "#B91C1C" : link.color }}
  >
    <div className="flex items-start">
      <div className="mr-4">
        {link.isYouTube ? (
          <div className="p-2 rounded-full bg-red-100">
            <Youtube className="h-8 w-8 text-red-600" />
          </div>
        ) : (
          <div
            className="p-2 rounded-full"
            style={{ backgroundColor: `${link.color}20` }}
          >
            <Link className="h-8 w-8" style={{ color: link.color }} />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <span className="font-medium text-gray-800">{link.title}</span>
          <Badge variant="outline" className="text-xs">
            {link.subject || "No subject"}
          </Badge>
        </div>
        {isUploading ? (
          <>
            <p className="text-xs text-gray-600 truncate mb-2">{link.url}</p>
            <p className="text-sm text-gray-600">
              {processingPhases.link[processingStatus[link.id]?.phase || 0]}
            </p>
            <div className="h-2 rounded-full overflow-hidden bg-gray-200 mt-1">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${processingStatus[link.id]?.progress || 0}%`,
                  background: getProgressGradient(
                    processingStatus[link.id]?.progress || 0
                  ),
                }}
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-600 truncate">{link.url}</p>
        )}
        <div className="flex justify-end mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveLink(link.id)}
            className="p-1"
          >
            <Trash2 className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// ---------------------
// Preview Section Component
// ---------------------
const PreviewSection = ({
  files,
  links,
  isUploading,
  processingStatus,
  processingPhases,
  formatFileSize,
  getProgressGradient,
  handleRemoveFile,
  handleRemoveLink,
  getFileIcon,
}) => (
  <Card className="bg-white shadow-lg border rounded-lg overflow-hidden transition mt-6">
    <CardContent className="p-6">
      <h2 className="text-xl font-medium text-gray-800 text-center mb-6">
        Your Study Materials
      </h2>
      {files.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg text-gray-800 mb-4 border-b pb-2">Files</h3>
          <div className="space-y-4">
            {files.map((file) => (
              <FilePreview
                key={file.id}
                file={file}
                isUploading={isUploading}
                processingStatus={processingStatus}
                processingPhases={processingPhases}
                formatFileSize={formatFileSize}
                getProgressGradient={getProgressGradient}
                handleRemoveFile={handleRemoveFile}
                getFileIcon={getFileIcon}
              />
            ))}
          </div>
        </div>
      )}
      {links.length > 0 && (
        <div>
          <h3 className="text-lg text-gray-800 mb-4 border-b pb-2">Links</h3>
          <div className="space-y-4">
            {links.map((link) => (
              <LinkPreview
                key={link.id}
                link={link}
                isUploading={isUploading}
                processingStatus={processingStatus}
                processingPhases={processingPhases}
                getProgressGradient={getProgressGradient}
                handleRemoveLink={handleRemoveLink}
              />
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

// ---------------------
// Ingest Button Component
// ---------------------
const IngestButton = ({ files, links, isUploading, handleIngest }) => (
  <div className="flex justify-center mt-6">
    <Button
      size="lg"
      onClick={handleIngest}
      disabled={isUploading || (files.length === 0 && links.length === 0)}
      className="px-8 py-4 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-70"
    >
      {isUploading ? (
        <div className="flex items-center">
          <Loader className="mr-3 h-5 w-5 animate-spin" />
          Processing...
        </div>
      ) : (
        "Ingest Materials"
      )}
    </Button>
  </div>
);

// ---------------------
// Main UploadMaterialsPage Component
// ---------------------
const UploadMaterialsPage = () => {
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [currentLink, setCurrentLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({});
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  // Utility functions
  const getRandomBubbleColor = () => {
    // For file borders and badges
    const colors = ["#4B5563", "#6B7280", "#9CA3AF"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getFileIcon = (type) => {
    const fileTypeIcons = {
      "application/pdf": <FileText className="h-8 w-8 text-gray-600" />,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        <FileText className="h-8 w-8 text-gray-600" />,
      "video/mp4": <FileVideo className="h-8 w-8 text-gray-600" />,
      "audio/mpeg": <FileAudio className="h-8 w-8 text-gray-600" />,
      "audio/wav": <FileAudio className="h-8 w-8 text-gray-600" />,
      default: <File className="h-8 w-8 text-gray-600" />,
    };
    return fileTypeIcons[type] || fileTypeIcons.default;
  };

  const getProgressGradient = (progress) => {
    // Using a simple gradient for progress bars
    const colors = ["#3B82F6", "#2563EB"];
    return `linear-gradient(to right, ${colors[0]}, ${colors[1]})`;
  };

  const processingPhases = {
    link: [
      "Validating link",
      "Downloading",
      "Processing",
      "Finalizing",
      "Complete",
    ],
    file: [
      "Checking file",
      "Uploading",
      "Processing",
      "Finalizing",
      "Complete",
    ],
  };

  // Handlers for file uploads
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter((file) =>
      [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "video/mp4",
        "audio/mpeg",
        "audio/wav",
      ].includes(file.type)
    );
    const newFiles = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      title: file.name,
      subject: "",
      color: getRandomBubbleColor(),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // For each file, simply store it in state along with an "uploaded" flag.
    const newFiles = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      title: file.name,
      subject: "",
      color: getRandomBubbleColor(),
      uploaded: false, // not uploaded yet
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleAddLink = async () => {
    if (currentLink.trim() !== "") {
      if (
        currentLink.includes("youtube.com") ||
        currentLink.includes("youtu.be")
      ) {
        setYoutubeLoading(true);
        try {
          // Call your API route to fetch metadata
          const response = await fetch(
            `/api/youtube?url=${encodeURIComponent(currentLink)}`
          );
          const responseJson = await response.json();
          //   const response = await response.json();
          if (!responseJson.success) throw new Error(data.error);
          const metadata = responseJson.data;
          console.log("YouTube metadata client:", metadata);
          const newLink = {
            id: Math.random().toString(36).substring(7),
            url: currentLink,
            isYouTube: true,
            title: metadata.title,
            duration: metadata.duration,
            thumbnailUrl: metadata.thumbnailUrl,
            subject: "YouTube",
            color: "#B91C1C",
          };
          setLinks((prev) => [...prev, newLink]);
          setCurrentLink("");
        } catch (error) {
          console.error("Error fetching YouTube metadata:", error);
          // Optionally display an error message to the user
        } finally {
          setYoutubeLoading(false);
        }
      } else {
        const newLink = {
          id: Math.random().toString(36).substring(7),
          url: currentLink,
          isYouTube: false,
          title: "Web Resource",
          subject: "",
          color: getRandomBubbleColor(),
        };
        setLinks((prev) => [...prev, newLink]);
        setCurrentLink("");
      }
    }
  };

  const handleRemoveFile = (id) =>
    setFiles((prev) => prev.filter((file) => file.id !== id));
  const handleRemoveLink = (id) =>
    setLinks((prev) => prev.filter((link) => link.id !== id));

  const handleIngest = async () => {
    setIsUploading(true);
    // Initialize processingStatus for each file (and links if needed)
    const initialStatus = {};
    files.forEach((file) => {
      initialStatus[file.id] = {
        phase: 0,
        progress: 0,
        type: "file",
        statusText: "",
      };
    });
    setProcessingStatus(initialStatus);

    // For each PDF file that hasn't been uploaded, perform the Vercel Blob upload
    for (const fileObj of files) {
      if (fileObj.type === "application/pdf" && !fileObj.uploaded) {
        try {
          const materialId = await uploadPdfFile(
            fileObj.file,
            setProcessingStatus
          );
          // Update the file object in state with the new materialId and mark it as uploaded.
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileObj.id ? { ...f, id: materialId, uploaded: true } : f
            )
          );
        } catch (error) {
          console.error("Error during file upload:", error);
        }
      }
    }

    // // For non-PDF files or after uploading PDFs, you can simulate processing as before:
    // const allItems = [...files];
    // allItems.forEach((item) => {
    //   simulateProcessing(
    //     item.id,
    //     item.type === "application/pdf" ? true : false
    //   );
    // });
  };

  const simulateProcessing = (id, isFile) => {
    const itemType = isFile ? "file" : "link";
    const phases = processingPhases[itemType];
    let currentPhase = 0;
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        currentPhase++;
        progress = 0;
        if (currentPhase >= phases.length - 1) {
          clearInterval(interval);
          setProcessingStatus((prev) => ({
            ...prev,
            [id]: { phase: phases.length - 1, progress: 100, type: itemType },
          }));
        } else {
          setProcessingStatus((prev) => ({
            ...prev,
            [id]: { phase: currentPhase, progress, type: itemType },
          }));
        }
      } else {
        setProcessingStatus((prev) => ({
          ...prev,
          [id]: { phase: currentPhase, progress, type: itemType },
        }));
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            handleDrop={handleDrop}
            handleFileChange={handleFileChange}
            fileInputId="fileInput"
          />
          <LinkUpload
            currentLink={currentLink}
            setCurrentLink={setCurrentLink}
            handleAddLink={handleAddLink}
            links={links}
            handleRemoveLink={handleRemoveLink}
            youtubeLoading={youtubeLoading}
          />
        </div>
        {(files.length > 0 || links.length > 0) && (
          <PreviewSection
            files={files}
            links={links}
            isUploading={isUploading}
            processingStatus={processingStatus}
            processingPhases={processingPhases}
            formatFileSize={formatFileSize}
            getProgressGradient={getProgressGradient}
            handleRemoveFile={handleRemoveFile}
            handleRemoveLink={handleRemoveLink}
            getFileIcon={getFileIcon}
          />
        )}
        {(files.length > 0 || links.length > 0) && (
          <IngestButton
            files={files}
            links={links}
            isUploading={isUploading}
            handleIngest={handleIngest}
          />
        )}
        {isUploading &&
          Object.values(processingStatus).every(
            (status) =>
              status.phase === processingPhases[status.type].length - 1 &&
              status.progress === 100
          ) && (
            <div className="mt-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-green-600" />
              <h3 className="text-xl font-medium text-gray-800 mt-2">
                Processing Complete
              </h3>
              <p className="text-gray-600">
                Your materials are ready for review.
              </p>
            </div>
          )}
        <Footer />
      </div>
    </div>
  );
};

export default UploadMaterialsPage;
