# Dart Quiz - Project Specification

## Overview
Dart Quiz is a training website designed to help players practice dart checkout logic. The application teaches users the optimal way to finish a dart game by hitting specific combinations to reach exactly zero.

## Core Concept
In darts, a "checkout" is the final throws needed to finish a game (reach exactly zero from your current score). For example:
- Score of 120: Requires Triple 20 (60) + Single 20 (20) + Double 20 (40)
- The last dart MUST be a double to win

## Key Features

### 1. Authentication
- **Google Sign-In Only**: Users authenticate exclusively through Google OAuth
- **Single Environment**: One `.env` file for all configuration
- **Firebase Integration**: User management through Firebase Auth

### 2. Main Dashboard
Three primary navigation options:
- **Take Quiz**: Start a 10-question checkout practice session
- **Statistics**: View personal performance history
- **Leaderboard**: Compare scores with other players

### 3. Quiz Functionality

#### Quiz Flow
1. Select "Take Quiz" from dashboard
2. System randomly selects 10 checkout scenarios from database
3. 3-second countdown before quiz starts
4. Present checkout value in center of screen
5. User inputs their solution using custom keyboard
6. Validate answer and show correct solution if wrong
7. Track time and accuracy
8. Display final score and time at completion

#### Custom Keyboard System
Two keyboard modes that users can switch between:

**Mode 1: Numeric Input**
- Digits 0-9
- Enter button (bottom right)
- User types exact values (e.g., "60" for Triple 20)

**Mode 2: Dart Notation**
- Headers: Single, Double, Triple (Single selected by default)
- Numbers: 1-20 representing dart board segments
- User taps modifier then number (e.g., "Triple" → "20" = 60)

#### Input Display
- Dynamic input blocks based on required darts (2-3 blocks typically)
- Values populate blocks as user enters them
- Last value must be a double (game rule)

#### Learning Feature
- When user answers incorrectly, display the correct checkout sequence
- Helps users learn optimal checkout strategies

### 4. Statistics Page
- Display all user sessions
- Show completion time for each session
- Track accuracy/score for each session
- Personal performance trends

### 5. Leaderboard
- Combined metric ranking (accuracy + speed)
- Global player comparison
- Top performers display

## Firebase Data Structure

### Collections

1. **users**
   ```
   {
     uid: string,
     email: string,
     displayName: string,
     photoURL: string,
     createdAt: timestamp,
     lastLogin: timestamp
   }
   ```

2. **quizzes**
   ```
   {
     checkoutTotal: number,      // e.g., 120
     dartCount: number,          // e.g., 3
     solution: [                 // Correct checkout sequence
       { value: 60, type: "T20" },  // Triple 20
       { value: 20, type: "S20" },  // Single 20
       { value: 40, type: "D20" }   // Double 20 (must be last)
     ]
   }
   ```

3. **statistics**
   ```
   {
     userId: string,
     quizId: string,
     score: number,              // Questions correct out of 10
     timeElapsed: number,        // Seconds to complete
     answers: [],                // User's answers for each question
     completedAt: timestamp
   }
   ```

4. **leaderboard**
   ```
   {
     userId: string,
     combinedScore: number,      // Algorithm combining accuracy + speed
     bestTime: number,
     highestScore: number,
     rank: number,
     updatedAt: timestamp
   }
   ```

## Technical Requirements

### Frontend
- Next.js with TypeScript
- Tailwind CSS for styling
- Firebase SDK for authentication and database
- Responsive design for mobile and desktop

### Security Rules
- Authenticated users can only read/write their own statistics
- Leaderboard is read-only for all authenticated users
- Quiz questions are read-only for all authenticated users

### Performance Goals
- Sub-3 second page loads
- Instant keyboard response (<50ms)
- Real-time leaderboard updates

## Scoring Algorithm
Combined score for leaderboard = (Accuracy % × 100) + (3000 / Time in seconds)
- Prioritizes accuracy while rewarding speed
- Example: 90% accuracy in 120 seconds = 90 + 25 = 115 points