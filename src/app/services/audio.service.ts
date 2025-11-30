import { Injectable, signal } from '@angular/core';
import { AppConfig } from '../configuration/config';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioElement: HTMLAudioElement | null = null;
  private currentAudioSrc: string | null = null;
  private readonly _isPlaying = signal(false);
  
  readonly isPlaying = this._isPlaying.asReadonly();

  /**
   * Play audio from the given source
   */
  play(audioSrc: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // If same audio is already playing, restart it
      if (this.audioElement && this.currentAudioSrc === audioSrc) {
        this.audioElement.currentTime = AppConfig.audio.resetTime;
        this.audioElement.play()
          .then(() => {
            this._isPlaying.set(true);
            resolve();
          })
          .catch((err) => {
            this._isPlaying.set(false);
            reject(err);
          });
        return;
      }

      // Stop current audio if playing
      this.stop();

      // Create new audio element
      this.audioElement = new Audio(audioSrc);
      this.currentAudioSrc = audioSrc;

      // Preload for faster playback
      this.audioElement.preload = 'auto';

      // Handle successful playback
      const canPlayHandler = () => {
        this.audioElement?.play()
          .then(() => {
            this._isPlaying.set(true);
            resolve();
          })
          .catch((err) => {
            this._isPlaying.set(false);
            reject(err);
          });
      };
      this.audioElement.addEventListener('canplaythrough', canPlayHandler, { once: true });

      // Handle when audio ends
      this.audioElement.addEventListener('ended', () => {
        this._isPlaying.set(false);
      });

      // Handle errors
      const errorHandler = () => {
        this._isPlaying.set(false);
        reject(new Error('Failed to load audio'));
      };
      this.audioElement.addEventListener('error', errorHandler, { once: true });

      // Load the audio
      this.audioElement.load();
    });
  }

  /**
   * Stop current audio playback
   */
  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = AppConfig.audio.resetTime;
      this.audioElement = null;
      this.currentAudioSrc = null;
    }
    this._isPlaying.set(false);
  }

  /**
   * Pause current audio playback
   */
  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this._isPlaying.set(false);
  }
}
