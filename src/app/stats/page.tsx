"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserSessions, QuizSession, formatAnswerArray } from '@/services/sessionsService';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function StatsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (user) {
        setLoadingSessions(true);
        try {
          const userSessions = await getUserSessions(user.uid);
          setSessions(userSessions);
        } catch (error) {
        } finally {
          setLoadingSessions(false);
        }
      }
    };

    fetchSessions();
  }, [user]);

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || loadingSessions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-4"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">My Statistics</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No quiz sessions yet. Start playing to see your statistics!</p>
            <button
              onClick={() => router.push('/quiz')}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/80 mb-6">Total Sessions: {sessions.length}</p>
            
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden"
              >
                {/* Session Header */}
                <button
                  onClick={() => toggleSession(session.id!)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-4">
                      <span className="text-white font-semibold">
                        {formatDate(session.startTime)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.correctAnswers === session.totalQuestions
                          ? 'bg-green-500/20 text-green-400'
                          : session.correctAnswers >= session.totalQuestions * 0.7
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {session.score}
                      </span>
                      <span className="text-white/60 text-sm">
                        Duration: {formatDuration(session.duration)}
                      </span>
                    </div>
                  </div>
                  {expandedSessions.has(session.id!) ? (
                    <ChevronUpIcon className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-white/60" />
                  )}
                </button>

                {/* Session Details */}
                {expandedSessions.has(session.id!) && (
                  <div className="px-6 pb-4 border-t border-white/10">
                    <div className="mt-4 space-y-3">
                      {session.answers.map((answer, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            answer.isCorrect
                              ? 'bg-green-500/10 border border-green-500/30'
                              : 'bg-red-500/10 border border-red-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">
                              Question {answer.questionNumber}: Checkout {answer.checkout}
                            </span>
                            <span className={`text-sm ${
                              answer.isCorrect ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="text-white/80">
                              <span className="text-white/60">Your answer: </span>
                              {answer.userInput.join(', ') || 'No answer'}
                            </div>
                            <div className="text-white/80">
                              <span className="text-white/60">Correct answer: </span>
                              {formatAnswerArray(answer.correctAnswer.map(Number))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}