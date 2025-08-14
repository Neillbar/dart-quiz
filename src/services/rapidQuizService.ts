import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';

export interface RapidQuizScore {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  bestStreak: number;
  timestamp: Date;
}

export interface RapidQuizLeaderboardEntry {
  userId: string;
  userName: string;
  userEmail: string;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  timestamp: Date;
}

// Save a rapid quiz score
export async function saveRapidQuizScore(userId: string, scoreData: RapidQuizScore) {
  try {
    // Get user data for leaderboard
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    // Save to user's rapid quiz scores subcollection
    const scoreRef = doc(collection(db, 'users', userId, 'rapidQuizScores'));
    await setDoc(scoreRef, {
      ...scoreData,
      timestamp: serverTimestamp()
    });
    
    // Update user's high score if this is a new record
    const userHighScoreRef = doc(db, 'users', userId);
    const currentHighScore = userData?.rapidQuizHighScore || 0;
    
    if (scoreData.score > currentHighScore) {
      await updateDoc(userHighScoreRef, {
        rapidQuizHighScore: scoreData.score,
        rapidQuizHighScoreDate: serverTimestamp()
      });
      
      // Add to global leaderboard
      const leaderboardRef = doc(collection(db, 'rapidQuizLeaderboard'));
      await setDoc(leaderboardRef, {
        userId,
        userName: userData?.displayName || userData?.name || 'Anonymous',
        userEmail: userData?.email || '',
        score: scoreData.score,
        questionsAnswered: scoreData.questionsAnswered,
        correctAnswers: scoreData.correctAnswers,
        accuracy: scoreData.questionsAnswered > 0 
          ? Math.round((scoreData.correctAnswers / scoreData.questionsAnswered) * 100)
          : 0,
        timestamp: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error saving rapid quiz score:', error);
    throw error;
  }
}

// Get user's rapid quiz high score
export async function getRapidQuizHighScore(userId: string): Promise<number> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    return userData?.rapidQuizHighScore || 0;
  } catch (error) {
    console.error('Error getting rapid quiz high score:', error);
    return 0;
  }
}

// Get rapid quiz leaderboard
export async function getRapidQuizLeaderboard(limitCount: number = 100): Promise<RapidQuizLeaderboardEntry[]> {
  try {
    const leaderboardQuery = query(
      collection(db, 'rapidQuizLeaderboard'),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(leaderboardQuery);
    const leaderboard: RapidQuizLeaderboardEntry[] = [];
    
    // Create a map to store only the highest score per user
    const userHighScores = new Map<string, RapidQuizLeaderboardEntry>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const entry: RapidQuizLeaderboardEntry = {
        userId: data.userId,
        userName: data.userName || 'Anonymous',
        userEmail: data.userEmail || '',
        score: data.score || 0,
        questionsAnswered: data.questionsAnswered || 0,
        correctAnswers: data.correctAnswers || 0,
        accuracy: data.accuracy || 0,
        timestamp: data.timestamp?.toDate() || new Date()
      };
      
      // Only keep the highest score for each user
      const existingEntry = userHighScores.get(entry.userId);
      if (!existingEntry || entry.score > existingEntry.score) {
        userHighScores.set(entry.userId, entry);
      }
    });
    
    // Convert map to array and sort by score
    return Array.from(userHighScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting rapid quiz leaderboard:', error);
    return [];
  }
}

// Get user's rapid quiz history
export async function getUserRapidQuizHistory(userId: string, limitCount: number = 10): Promise<RapidQuizScore[]> {
  try {
    const historyQuery = query(
      collection(db, 'users', userId, 'rapidQuizScores'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(historyQuery);
    const history: RapidQuizScore[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        score: data.score || 0,
        questionsAnswered: data.questionsAnswered || 0,
        correctAnswers: data.correctAnswers || 0,
        wrongAnswers: data.wrongAnswers || 0,
        bestStreak: data.bestStreak || 0,
        timestamp: data.timestamp?.toDate() || new Date()
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error getting user rapid quiz history:', error);
    return [];
  }
}