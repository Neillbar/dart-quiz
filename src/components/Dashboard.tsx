"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlayIcon, 
  ChartBarIcon, 
  TrophyIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon,
  FireIcon,
  StarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlayIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid';
import { DashboardProps, UserStats } from '@/types';

const Dashboard: React.FC<DashboardProps> = ({
  user = { name: 'Dart Player', email: 'player@example.com' },
  stats = {
    totalGames: 42,
    bestScore: '9/10',
    averageScore: '7.2/10',
    currentStreak: 5,
    favoriteFinish: 'Double 20',
    accuracy: '85%'
  },
  onTakeQuiz,
  onViewStats,
  onViewLeaderboard,
  onSignOut
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const router = useRouter();

  const handleTakeQuiz = () => {
    if (onTakeQuiz) {
      onTakeQuiz();
    } else {
      router.push('/quiz');
    }
  };

  const handleViewStats = () => {
    if (onViewStats) {
      onViewStats();
    } else {
      router.push('/statistics');
    }
  };

  const handleViewLeaderboard = () => {
    if (onViewLeaderboard) {
      onViewLeaderboard();
    } else {
      router.push('/leaderboard');
    }
  };

  const navigationCards = [
    {
      id: 'quiz',
      title: 'Take Quiz',
      description: 'Practice your checkout knowledge',
      icon: PlayIcon,
      iconSolid: PlayIconSolid,
      onClick: handleTakeQuiz,
      gradient: 'from-dart-red to-red-600',
      hoverGradient: 'from-dart-red to-red-700',
      isPrimary: true
    },
    {
      id: 'stats',
      title: 'Statistics',
      description: 'View your performance metrics',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      onClick: handleViewStats,
      gradient: 'from-dart-green to-green-600',
      hoverGradient: 'from-dart-green to-green-700'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'Compete with other players',
      icon: TrophyIcon,
      iconSolid: TrophyIconSolid,
      onClick: handleViewLeaderboard,
      gradient: 'from-dart-gold to-yellow-600',
      hoverGradient: 'from-dart-gold to-yellow-700'
    }
  ];

  const quickTips = [
    "Double 16 is easier than Double 20 for most players",
    "Always aim for the largest segment when in doubt",
    "Practice your out-shots from 170 down to 2",
    "Remember: you can't finish on an odd number with doubles only"
  ];

  const [currentTip, setCurrentTip] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % quickTips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-4 border-dart-red/10 animate-pulse-slow"></div>
        <div className="absolute top-32 right-20 w-32 h-32 rounded-full border-2 border-dart-green/15 animate-bounce-slow delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full border-2 border-dart-gold/20 animate-pulse delay-700"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 rounded-full border-3 border-dart-red/10 animate-bounce delay-500"></div>
        
        {/* Large Dartboard Ring */}
        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 w-80 h-80 opacity-5">
          <div className="absolute inset-0 rounded-full border-8 border-dart-red"></div>
          <div className="absolute inset-6 rounded-full border-6 border-dart-green"></div>
          <div className="absolute inset-12 rounded-full border-4 border-dart-gold"></div>
          <div className="absolute inset-16 rounded-full border-2 border-white"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-dart-red to-dart-green rounded-xl shadow-lg">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1l3 8h-6z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-dart-red via-dart-green to-dart-gold bg-clip-text text-transparent">
                  Dart Quiz
                </h1>
                <p className="text-slate-400 text-sm">Master Your Game</p>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-dart-green/50 object-cover"
                    onError={(e) => {
                      console.error('Failed to load profile picture in header:', user.picture);
                      e.currentTarget.style.display = 'none';
                      // Show the icon instead
                      const icon = e.currentTarget.parentElement?.querySelector('svg');
                      if (icon) icon.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <UserCircleIcon className={`w-10 h-10 text-slate-400 ${user.picture ? 'hidden' : ''}`} />
                <div className="hidden sm:block">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={onSignOut}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Sign Out"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Welcome back, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-xl text-slate-300 mb-6">
            Ready to perfect your dart checkout skills?
          </p>
          
          {/* Quick Tip */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <BoltIcon className="w-5 h-5 text-dart-gold" />
            <span className="text-slate-200 font-medium">Quick Tip:</span>
            <span className="text-white">{quickTips[currentTip]}</span>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Total Games</span>
              <FireIcon className="w-5 h-5 text-dart-red" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Best Score</span>
              <StarIcon className="w-5 h-5 text-dart-gold" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.bestScore}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Current Streak</span>
              <BoltIcon className="w-5 h-5 text-dart-green" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Accuracy</span>
              <TrophyIcon className="w-5 h-5 text-dart-red" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.accuracy}</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {navigationCards.map((card) => {
            const Icon = hoveredCard === card.id ? card.iconSolid : card.icon;
            const isHovered = hoveredCard === card.id;
            
            return (
              <div
                key={card.id}
                className={`relative group cursor-pointer transform transition-all duration-300 ${
                  isHovered ? 'scale-105 -translate-y-2' : 'hover:scale-102'
                } ${card.isPrimary ? 'md:col-span-1 md:row-span-1' : ''}`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={card.onClick}
              >
                <div className={`
                  relative bg-gradient-to-br ${isHovered ? card.hoverGradient : card.gradient}
                  rounded-2xl p-8 shadow-2xl border border-white/20 overflow-hidden
                  ${card.isPrimary ? 'ring-2 ring-dart-red/30' : ''}
                `}>
                  
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <div className="w-full h-full rounded-full border-4 border-white"></div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`w-12 h-12 text-white transition-transform duration-300 ${
                        isHovered ? 'scale-110 rotate-12' : ''
                      }`} />
                      {card.isPrimary && (
                        <div className="bg-white/20 rounded-full px-3 py-1">
                          <span className="text-white text-xs font-bold">START HERE</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {card.title}
                    </h3>
                    
                    <p className="text-white/80 text-lg mb-6">
                      {card.description}
                    </p>
                    
                    <div className={`inline-flex items-center text-white font-medium transition-transform duration-300 ${
                      isHovered ? 'translate-x-2' : ''
                    }`}>
                      <span>Get Started</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  } bg-gradient-to-r from-white/10 to-transparent`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Keep Improving Your Game</h3>
          <p className="text-slate-300 text-lg mb-6">
            Every professional dart player started as a beginner. Master your checkouts one quiz at a time.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-dart-green font-medium">Average Score: {stats.averageScore}</span>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-dart-gold font-medium">Favorite Finish: {stats.favoriteFinish}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;