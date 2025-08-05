const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
// IMPORTANT: Never commit actual credentials to version control!
// 
// To use this script:
// 1. Download your service account key from Firebase Console
// 2. Save it as 'firebase-admin-sdk.json' in the project root
// 3. Copy this file to 'uploadWithAdmin.js'
// 4. Update the path below to point to your service account file

const serviceAccount = require('../firebase-admin-sdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Import quiz data
const quizData = require('./seedQuizData.js');

async function uploadQuizData() {
  try {
    console.log('Starting quiz data upload...');
    
    // Create a batch for efficient upload
    const batch = db.batch();
    
    // Add each quiz item to the batch
    quizData.forEach((quiz) => {
      const docRef = db.collection('dartQuizOptions').doc(quiz.id.toString());
      batch.set(docRef, {
        name: quiz.name,
        darts: quiz.darts,
        values: quiz.values,
        isNoOutshot: quiz.isNoOutshot || false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log(`Successfully uploaded ${quizData.length} quiz items!`);
    process.exit(0);
  } catch (error) {
    console.error('Error uploading quiz data:', error);
    process.exit(1);
  }
}

// Run the upload
uploadQuizData();