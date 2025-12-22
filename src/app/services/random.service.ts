import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { LessonItem } from '../models/lesson-item.interface';

@Injectable({
  providedIn: 'root'
})
export class RandomService {
  private http = inject(HttpClient);
  
  // Cache for loaded items
  private itemsCache = new Map<number, LessonItem[]>();

  getReadItems(level: number): Set<string> {
    const key = `random_read_level_${level}`;
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set<string>();
  }

  saveReadItems(level: number, readItems: Set<string>): void {
    const key = `random_read_level_${level}`;
    localStorage.setItem(key, JSON.stringify(Array.from(readItems)));
  }

  getRandomItems(level: number, batchSize: number = 10): Observable<LessonItem[]> {
    return this.getItemsForLevel(level).pipe(
      map(items => {
        const readItems = this.getReadItems(level);
        
        // Filter out read items
        let availableItems = items.filter(item => !readItems.has(item.id));
        
        // If all items are read or fewer than batchSize remain, you might want to 
        // return what's left or optionally reset/reshuffle. 
        // Requirement says: "show only unread items".
        // If 0 items, we return empty array, component handles "All caught up".
        
        if (availableItems.length === 0) {
          return [];
        }

        // Shuffle
        availableItems = this.shuffleArray(availableItems);

        // Take batchSize
        return availableItems.slice(0, batchSize);
      })
    );
  }

  private getItemsForLevel(level: number): Observable<LessonItem[]> {
    if (this.itemsCache.has(level)) {
      return of(this.itemsCache.get(level)!);
    }

    const path = `assets/punjabi/random/level-${level}-random.json`;
    return this.http.get<LessonItem[]>(path).pipe(
      tap(items => this.itemsCache.set(level, items))
    );
  }

  markAsRead(level: number, itemIds: string[]): void {
    const readItems = this.getReadItems(level);
    itemIds.forEach(id => readItems.add(id));
    this.saveReadItems(level, readItems);
  }

  resetProgress(level: number): void {
    const key = `random_read_level_${level}`;
    localStorage.removeItem(key);
  }

  getProgress(level: number): Observable<{ total: number, read: number }> {
     return this.getItemsForLevel(level).pipe(
       map(items => {
         const readItems = this.getReadItems(level);
         return {
           total: items.length,
           read: readItems.size
         };
       })
     );
  }

  private shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}
