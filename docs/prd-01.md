# Product Requirements Document (PRD)

## Punjabi Reading Web App — MVP

### 1. Product Summary

A minimalist web application designed to help beginners learn to read Punjabi (Gurmukhi script). The app runs entirely in the browser using Angular, serving static lesson content to guide users through five progressive reading levels:

1.  **Alphabet Recognition**
2.  **Words**
3.  **Short Sentences**
4.  **Paragraphs**
5.  **Stories**

**Goal**: Enable users to progress from zero literacy to basic reading comprehension without barriers.

### 2. Target Audience

- Adults or teens speaking Punjabi but unable to read Gurmukhi.
- Beginners starting their literacy journey.
- Diaspora learners wishing to connect with their heritage.
- Users preferring lightweight, privacy-focused learning tools (No accounts, no tracking).

### 3. User Goals

- Master the Gurmukhi alphabet (35+ letters).
- Hear correct pronunciation for letters and words.
- Read words, sentences, and simple stories with confidence.
- Access transliteration and translations on-demand for support.
- Navigate seamlessly between difficulty levels.

### 4. Product Scope (MVP)

#### Included

- **Tech Stack**: Angular (Latest), TypeScript, SCSS, Git for version control
- **Architecture**: Static Web App (SPA), JSON-based content, Static Hosting (Netlify/Vercel).
- **Content**: 5 Levels (Letters → Stories).
- **Core Features**:
  - Lesson Viewer with Audio Playback.
  - Toggleable Transliteration (Latin script).
  - Toggleable Meaning (English).
  - Simple Navigation (Next/Prev, Level Selection).
  - Settings: Font Size, Dark/Light Mode.
- **Design**: Minimalist, Mobile-first, Responsive.
- Maintain a git repo in the root of this directory. IMPORTANT

#### Excluded (Out of Scope)

- ❌ Backend Services / Database.
- ❌ User Accounts / Authentication.
- ❌ Progress Tracking / Analytics.
- ❌ Gamification (Badges, Streaks).
- ❌ Interactive Exercises (Drag-and-drop, Quizzes).
- ❌ Offline Mode (PWA caching not prioritized for MVP).

### 5. User Flows

#### 5.1 Home Page

- Landing screen with a clear title.
- Menu to select one of the 5 Levels.

#### 5.2 Lesson List

- Displays available content for the selected level (e.g., "Letter ੳ", "Word: ਘਰ").

#### 5.3 Lesson Viewer

- **Main Display**: Large Gurmukhi text.
- **Controls**:
  - Play Audio button.
  - Toggle Transliteration (e.g., "Ghar").
  - Toggle Meaning (e.g., "Home").
  - Navigation: Previous / Next buttons.

#### 5.4 Settings

- Adjust Font Size.
- Toggle Dark/Light Theme.
- _Note: Settings may persist via LocalStorage for better UX, even if progress does not._

### 6. Content Structure & Data Model

Content will be stored in static JSON files under `src/assets/lessons/`.

**Strict Typing**: All data and application state must be defined with TypeScript interfaces. `any` type is strictly forbidden.

**Interface `LessonItem`**:

```typescript
interface LessonItem {
  id: string;
  level: number; // 1-5
  type: "letter" | "word" | "sentence" | "paragraph" | "story";
  gurmukhi: string;
  transliteration: string;
  meaning?: string; // Optional for letters
  audioSrc: string; // Path to audio file
}
```

### 7. Technical Specifications

#### 7.1 Tech Stack

-   **Framework**: Angular (Latest stable)
*   **Language**: TypeScript (Strict Mode enabled, full typing coverage required).
-   **Styling**: SCSS with CSS Variables for theming.
-   **Font**: Noto Sans Gurmukhi (via Google Fonts).
-   **State Management**: Angular Signals or simple Services (No complex store needed).

#### 7.2 Architecture

- **`LessonService`**: Fetches JSON data, manages current lesson state.
- **`AudioService`**: Manages HTML5 Audio playback.
- **`ThemeService`**: Handles Dark/Light mode toggling.

#### 7.3 Performance

- First Contentful Paint (FCP) < 1.5s.
- Audio latency < 300ms.
- 100/100 Lighthouse Accessibility score.

### 8. Success Criteria

- Users can intuitively navigate through all 5 levels.
- Audio plays reliably on mobile and desktop.
- Interface remains clutter-free and focused on learning.
