"use client";

import React, { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserStats, UserStats } from '@/services/statsService';
import { getProxiedImageUrl } from '@/utils/imageUtils';

const DashboardPage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch user stats when user is available
    const fetchStats = async () => {
      if (user) {
        setLoadingStats(true);
        try {
          const userStats = await getUserStats(user.uid);
          setStats(userStats);
        } catch (error) {
          console.error('Error fetching stats:', error);
        } finally {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();
  }, [user]);

  const handleTakeQuiz = () => {
    router.push('/quiz');
  };

  const handleViewStats = () => {
    router.push('/stats');
  };

  const handleViewLeaderboard = () => {
    router.push('/leaderboard');
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  console.log('Firebase user photoURL:', user.photoURL);
  const proxiedPhotoURL = getProxiedImageUrl(user.photoURL);
  console.log('Proxied photo URL:', proxiedPhotoURL);
  
  const userData = {
    name: user.displayName || 'Dart Player',
    email: user.email || '',
    picture: proxiedPhotoURL
  };

  const displayStats = {
    totalGames: stats.totalGames,
    bestScore: stats.bestScore,
    averageScore: stats.averageScore,
    currentStreak: stats.currentStreak,
    favoriteFinish: stats.favoriteFinish,
    accuracy: stats.accuracy
  };

  return (
    <Dashboard
      user={userData}
      stats={displayStats}
      onTakeQuiz={handleTakeQuiz}
      onViewStats={handleViewStats}
      onViewLeaderboard={handleViewLeaderboard}
      onSignOut={handleSignOut}
    />
  );
};

export default DashboardPage;