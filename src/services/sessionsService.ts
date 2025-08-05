import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface QuizAnswer {
  questionNumber: number;
  checkout: number;
  userInput: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  dartsRequired: number;
}

export interface QuizSession {
  id?: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  totalQuestions: number;
  correctAnswers: number;
  score: string; // e.g., "8/10"
  duration: number; // in seconds
  answers: QuizAnswer[];
  createdAt: Date;
}

export const saveQuizSession = async (session: Omit<QuizSession, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const sessionsRef = collection(db, 'quizSessions');
    const sessionId = `${session.userId}_${Date.now()}`;
    const sessionDoc = doc(sessionsRef, sessionId);
    
    await setDoc(sessionDoc, {
      ...session,
      createdAt: Timestamp.now(),
      startTime: Timestamp.fromDate(session.startTime),
      endTime: Timestamp.fromDate(session.endTime)
    });
    
    return sessionId;
  } catch (error) {
    console.error('Error saving quiz session:', error);
    throw error;
  }
};

export const getUserSessions = async (userId: string, limitCount: number = 50): Promise<QuizSession[]> => {
  try {
    const sessionsRef = collection(db, 'quizSessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const sessions: QuizSession[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        userId: data.userId,
        startTime: data.startTime.toDate(),
        endTime: data.endTime.toDate(),
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        score: data.score,
        duration: data.duration,
        answers: data.answers,
        createdAt: data.createdAt.toDate()
      });
    });
    
    return sessions;
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }
};

export const formatDartValue = (value: number): string => {
  // Special cases
  if (value === 50) return 'Bull';
  if (value === 25) return 'Outer Bull';
  
  // Check if it's a double (even numbers 2-40, excluding 50)
  if (value >= 2 && value <= 40 && value % 2 === 0) {
    return `D${value / 2}`;
  }
  
  // Check if it's a triple (multiples of 3 from 3-60)
  if (value >= 3 && value <= 60 && value % 3 === 0 && value / 3 <= 20) {
    return `T${value / 3}`;
  }
  
  // Otherwise it's a single
  return value.toString();
};

export const formatAnswerArray = (values: number[]): string => {
  return values.map(formatDartValue).join(', ');
};