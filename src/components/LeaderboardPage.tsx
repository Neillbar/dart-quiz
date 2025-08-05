"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  TrophyIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  UserCircleIcon,
  StarIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { LeaderboardProps, LeaderboardPlayer, TimePeriod } from '@/types';
import { getLeaderboard } from '@/services/leaderboardService';
import { useAuth } from '@/contexts/AuthContext';

const LeaderboardPage: React.FC<LeaderboardProps> = ({
  onBack,
  onTimePeriodChange,
  onRefresh
}) => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [animatingRanks, setAnimatingRanks] = useState<Set<string>>(new Set());
  const [visiblePlayers, setVisiblePlayers] = useState(20);
  const [scrollToUser, setScrollToUser] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  // Fetch leaderboard data
  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
      const { players: fetchedPlayers, currentUserRank: userRank } = await getLeaderboard(
        timePeriod,
        authUser?.uid
      );
      setPlayers(fetchedPlayers);
      setCurrentUserRank(userRank);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [timePeriod, authUser?.uid]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const currentUser = players.find(p => p.isCurrentUser);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/dashboard');
    }
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    if (onTimePeriodChange) {
      onTimePeriodChange(period);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Store previous ranks
    const previousPlayersMap = new Map(players.map(p => [p.id, p.rank]));
    
    // Refresh data
    await fetchLeaderboardData();
    
    // Animate rank changes
    const changedRanks = new Set(
      players
        .filter(p => {
          const prevRank = previousPlayersMap.get(p.id);
          return prevRank && prevRank !== p.rank;
        })
        .map(p => p.id)
    );
    setAnimatingRanks(changedRanks);
    
    if (onRefresh) {
      await onRefresh();
    }
    
    setTimeout(() => {
      setIsRefreshing(false);
      setAnimatingRanks(new Set());
    }, 1000);
  };

  const scrollToCurrentUser = useCallback(() => {
    if (currentUser) {
      const userElement = document.getElementById(`player-${currentUser.id}`);
      if (userElement) {
        userElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (scrollToUser) {
      setTimeout(scrollToCurrentUser, 500);
      setScrollToUser(false);
    }
  }, [scrollToUser, scrollToCurrentUser]);

  const getRankChange = (player: LeaderboardPlayer) => {
    if (!player.previousRank) return null;
    const change = player.previousRank - player.rank;
    if (change > 0) return { type: 'up', value: change };
    if (change < 0) return { type: 'down', value: Math.abs(change) };
    return { type: 'same', value: 0 };
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIconSolid className="w-6 h-6 text-dart-gold" />;
      case 2:
        return <TrophyIconSolid className="w-6 h-6 text-gray-400" />;
      case 3:
        return <TrophyIconSolid className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-32';
      case 2: return 'h-24';
      case 3: return 'h-20';
      default: return 'h-16';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateCombinedScore = (accuracy: number, timeInSeconds: number) => {
    return (accuracy * 10) + (3000 / timeInSeconds);
  };

  const loadMorePlayers = () => {
    setVisiblePlayers(prev => Math.min(prev + 20, players.length));
  };

  const handleImageError = (playerId: string) => {
    setImageLoadErrors(prev => new Set(prev).add(playerId));
  };

  const shouldShowIcon = (player: LeaderboardPlayer) => {
    return !player.picture || imageLoadErrors.has(player.id);
  };

  const timePeriods: { value: TimePeriod; label: string }[] = [
    { value: 'all-time', label: 'All Time' },
    { value: 'this-week', label: 'This Week' },
    { value: 'today', label: 'Today' }
  ];

  const topThree = players.slice(0, 3);
  const remainingPlayers = players.slice(3, visiblePlayers);
  
  // Debug logging
  if (topThree.length > 0) {
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dart-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-4 border-dart-gold/10 animate-pulse-slow"></div>
        <div className="absolute top-32 right-20 w-32 h-32 rounded-full border-2 border-dart-red/15 animate-bounce-slow delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full border-2 border-dart-green/20 animate-pulse delay-700"></div>
        
        {/* Large Trophy Ring */}
        <div className="absolute top-1/2 right-10 transform -translate-y-1/2 w-80 h-80 opacity-5">
          <TrophyIconSolid className="w-full h-full text-dart-gold" />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Back button and title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Back to Dashboard"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-dart-gold to-yellow-600 rounded-lg shadow-lg">
                  <TrophyIconSolid className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
                  <p className="text-slate-400 text-sm">Compete with the best</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Time Period Filter */}
              <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                {timePeriods.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => handleTimePeriodChange(period.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      timePeriod === period.value
                        ? 'bg-dart-gold text-white shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                title="Refresh Leaderboard"
              >
                <ArrowPathIcon className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Current User Rank */}
              {currentUser && (
                <button
                  onClick={() => setScrollToUser(true)}
                  className="flex items-center space-x-2 bg-dart-red/20 hover:bg-dart-red/30 rounded-lg px-4 py-2 border border-dart-red/30 transition-all duration-200"
                >
                  <span className="text-white font-medium">Your Rank:</span>
                  <span className="text-dart-gold font-bold">#{currentUser.rank}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        
        {/* Combined Score Formula */}
        <div className="mb-8">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors duration-200"
          >
            <InformationCircleIcon className="w-5 h-5" />
            <span>How is the Combined Score calculated?</span>
          </button>
          
          {showFormula && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Combined Score Formula:</h3>
              <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-dart-gold">
                Combined Score = (Accuracy % × 10) + (3000 ÷ Time in seconds)
              </div>
              <p className="text-slate-300 mt-3 text-sm">
                This formula rewards both accuracy and speed. A perfect score (100% accuracy) in 30 seconds would yield: (100 × 10) + (3000 ÷ 30) = 1100 points.
              </p>
            </div>
          )}
        </div>

        {/* Podium - Top 3 Players */}
        {topThree.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-white mb-8">🏆 Hall of Fame 🏆</h2>
            
            {/* Show different layout based on number of players */}
            {topThree.length === 1 ? (
              // Single player layout
              <div className="flex justify-center max-w-4xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    {shouldShowIcon(topThree[0]) ? (
                      <UserCircleIcon className="w-32 h-32 text-dart-gold animate-pulse-slow" />
                    ) : (
                      <img
                        src={topThree[0].picture}
                        alt={topThree[0].name}
                        className="w-32 h-32 rounded-full border-4 border-dart-gold shadow-xl animate-pulse-slow object-cover"
                        onError={() => {
                          handleImageError(topThree[0].id);
                        }}
                      />
                    )}
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-dart-gold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <StarIconSolid className="w-8 h-8 text-dart-gold animate-bounce" />
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-dart-gold">{topThree[0].name}</h3>
                    <p className="text-dart-gold font-bold text-3xl">{Math.round(topThree[0].combinedScore)}</p>
                    <p className="text-lg text-slate-300">{topThree[0].bestScore} • {formatTime(topThree[0].bestTimeInSeconds)}</p>
                  </div>
                  <div className="w-48 h-40 bg-gradient-to-t from-dart-gold to-yellow-400 rounded-t-lg flex items-center justify-center shadow-xl relative overflow-hidden">
                    <TrophyIconSolid className="w-20 h-20 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                  </div>
                </div>
              </div>
            ) : topThree.length === 2 ? (
              // Two players layout
              <div className="flex items-end justify-center space-x-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    {topThree[0].picture ? (
                      <img
                        src={topThree[0].picture}
                        alt={topThree[0].name}
                        className="w-24 h-24 rounded-full border-4 border-dart-gold shadow-xl animate-pulse-slow"
                      />
                    ) : (
                      <UserCircleIcon className="w-24 h-24 text-dart-gold animate-pulse-slow" />
                    )}
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-dart-gold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <span className="text-white font-bold">1</span>
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-dart-gold">{topThree[0].name}</h3>
                    <p className="text-dart-gold font-bold text-2xl">{Math.round(topThree[0].combinedScore)}</p>
                    <p className="text-sm text-slate-300">{topThree[0].bestScore} • {formatTime(topThree[0].bestTimeInSeconds)}</p>
                  </div>
                  <div className="w-36 h-32 bg-gradient-to-t from-dart-gold to-yellow-400 rounded-t-lg flex items-center justify-center shadow-xl">
                    <TrophyIconSolid className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    {topThree[1].picture ? (
                      <img
                        src={topThree[1].picture}
                        alt={topThree[1].name}
                        className="w-20 h-20 rounded-full border-4 border-gray-400 shadow-xl"
                      />
                    ) : (
                      <UserCircleIcon className="w-20 h-20 text-gray-400" />
                    )}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">{topThree[1].name}</h3>
                    <p className="text-gray-300 font-bold text-xl">{Math.round(topThree[1].combinedScore)}</p>
                    <p className="text-sm text-slate-400">{topThree[1].bestScore} • {formatTime(topThree[1].bestTimeInSeconds)}</p>
                  </div>
                  <div className="w-32 h-24 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg flex items-center justify-center shadow-xl">
                    <TrophyIconSolid className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            ) : (
              // Three or more players - original layout
              <div className="flex items-end justify-center space-x-8 max-w-4xl mx-auto">
              {/* Second Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {topThree[1].picture ? (
                    <img
                      src={topThree[1].picture}
                      alt={topThree[1].name}
                      className="w-20 h-20 rounded-full border-4 border-gray-400 shadow-xl"
                    />
                  ) : (
                    <UserCircleIcon className="w-20 h-20 text-gray-400" />
                  )}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white truncate max-w-32">{topThree[1].name}</h3>
                  <p className="text-gray-300 font-bold text-xl">{Math.round(topThree[1].combinedScore)}</p>
                  <p className="text-sm text-slate-400">{topThree[1].bestScore} • {formatTime(topThree[1].bestTimeInSeconds)}</p>
                </div>
                <div className="w-32 h-24 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg flex items-center justify-center shadow-xl">
                  <TrophyIconSolid className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* First Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {topThree[0].picture ? (
                    <img
                      src={topThree[0].picture}
                      alt={topThree[0].name}
                      className="w-24 h-24 rounded-full border-4 border-dart-gold shadow-xl animate-pulse-slow"
                    />
                  ) : (
                    <UserCircleIcon className="w-24 h-24 text-dart-gold animate-pulse-slow" />
                  )}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-dart-gold rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <StarIconSolid className="w-6 h-6 text-dart-gold animate-bounce" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-dart-gold truncate max-w-36">{topThree[0].name}</h3>
                  <p className="text-dart-gold font-bold text-2xl">{Math.round(topThree[0].combinedScore)}</p>
                  <p className="text-sm text-slate-300">{topThree[0].bestScore} • {formatTime(topThree[0].bestTimeInSeconds)}</p>
                </div>
                <div className="w-36 h-32 bg-gradient-to-t from-dart-gold to-yellow-400 rounded-t-lg flex items-center justify-center shadow-xl relative overflow-hidden">
                  <TrophyIconSolid className="w-16 h-16 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                </div>
              </div>

              {/* Third Place */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {topThree[2].picture ? (
                    <img
                      src={topThree[2].picture}
                      alt={topThree[2].name}
                      className="w-20 h-20 rounded-full border-4 border-amber-600 shadow-xl"
                    />
                  ) : (
                    <UserCircleIcon className="w-20 h-20 text-amber-600" />
                  )}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white truncate max-w-32">{topThree[2].name}</h3>
                  <p className="text-amber-600 font-bold text-xl">{Math.round(topThree[2].combinedScore)}</p>
                  <p className="text-sm text-slate-400">{topThree[2].bestScore} • {formatTime(topThree[2].bestTimeInSeconds)}</p>
                </div>
                <div className="w-32 h-20 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg flex items-center justify-center shadow-xl">
                  <TrophyIconSolid className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        {/* Remaining Players List */}
        {remainingPlayers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">All Players</h2>
            
            <div className="space-y-3">
              {remainingPlayers.map((player, index) => {
                const rankChange = getRankChange(player);
                const medal = getMedalIcon(player.rank);
                
                return (
                  <div
                    key={player.id}
                    id={`player-${player.id}`}
                    className={`relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] ${
                      player.isCurrentUser 
                        ? 'border-dart-gold bg-dart-gold/10 ring-2 ring-dart-gold/30' 
                        : 'border-white/20'
                    }`}
                  >
                    {player.isCurrentUser && (
                      <div className="absolute -top-2 left-4 bg-dart-gold text-white px-3 py-1 rounded-full text-sm font-bold">
                        You
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6">
                      {/* Rank */}
                      <div className="flex items-center space-x-3 min-w-[80px]">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                          player.rank <= 3 
                            ? 'bg-gradient-to-br from-dart-gold to-yellow-600 text-white' 
                            : 'bg-white/20 text-white'
                        }`}>
                          {medal || player.rank}
                        </div>
                        
                        {/* Rank Change */}
                        {rankChange && (
                          <div className="flex items-center">
                            {rankChange.type === 'up' && (
                              <div className="flex items-center text-dart-green">
                                <ArrowUpIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">{rankChange.value}</span>
                              </div>
                            )}
                            {rankChange.type === 'down' && (
                              <div className="flex items-center text-dart-red">
                                <ArrowDownIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">{rankChange.value}</span>
                              </div>
                            )}
                            {rankChange.type === 'same' && (
                              <MinusIcon className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        {player.picture ? (
                          <img
                            src={player.picture}
                            alt={player.name}
                            className="w-12 h-12 rounded-full border-2 border-white/30"
                          />
                        ) : (
                          <UserCircleIcon className="w-12 h-12 text-slate-400" />
                        )}
                        
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{player.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-300">
                            <span className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4" />
                              <span>{player.bestScore}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>{formatTime(player.bestTimeInSeconds)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <BoltIcon className="w-4 h-4" />
                              <span>{player.accuracy}%</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FireIcon className="w-4 h-4" />
                              <span>{player.totalGames} games</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Combined Score */}
                      <div className="text-right min-w-[120px]">
                        <div className="text-2xl font-bold text-white">
                          {Math.round(player.combinedScore)}
                        </div>
                        <div className="text-sm text-slate-400">
                          Combined Score
                        </div>
                      </div>
                    </div>

                    {/* Hover effect for formula breakdown */}
                    <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-xs text-slate-300">
                        ({player.accuracy}% × 10) + (3000 ÷ {player.bestTimeInSeconds}s) = {Math.round(player.combinedScore)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {visiblePlayers < players.length && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMorePlayers}
                  className="bg-dart-gold hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Load More Players ({players.length - visiblePlayers} remaining)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {players.length === 0 && (
          <div className="text-center py-16">
            <TrophyIcon className="w-24 h-24 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No players yet</h3>
            <p className="text-slate-400 mb-8">Be the first to compete and claim the top spot!</p>
            <button
              onClick={() => router.push('/quiz')}
              className="bg-dart-gold hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
            >
              Take Your First Quiz
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LeaderboardPage;