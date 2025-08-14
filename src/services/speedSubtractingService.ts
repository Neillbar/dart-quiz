interface GameState {
  currentScore: number;
  currentTarget: number;
  throwCount: number;
  mistakes: number;
  isPlaying: boolean;
  gameComplete: boolean;
  startTime: number;
  elapsedTime: number;
  bestTime: number;
  throwHistory: number[];
}

class SpeedSubtractingService {
  private gameState: GameState = {
    currentScore: 501,
    currentTarget: 0,
    throwCount: 0,
    mistakes: 0,
    isPlaying: false,
    gameComplete: false,
    startTime: 0,
    elapsedTime: 0,
    bestTime: 0,
    throwHistory: []
  };

  constructor() {
    this.loadBestTime();
  }

  private loadBestTime() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('speedSubtractingBestTime');
      if (saved) {
        this.gameState.bestTime = parseInt(saved);
      }
    }
  }

  private saveBestTime(time: number) {
    if (typeof window !== 'undefined') {
      if (!this.gameState.bestTime || time < this.gameState.bestTime) {
        this.gameState.bestTime = time;
        localStorage.setItem('speedSubtractingBestTime', time.toString());
      }
    }
  }

  private generateDartScore(): number {
    // Weighted random generation to simulate realistic dart scores
    const random = Math.random();
    
    // 5% chance for big scores (100-180)
    if (random < 0.05) {
      return Math.floor(Math.random() * 81) + 100; // 100-180
    }
    
    // 15% chance for high scores (81-99)
    if (random < 0.20) {
      return Math.floor(Math.random() * 19) + 81; // 81-99
    }
    
    // 50% chance for medium scores (41-80)
    if (random < 0.70) {
      return Math.floor(Math.random() * 40) + 41; // 41-80
    }
    
    // 25% chance for low-medium scores (26-40)
    if (random < 0.95) {
      return Math.floor(Math.random() * 15) + 26; // 26-40
    }
    
    // 5% chance for low scores (1-25)
    return Math.floor(Math.random() * 25) + 1; // 1-25
  }

  startGame() {
    this.gameState = {
      currentScore: 501,
      currentTarget: this.generateDartScore(),
      throwCount: 0,
      mistakes: 0,
      isPlaying: true,
      gameComplete: false,
      startTime: Date.now(),
      elapsedTime: 0,
      bestTime: this.gameState.bestTime,
      throwHistory: []
    };
  }

  resetGame() {
    this.gameState.isPlaying = false;
    this.gameState.gameComplete = false;
    this.gameState.currentScore = 501;
    this.gameState.throwCount = 0;
    this.gameState.mistakes = 0;
    this.gameState.elapsedTime = 0;
    this.gameState.throwHistory = [];
  }

  submitAnswer(answer: number) {
    if (!this.gameState.isPlaying || this.gameState.gameComplete) return false;

    const expectedAnswer = this.gameState.currentScore - this.gameState.currentTarget;
    
    if (answer === expectedAnswer) {
      this.gameState.currentScore = expectedAnswer;
      this.gameState.throwCount++;
      this.gameState.throwHistory.push(this.gameState.currentTarget);

      // Check if game is complete
      if (this.gameState.currentScore === 0) {
        this.gameState.gameComplete = true;
        this.gameState.isPlaying = false;
        this.saveBestTime(this.gameState.elapsedTime);
      } else if (this.gameState.currentScore < 0) {
        // Bust! Generate new target
        this.gameState.currentScore = this.gameState.currentScore + this.gameState.currentTarget;
        this.gameState.currentTarget = this.generateSafeScore(this.gameState.currentScore);
      } else {
        // Generate next dart score
        this.gameState.currentTarget = this.generateSafeScore(this.gameState.currentScore);
      }
      return true;
    }
    return false;
  }

  private generateSafeScore(currentScore: number): number {
    // Make sure we don't generate a score higher than what's left
    if (currentScore <= 180) {
      // When score is low, generate smaller values to avoid busting
      const maxScore = Math.min(currentScore, 180);
      
      // Higher chance of getting exact finish when close
      if (currentScore <= 60 && Math.random() < 0.3) {
        return currentScore; // Checkout opportunity
      }
      
      // Generate score between 1 and maxScore
      if (currentScore <= 25) {
        return Math.floor(Math.random() * currentScore) + 1;
      } else if (currentScore <= 60) {
        return Math.floor(Math.random() * Math.min(40, currentScore)) + 1;
      } else {
        return Math.floor(Math.random() * Math.min(60, currentScore)) + 1;
      }
    }
    
    // Normal dart score generation for higher scores
    return this.generateDartScore();
  }

  recordMistake() {
    this.gameState.mistakes++;
  }

  updateTimer() {
    if (this.gameState.isPlaying && !this.gameState.gameComplete) {
      this.gameState.elapsedTime = Date.now() - this.gameState.startTime;
    }
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }
}

export const speedSubtractingService = new SpeedSubtractingService();