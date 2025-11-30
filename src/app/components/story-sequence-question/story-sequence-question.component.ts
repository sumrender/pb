import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorySequenceQuestion } from '../../models/quiz.interface';

interface StoryLine {
  text: string;
  originalIndex: number;
  assignedPosition: number | null;
}

@Component({
  selector: 'app-story-sequence-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './story-sequence-question.component.html',
  styleUrl: './story-sequence-question.component.scss'
})
export class StorySequenceQuestionComponent {
  @Input({ required: true }) question!: StorySequenceQuestion;
  @Output() answerSubmitted = new EventEmitter<number[]>();

  readonly storyLines = signal<StoryLine[]>([]);
  readonly showFeedback = signal<boolean>(false);
  readonly isCorrect = signal<boolean>(false);
  readonly correctPositions = signal<Set<number>>(new Set());

  readonly positions = computed(() => {
    return Array.from({ length: this.question.lines.length }, (_, i) => i + 1);
  });

  readonly canSubmit = computed(() => {
    const lines = this.storyLines();
    return lines.every(line => line.assignedPosition !== null);
  });

  ngOnInit(): void {
    this.initializeStoryLines();
  }

  initializeStoryLines(): void {
    // Randomize story lines
    const lines = this.question.lines.map((text, index) => ({
      text,
      originalIndex: index,
      assignedPosition: null
    }));
    
    // Shuffle the lines
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    
    this.storyLines.set(lines);
  }

  onPositionChange(lineIndex: number, position: number | null): void {
    const lines = [...this.storyLines()];
    
    // Remove this position from other lines first
    if (position !== null) {
      lines.forEach((line, idx) => {
        if (idx !== lineIndex && line.assignedPosition === position) {
          line.assignedPosition = null;
        }
      });
    }
    
    lines[lineIndex].assignedPosition = position;
    this.storyLines.set(lines);
  }

  submitAnswer(): void {
    if (!this.canSubmit()) {
      return;
    }

    const lines = this.storyLines();
    
    // Create array where index is assigned position, value is original index
    const sequence: number[] = Array(lines.length).fill(-1);
    lines.forEach(line => {
      if (line.assignedPosition !== null) {
        sequence[line.assignedPosition - 1] = line.originalIndex;
      }
    });

    // Check if correct
    const correct = sequence.every((originalIdx, pos) => originalIdx === pos);
    this.isCorrect.set(correct);
    this.showFeedback.set(true);

    if (correct) {
      // All correct
      this.correctPositions.set(new Set(this.positions()));
      setTimeout(() => {
        this.answerSubmitted.emit(sequence);
      }, 2000);
    } else {
      // Mark individual positions as correct/incorrect
      const correctSet = new Set<number>();
      sequence.forEach((originalIdx, pos) => {
        if (originalIdx === pos) {
          correctSet.add(pos + 1);
        }
      });
      this.correctPositions.set(correctSet);
    }
  }

  getSortedLines(): StoryLine[] {
    if (!this.isCorrect()) {
      return this.storyLines();
    }
    
    // Show in correct order when complete
    return [...this.storyLines()].sort((a, b) => a.originalIndex - b.originalIndex);
  }

  getLineStatus(line: StoryLine): 'correct' | 'incorrect' | 'none' {
    if (!this.showFeedback() || line.assignedPosition === null) {
      return 'none';
    }
    
    const isCorrectPosition = line.originalIndex === line.assignedPosition - 1;
    return isCorrectPosition ? 'correct' : 'incorrect';
  }

  reset(): void {
    this.initializeStoryLines();
    this.showFeedback.set(false);
    this.isCorrect.set(false);
    this.correctPositions.set(new Set());
  }
}
