'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, BoltIcon, TrophyIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { KeyboardMode, Multiplier } from '@/types';
import { getRandomQuizQuestions, QuizOption } from '@/services/quizService';
import { saveRapidQuizScore, getRapidQuizHighScore } from '@/services/rapidQuizService';

interface RapidQuizGameProps {
  userId?: string;
}

type GameState = 'menu' | 'playing' | 'finished';

const RapidQuizGame: React.FC<RapidQuizGameProps> = ({ userId }) => {
  const router = useRouter();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('menu');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
  // Quiz data
  const [questions, setQuestions] = useState<QuizOption[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Input state
  const [keyboardMode, setKeyboardMode] = useState<KeyboardMode>('numeric');
  const [currentInputs, setCurrentInputs] = useState<string[]>([]);
  const [currentInputIndex, setCurrentInputIndex] = useState(0);
  const [selectedMultiplier, setSelectedMultiplier] = useState<Multiplier>(1);
  const [userSelectedNoOutshot, setUserSelectedNoOutshot] = useState(false);
  
  // High score
  const [personalBest, setPersonalBest] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isNoOutshot = currentQuestion?.isNoOutshot || currentQuestion?.darts === 0;

  // Load personal best on mount
  useEffect(() => {
    const loadPersonalBest = async () => {
      if (userId) {
        const highScore = await getRapidQuizHighScore(userId);
        setPersonalBest(highScore);
      }
    };
    loadPersonalBest();
  }, [userId]);

  // Load questions when game starts
  const startGame = async () => {
    try {
      setLoading(true);
      setError(null);
      const quizQuestions = await getRandomQuizQuestions(0); // Get all questions
      
      if (quizQuestions.length === 0) {
        setError('No quiz questions available. Please check the database.');
        return;
      }
      
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setQuestionsAnswered(0);
      setCorrectAnswers(0);
      setWrongAnswers(0);
      setCurrentStreak(0);
      setBestStreak(0);
      setTimeRemaining(30);
      setGameState('playing');
    } catch (err) {
      setError('Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  // Initialize inputs based on dart count
  useEffect(() => {
    if (currentQuestion && gameState === 'playing') {
      const dartCount = currentQuestion.darts === 0 ? 3 : currentQuestion.darts;
      setCurrentInputs(new Array(dartCount).fill(''));
      setCurrentInputIndex(0);
      setUserSelectedNoOutshot(false);
    }
  }, [currentQuestion, gameState]);

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeRemaining === 0) {
      endGame();
    }
  }, [gameState, timeRemaining]);

  const endGame = async () => {
    setGameState('finished');
    
    const finalScore = correctAnswers * 10 + (wrongAnswers === 0 && questionsAnswered > 0 ? 50 : 0);
    
    if (userId && finalScore > personalBest) {
      setIsNewHighScore(true);
      await saveRapidQuizScore(userId, {
        score: finalScore,
        questionsAnswered,
        correctAnswers,
        wrongAnswers,
        bestStreak,
        timestamp: new Date()
      });
    }
  };

  // Keyboard handlers
  const handleNumericInput = useCallback((value: string) => {
    if (currentInputIndex < currentInputs.length) {
      const newInputs = [...currentInputs];
      if (value === 'clear') {
        newInputs[currentInputIndex] = '';
      } else if (value === 'backspace') {
        newInputs[currentInputIndex] = newInputs[currentInputIndex].slice(0, -1);
      } else {
        if (newInputs[currentInputIndex].length < 2) {
          const newValue = newInputs[currentInputIndex] + value;
          const numValue = parseInt(newValue);
          if (numValue <= 60) {
            newInputs[currentInputIndex] = newValue;
          }
        }
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
    if (!currentQuestion || gameState !== 'playing') return;
    
    let correct = false;
    
    if (isNoOutshot) {
      correct = userSelectedNoOutshot;
    } else {
      const userAnswer = currentInputs.map(input => parseInt(input) || 0);
      const correctValues = [...currentQuestion.values].sort((a, b) => b - a);
      const userValues = [...userAnswer].filter(val => val > 0).sort((a, b) => b - a);
      
      correct = userValues.length === correctValues.length &&
                userValues.every((val, index) => val === correctValues[index]) &&
                userValues.reduce((sum, val) => sum + val, 0) === parseInt(currentQuestion.name);
    }
    
    setQuestionsAnswered(questionsAnswered + 1);
    
    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
      setCurrentStreak(currentStreak + 1);
      if (currentStreak + 1 > bestStreak) {
        setBestStreak(currentStreak + 1);
      }
    } else {
      setWrongAnswers(wrongAnswers + 1);
      setCurrentStreak(0);
    }
    
    // Immediately move to next question
    moveToNextQuestion();
  }, [currentInputs, currentQuestion, userSelectedNoOutshot, isNoOutshot, gameState, questionsAnswered, correctAnswers, wrongAnswers, currentStreak, bestStreak]);

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Shuffle and restart questions
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentQuestionIndex(0);
    }
  };

  const handleEnter = useCallback(() => {
    if (currentInputIndex < currentInputs.length - 1) {
      setCurrentInputIndex(currentInputIndex + 1);
    } else {
      checkAnswer();
    }
  }, [currentInputIndex, currentInputs.length, checkAnswer]);

  const handleNoOutshot = useCallback(() => {
    setUserSelectedNoOutshot(true);
    setCurrentInputs(currentInputs.map(() => ''));
    
    let correct = isNoOutshot;
    
    setQuestionsAnswered(questionsAnswered + 1);
    
    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
      setCurrentStreak(currentStreak + 1);
      if (currentStreak + 1 > bestStreak) {
        setBestStreak(currentStreak + 1);
      }
    } else {
      setWrongAnswers(wrongAnswers + 1);
      setCurrentStreak(0);
    }
    
    moveToNextQuestion();
  }, [isNoOutshot, questionsAnswered, correctAnswers, wrongAnswers, currentStreak, bestStreak, currentInputs]);

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-orange-900">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/mini-games')}
            className="mb-6 flex items-center gap-2 text-white hover:text-yellow-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Mini Games
          </button>

          <div className="max-w-2xl mx-auto pt-12">
            <div className="text-center">
              <div className="mb-6">
                <BoltIcon className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-white mb-2">Rapid Quiz</h1>
                <p className="text-lg text-white/80">30 seconds of non-stop dart checkouts!</p>
              </div>

              {personalBest > 0 && (
                <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-xs mx-auto">
                  <p className="text-white/60 text-sm">Your Best Score</p>
                  <p className="text-3xl font-bold text-yellow-400">{personalBest}</p>
                </div>
              )}

              <button
                onClick={startGame}
                disabled={loading}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Start Game'}
              </button>

              {/* Leaderboard Button */}
              <div className="mt-6">
                <button
                  onClick={() => router.push('/mini-games/rapid-quiz/leaderboard')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center gap-3 mx-auto shadow-lg"
                >
                  <TrophyIcon className="w-6 h-6" />
                  View Leaderboard
                  <TrophyIcon className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mt-4 text-red-400">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState === 'finished') {
    const finalScore = correctAnswers * 10 + (wrongAnswers === 0 && questionsAnswered > 0 ? 50 : 0);
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-orange-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4">
          <TrophyIcon className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
          
          {isNewHighScore && (
            <div className="mb-4 text-yellow-400 font-bold text-2xl animate-pulse">
              NEW HIGH SCORE!
            </div>
          )}

          <h2 className="text-3xl font-bold text-white mb-6">Time&apos;s Up!</h2>

          <div className="space-y-4 mb-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/60 text-sm">Final Score</p>
              <p className="text-4xl font-bold text-yellow-400">{finalScore}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/60 text-sm">Questions</p>
                <p className="text-2xl font-bold text-white">{questionsAnswered}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/60 text-sm">Accuracy</p>
                <p className="text-2xl font-bold text-white">{accuracy}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-500/20 rounded-lg p-3">
                <p className="text-green-400 text-sm">Correct</p>
                <p className="text-2xl font-bold text-green-400">{correctAnswers}</p>
              </div>
              <div className="bg-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">Wrong</p>
                <p className="text-2xl font-bold text-red-400">{wrongAnswers}</p>
              </div>
            </div>

            {bestStreak > 1 && (
              <div className="bg-purple-500/20 rounded-lg p-3">
                <p className="text-purple-400 text-sm">Best Streak</p>
                <p className="text-2xl font-bold text-purple-400">{bestStreak} in a row</p>
              </div>
            )}

            {wrongAnswers === 0 && questionsAnswered > 0 && (
              <div className="bg-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">Perfect Round Bonus</p>
                <p className="text-2xl font-bold text-yellow-400">+50</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={startGame}
              className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-bold transition-all"
            >
              Play Again
            </button>
            <button
              onClick={() => router.push('/mini-games/rapid-quiz/leaderboard')}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => router.push('/mini-games')}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold transition-all"
            >
              Back to Mini Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-orange-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-orange-900">
      {/* Header with timer */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
                router.push('/mini-games');
              }
            }}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                <ClockIcon className="w-6 h-6 inline mr-1" />
                {timeRemaining}s
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-white/60">Score</div>
            <div className="text-xl font-bold text-yellow-400">
              {correctAnswers * 10}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/5 px-4 py-2 flex justify-center space-x-6">
        <div className="text-center">
          <span className="text-white/60 text-xs">Questions</span>
          <span className="ml-2 text-white font-bold">{questionsAnswered}</span>
        </div>
        <div className="text-center">
          <span className="text-green-400 text-xs">Correct</span>
          <span className="ml-2 text-green-400 font-bold">{correctAnswers}</span>
        </div>
        <div className="text-center">
          <span className="text-red-400 text-xs">Wrong</span>
          <span className="ml-2 text-red-400 font-bold">{wrongAnswers}</span>
        </div>
        {currentStreak > 1 && (
          <div className="text-center">
            <span className="text-purple-400 text-xs">Streak</span>
            <span className="ml-2 text-purple-400 font-bold">{currentStreak}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Checkout Value */}
        <div className="text-center mb-6">
          <div className="text-7xl font-bold text-white">
            {currentQuestion.name}
          </div>
        </div>

        {/* Input Blocks */}
        <div className="flex justify-center gap-3 mb-6">
          {currentInputs.map((input, index) => (
            <div
              key={index}
              onClick={() => {
                setCurrentInputIndex(index);
                const newInputs = [...currentInputs];
                newInputs[index] = '';
                setCurrentInputs(newInputs);
              }}
              className={`w-16 h-14 border-2 rounded-lg flex items-center justify-center text-xl font-bold transition-all cursor-pointer hover:opacity-80 ${
                currentInputIndex === index
                  ? 'border-yellow-400 bg-yellow-400/20'
                  : input
                  ? 'border-green-400 bg-green-400/20 text-green-400'
                  : 'border-white/30 bg-white/10'
              }`}
            >
              {input || (currentInputIndex === index ? '|' : '')}
            </div>
          ))}
        </div>

        {/* Keyboard Mode Toggle */}
        <div className="flex justify-center mb-3">
          <div className="bg-white/10 rounded-lg p-1 flex">
            <button
              onClick={() => setKeyboardMode('numeric')}
              className={`px-3 py-1 rounded-md transition-all text-sm ${
                keyboardMode === 'numeric'
                  ? 'bg-yellow-500 text-gray-900 font-bold'
                  : 'text-white/60'
              }`}
            >
              123
            </button>
            <button
              onClick={() => setKeyboardMode('dart')}
              className={`px-3 py-1 rounded-md transition-all text-sm ${
                keyboardMode === 'dart'
                  ? 'bg-yellow-500 text-gray-900 font-bold'
                  : 'text-white/60'
              }`}
            >
              Dart
            </button>
          </div>
        </div>

        {/* Numeric Keyboard */}
        {keyboardMode === 'numeric' && (
          <div className="max-w-xs mx-auto">
            <button
              onClick={handleNoOutshot}
              className="w-full h-12 mb-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all"
            >
              NO OUTSHOT
            </button>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumericInput(num.toString())}
                  className="h-12 bg-white/10 border border-white/20 rounded-lg text-white text-lg font-semibold hover:bg-white/20 active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleNumericInput('clear')}
                className="h-12 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/30 active:scale-95 transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => handleNumericInput('0')}
                className="h-12 bg-white/10 border border-white/20 rounded-lg text-white text-lg font-semibold hover:bg-white/20 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                onClick={handleEnter}
                className="h-12 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 active:scale-95 transition-all"
              >
                Enter
              </button>
            </div>
          </div>
        )}

        {/* Dart Notation Keyboard */}
        {keyboardMode === 'dart' && (
          <div className="max-w-sm mx-auto">
            <button
              onClick={handleNoOutshot}
              className="w-full h-12 mb-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all"
            >
              NO OUTSHOT
            </button>
            
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3].map((mult) => (
                <button
                  key={mult}
                  onClick={() => setSelectedMultiplier(mult as Multiplier)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    selectedMultiplier === mult
                      ? mult === 1 
                        ? 'bg-gray-600 text-white' 
                        : mult === 2 
                        ? 'bg-yellow-500 text-gray-900' 
                        : 'bg-red-500 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {mult === 1 ? 'Single' : mult === 2 ? 'Double' : 'Triple'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-1 mb-3">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => handleDartInput(num)}
                  className={`h-10 rounded text-sm font-semibold transition-all ${
                    selectedMultiplier === 1
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : selectedMultiplier === 2
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  } active:scale-95`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={handleEnter}
              className="w-full h-12 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 active:scale-95 transition-all"
            >
              Enter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RapidQuizGame;