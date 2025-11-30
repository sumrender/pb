import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultipleBlanksQuestion } from '../../models/quiz.interface';

@Component({
  selector: 'app-multiple-blanks-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiple-blanks-question.component.html',
  styleUrl: './multiple-blanks-question.component.scss'
})
export class MultipleBlanksQuestionComponent {
  @Input({ required: true }) question!: MultipleBlanksQuestion;
  @Output() answerSelected = new EventEmitter<number[]>();

  readonly currentBlankIndex = signal<number>(0);
  readonly blankAnswers = signal<(number | null)[]>([]);
  readonly disabledOptions = signal<Set<number>>(new Set());
  readonly showFeedback = signal<boolean>(false);
  readonly isCorrect = signal<boolean>(false);

  readonly currentBlank = computed(() => {
    const index = this.currentBlankIndex();
    return this.question.blanks[index] || null;
  });

  readonly isComplete = computed(() => {
    const answers = this.blankAnswers();
    return answers.length === this.question.blanks.length && 
           answers.every(a => a !== null);
  });

  ngOnInit(): void {
    // Initialize blank answers array
    this.blankAnswers.set(Array(this.question.blanks.length).fill(null));
  }

  selectOption(optionIndex: number): void {
    if (this.disabledOptions().has(optionIndex)) {
      return;
    }

    const currentIndex = this.currentBlankIndex();
    const currentBlank = this.currentBlank();
    
    if (!currentBlank) {
      return;
    }

    const isCorrect = optionIndex === currentBlank.correctAnswerIndex;

    if (isCorrect) {
      // Update the answer for this blank
      const answers = [...this.blankAnswers()];
      answers[currentIndex] = optionIndex;
      this.blankAnswers.set(answers);

      // Move to next blank if available
      if (currentIndex < this.question.blanks.length - 1) {
        setTimeout(() => {
          this.currentBlankIndex.set(currentIndex + 1);
          this.disabledOptions.set(new Set());
        }, 500);
      } else {
        // All blanks filled, emit answer
        this.showFeedback.set(true);
        this.isCorrect.set(true);
        setTimeout(() => {
          this.answerSelected.emit(answers as number[]);
        }, 1000);
      }
    } else {
      // Incorrect answer - disable this option
      const disabled = new Set(this.disabledOptions());
      disabled.add(optionIndex);
      this.disabledOptions.set(disabled);
      
      // Show temporary feedback
      this.showFeedback.set(true);
      this.isCorrect.set(false);
      setTimeout(() => {
        this.showFeedback.set(false);
      }, 1000);
    }
  }

  getDisplayParagraph(): string {
    let paragraph = this.question.paragraph;
    const answers = this.blankAnswers();
    
    this.question.blanks.forEach((blank, index) => {
      const answer = answers[index];
      let replacement: string;
      
      if (answer !== null) {
        replacement = `<span class="filled-blank">${blank.options[answer]}</span>`;
      } else if (index === this.currentBlankIndex()) {
        replacement = `<span class="active-blank">_____</span>`;
      } else {
        replacement = `<span class="empty-blank">_____</span>`;
      }
      
      paragraph = paragraph.replace(`{{${blank.blankId}}}`, replacement);
    });
    
    return paragraph;
  }

  reset(): void {
    this.currentBlankIndex.set(0);
    this.blankAnswers.set(Array(this.question.blanks.length).fill(null));
    this.disabledOptions.set(new Set());
    this.showFeedback.set(false);
    this.isCorrect.set(false);
  }
}
