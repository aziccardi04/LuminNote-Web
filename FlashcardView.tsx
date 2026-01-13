import React, { useState, useEffect } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { useAIBrain } from '../contexts/AIBrainContext';
import { useStripe } from '../contexts/StripeContext';
import { FlashcardSet, Flashcard, FlashcardGenerationRequest, Note } from '../types';
import { FlashcardDatabase } from '../lib/flashcardDatabase';
import {
  ArrowLeftIcon,
  SparklesIcon,
  PlayIcon,
  PlusIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  LightBulbIcon,
  FireIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import './FlashcardView.css';
import AlertDialog from './AlertDialog';
import UpgradePrompt from './UpgradePrompt';
import { QUOTA_EXHAUSTED_MESSAGE } from '../lib/upgradeCopy';

interface FlashcardViewProps {
  moduleId: string;
  moduleName: string;
  moduleColor: string;
  onBack: () => void;
  onHome?: () => void;
}

interface StudySession {
  currentIndex: number;
  showAnswer: boolean;
  correctCount: number;
  totalAnswered: number;
  startTime: Date;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({
  moduleId,
  moduleName,
  moduleColor,
  onBack,
  onHome
}) => {
  const { getNotesInFolder } = useNotes();
  const { generateFlashcards, isGeneratingFlashcards } = useAIBrain();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [view, setView] = useState<'overview' | 'generate' | 'study'>('overview');
  const [completionDialog, setCompletionDialog] = useState<{ isOpen: boolean; message: string; variant: 'success' | 'error' }>({ isOpen: false, message: '', variant: 'success' });
  const [upgradePrompt, setUpgradePrompt] = useState<{
    isOpen: boolean;
    featureName: string;
    featureDescription: string;
  }>({ isOpen: false, featureName: '', featureDescription: '' });
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [generationSettings, setGenerationSettings] = useState({
    title: '',
    cardCount: 10,
    difficulty: 'mixed' as 'mixed' | 'easy' | 'medium' | 'hard'
  });

  const moduleNotes = getNotesInFolder ? getNotesInFolder(moduleId) : [];

  // Load flashcards from database
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        console.log('🔄 Loading flashcards for module:', moduleId);
        const sets = await FlashcardDatabase.loadFlashcardsByModule(moduleId);
        setFlashcardSets(sets);
        console.log('✅ Loaded flashcard sets:', sets);
      } catch (error) {
        console.error('❌ Failed to load flashcards:', error);
        // Set empty array on error to show no flashcards available
        setFlashcardSets([]);
      }
    };

    loadFlashcards();
  }, [moduleId]);

  const handleGenerateFlashcards = async () => {
    if (selectedNotes.length === 0 || !generationSettings.title.trim()) {
      return;
    }

    try {
      const request: FlashcardGenerationRequest = {
        note_ids: selectedNotes,
        module_id: moduleId,
        title: generationSettings.title,
        card_count: generationSettings.cardCount,
        difficulty_level: generationSettings.difficulty
      };
      
      const newSet = await generateFlashcards(request);
      
      // Reload flashcards from database to get the saved version
      const updatedSets = await FlashcardDatabase.loadFlashcardsByModule(moduleId);
      setFlashcardSets(updatedSets);
      
      setView('overview');
      setSelectedNotes([]);
      setGenerationSettings({ title: '', cardCount: 10, difficulty: 'mixed' });
    } catch (error: any) {
      console.error('Failed to generate flashcards:', error);
      
      // Handle quota exceeded error - show upgrade prompt
      if (error?.name === 'QuotaExceededError') {
        setUpgradePrompt({
          isOpen: true,
          featureName: 'Flashcard Generation',
          featureDescription: QUOTA_EXHAUSTED_MESSAGE,
        });
      } else {
        setCompletionDialog({ isOpen: true, message: 'Failed to generate flashcards. Please try again.', variant: 'error' });
      }
    }
  };
  
  // Helper function to display card count
  const displayCardCount = (count: number) => {
    return count === -1 ? 'Full Set' : `${count} cards`;
  };

  // Use the helper function when displaying card counts in the UI
  const getCardCountDisplay = (set: FlashcardSet) => {
    return set.flashcards.length > 20 ? `${set.total_cards} (Full Set)` : `${set.total_cards} cards`;
  };

  const startStudySession = (set: FlashcardSet) => {
    setCurrentSet(set);
    setStudySession({
      currentIndex: 0,
      showAnswer: false,
      correctCount: 0,
      totalAnswered: 0,
      startTime: new Date()
    });
    setView('study');
  };

  const handlePreviousCard = () => {
    if (!studySession || studySession.currentIndex === 0) return;
    
    setStudySession(prev => prev ? {
      ...prev,
      currentIndex: prev.currentIndex - 1,
      showAnswer: false
    } : null);
  };

  const handleAnswer = async (correct: boolean) => {
    if (!studySession || !currentSet) return;

    const currentCard = currentSet.flashcards[studySession.currentIndex];
    
    // Prepare updated set
    const updatedSet = {
      ...currentSet,
      flashcards: currentSet.flashcards.map((card, index) => 
        index === studySession.currentIndex 
          ? {
              ...card,
              review_count: card.review_count + 1,
              correct_count: card.correct_count + (correct ? 1 : 0)
            }
          : card
      ),
      studied_cards: Math.max(currentSet.studied_cards, studySession.currentIndex + 1)
    };
    
    try {
      // Update flashcard statistics in database
      await FlashcardDatabase.updateFlashcardReview(currentCard.id, correct);
    } catch (error) {
      console.error('❌ Failed to update flashcard review:', error);
      // Continue with local update even if database update fails
    }
    
    // Update local state regardless of database success/failure
    setCurrentSet(updatedSet);
    setFlashcardSets(prev => 
      prev.map(set => set.id === currentSet.id ? updatedSet : set)
    );

    const newSession = {
      ...studySession,
      correctCount: correct ? studySession.correctCount + 1 : studySession.correctCount,
      totalAnswered: studySession.totalAnswered + 1,
      showAnswer: false,
      currentIndex: studySession.currentIndex + 1
    };

    if (newSession.currentIndex >= currentSet.flashcards.length) {
      // Session complete - show completion modal
      const accuracy = Math.round(((newSession.correctCount) / newSession.totalAnswered) * 100);
      setTimeout(() => {
        const message = `Correct: ${newSession.correctCount}/${newSession.totalAnswered}\nAccuracy: ${accuracy}%`;
        setCompletionDialog({ isOpen: true, message, variant: 'success' });
      }, 500);
    } else {
      setStudySession(newSession);
    }
  };

  const renderOverview = () => (
    <div className="space-y-5">
      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sets', value: flashcardSets.length, icon: AcademicCapIcon },
          { label: 'Studied', value: flashcardSets.reduce((acc, set) => acc + set.studied_cards, 0), icon: CheckCircleIcon },
          { label: 'Cards', value: flashcardSets.reduce((acc, set) => acc + set.total_cards, 0), icon: FireIcon },
        ].map((stat) => (
          <div key={stat.label} className="card-base card-light dark:card-dark p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption mb-0.5">{stat.label}</p>
                <p className="text-h2 text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={() => setView('generate')}
        className="btn-primary"
      >
        <SparklesIcon className="w-4 h-4" />
        Generate New Set
      </button>

      {/* Flashcard Sets */}
      <div>
        <h3 className="text-h3 text-gray-900 dark:text-white mb-3">Your Flashcard Sets</h3>
        
        {flashcardSets.length === 0 ? (
          <div className="card-base card-light dark:card-dark text-center py-10">
            <AcademicCapIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h4 className="text-h3 text-gray-900 dark:text-white mb-1">No flashcard sets yet</h4>
            <p className="text-caption mb-4">Generate your first set from your notes</p>
            <button onClick={() => setView('generate')} className="btn-secondary">
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flashcardSets.map((set) => (
              <div key={set.id} className="card-base card-light dark:card-dark">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-h3 text-gray-900 dark:text-white mb-1">{set.title}</h4>
                    {set.description && (
                      <p className="text-caption line-clamp-1">{set.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-h2 text-gray-400">{set.total_cards}</div>
                    <div className="text-[10px] text-gray-400">cards</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-caption">
                    <span>{set.studied_cards}/{set.total_cards}</span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${(set.studied_cards / set.total_cards) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startStudySession(set)}
                    className="btn-secondary h-8 text-xs"
                  >
                    <PlayIcon className="w-3.5 h-3.5" />
                    Study
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderGenerate = () => (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="text-center">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-h2 text-gray-900 dark:text-white mb-0.5">Generate Flashcards</h3>
        <p className="text-caption">Create study cards from your notes using AI</p>
      </div>

      <div className="card-base card-light dark:card-dark space-y-4">
        {/* Title Input */}
        <div>
          <label className="text-label mb-1.5 block">Set Title</label>
          <input
            type="text"
            value={generationSettings.title}
            onChange={(e) => setGenerationSettings(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Threat Modeling Basics"
            className="input-base w-full"
          />
        </div>

        {/* Note Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Notes ({selectedNotes.length} selected)
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {moduleNotes.map((note) => (
              <label key={note.id} className="flex items-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedNotes.includes(note.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedNotes(prev => [...prev, note.id]);
                    } else {
                      setSelectedNotes(prev => prev.filter(id => id !== note.id));
                    }
                  }}
                  className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {note.title || 'Untitled Note'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {note.type === 'lecture' ? 'Lecture' : 'Manual'} • {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Cards
            </label>
            <select
              value={generationSettings.cardCount}
              onChange={(e) => setGenerationSettings(prev => ({ ...prev, cardCount: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value={5}>5 cards</option>
              <option value={10}>10 cards</option>
              <option value={15}>15 cards</option>
              <option value={20}>20 cards</option>
              <option value={-1}>Full Set</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty Level
            </label>
            <select
              value={generationSettings.difficulty}
              onChange={(e) => setGenerationSettings(prev => ({ ...prev, difficulty: e.target.value as any }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="mixed">Mixed</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => setView('overview')}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateFlashcards}
            disabled={selectedNotes.length === 0 || !generationSettings.title.trim() || isGeneratingFlashcards}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isGeneratingFlashcards ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Generate Cards
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upgrade Prompt */}
    </div>
  );

  const renderStudy = () => {
    if (!currentSet || !studySession) return null;

    const currentCard = currentSet.flashcards[studySession.currentIndex];
    const progress = ((studySession.currentIndex + 1) / currentSet.flashcards.length) * 100;
    const accuracy = studySession.totalAnswered > 0 ? Math.round((studySession.correctCount / studySession.totalAnswered) * 100) : 0;

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Enhanced Progress Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setView('overview');
                  setStudySession(null);
                  setCurrentSet(null);
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
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

        {/* Enhanced Flashcard with Flip Animation */}
        <div className="perspective-1000">
          <div 
            className={`relative w-full transition-transform duration-700 transform-style-preserve-3d ${
              studySession.showAnswer ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front of card (Question) */}
            <div className="absolute inset-0 w-full backface-hidden">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-3xl p-8 min-h-[400px] flex flex-col justify-center border-2 border-gray-100 dark:border-gray-800 shadow-2xl">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300 mb-8">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></span>
                    Question
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-relaxed mb-8">
                    {currentCard.question}
                  </h3>
                  <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="animate-bounce mr-2">👆</span>
                    Click "Show Answer" to reveal
                  </div>
                </div>
              </div>
            </div>
            
            {/* Back of card (Answer) */}
            <div className="absolute inset-0 w-full backface-hidden rotate-y-180">
              <div className="bg-gradient-to-br from-green-50 to-gray-50 dark:from-green-900/20 dark:to-gray-900/20 rounded-3xl p-8 min-h-[400px] flex flex-col justify-center border-2 border-green-100 dark:border-green-800 shadow-2xl">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 mb-8">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Answer
                  </div>
                  <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium mb-8">
                    {currentCard.answer}
                  </p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    Difficulty: {currentCard.difficulty}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Difficulty Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {currentCard.difficulty}
            </span>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex justify-center items-center space-x-4">
          {/* Back Button */}
          <button
            onClick={handlePreviousCard}
            disabled={studySession.currentIndex === 0}
            className="group primary-gradient primary-gradient-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none"
          >
            <div className="flex items-center space-x-2">
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back</span>
            </div>
          </button>
          
          {!studySession.showAnswer ? (
            <button
              onClick={() => setStudySession(prev => prev ? { ...prev, showAnswer: true } : null)}
              className="group primary-gradient primary-gradient-hover text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-2">
                <span>Show Answer</span>
                <div className="w-5 h-5 border-2 border-white rounded border-dashed animate-spin group-hover:animate-pulse"></div>
              </div>
            </button>
          ) : (
            <>
              <button
                onClick={() => handleAnswer(false)}
                className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <XCircleIcon className="w-5 h-5" />
                  <span>Incorrect</span>
                </div>
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Correct</span>
                </div>
              </button>
            </>
          )}
        </div>
        
        {/* Card Navigation Dots */}
        <div className="flex justify-center space-x-1">
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
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <AlertDialog
          isOpen={completionDialog.isOpen}
          title={completionDialog.variant === 'success' ? 'Study Session Complete!' : 'Error'}
          message={completionDialog.message}
          variant={completionDialog.variant}
          onClose={() => {
            setCompletionDialog({ isOpen: false, message: '', variant: 'success' });
            if (completionDialog.variant === 'success') {
              setView('overview');
              setStudySession(null);
              setCurrentSet(null);
            }
          }}
        />
      
      {/* Pro upgrade dialog for quota exceeded */}
      <UpgradePrompt
        isOpen={upgradePrompt.isOpen}
        onClose={() => setUpgradePrompt({ isOpen: false, featureName: '', featureDescription: '' })}
        featureName={upgradePrompt.featureName}
        featureDescription={upgradePrompt.featureDescription}
      />
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background with gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-gray-600 dark:via-gray-700 dark:to-gray-800"
        />
        <div className="absolute inset-0 bg-black/5 dark:bg-black/10" />
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 dark:bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-1/2 -left-8 w-32 h-32 bg-white/5 dark:bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-1/3 w-20 h-20 bg-white/10 dark:bg-white/10 rounded-full blur-lg animate-pulse delay-1000" />
        </div>
        
        {/* Content */}
        <div className="relative px-4 py-4 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                aria-label="Back to home"
                className="group p-2 hover:bg-white/20 dark:hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 dark:bg-white/20 rounded-xl blur-sm" />
                  <div className="relative p-2 bg-white/10 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/20">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Flashcards
                  </h1>
                  <p className="text-sm text-white/80 font-medium">{moduleName}</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                {onHome && (
                  <button
                    onClick={onHome}
                    className="group p-2 hover:bg-white/20 dark:hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span className="sr-only">Home</span>
                  </button>
                )}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <SparklesIcon className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-medium">AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {view === 'overview' && renderOverview()}
          {view === 'generate' && renderGenerate()}
          {view === 'study' && renderStudy()}
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;