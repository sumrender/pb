import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultipleChoiceQuestion } from '../../models/quiz.interface';

@Component({
  selector: 'app-multiple-choice-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiple-choice-question.component.html',
  styleUrl: './multiple-choice-question.component.scss'
})
export class MultipleChoiceQuestionComponent {
  @Input({ required: true }) question!: MultipleChoiceQuestion;
  @Output() answerSelected = new EventEmitter<number>();

  readonly selectedOption = signal<number | null>(null);
  readonly disabledOptions = signal<Set<number>>(new Set());
  readonly showFeedback = signal<boolean>(false);
  readonly isCorrect = signal<boolean>(false);

  selectOption(index: number): void {
    // Don't allow selecting disabled options
    if (this.disabledOptions().has(index)) {
      return;
    }

    this.selectedOption.set(index);
    this.showFeedback.set(true);

    const correct = index === this.question.correctAnswerIndex;
    this.isCorrect.set(correct);

    if (!correct) {
      // Disable this option for future attempts
      const disabled = new Set(this.disabledOptions());
      disabled.add(index);
      this.disabledOptions.set(disabled);
    }

    // Emit the answer
    this.answerSelected.emit(index);
  }

  reset(): void {
    this.selectedOption.set(null);
    this.disabledOptions.set(new Set());
    this.showFeedback.set(false);
    this.isCorrect.set(false);
  }
}
