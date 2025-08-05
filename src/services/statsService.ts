import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  lastPlayed: new Date()
});

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const userStatsRef = doc(db, 'userStats', userId);
    const statsDoc = await getDoc(userStatsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data() as UserStats;
    } else {
      // Create default stats for new user
      const defaultStats = getDefaultStats();
      await setDoc(userStatsRef, defaultStats);
      return defaultStats;
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
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
    
    // Update streaks
    const isPerfectScore = gameScore === totalQuestions;
    const newCurrentStreak = isPerfectScore ? currentStats.currentStreak + 1 : 0;
    const newBestStreak = Math.max(newCurrentStreak, currentStats.bestStreak);
    
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
      lastPlayed: new Date()
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
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
        console.log('Updating user photoURL from', existingData.photoURL, 'to', photoURL);
      }
      
      // Update display name if it has changed
      if (displayName && displayName !== existingData.displayName) {
        updates.displayName = displayName;
        console.log('Updating user displayName from', existingData.displayName, 'to', displayName);
      }
      
      // Update email if it has changed
      if (email && email !== existingData.email) {
        updates.email = email;
      }
      
      await updateDoc(userRef, updates);
    }
  } catch (error) {
    console.error('Error initializing user profile:', error);
  }
};