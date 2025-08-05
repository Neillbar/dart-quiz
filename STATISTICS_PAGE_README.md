# Statistics Page Component

A comprehensive statistics page for the Dart Quiz application that provides detailed performance analytics, session history, and interactive data visualization.

## 🎯 Overview

The Statistics Page offers a complete performance tracking system for dart quiz players, featuring:

- **Performance Analytics**: Comprehensive statistics with visual indicators
- **Interactive Charts**: Score trends and performance visualization  
- **Session History**: Detailed game history with sorting and pagination
- **Detailed Session Views**: Modal dialogs showing question-by-question breakdowns
- **Achievement System**: Progress tracking with unlockable achievements
- **Export Functionality**: Data export capabilities for personal records

## 📊 Components Architecture

### Core Components

#### 1. StatisticsPage (`/src/components/StatisticsPage.tsx`)
Main container component providing the complete statistics interface.

**Key Features:**
- Summary statistics cards (Total Games, Average Score, Best Time, Current Streak)
- Performance trend chart integration
- Sortable and paginated session history
- Achievement tracking with progress indicators
- Export and sharing functionality

**Props:**
```typescript
interface StatsPageProps {
  user?: User;
  sessions: GameSession[];
  onBack?: () => void;
  onSessionClick?: (sessionId: string) => void;
  onExportStats?: () => void;
}
```

#### 2. SessionDetailModal (`/src/components/SessionDetailModal.tsx`)
Modal component for detailed session analysis.

**Features:**
- Session overview with key metrics
- Question-by-question breakdown
- Answer comparison (correct vs user answer)
- Time analysis per question
- Visual indicators for correct/incorrect answers

#### 3. PerformanceChart (`/src/components/PerformanceChart.tsx`)
SVG-based chart component for visualizing performance trends.

**Features:**
- Line chart showing score progression over time
- Gradient area fill with color-coded performance zones
- Interactive data points with hover tooltips
- Responsive design with automatic scaling
- Color-coded legend (Green: 90%+, Gold: 70-89%, Red: <70%)

### Data Types

#### GameSession Interface
```typescript
interface GameSession {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeInSeconds: number;
  combinedScore: number; // for leaderboard ranking
  details: SessionDetail[];
}
```

#### SessionDetail Interface
```typescript
interface SessionDetail {
  questionId: number;
  checkout: number;
  userAnswer: DartCombination[];
  correctAnswer: DartCombination[];
  isCorrect: boolean;
  timeSpent: number;
}
```

## 🎨 Design System Integration

### Dart-Themed Color Palette
- **dart-red** (`#DC2626`): Error states, poor performance indicators
- **dart-green** (`#16A34A`): Success states, excellent performance
- **dart-gold** (`#F59E0B`): Good performance, achievements
- **Gradient backgrounds**: Consistent with dashboard theming
- **Glass morphism effects**: Backdrop blur with transparency

### Typography & Spacing
- **Inter font family**: Consistent with application design
- **Responsive grid layouts**: Mobile-first design approach
- **Consistent padding/margins**: Following 4px grid system

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile (< 640px)**: Single column layout, condensed cards
- **Tablet (640px - 1024px)**: 2-column stats cards, compact session list
- **Desktop (> 1024px)**: Full 4-column layout, expanded data views

### Interactive Elements
- **Hover effects**: Smooth transitions on all interactive components
- **Touch-friendly**: Adequate touch targets for mobile devices
- **Loading states**: Smooth transitions and skeleton loading

## 🔧 Usage Examples

### Basic Implementation
```jsx
import StatisticsPage from '@/components/StatisticsPage';
import { GameSession } from '@/types';

const MyStatsPage = () => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  
  return (
    <StatisticsPage
      user={{ name: 'Player Name', email: 'player@example.com' }}
      sessions={sessions}
      onBack={() => router.push('/dashboard')}
      onExportStats={() => handleExport()}
    />
  );
};
```

### With Navigation Integration
```jsx
// In dashboard component
const handleViewStats = () => {
  router.push('/statistics');
};

// Statistics page route: /app/statistics/page.tsx
```

## 📈 Statistics Calculations

### Performance Metrics
- **Average Score**: Mean percentage across all sessions
- **Best Score**: Highest percentage achieved
- **Current Streak**: Consecutive sessions with 70%+ score
- **Best Time**: Fastest completion time
- **Combined Score**: Weighted score for leaderboard ranking

### Chart Data Processing
- **Data Smoothing**: Recent 10 sessions for trend analysis
- **Performance Zones**: Color-coded based on score thresholds
- **Time Series**: Chronological ordering for accurate trends

## 🏆 Achievement System

### Available Achievements
1. **Quiz Champion**: Complete 10+ games (unlocks trophy icon)
2. **Hot Streak**: Maintain 5+ game winning streak (unlocks fire icon)
3. **Perfect Score**: Achieve 100% on any session (unlocks star icon)

### Progress Tracking
- Real-time progress calculation
- Visual indicators for locked/unlocked states
- Progressive unlock system with clear requirements

## 📤 Export Functionality

### Data Export Format
```json
{
  "user": { "name": "...", "email": "..." },
  "sessions": [...],
  "generatedAt": "2024-08-05T10:30:00Z"
}
```

### Export Features
- **JSON format**: Structured data export
- **Filename generation**: Timestamped filenames
- **Complete data**: All sessions and user information included

## 🎛️ Customization Options

### Sorting & Filtering
- **Sort by**: Date (newest first), Score (highest first), Time (fastest first)
- **Pagination**: Configurable sessions per page (default: 10)
- **Search/Filter**: Future enhancement for session filtering

### Display Options
- **Chart timeframe**: Configurable number of recent sessions
- **Statistics granularity**: Daily, weekly, monthly views (future)
- **Theme variations**: Support for light/dark mode toggle

## 🔄 Integration Points

### Dashboard Integration
- Seamless navigation from dashboard statistics card
- Consistent user context and session data
- Shared component styling and behavior

### Quiz Integration
- Session data structure alignment
- Real-time statistics updates after quiz completion
- Consistent scoring methodology

### Future Enhancements
- **Social Sharing**: Share achievements on social platforms
- **Detailed Analytics**: Time-of-day performance patterns
- **Comparison Features**: Compare with other players
- **Goal Setting**: Personal improvement targets
- **Advanced Charts**: Multiple chart types (bar, pie, etc.)

## 🛠️ Development Notes

### Performance Considerations
- **Lazy loading**: Chart rendering optimization
- **Pagination**: Large session datasets handling
- **Memoization**: React.useMemo for expensive calculations
- **Virtual scrolling**: Future enhancement for very large datasets

### Accessibility Features
- **Keyboard navigation**: Full keyboard support for all interactions
- **Screen reader support**: Proper ARIA labels and descriptions
- **Color contrast**: WCAG AA compliance for all text/background combinations
- **Focus indicators**: Clear focus states for all interactive elements

### Testing Strategy
- **Unit tests**: Individual component functionality
- **Integration tests**: Modal interactions and data flow
- **Visual regression tests**: Chart rendering consistency
- **Accessibility tests**: Screen reader and keyboard navigation

This statistics page provides a comprehensive analytics solution that enhances the dart quiz experience with detailed performance insights and engaging visual feedback.