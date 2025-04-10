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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  File,
  FileText,
  FileAudio,
  FileVideo,
  Youtube,
  Link as LinkIcon,
  Clock,
  Calendar,
  ArrowLeft,
  Brain,
  Sparkles,
  Book,
  PenTool,
  Settings,
  CheckCircle,
  MessageSquareDashed,
  Clock4,
  Loader,
  AlertTriangle,
  HelpCircle,
  CheckSquare,
  CircleDot,
  AlertCircle,
} from "lucide-react";

const QuizCreationPage = () => {
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedQuizId, setGeneratedQuizId] = useState(null);
  const [error, setError] = useState(null);
  const [quizParams, setQuizParams] = useState({
    title: "",
    numQuestions: 5,
    difficulty: "medium",
    questionType: "multiple-choice",
    timeLimit: 10, // minutes
  });

  const params = useParams();
  const router = useRouter();
  const materialId = params.materialId;

  useEffect(() => {
    const fetchMaterialDetails = async () => {
      if (!materialId) return;

      try {
        const response = await fetch(`/api/materials/${materialId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch material: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          const materialData = {
            id: data.material_id,
            title: data.title,
            fileName: data.fileName,
            type: data.type,
            link: data.link,
            status: data.material_status,
            rawContent: data.rawContent,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };

          setMaterial(materialData);
          setQuizParams((prev) => ({
            ...prev,
            title: `Quiz on ${data.title || "Study Material"}`,
          }));
        } else {
          throw new Error(data.error || "Unknown error fetching material");
        }
      } catch (error) {
        console.error("Error fetching material:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialDetails();
  }, [materialId]);

  const handleQuizParamChange = (param, value) => {
    setQuizParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          materialId,
          numQuestions: quizParams.numQuestions,
          difficulty: quizParams.difficulty,
          questionType: quizParams.questionType,
          timeLimit: quizParams.timeLimit,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      if (data.success && data.quiz) {
        setGeneratedQuizId(data.quiz.id);
      } else {
        throw new Error("No quiz data received");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      setError(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleViewQuiz = () => {
    if (generatedQuizId) {
      router.push(`/quiz/${materialId}/view?quizId=${generatedQuizId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <Loader className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-800">
            Loading material details...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Error Loading Material
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The requested material could not be found"}
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (material.status !== "Ready" && material.status !== "ready") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col p-6 md:p-10">
        <div className="max-w-4xl w-full mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Material Not Ready
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              This material is still being processed. Quiz generation requires
              fully processed materials. Current status:{" "}
              <span className="font-medium">{material.status}</span>
            </p>
            <div className="max-w-md mx-auto mb-8">
              <Progress
                value={
                  material.status === "Processing"
                    ? 75
                    : material.status === "Converting to text"
                    ? 80
                    : material.status === "Skimming Through"
                    ? 85
                    : material.status === "Summarizing"
                    ? 95
                    : 50
                }
                className="h-2 mb-2"
              />
              <p className="text-sm text-gray-500">
                Please check back later when processing is complete
              </p>
            </div>
            <Button
              onClick={() => router.push(`/materials/${materialId}`)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              Return to Material Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/materials/${materialId}`)}
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Material
        </Button>

        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">
            Create Quiz
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Generate a customized quiz based on "
            {material?.title || "this material"}" to test your knowledge and
            enhance learning retention.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz parameters */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                  Quiz Parameters
                </CardTitle>
                <CardDescription>Customize your quiz settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quiz Title */}
                <div className="space-y-2">
                  <Label htmlFor="quiz-title">Quiz Title</Label>
                  <Input
                    id="quiz-title"
                    value={quizParams.title}
                    onChange={(e) =>
                      handleQuizParamChange("title", e.target.value)
                    }
                    placeholder="Enter a title for your quiz"
                    className="w-full"
                  />
                </div>

                {/* Number of Questions */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700">
                    Number of Questions
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[3, 5, 10, 15, 20].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant={
                          quizParams.numQuestions === value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className={
                          quizParams.numQuestions === value
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "border-gray-200"
                        }
                        onClick={() =>
                          handleQuizParamChange("numQuestions", value)
                        }
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700">
                    Difficulty Level
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "hard", label: "Hard" },
                    ].map((diff) => (
                      <Button
                        key={diff.value}
                        type="button"
                        variant={
                          quizParams.difficulty === diff.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className={
                          quizParams.difficulty === diff.value
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "border-gray-200"
                        }
                        onClick={() =>
                          handleQuizParamChange("difficulty", diff.value)
                        }
                      >
                        {diff.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Question Type */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700">Question Type</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      {
                        value: "multiple-choice",
                        label: "Multiple Choice",
                        icon: <CircleDot className="h-3 w-3" />,
                      },
                      {
                        value: "true-false",
                        label: "True/False",
                        icon: <CheckSquare className="h-3 w-3" />,
                      },
                      {
                        value: "multi-select",
                        label: "Multi-Select",
                        icon: <MessageSquareDashed className="h-3 w-3" />,
                      },
                      {
                        value: "mixed",
                        label: "Mixed",
                        icon: <Brain className="h-3 w-3" />,
                      },
                    ].map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant={
                          quizParams.questionType === type.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className={
                          quizParams.questionType === type.value
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "border-gray-200"
                        }
                        onClick={() =>
                          handleQuizParamChange("questionType", type.value)
                        }
                      >
                        <span className="mr-1">{type.icon}</span>
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Limit */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700">
                    Time Limit (minutes)
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[5, 10, 15, 20, 30, "No Limit"].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant={
                          quizParams.timeLimit === value ? "default" : "outline"
                        }
                        size="sm"
                        className={
                          quizParams.timeLimit === value
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "border-gray-200"
                        }
                        onClick={() =>
                          handleQuizParamChange("timeLimit", value)
                        }
                      >
                        {value === "No Limit" ? value : `${value} min`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="rounded-md bg-red-50 p-4 border border-red-100">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-1 mr-2" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6">
                {generatedQuizId ? (
                  <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                    onClick={handleViewQuiz}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    View Generated Quiz
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    onClick={handleGenerateQuiz}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Material Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Material Info
                </CardTitle>
                <CardDescription>Source material details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-4">
                  {material.type?.includes("pdf") ||
                  material.fileName?.endsWith(".pdf") ? (
                    <FileText className="h-16 w-16 text-blue-600 mx-auto" />
                  ) : material.type?.includes("audio") ? (
                    <FileAudio className="h-16 w-16 text-emerald-600 mx-auto" />
                  ) : material.type?.includes("video") ? (
                    <FileVideo className="h-16 w-16 text-purple-600 mx-auto" />
                  ) : material.link?.includes("youtube") ? (
                    <Youtube className="h-16 w-16 text-red-600 mx-auto" />
                  ) : (
                    <File className="h-16 w-16 text-gray-600 mx-auto" />
                  )}

                  <h3
                    className="text-lg font-medium text-gray-800 mt-2 line-clamp-2"
                    title={material.title}
                  >
                    {material.title || "Untitled Material"}
                  </h3>

                  <Badge className="mt-2 bg-green-100 text-green-800">
                    Ready for Quiz
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {material.fileName && (
                    <div className="flex items-start">
                      <File className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                      <span className="text-gray-600 break-words">
                        {material.fileName}
                      </span>
                    </div>
                  )}

                  {material.createdAt && (
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                      <span className="text-gray-600">
                        Added:{" "}
                        {new Date(material.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {material.type && (
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                      <span className="text-gray-600">
                        Type: {material.type}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    About This Quiz
                  </h4>
                  <p className="text-xs text-gray-500">
                    This quiz will be generated based on the content of the
                    material. The AI will analyze the text and create relevant
                    questions to test your knowledge.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-center border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/materials/${materialId}`)}
                  className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <ArrowLeft className="mr-2 h-3 w-3" />
                  Back to Material
                </Button>
              </CardFooter>
            </Card>

            {/* Generation info card */}
            {generating && (
              <Card className="mt-4 bg-blue-50 border-blue-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                    <h3 className="text-lg font-medium text-blue-800 mb-2">
                      Generating Your Quiz
                    </h3>
                    <p className="text-sm text-blue-600">
                      Our AI is analyzing the material and creating meaningful
                      questions. This may take a minute or two.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-4">
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-1">
                        Tips for Better Quizzes
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                        <li>Choose fewer questions for quick reviews</li>
                        <li>Mix question types for comprehensive learning</li>
                        <li>
                          Start with medium difficulty and adjust as needed
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreationPage;
