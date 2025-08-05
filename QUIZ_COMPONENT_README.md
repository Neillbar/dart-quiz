# Dart Quiz Component

This comprehensive quiz page component provides an interactive dart checkout quiz experience with all the requested features.

## 🎯 Features Implemented

### 1. Countdown Timer
- **3-2-1-GO countdown** before quiz starts
- **Animated countdown** with large, pulsing numbers
- **Smooth transition** to quiz after countdown

### 2. Quiz Display
- **Large checkout value** prominently displayed in center (e.g., "120")
- **Question counter** showing current position (e.g., "Question 3 of 10")
- **Elapsed time timer** showing time since quiz started
- **Dynamic input blocks** based on dart count (2-3 blocks per question)
- **Visual feedback** as blocks fill with user input values

### 3. Two Custom Keyboard Modes

#### Mode 1 - Numeric Keyboard
- **Grid layout** with digits 0-9
- **Clear button** to reset current input
- **Backspace button** for character-by-character deletion
- **Enter button** to submit/advance
- Simple numeric input (user types "60" for 60 points)

#### Mode 2 - Dart Notation Keyboard
- **Toggle buttons** for Single/Double/Triple modifiers (Single default)
- **Grid of numbers 1-20** representing dart board segments
- **Visual indication** of selected modifier with color coding:
  - Single: Gray background
  - Double: Yellow background  
  - Triple: Red background
- User taps modifier then number (Triple + 20 = 60)

### 4. Keyboard Switch
- **Toggle button** to switch between keyboard modes (123 / Dart)
- **Smooth visual transition** between keyboard layouts
- **Persistent state** maintains selected mode during quiz

### 5. Answer Validation
- **Automatic checking** when user completes all inputs
- **Correct/Incorrect feedback** with visual indicators
- **Educational display** showing the correct solution
- **Auto-advance** to next question after 3 seconds

### 6. Progress Tracking
- **Current score** display (correct/total)
- **Questions remaining** counter
- **Real-time updates** as user progresses

## 🎨 UI/UX Features

### Visual Design
- **Clean, focused interface** optimized for quiz experience
- **Responsive design** works on mobile and desktop
- **Dark mode support** with Tailwind CSS theming
- **Game-like feedback** with button press animations and hover effects
- **Color-coded feedback** for different states (correct/incorrect/current)

### Interactive Elements
- **Touch-friendly buttons** with proper sizing for mobile
- **Active state feedback** with scale animations
- **Visual input focus** showing current active input
- **Smooth transitions** between states and modes

### Accessibility
- **High contrast colors** for readability
- **Clear visual hierarchy** with proper typography
- **Semantic HTML structure** for screen readers
- **Keyboard navigation** support

## 🔧 Technical Implementation

### Technology Stack
- **React/Next.js** with TypeScript
- **Tailwind CSS** for styling
- **Heroicons** for consistent iconography
- **Client-side state management** with React hooks

### File Structure
```
src/
├── app/quiz/page.tsx          # Quiz page route
├── components/QuizPage.tsx    # Main quiz component
└── types.ts                   # TypeScript definitions
```

### State Management
- **Game state**: countdown → playing → finished
- **Quiz progression**: question index, score, timing
- **Input management**: current inputs, keyboard mode, multiplier selection
- **Answer validation**: correct/incorrect state, solution display

## 🎮 User Experience Flow

1. **Countdown Phase**: 3-2-1-GO animation builds anticipation
2. **Question Display**: Large checkout value with clear dart count
3. **Input Phase**: User selects keyboard mode and enters answer
4. **Validation**: Immediate feedback with correct answer shown
5. **Progression**: Auto-advance to next question or final results
6. **Completion**: Final score display with restart option

## 🚀 Usage

### Navigation
- Access via `/quiz` route
- Dashboard "Take Quiz" button automatically navigates to quiz page
- Back button in header for easy exit

### Quiz Data
The component includes sample quiz questions with various checkout scenarios:
- 120 points in 3 darts
- 180 points in 3 darts  
- 100 points in 2 darts
- 170 points in 3 darts
- 60 points in 2 darts

### Customization
Easy to modify:
- **Question data**: Update the `questions` array
- **Styling**: Modify Tailwind classes
- **Timing**: Adjust countdown and auto-advance delays
- **Validation logic**: Customize answer checking

## 📱 Responsive Design

The component is fully responsive with:
- **Mobile-first approach** with touch-optimized controls
- **Adaptive layouts** for different screen sizes
- **Proper spacing** and sizing for various devices
- **Consistent experience** across platforms

## 🎯 Game Modes Supported

### Numeric Mode
Perfect for beginners or quick input:
- Direct number entry
- Simple calculation validation
- Fast input for experienced players

### Dart Notation Mode  
Authentic dart experience:
- Realistic dart board interaction
- Educational value for learning combinations
- Visual feedback for dart selection

This implementation provides a comprehensive, professional-quality quiz experience that matches the requirements while being extensible and maintainable.