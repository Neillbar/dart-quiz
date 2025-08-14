'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeftIcon,
  PlayIcon,
  ArrowPathIcon,
  TrophyIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { speedSubtractingService } from '@/services/speedSubtractingService';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const SpeedSubtracting: React.FC = () => {
  const router = useRouter();
  const [gameState, setGameState] = useState(speedSubtractingService.getGameState());
  const [inputValue, setInputValue] = useState('');
  const [showError, setShowError] = useState(false);
  const [shakeAnimation, setShakeAnimation] = useState(false);
  const [lastThrow, setLastThrow] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savingScore, setSavingScore] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState.isPlaying && !gameState.gameComplete) {
      interval = setInterval(() => {
        speedSubtractingService.updateTimer();
        setGameState(speedSubtractingService.getGameState());
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.gameComplete]);

  useEffect(() => {
    if (gameState.gameComplete && !savingScore && currentUser) {
      saveScoreToLeaderboard();
    }
  }, [gameState.gameComplete]);

  const startGame = () => {
    speedSubtractingService.startGame();
    setGameState(speedSubtractingService.getGameState());
    setInputValue('');
    setShowError(false);
    setLastThrow(null);
  };

  const resetGame = () => {
    speedSubtractingService.resetGame();
    setGameState(speedSubtractingService.getGameState());
    setInputValue('');
    setShowError(false);
    setLastThrow(null);
    setShowSuccess(false);
    setSavingScore(false);
  };

  const saveScoreToLeaderboard = async () => {
    if (!currentUser || savingScore) return;

    setSavingScore(true);
    
    try {
      const accuracy = Math.round((gameState.throwCount / (gameState.throwCount + gameState.mistakes)) * 100);
      
      // Get user data for username
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const username = userData?.username || currentUser.email?.split('@')[0] || 'Anonymous';

      // Check if user already has a score
      const leaderboardRef = doc(db, 'speedSubtractingLeaderboard', currentUser.uid);
      const existingScore = await getDoc(leaderboardRef);

      const scoreData = {
        userId: currentUser.uid,
        username: username,
        time: gameState.elapsedTime,
        throwCount: gameState.throwCount,
        accuracy: accuracy,
        timestamp: new Date()
      };

      if (existingScore.exists()) {
        // Update only if new score is better
        const existingData = existingScore.data();
        if (gameState.elapsedTime < existingData.time) {
          await updateDoc(leaderboardRef, scoreData);
        }
      } else {
        // First score for this user
        await setDoc(leaderboardRef, scoreData);
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleSubmit = useCallback(() => {
    if (!inputValue || gameState.gameComplete) return;

    const answer = parseInt(inputValue);
    if (isNaN(answer)) return;

    const expectedAnswer = gameState.currentScore - gameState.currentTarget;
    
    if (answer === expectedAnswer) {
      setShowError(false);
      setShakeAnimation(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 500);
      
      speedSubtractingService.submitAnswer(answer);
      const newState = speedSubtractingService.getGameState();
      setGameState(newState);
      setLastThrow(gameState.currentTarget);
      setInputValue('');
    } else {
      setShowError(true);
      setShakeAnimation(true);
      speedSubtractingService.recordMistake();
      setTimeout(() => setShakeAnimation(false), 500);
    }
  }, [inputValue, gameState]);

  const handleNumericInput = useCallback((value: string) => {
    if (value === 'clear') {
      setInputValue('');
    } else if (value === 'backspace') {
      setInputValue(prev => prev.slice(0, -1));
    } else {
      // Limit to 3 digits since max answer is 501
      if (inputValue.length < 3) {
        setInputValue(prev => prev + value);
      }
    }
  }, [inputValue]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getDartValueDescription = (value: number) => {
    if (value >= 100) return "🎯 Big Score!";
    if (value >= 60) return "🎪 Triple!";
    if (value >= 40) return "💫 Double!";
    return "🎯 Single";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex flex-col">
      {/* Header - Compact */}
      <div className="px-4 py-3">
        <button
          onClick={() => router.push('/mini-games')}
          className="flex items-center gap-2 text-white hover:text-green-300 transition-colors text-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex-1 flex flex-col px-4 pb-4 max-w-4xl w-full mx-auto">
        {/* Game Title - Compact */}
        <div className="text-center mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2">
            <SparklesIcon className="w-6 h-6 text-yellow-400" />
            Speed Subtracting
            <SparklesIcon className="w-6 h-6 text-yellow-400" />
          </h1>
        </div>

        {/* Game Stats - Horizontal compact bar */}
        {gameState.isPlaying && (
          <div className="flex justify-around bg-green-700/50 backdrop-blur rounded-lg p-2 mb-3">
            <div className="text-center">
              <div className="text-green-200 text-xs">Score</div>
              <div 
                className={`text-xl font-bold ${shakeAnimation ? 'text-red-400' : 'text-white'}`}
                style={shakeAnimation ? {
                  animation: 'shake 0.5s',
                } : {}}
              >
                {gameState.currentScore}
              </div>
            </div>
            <div className="text-center">
              <div className="text-green-200 text-xs">Time</div>
              <div className="text-xl font-bold text-white">
                {formatTime(gameState.elapsedTime)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-green-200 text-xs">Throws</div>
              <div className="text-xl font-bold text-white">
                {gameState.throwCount}
              </div>
            </div>
          </div>
        )}

        {/* Game Area - Flex to fill available space */}
        <div className="flex-1 bg-green-800/50 backdrop-blur rounded-xl p-4 sm:p-6 shadow-2xl flex flex-col justify-center">
            {!gameState.isPlaying && !gameState.gameComplete && (
              <div className="text-center">
                <div className="mb-6">
                  <SparklesIcon className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-4">Ready to Play?</h2>
                  <p className="text-green-200 mb-2">
                    Start from 501 and subtract your dart scores to reach exactly zero!
                  </p>
                  <p className="text-green-300 text-sm">
                    Most throws will be between 26-80, with occasional big scores over 100
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
                >
                  <PlayIcon className="w-6 h-6" />
                  Start Game
                </button>
              </div>
            )}

            {gameState.isPlaying && !gameState.gameComplete && (
              <div className="flex flex-col h-full">
                {/* Fixed Top Section - Math Problem */}
                <div className="bg-green-900/50 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-green-300 mb-1">You scored:</div>
                    <div className="text-3xl font-bold text-yellow-400">
                      {gameState.currentTarget}
                      <span className="text-sm text-green-300 ml-2">{getDartValueDescription(gameState.currentTarget)}</span>
                    </div>
                  </div>
                  
                  <div className="text-center mt-3">
                    <div className="text-2xl sm:text-3xl text-white font-bold">
                      {gameState.currentScore} - {gameState.currentTarget} = ?
                    </div>
                  </div>
                  
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`w-full max-w-[200px] mx-auto mt-3 px-3 py-2 text-xl text-center rounded-lg transition-all block ${
                      showError 
                        ? 'bg-red-100 border-2 border-red-500 text-red-700' 
                        : showSuccess
                        ? 'bg-green-100 border-2 border-green-500 text-green-700'
                        : 'bg-white text-gray-800'
                    }`}
                    placeholder="Answer"
                    autoFocus
                  />
                  
                  {showError && (
                    <p className="text-red-400 text-sm mt-2 text-center animate-pulse">
                      Wrong! Try again
                    </p>
                  )}
                </div>

                {/* Numeric Keyboard - Always Visible */}
                <div className="max-w-[280px] w-full mx-auto">
                  <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleNumericInput(num.toString())}
                        className="h-11 sm:h-12 bg-green-700/50 border border-green-600 rounded-lg text-white text-lg font-semibold hover:bg-green-600/50 active:scale-95 transition-all"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    <button
                      onClick={() => handleNumericInput('clear')}
                      className="h-11 sm:h-12 bg-red-500/30 text-red-300 border border-red-500/50 rounded-lg text-sm font-semibold hover:bg-red-500/40 active:scale-95 transition-all"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => handleNumericInput('0')}
                      className="h-11 sm:h-12 bg-green-700/50 border border-green-600 rounded-lg text-white text-lg font-semibold hover:bg-green-600/50 active:scale-95 transition-all"
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleNumericInput('backspace')}
                      className="h-11 sm:h-12 bg-yellow-500/30 text-yellow-300 border border-yellow-500/50 rounded-lg font-semibold hover:bg-yellow-500/40 active:scale-95 transition-all"
                    >
                      ←
                    </button>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all transform hover:scale-105"
                  >
                    Submit Answer
                  </button>
                </div>

                {/* Additional Info - Compact */}
                <div className="mt-3 flex justify-between items-center text-sm">
                  {lastThrow !== null && (
                    <div className="text-green-300">
                      Last: {lastThrow}
                    </div>
                  )}
                  {gameState.mistakes > 0 && (
                    <div className="text-orange-400">
                      Mistakes: {gameState.mistakes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {gameState.gameComplete && (
              <div className="text-center">
                <TrophyIcon className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">Checkout! 🎯</h2>
                <div className="space-y-3 mb-6">
                  <p className="text-2xl text-green-200">
                    Final Time: <span className="font-bold text-white">{formatTime(gameState.elapsedTime)}</span>
                  </p>
                  <p className="text-xl text-green-200">
                    Total Throws: <span className="font-bold text-white">{gameState.throwCount}</span>
                  </p>
                  <p className="text-xl text-green-200">
                    Accuracy: <span className="font-bold text-white">
                      {Math.round((gameState.throwCount / (gameState.throwCount + gameState.mistakes)) * 100)}%
                    </span>
                  </p>
                  {gameState.mistakes > 0 && (
                    <p className="text-lg text-orange-400">
                      Mistakes: {gameState.mistakes}
                    </p>
                  )}
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={resetGame}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    Play Again
                  </button>
                  <button
                    onClick={() => router.push('/mini-games')}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
                  >
                    Back to Games
                  </button>
                </div>

                {/* Best Score Display */}
                {gameState.bestTime > 0 && (
                  <div className="mt-6 text-green-300 flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Best Time: {formatTime(gameState.bestTime)}
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Leaderboard Button - Fixed at bottom on mobile */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/mini-games/speed-subtracting/leaderboard')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-2.5 px-6 rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg text-sm"
          >
            <TrophyIcon className="w-5 h-5" />
            Leaderboard
            <TrophyIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default SpeedSubtracting;