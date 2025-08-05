import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  QUIZZES: 'quizzes',
  STATISTICS: 'statistics',
  LEADERBOARD: 'leaderboard'
} as const;

// User Interface
export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  totalGames?: number;
  bestScore?: number;
  currentStreak?: number;
}

// Quiz Interface
export interface DartValue {
  value: number;
  type: string; // e.g., "T20", "S20", "D20"
  display: string; // e.g., "Triple 20", "Single 20", "Double 20"
}

export interface Quiz {
  id?: string;
  checkoutTotal: number;
  dartCount: number;
  solution: DartValue[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Statistics Interface
export interface QuizAnswer {
  questionId: string;
  userAnswer: DartValue[];
  isCorrect: boolean;
  timeSpent: number; // seconds
}

export interface Statistics {
  id?: string;
  userId: string;
  score: number; // out of 10
  timeElapsed: number; // total seconds
  answers: QuizAnswer[];
  completedAt: Timestamp;
  accuracy: number; // percentage
  combinedScore: number; // for leaderboard
}

// Leaderboard Interface
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  combinedScore: number;
  bestScore: number;
  bestTime: number;
  totalGames: number;
  accuracy: number;
  rank?: number;
  previousRank?: number;
  updatedAt: Timestamp;
}

// User Operations
export const createUser = async (user: FirebaseUser) => {
  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  await setDoc(userRef, {
    ...user,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    totalGames: 0,
    bestScore: 0,
    currentStreak: 0
  });
};

export const updateUserLogin = async (uid: string) => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(userRef, {
    lastLogin: serverTimestamp()
  });
};

export const getUser = async (uid: string): Promise<FirebaseUser | null> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as FirebaseUser;
  }
  return null;
};

// Quiz Operations
export const getRandomQuizzes = async (count: number = 10): Promise<Quiz[]> => {
  const quizzesRef = collection(db, COLLECTIONS.QUIZZES);
  const q = query(quizzesRef);
  const snapshot = await getDocs(q);
  
  const allQuizzes: Quiz[] = [];
  snapshot.forEach((doc) => {
    allQuizzes.push({ id: doc.id, ...doc.data() } as Quiz);
  });
  
  // Shuffle and return requested count
  const shuffled = allQuizzes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Statistics Operations
export const saveQuizResult = async (stats: Omit<Statistics, 'id'>) => {
  const statsRef = collection(db, COLLECTIONS.STATISTICS);
  const docRef = await addDoc(statsRef, {
    ...stats,
    completedAt: serverTimestamp()
  });
  
  // Update user stats
  await updateUserStats(stats.userId, stats.score, stats.timeElapsed);
  
  // Update leaderboard
  await updateLeaderboard(stats.userId, stats.combinedScore);
  
  return docRef.id;
};

export const getUserStatistics = async (userId: string): Promise<Statistics[]> => {
  const statsRef = collection(db, COLLECTIONS.STATISTICS);
  const q = query(
    statsRef, 
    where('userId', '==', userId),
    orderBy('completedAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const stats: Statistics[] = [];
  
  snapshot.forEach((doc) => {
    stats.push({ id: doc.id, ...doc.data() } as Statistics);
  });
  
  return stats;
};

// Update user aggregate stats
const updateUserStats = async (userId: string, score: number, time: number) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data() as FirebaseUser;
    const updates: any = {
      totalGames: (userData.totalGames || 0) + 1,
      lastLogin: serverTimestamp()
    };
    
    if (score > (userData.bestScore || 0)) {
      updates.bestScore = score;
    }
    
    // Update streak logic
    if (score >= 8) { // 80% or better maintains streak
      updates.currentStreak = (userData.currentStreak || 0) + 1;
    } else {
      updates.currentStreak = 0;
    }
    
    await updateDoc(userRef, updates);
  }
};

// Leaderboard Operations
export const updateLeaderboard = async (userId: string, combinedScore: number) => {
  const userDoc = await getUser(userId);
  if (!userDoc) return;
  
  const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARD, userId);
  const leaderboardSnap = await getDoc(leaderboardRef);
  
  const stats = await getUserStatistics(userId);
  const bestScore = Math.max(...stats.map(s => s.score));
  const bestTime = Math.min(...stats.filter(s => s.score === bestScore).map(s => s.timeElapsed));
  const totalGames = stats.length;
  const avgAccuracy = stats.reduce((acc, s) => acc + s.accuracy, 0) / totalGames;
  
  const leaderboardData: Omit<LeaderboardEntry, 'rank' | 'previousRank'> = {
    userId,
    displayName: userDoc.displayName,
    photoURL: userDoc.photoURL,
    combinedScore,
    bestScore,
    bestTime,
    totalGames,
    accuracy: avgAccuracy,
    updatedAt: serverTimestamp() as Timestamp
  };
  
  if (leaderboardSnap.exists()) {
    const currentData = leaderboardSnap.data() as LeaderboardEntry;
    if (combinedScore > currentData.combinedScore) {
      await updateDoc(leaderboardRef, leaderboardData);
    }
  } else {
    await setDoc(leaderboardRef, leaderboardData);
  }
};

export const getLeaderboard = async (
  timeFilter: 'all' | 'week' | 'today' = 'all',
  limitCount: number = 100
): Promise<LeaderboardEntry[]> => {
  const leaderboardRef = collection(db, COLLECTIONS.LEADERBOARD);
  let q;
  
  if (timeFilter !== 'all') {
    const now = new Date();
    let startDate;
    
    if (timeFilter === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else { // week
      startDate = new Date(now.setDate(now.getDate() - 7));
    }
    
    q = query(
      leaderboardRef,
      where('updatedAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('updatedAt', 'desc'),
      orderBy('combinedScore', 'desc'),
      limit(limitCount)
    );
  } else {
    q = query(
      leaderboardRef,
      orderBy('combinedScore', 'desc'),
      limit(limitCount)
    );
  }
  
  const snapshot = await getDocs(q);
  const entries: LeaderboardEntry[] = [];
  
  snapshot.docs.forEach((doc, index) => {
    entries.push({
      ...doc.data() as LeaderboardEntry,
      rank: index + 1
    });
  });
  
  return entries;
};

// Sample quiz data seeder (for initial setup)
export const seedQuizData = async () => {
  const sampleQuizzes: Omit<Quiz, 'id'>[] = [
    // Easy checkouts (2 darts)
    {
      checkoutTotal: 32,
      dartCount: 2,
      solution: [
        { value: 16, type: "S16", display: "Single 16" },
        { value: 16, type: "D8", display: "Double 8" }
      ],
      difficulty: 'easy'
    },
    {
      checkoutTotal: 40,
      dartCount: 2,
      solution: [
        { value: 20, type: "S20", display: "Single 20" },
        { value: 20, type: "D10", display: "Double 10" }
      ],
      difficulty: 'easy'
    },
    // Medium checkouts (3 darts)
    {
      checkoutTotal: 120,
      dartCount: 3,
      solution: [
        { value: 60, type: "T20", display: "Triple 20" },
        { value: 20, type: "S20", display: "Single 20" },
        { value: 40, type: "D20", display: "Double 20" }
      ],
      difficulty: 'medium'
    },
    {
      checkoutTotal: 141,
      dartCount: 3,
      solution: [
        { value: 60, type: "T20", display: "Triple 20" },
        { value: 57, type: "T19", display: "Triple 19" },
        { value: 24, type: "D12", display: "Double 12" }
      ],
      difficulty: 'hard'
    },
    // Add more quiz variations...
  ];
  
  const quizzesRef = collection(db, COLLECTIONS.QUIZZES);
  for (const quiz of sampleQuizzes) {
    await addDoc(quizzesRef, quiz);
  }
};