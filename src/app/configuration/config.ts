/**
 * Application Configuration
 * Centralized location for all configuration values and magic numbers
 */

export const AppConfig = {
  /**
   * Font size multipliers for different size options
   */
  fontSizeMultipliers: {
    small: 0.875,
    medium: 1,
    large: 1.25,
    xlarge: 1.5,
  },

  /**
   * Audio service configuration
   */
  audio: {
    resetTime: 0,
  },

  /**
   * Lesson service configuration
   */
  lessons: {
    totalLevels: 5,
    assetPathTemplate: 'assets/lessons/level-{level}.json',
    firstLevelIndex: 1,
    navigation: {
      firstIndex: 0,
      incrementOffset: 1,
      decrementOffset: 1,
    },
  },

  /**
   * Quiz service configuration
   */
  quiz: {
    defaultQuestionCount: 15,
    initialIndex: 0,
    initialScore: 0,
    initialAttempts: 0,
    incrementOffset: 1,
    
    /**
     * Scoring thresholds for encouraging messages
     */
    scoring: {
      excellent: 13,  // >= 13 out of 15
      good: 10,       // >= 10 out of 15
      passing: 7,     // >= 7 out of 15
    },

    /**
     * Story sequence configuration
     */
    storySequence: {
      expectedLength: 5,
    },
  },
} as const;
