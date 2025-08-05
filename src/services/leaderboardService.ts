import { collection, getDocs, getDoc, doc, updateDoc, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LeaderboardPlayer, TimePeriod } from '@/types';
import { getProxiedImageUrl } from '@/utils/imageUtils';

export interface FirebaseUserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface FirebaseUserStats {
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: string;
  averageScore: string;
  currentStreak: number;
  bestStreak: number;
  favoriteFinish: string;
  accuracy: string;
  lastPlayed: Date | any; // Can be Date or Firestore timestamp
  bestTimeInSeconds?: number;
}

// Calculate combined score based on accuracy and games played
const calculateCombinedScore = (stats: FirebaseUserStats): number => {
  const accuracy = parseFloat(stats.accuracy.replace('%', '')) || 0;
  const gamesPlayed = stats.totalGames || 0;
  const bestScoreNum = parseInt(stats.bestScore.split('/')[0]) || 0;
  const bestScoreTotal = parseInt(stats.bestScore.split('/')[1]) || 10;
  const bestScorePercentage = (bestScoreNum / bestScoreTotal) * 100;
  
  // Weight: 60% accuracy, 20% games played (log scale), 20% best score
  const accuracyScore = accuracy * 0.6;
  const gamesScore = Math.min(Math.log(gamesPlayed + 1) * 10, 20); // Cap at 20
  const bestScore = bestScorePercentage * 0.2;
  
  return accuracyScore + gamesScore + bestScore;
};

// Get date filter based on time period
const getDateFilter = (timePeriod: TimePeriod): Date => {
  const now = new Date();
  switch (timePeriod) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'this-week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case 'all-time':
    default:
      return new Date(0); // Beginning of time
  }
};

export const getLeaderboard = async (
  timePeriod: TimePeriod = 'all-time',
  currentUserId?: string
): Promise<{ players: LeaderboardPlayer[], currentUserRank: number }> => {
  try {
    
    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    
    const dateFilter = getDateFilter(timePeriod);
    const players: LeaderboardPlayer[] = [];
    
    // Fetch stats for each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data() as FirebaseUserProfile;
      
      if (userId === currentUserId) {
      }
      
      // Get user stats directly by document ID
      const statsDocRef = doc(db, 'userStats', userId);
      const statsDoc = await getDoc(statsDocRef);
      
      if (statsDoc.exists()) {
        const stats = statsDoc.data() as FirebaseUserStats;
        
        if (userId === currentUserId) {
        }
        
        // Filter by time period
        let lastPlayedDate: Date;
        if (stats.lastPlayed) {
          if (stats.lastPlayed instanceof Timestamp) {
            lastPlayedDate = stats.lastPlayed.toDate();
          } else if (stats.lastPlayed.seconds) {
            // Handle Firestore timestamp format
            lastPlayedDate = new Date(stats.lastPlayed.seconds * 1000);
          } else {
            lastPlayedDate = new Date(stats.lastPlayed);
          }
          
          if (userId === currentUserId) {
          }
          
          if (lastPlayedDate >= dateFilter && stats.totalGames > 0) {
            const combinedScore = calculateCombinedScore(stats);
            
            players.push({
            id: userId,
            name: userData.displayName || 'Anonymous Player',
            picture: getProxiedImageUrl(userData.photoURL),
            combinedScore,
            bestScore: stats.bestScore,
            bestTimeInSeconds: stats.bestTimeInSeconds || 0,
            accuracy: parseFloat(stats.accuracy.replace('%', '')) || 0,
            totalGames: stats.totalGames,
            rank: 0, // Will be set after sorting
            previousRank: 0, // Would need historical data
            isCurrentUser: userId === currentUserId
            });
          }
        }
      } else {
        if (userId === currentUserId) {
        }
      }
    }
    
    // Sort by combined score (descending)
    players.sort((a, b) => b.combinedScore - a.combinedScore);
    
    // Assign ranks
    players.forEach((player, index) => {
      player.rank = index + 1;
    });
    
    // Find current user rank
    const currentUserRank = players.findIndex(p => p.isCurrentUser) + 1;
    
    if (currentUserId && currentUserRank === 0) {
    }
    
    return { players, currentUserRank };
  } catch (error) {
    return { players: [], currentUserRank: 0 };
  }
};

// Get top players for dashboard display
export const getTopPlayers = async (topN: number = 3): Promise<LeaderboardPlayer[]> => {
  const { players } = await getLeaderboard('all-time');
  return players.slice(0, topN);
};

// Update user's best time if it's better
export const updateBestTime = async (userId: string, timeInSeconds: number): Promise<void> => {
  try {
    const statsDocRef = doc(db, 'userStats', userId);
    const statsDoc = await getDoc(statsDocRef);
    
    if (statsDoc.exists()) {
      const currentStats = statsDoc.data() as FirebaseUserStats;
      const currentBestTime = currentStats.bestTimeInSeconds || Infinity;
      
      if (timeInSeconds < currentBestTime) {
        await updateDoc(statsDocRef, {
          bestTimeInSeconds: timeInSeconds
        });
      }
    }
  } catch (error) {
  }
};