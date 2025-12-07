import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of, catchError } from 'rxjs';
import { LessonItem, LessonGroup, LessonFileData } from '../models/lesson-item.interface';
import { AppConfig } from '../configuration/config';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private readonly http = inject(HttpClient);
  private readonly languageService = inject(LanguageService);
  private readonly lessonsCache = new Map<number, LessonItem[]>();
  private readonly lessonGroupsCache = new Map<string, LessonGroup>(); // key: "level-lessonNumber"
  private readonly currentLessonId = signal<string | null>(null);
  private readonly allLessons = signal<LessonItem[]>([]);

  constructor() {
    this.loadAllLessons();
  }

  /**
   * Load all lessons from JSON files
   */
  private loadAllLessons(): void {
    const levelFiles = Array.from(
      { length: AppConfig.lessons.totalLevels },
      (_, i) => this.languageService.config.lessonsPathTemplate.replace('{level}', String(i + AppConfig.lessons.firstLevelIndex))
    );

    const requests = levelFiles.map(file => 
      this.http.get<LessonItem[]>(file).pipe(
        map(lessons => lessons || [])
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const allLessons: LessonItem[] = [];
        
        results.forEach((lessons, index) => {
          const level = index + AppConfig.lessons.firstLevelIndex;
          this.lessonsCache.set(level, lessons);
          allLessons.push(...lessons);
        });

        this.allLessons.set(allLessons);
      },
      error: (error) => {
        console.error('Error loading lessons:', error);
        this.allLessons.set([]);
      }
    });
  }

  /**
   * Get all lessons for a specific level
   */
  getLessonsByLevel(level: number): Observable<LessonItem[]> {
    if (this.lessonsCache.has(level) && this.lessonsCache.get(level)!.length > AppConfig.lessons.navigation.firstIndex) {
      return of(this.lessonsCache.get(level) || []);
    }
    
    const filePath = this.languageService.config.lessonsPathTemplate.replace('{level}', String(level));
    return this.http.get<LessonItem[]>(filePath).pipe(
      map(lessons => {
        const lessonArray = lessons || [];
        if (!this.lessonsCache.has(level)) {
            this.lessonsCache.set(level, lessonArray);
        }
        return lessonArray;
      })
    );
  }

  /**
   * Get all lesson groups for a specific level
   * Attempts to load multiple lesson files (level-X-lesson-1.json, level-X-lesson-2.json, etc.)
   */
  getLessonGroupsByLevel(level: number): Observable<LessonGroup[]> {
    const maxLessons = AppConfig.lessons.maxLessonsPerLevel;
    const requests: Observable<LessonGroup | null>[] = [];

    // Try to load each potential lesson file
    for (let lessonNumber = 1; lessonNumber <= maxLessons; lessonNumber++) {
      const cacheKey = `${level}-${lessonNumber}`;
      
      // Check cache first
      if (this.lessonGroupsCache.has(cacheKey)) {
        requests.push(of(this.lessonGroupsCache.get(cacheKey)!));
      } else {
        requests.push(this.getLessonGroup(level, lessonNumber));
      }
    }

    return forkJoin(requests).pipe(
      map(groups => groups.filter(group => group !== null) as LessonGroup[])
    );
  }

  /**
   * Get a specific lesson group by level and lesson number
   */
  getLessonGroup(level: number, lessonNumber: number): Observable<LessonGroup | null> {
    const cacheKey = `${level}-${lessonNumber}`;
    
    if (this.lessonGroupsCache.has(cacheKey)) {
      return of(this.lessonGroupsCache.get(cacheKey)!);
    }

    const filePath = this.languageService.config.lessonsPathTemplate
      .replace('{level}', String(level))
      .replace('{lessonNumber}', String(lessonNumber));

    return this.http.get<LessonFileData | LessonItem[]>(filePath).pipe(
      map(data => {
        const lessonGroup = this.parseLessonFileData(data, level, lessonNumber);
        this.lessonGroupsCache.set(cacheKey, lessonGroup);
        return lessonGroup;
      }),
      catchError(() => of(null)) // Return null if file doesn't exist
    );
  }

  /**
   * Parse lesson file data (supports both old array format and new object format with metadata)
   */
  private parseLessonFileData(data: LessonFileData | LessonItem[], level: number, lessonNumber: number): LessonGroup {
    // Check if data is in new format with metadata
    if (data && typeof data === 'object' && 'items' in data) {
      const fileData = data as LessonFileData;
      return {
        level,
        lessonNumber,
        title: fileData.metadata?.title || `Lesson ${lessonNumber}`,
        description: fileData.metadata?.description,
        items: fileData.items
      };
    }
    
    // Old format: array of LessonItem
    const items = data as LessonItem[];
    return {
      level,
      lessonNumber,
      title: `Lesson ${lessonNumber}`,
      items
    };
  }

  /**
   * Get a lesson by its ID
   */
  getLessonById(id: string): LessonItem | null {
    const allLessons = this.allLessons();
    return allLessons.find(lesson => lesson.id === id) || null;
  }

  /**
   * Get the current lesson
   */
  getCurrentLesson(): LessonItem | null {
    const currentId = this.currentLessonId();
    if (!currentId) {
      return null;
    }
    return this.getLessonById(currentId);
  }

  /**
   * Set the current lesson by ID
   */
  setCurrentLesson(id: string): void {
    this.currentLessonId.set(id);
  }

  /**
   * Get the next lesson relative to the current one
   */
  getNextLesson(): LessonItem | null {
    const currentId = this.currentLessonId();
    if (!currentId) {
      return null;
    }

    const allLessons = this.allLessons();
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentId);
    
    if (currentIndex === -1 || currentIndex === allLessons.length - AppConfig.lessons.navigation.incrementOffset) {
      return null;
    }

    return allLessons[currentIndex + AppConfig.lessons.navigation.incrementOffset] || null;
  }

  /**
   * Get the previous lesson relative to the current one
   */
  getPreviousLesson(): LessonItem | null {
    const currentId = this.currentLessonId();
    if (!currentId) {
      return null;
    }

    const allLessons = this.allLessons();
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentId);
    
    if (currentIndex <= AppConfig.lessons.navigation.firstIndex) {
      return null;
    }

    return allLessons[currentIndex - AppConfig.lessons.navigation.decrementOffset] || null;
  }

  /**
   * Check if there is a next lesson
   */
  hasNextLesson(): boolean {
    return this.getNextLesson() !== null;
  }

  /**
   * Check if there is a previous lesson
   */
  hasPreviousLesson(): boolean {
    return this.getPreviousLesson() !== null;
  }
}

