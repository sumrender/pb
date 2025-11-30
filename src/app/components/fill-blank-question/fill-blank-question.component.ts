import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FillBlankQuestion } from '../../models/quiz.interface';

@Component({
  selector: 'app-fill-blank-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fill-blank-question.component.html',
  styleUrl: './fill-blank-question.component.scss'
})
export class FillBlankQuestionComponent {
  @Input({ required: true }) question!: FillBlankQuestion;
  @Output() answerSelected = new EventEmitter<number>();

  readonly selectedOption = signal<number | null>(null);
  readonly disabledOptions = signal<Set<number>>(new Set());
  readonly showFeedback = signal<boolean>(false);
  readonly isCorrect = signal<boolean>(false);

  selectOption(index: number): void {
    if (this.disabledOptions().has(index)) {
      return;
    }

    this.selectedOption.set(index);
    this.showFeedback.set(true);

    const correct = index === this.question.correctAnswerIndex;
    this.isCorrect.set(correct);

    if (!correct) {
      const disabled = new Set(this.disabledOptions());
      disabled.add(index);
      this.disabledOptions.set(disabled);
    }

    this.answerSelected.emit(index);
  }

  getDisplaySentence(): string {
    return this.question.sentence.replace('{{blank}}', '_____');
  }

  reset(): void {
    this.selectedOption.set(null);
    this.disabledOptions.set(new Set());
    this.showFeedback.set(false);
    this.isCorrect.set(false);
  }
}
