import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import quizData from './seedQuizData.js';

// Your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadQuizData() {
  try {
    console.log('Starting quiz data upload...');
    
    // Reference to the quiz collection
    const quizCollection = collection(db, 'dartQuizOptions');
    
    // Upload each quiz item
    for (const quiz of quizData) {
      const docRef = doc(quizCollection, quiz.id.toString());
      await setDoc(docRef, {
        name: quiz.name,
        darts: quiz.darts,
        values: quiz.values,
        isNoOutshot: quiz.isNoOutshot || false,
        createdAt: new Date()
      });
      console.log(`Uploaded quiz ${quiz.id}: ${quiz.name}`);
    }
    
    console.log('All quiz data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading quiz data:', error);
  }
}

// Run the upload
uploadQuizData();