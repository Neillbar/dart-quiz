export interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {};
}

// Dashboard Types
export interface User {
  name: string;
  email: string;
  picture?: string;
}

export interface UserStats {
  totalGames: number;
  bestScore: string;
  averageScore: string;
  currentStreak: number;
  favoriteFinish: string;
  accuracy: string;
  dailyStreak?: number;
  streakExpiresAt?: Date | null;
}

export interface DashboardProps {
  user?: User;
  stats?: UserStats;
  onTakeQuiz?: () => void;
  onViewStats?: () => void;
  onViewLeaderboard?: () => void;
  onSignOut?: () => void;
}

// Quiz Types
export interface DartCombination {
  multiplier: 1 | 2 | 3;
  value: number;
}

export interface QuizQuestion {
  id: number;
  checkout: number;
  dartCount: number;
  correctAnswer: DartCombination[];
}

export type KeyboardMode = 'numeric' | 'dart';
export type GameState = 'loading' | 'countdown' | 'playing' | 'finished';
export type Multiplier = 1 | 2 | 3;

// Statistics Types
export interface GameSession {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeInSeconds: number;
  combinedScore: number; // for leaderboard ranking
  details: SessionDetail[];
}

export interface SessionDetail {
  questionId: number;
  checkout: number;
  userAnswer: DartCombination[];
  correctAnswer: DartCombination[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface StatsPageProps {
  user?: User;
  sessions: GameSession[];
  onBack?: () => void;
  onSessionClick?: (sessionId: string) => void;
  onExportStats?: () => void;
}

// Leaderboard Types
export interface LeaderboardPlayer {
  id: string;
  name: string;
  picture?: string;
  combinedScore: number;
  bestScore: string;
  bestTimeInSeconds: number;
  accuracy: number;
  totalGames: number;
  rank: number;
  previousRank?: number;
  isCurrentUser?: boolean;
}

export type TimePeriod = 'all-time' | 'this-week' | 'today';

export interface LeaderboardProps {
  user?: User;
  players: LeaderboardPlayer[];
  currentUserRank?: number;
  timePeriod: TimePeriod;
  onBack?: () => void;
  onTimePeriodChange?: (period: TimePeriod) => void;
  onRefresh?: () => void;
}
