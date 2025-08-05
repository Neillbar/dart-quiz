// Dart checkout logic and validation

export interface DartScore {
  value: number;
  multiplier: 'S' | 'D' | 'T'; // Single, Double, Triple
  segment: number; // 1-20 or 25 (bull)
  display: string;
}

// Valid dart segments
const DART_SEGMENTS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  25 // Bullseye
];

// Calculate dart value
export const calculateDartValue = (segment: number, multiplier: 'S' | 'D' | 'T'): number => {
  if (!DART_SEGMENTS.includes(segment)) {
    throw new Error(`Invalid dart segment: ${segment}`);
  }
  
  // Special handling for bullseye
  if (segment === 25) {
    if (multiplier === 'S') return 25; // Outer bull
    if (multiplier === 'D') return 50; // Inner bull
    throw new Error('Triple bullseye does not exist');
  }
  
  // Regular segments
  switch (multiplier) {
    case 'S': return segment;
    case 'D': return segment * 2;
    case 'T': return segment * 3;
    default: throw new Error(`Invalid multiplier: ${multiplier}`);
  }
};

// Format dart display string
export const formatDartDisplay = (segment: number, multiplier: 'S' | 'D' | 'T'): string => {
  const prefix = {
    'S': 'Single',
    'D': 'Double',
    'T': 'Triple'
  }[multiplier];
  
  if (segment === 25) {
    return multiplier === 'D' ? 'Bull' : 'Outer Bull';
  }
  
  return `${prefix} ${segment}`;
};

// Parse dart notation (e.g., "T20", "D16", "S10")
export const parseDartNotation = (notation: string): DartScore => {
  const match = notation.match(/^([SDT])(\d+|Bull)$/i);
  if (!match) {
    throw new Error(`Invalid dart notation: ${notation}`);
  }
  
  const [, multiplier, segmentStr] = match;
  const segment = segmentStr.toLowerCase() === 'bull' ? 25 : parseInt(segmentStr);
  
  return {
    value: calculateDartValue(segment, multiplier.toUpperCase() as 'S' | 'D' | 'T'),
    multiplier: multiplier.toUpperCase() as 'S' | 'D' | 'T',
    segment,
    display: formatDartDisplay(segment, multiplier.toUpperCase() as 'S' | 'D' | 'T')
  };
};

// Create dart notation string
export const createDartNotation = (segment: number, multiplier: 'S' | 'D' | 'T'): string => {
  if (segment === 25 && multiplier === 'D') return 'DBull';
  if (segment === 25 && multiplier === 'S') return 'SBull';
  return `${multiplier}${segment}`;
};

// Validate checkout sequence
export const validateCheckout = (
  targetScore: number,
  darts: DartScore[]
): { isValid: boolean; reason?: string } => {
  // Check if we have darts
  if (darts.length === 0) {
    return { isValid: false, reason: 'No darts thrown' };
  }
  
  // Maximum 3 darts per turn
  if (darts.length > 3) {
    return { isValid: false, reason: 'Maximum 3 darts allowed' };
  }
  
  // Calculate total
  const total = darts.reduce((sum, dart) => sum + dart.value, 0);
  
  // Check if total matches target
  if (total !== targetScore) {
    return { 
      isValid: false, 
      reason: `Total ${total} does not match target ${targetScore}` 
    };
  }
  
  // Last dart must be a double
  const lastDart = darts[darts.length - 1];
  if (lastDart.multiplier !== 'D') {
    return { 
      isValid: false, 
      reason: 'Last dart must be a double to checkout' 
    };
  }
  
  return { isValid: true };
};

// Generate all possible checkouts for a score
export const generateCheckouts = (
  targetScore: number,
  maxDarts: number = 3
): DartScore[][] => {
  const checkouts: DartScore[][] = [];
  
  // Can't checkout on 1 or less than 2 (minimum double 1)
  if (targetScore <= 1 || targetScore > 170) return checkouts;
  
  // Helper to generate all possible dart combinations
  const generateDarts = (remaining: number, dartsUsed: DartScore[], dartsLeft: number) => {
    // Must finish on a double
    if (dartsLeft === 1) {
      // Check all possible doubles
      for (const segment of DART_SEGMENTS) {
        if (segment === 25 && remaining === 50) {
          // Bull finish
          checkouts.push([...dartsUsed, {
            value: 50,
            multiplier: 'D',
            segment: 25,
            display: 'Bull'
          }]);
        } else if (segment <= 20 && remaining === segment * 2) {
          // Regular double finish
          checkouts.push([...dartsUsed, {
            value: segment * 2,
            multiplier: 'D',
            segment,
            display: `Double ${segment}`
          }]);
        }
      }
      return;
    }
    
    // Try all possible darts for non-finishing throws
    for (const segment of DART_SEGMENTS) {
      for (const multiplier of ['S', 'D', 'T'] as const) {
        // Skip triple bull
        if (segment === 25 && multiplier === 'T') continue;
        
        try {
          const value = calculateDartValue(segment, multiplier);
          if (value < remaining) {
            generateDarts(
              remaining - value,
              [...dartsUsed, {
                value,
                multiplier,
                segment,
                display: formatDartDisplay(segment, multiplier)
              }],
              dartsLeft - 1
            );
          }
        } catch (e) {
          // Invalid combination, skip
        }
      }
    }
  };
  
  // Generate checkouts starting from 1 dart up to maxDarts
  for (let numDarts = 1; numDarts <= Math.min(maxDarts, 3); numDarts++) {
    generateDarts(targetScore, [], numDarts);
  }
  
  return checkouts;
};

// Get the most common/recommended checkout for a score
export const getRecommendedCheckout = (targetScore: number): DartScore[] | null => {
  // Common checkout patterns used by professionals
  const commonCheckouts: { [key: number]: string[] } = {
    // 2-dart finishes
    32: ['S16', 'D8'],
    36: ['S20', 'D8'],
    40: ['S8', 'D16'],
    // 3-dart finishes
    60: ['S20', 'S20', 'D10'],
    61: ['T15', 'S6', 'D10'],
    62: ['T10', 'D16'],
    100: ['T20', 'S20', 'D10'],
    120: ['T20', 'S20', 'D20'],
    141: ['T20', 'T19', 'D12'],
    161: ['T20', 'T17', 'DBull'],
    167: ['T20', 'T19', 'DBull'],
    170: ['T20', 'T20', 'DBull']
  };
  
  // Check if we have a recommended checkout
  const recommended = commonCheckouts[targetScore];
  if (recommended) {
    return recommended.map(notation => parseDartNotation(notation));
  }
  
  // Otherwise, generate and return the first valid checkout
  const checkouts = generateCheckouts(targetScore);
  return checkouts.length > 0 ? checkouts[0] : null;
};

// Compare user answer with correct answer
export const compareCheckouts = (
  userAnswer: DartScore[],
  correctAnswer: DartScore[]
): boolean => {
  // Must have same number of darts
  if (userAnswer.length !== correctAnswer.length) return false;
  
  // Total must match
  const userTotal = userAnswer.reduce((sum, dart) => sum + dart.value, 0);
  const correctTotal = correctAnswer.reduce((sum, dart) => sum + dart.value, 0);
  if (userTotal !== correctTotal) return false;
  
  // Last dart must be a double in both
  if (userAnswer[userAnswer.length - 1].multiplier !== 'D') return false;
  
  // For scoring purposes, we consider it correct if totals match and ends on double
  // The exact path doesn't matter as long as it's valid
  return true;
};

// Calculate combined leaderboard score
export const calculateCombinedScore = (accuracy: number, timeInSeconds: number): number => {
  // Formula: (Accuracy % × 100) + (3000 / Time in seconds)
  // This balances accuracy (max 100 points) with speed (varies based on time)
  const accuracyPoints = accuracy * 100;
  const speedPoints = Math.min(3000 / timeInSeconds, 100); // Cap speed points at 100
  
  return Math.round(accuracyPoints + speedPoints);
};

// Convert numeric input to dart notation
export const convertNumericToDarts = (
  values: number[],
  targetScore: number
): DartScore[] | null => {
  // Validate total
  const total = values.reduce((sum, val) => sum + val, 0);
  if (total !== targetScore) return null;
  
  // Last value must be even (a double)
  const lastValue = values[values.length - 1];
  if (lastValue % 2 !== 0 || lastValue === 0) return null;
  
  const darts: DartScore[] = [];
  
  // Process all but last dart
  for (let i = 0; i < values.length - 1; i++) {
    const value = values[i];
    
    // Try to determine the dart from value
    // Check for common values
    if (value <= 20) {
      darts.push({
        value,
        multiplier: 'S',
        segment: value,
        display: `Single ${value}`
      });
    } else if (value <= 40 && value % 2 === 0) {
      darts.push({
        value,
        multiplier: 'D',
        segment: value / 2,
        display: `Double ${value / 2}`
      });
    } else if (value <= 60 && value % 3 === 0) {
      darts.push({
        value,
        multiplier: 'T',
        segment: value / 3,
        display: `Triple ${value / 3}`
      });
    } else if (value === 25) {
      darts.push({
        value: 25,
        multiplier: 'S',
        segment: 25,
        display: 'Outer Bull'
      });
    } else if (value === 50) {
      darts.push({
        value: 50,
        multiplier: 'D',
        segment: 25,
        display: 'Bull'
      });
    } else {
      // Can't determine valid dart
      return null;
    }
  }
  
  // Process last dart (must be double)
  if (lastValue === 50) {
    darts.push({
      value: 50,
      multiplier: 'D',
      segment: 25,
      display: 'Bull'
    });
  } else if (lastValue <= 40 && lastValue % 2 === 0) {
    darts.push({
      value: lastValue,
      multiplier: 'D',
      segment: lastValue / 2,
      display: `Double ${lastValue / 2}`
    });
  } else {
    return null;
  }
  
  return darts;
};