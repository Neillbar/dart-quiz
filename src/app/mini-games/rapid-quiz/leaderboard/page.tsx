'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrophyIcon, BoltIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getRapidQuizLeaderboard, RapidQuizLeaderboardEntry } from '@/services/rapidQuizService';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function RapidQuizLeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<RapidQuizLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await getRapidQuizLeaderboard(50);
        setLeaderboard(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-400 bg-yellow-400/20';
      case 2:
        return 'text-gray-300 bg-gray-300/20';
      case 3:
        return 'text-orange-400 bg-orange-400/20';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getMedal = (position: number) => {
    if (position <= 3) {
      return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getMedalColor(position)}`}>
          {position}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 flex items-center justify-center text-gray-500">
        {position}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-orange-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 to-orange-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/mini-games')}
              className="flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <BoltIcon className="w-6 h-6 text-yellow-400 mr-2" />
              <h1 className="text-xl font-bold text-white">Rapid Quiz Leaderboard</h1>
            </div>
            <button
              onClick={() => router.push('/mini-games/rapid-quiz')}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-all"
            >
              Play Now
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="order-1 md:order-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center transform translate-y-4">
                <div className="text-4xl mb-2">🥈</div>
                <div className="text-white font-bold truncate">{leaderboard[1].userName}</div>
                <div className="text-2xl font-bold text-gray-300 mt-2">{leaderboard[1].score}</div>
                <div className="text-xs text-white/60 mt-1">{leaderboard[1].accuracy}% accuracy</div>
              </div>
            </div>
            
            {/* 1st Place */}
            <div className="order-2 md:order-2">
              <div className="bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-yellow-400">
                <div className="text-5xl mb-2">🥇</div>
                <div className="text-white font-bold truncate">{leaderboard[0].userName}</div>
                <div className="text-3xl font-bold text-yellow-400 mt-2">{leaderboard[0].score}</div>
                <div className="text-xs text-white/60 mt-1">{leaderboard[0].accuracy}% accuracy</div>
              </div>
            </div>
            
            {/* 3rd Place */}
            <div className="order-3 md:order-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center transform translate-y-4">
                <div className="text-4xl mb-2">🥉</div>
                <div className="text-white font-bold truncate">{leaderboard[2].userName}</div>
                <div className="text-2xl font-bold text-orange-400 mt-2">{leaderboard[2].score}</div>
                <div className="text-xs text-white/60 mt-1">{leaderboard[2].accuracy}% accuracy</div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/20">
            <h2 className="text-xl font-bold text-white flex items-center">
              <TrophyIcon className="w-6 h-6 mr-2 text-yellow-400" />
              Top Players
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/60 text-sm border-b border-white/10">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Player</th>
                  <th className="px-6 py-3 text-center">Score</th>
                  <th className="px-6 py-3 text-center">Questions</th>
                  <th className="px-6 py-3 text-center">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={`${entry.userId}-${index}`}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      entry.userId === currentUserId ? 'bg-yellow-400/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      {getMedal(index + 1)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-white font-semibold">
                            {entry.userName}
                            {entry.userId === currentUserId && (
                              <span className="ml-2 text-xs text-yellow-400">(You)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-bold text-yellow-400">{entry.score}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-white">
                      {entry.questionsAnswered}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${
                        entry.accuracy >= 90 ? 'text-green-400' :
                        entry.accuracy >= 70 ? 'text-yellow-400' :
                        'text-orange-400'
                      }`}>
                        {entry.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {leaderboard.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-white/60 mb-4">No scores yet. Be the first to play!</p>
              <button
                onClick={() => router.push('/mini-games/rapid-quiz')}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-bold transition-all"
              >
                Play Rapid Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}