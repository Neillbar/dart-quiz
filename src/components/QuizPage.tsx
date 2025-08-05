'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { DartCombination, QuizQuestion, KeyboardMode, GameState, Multiplier } from '@/types';
import { updateUserStats } from '@/services/statsService';
import { saveQuizSession, QuizAnswer } from '@/services/sessionsService';
import { getRandomQuizQuestions, QuizOption } from '@/services/quizService';

interface QuizPageProps {
  userId?: string;
}

const QuizPage: React.FC<QuizPageProps> = ({ userId }) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('loading');
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Quiz data
  const [questions, setQuestions] = useState<QuizOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSelectedNoOutshot, setUserSelectedNoOutshot] = useState(false);
  
  // Input state
  const [keyboardMode, setKeyboardMode] = useState<KeyboardMode>('numeric');
  const [currentInputs, setCurrentInputs] = useState<string[]>([]);
  const [currentInputIndex, setCurrentInputIndex] = useState(0);
  const [selectedMultiplier, setSelectedMultiplier] = useState<Multiplier>(1);
  
  // Answer state
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sessionAnswers, setSessionAnswers] = useState<QuizAnswer[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isNoOutshot = currentQuestion?.isNoOutshot || currentQuestion?.darts === 0;

  // Load quiz questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setGameState('loading');
        const quizQuestions = await getRandomQuizQuestions(10);
        console.log('Loaded questions:', quizQuestions);
        
        if (quizQuestions.length === 0) {
          setError('No quiz questions available. Please check the database.');
          setGameState('finished');
          return;
        }
        
        setQuestions(quizQuestions);
        // Only start countdown after questions are loaded
        setGameState('countdown');
        setCountdownValue(3);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Failed to load quiz questions');
        setGameState('finished');
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, []);

  // Initialize inputs based on dart count
  useEffect(() => {
    if (currentQuestion) {
      // For NO OUTSHOT questions, show 3 input boxes by default
      const dartCount = currentQuestion.darts === 0 ? 3 : currentQuestion.darts;
      setCurrentInputs(new Array(dartCount).fill(''));
      setCurrentInputIndex(0);
      setShowAnswer(false);
      setIsCorrect(null);
      setUserSelectedNoOutshot(false);
    }
  }, [currentQuestion]);

  // Countdown timer
  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdownValue > 0) {
        const timer = setTimeout(() => {
          setCountdownValue(countdownValue - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Start the game
        setGameState('playing');
        setStartTime(Date.now());
      }
    }
  }, [gameState, countdownValue]);

  // Elapsed time timer
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameState, startTime]);

  // Keyboard handlers
  const handleNumericInput = useCallback((value: string) => {
    if (currentInputIndex < currentInputs.length) {
      const newInputs = [...currentInputs];
      if (value === 'clear') {
        newInputs[currentInputIndex] = '';
      } else if (value === 'backspace') {
        newInputs[currentInputIndex] = newInputs[currentInputIndex].slice(0, -1);
      } else {
        newInputs[currentInputIndex] += value;
      }
      setCurrentInputs(newInputs);
    }
  }, [currentInputIndex, currentInputs]);

  const handleDartInput = useCallback((value: number) => {
    if (currentInputIndex < currentInputs.length) {
      const newInputs = [...currentInputs];
      const dartValue = selectedMultiplier * value;
      newInputs[currentInputIndex] = dartValue.toString();
      setCurrentInputs(newInputs);
    }
  }, [currentInputIndex, currentInputs, selectedMultiplier]);

  const checkAnswer = useCallback(() => {
    if (!currentQuestion) return;
    
    let correct = false;
    
    if (isNoOutshot) {
      // For NO OUTSHOT questions, user must select the NO OUTSHOT button
      correct = userSelectedNoOutshot;
      if (!userSelectedNoOutshot && currentInputs.some(input => input !== '')) {
        // User entered numbers instead of selecting NO OUTSHOT
        setIsCorrect(false);
        setShowAnswer(true);
      } else {
        setIsCorrect(correct);
        setShowAnswer(true);
      }
    } else {
      // Regular question - check if the individual values match exactly
      const userAnswer = currentInputs.map(input => parseInt(input) || 0);
      const correctValues = [...currentQuestion.values].sort((a, b) => b - a); // Sort descending
      const userValues = [...userAnswer].filter(val => val > 0).sort((a, b) => b - a); // Sort descending and remove zeros
      
      // Check if arrays have same length and all values match
      correct = userValues.length === correctValues.length &&
                userValues.every((val, index) => val === correctValues[index]) &&
                userValues.reduce((sum, val) => sum + val, 0) === parseInt(currentQuestion.name);
      
      setIsCorrect(correct);
      setShowAnswer(true);
    }
    
    if (correct) {
      setScore(score + 1);
    }
    
    // Save answer data
    const answerData: QuizAnswer = {
      questionNumber: currentQuestionIndex + 1,
      checkout: parseInt(currentQuestion.name) || 0,
      userInput: userSelectedNoOutshot ? ['NO OUTSHOT'] : currentInputs,
      correctAnswer: isNoOutshot ? ['NO OUTSHOT'] : currentQuestion.values.map(v => v.toString()),
      isCorrect: correct,
      dartsRequired: currentQuestion.darts || 3
    };
    
    setSessionAnswers([...sessionAnswers, answerData]);
    
    // Auto advance after 3 seconds
    setTimeout(async () => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setGameState('finished');
        // Save stats and session to Firebase if user is logged in
        if (userId) {
          try {
            // Update overall stats (add 1 to score if this answer was correct)
            const finalScore = correct ? score + 1 : score;
            await updateUserStats(userId, finalScore, totalQuestions);
            
            // Save detailed session
            const endTime = Date.now();
            const duration = Math.floor((endTime - startTime) / 1000);
            
            await saveQuizSession({
              userId,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              totalQuestions,
              correctAnswers: finalScore,
              score: `${finalScore}/${totalQuestions}`,
              duration,
              answers: [...sessionAnswers, answerData]
            });
          } catch (error) {
            console.error('Error saving session data:', error);
          }
        }
      }
    }, 3000);
  }, [currentInputs, currentQuestion, score, currentQuestionIndex, totalQuestions, userId, sessionAnswers, startTime, userSelectedNoOutshot, isNoOutshot]);

  const handleEnter = useCallback(() => {
    if (currentInputIndex < currentInputs.length - 1) {
      setCurrentInputIndex(currentInputIndex + 1);
    } else {
      // Submit answer
      checkAnswer();
    }
  }, [currentInputIndex, currentInputs.length, checkAnswer]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleNoOutshot = useCallback(() => {
    setUserSelectedNoOutshot(true);
    // Clear all inputs
    setCurrentInputs(currentInputs.map(() => ''));
    // Set whether it's correct based on if this actually is a NO OUTSHOT
    setIsCorrect(isNoOutshot);
    setShowAnswer(true);
    
    if (isNoOutshot) {
      setScore(score + 1);
    }
    
    // Save answer data
    const answerData: QuizAnswer = {
      questionNumber: currentQuestionIndex + 1,
      checkout: parseInt(currentQuestion.name) || 0,
      userInput: ['NO OUTSHOT'],
      correctAnswer: isNoOutshot ? ['NO OUTSHOT'] : currentQuestion.values.map(v => v.toString()),
      isCorrect: isNoOutshot,
      dartsRequired: currentQuestion.darts || 3
    };
    
    setSessionAnswers([...sessionAnswers, answerData]);
    
    // Auto advance after 3 seconds
    setTimeout(async () => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setGameState('finished');
        // Save stats and session to Firebase if user is logged in
        if (userId) {
          try {
            const finalScore = isNoOutshot ? score + 1 : score;
            await updateUserStats(userId, finalScore, totalQuestions);
            
            const endTime = Date.now();
            const duration = Math.floor((endTime - startTime) / 1000);
            
            await saveQuizSession({
              userId,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              totalQuestions,
              correctAnswers: finalScore,
              score: `${finalScore}/${totalQuestions}`,
              duration,
              answers: [...sessionAnswers, answerData]
            });
          } catch (error) {
            console.error('Error saving session data:', error);
          }
        }
      }
    }, 3000);
  }, [currentInputs, isNoOutshot, score, currentQuestion, currentQuestionIndex, totalQuestions, userId, sessionAnswers, startTime]);

  // Loading UI
  if (gameState === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-3xl font-bold mb-4">Loading Questions...</div>
          <div className="text-lg mb-6 opacity-80">Preparing 10 random checkouts for you</div>
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-2xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-red-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Countdown UI
  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-white mb-8 opacity-80">Get Ready!</div>
          {countdownValue > 0 ? (
            <div className="text-9xl font-bold text-white animate-pulse">
              {countdownValue}
            </div>
          ) : (
            <div className="text-6xl font-bold text-green-400 animate-bounce">
              GO!
            </div>
          )}
          <div className="text-lg text-white mt-8 opacity-60">
            {totalQuestions} questions loaded
          </div>
        </div>
      </div>
    );
  }

  // Finished UI
  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
          <p className="text-2xl mb-2">Final Score: {score}/{totalQuestions}</p>
          <p className="text-xl">Time: {formatTime(elapsedTime)}</p>
          <div className="flex gap-4 justify-center mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/dashboard';
                }
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the quiz UI if there's no current question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-2xl mb-4">Loading Question...</div>
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to quit the quiz? Your progress will be lost.')) {
                window.location.href = '/dashboard';
              }
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              Score: {score}/{totalQuestions}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Checkout Value */}
        <div className="text-center mb-8">
          <div className="text-8xl font-bold text-gray-900 dark:text-white">
            {currentQuestion.name}
          </div>
        </div>

        {/* Input Blocks */}
        <div className="flex justify-center gap-4 mb-8">
          {currentInputs.map((input, index) => (
            <div
              key={index}
              className={`w-20 h-16 border-2 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                currentInputIndex === index
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : input
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              {input || (currentInputIndex === index ? '|' : '')}
            </div>
          ))}
        </div>

        {/* Answer Display */}
        {showAnswer && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            isCorrect 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
          }`}>
            <div className="text-lg font-semibold mb-2">
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </div>
            {!isCorrect && (
              <div className="text-sm">
                {isNoOutshot ? (
                  'This is a NO OUTSHOT - it cannot be achieved'
                ) : (
                  <>Correct answer: {currentQuestion.values.join(' + ')} = {currentQuestion.name}</>
                )}
              </div>
            )}
          </div>
        )}

        {/* Keyboard Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-1 flex">
            <button
              onClick={() => setKeyboardMode('numeric')}
              className={`px-4 py-2 rounded-md transition-all ${
                keyboardMode === 'numeric'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              123
            </button>
            <button
              onClick={() => setKeyboardMode('dart')}
              className={`px-4 py-2 rounded-md transition-all ${
                keyboardMode === 'dart'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Dart
            </button>
          </div>
        </div>

        {/* Numeric Keyboard */}
        {keyboardMode === 'numeric' && (
          <div className="max-w-sm mx-auto">
            {/* NO OUTSHOT Button */}
            <button
              onClick={handleNoOutshot}
              className="w-full h-14 mb-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-sm"
            >
              NO OUTSHOT
            </button>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumericInput(num.toString())}
                  className="h-14 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm"
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleNumericInput('clear')}
                className="h-14 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/30 active:scale-95 transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => handleNumericInput('0')}
                className="h-14 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all shadow-sm"
              >
                0
              </button>
              <button
                onClick={handleEnter}
                className="h-14 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
              >
                Enter
              </button>
            </div>
            <button
              onClick={() => handleNumericInput('backspace')}
              className="w-full h-12 mt-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all"
            >
              ⌫ Backspace
            </button>
          </div>
        )}

        {/* Dart Notation Keyboard */}
        {keyboardMode === 'dart' && (
          <div className="max-w-md mx-auto">
            {/* NO OUTSHOT Button */}
            <button
              onClick={handleNoOutshot}
              className="w-full h-14 mb-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-sm"
            >
              NO OUTSHOT
            </button>
            
            {/* Multiplier Toggle */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((mult) => (
                <button
                  key={mult}
                  onClick={() => setSelectedMultiplier(mult as Multiplier)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedMultiplier === mult
                      ? mult === 1 
                        ? 'bg-gray-600 text-white' 
                        : mult === 2 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {mult === 1 ? 'Single' : mult === 2 ? 'Double' : 'Triple'}
                </button>
              ))}
            </div>

            {/* Dart Board Numbers */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handleDartInput(num)}
                  className={`h-12 rounded-lg font-semibold transition-all shadow-sm ${
                    selectedMultiplier === 1
                      ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : selectedMultiplier === 2
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30'
                      : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                  } active:scale-95`}
                >
                  {selectedMultiplier > 1 && (
                    <span className="text-xs">
                      {selectedMultiplier === 2 ? 'D' : 'T'}
                    </span>
                  )}
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={handleEnter}
              className="w-full h-14 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
            >
              Enter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;