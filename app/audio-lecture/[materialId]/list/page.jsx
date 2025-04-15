"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  File,
  FileText,
  ArrowLeft,
  Plus,
  Headphones,
  Loader,
  AlertCircle,
  Clock,
  Play,
  RefreshCw,
} from "lucide-react";

const AudioLectureListPage = () => {
  const [material, setMaterial] = useState(null);
  const [audioLectures, setAudioLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const params = useParams();
  const router = useRouter();
  const materialId = params.materialId;

  useEffect(() => {
    fetchData();
  }, [materialId]);

  const fetchData = async () => {
    if (!materialId) return;

    try {
      // Fetch material details
      const materialResponse = await fetch(`/api/materials/${materialId}`);
      if (!materialResponse.ok) {
        throw new Error(`Failed to fetch material: ${materialResponse.status}`);
      }

      const materialData = await materialResponse.json();
      if (materialData.success) {
        setMaterial({
          id: materialData.material_id,
          title: materialData.title,
          fileName: materialData.fileName,
          type: materialData.type,
          link: materialData.link,
          status: materialData.material_status,
        });
      } else {
        throw new Error(
          materialData.error || "Unknown error fetching material"
        );
      }

      // Fetch audio lectures
      const lecturesResponse = await fetch(
        `/api/material/${materialId}/audio-lectures`
      );
      if (!lecturesResponse.ok) {
        throw new Error(
          `Failed to fetch audio lectures: ${lecturesResponse.status}`
        );
      }

      const lecturesData = await lecturesResponse.json();
      if (lecturesData.success) {
        setAudioLectures(lecturesData.audioLectures || []);
      } else {
        throw new Error(
          lecturesData.error || "Unknown error fetching audio lectures"
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewAudioLecture = (lectureId) => {
    router.push(`/audio-lecture/${materialId}/view?lectureId=${lectureId}`);
  };

  const handleCreateAudioLecture = () => {
    router.push(`/audio-lecture/${materialId}/create`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusBadgeColor = (status) => {
    const statusColors = {
      ready: "bg-green-100 text-green-800",
      processing: "bg-blue-100 text-blue-800",
      "generating-audio": "bg-purple-100 text-purple-800",
      error: "bg-red-100 text-red-800",
    };

    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ready":
        return "Ready";
      case "processing":
        return "Processing";
      case "generating-audio":
        return "Generating Audio";
      case "error":
        return "Error";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <Loader className="h-12 w-12 text-teal-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-800">
            Loading audio lectures...
          </h2>
        </div>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col p-6 md:p-10">
      <div className="max-w-4xl mx-auto w-full">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Audio Lectures
            </h1>
            <p className="text-gray-600">
              {material && `For: ${material.title || "Untitled Material"}`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              onClick={handleCreateAudioLecture}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Audio Lecture
            </Button>
          </div>
        </div>

        {/* Audio Lectures List */}
        <div className="space-y-6">
          {audioLectures.length === 0 ? (
            <Card className="bg-white shadow-md">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  No Audio Lectures Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any audio lectures for this material.
                </p>
                <Button
                  onClick={handleCreateAudioLecture}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Audio Lecture
                </Button>
              </CardContent>
            </Card>
          ) : (
            audioLectures.map((lecture) => (
              <Card
                key={lecture.id}
                className="bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-teal-100 p-3 rounded-full mr-4">
                      <Headphones className="h-6 w-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800 line-clamp-1">
                          {lecture.title}
                        </h3>
                        <Badge className={getStatusBadgeColor(lecture.status)}>
                          {getStatusText(lecture.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>
                          Created:{" "}
                          {new Date(lecture.createdAt).toLocaleDateString()}
                        </span>
                        {lecture.duration && lecture.status === "ready" && (
                          <>
                            <span className="mx-2">•</span>
                            <span>
                              {Math.floor(lecture.duration / 60)} min{" "}
                              {lecture.duration % 60} sec
                            </span>
                          </>
                        )}
                        {lecture.voice && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Voice: {lecture.voice}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      className={
                        lecture.status === "ready"
                          ? "bg-teal-600 hover:bg-teal-700 text-white"
                          : "bg-gray-300 text-gray-700 cursor-not-allowed"
                      }
                      size="sm"
                      onClick={() =>
                        lecture.status === "ready" &&
                        handleViewAudioLecture(lecture.id)
                      }
                      disabled={lecture.status !== "ready"}
                    >
                      {lecture.status === "ready" ? (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </>
                      ) : lecture.status === "error" ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Error
                        </>
                      ) : (
                        <>
                          <Loader className="h-4 w-4 mr-1 animate-spin" />
                          Processing
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Material Overview Card */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 mt-8 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              Material Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="w-24 text-sm text-gray-600">Title:</div>
              <div className="font-medium">{material?.title || "Untitled"}</div>
            </div>
            {material?.fileName && (
              <div className="flex items-center">
                <div className="w-24 text-sm text-gray-600">File:</div>
                <div className="font-mono text-sm text-gray-800">
                  {material.fileName}
                </div>
              </div>
            )}
            {material?.type && (
              <div className="flex items-center">
                <div className="w-24 text-sm text-gray-600">Type:</div>
                <div>{material.type}</div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-gray-300"
              onClick={() => router.push(`/materials/${materialId}`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Material Details
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AudioLectureListPage;
