/**
 * Base interface for all quiz questions
 */
export interface BaseQuizQuestion {
  id: string;
  level: number; // 1-5
  type: 'alphabet' | 'word' | 'sentence' | 'paragraph' | 'story';
}

/**
 * Level 1 & 2: Multiple choice questions
 */
export interface MultipleChoiceQuestion extends BaseQuizQuestion {
  type: 'alphabet' | 'word';
  prompt: string; // Transliteration shown to user
  options: string[]; // 4 native script options
  correctAnswerIndex: number; // 0-3
}

/**
 * Level 3: Fill in the blank (single blank)
 */
export interface FillBlankQuestion extends BaseQuizQuestion {
  type: 'sentence';
  sentence: string; // Native script with {{blank}} placeholder
  transliteration: string; // Full sentence transliteration
  meaning?: string; // Optional English meaning
  options: string[]; // 4 native script word options
  correctAnswerIndex: number; // 0-3
}

/**
 * Level 4: Fill in the blank (multiple blanks)
 */
export interface MultipleBlanksQuestion extends BaseQuizQuestion {
  type: 'paragraph';
  paragraph: string; // Native script with {{blank1}}, {{blank2}}, etc.
  transliteration?: string;
  blanks: Array<{
    blankId: string; // "blank1", "blank2", etc.
    options: string[]; // 4 options for this blank
    correctAnswerIndex: number; // 0-3
  }>;
}

/**
 * Level 5: Story sequencing
 */
export interface StorySequenceQuestion extends BaseQuizQuestion {
  type: 'story';
  storyTitle?: string;
  lines: string[]; // 4-5 native script lines in CORRECT order
  // UI will randomize display order
}

/**
 * Union type for all question types
 */
export type QuizQuestion =
  | MultipleChoiceQuestion
  | FillBlankQuestion
  | MultipleBlanksQuestion
  | StorySequenceQuestion;

/**
 * Scoring criteria thresholds
 */
export interface ScoringCriteria {
  excellent: number;  // Minimum score for excellent rating
  great: number;      // Minimum score for great rating
  good: number;       // Minimum score for good rating
}

/**
 * Quiz container
 */
export interface Quiz {
  id: string;
  level: number;
  quizNumber: number; // Quiz number within the level (1, 2, 3, etc.)
  title: string;
  questions: QuizQuestion[]; // Exactly 15 questions
  scoringCriteria?: ScoringCriteria; // Optional, will use defaults if not provided
}

/**
 * Quiz result tracking
 */
export interface QuizResult {
  quizId: string;
  score: number; // 0-15 (count of first-try correct answers)
  totalQuestions: number; // Always 15
  completedAt: Date;
}

/**
 * Quiz state management
 */
export interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  score: number;
  questionAttempts: Map<string, number>; // Track attempts per question
  isQuizComplete: boolean;
}

/**
 * Answer validation feedback
 */
export interface AnswerFeedback {
  isCorrect: boolean;
  isFirstAttempt: boolean;
  message: string;
}
