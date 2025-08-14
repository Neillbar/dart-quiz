'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  ArrowLeftIcon, 
  TrophyIcon,
  ClockIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  time: number;
  throwCount: number;
  accuracy: number;
  timestamp: Date;
}

export default function SpeedSubtractingLeaderboard() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [currentUser]);

  const fetchLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'speedSubtractingLeaderboard'),
        orderBy('time', 'asc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      const entries: LeaderboardEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data()
        } as LeaderboardEntry);
      });

      setLeaderboard(entries);

      // Find current user's rank
      if (currentUser) {
        const userIndex = entries.findIndex(entry => entry.userId === currentUser.uid);
        if (userIndex !== -1) {
          setUserRank(userIndex + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-black';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-green-700/50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/mini-games/speed-subtracting')}
          className="mb-6 flex items-center gap-2 text-white hover:text-green-300 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Speed Subtracting
        </button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrophyIcon className="w-12 h-12 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">Speed Subtracting Leaderboard</h1>
              <TrophyIcon className="w-12 h-12 text-yellow-400" />
            </div>
            <p className="text-green-200">Fastest times to reach zero from 501!</p>
          </div>

          {/* User Stats */}
          {currentUser && userRank && (
            <div className="bg-green-800/50 backdrop-blur rounded-xl p-6 mb-6 text-center">
              <p className="text-green-200 mb-2">Your Current Rank</p>
              <p className="text-4xl font-bold text-yellow-400">#{userRank}</p>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-green-800/50 backdrop-blur rounded-xl overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <SparklesIcon className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                <p className="text-xl text-white mb-2">No scores yet!</p>
                <p className="text-green-200">Be the first to complete the game!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-200 uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-200 uppercase tracking-wider">Player</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-green-200 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-green-200 uppercase tracking-wider">Throws</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-green-200 uppercase tracking-wider">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-700/50">
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1;
                      const isCurrentUser = currentUser && entry.userId === currentUser.uid;
                      
                      return (
                        <tr 
                          key={entry.id}
                          className={`${isCurrentUser ? 'bg-green-600/30' : ''} hover:bg-green-700/30 transition-colors`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getRankIcon(rank) && (
                                <span className="text-2xl">{getRankIcon(rank)}</span>
                              )}
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankColor(rank)}`}>
                                {rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {entry.username}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs text-yellow-400">(You)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1">
                              <ClockIcon className="w-4 h-4 text-green-300" />
                              <span className="text-sm font-bold text-white">{formatTime(entry.time)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="text-sm text-green-200">{entry.throwCount}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-green-200">{entry.accuracy}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {leaderboard.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-700/50 backdrop-blur rounded-lg p-4 text-center">
                <ChartBarIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                <p className="text-green-200 text-sm">Average Time</p>
                <p className="text-xl font-bold text-white">
                  {formatTime(Math.floor(leaderboard.reduce((acc, entry) => acc + entry.time, 0) / leaderboard.length))}
                </p>
              </div>
              <div className="bg-green-700/50 backdrop-blur rounded-lg p-4 text-center">
                <TrophyIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                <p className="text-green-200 text-sm">Record Time</p>
                <p className="text-xl font-bold text-white">
                  {formatTime(leaderboard[0].time)}
                </p>
              </div>
              <div className="bg-green-700/50 backdrop-blur rounded-lg p-4 text-center">
                <SparklesIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                <p className="text-green-200 text-sm">Total Players</p>
                <p className="text-xl font-bold text-white">{leaderboard.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}