import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { QuizResult } from '../../models/quiz.interface';

@Component({
  selector: 'app-quiz-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-results.component.html',
  styleUrl: './quiz-results.component.scss'
})
export class QuizResultsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly quizService = inject(QuizService);

  readonly result = signal<QuizResult | null>(null);
  
  readonly percentage = computed(() => {
    const res = this.result();
    if (!res) return 0;
    return Math.round((res.score / res.totalQuestions) * 100);
  });

  readonly message = computed(() => {
    const res = this.result();
    if (!res) return '';
    return this.quizService.getEncouragingMessage(res.score, res.totalQuestions);
  });

  readonly performanceLevel = computed(() => {
    const score = this.result()?.score || 0;
    if (score >= 13) return 'excellent';
    if (score >= 10) return 'great';
    if (score >= 7) return 'good';
    return 'keep-learning';
  });

  ngOnInit(): void {
    const results = this.quizService.getQuizResults();
    this.result.set(results);
  }

  retryQuiz(): void {
    this.quizService.resetQuiz();
    const level = this.route.snapshot.paramMap.get('level');
    this.router.navigate(['/quiz', level, 'active']);
  }

  backToLessons(): void {
    this.quizService.clearQuiz();
    const level = this.route.snapshot.paramMap.get('level');
    this.router.navigate(['/level', level]);
  }
}
