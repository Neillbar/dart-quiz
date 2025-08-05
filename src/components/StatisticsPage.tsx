"use client";

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeftIcon,
  TrophyIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  CalendarIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
  StarIcon as StarIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';
import { StatsPageProps, GameSession, SessionDetail } from '@/types';
import SessionDetailModal from './SessionDetailModal';
import PerformanceChart from './PerformanceChart';

const StatisticsPage: React.FC<StatsPageProps> = ({
  user = { name: 'Dart Player', email: 'player@example.com' },
  sessions = [],
  onBack,
  onSessionClick,
  onExportStats
}) => {
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'time'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 10;

  // Calculate statistics
  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        bestScore: 0,
        bestTime: 0,
        currentStreak: 0,
        averageTime: 0,
        accuracy: 0
      };
    }

    const totalGames = sessions.length;
    const scores = sessions.map(s => (s.score / s.totalQuestions) * 100);
    const times = sessions.map(s => s.timeInSeconds);
    
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const bestTime = Math.min(...times);
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const session of sortedSessions) {
      const sessionScore = (session.score / session.totalQuestions) * 100;
      if (sessionScore >= 70) { // Consider 70% as a "good" score
        currentStreak++;
      } else {
        break;
      }
    }

    const accuracy = averageScore;

    return {
      totalGames,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      bestTime,
      currentStreak,
      averageTime: Math.round(averageTime),
      accuracy: Math.round(accuracy)
    };
  }, [sessions]);

  // Sort and paginate sessions
  const sortedSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'score':
          return (b.score / b.totalQuestions) - (a.score / a.totalQuestions);
        case 'time':
          return a.timeInSeconds - b.timeInSeconds;
        default:
          return 0;
      }
    });
    return sorted;
  }, [sessions, sortBy]);

  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * sessionsPerPage;
    return sortedSessions.slice(startIndex, startIndex + sessionsPerPage);
  }, [sortedSessions, currentPage]);

  const totalPages = Math.ceil(sortedSessions.length / sessionsPerPage);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) return 'text-dart-green';
    if (percentage >= 70) return 'text-dart-gold';
    return 'text-dart-red';
  };

  const getScoreBgColor = (score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) return 'bg-dart-green/10 border-dart-green/20';
    if (percentage >= 70) return 'bg-dart-gold/10 border-dart-gold/20';
    return 'bg-dart-red/10 border-dart-red/20';
  };

  const handleSessionDetailClick = (session: GameSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
    onSessionClick?.(session.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-4 border-dart-green/10 animate-pulse-slow"></div>
        <div className="absolute top-32 right-20 w-32 h-32 rounded-full border-2 border-dart-red/15 animate-bounce-slow delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full border-2 border-dart-gold/20 animate-pulse delay-700"></div>
        
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
            {/* Back Button & Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
              >
                <ChevronLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-200" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-dart-red via-dart-green to-dart-gold bg-clip-text text-transparent">
                  My Statistics
                </h1>
                <p className="text-slate-400 text-sm">Performance analytics and game history</p>
              </div>
            </div>

            {/* Export Options */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onExportStats}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-dart-green/20 hover:bg-dart-green/30 text-dart-green rounded-lg border border-dart-green/30 transition-all duration-200"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-dart-gold/20 hover:bg-dart-gold/30 text-dart-gold rounded-lg border border-dart-gold/30 transition-all duration-200">
                <ShareIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-dart-red/20 rounded-lg">
                <FireIconSolid className="w-6 h-6 text-dart-red" />
              </div>
              <span className="text-xs text-slate-400 uppercase tracking-wide">Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalGames}</p>
            <p className="text-sm text-slate-300">Games Played</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-dart-gold/20 rounded-lg">
                <StarIconSolid className="w-6 h-6 text-dart-gold" />
              </div>
              <span className="text-xs text-slate-400 uppercase tracking-wide">Average</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.averageScore}%</p>
            <p className="text-sm text-slate-300">Average Score</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-dart-green/20 rounded-lg">
                <ClockIcon className="w-6 h-6 text-dart-green" />
              </div>
              <span className="text-xs text-slate-400 uppercase tracking-wide">Best</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatTime(stats.bestTime)}</p>
            <p className="text-sm text-slate-300">Best Time</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-dart-red/20 rounded-lg">
                <BoltIcon className="w-6 h-6 text-dart-red" />
              </div>
              <span className="text-xs text-slate-400 uppercase tracking-wide">Current</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.currentStreak}</p>
            <p className="text-sm text-slate-300">Streak</p>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Performance Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <ChartBarIconSolid className="w-4 h-4" />
              <span>Last {Math.min(10, sessions.length)} games</span>
            </div>
          </div>
          <PerformanceChart sessions={sessions} maxSessions={10} />
        </div>

        {/* Session History */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Session History</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'time')}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-dart-green/50"
                >
                  <option value="date">Date</option>
                  <option value="score">Score</option>
                  <option value="time">Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="max-h-96 overflow-y-auto">
            {paginatedSessions.length === 0 ? (
              <div className="p-12 text-center">
                <TrophyIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-slate-400 mb-2">No Games Yet</h4>
                <p className="text-slate-500">Complete your first quiz to see statistics here!</p>
              </div>
            ) : (
              paginatedSessions.map((session) => (
                <div key={session.id} className="border-b border-white/5 last:border-b-0">
                  <div
                    className="p-4 hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg border ${getScoreBgColor(session.score, session.totalQuestions)}`}>
                          <span className={`font-bold ${getScoreColor(session.score, session.totalQuestions)}`}>
                            {Math.round((session.score / session.totalQuestions) * 100)}%
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-medium">
                              {session.score}/{session.totalQuestions}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-300 flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatTime(session.timeInSeconds)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">
                            {formatDate(session.date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">
                          Rank: {session.combinedScore}
                        </span>
                        {expandedSession === session.id ? (
                          <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Session Details */}
                  {expandedSession === session.id && (
                    <div className="px-4 pb-4 bg-white/5">
                      <div className="space-y-2">
                        <h5 className="font-medium text-white mb-3">Question Details:</h5>
                        {session.details.map((detail, index) => (
                          <div key={index} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {detail.isCorrect ? (
                                <CheckCircleIcon className="w-5 h-5 text-dart-green" />
                              ) : (
                                <XCircleIcon className="w-5 h-5 text-dart-red" />
                              )}
                              <span className="text-white">
                                Checkout {detail.checkout}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span>{formatTime(detail.timeSpent)}</span>
                              <button
                                className="text-dart-green hover:text-dart-green/80"
                                onClick={() => handleSessionDetailClick(session)}
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing {((currentPage - 1) * sessionsPerPage) + 1} to {Math.min(currentPage * sessionsPerPage, sortedSessions.length)} of {sortedSessions.length} sessions
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded border border-white/20 transition-colors duration-200"
                >
                  Previous
                </button>
                <span className="text-white px-3 py-1">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded border border-white/20 transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Stats Cards */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-bold text-white mb-4">Performance Insights</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Average Time per Game</span>
                <span className="text-white font-medium">{formatTime(stats.averageTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Best Score</span>
                <span className="text-dart-green font-medium">{stats.bestScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Overall Accuracy</span>
                <span className="text-dart-gold font-medium">{stats.accuracy}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-bold text-white mb-4">Achievements</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <TrophyIconSolid className="w-5 h-5 text-dart-gold" />
                <span className="text-slate-300">Quiz Champion</span>
                <span className="text-xs bg-dart-gold/20 text-dart-gold px-2 py-1 rounded-full">
                  {stats.totalGames >= 10 ? 'Unlocked' : `${Math.max(0, 10 - stats.totalGames)} more`}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FireIconSolid className="w-5 h-5 text-dart-red" />
                <span className="text-slate-300">Hot Streak</span>
                <span className="text-xs bg-dart-red/20 text-dart-red px-2 py-1 rounded-full">
                  {stats.currentStreak >= 5 ? 'Unlocked' : `${Math.max(0, 5 - stats.currentStreak)} more`}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <StarIconSolid className="w-5 h-5 text-dart-green" />
                <span className="text-slate-300">Perfect Score</span>
                <span className="text-xs bg-dart-green/20 text-dart-green px-2 py-1 rounded-full">
                  {stats.bestScore >= 100 ? 'Unlocked' : 'Not yet'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default StatisticsPage;