# Product Requirement Document: Random Practice Mode

## 1. Overview

This feature introduces a "Random Practice" section within each Level of the Punjabi Reading App. It allows users to practice with a large pool of random words and sentences, serving as a supplement to the structured lessons and quizzes. The system ensures a fresh set of content by tracking "read" items and filtering them out in subsequent sessions.

## 2. User Stories

- **As a user**, I want to see a "Random Practice" section in the Level details page so that I can access extra practice material.
- **As a user**, I want to load a batch of 10 random items (words/sentences) at a time.
- **As a user**, I want to mark items as "Read" as I complete them.
- **As a user**, I want the system to remember which items I've read and show me _only_ unread items in future sessions.
- **As a user**, I want a way to "Reset History" for a level so I can start over with the full pool of random items.

## 3. User Flow & UI/UX

### 3.1 Level Dashboard (`LessonListComponent`)

- **Current State**: Lists "Lessons" and "Quizzes".
- **New State**: logic to display a **Random Practice** section, distinct from Lessons and Quizzes.
- **Elements**:
  - A card or button titled "Random Practice".
  - Descriptions: "Master words and sentences with randomized sets."
  - Call to Action: "Start Practice".
  - (Optional) Progress indicator: "X / Y items mastered".

### 3.2 Random Practice View (New Page `RandomPracticeComponent`)

- **Header**: Title (e.g., "Level 1 Random Practice") and a "Back" button.
- **Content Area**:
  - Should fetch a list of random items that are not read from RandomService
  - Display an item on a card with side navigation buttons to move to prev or next card
  - Each item card displays:
    - Native script (Punjabi).
    - Transliteration (only visible on user click)
    - **"Mark as Read" Action**: A checkbox or toggle button to mark the item as mastered.
- **Footer / Controls**:
  - **"Load More / Next Set"**: If the user finishes the current 10 (or wants to skip), they can load another batch.
  - **"Reset History"**: A button (likely in a menu or at bottom) to clear the "Read" status for this level.
  - **"Empty State"**: If all items are visited, show a celebration message and prompt to "Reset History" to practice again.

## 4. Technical Architecture

### 4.1 Data Model

- **File Structure**: New JSON assets per level.
  - Path: `assets/punjabi/random/level-{level}-random.json`
- **Content Mapping**: Each level will strictly contain items of its corresponding type:
  - **Level 1**: Alphabets (Letters)
  - **Level 2**: Words
  - **Level 3**: Sentences
  - **Level 4**: Paragraphs
  - **Level 5**: Stories
- **Schema**: Array of `LessonItem` (reusing existing interface).
  ```typescript
  // Reusing LessonItem from existing models
  interface LessonItem {
    id: string; // Critical: Must have unique IDs for tracking
    level: number;
    type: 'letter' | 'word' | 'sentence' | 'paragraph' | 'story'; // Strict type per level
    native: string;
    transliteration: string;
    audioSrc?: string;
  }
  ```

### 4.2 Services

#### `RandomService` (New)

- **Responsibilities**:
  - Fetch random items for a specific level.
  - Manage "Read" state persistence (LocalStorage).
  - Filter out read items before returning the batch.
- **Key Methods**:
  - `getRandomItems(level: number, batchSize: number = 10): Observable<LessonItem[]>`
    - Logic: Load all items -> Filter out IDs in `readItems` -> Shuffle -> Slice(0, batchSize).
  - `markAsRead(level: number, itemIds: string[]): void`
    - Logic: specific add IDs to `localStorage['random_read_level_{level}']`.
  - `resetProgress(level: number): void`
    - Logic: Clear `localStorage['random_read_level_{level}']`.
  - `getProgress(level: number): { total: number, read: number }`

### 4.3 Routing

- New Route: `level/:levelId/random` -> `RandomPracticeComponent`

## 5. Implementation Steps

1.  **Assets**: Create `random` directory in `assets/punjabi/` and populate with `level-X-random.json` files (placeholder data initially).
2.  **Service**: Implement `RandomService` with fetching and LocalStorage logic.
3.  **Component**: Create `RandomPracticeComponent`.
4.  **Integration**: Update `LessonListComponent` to link to the new component.
5.  **Styling**: Ensure UI matches the existing aesthetic (cards, buttons, colors).

## 6. Open Questions / Assumptions

- **Data Source**: We assume the user (you) will provide the content for the random words/sentences JSON files. For now create a sample json data for each of these levels.
- **Audio**: Do these random items require audio files? _Assumption: Yes, similar to lessons. If audio is missing, the button will be hidden/disabled._
- **Batch Size**: Fixed at 10 as requested.
