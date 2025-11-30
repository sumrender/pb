import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LessonService } from '../../services/lesson.service';
import { LessonItem } from '../../models/lesson-item.interface';

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

  level = signal<number>(1);
  lessons = signal<LessonItem[]>([]);
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
    this.lessonService.getLessonsByLevel(this.level()).subscribe({
      next: (lessons) => {
        this.lessons.set(lessons);
        this.loading.set(false);
      },
      error: (error) => {
        this.lessons.set([]);
        this.loading.set(false);
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToLesson(lessonId: string): void {
    this.router.navigate(['/lesson', lessonId]);
  }

  startQuiz(): void {
    this.router.navigate(['/quiz', this.level(), 'active']);
  }

  getLessonTypeLabel(type: LessonItem['type']): string {
    return this.lessonTypeLabels()[type] || type;
  }

  getLessonDisplayContent(lesson: LessonItem): string {
    if (lesson.title) {
      return lesson.title;
    }
    
    if (lesson.type === 'paragraph' || lesson.type === 'story') {
      return lesson.gurmukhi.substring(0, 50) + '...';
    }

    return lesson.gurmukhi;
  }
}
