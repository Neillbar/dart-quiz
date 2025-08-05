"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import StatisticsPage from '@/components/StatisticsPage';
import { GameSession, SessionDetail } from '@/types';

// Mock data for demonstration
const mockSessions: GameSession[] = [
  {
    id: '1',
    date: '2024-08-05T14:30:00Z',
    score: 9,
    totalQuestions: 10,
    timeInSeconds: 185,
    combinedScore: 94,
    details: [
      {
        questionId: 1,
        checkout: 170,
        userAnswer: [{ multiplier: 3, value: 20 }, { multiplier: 3, value: 20 }, { multiplier: 2, value: 25 }],
        correctAnswer: [{ multiplier: 3, value: 20 }, { multiplier: 3, value: 20 }, { multiplier: 2, value: 25 }],
        isCorrect: true,
        timeSpent: 15
      },
      {
        questionId: 2,
        checkout: 120,
        userAnswer: [{ multiplier: 1, value: 20 }, { multiplier: 2, value: 20 }, { multiplier: 2, value: 20 }],
        correctAnswer: [{ multiplier: 1, value: 20 }, { multiplier: 2, value: 20 }, { multiplier: 2, value: 20 }],
        isCorrect: true,
        timeSpent: 12
      },
      {
        questionId: 3,
        checkout: 64,
        userAnswer: [{ multiplier: 1, value: 16 }, { multiplier: 2, value: 16 }, { multiplier: 1, value: 16 }],
        correctAnswer: [{ multiplier: 1, value: 16 }, { multiplier: 1, value: 16 }, { multiplier: 2, value: 16 }],
        isCorrect: false,
        timeSpent: 25
      }
      // Add more mock details as needed
    ]
  },
  {
    id: '2',
    date: '2024-08-04T16:45:00Z',
    score: 7,
    totalQuestions: 10,
    timeInSeconds: 220,
    combinedScore: 78,
    details: [
      {
        questionId: 1,
        checkout: 90,
        userAnswer: [{ multiplier: 1, value: 18 }, { multiplier: 1, value: 18 }, { multiplier: 2, value: 18 }],
        correctAnswer: [{ multiplier: 1, value: 18 }, { multiplier: 1, value: 18 }, { multiplier: 2, value: 18 }],
        isCorrect: true,
        timeSpent: 18
      }
      // More mock details...
    ]
  },
  {
    id: '3',
    date: '2024-08-03T10:15:00Z',
    score: 8,
    totalQuestions: 10,
    timeInSeconds: 195,
    combinedScore: 85,
    details: []
  },
  {
    id: '4',
    date: '2024-08-02T19:30:00Z',
    score: 6,
    totalQuestions: 10,
    timeInSeconds: 250,
    combinedScore: 65,
    details: []
  },
  {
    id: '5',
    date: '2024-08-01T13:20:00Z',
    score: 10,
    totalQuestions: 10,
    timeInSeconds: 165,
    combinedScore: 100,
    details: []
  }
];

const StatisticsPageWrapper: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleSessionClick = (sessionId: string) => {
    console.log('Viewing session details:', sessionId);
    // Navigate to detailed session view or show modal
  };

  const handleExportStats = () => {
    console.log('Exporting statistics...');
    // Implement export functionality
    const statsData = {
      user: { name: 'Dart Player', email: 'player@example.com' },
      sessions: mockSessions,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(statsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dart_quiz_stats_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <StatisticsPage
      user={{ name: 'Dart Player', email: 'player@example.com' }}
      sessions={mockSessions}
      onBack={handleBack}
      onSessionClick={handleSessionClick}
      onExportStats={handleExportStats}
    />
  );
};

export default StatisticsPageWrapper;