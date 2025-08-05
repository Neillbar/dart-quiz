"use client";

import React from 'react';
import { 
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { GameSession } from '@/types';

interface SessionDetailModalProps {
  session: GameSession | null;
  isOpen: boolean;
  onClose: () => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose
}) => {
  if (!isOpen || !session) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDartCombination = (darts: any[]) => {
    return darts.map(dart => {
      const multiplierText = dart.multiplier === 1 ? 'S' : dart.multiplier === 2 ? 'D' : 'T';
      return `${multiplierText}${dart.value}`;
    }).join(' + ');
  };

  const scorePercentage = Math.round((session.score / session.totalQuestions) * 100);
  const getScoreColor = () => {
    if (scorePercentage >= 90) return 'text-dart-green';
    if (scorePercentage >= 70) return 'text-dart-gold';
    return 'text-dart-red';
  };

  const getScoreBgColor = () => {
    if (scorePercentage >= 90) return 'bg-dart-green/10 border-dart-green/20';
    if (scorePercentage >= 70) return 'bg-dart-gold/10 border-dart-gold/20';
    return 'bg-dart-red/10 border-dart-red/20';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative bg-slate-800 border border-white/20 rounded-2xl max-w-4xl w-full mx-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Session Details</h2>
              <p className="text-slate-400 mt-1">{formatDate(session.date)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Session Summary */}
          <div className="p-6 border-b border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${getScoreBgColor()}`}>
                <div className="flex items-center justify-between mb-2">
                  <TrophyIcon className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Score</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor()}`}>
                  {session.score}/{session.totalQuestions}
                </div>
                <div className={`text-sm ${getScoreColor()}`}>
                  {scorePercentage}%
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <ClockIcon className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Time</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatTime(session.timeInSeconds)}
                </div>
                <div className="text-sm text-slate-400">
                  Total duration
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <ChartBarIcon className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Rank</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {session.combinedScore}
                </div>
                <div className="text-sm text-slate-400">
                  Combined score
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <ClockIcon className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Avg Time</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatTime(Math.round(session.timeInSeconds / session.totalQuestions))}
                </div>
                <div className="text-sm text-slate-400">
                  Per question
                </div>
              </div>
            </div>
          </div>

          {/* Question Details */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Question-by-Question Breakdown</h3>
            
            {session.details.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">Detailed question breakdown not available for this session.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {session.details.map((detail, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      detail.isCorrect 
                        ? 'bg-dart-green/5 border-dart-green/20 hover:bg-dart-green/10' 
                        : 'bg-dart-red/5 border-dart-red/20 hover:bg-dart-red/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {detail.isCorrect ? (
                            <CheckCircleIcon className="w-6 h-6 text-dart-green" />
                          ) : (
                            <XCircleIcon className="w-6 h-6 text-dart-red" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h4 className="text-white font-medium">
                              Question {index + 1}: Checkout {detail.checkout}
                            </h4>
                            <span className="text-sm text-slate-400 flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatTime(detail.timeSpent)}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-400 mb-1">Your Answer:</p>
                              <p className={`font-mono text-sm ${
                                detail.isCorrect ? 'text-dart-green' : 'text-dart-red'
                              }`}>
                                {formatDartCombination(detail.userAnswer)}
                              </p>
                            </div>
                            
                            {!detail.isCorrect && (
                              <div>
                                <p className="text-sm text-slate-400 mb-1">Correct Answer:</p>
                                <p className="font-mono text-sm text-dart-green">
                                  {formatDartCombination(detail.correctAnswer)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-dart-green/20 hover:bg-dart-green/30 text-dart-green rounded-lg border border-dart-green/30 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;