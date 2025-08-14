'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  BoltIcon, 
  TrophyIcon, 
  ClockIcon,
  ArrowLeftIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

export default function MiniGamesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const miniGames = [
    {
      id: 'rapid-quiz',
      title: 'Rapid Quiz',
      description: '30 seconds to answer as many checkouts as possible!',
      icon: BoltIcon,
      color: 'from-yellow-400 to-orange-500',
      path: '/mini-games/rapid-quiz',
      leaderboardPath: '/mini-games/rapid-quiz/leaderboard',
      stats: {
        icon: ClockIcon,
        label: '30 seconds'
      }
    },
    {
      id: 'speed-subtracting',
      title: 'Speed Subtracting',
      description: 'Race from 501 to zero - Just like a real darts game!',
      icon: CalculatorIcon,
      color: 'from-green-400 to-emerald-500',
      path: '/mini-games/speed-subtracting',
      leaderboardPath: '/mini-games/speed-subtracting/leaderboard',
      stats: {
        icon: ClockIcon,
        label: 'Time Trial'
      }
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-white">Mini Games</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Practice Makes Perfect
          </h2>
          <p className="text-xl text-white/80">
            Sharpen your dart math skills with these fun mini-games
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {miniGames.map((game) => {
            const Icon = game.icon;
            const StatsIcon = game.stats.icon;
            
            return (
              <div
                key={game.id}
                className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => router.push(game.path)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${game.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl">
                  
                  <div className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {game.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <StatsIcon className="w-4 h-4 mr-1" />
                    <span>{game.stats.label}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <button className={`w-full py-2 px-4 bg-gradient-to-r ${game.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all`}>
                      Play Now
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(game.leaderboardPath);
                      }}
                      className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <TrophyIcon className="w-4 h-4" />
                      Leaderboard
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}