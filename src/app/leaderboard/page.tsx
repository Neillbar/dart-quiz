"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LeaderboardPage from '@/components/LeaderboardPage';
import { LeaderboardPlayer, TimePeriod } from '@/types';

export default function Leaderboard() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data - in a real app, this would come from authentication
  const currentUser = {
    name: 'Dart Player',
    email: 'player@example.com',
    picture: undefined
  };

  // Mock function to simulate fetching leaderboard data
  const fetchLeaderboardData = async (period: TimePeriod): Promise<LeaderboardPlayer[]> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in a real app, this would come from your backend API
    const mockPlayers: LeaderboardPlayer[] = [
      {
        id: '1',
        name: 'Magnus "Bullseye" Chen',
        picture: '/img/user1.jpg',
        combinedScore: 2950.5,
        bestScore: '10/10',
        bestTimeInSeconds: 45,
        accuracy: 98,
        totalGames: 127,
        rank: 1,
        previousRank: 2,
        isCurrentUser: false
      },
      {
        id: '2',
        name: 'Sarah "Lightning" Rodriguez',
        picture: '/img/user2.jpg',
        combinedScore: 2890.2,
        bestScore: '10/10',
        bestTimeInSeconds: 48,
        accuracy: 96,
        totalGames: 95,
        rank: 2,
        previousRank: 1,
        isCurrentUser: false
      },
      {
        id: '3',
        name: 'James "Precision" Wilson',
        picture: '/img/user3.jpg',
        combinedScore: 2820.8,
        bestScore: '9/10',
        bestTimeInSeconds: 52,
        accuracy: 94,
        totalGames: 203,
        rank: 3,
        previousRank: 3,
        isCurrentUser: false
      },
      {
        id: '4',
        name: currentUser.name,
        picture: currentUser.picture,
        combinedScore: 2750.3,
        bestScore: '9/10',
        bestTimeInSeconds: 58,
        accuracy: 92,
        totalGames: 78,
        rank: 4,
        previousRank: 5,
        isCurrentUser: true
      }
    ];

    // Add more players with varied data based on time period
    const additionalPlayers = Array.from({ length: 46 }, (_, i) => ({
      id: `${i + 5}`,
      name: `Player ${i + 5}`,
      combinedScore: 2700 - (i * 25) - Math.random() * 50,
      bestScore: Math.random() > 0.3 ? `${Math.floor(Math.random() * 3) + 7}/10` : `${Math.floor(Math.random() * 2) + 8}/10`,
      bestTimeInSeconds: 60 + Math.floor(Math.random() * 120),
      accuracy: 85 - Math.floor(Math.random() * 15),
      totalGames: Math.floor(Math.random() * 150) + 20,
      rank: i + 5,
      previousRank: i + 5 + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0),
      isCurrentUser: false
    }));

    setIsLoading(false);
    return [...mockPlayers, ...additionalPlayers];
  };

  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);

  useEffect(() => {
    fetchLeaderboardData(timePeriod).then(setPlayers);
  }, [timePeriod]);

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
  };

  const handleRefresh = async () => {
    const newData = await fetchLeaderboardData(timePeriod);
    setPlayers(newData);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const currentUserRank = players.find(p => p.isCurrentUser)?.rank || 0;

  return (
    <LeaderboardPage
      user={currentUser}
      players={players}
      currentUserRank={currentUserRank}
      timePeriod={timePeriod}
      onBack={handleBack}
      onTimePeriodChange={handleTimePeriodChange}
      onRefresh={handleRefresh}
    />
  );
}