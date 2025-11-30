# Product Requirements Document (PRD)

## Punjabi Reading Web App — Quiz Feature

### 1. Feature Summary

An interactive quiz system to assess and reinforce learning across all five levels of the Punjabi Reading Web App. Each quiz consists of 15 questions tailored to the content type (Alphabets, Words, Short Sentences, Paragraphs, Stories), with immediate feedback and simple scoring.

**Goal**: Provide learners with an engaging way to test their comprehension and reinforce their Gurmukhi reading skills.

### 2. User Goals

- Test their understanding of Gurmukhi letters, words, and sentence structures.
- Receive immediate feedback on their answers.
- Practice until they select the correct answer.
- Track their performance with simple scoring.
- Progress through different quiz types matching their learning level.

### 3. Feature Scope

#### Included

- **Quiz Types**: 5 distinct quiz formats (one per level).
- **Question Count**: 15 questions per quiz.
- **Core Mechanics**:
  - Multiple-choice questions with 4 options.
  - Immediate feedback on selection.
  - Multiple attempts until correct answer is found.
  - Simple scoring (1 point for first-try correct, 0 otherwise).
  - Results summary at quiz completion.
- **Navigation**: Start Quiz, Next Question, View Results, Retry Quiz.

#### Excluded (Out of Scope)

- ❌ Progress tracking across sessions.
- ❌ Leaderboards or competitive features.
- ❌ Adaptive difficulty.
- ❌ Time limits or timed challenges.
- ❌ Detailed analytics or performance graphs.
- ❌ Quiz customization (question count, difficulty levels).

### 4. Quiz Types & Mechanics

#### 4.1 Level 1: Alphabet Recognition Quiz

**Format**: Multiple Choice - Audio/Visual Recognition

**Question Structure**:

- Display: Transliteration of a Gurmukhi letter (e.g., "Kakka")
- Task: Select the correct Gurmukhi character from 4 options
- Options: 4 Gurmukhi characters (ਕ, ਖ, ਗ, ਘ)

**Interaction Flow**:

1. User sees transliteration.
2. User selects one of 4 Gurmukhi character options.
3. **If Correct**:
   - Show green checkmark/highlight on selected option.
   - Display "Correct! ✓" message.
   - Auto-advance to next question after 1 second.
   - Award 1 point.
4. **If Incorrect**:
   - Show red X/highlight on selected option.
   - Disable the incorrect option (greyed out).
   - Display "Try again" message.
   - Allow user to select from remaining options.
   - Award 0 points (even if eventually correct).
5. Repeat until correct answer is selected.

---

#### 4.2 Level 2: Word Recognition Quiz

**Format**: Multiple Choice - Transliteration to Gurmukhi

**Question Structure**:

- Display: Transliteration of a Punjabi word (e.g., "Ghar")
- Task: Select the correct Gurmukhi word from 4 options
- Options: 4 Gurmukhi words (ਘਰ, ਗਰ, ਖਰ, ਘਾਰ)

**Interaction Flow**:

- Same as Alphabet Quiz (Section 4.1)
- Shows transliteration, user picks matching Gurmukhi word
- Multiple attempts with disabled incorrect options

---

#### 4.3 Level 3: Short Sentence Quiz (Fill in the Blank)

**Format**: Fill in the Blank

**Question Structure**:

- Display: A short sentence in Gurmukhi with one word replaced by a blank (e.g., "ਮੈਂ \_\_\_\_ ਜਾਂਦਾ ਹਾਂ")
- Hint: Transliteration or English meaning of the complete sentence
- Task: Select the missing word from 4 options
- Options: 4 Gurmukhi words (ਘਰ, ਸਕੂਲ, ਬਾਜ਼ਾਰ, ਪਾਰਕ)

**Interaction Flow**:

- Same feedback mechanism as previous quizzes
- User selects the word that correctly completes the sentence
- Multiple attempts with disabled incorrect options

---

#### 4.4 Level 4: Paragraph Quiz (Multiple Blanks)

**Format**: Fill in Multiple Blanks

**Question Structure**:

- Display: A paragraph in Gurmukhi with 2-3 words replaced by numbered blanks
- Example: "ਮੇਰਾ **(1)** ਬਹੁਤ **(2)** ਹੈ। ਇਹ **(3)** ਵਿੱਚ ਹੈ।"
- Task: Fill each blank sequentially from 4 options per blank
- Options: 4 Gurmukhi words for each blank position

**Interaction Flow**:

1. Display paragraph with Blank #1 highlighted.
2. Show 4 options for Blank #1.
3. User selects answer with same feedback as previous quizzes.
4. Once Blank #1 is correctly filled, move to Blank #2.
5. Repeat until all blanks are filled.
6. **Scoring**: Award 1 point only if ALL blanks are filled correctly on first try, 0 otherwise.
7. Move to next question.

---

#### 4.5 Level 5: Story Sequencing Quiz

**Format**: Sequence Ordering

**Question Structure**:

- Display: A short story broken into 4-5 lines, presented in random order
- Task: Arrange the lines in the correct chronological order
- Options: Numbered positions (1st, 2nd, 3rd, 4th, 5th)

**Interaction Flow**:

1. Display all story lines in a randomized order.
2. Each line has a dropdown/selector to assign its position (1-5).
3. User assigns positions to all lines.
4. User submits their arrangement.
5. **If Correct**:
   - Show "Correct! ✓" with all lines highlighted green.
   - Display the story in correct order.
   - Award 1 point.
   - Auto-advance after 2 seconds.
6. **If Incorrect**:
   - Show red highlight on incorrectly positioned lines.
   - Keep correct ones in green.
   - Display "Try again" message.
   - Award 0 points.
   - Allow user to rearrange and resubmit.
7. Repeat until correct sequence is achieved.

---

### 5. User Flows

#### 5.1 Starting a Quiz

1. User navigates to a level (e.g., Level 2: Words).
2. User clicks "Start Quiz" button.
3. Quiz interface loads with Question 1/15.

#### 5.2 Answering Questions

1. User reads the question and options.
2. User selects an option.
3. System provides immediate feedback (correct/incorrect).
4. **If incorrect**: Option is disabled, user tries again.
5. **If correct**: Question auto-advances after brief delay.

#### 5.3 Completing the Quiz

1. After Question 15 is answered correctly:
2. Display Results Summary screen:
   - **Score**: "You scored 12/15" (count of first-try correct answers)
   - **Percentage**: "80% First-Try Accuracy"
   - **Message**: Encouraging feedback based on score
     - 13-15: "Excellent! 🌟"
     - 10-12: "Great job! 👍"
     - 7-9: "Good effort! Keep practicing! 📚"
     - 0-6: "Keep learning! You'll improve! 💪"
3. Options:
   - "Retry Quiz" — Restart with different questions
   - "Back to Lessons" — Return to lesson list

---

### 6. Data Model & Content Structure

Content will be stored in static JSON files under `src/assets/quizzes/`.

**Strict Typing**: All quiz data must use TypeScript interfaces. No `any` types allowed.

#### Interface Definitions

```typescript
/**
 * Base interface for all quiz questions
 */
interface BaseQuizQuestion {
  id: string;
  level: number; // 1-5
  type: 'alphabet' | 'word' | 'sentence' | 'paragraph' | 'story';
}

/**
 * Level 1 & 2: Multiple choice questions
 */
interface MultipleChoiceQuestion extends BaseQuizQuestion {
  type: 'alphabet' | 'word';
  prompt: string; // Transliteration shown to user
  options: string[]; // 4 Gurmukhi options
  correctAnswerIndex: number; // 0-3
}

/**
 * Level 3: Fill in the blank (single blank)
 */
interface FillBlankQuestion extends BaseQuizQuestion {
  type: 'sentence';
  sentence: string; // Gurmukhi with {{blank}} placeholder
  transliteration: string; // Full sentence transliteration
  meaning?: string; // Optional English meaning
  options: string[]; // 4 Gurmukhi word options
  correctAnswerIndex: number; // 0-3
}

/**
 * Level 4: Fill in the blank (multiple blanks)
 */
interface MultipleBlanksQuestion extends BaseQuizQuestion {
  type: 'paragraph';
  paragraph: string; // Gurmukhi with {{blank1}}, {{blank2}}, etc.
  transliteration?: string;
  blanks: Array<{
    blankId: string; // "blank1", "blank2", etc.
    options: string[]; // 4 options for this blank
    correctAnswerIndex: number; // 0-3
  }>;
}

/**
 * Level 5: Story sequencing
 */
interface StorySequenceQuestion extends BaseQuizQuestion {
  type: 'story';
  storyTitle?: string;
  lines: string[]; // 4-5 Gurmukhi lines in CORRECT order
  // UI will randomize display order
}

/**
 * Union type for all question types
 */
type QuizQuestion =
  | MultipleChoiceQuestion
  | FillBlankQuestion
  | MultipleBlanksQuestion
  | StorySequenceQuestion;

/**
 * Quiz container
 */
interface Quiz {
  id: string;
  level: number;
  title: string;
  questions: QuizQuestion[]; // Exactly 15 questions
}

/**
 * Quiz result tracking
 */
interface QuizResult {
  quizId: string;
  score: number; // 0-15 (count of first-try correct answers)
  totalQuestions: number; // Always 15
  completedAt: Date;
}
```

#### Example JSON Structure

**`src/assets/quizzes/level-1-alphabets.json`**:

```json
{
  "id": "quiz-level1-alphabets-01",
  "level": 1,
  "title": "Alphabet Recognition Quiz",
  "questions": [
    {
      "id": "q1",
      "level": 1,
      "type": "alphabet",
      "prompt": "Kakka",
      "options": ["ਕ", "ਖ", "ਗ", "ਘ"],
      "correctAnswerIndex": 0
    },
    {
      "id": "q2",
      "level": 1,
      "type": "alphabet",
      "prompt": "Gagga",
      "options": ["ਕ", "ਖ", "ਗ", "ਘ"],
      "correctAnswerIndex": 2
    }
    // ... 13 more questions
  ]
}
```

---

### 7. Technical Specifications

#### 7.1 New Services

**`QuizService`**:

- Loads quiz data from JSON files.
- Manages current quiz state (current question, score, attempts).
- Tracks user answers and calculates score.
- Provides quiz results.

**Methods**:

```typescript
class QuizService {
  loadQuiz(level: number): Observable<Quiz>;
  getCurrentQuestion(): QuizQuestion | null;
  submitAnswer(answer: any): AnswerFeedback;
  nextQuestion(): void;
  getQuizResults(): QuizResult;
  resetQuiz(): void;
}

interface AnswerFeedback {
  isCorrect: boolean;
  isFirstAttempt: boolean;
  message: string;
}
```

#### 7.2 New Components

1. **`QuizListComponent`**:

   - Displays available quizzes for current level.
   - "Start Quiz" button.

2. **`QuizContainerComponent`**:

   - Main quiz interface wrapper.
   - Progress indicator (Question X/15).
   - Score display.

3. **`QuestionComponent`**:

   - Renders question based on type (uses dynamic component loading or ngSwitch).
   - Handles answer submission.
   - Shows feedback.

4. **`MultipleChoiceQuestionComponent`**:

   - For Levels 1 & 2.
   - Renders prompt and 4 options.
   - Handles option selection and disabling.

5. **`FillBlankQuestionComponent`**:

   - For Level 3.
   - Renders sentence with blank.
   - Handles option selection.

6. **`MultipleBlanksQuestionComponent`**:

   - For Level 4.
   - Renders paragraph with multiple blanks.
   - Sequential blank filling.

7. **`StorySequenceQuestionComponent`**:

   - For Level 5.
   - Drag-and-drop OR dropdown selectors for ordering.
   - Validation and feedback.

8. **`QuizResultsComponent`**:
   - Displays final score and percentage.
   - Encouraging message.
   - "Retry" and "Back to Lessons" buttons.

#### 7.3 State Management

Use Angular Signals or a simple service-based state:

```typescript
interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  score: number;
  questionAttempts: Map<string, number>; // Track attempts per question
  isQuizComplete: boolean;
}
```

#### 7.4 UI/UX Guidelines

**Feedback Colors**:

- **Correct**: Green (#4CAF50) with checkmark icon (✓)
- **Incorrect**: Red (#F44336) with X icon (✗)
- **Disabled**: Grey (#9E9E9E) with reduced opacity

**Animations**:

- Smooth transitions between questions (fade in/out).
- Pulse animation on correct answer.
- Shake animation on incorrect answer.

**Accessibility**:

- ARIA labels for all interactive elements.
- Keyboard navigation support.
- Screen reader announcements for feedback.

**Responsive Design**:

- Mobile-first approach.
- Touch-friendly buttons (minimum 44x44px).
- Readable font sizes on all devices.

---

### 8. Success Criteria

- Users can complete all 5 quiz types without confusion.
- Feedback is immediate and clear (< 200ms response time).
- Scoring accurately reflects first-try correctness.
- Interface is accessible and mobile-friendly.
- Users find quizzes engaging and educational.

---

### 9. Future Enhancements (Post-MVP)

- Timed quiz mode for advanced learners.
- Detailed analytics and progress tracking.
- Adaptive difficulty based on performance.
- Spaced repetition for incorrect answers.
- Custom quiz creation from lesson content.
- Audio pronunciation for questions/options.
