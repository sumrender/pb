import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { 
  Quiz, 
  QuizQuestion, 
  QuizResult, 
  QuizState, 
  AnswerFeedback,
  MultipleChoiceQuestion,
  FillBlankQuestion,
  MultipleBlanksQuestion,
  StorySequenceQuestion
} from '../models/quiz.interface';
import { AppConfig } from '../configuration/config';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly http = inject(HttpClient);
  
  // Quiz state signals
  private readonly currentQuiz = signal<Quiz | null>(null);
  private readonly currentQuestionIndex = signal<number>(AppConfig.quiz.initialIndex);
  private readonly score = signal<number>(AppConfig.quiz.initialScore);
  private readonly questionAttempts = signal<Map<string, number>>(new Map());
  private readonly isQuizComplete = signal<boolean>(false);

  // Computed signals
  readonly currentQuestion = computed(() => {
    const quiz = this.currentQuiz();
    const index = this.currentQuestionIndex();
    if (!quiz || index < AppConfig.quiz.initialIndex || index >= quiz.questions.length) {
      return null;
    }
    return quiz.questions[index];
  });

  readonly progress = computed(() => {
    const quiz = this.currentQuiz();
    const index = this.currentQuestionIndex();
    if (!quiz) {
      return { current: AppConfig.quiz.initialIndex, total: AppConfig.quiz.initialIndex };
    }
    return { current: index + AppConfig.quiz.incrementOffset, total: quiz.questions.length };
  });

  readonly currentScore = computed(() => this.score());
  readonly quizComplete = computed(() => this.isQuizComplete());

  /**
   * Load quiz data from JSON file by level
   */
  loadQuiz(level: number): Observable<Quiz> {
    const filePath = `assets/quizzes/level-${level}.json`;
    return this.http.get<Quiz>(filePath).pipe(
      map(quiz => {
        this.currentQuiz.set(quiz);
        this.currentQuestionIndex.set(AppConfig.quiz.initialIndex);
        this.score.set(AppConfig.quiz.initialScore);
        this.questionAttempts.set(new Map());
        this.isQuizComplete.set(false);
        return quiz;
      })
    );
  }

  /**
   * Get the current question
   */
  getCurrentQuestion(): QuizQuestion | null {
    return this.currentQuestion();
  }

  /**
   * Submit an answer and get feedback
   */
  submitAnswer(answer: any): AnswerFeedback {
    const question = this.currentQuestion();
    if (!question) {
      return {
        isCorrect: false,
        isFirstAttempt: false,
        message: 'No active question'
      };
    }

    const attempts = this.questionAttempts();
    const currentAttempts = attempts.get(question.id) || AppConfig.quiz.initialAttempts;
    const isFirstAttempt = currentAttempts === AppConfig.quiz.initialAttempts;

    let isCorrect = false;

    // Validate answer based on question type
    switch (question.type) {
      case 'alphabet':
      case 'word':
        isCorrect = this.validateMultipleChoice(question as MultipleChoiceQuestion, answer);
        break;
      case 'sentence':
        isCorrect = this.validateFillBlank(question as FillBlankQuestion, answer);
        break;
      case 'paragraph':
        isCorrect = this.validateMultipleBlanks(question as MultipleBlanksQuestion, answer);
        break;
      case 'story':
        isCorrect = this.validateStorySequence(question as StorySequenceQuestion, answer);
        break;
    }

    // Update attempts
    attempts.set(question.id, currentAttempts + AppConfig.quiz.incrementOffset);
    this.questionAttempts.set(new Map(attempts));

    // Update score if correct on first attempt
    if (isCorrect && isFirstAttempt) {
      this.score.set(this.score() + AppConfig.quiz.incrementOffset);
    }

    return {
      isCorrect,
      isFirstAttempt,
      message: isCorrect ? 'Correct! ✓' : 'Try again'
    };
  }

  /**
   * Validate multiple choice answer (Levels 1 & 2)
   */
  private validateMultipleChoice(question: MultipleChoiceQuestion, answerIndex: number): boolean {
    return answerIndex === question.correctAnswerIndex;
  }

  /**
   * Validate fill in the blank answer (Level 3)
   */
  private validateFillBlank(question: FillBlankQuestion, answerIndex: number): boolean {
    return answerIndex === question.correctAnswerIndex;
  }

  /**
   * Validate multiple blanks answer (Level 4)
   */
  private validateMultipleBlanks(question: MultipleBlanksQuestion, answers: number[]): boolean {
    if (!answers || answers.length !== question.blanks.length) {
      return false;
    }
    
    return question.blanks.every((blank, index) => 
      answers[index] === blank.correctAnswerIndex
    );
  }

  /**
   * Validate story sequence answer (Level 5)
   */
  private validateStorySequence(question: StorySequenceQuestion, sequence: number[]): boolean {
    if (!sequence || sequence.length !== question.lines.length) {
      return false;
    }
    
    // Check if sequence matches [0, 1, 2, 3, 4] (correct order)
    return sequence.every((position, index) => position === index);
  }

  /**
   * Move to next question
   */
  nextQuestion(): void {
    const quiz = this.currentQuiz();
    const currentIndex = this.currentQuestionIndex();
    
    if (!quiz) {
      return;
    }

    if (currentIndex < quiz.questions.length - AppConfig.quiz.incrementOffset) {
      this.currentQuestionIndex.set(currentIndex + AppConfig.quiz.incrementOffset);
    } else {
      // Quiz complete
      this.isQuizComplete.set(true);
    }
  }

  /**
   * Get quiz results
   */
  getQuizResults(): QuizResult {
    const quiz = this.currentQuiz();
    
    return {
      quizId: quiz?.id || '',
      score: this.score(),
      totalQuestions: quiz?.questions.length || AppConfig.quiz.defaultQuestionCount,
      completedAt: new Date()
    };
  }

  /**
   * Reset quiz to initial state
   */
  resetQuiz(): void {
    const quiz = this.currentQuiz();
    if (quiz) {
      this.currentQuestionIndex.set(AppConfig.quiz.initialIndex);
      this.score.set(AppConfig.quiz.initialScore);
      this.questionAttempts.set(new Map());
      this.isQuizComplete.set(false);
    }
  }

  /**
   * Clear all quiz state
   */
  clearQuiz(): void {
    this.currentQuiz.set(null);
    this.currentQuestionIndex.set(AppConfig.quiz.initialIndex);
    this.score.set(AppConfig.quiz.initialScore);
    this.questionAttempts.set(new Map());
    this.isQuizComplete.set(false);
  }

  /**
   * Get encouraging message based on score
   */
  getEncouragingMessage(score: number, total: number): string {
    if (score >= AppConfig.quiz.scoring.excellent) {
      return 'Excellent! 🌟';
    } else if (score >= AppConfig.quiz.scoring.good) {
      return 'Great job! 👍';
    } else if (score >= AppConfig.quiz.scoring.passing) {
      return 'Good effort! Keep practicing! 📚';
    } else {
      return "Keep learning! You'll improve! 💪";
    }
  }
}
