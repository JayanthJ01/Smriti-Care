/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VoiceState } from './types';
/**
 * VoiceStateMachine — protects microphone lifecycle and intent execution flow.
 *
 * States: idle | listening | processing | recognized | unrecognized | unsupported | error
 *
 * The microphone MUST be deliberately activated and MUST NOT stay active silently.
 * In Enterprise 0.1 (draft), the browser's Web Speech API is used, so wake-word
 * activation is simulated by a deliberate tap on the mic button.
 */
export class VoiceStateMachine {
  private _state: VoiceState = 'idle';
  readonly state: VoiceState = this._state;

  private listeners = new Set<(s: VoiceState) => void>();

  getState(): VoiceState {
    return this._state;
  }

  subscribe(fn: (s: VoiceState) => void): () => void {
    this.listeners.add(fn);
    fn(this._state);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private setState(next: VoiceState): void {
    if (this._state === next) return;
    this._state = next;
    this.listeners.forEach((fn) => fn(next));
  }

  activate(): void {
    this.setState('listening');
  }

  processing(): void {
    this.setState('processing');
  }

  recognized(): void {
    this.setState('recognized');
  }

  unrecognized(reason?: string): void {
    this.setState('unrecognized');
  }

  unsupported(reason?: string): void {
    this.setState('unsupported');
  }

  error(reason?: string): void {
    this.setState('error');
  }

  stop(): void {
    this.setState('idle');
  }
}

