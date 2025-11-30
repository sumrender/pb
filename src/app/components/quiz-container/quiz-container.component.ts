import { Component, inject, OnInit, ViewChild, ComponentRef, ViewContainerRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { MultipleChoiceQuestionComponent } from '../multiple-choice-question/multiple-choice-question.component';
import { FillBlankQuestionComponent } from '../fill-blank-question/fill-blank-question.component';
import { MultipleBlanksQuestionComponent } from '../multiple-blanks-question/multiple-blanks-question.component';
import { StorySequenceQuestionComponent } from '../story-sequence-question/story-sequence-question.component';

@Component({
  selector: 'app-quiz-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-container.component.html',
  styleUrl: './quiz-container.component.scss'
})
export class QuizContainerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly quizService = inject(QuizService);

  @ViewChild('questionContainer', { read: ViewContainerRef }) questionContainer!: ViewContainerRef;

  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly needsRender = signal<boolean>(false);
  private questionComponentRef: ComponentRef<any> | null = null;

  constructor() {
    // Use effect to render question when needed and container is available
    effect(() => {
      if (this.needsRender() && this.questionContainer) {
        this.renderQuestion();
        this.needsRender.set(false);
      }
    });
  }

  ngOnInit(): void {
    const levelParam = this.route.snapshot.paramMap.get('level');
    const level = levelParam ? parseInt(levelParam, 10) : null;

    if (!level || level < 1 || level > 5) {
      this.error.set('Invalid quiz level');
      this.isLoading.set(false);
      return;
    }

    this.quizService.loadQuiz(level).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Trigger render after loading complete
        setTimeout(() => {
          this.needsRender.set(true);
        }, 100);
      },
      error: (err) => {
        console.error('Error loading quiz:', err);
        this.error.set('Failed to load quiz. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  renderQuestion(): void {
    const question = this.quizService.getCurrentQuestion();
    if (!question || !this.questionContainer) {
      return;
    }

    // Clear previous component
    if (this.questionComponentRef) {
      this.questionComponentRef.destroy();
    }
    this.questionContainer.clear();

    // Create appropriate component based on question type
    let componentRef: ComponentRef<any>;

    switch (question.type) {
      case 'alphabet':
      case 'word':
        componentRef = this.questionContainer.createComponent(MultipleChoiceQuestionComponent);
        componentRef.instance.question = question;
        componentRef.instance.answerSelected.subscribe((answer: number) => {
          this.handleAnswer(answer);
        });
        break;

      case 'sentence':
        componentRef = this.questionContainer.createComponent(FillBlankQuestionComponent);
        componentRef.instance.question = question;
        componentRef.instance.answerSelected.subscribe((answer: number) => {
          this.handleAnswer(answer);
        });
        break;

      case 'paragraph':
        componentRef = this.questionContainer.createComponent(MultipleBlanksQuestionComponent);
        componentRef.instance.question = question;
        componentRef.instance.answerSelected.subscribe((answer: number[]) => {
          this.handleAnswer(answer);
        });
        break;

      case 'story':
        componentRef = this.questionContainer.createComponent(StorySequenceQuestionComponent);
        componentRef.instance.question = question;
        componentRef.instance.answerSubmitted.subscribe((answer: number[]) => {
          this.handleAnswer(answer);
        });
        break;

      default:
        return;
    }

    this.questionComponentRef = componentRef;
  }

  handleAnswer(answer: any): void {
    const feedback = this.quizService.submitAnswer(answer);

    if (feedback.isCorrect) {
      // Auto-advance after 1 second
      setTimeout(() => {
        this.nextQuestion();
      }, 1000);
    }
  }

  nextQuestion(): void {
    this.quizService.nextQuestion();

    if (this.quizService.quizComplete()) {
      // Navigate to results
      const level = this.route.snapshot.paramMap.get('level');
      this.router.navigate(['/quiz', level, 'results']);
    } else {
      // Render next question
      setTimeout(() => {
        this.needsRender.set(true);
      }, 100);
    }
  }

  get progress() {
    return this.quizService.progress();
  }

  get currentScore() {
    return this.quizService.currentScore();
  }

  exitQuiz(): void {
    const level = this.route.snapshot.paramMap.get('level');
    this.router.navigate(['/level', level]);
  }
}

