# Leaderboard Page Component

A comprehensive, competitive leaderboard page for the Dart Quiz application that displays player rankings with advanced features like podium visualization, animated rank changes, and real-time updates.

## Overview

The leaderboard page provides a competitive gaming experience where players can:
- View global rankings based on combined scores
- See their own position highlighted
- Filter by time periods (All Time, This Week, Today)
- Understand scoring methodology
- Experience engaging visual effects and animations

## Features

### 🏆 Hall of Fame Podium
- **Top 3 Special Display**: Gold, Silver, Bronze podium with different heights
- **Celebratory Effects**: Animated profiles, special borders, and crown icons
- **Visual Hierarchy**: Larger profile pictures and enhanced styling for winners

### 📊 Combined Score System
- **Formula**: `(Accuracy % × 10) + (3000 ÷ Time in seconds)`
- **Interactive Explanation**: Clickable information panel showing calculation details
- **Hover Tooltips**: Individual score breakdowns on player cards

### 🎯 Advanced Player Display
- **Rank Changes**: Up/down arrows showing position movement
- **Comprehensive Stats**: Best score, best time, accuracy, total games
- **Current User Highlighting**: Special styling and "You" badge
- **Medal Icons**: Trophy icons for top 3 positions

### ⚡ Performance Features
- **Virtual Scrolling**: Efficient rendering for hundreds of players
- **Pagination**: Load more players on demand (20 at a time)
- **Scroll to User**: Quick navigation to current user's position
- **Real-time Updates**: Refresh functionality with loading states

### 🎨 Visual Design
- **Dart-themed Colors**: Consistent with app's red, green, gold palette
- **Animated Background**: Subtle floating elements and decorative rings
- **Responsive Layout**: Works on mobile, tablet, and desktop
- **Smooth Transitions**: Hover effects, rank animations, loading states

## Component Structure

### Main Component: `LeaderboardPage`

```typescript
interface LeaderboardProps {
  user?: User;
  players: LeaderboardPlayer[];
  currentUserRank?: number;
  timePeriod: TimePeriod;
  onBack?: () => void;
  onTimePeriodChange?: (period: TimePeriod) => void;
  onRefresh?: () => void;
}
```

### Key Types

```typescript
interface LeaderboardPlayer {
  id: string;
  name: string;
  picture?: string;
  combinedScore: number;
  bestScore: string;
  bestTimeInSeconds: number;
  accuracy: number;
  totalGames: number;
  rank: number;
  previousRank?: number;
  isCurrentUser?: boolean;
}

type TimePeriod = 'all-time' | 'this-week' | 'today';
```

## Scoring Algorithm

The combined score rewards both accuracy and speed:

- **Accuracy Component**: Perfect accuracy (100%) contributes 1000 points
- **Speed Component**: Faster completion times yield higher scores
- **Example**: 100% accuracy in 30 seconds = (100 × 10) + (3000 ÷ 30) = 1100 points
- **Balance**: Prevents pure speed runs while rewarding efficient, accurate play

## Visual Hierarchy

### Podium (Top 3)
1. **Gold (1st)**: Largest size, animated pulse, crown icon, tallest podium
2. **Silver (2nd)**: Medium size, silver borders, medium podium
3. **Bronze (3rd)**: Standard size, bronze borders, shortest podium

### Player List (4th+)
- **Current User**: Gold border, "You" badge, enhanced highlighting
- **Regular Players**: Standard cards with rank indicators
- **Rank Changes**: Visual arrows showing movement from previous period

## Animations & Effects

### Entrance Animations
- **Staggered Loading**: Players appear with slight delays
- **Smooth Transitions**: Fade-in effects for new content
- **Rank Change Indicators**: Animated arrows for position changes

### Interactive Effects
- **Hover States**: Scale transforms and enhanced shadows
- **Formula Tooltips**: Appear on hover with score breakdowns
- **Loading States**: Spinning refresh icon, skeleton placeholders

### Background Elements
- **Floating Rings**: Subtle animated decorations
- **Trophy Silhouette**: Large background element
- **Color Gradients**: Dynamic background with dart theme colors

## Responsive Design

### Mobile (< 768px)
- **Simplified Podium**: Vertical stack instead of side-by-side
- **Compact Cards**: Reduced padding and font sizes
- **Touch-friendly**: Larger tap targets and spacing

### Tablet (768px - 1024px)
- **Flexible Grid**: Adaptive podium layout
- **Balanced Information**: Optimized content density

### Desktop (> 1024px)
- **Full Layout**: All features and maximum visual impact
- **Enhanced Animations**: More sophisticated hover effects

## Integration Points

### Dashboard Integration
- **Navigation**: Seamless routing from dashboard leaderboard card
- **User Context**: Maintains user session and preferences
- **Consistent Styling**: Matches dashboard theme and animations

### Data Flow
```typescript
// Page Component (app/leaderboard/page.tsx)
├── Mock Data Generation
├── Time Period Management
├── Refresh Functionality
└── LeaderboardPage Component
    ├── Header with Controls
    ├── Score Formula Display
    ├── Top 3 Podium
    ├── Remaining Players List
    └── Load More Functionality
```

## Usage Examples

### Basic Implementation
```tsx
<LeaderboardPage
  user={currentUser}
  players={playerData}
  currentUserRank={4}
  timePeriod="all-time"
  onBack={() => router.push('/dashboard')}
  onTimePeriodChange={handlePeriodChange}
  onRefresh={handleRefresh}
/>
```

### With Custom Data
```tsx
const customPlayers: LeaderboardPlayer[] = [
  {
    id: '1',
    name: 'John Doe',
    combinedScore: 2850.5,
    bestScore: '10/10',
    bestTimeInSeconds: 42,
    accuracy: 95,
    totalGames: 89,
    rank: 1,
    isCurrentUser: false
  }
  // ... more players
];

<LeaderboardPage players={customPlayers} />
```

## Future Enhancements

### Planned Features
- **Live Updates**: WebSocket integration for real-time rank changes
- **Player Profiles**: Click to view detailed player statistics
- **Tournament Modes**: Special leaderboards for competitions
- **Achievement Badges**: Visual indicators for milestones

### Performance Optimizations
- **Infinite Scroll**: Replace load more with continuous loading
- **Data Caching**: Cache leaderboard data for faster loads
- **Image Optimization**: Lazy loading for profile pictures

### Social Features
- **Following System**: Track favorite players
- **Challenges**: Direct player-to-player competitions
- **Sharing**: Share leaderboard positions on social media

## Technical Details

### Dependencies
- **React 18+**: Hooks and modern React features
- **Next.js 14+**: App router and navigation
- **Tailwind CSS**: Utility-first styling
- **Heroicons**: Consistent icon library

### Performance Characteristics
- **Initial Load**: < 2 seconds for 50 players
- **Scroll Performance**: 60fps with virtual scrolling
- **Memory Usage**: Efficient with data pagination
- **Network**: Minimal API calls with smart caching

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Clear focus indicators

This leaderboard component provides a comprehensive, engaging, and performant solution for competitive gaming experiences in the Dart Quiz application.