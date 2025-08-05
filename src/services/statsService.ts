import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper function to check if two dates are on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Helper function to check if date is yesterday
const isYesterday = (date: Date, compareDate: Date): boolean => {
  const yesterday = new Date(compareDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

// Helper function to calculate when streak expires (24 hours from last play)
const calculateStreakExpiry = (lastPlayDate: Date): Date => {
  const expiry = new Date(lastPlayDate);
  expiry.setHours(23, 59, 59, 999); // End of day
  expiry.setDate(expiry.getDate() + 1); // Next day end
  return expiry;
};

export interface UserStats {
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: string;
  averageScore: string;
  currentStreak: number;
  bestStreak: number;
  favoriteFinish: string;
  accuracy: string;
  lastPlayed: Date;
  // Daily streak fields
  dailyStreak: number;
  bestDailyStreak: number;
  lastDailyPlayDate: string | null; // ISO date string for consistency
  streakExpiresAt: Date | null;
}

export const getDefaultStats = (): UserStats => ({
  totalGames: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  bestScore: '0/0',
  averageScore: '0.0/10',
  currentStreak: 0,
  bestStreak: 0,
  favoriteFinish: 'None',
  accuracy: '0%',
  lastPlayed: new Date(),
  dailyStreak: 0,
  bestDailyStreak: 0,
  lastDailyPlayDate: null,
  streakExpiresAt: null
});

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    const statsDoc = await getDoc(userStatsRef);
    
    if (statsDoc.exists()) {
      const data = statsDoc.data();
      // Convert Firestore Timestamp to Date for streakExpiresAt
      if (data.streakExpiresAt && data.streakExpiresAt.toDate) {
        data.streakExpiresAt = data.streakExpiresAt.toDate();
      }
      if (data.lastPlayed && data.lastPlayed.toDate) {
        data.lastPlayed = data.lastPlayed.toDate();
      }
      
      // Ensure daily streak fields exist (for users with old data structure)
      const stats: UserStats = {
        ...getDefaultStats(),
        ...data,
        dailyStreak: data.dailyStreak ?? 0,
        bestDailyStreak: data.bestDailyStreak ?? 0,
        lastDailyPlayDate: data.lastDailyPlayDate ?? null,
        streakExpiresAt: data.streakExpiresAt ?? null
      };
      
      return stats;
    } else {
      // Create default stats for new user
      const defaultStats = getDefaultStats();
      await setDoc(userStatsRef, defaultStats);
      return defaultStats;
    }
  } catch (error) {
    return getDefaultStats();
  }
};

export const updateUserStats = async (
  userId: string, 
  gameScore: number, 
  totalQuestions: number,
  finishCounts: Record<string, number> = {}
): Promise<void> => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    const currentStats = await getUserStats(userId);
    
    // Calculate new values
    const newTotalGames = currentStats.totalGames + 1;
    const newTotalCorrect = currentStats.totalCorrect + gameScore;
    const newTotalQuestions = currentStats.totalQuestions + totalQuestions;
    const newAverageScore = (newTotalCorrect / newTotalQuestions * 10).toFixed(1);
    const newAccuracy = Math.round((newTotalCorrect / newTotalQuestions) * 100);
    
    // Update best score
    const currentBestScore = parseInt(currentStats.bestScore.split('/')[0]) || 0;
    const newBestScore = gameScore > currentBestScore ? `${gameScore}/${totalQuestions}` : currentStats.bestScore;
    
    // Update perfect score streaks
    const isPerfectScore = gameScore === totalQuestions;
    const newCurrentStreak = isPerfectScore ? currentStats.currentStreak + 1 : 0;
    const newBestStreak = Math.max(newCurrentStreak, currentStats.bestStreak);
    
    // Update daily streaks
    const now = new Date();
    let newDailyStreak = currentStats.dailyStreak || 0;
    let newBestDailyStreak = currentStats.bestDailyStreak || 0;
    
    
    if (currentStats.lastDailyPlayDate) {
      const lastPlayDate = new Date(currentStats.lastDailyPlayDate);
      
      if (isSameDay(lastPlayDate, now)) {
        // Already played today, maintain streak
        newDailyStreak = currentStats.dailyStreak || 0;
      } else if (isYesterday(lastPlayDate, now)) {
        // Played yesterday, increment streak
        newDailyStreak = (currentStats.dailyStreak || 0) + 1;
      } else {
        // Streak broken, start new streak
        newDailyStreak = 1;
      }
    } else {
      // First time playing
      newDailyStreak = 1;
    }
    
    // Update best daily streak
    newBestDailyStreak = Math.max(newDailyStreak, currentStats.bestDailyStreak);
    
    // Calculate when streak expires
    const streakExpiresAt = calculateStreakExpiry(now);
    
    // Find favorite finish (most used double)
    let favoriteFinish = currentStats.favoriteFinish;
    if (Object.keys(finishCounts).length > 0) {
      // This would need to be tracked across games for accuracy
      // For now, we'll keep the existing favorite
    }
    
    // Update the stats
    await updateDoc(userStatsRef, {
      totalGames: newTotalGames,
      totalCorrect: newTotalCorrect,
      totalQuestions: newTotalQuestions,
      bestScore: newBestScore,
      averageScore: `${newAverageScore}/10`,
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      accuracy: `${newAccuracy}%`,
      lastPlayed: new Date(),
      dailyStreak: newDailyStreak,
      bestDailyStreak: newBestDailyStreak,
      lastDailyPlayDate: now.toISOString().split('T')[0], // Store as YYYY-MM-DD
      streakExpiresAt: streakExpiresAt
    });
  } catch (error) {
  }
};

// Check if daily streak is still active
export const checkDailyStreak = async (userId: string): Promise<UserStats> => {
  try {
    const userStats = await getUserStats(userId);
    const now = new Date();
    
    // If no last play date, streak is 0
    if (!userStats.lastDailyPlayDate) {
      return userStats;
    }
    
    const lastPlayDate = new Date(userStats.lastDailyPlayDate);
    
    // If last played was not today or yesterday, reset streak
    if (!isSameDay(lastPlayDate, now) && !isYesterday(lastPlayDate, now)) {
      const userStatsRef = doc(db, 'userStats', userId);
      await updateDoc(userStatsRef, {
        dailyStreak: 0,
        streakExpiresAt: null
      });
      
      return {
        ...userStats,
        dailyStreak: 0,
        streakExpiresAt: null
      };
    }
    
    // If the streak is active but streakExpiresAt is not set, calculate it
    if (userStats.dailyStreak > 0 && !userStats.streakExpiresAt) {
      const expiresAt = calculateStreakExpiry(lastPlayDate);
      const userStatsRef = doc(db, 'userStats', userId);
      await updateDoc(userStatsRef, {
        streakExpiresAt: expiresAt
      });
      
      return {
        ...userStats,
        streakExpiresAt: expiresAt
      };
    }
    
    return userStats;
  } catch (error) {
    return getDefaultStats();
  }
};

// Initialize user profile if it doesn't exist
export const initializeUserProfile = async (userId: string, displayName: string | null, email: string | null, photoURL?: string | null): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        displayName: displayName || 'Dart Player',
        email: email || '',
        photoURL: photoURL || null,
        createdAt: new Date(),
        lastLogin: new Date()
      });
    } else {
      // Update last login and check for profile changes
      const existingData = userDoc.data();
      const updates: any = {
        lastLogin: new Date()
      };
      
      // Update photo URL if it has changed or is missing
      if (photoURL !== existingData.photoURL) {
        updates.photoURL = photoURL || null;
      }
      
      // Update display name if it has changed
      if (displayName && displayName !== existingData.displayName) {
        updates.displayName = displayName;
      }
      
      // Update email if it has changed
      if (email && email !== existingData.email) {
        updates.email = email;
      }
      
      await updateDoc(userRef, updates);
    }
  } catch (error) {
  }
};