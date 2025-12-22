import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RandomService } from '../../services/random.service';
import { LessonItem } from '../../models/lesson-item.interface';

@Component({
  selector: 'app-random-practice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './random-practice.component.html',
  styleUrl: './random-practice.component.scss'
})
export class RandomPracticeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private randomService = inject(RandomService);

  level = signal<number>(1);
  items = signal<LessonItem[]>([]);
  loading = signal<boolean>(false);
  processedItems = new Set<string>(); // Tracks items marked as read in THIS session
  isFinished = signal<boolean>(false);
  currentIndex = signal<number>(0);
  showTransliteration = signal<boolean>(false);
  
  // Audio playback
  currentAudio: HTMLAudioElement | null = null;
  playingAudioId = signal<string | null>(null);

  // Computed signals
  currentItem = computed<LessonItem | null>(() => {
    const items = this.items();
    const index = this.currentIndex();
    return items.length > 0 && index >= 0 && index < items.length ? items[index] : null;
  });

  hasPrevious = computed<boolean>(() => {
    return this.currentIndex() > 0;
  });

  hasNext = computed<boolean>(() => {
    const items = this.items();
    return this.currentIndex() < items.length - 1;
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const levelId = parseInt(params['levelId'], 10);
      if (!isNaN(levelId)) {
        this.level.set(levelId);
        this.loadItems();
      }
    });
  }

  loadItems(): void {
    this.loading.set(true);
    this.items.set([]);
    this.isFinished.set(false);
    this.currentIndex.set(0);
    this.showTransliteration.set(false);
    
    this.randomService.getRandomItems(this.level()).subscribe({
      next: (items) => {
        if (items.length === 0) {
          this.isFinished.set(true);
        } else {
          this.items.set(items);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load random items', err);
        this.loading.set(false);
      }
    });
  }

  markAsRead(item: LessonItem): void {
     // Optimistically update UI specific logic if needed, but here we just toggle
     // In a real app we might want to wait for "Next Batch" to commit, 
     // but the requirement says "Mask items as Read as I complete them".
     // We will save state immediately for simplicity.
     
     if (this.processedItems.has(item.id)) {
       // already processed/read
       return;
     }
     
     this.processedItems.add(item.id);
     this.randomService.markAsRead(this.level(), [item.id]);
  }
  
  isRead(item: LessonItem): boolean {
    return this.processedItems.has(item.id);
  }

  playAudio(event: Event): void {
    event.stopPropagation();
    const item = this.currentItem();
    if (!item) return;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    if (this.playingAudioId() === item.id) {
      this.playingAudioId.set(null);
      return;
    }

    if (item.audioSrc) {
      this.currentAudio = new Audio(item.audioSrc);
      this.playingAudioId.set(item.id);
      
      this.currentAudio.play().catch(e => console.error('Error playing audio', e));
      
      this.currentAudio.onended = () => {
        this.playingAudioId.set(null);
        this.currentAudio = null;
      };
    }
  }

  toggleTransliteration(): void {
    this.showTransliteration.update(v => !v);
  }

  toggleRead(event: Event): void {
    event.stopPropagation();
    const item = this.currentItem();
    if (!item) return;

    if (this.isRead(item)) {
        // Optional: Allow un-marking? 
        // Service only has 'markAsRead'. 'Unmark' is tricky if we don't expose it.
        // For this iteration, let's assume one-way "Mark as Read" or maybe just don't do anything if already read.
        // But user might accidentally click.
        // For simplicty, let's just re-add to processed (no-op) or ignore.
        // If we want to support un-checking, we'd need 'unmarkAsRead' in service.
        // Let's stick to accumulating 'read' items.
    } else {
        this.markAsRead(item);
    }
  }

  isReadForCurrentItem(): boolean {
    const item = this.currentItem();
    return item ? this.isRead(item) : false;
  }

  loadMore(): void {
    this.loadItems();
    this.processedItems.clear(); // Reset session set for new batch? 
    // Actually, processedItems is for UI feedback "checked". 
    // If we load more, the new items are definitely not read (filtered by service).
    // So clearing is correct.
    this.currentIndex.set(0);
    this.showTransliteration.set(false);
  }

  goToPrevious(): void {
    if (this.hasPrevious()) {
      this.currentIndex.update(idx => idx - 1);
      this.showTransliteration.set(false);
      // Stop audio when navigating
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.playingAudioId.set(null);
      }
    }
  }

  goToNext(): void {
    if (this.hasNext()) {
      this.currentIndex.update(idx => idx + 1);
      this.showTransliteration.set(false);
      // Stop audio when navigating
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.playingAudioId.set(null);
      }
    }
  }

  resetHistory(): void {
    if(confirm('Are you sure you want to reset your practice history for this level? All items will appear again.')) {
        this.randomService.resetProgress(this.level());
        this.loadItems();
    }
  }

  goBack(): void {
    this.router.navigate(['/level', this.level()]);
  }
}
