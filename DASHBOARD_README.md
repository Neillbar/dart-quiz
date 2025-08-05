# Dashboard Component

A comprehensive gaming dashboard for the Dart Quiz application built with React, Next.js, TypeScript, and Tailwind CSS.

## Features

- **Welcome Section**: Personalized greeting with user's name and profile picture
- **Navigation Cards**: Three main action cards (Take Quiz, Statistics, Leaderboard)
- **User Stats**: Display key metrics like total games, best score, current streak, and accuracy
- **Header**: App logo and sign-out functionality
- **Animated Background**: Dart-themed visual elements with smooth animations
- **Responsive Design**: Fully responsive grid layout for all screen sizes
- **Quick Tips**: Rotating dart checkout tips for educational value
- **Gaming Aesthetics**: Engaging visual design with hover effects and transitions

## Usage

```tsx
import Dashboard from '@/components/Dashboard';

const DashboardPage = () => {
  const user = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    picture: '/img/profile.jpg'
  };

  const stats = {
    totalGames: 127,
    bestScore: '10/10',
    averageScore: '8.3/10',
    currentStreak: 12,
    favoriteFinish: 'Double 16',
    accuracy: '92%'
  };

  return (
    <Dashboard
      user={user}
      stats={stats}
      onTakeQuiz={() => router.push('/quiz')}
      onViewStats={() => router.push('/stats')}
      onViewLeaderboard={() => router.push('/leaderboard')}
      onSignOut={() => signOut()}
    />
  );
};
```

## Props

### DashboardProps

| Prop | Type | Optional | Description |
|------|------|----------|-------------|
| `user` | `User` | Yes | User information from Google Auth |
| `stats` | `UserStats` | Yes | User's game statistics |
| `onTakeQuiz` | `() => void` | Yes | Callback for Take Quiz button |
| `onViewStats` | `() => void` | Yes | Callback for Statistics button |
| `onViewLeaderboard` | `() => void` | Yes | Callback for Leaderboard button |
| `onSignOut` | `() => void` | Yes | Callback for Sign Out button |

### User Interface

```tsx
interface User {
  name: string;
  email: string;
  picture?: string;
}
```

### UserStats Interface

```tsx
interface UserStats {
  totalGames: number;
  bestScore: string;
  averageScore: string;
  currentStreak: number;
  favoriteFinish: string;
  accuracy: string;
}
```

## Styling

The component uses the dart-themed color scheme defined in `tailwind.config.ts`:

- **dart-red**: `#DC2626` - Classic dartboard red
- **dart-green**: `#16A34A` - Classic dartboard green  
- **dart-gold**: `#F59E0B` - Dartboard gold/yellow
- **dart-black**: `#1F2937` - Dartboard black
- **dart-cream**: `#FEF3C7` - Dartboard cream

## Animation Classes

Custom animation classes used:
- `animate-pulse-slow`: 4-second pulse animation
- `animate-bounce-slow`: 3-second bounce animation

## Dependencies

- React 18+
- Next.js 14+
- TypeScript 5+
- Tailwind CSS 3.4+
- Heroicons React
- @headlessui/react (for accessibility)

## File Structure

```
src/
├── components/
│   └── Dashboard.tsx           # Main dashboard component
├── app/
│   └── dashboard/
│       └── page.tsx           # Demo page
├── types.ts                   # TypeScript interfaces
└── tailwind.config.ts         # Dart-themed colors
```

## Demo

Visit `/dashboard` to see the component in action with sample data.

## Customization

The component is highly customizable through props and can be styled further using Tailwind classes. The dart theme colors can be modified in `tailwind.config.ts` to match your brand colors.

## Accessibility

- Proper ARIA labels on interactive elements
- Keyboard navigation support
- High contrast color combinations
- Screen reader friendly structure
- Semantic HTML elements

## Performance

- Uses React hooks for optimal state management
- Smooth CSS transitions with GPU acceleration
- Optimized image loading for profile pictures
- Efficient re-rendering patterns