"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Clock,
  CheckCircle,
  HelpCircle,
  Loader,
  Clipboard,
  FileText,
  RefreshCw,
  Shuffle,
  RotateCw,
  Eye,
} from "lucide-react";

const FlashcardsPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = params.materialId;
  const deckId = searchParams.get("deckId");

  // Flashcard state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deck, setDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [originalOrder, setOriginalOrder] = useState([]);
  const [mastered, setMastered] = useState(new Set());

  // Fetch flashcard deck data
  useEffect(() => {
    const fetchDeckData = async () => {
      if (!deckId) {
        setError("No deck ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/flashcards/${deckId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch flashcards: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.deck) {
          setDeck(data.deck);
          // Store the original order of flashcards
          setOriginalOrder(data.deck.flashcards.map((card) => ({ ...card })));
        } else {
          throw new Error(data.error || "Failed to fetch flashcard data");
        }
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeckData();
  }, [deckId]);

  const handleNextCard = () => {
    if (deck && currentCardIndex < deck.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    if (!deck) return;

    if (shuffled) {
      // Restore original order
      setDeck({
        ...deck,
        flashcards: [...originalOrder],
      });
      setShuffled(false);
    } else {
      // Shuffle cards
      const shuffledCards = [...deck.flashcards].sort(
        () => Math.random() - 0.5
      );
      setDeck({
        ...deck,
        flashcards: shuffledCards,
      });
      setShuffled(true);
    }
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const toggleMastered = (id) => {
    const newMastered = new Set(mastered);
    if (newMastered.has(id)) {
      newMastered.delete(id);
    } else {
      newMastered.add(id);
    }
    setMastered(newMastered);
  };

  const getCardColor = (index) => {
    const colorOptions = [
      "from-blue-500 to-cyan-600",
      "from-purple-500 to-indigo-600",
      "from-amber-500 to-orange-600",
      "from-emerald-500 to-green-600",
      "from-pink-500 to-rose-600",
    ];
    return colorOptions[index % colorOptions.length];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <Loader className="h-12 w-12 text-amber-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-800">
            Loading flashcards...
          </h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <HelpCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Error Loading Flashcards
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => router.push(`/materials/${materialId}`)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Material
          </Button>
        </div>
      </div>
    );
  }

  // If no deck found
  if (!deck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <HelpCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Flashcard Deck Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The flashcard deck you're looking for could not be found.
          </p>
          <Button
            onClick={() => router.push(`/materials/${materialId}`)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Material
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = deck.flashcards[currentCardIndex];
  const cardColor = getCardColor(currentCardIndex);
  const slideInClasses = "animate-in slide-in-from-right duration-300";
  const masteredCount = mastered.size;
  const progressPercentage = (masteredCount / deck.flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/flashcards/${materialId}/list`)}
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Flashcard Decks
        </Button>

        {/* Deck title and progress */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {deck.title}
              </h1>
              <p className="text-gray-600">{deck.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-amber-100 text-amber-800 text-sm">
                Card {currentCardIndex + 1} of {deck.flashcards.length}
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-800 text-sm">
                {masteredCount} of {deck.flashcards.length} mastered
              </Badge>
            </div>
          </div>

          <Progress
            value={((currentCardIndex + 1) / deck.flashcards.length) * 100}
            className="h-2 bg-gray-200"
            indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>
              {Math.round(
                ((currentCardIndex + 1) / deck.flashcards.length) * 100
              )}
              %
            </span>
          </div>
        </div>

        {/* Flashcard */}
        <div className={`${slideInClasses} mb-6`}>
          <div
            className="relative min-h-[400px] w-full cursor-pointer"
            onClick={handleCardFlip}
            style={{ perspective: "1000px" }}
          >
            {/* Card wrapper with 3D effect */}
            <div
              className="absolute w-full h-full transition-all duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front of card */}
              <div
                className={`absolute inset-0 w-full h-full rounded-2xl p-8 shadow-lg 
                  bg-gradient-to-br ${cardColor} text-white`}
                style={{
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center">
                    <Badge className="bg-white/30 text-white">FRONT</Badge>
                    <Badge className="bg-white/20 text-white text-xs">
                      Card {currentCardIndex + 1}
                    </Badge>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center">
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {currentCard.front}
                    </h2>
                  </div>

                  <div className="flex justify-center">
                    <p className="text-white/70 text-sm">Tap card to flip</p>
                  </div>
                </div>
              </div>

              {/* Back of card */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl p-8 shadow-lg bg-white border-2 border-t-8"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  borderColor:
                    currentCard && cardColor
                      ? `rgb(var(--color-${cardColor.split("-")[1]}) / 1)`
                      : "rgb(251 146 60)",
                }}
              >
                <div className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center">
                    <Badge className="bg-gray-100 text-gray-800">BACK</Badge>
                    <Badge className="bg-gray-100 text-gray-800 text-xs">
                      Card {currentCardIndex + 1}
                    </Badge>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center">
                    <div className="text-xl text-gray-800 leading-relaxed">
                      {currentCard.back}
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-2">
                    <p className="text-gray-500 text-xs">
                      Tap card to flip back
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card mastery toggle */}
        <div className="flex justify-center mb-6">
          <Button
            variant={mastered.has(currentCard.id) ? "default" : "outline"}
            className={`${
              mastered.has(currentCard.id)
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleMastered(currentCard.id);
            }}
          >
            {mastered.has(currentCard.id) ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mastered
              </>
            ) : (
              "Mark as Mastered"
            )}
          </Button>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousCard}
            disabled={currentCardIndex === 0}
            className={
              currentCardIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleShuffle}
              className="flex items-center gap-2 text-gray-700"
            >
              <Shuffle className="h-4 w-4" />
              {shuffled ? "Unshuffle" : "Shuffle"}
            </Button>

            <Button
              variant="outline"
              onClick={handleRestart}
              className="flex items-center gap-2 text-gray-700"
            >
              <RotateCw className="h-4 w-4" />
              Restart
            </Button>
          </div>

          {currentCardIndex >= deck.flashcards.length - 1 ? (
            <Button
              onClick={() => router.push(`/flashcards/${materialId}/list`)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Finish
            </Button>
          ) : (
            <Button
              onClick={handleNextCard}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Card navigation dots */}
        <div className="flex justify-center mt-6">
          <div className="bg-white rounded-full p-2 shadow-sm border overflow-x-auto max-w-full">
            <div className="flex gap-1">
              {deck.flashcards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentCardIndex(index);
                    setIsFlipped(false);
                  }}
                  className={`
                    w-3 h-3 rounded-full cursor-pointer 
                    ${
                      currentCardIndex === index
                        ? "bg-amber-600"
                        : mastered.has(card.id)
                        ? "bg-emerald-500"
                        : "bg-gray-300 hover:bg-amber-300"
                    }
                    transition-all hover:scale-125
                  `}
                  title={`Card ${index + 1}${
                    mastered.has(card.id) ? " (Mastered)" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mastery progress bar */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Mastery Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2 bg-gray-200"
            indicatorClassName="bg-gradient-to-r from-emerald-500 to-green-600"
          />
        </div>
      </div>
    </div>
  );
};

export default FlashcardsPage;
