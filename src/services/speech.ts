// Speech Recognition and Text-To-Speech Service

// Type declaration for browser SpeechRecognition
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        try {
          this.recognition = new SpeechRecognitionConstructor();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
        }
      }
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      onResult(text, Boolean(final));
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      if (event.error === 'not-allowed') {
        onError('Microphone access is required for voice conversations.');
      } else if (event.error !== 'no-speech') {
        onError(`Voice input error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      onError(err.message || 'Could not start microphone');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSpeechSynthesisSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  public speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
    } = {}
  ): void {
    if (!this.isSpeechSynthesisSupported()) return;

    this.stopSpeaking();

    // Clean text of bracketed emotions before speaking
    const cleanText = text.replace(/\[emotion:[^\]]+\]/gi, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.05;

    if (options.voiceName) {
      const voices = this.getVoices();
      const match = voices.find((v) => v.name === options.voiceName);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speech = new SpeechService();
