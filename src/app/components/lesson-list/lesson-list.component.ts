import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LessonService } from '../../services/lesson.service';
import { QuizService } from '../../services/quiz.service';
import { LessonItem, LessonGroup } from '../../models/lesson-item.interface';
import { Quiz } from '../../models/quiz.interface';

@Component({
  selector: 'app-lesson-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lesson-list.component.html',
  styleUrl: './lesson-list.component.scss'
})
export class LessonListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lessonService = inject(LessonService);
  private quizService = inject(QuizService);

  level = signal<number>(1);
  lessonGroups = signal<LessonGroup[]>([]);
  quizzes = signal<Quiz[]>([]);
  loading = signal<boolean>(false);
  
  readonly levelTitles = signal<Record<number, string>>({
    1: 'Alphabet Recognition',
    2: 'Words',
    3: 'Short Sentences',
    4: 'Paragraphs',
    5: 'Stories'
  });

  readonly lessonTypeLabels = signal<Record<string, string>>({
    letter: 'Letter',
    word: 'Word',
    sentence: 'Sentence',
    paragraph: 'Paragraph',
    story: 'Story'
  });

  levelTitle = computed(() => this.levelTitles()[this.level()] || `Level ${this.level()}`);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const levelParam = params['levelId'];
      const newLevel = parseInt(levelParam, 10);
      
      if (isNaN(newLevel) || newLevel < 1 || newLevel > 5) {
        this.router.navigate(['/']);
        return;
      }

      this.level.set(newLevel);
      this.loadLessons();
    });
  }

  loadLessons(): void {
    this.loading.set(true);
    this.lessonService.getLessonGroupsByLevel(this.level()).subscribe({
      next: (groups) => {
        this.lessonGroups.set(groups);
        this.loading.set(false);
      },
      error: (error) => {
        this.lessonGroups.set([]);
        this.loading.set(false);
      }
    });
    
    // Load available quizzes for this level
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getQuizzesByLevel(this.level()).subscribe({
      next: (quizzes) => {
        this.quizzes.set(quizzes);
      },
      error: (error) => {
        this.quizzes.set([]);
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToLesson(lessonId: string): void {
    this.router.navigate(['/lesson', lessonId]);
  }

  startQuiz(quizNumber: number = 1): void {
    this.router.navigate(['/quiz', this.level(), quizNumber, 'active']);
  }

  goToRandomPractice(): void {
    this.router.navigate(['/level', this.level(), 'random']);
  }

  getLessonTypeLabel(type: LessonItem['type']): string {
    return this.lessonTypeLabels()[type] || type;
  }

  getDisplayContent(lesson: LessonItem): string {
    if (lesson.title) {
      return lesson.title;
    }
    
    if (lesson.type === 'paragraph' || lesson.type === 'story') {
      return lesson.native.substring(0, 50) + '...';
    }

    return lesson.native;
  }
}
