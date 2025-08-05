import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export interface QuizOption {
  id: number;
  name: string;
  darts: number;
  values: number[];
  isNoOutshot?: boolean;
  createdAt?: Date;
}

export async function fetchQuizOptions(): Promise<QuizOption[]> {
  try {
    const quizCollection = collection(db, 'dartQuizOptions');
    // Try without orderBy first to see if that's the issue
    const querySnapshot = await getDocs(quizCollection);
    
    console.log('Quiz collection size:', querySnapshot.size);
    console.log('Collection path:', quizCollection.path);
    
    const quizOptions: QuizOption[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Quiz doc:', doc.id, data);
      // Ensure name is a string
      const name = String(data.name || doc.id || '');
      console.log('Processed name for doc', doc.id, ':', name);
      
      quizOptions.push({
        id: parseInt(doc.id) || 0,
        name: name,
        darts: data.darts || 0,
        values: data.values || [],
        isNoOutshot: data.isNoOutshot || false,
        createdAt: data.createdAt?.toDate()
      });
    });
    
    // Sort by id after fetching
    quizOptions.sort((a, b) => a.id - b.id);
    
    console.log('Total quiz options fetched:', quizOptions.length);
    return quizOptions;
  } catch (error) {
    console.error('Error fetching quiz options:', error);
    throw error;
  }
}

export async function getRandomQuizQuestions(count: number = 10): Promise<QuizOption[]> {
  const allOptions = await fetchQuizOptions();
  
  console.log('All options:', allOptions.length);
  
  if (allOptions.length === 0) {
    console.error('No quiz options found in database');
    return [];
  }
  
  // Filter out NO OUTSHOT options for regular questions
  const validOptions = allOptions.filter(option => !option.isNoOutshot && option.darts > 0);
  
  // Also include some NO OUTSHOT questions
  const noOutshotOptions = allOptions.filter(option => option.isNoOutshot || option.darts === 0);
  
  console.log('Valid options:', validOptions.length, 'NO OUTSHOT options:', noOutshotOptions.length);
  
  if (validOptions.length === 0) {
    console.error('No valid quiz options found');
    return [];
  }
  
  // Calculate how many NO OUTSHOT questions to include (roughly 10-20% of total)
  const noOutshotCount = noOutshotOptions.length > 0 ? Math.max(1, Math.floor(count * 0.15)) : 0;
  const regularCount = count - noOutshotCount;
  
  // Shuffle and select regular questions
  const shuffled = [...validOptions].sort(() => Math.random() - 0.5);
  const selectedValid = shuffled.slice(0, Math.min(regularCount, validOptions.length));
  
  // Select random NO OUTSHOT questions if available
  const selectedNoOutshot = noOutshotCount > 0 && noOutshotOptions.length > 0
    ? [...noOutshotOptions].sort(() => Math.random() - 0.5).slice(0, Math.min(noOutshotCount, noOutshotOptions.length))
    : [];
  
  // Combine and shuffle final questions
  const questions = [...selectedValid, ...selectedNoOutshot];
  console.log('Final questions selected:', questions.length);
  return questions.sort(() => Math.random() - 0.5);
}