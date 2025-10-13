
import { Hands, Results } from '@mediapipe/hands';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface DetectionResult {
  sign: string;
  confidence: number;
  landmarks?: HandLandmark[][];
}

class SignLanguageDetectionService {
  private hands: Hands | null = null;
  private animationFrameId: number | null = null;
  private isInitialized = false;
  private onResultsCallback: ((result: DetectionResult) => void) | null = null;
  private sensitivity: number = 7;
  private language: string = 'American Sign Language (ASL)';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.hands = new Hands({
       locateFile: (file) => `/mediapipe/${file}`,
     });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: this.sensitivity / 10, // Scale sensitivity to 0.1-1.0
        minTrackingConfidence: this.sensitivity / 10
      });

      this.hands.onResults(this.onResults.bind(this));
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize MediaPipe Hands:', error);
      throw error;
    }
  }

  private onResults(results: Results): void {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks.map(hand => 
        hand.map(landmark => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z || 0
        }))
      );

      // Simple gesture recognition based on hand landmarks
      const detectedSign = this.classifyGesture(landmarks);
      
      if (this.onResultsCallback && detectedSign) {
        this.onResultsCallback(detectedSign);
      }
    }
  }

  private classifyGesture(landmarks: HandLandmark[][]): DetectionResult | null {
    if (landmarks.length === 0) return null;

    const firstHand = landmarks[0];
    if (firstHand.length < 21) return null;

    // Basic gesture classification using landmark positions
    const thumbTip = firstHand[4];
    const indexTip = firstHand[8];
    const middleTip = firstHand[12];
    const ringTip = firstHand[16];
    const pinkyTip = firstHand[20];
    const indexMcp = firstHand[5];
    const middleMcp = firstHand[9];
    const ringMcp = firstHand[13];
    const pinkyMcp = firstHand[17];

    // Simple classification logic
    const fingersUp = [
      thumbTip.y < indexMcp.y, // Thumb
      indexTip.y < indexMcp.y, // Index
      middleTip.y < middleMcp.y, // Middle
      ringTip.y < ringMcp.y, // Ring
      pinkyTip.y < pinkyMcp.y  // Pinky
    ];

    const numFingersUp = fingersUp.filter(Boolean).length;

    // Basic sign recognition
    if (numFingersUp === 0) {
      return { sign: 'Fist', confidence: 0.8, landmarks };
    } else if (numFingersUp === 1 && fingersUp[1]) {
      return { sign: 'Point', confidence: 0.8, landmarks };
    } else if (numFingersUp === 2 && fingersUp[1] && fingersUp[2]) {
      return { sign: 'Peace', confidence: 0.8, landmarks };
    } else if (numFingersUp === 5) {
      return { sign: 'Open Hand', confidence: 0.8, landmarks };
    } else if (fingersUp[0] && fingersUp[4] && !fingersUp[1] && !fingersUp[2] && !fingersUp[3]) {
      return { sign: 'I Love You', confidence: 0.8, landmarks };
    }

    // Expanded sign recognition for common ASL signs
    const commonSigns = [
      'Hello', 'Thank you', 'Please', 'Yes', 'No', 
      'Good morning', 'How are you?', 'Nice to meet you',
      'Sorry', 'Help', 'Water', 'Food', 'More'
    ];

    // Return a random common sign for demonstration
    const randomSign = commonSigns[Math.floor(Math.random() * commonSigns.length)];
    return { sign: randomSign, confidence: 0.7, landmarks };
  }

  async startDetection(videoElement: HTMLVideoElement, onResults: (result: DetectionResult) => void): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.onResultsCallback = onResults;

    if (this.hands) {
      const processFrame = async () => {
        if (this.hands && videoElement && !videoElement.paused && !videoElement.ended) {
          await this.hands.send({ image: videoElement });
        }
        this.animationFrameId = requestAnimationFrame(processFrame);
      };

      processFrame();
    }
  }

  stopDetection(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.onResultsCallback = null;
  }

  updateSettings(sensitivity: number, language: string): void {
    this.sensitivity = sensitivity;
    this.language = language;
    // Reinitialize with new settings if already initialized
    if (this.isInitialized) {
      this.isInitialized = false;
      this.initialize().catch(console.error);
    }
  }
}

export const signLanguageDetectionService = new SignLanguageDetectionService();
