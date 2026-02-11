
// Speech Recognition Service using Web Speech API

// Type declarations for Speech Recognition API
interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInterface, ev: any) => void) | null;
  onerror: ((this: SpeechRecognitionInterface, ev: any) => void) | null;
  onspeechstart: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onnomatch: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
}

interface SpeechRecognitionResultInterface {
  length: number;
  isFinal: boolean;
  item(index: number): any;
  [index: number]: any;
}

interface SpeechRecognitionResultListInterface {
  length: number;
  item(index: number): SpeechRecognitionResultInterface;
  [index: number]: SpeechRecognitionResultInterface;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

class SpeechRecognitionService {
  private recognition: SpeechRecognitionInterface | null = null;
  private isListening = false;
  private onResultCallback: ((result: SpeechRecognitionResult) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          const result: SpeechRecognitionResultListInterface = event.results;
          const resultIndex: number = event.resultIndex;
          const actualResult = result[resultIndex];
          const transcript = actualResult[0].transcript;
          const confidence = actualResult[0].confidence;

          if (this.onResultCallback) {
            this.onResultCallback({
              transcript,
              confidence,
              isFinal: actualResult.isFinal
            });
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        };

        this.recognition.onerror = (event: any) => {
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
          }
        };
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  start(): void {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
