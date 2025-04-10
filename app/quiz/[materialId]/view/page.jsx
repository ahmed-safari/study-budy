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
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Brain,
  Lightbulb,
  Award
} from "lucide-react";

const QuizPage = () => {
  const params = useParams();
  const router = useRouter();
  const materialId = params.materialId;
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(10 * 60); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(true);

  // Hardcoded quiz data
  const quizData = {
    title: "Introduction to Machine Learning",
    description: "Test your knowledge of basic machine learning concepts",
    timeLimit: 10, // minutes
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        text: "Which of the following is NOT a type of machine learning?",
        options: [
          { id: "a", text: "Supervised Learning" },
          { id: "b", text: "Unsupervised Learning" },
          { id: "c", text: "Reinforcement Learning" },
          { id: "d", text: "Predictive Learning" }
        ],
        correctAnswer: "d",
        explanation: "The three main types of machine learning are Supervised Learning, Unsupervised Learning, and Reinforcement Learning. 'Predictive Learning' is not a standard category in machine learning."
      },
      {
        id: "q2",
        type: "multi-select",
        text: "Which of the following algorithms are used for classification? (Select all that apply)",
        options: [
          { id: "a", text: "Linear Regression" },
          { id: "b", text: "Logistic Regression" },
          { id: "c", text: "K-Means" },
          { id: "d", text: "Random Forest" }
        ],
        correctAnswer: ["b", "d"],
        explanation: "Logistic Regression and Random Forest are classification algorithms. Linear Regression is used for regression problems, and K-Means is used for clustering."
      },
      {
        id: "q3",
        type: "multiple-choice",
        text: "What is overfitting in machine learning?",
        options: [
          { id: "a", text: "When a model performs well on training data but poorly on unseen data" },
          { id: "b", text: "When a model is too simple to capture the underlying pattern" },
          { id: "c", text: "When a dataset has too many features" },
          { id: "d", text: "When training takes too much time" }
        ],
        correctAnswer: "a",
        explanation: "Overfitting occurs when a model learns the training data too well, including its noise and outliers, causing poor performance on unseen data."
      }
    ]
  };
  
  // Effect to handle the timer
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timer > 0 && !quizComplete) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !quizComplete) {
      setQuizComplete(true);
      setShowResults(true);
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [timer, timerActive, quizComplete]);

  // Function to format the timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleOptionClick = (questionId, optionId) => {
    if (quizComplete) return;
    
    if (currentQuestion.type === "multiple-choice") {
      setSelectedOptions({
        ...selectedOptions,
        [questionId]: optionId
      });
    } else if (currentQuestion.type === "multi-select") {
      const currentSelections = selectedOptions[questionId] || [];
      
      // Toggle selection
      if (currentSelections.includes(optionId)) {
        setSelectedOptions({
          ...selectedOptions,
          [questionId]: currentSelections.filter(id => id !== optionId)
        });
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [questionId]: [...currentSelections, optionId]
        });
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizComplete(true);
    setTimerActive(false);
    setShowResults(true);

    // Calculate results
    const tempAnswers = {};
    quizData.questions.forEach((question) => {
      const userAnswer = selectedOptions[question.id];
      
      if (question.type === "multiple-choice") {
        tempAnswers[question.id] = {
          isCorrect: userAnswer === question.correctAnswer,
          userAnswer,
          correctAnswer: question.correctAnswer
        };
      } else if (question.type === "multi-select") {
        const selectedOptions = userAnswer || [];
        const correctOptions = question.correctAnswer;
        
        // Check if arrays contain the same elements
        const isCorrect = 
          correctOptions.length === selectedOptions.length && 
          correctOptions.every(option => selectedOptions.includes(option));
          
        tempAnswers[question.id] = {
          isCorrect,
          userAnswer: selectedOptions,
          correctAnswer: question.correctAnswer
        };
      }
    });

    setAnswers(tempAnswers);
  };

  const calculateScore = () => {
    const totalQuestions = quizData.questions.length;
    const correctAnswers = Object.values(answers).filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const isQuestionAnswered = (questionId) => {
    return selectedOptions[questionId] !== undefined && 
           (typeof selectedOptions[questionId] === 'string' || 
            (Array.isArray(selectedOptions[questionId]) && 
             selectedOptions[questionId].length > 0));
  };

  const allQuestionsAnswered = () => {
    return quizData.questions.every(question => isQuestionAnswered(question.id));
  };

  // Animation classes
  const slideInClasses = "animate-in slide-in-from-right duration-300";
  
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
        
        {/* Quiz title and progress */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{quizData.title}</h1>
              <p className="text-gray-600">{quizData.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {!showResults && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${timer < 60 ? "bg-red-100" : "bg-blue-50"}`}>
                  <Clock className={`h-5 w-5 ${timer < 60 ? "text-red-500" : "text-blue-500"}`} />
                  <span className={`font-medium ${timer < 60 ? "text-red-500" : "text-blue-500"}`}>
                    {formatTime(timer)}
                  </span>
                </div>
              )}
              
              <Badge className="bg-purple-100 text-purple-800 text-sm">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </Badge>
            </div>
          </div>
          
          <Progress 
            value={((currentQuestionIndex + 1) / quizData.questions.length) * 100} 
            className="h-2 bg-gray-200"
            indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-600"
          />
        </div>
        
        {/* Results view */}
        {showResults ? (
          <div className={`${slideInClasses} space-y-8`}>
            <Card className="bg-white shadow-md overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-4">
                    <span className="text-3xl font-bold text-white">{calculateScore()}%</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
                  <p className="text-gray-600">
                    You answered {Object.values(answers).filter(answer => answer.isCorrect).length} out of {quizData.questions.length} questions correctly.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {quizData.questions.map((question, index) => (
                    <div 
                      key={question.id} 
                      className={`p-4 rounded-lg ${answers[question.id]?.isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {answers[question.id]?.isCorrect ? (
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white">
                              <Check className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white">
                              <X className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium text-gray-800">
                            {index + 1}. {question.text}
                          </h3>
                          
                          {/* Multiple choice answer display */}
                          {question.type === "multiple-choice" && (
                            <div className="grid grid-cols-1 gap-2">
                              {question.options.map(option => {
                                const isSelectedOption = selectedOptions[question.id] === option.id;
                                const isCorrectOption = question.correctAnswer === option.id;
                                
                                let optionClass = "border border-gray-200 bg-white";
                                if (isSelectedOption && isCorrectOption) {
                                  optionClass = "border-green-500 bg-green-50";
                                } else if (isSelectedOption && !isCorrectOption) {
                                  optionClass = "border-red-500 bg-red-50";
                                } else if (!isSelectedOption && isCorrectOption) {
                                  optionClass = "border-green-500 border-dashed bg-white";
                                }
                                
                                return (
                                  <div 
                                    key={option.id} 
                                    className={`flex items-center p-3 rounded-md ${optionClass}`}
                                  >
                                    <div className="mr-3 flex-shrink-0">
                                      {isSelectedOption && isCorrectOption && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                      )}
                                      {isSelectedOption && !isCorrectOption && (
                                        <X className="h-5 w-5 text-red-500" />
                                      )}
                                      {!isSelectedOption && isCorrectOption && (
                                        <div className="h-5 w-5 border-2 border-green-500 rounded-full flex items-center justify-center">
                                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                        </div>
                                      )}
                                      {!isSelectedOption && !isCorrectOption && (
                                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                                      )}
                                    </div>
                                    <span className="text-gray-800">{option.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Multi-select answer display */}
                          {question.type === "multi-select" && (
                            <div className="grid grid-cols-1 gap-2">
                              {question.options.map(option => {
                                const isSelectedOption = selectedOptions[question.id]?.includes(option.id) || false;
                                const isCorrectOption = question.correctAnswer.includes(option.id);
                                
                                let optionClass = "border border-gray-200 bg-white";
                                if (isSelectedOption && isCorrectOption) {
                                  optionClass = "border-green-500 bg-green-50";
                                } else if (isSelectedOption && !isCorrectOption) {
                                  optionClass = "border-red-500 bg-red-50";
                                } else if (!isSelectedOption && isCorrectOption) {
                                  optionClass = "border-green-500 border-dashed bg-white";
                                }
                                
                                return (
                                  <div 
                                    key={option.id} 
                                    className={`flex items-center p-3 rounded-md ${optionClass}`}
                                  >
                                    <div className="mr-3 flex-shrink-0">
                                      {isSelectedOption && isCorrectOption && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                      )}
                                      {isSelectedOption && !isCorrectOption && (
                                        <X className="h-5 w-5 text-red-500" />
                                      )}
                                      {!isSelectedOption && isCorrectOption && (
                                        <div className="h-5 w-5 border-2 border-green-500 rounded-md flex items-center justify-center">
                                          <Check className="h-3 w-3 text-green-500" />
                                        </div>
                                      )}
                                      {!isSelectedOption && !isCorrectOption && (
                                        <div className="h-5 w-5 border-2 border-gray-300 rounded-md"></div>
                                      )}
                                    </div>
                                    <span className="text-gray-800">{option.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Explanation */}
                          <div className="mt-4 bg-blue-50 p-3 rounded-md flex">
                            <Lightbulb className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="px-8 pb-8 flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOptions({});
                    setCurrentQuestionIndex(0);
                    setQuizComplete(false);
                    setShowResults(false);
                    setTimer(quizData.timeLimit * 60);
                    setTimerActive(true);
                  }}
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push(`/materials/${materialId}`)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  Back to Material
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          /* Question view */
          <div className={`${slideInClasses}`}>
            <Card className="bg-white shadow-md overflow-hidden">
              <CardContent className="p-8">
                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge 
                      className={
                        currentQuestion.type === "multi-select" 
                          ? "bg-indigo-100 text-indigo-800" 
                          : "bg-purple-100 text-purple-800"
                      }
                    >
                      {currentQuestion.type === "multi-select" ? "Select Multiple" : "Single Choice"}
                    </Badge>
                    
                    {currentQuestion.type === "multi-select" && (
                      <p className="text-sm text-gray-600 italic">Select all that apply</p>
                    )}
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
                    {currentQuestionIndex + 1}. {currentQuestion.text}
                  </h2>
                  
                  <div className="space-y-3">
                    {/* Multiple Choice Options */}
                    {currentQuestion.type === "multiple-choice" && 
                      currentQuestion.options.map(option => (
                        <div 
                          key={option.id}
                          onClick={() => handleOptionClick(currentQuestion.id, option.id)}
                          className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer 
                            ${selectedOptions[currentQuestion.id] === option.id 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'}`
                          }
                        >
                          <div className="flex-shrink-0 mr-4">
                            <div 
                              className={`h-6 w-6 rounded-full border-2 flex items-center justify-center
                                ${selectedOptions[currentQuestion.id] === option.id 
                                  ? 'border-purple-500' 
                                  : 'border-gray-300'}`
                              }
                            >
                              {selectedOptions[currentQuestion.id] === option.id && (
                                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-800">{option.text}</span>
                        </div>
                      ))
                    }
                    
                    {/* Multi-Select Options */}
                    {currentQuestion.type === "multi-select" && 
                      currentQuestion.options.map(option => {
                        const isSelected = (selectedOptions[currentQuestion.id] || []).includes(option.id);
                        
                        return (
                          <div 
                            key={option.id}
                            onClick={() => handleOptionClick(currentQuestion.id, option.id)}
                            className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer 
                              ${isSelected 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50'}`
                            }
                          >
                            <div className="flex-shrink-0 mr-4">
                              <div 
                                className={`h-6 w-6 rounded-md border-2 flex items-center justify-center
                                  ${isSelected 
                                    ? 'border-indigo-500 bg-indigo-500' 
                                    : 'border-gray-300'}`
                                }
                              >
                                {isSelected && (
                                  <Check className="h-4 w-4 text-white" />
                                )}
                              </div>
                            </div>
                            <span className="text-gray-800">{option.text}</span>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
                
                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    {quizData.questions.map((_, index) => (
                      <div 
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          index === currentQuestionIndex 
                            ? 'bg-purple-500' 
                            : isQuestionAnswered(quizData.questions[index].id)
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {currentQuestionIndex < quizData.questions.length - 1 ? (
                    <Button
                      onClick={handleNextQuestion}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitQuiz}
                      className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition-all ${
                        !allQuestionsAnswered() ? 'opacity-80' : ''
                      }`}
                    >
                      Submit Quiz
                      <Check className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Question counter */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm border">
                {quizData.questions.map((question, index) => (
                  <div 
                    key={index} 
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`
                      w-8 h-8 flex items-center justify-center rounded-full cursor-pointer mx-1
                      ${currentQuestionIndex === index 
                        ? 'bg-purple-600 text-white' 
                        : isQuestionAnswered(question.id)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} StudyBuddy Quiz</p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;