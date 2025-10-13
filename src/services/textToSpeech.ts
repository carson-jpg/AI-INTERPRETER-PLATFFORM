
export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
  lang?: string;
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported: boolean;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window;
    this.loadVoices();
  }

  private loadVoices(): void {
    if (!this.isSupported) return;

    const updateVoices = () => {
      this.voices = this.synthesis.getVoices();
    };

    updateVoices();
    
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = updateVoices;
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Text-to-speech is not supported in this browser'));
        return;
      }

      if (!text.trim()) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;
      utterance.lang = options.lang ?? 'en-US';

      // Set voice if specified
      if (options.voice) {
        const selectedVoice = this.voices.find(voice => 
          voice.name === options.voice || voice.lang === options.voice
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Use default English voice
        const englishVoice = this.voices.find(voice => 
          voice.lang.startsWith('en') && voice.default
        ) || this.voices.find(voice => voice.lang.startsWith('en'));
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.isSupported) {
      this.synthesis.cancel();
    }
  }

  pause(): void {
    if (this.isSupported) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.isSupported) {
      this.synthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.isSupported ? this.synthesis.speaking : false;
  }
}

export const textToSpeechService = new TextToSpeechService();
