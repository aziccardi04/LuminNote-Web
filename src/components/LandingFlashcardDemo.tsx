'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Hardcoded demo flashcard set - matches app structure
const DEMO_SET = {
  title: 'Website Cards',
  flashcards: [
    {
      id: '1',
      question: 'What is the function of mitochondria in eukaryotic cells?',
      answer: 'Mitochondria are the site of aerobic respiration, producing ATP to supply energy for cellular processes.',
      difficulty: 'easy' as const,
    },
    {
      id: '2',
      question: 'What is the role of the hippocampus in memory?',
      answer: 'The hippocampus is involved in the formation, consolidation, and retrieval of long-term memories, particularly episodic and spatial memories.',
      difficulty: 'easy' as const,
    },
    {
      id: '3',
      question: 'What was one key cause of the First World War?',
      answer: 'One key cause of the First World War was the system of military alliances, which escalated a regional conflict into a global war.',
      difficulty: 'medium' as const,
    },
    {
      id: '4',
      question: 'What is the role of negotiated encryption in GSM?',
      answer: 'To protect voice/data confidentiality over the air interface.',
      difficulty: 'medium' as const,
    },
  ],
};

interface LandingFlashcardDemoProps {
  onCtaClick?: () => void;
}

interface StudySession {
  currentIndex: number;
  showAnswer: boolean;
  correctCount: number;
  totalAnswered: number;
}

export default function LandingFlashcardDemo({ onCtaClick }: LandingFlashcardDemoProps) {
  const [studySession, setStudySession] = useState<StudySession>({
    currentIndex: 0,
    showAnswer: false,
    correctCount: 0,
    totalAnswered: 0,
  });
  const [isComplete, setIsComplete] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSet = DEMO_SET;

  const currentCard = currentSet.flashcards[studySession.currentIndex];
  const progress = ((studySession.currentIndex + 1) / currentSet.flashcards.length) * 100;
  const accuracy = studySession.totalAnswered > 0 
    ? Math.round((studySession.correctCount / studySession.totalAnswered) * 100) 
    : 0;

  const handlePreviousCard = useCallback(() => {
    if (studySession.currentIndex === 0) return;
    
    setStudySession(prev => ({
      ...prev,
      currentIndex: prev.currentIndex - 1,
      showAnswer: false,
    }));
  }, [studySession.currentIndex]);

  const handleShowAnswer = useCallback(() => {
    setStudySession(prev => ({ ...prev, showAnswer: true }));
  }, []);

  const handleAnswer = useCallback((correct: boolean) => {
    const newSession = {
      ...studySession,
      correctCount: correct ? studySession.correctCount + 1 : studySession.correctCount,
      totalAnswered: studySession.totalAnswered + 1,
      showAnswer: false,
      currentIndex: studySession.currentIndex + 1,
    };

    if (newSession.currentIndex >= currentSet.flashcards.length) {
      setStudySession(prev => ({
        ...prev,
        correctCount: correct ? prev.correctCount + 1 : prev.correctCount,
        totalAnswered: prev.totalAnswered + 1,
      }));
      setIsComplete(true);
    } else {
      setStudySession(newSession);
    }
  }, [studySession, currentSet.flashcards.length]);

  const handleRestart = useCallback(() => {
    setStudySession({
      currentIndex: 0,
      showAnswer: false,
      correctCount: 0,
      totalAnswered: 0,
    });
    setIsComplete(false);
  }, []);

  const handleCtaClick = useCallback(() => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      window.location.href = 'https://app.luminnote.com';
    }
  }, [onCtaClick]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;
      
      if ((e.key === ' ' || e.key === 'Enter') && !studySession.showAnswer) {
        e.preventDefault();
        handleShowAnswer();
      } else if (e.key === 'ArrowRight' && studySession.showAnswer) {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === 'ArrowLeft' && studySession.showAnswer) {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.key === 'Backspace' && studySession.currentIndex > 0) {
        e.preventDefault();
        handlePreviousCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studySession.showAnswer, studySession.currentIndex, isComplete, handleShowAnswer, handleAnswer, handlePreviousCard]);

  // Keyboard navigation without auto-focusing (which causes scroll)
  // The tabIndex on the container allows keyboard events when user interacts

  // Completion state
  if (isComplete) {
    const finalAccuracy = studySession.totalAnswered > 0 
      ? Math.round((studySession.correctCount / studySession.totalAnswered) * 100) 
      : 0;

    return (
      <div 
        ref={containerRef}
        tabIndex={0}
        className="w-full h-full min-h-[400px] flex flex-col outline-none bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden"
      >
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Study Session Complete!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Great job reviewing these concepts</p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{studySession.correctCount}/{studySession.totalAnswered}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{finalAccuracy}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
            </div>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={handleCtaClick}
            className="group w-full max-w-xs flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="text-sm">Generate flashcards from your lectures</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          
          {/* Restart Link */}
          <button
            onClick={handleRestart}
            className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      className="w-full h-full min-h-[400px] flex flex-col outline-none bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden"
    >
      {/* Enhanced Progress Header - Exact match to FlashcardView.tsx */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviousCard}
              disabled={studySession.currentIndex === 0}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous card"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{currentSet.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Card {studySession.currentIndex + 1} of {currentSet.flashcards.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
              <div className="text-sm font-bold text-green-600 dark:text-green-400">{accuracy}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
              <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                {studySession.correctCount}/{studySession.totalAnswered}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 via-gray-500 to-gray-600 h-2 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Area */}
      <div className="flex-1 p-4 relative">
        {/* Difficulty Badge */}
        <div className="absolute top-6 right-6 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
            currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {currentCard.difficulty}
          </span>
        </div>

        {/* Card Container - Fixed height to prevent layout shift */}
        <div className="h-[200px] sm:h-[220px]">
          {/* Question Card */}
          {!studySession.showAnswer && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-4 sm:p-6 h-full flex flex-col justify-center border border-gray-200 dark:border-gray-600 shadow-lg overflow-hidden">
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 mb-3">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></span>
                  Question
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-relaxed mb-3 line-clamp-3">
                  {currentCard.question}
                </h3>
                <div className="inline-flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span className="animate-bounce mr-2">👆</span>
                  Click &quot;Show Answer&quot; to reveal
                </div>
              </div>
            </div>
          )}

          {/* Answer Card */}
          {studySession.showAnswer && (
            <div className="bg-gradient-to-br from-green-50 to-gray-50 dark:from-green-900/20 dark:to-gray-800 rounded-2xl p-4 sm:p-6 h-full flex flex-col justify-center border border-green-200 dark:border-green-700 shadow-lg overflow-hidden">
              <div className="text-center overflow-y-auto">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 mb-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Answer
                </div>
                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium mb-3 line-clamp-4">
                  {currentCard.answer}
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  Difficulty: {currentCard.difficulty}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-center items-center gap-3">
          {/* Back Button */}
          <button
            onClick={handlePreviousCard}
            disabled={studySession.currentIndex === 0}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg disabled:hover:shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          {!studySession.showAnswer ? (
            <button
              onClick={handleShowAnswer}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Show Answer
              <div className="w-4 h-4 border-2 border-white rounded border-dashed animate-spin"></div>
            </button>
          ) : (
            <>
              <button
                onClick={() => handleAnswer(false)}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Incorrect
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Correct
              </button>
            </>
          )}
        </div>
        
        {/* Card Navigation Dots */}
        <div className="flex justify-center gap-1 mt-4">
          {currentSet.flashcards.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === studySession.currentIndex
                  ? 'bg-blue-500 w-6'
                  : index < studySession.currentIndex
                  ? 'bg-green-400 w-2'
                  : 'bg-gray-300 dark:bg-gray-600 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
