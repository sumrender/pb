export interface LessonItem {
  id: string;
  level: number; // 1-5
  type: LessonType;
  native: string;
  transliteration: string;
  meaning?: string; // Optional for letters
  title?: string; // Optional title for paragraphs/stories
  audioSrc: string; // Path to audio file
}

export type LessonType = 'letter' | 'word' | 'sentence' | 'paragraph' | 'story';

export interface LevelMetadata {
  level: number;
  title: string;
  description: string;
}

/**
 * Represents a group of lessons from a single lesson file
 */
export interface LessonGroup {
  level: number;
  lessonNumber: number; // 1, 2, 3, etc.
  title?: string; // Optional title for the lesson group (e.g., "Alphabet Basics")
  description?: string; // Optional description
  items: LessonItem[];
}

/**
 * Metadata about a lesson group for UI display
 */
export interface LessonGroupMetadata {
  level: number;
  lessonNumber: number;
  title: string;
  description?: string;
  itemCount: number;
}

/**
 * Structure of lesson JSON files
 */
export interface LessonFileData {
  metadata?: {
    title?: string;
    description?: string;
  };
  items: LessonItem[];
}

