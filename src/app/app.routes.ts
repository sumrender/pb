import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LessonListComponent } from './components/lesson-list/lesson-list.component';
import { LessonViewerComponent } from './components/lesson-viewer/lesson-viewer.component';
import { SettingsComponent } from './components/settings/settings.component';
import { QuizContainerComponent } from './components/quiz-container/quiz-container.component';
import { QuizResultsComponent } from './components/quiz-results/quiz-results.component';
import { RandomPracticeComponent } from './components/random-practice/random-practice.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'level/:levelId', component: LessonListComponent },
  { path: 'level/:levelId/random', component: RandomPracticeComponent },
  { path: 'lesson/:lessonId', component: LessonViewerComponent },
  { path: 'quiz/:level/:quizNumber/active', component: QuizContainerComponent },
  { path: 'quiz/:level/:quizNumber/results', component: QuizResultsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
