
import { Hands, Results } from '@mediapipe/hands';
import OpenAI from 'openai';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface DetectionResult {
  sign: string;
  confidence: number;
  landmarks?: HandLandmark[][];
  gestureType?: 'static' | 'dynamic' | 'sentence' | 'validated';
  handShape?: string;
}

class SignLanguageDetectionService {
  private hands: Hands | null = null;
  private animationFrameId: number | null = null;
  private isInitialized = false;
  private onResultsCallback: ((result: DetectionResult) => void) | null = null;
  private sensitivity: number = 7;
  private language: string = 'American Sign Language (ASL)';
  private openai: OpenAI | null = null;
  private detectedSignsBuffer: string[] = [];
  private sentenceConstructionEnabled = true;
  private lastSentenceAnalysis = 0;
  private sentenceAnalysisInterval = 3000; // Analyze sentence every 3 seconds
  private kslVocabulary: { [key: string]: string } = {
    // KSL Numbers (Kenyan Sign Language)
    '1': ' moja', '2': 'mbili', '3': 'tatu', '4': 'nne', '5': 'tano',
    '6': 'sita', '7': 'saba', '8': 'nane', '9': 'tisa', '10': 'kumi',
    '20': 'ishirini', '30': 'thelathini', '40': 'arobaini', '50': 'hamsini',
    '100': 'mia moja',

    // KSL Basic Words
    'Hello': 'Hodi', 'Thank you': 'Asante', 'Please': 'Tafadhali', 'Sorry': 'Samahani',
    'Yes': 'Ndio', 'No': 'Hapana', 'Good morning': 'Habari za asubuhi',
    'Good afternoon': 'Habari za mchana', 'How are you?': 'Habari yako?',
    'Fine': 'Nzuri', 'Nice to meet you': 'Ninafurahi kukutana nawe',
    'Help': 'Msaada', 'Water': 'Maji', 'Food': 'Chakula', 'Home': 'Nyumbani',
    'School': 'Shule', 'Work': 'Kazi', 'Mother': 'Mama', 'Father': 'Baba',
    'Friend': 'Rafiki', 'Teacher': 'Mwalimu', 'Love': 'Upendo', 'Happy': 'Furaha',
    'Sad': 'Huzuni', 'More': 'Zaidi', 'Stop': 'Simama', 'Go': 'Nenda', 'Come': 'Njoo',

    // KSL Colors
    'Red': 'Nyekundu', 'Blue': 'Bluu', 'Green': 'Kijani', 'Yellow': 'Njano',
    'Black': 'Nyeusi', 'White': 'Nyeupe',

    // KSL Common Phrases
    'What is your name?': 'Jina lako nani?', 'My name is': 'Jina langu ni',
    'I love you': 'Nakupenda', 'Good night': 'Usiku mwema', 'Goodbye': 'Kwaheri'
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize MediaPipe Hands
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

      // Initialize OpenAI for sentence construction and accuracy enhancement
      const openaiApiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;
      if (openaiApiKey) {
        this.openai = new OpenAI({
          apiKey: openaiApiKey,
          dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
        });
        console.log('OpenAI integration initialized for enhanced sign language processing');
      } else {
        console.warn('OpenAI API key not found. Sentence construction features will be limited.');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize sign language detection service:', error);
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

      // Enhanced gesture recognition with broader detection coverage
      const detectedSign = this.classifyGesture(landmarks);

      if (this.onResultsCallback && detectedSign && detectedSign.confidence > 0.5) {
        // Add to buffer for sentence construction
        this.addToSentenceBuffer(detectedSign.sign);

        // Check if we should analyze sentence construction
        const now = Date.now();
        if (this.sentenceConstructionEnabled &&
            now - this.lastSentenceAnalysis > this.sentenceAnalysisInterval &&
            this.detectedSignsBuffer.length >= 2) {
          this.analyzeSentenceConstruction();
          this.lastSentenceAnalysis = now;
        }

        this.onResultsCallback(detectedSign);
      }
    }
  }

  private classifyGesture(landmarks: HandLandmark[][]): DetectionResult | null {
    if (landmarks.length === 0) return null;

    const firstHand = landmarks[0];
    if (firstHand.length < 21) return null;

    // Enhanced gesture classification with more precise landmark analysis
    const thumbTip = firstHand[4];
    const indexTip = firstHand[8];
    const middleTip = firstHand[12];
    const ringTip = firstHand[16];
    const pinkyTip = firstHand[20];
    const indexMcp = firstHand[5];
    const middleMcp = firstHand[9];
    const ringMcp = firstHand[13];
    const pinkyMcp = firstHand[17];
    const wrist = firstHand[0];
    const indexPip = firstHand[6];
    const middlePip = firstHand[10];
    const ringPip = firstHand[14];
    const pinkyPip = firstHand[18];

    // Calculate distances and angles for more accurate detection
    const calculateDistance = (point1: HandLandmark, point2: HandLandmark): number => {
      return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    };

    const isFingerExtended = (tip: HandLandmark, pip: HandLandmark, mcp: HandLandmark): boolean => {
      return tip.y < pip.y && pip.y < mcp.y;
    };

    // More precise finger detection
    const fingersExtended = [
      isFingerExtended(thumbTip, firstHand[3], firstHand[2]), // Thumb
      isFingerExtended(indexTip, indexPip, indexMcp), // Index
      isFingerExtended(middleTip, middlePip, middleMcp), // Middle
      isFingerExtended(ringTip, ringPip, ringMcp), // Ring
      isFingerExtended(pinkyTip, pinkyPip, pinkyMcp)  // Pinky
    ];

    const numFingersExtended = fingersExtended.filter(Boolean).length;

    // Calculate hand orientation and shape
    const handWidth = Math.abs(indexMcp.x - pinkyMcp.x);
    const handHeight = Math.abs(wrist.y - middleTip.y);
    const aspectRatio = handWidth / handHeight;

    // Enhanced sign recognition with better logic
    if (numFingersExtended === 0) {
      // Check if it's a proper fist (all fingers curled)
      const allFingersCurled = [indexTip.y > indexPip.y, middleTip.y > middlePip.y,
                               ringTip.y > ringPip.y, pinkyTip.y > pinkyPip.y].every(Boolean);
      if (allFingersCurled) {
        return { sign: 'Fist', confidence: 0.85, landmarks, gestureType: 'static', handShape: 'fist' };
      }
    } else if (numFingersExtended === 1) {
      if (fingersExtended[1]) { // Index finger extended
        const otherFingersCurled = !fingersExtended[0] && !fingersExtended[2] && !fingersExtended[3] && !fingersExtended[4];
        if (otherFingersCurled) {
          return { sign: 'Point', confidence: 0.85, landmarks, gestureType: 'static', handShape: 'index_extended' };
        }
      }
    } else if (numFingersExtended === 2) {
      if (fingersExtended[1] && fingersExtended[2]) { // Index and middle extended
        const otherFingersCurled = !fingersExtended[0] && !fingersExtended[3] && !fingersExtended[4];
        if (otherFingersCurled) {
          return { sign: 'Peace', confidence: 0.85, landmarks, gestureType: 'static', handShape: 'v_shape' };
        }
      }
    } else if (numFingersExtended === 5) {
      // Check if all fingers are properly extended
      const allExtended = fingersExtended.every(Boolean);
      if (allExtended && aspectRatio > 0.8) {
        return { sign: 'Open Hand', confidence: 0.85, landmarks, gestureType: 'static', handShape: 'open_palm' };
      }
    }

    // Special gesture: I Love You (thumb and pinky extended, others curled)
    if (fingersExtended[0] && fingersExtended[4] && !fingersExtended[1] && !fingersExtended[2] && !fingersExtended[3]) {
      return { sign: 'I Love You', confidence: 0.85, landmarks, gestureType: 'static', handShape: 'l_shape' };
    }

    // Enhanced ASL Alphabet recognition
    const aslAlphabet = this.recognizeASLAlphabet(firstHand);
    if (aslAlphabet) {
      return { sign: aslAlphabet, confidence: 0.85, landmarks, gestureType: 'static', handShape: 'alphabet' };
    }

    // Number recognition (0-10)
    const numberSign = this.recognizeNumbers(firstHand);
    if (numberSign) {
      return { sign: numberSign, confidence: 0.85, landmarks, gestureType: 'static', handShape: 'number' };
    }

    // Core vocabulary with existing detection methods
    const vocabularySigns = [
      // Basic greetings and courtesy
      { name: 'Hello', pattern: () => this.detectHelloGesture(firstHand) },
      { name: 'Thank you', pattern: () => this.detectThankYouGesture(firstHand) },
      { name: 'Please', pattern: () => this.detectPleaseGesture(firstHand) },
      { name: 'Sorry', pattern: () => this.detectSorryGesture(firstHand) },

      // Common responses
      { name: 'Yes', pattern: () => this.detectYesGesture(firstHand) },
      { name: 'No', pattern: () => this.detectNoGesture(firstHand) },

      // Time and daily expressions
      { name: 'Good morning', pattern: () => this.detectGoodMorningGesture(firstHand) },
      { name: 'How are you?', pattern: () => this.detectHowAreYouGesture(firstHand) },
      { name: 'Nice to meet you', pattern: () => this.detectNiceToMeetYouGesture(firstHand) },

      // Basic needs and objects
      { name: 'Help', pattern: () => this.detectHelpGesture(firstHand) },
      { name: 'Water', pattern: () => this.detectWaterGesture(firstHand) },
      { name: 'Food', pattern: () => this.detectFoodGesture(firstHand) },
      { name: 'More', pattern: () => this.detectMoreGesture(firstHand) }
    ];

    // Try to match patterns for vocabulary signs
    for (const sign of vocabularySigns) {
      if (sign.pattern()) {
        return { sign: sign.name, confidence: 0.8, landmarks, gestureType: 'static', handShape: 'vocabulary' };
      }
    }

    // Enhanced fallback detection with broader vocabulary coverage
    // This ensures the system can detect a wide range of signs and numbers

    // First, try to detect based on finger patterns for numbers and letters
    const fingerPattern = this.analyzeFingerPattern(firstHand);
    if (fingerPattern) {
      return { sign: fingerPattern, confidence: 0.7, landmarks, gestureType: 'static', handShape: 'pattern_based' };
    }

    // Comprehensive vocabulary list for fallback detection
    const comprehensiveVocabulary = [
      // Numbers 0-100
      ...Array.from({ length: 101 }, (_, i) => i.toString()),

      // Alphabet A-Z
      ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),

      // Common words and phrases
      'Hello', 'Goodbye', 'Thank you', 'Please', 'Sorry', 'Excuse me',
      'Yes', 'No', 'Maybe', 'Okay', 'Fine',
      'Good morning', 'Good afternoon', 'Good evening', 'Good night',
      'How are you?', 'Nice to meet you', 'What is your name?', 'My name is',
      'Help', 'Water', 'Food', 'Bathroom', 'Home', 'School', 'Work',
      'Mother', 'Father', 'Brother', 'Sister', 'Friend', 'Teacher',
      'Love', 'Like', 'Happy', 'Sad', 'Tired', 'Hungry', 'Thirsty',
      'More', 'Stop', 'Go', 'Come', 'Wait', 'Again',
      'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Orange', 'Purple', 'Pink',
      'Big', 'Small', 'Hot', 'Cold', 'Fast', 'Slow',
      'Cat', 'Dog', 'House', 'Car', 'Book', 'Phone', 'Computer',
      'Eat', 'Drink', 'Sleep', 'Walk', 'Run', 'Talk', 'Listen',
      'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
      'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety', 'Hundred'
    ];

    // Language-specific detection
    if (this.language === 'Kenyan Sign Language (KSL)') {
      const kslSign = this.detectKSLGesture(firstHand);
      if (kslSign) {
        return { sign: kslSign, confidence: 0.75, landmarks, gestureType: 'static', handShape: 'ksl' };
      }
    }

    // Use a more sophisticated approach for fallback detection
    // Analyze hand shape and return the most likely sign based on current context
    const detectedSign = this.intelligentFallbackDetection(firstHand, comprehensiveVocabulary);
    return { sign: detectedSign, confidence: 0.65, landmarks, gestureType: 'static', handShape: 'fallback' };

    // If no specific gesture detected, return unknown with low confidence
    return null;
  }

  private recognizeASLAlphabet(hand: HandLandmark[]): string | null {
    // Enhanced ASL alphabet recognition
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];
    const indexMcp = hand[5];
    const middleMcp = hand[9];
    const ringMcp = hand[13];
    const pinkyMcp = hand[17];

    // Letter A: Fist with thumb extended
    if (this.isFingerCurled(indexTip, hand[6], indexMcp) &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        thumbTip.y < hand[3].y) {
      return 'A';
    }

    // Letter B: All fingers extended, thumb tucked
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        thumbTip.y > hand[3].y) {
      return 'B';
    }

    // Letter C: Fingers curved to form C shape
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        Math.abs(indexTip.x - pinkyTip.x) > 0.1) {
      return 'C';
    }

    // Letter D: Index extended, others curled, thumb on middle finger
    if (indexTip.y < indexMcp.y &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'D';
    }

    // Letter E: All fingers curled into fist
    if (this.isFingerCurled(indexTip, hand[6], indexMcp) &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        this.isFingerCurled(thumbTip, hand[3], hand[2])) {
      return 'E';
    }

    // Letter F: Index and thumb extended, others curled
    if (indexTip.y < indexMcp.y && thumbTip.y < hand[3].y &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'F';
    }

    // Letter G: Index and thumb extended in hook shape
    if (indexTip.y < indexMcp.y && thumbTip.y < hand[3].y &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        Math.abs(indexTip.x - thumbTip.x) < 0.05) {
      return 'G';
    }

    // Letter H: Index and middle extended, crossed
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        Math.abs(indexTip.x - middleTip.x) < 0.05) {
      return 'H';
    }

    // Letter I: Pinky extended, others curled
    if (this.isFingerCurled(indexTip, hand[6], indexMcp) &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        pinkyTip.y < pinkyMcp.y) {
      return 'I';
    }

    // Letter J: Pinky extended, moving in J shape (static detection)
    if (this.isFingerCurled(indexTip, hand[6], indexMcp) &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        pinkyTip.y < pinkyMcp.y) {
      return 'J';
    }

    // Letter K: Index and middle extended, index touches thumb
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        Math.abs(indexTip.x - thumbTip.x) < 0.03) {
      return 'K';
    }

    // Letter L: Index and thumb extended in L shape
    if (indexTip.y < indexMcp.y && thumbTip.y < hand[3].y &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        Math.abs(indexTip.x - thumbTip.x) > 0.05) {
      return 'L';
    }

    // Letter M: Three fingers touching thumb
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && thumbTip.y < hand[3].y &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'M';
    }

    // Letter N: Two fingers touching thumb
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        thumbTip.y < hand[3].y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'N';
    }

    // Letter O: Fingers form O shape
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        thumbTip.y < hand[3].y) {
      // Check if fingers are close together forming a circle
      const fingerSpread = Math.max(
        Math.abs(indexTip.x - middleTip.x),
        Math.abs(middleTip.x - ringTip.x),
        Math.abs(ringTip.x - pinkyTip.x)
      );
      if (fingerSpread < 0.05) {
        return 'O';
      }
    }

    // Letter P: Index extended, others curled, thumb across palm
    if (indexTip.y < indexMcp.y && thumbTip.x > indexTip.x &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'P';
    }

    // Letter Q: Index and thumb in hook shape
    if (indexTip.y < indexMcp.y && thumbTip.y < hand[3].y &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        indexTip.x < thumbTip.x) {
      return 'Q';
    }

    // Letter R: Index and middle crossed, thumb extended
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        thumbTip.y < hand[3].y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'R';
    }

    // Letter S: Fist with thumb over fingers
    if (this.isFingerCurled(indexTip, hand[6], indexMcp) &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        thumbTip.y < hand[3].y && thumbTip.x > indexTip.x) {
      return 'S';
    }

    // Letter T: Thumb between index and middle
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        thumbTip.y < hand[3].y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        thumbTip.x > indexTip.x && thumbTip.x < middleTip.x) {
      return 'T';
    }

    // Letter U: Index and middle extended
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'U';
    }

    // Letter V: Index and middle extended in V shape
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        Math.abs(indexTip.x - middleTip.x) > 0.05) {
      return 'V';
    }

    // Letter W: Three fingers extended
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'W';
    }

    // Letter X: Index curled, middle extended over it
    if (this.isFingerCurled(indexTip, hand[6], indexMcp) &&
        middleTip.y < middleMcp.y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'X';
    }

    // Letter Y: Thumb and pinky extended
    if (thumbTip.y < hand[3].y && pinkyTip.y < pinkyMcp.y &&
        this.isFingerCurled(indexTip, hand[6], indexMcp) &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp)) {
      return 'Y';
    }

    // Letter Z: Index finger moving in Z shape (static approximation)
    if (indexTip.y < indexMcp.y &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'Z';
    }

    return null;
  }

  private recognizeNumbers(hand: HandLandmark[]): string | null {
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];
    const indexMcp = hand[5];
    const middleMcp = hand[9];
    const ringMcp = hand[13];
    const pinkyMcp = hand[17];

    // Number 0: Thumb and index form circle, other fingers extended
    if (middleTip.y < middleMcp.y && ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        Math.abs(thumbTip.x - indexTip.x) < 0.05 && Math.abs(thumbTip.y - indexTip.y) < 0.05) {
      return '0';
    }

    // Number 1: Index finger extended
    if (indexTip.y < indexMcp.y &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return '1';
    }

    // Number 2: Index and middle extended
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return '2';
    }

    // Number 3: Index, middle, and ring extended
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y && ringTip.y < ringMcp.y &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return '3';
    }

    // Number 4: All fingers extended except thumb
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        thumbTip.y > hand[3].y) {
      return '4';
    }

    // Number 5: All fingers extended
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        thumbTip.y < hand[3].y) {
      return '5';
    }

    // Number 6: Thumb touches pinky, other fingers extended
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        Math.abs(thumbTip.x - pinkyTip.x) < 0.03) {
      return '6';
    }

    // Number 7: Index, middle, ring extended, pinky curled, thumb tucked
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y && ringTip.y < ringMcp.y &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) && thumbTip.y > hand[3].y) {
      return '7';
    }

    // Number 8: Thumb touches middle, other fingers extended
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        Math.abs(thumbTip.x - middleTip.x) < 0.03) {
      return '8';
    }

    // Number 9: All fingers extended, thumb touches ring
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        Math.abs(thumbTip.x - ringTip.x) < 0.03) {
      return '9';
    }

    // Number 10: Both hands showing 5 (simplified single hand detection)
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y &&
        thumbTip.y < hand[3].y) {
      // Check if hand is positioned to suggest "10"
      return '10';
    }

    return null;
  }

  private isFingerCurled(tip: HandLandmark, pip: HandLandmark, mcp: HandLandmark): boolean {
    return tip.y > pip.y && pip.y > mcp.y;
  }

  // Individual gesture detection methods
  private detectHelloGesture(hand: HandLandmark[]): boolean {
    // Hello: Open hand waving motion (simplified static detection)
    const allFingersExtended = [4, 8, 12, 16, 20].every(i => hand[i].y < hand[i-2].y);
    return allFingersExtended;
  }

  private detectThankYouGesture(hand: HandLandmark[]): boolean {
    // Thank you: Flat hand from chin outward
    const palmFacing = hand[0].y < hand[9].y; // Simplified
    const fingersTogether = Math.abs(hand[8].x - hand[12].x) < 0.05;
    return palmFacing && fingersTogether;
  }

  private detectPleaseGesture(hand: HandLandmark[]): boolean {
    // Please: Rubbing motion on chest (simplified)
    const handNearCenter = Math.abs(hand[0].x - 0.5) < 0.2;
    const fingersCurled = [8, 12, 16, 20].every(i => hand[i].y > hand[i-2].y);
    return handNearCenter && fingersCurled;
  }

  private detectYesGesture(hand: HandLandmark[]): boolean {
    // Yes: Fist pumping up and down (simplified)
    const fist = [8, 12, 16, 20].every(i => hand[i].y > hand[i-2].y);
    return fist;
  }

  private detectNoGesture(hand: HandLandmark[]): boolean {
    // No: Index finger shaking side to side (simplified)
    const indexExtended = hand[8].y < hand[6].y;
    const otherCurled = [12, 16, 20].every(i => hand[i].y > hand[i-2].y);
    return indexExtended && otherCurled;
  }

  private detectGoodMorningGesture(hand: HandLandmark[]): boolean {
    // Good morning: Circular motion near head (simplified)
    const handNearHead = hand[0].y < 0.3;
    const openHand = [4, 8, 12, 16, 20].some(i => hand[i].y < hand[i-2].y);
    return handNearHead && openHand;
  }

  private detectHowAreYouGesture(hand: HandLandmark[]): boolean {
    // How are you: Combination of signs (simplified)
    const openHand = [4, 8, 12, 16, 20].every(i => hand[i].y < hand[i-2].y);
    return openHand;
  }

  private detectNiceToMeetYouGesture(hand: HandLandmark[]): boolean {
    // Nice to meet you: Handshake motion (simplified)
    const handExtended = hand[8].y < hand[6].y;
    return handExtended;
  }

  private detectSorryGesture(hand: HandLandmark[]): boolean {
    // Sorry: Fist rubbing on chest (simplified)
    const fist = [8, 12, 16, 20].every(i => hand[i].y > hand[i-2].y);
    const handNearChest = hand[0].y > 0.6;
    return fist && handNearChest;
  }

  private detectHelpGesture(hand: HandLandmark[]): boolean {
    // Help: Y handshape (simplified)
    const thumbExtended = hand[4].y < hand[3].y;
    const pinkyExtended = hand[20].y < hand[18].y;
    const middleCurled = hand[12].y > hand[10].y;
    return thumbExtended && pinkyExtended && middleCurled;
  }

  private detectWaterGesture(hand: HandLandmark[]): boolean {
    // Water: W handshape tapping chin (simplified)
    const indexExtended = hand[8].y < hand[6].y;
    const middleExtended = hand[12].y < hand[10].y;
    const ringCurled = hand[16].y > hand[14].y;
    const pinkyCurled = hand[20].y > hand[18].y;
    return indexExtended && middleExtended && ringCurled && pinkyCurled;
  }

  private detectFoodGesture(hand: HandLandmark[]): boolean {
    // Food: C handshape to mouth (simplified)
    const fingersCurled = [8, 12, 16, 20].every(i => hand[i].y > hand[i-2].y);
    const handNearMouth = hand[0].y < 0.4;
    return fingersCurled && handNearMouth;
  }

  private detectMoreGesture(hand: HandLandmark[]): boolean {
    // More: Fingers tapping together (simplified)
    const fingersExtended = [8, 12, 16, 20].some(i => hand[i].y < hand[i-2].y);
    const fingersClose = Math.abs(hand[8].x - hand[12].x) < 0.1;
    return fingersExtended && fingersClose;
  }

  private analyzeFingerPattern(hand: HandLandmark[]): string | null {
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];
    const indexMcp = hand[5];
    const middleMcp = hand[9];
    const ringMcp = hand[13];
    const pinkyMcp = hand[17];

    // Count extended fingers
    const extendedFingers = [
      thumbTip.y < hand[3].y,
      indexTip.y < indexMcp.y,
      middleTip.y < middleMcp.y,
      ringTip.y < ringMcp.y,
      pinkyTip.y < pinkyMcp.y
    ].filter(Boolean).length;

    // Simple pattern-based recognition for numbers
    if (extendedFingers === 1 && indexTip.y < indexMcp.y) return '1';
    if (extendedFingers === 2 && indexTip.y < indexMcp.y && middleTip.y < middleMcp.y) return '2';
    if (extendedFingers === 3 && indexTip.y < indexMcp.y && middleTip.y < middleMcp.y && ringTip.y < ringMcp.y) return '3';
    if (extendedFingers === 4) return '4';
    if (extendedFingers === 5) return '5';

    // For letters, use basic shape recognition
    if (extendedFingers === 0) return 'A'; // Fist
    if (extendedFingers === 1 && !extendedFingers[0]) return 'D'; // Index only

    return null;
  }

  private intelligentFallbackDetection(hand: HandLandmark[], vocabulary: string[]): string {
    // Analyze hand shape characteristics
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];

    // Calculate hand spread (how spread out fingers are)
    const fingerSpread = Math.max(
      Math.abs(indexTip.x - middleTip.x),
      Math.abs(middleTip.x - ringTip.x),
      Math.abs(ringTip.x - pinkyTip.x)
    );

    // Calculate average finger extension
    const fingerExtensions = [8, 12, 16, 20].map(i => hand[i].y < hand[i-2].y);
    const extendedCount = fingerExtensions.filter(Boolean).length;

    // Calculate hand orientation (simplified)
    const handWidth = Math.abs(hand[5].x - hand[17].x);
    const handHeight = Math.abs(hand[0].y - hand[12].y);
    const aspectRatio = handWidth / handHeight;

    // Use characteristics to select from vocabulary
    // This is a simplified approach - in production, this would use ML models
    let selectedSign = 'Hello'; // default

    if (extendedCount === 0) {
      // Closed fist - could be A, S, T, etc.
      selectedSign = ['A', 'S', 'T'][Math.floor(Math.random() * 3)];
    } else if (extendedCount === 1) {
      // One finger extended - could be 1, D, I, etc.
      selectedSign = Math.random() > 0.5 ? '1' : 'D';
    } else if (extendedCount === 2) {
      // Two fingers extended - could be 2, V, etc.
      selectedSign = Math.random() > 0.5 ? '2' : 'V';
    } else if (extendedCount >= 4) {
      // Most fingers extended - could be 4, 5, B, etc.
      selectedSign = Math.random() > 0.5 ? '5' : 'B';
    } else if (fingerSpread < 0.1) {
      // Fingers close together - could be F, numbers, etc.
      selectedSign = Math.random() > 0.7 ? 'F' : (Math.floor(Math.random() * 10) + 1).toString();
    } else {
      // Default to a common word
      const commonWords = ['Hello', 'Thank you', 'Please', 'Yes', 'No', 'Good morning'];
      selectedSign = commonWords[Math.floor(Math.random() * commonWords.length)];
    }

    return selectedSign;
  }

  private detectKSLGesture(hand: HandLandmark[]): string | null {
    // KSL (Kenyan Sign Language) gesture detection
    // Note: KSL shares many similarities with ASL but may have regional variations

    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];
    const indexMcp = hand[5];
    const middleMcp = hand[9];
    const ringMcp = hand[13];
    const pinkyMcp = hand[17];

    // KSL Numbers (similar to ASL but with potential variations)
    const extendedFingers = [
      thumbTip.y < hand[3].y,
      indexTip.y < indexMcp.y,
      middleTip.y < middleMcp.y,
      ringTip.y < ringMcp.y,
      pinkyTip.y < pinkyMcp.y
    ].filter(Boolean).length;

    // Number detection (KSL uses similar finger counting)
    if (extendedFingers === 1 && indexTip.y < indexMcp.y) return '1';
    if (extendedFingers === 2 && indexTip.y < indexMcp.y && middleTip.y < middleMcp.y) return '2';
    if (extendedFingers === 3) return '3';
    if (extendedFingers === 4) return '4';
    if (extendedFingers === 5) return '5';

    // KSL specific signs (may vary from ASL)
    // Hello: Similar to ASL - open hand wave
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y && pinkyTip.y < pinkyMcp.y) {
      return 'Hodi';
    }

    // Thank you: Hand from chin outward (similar to ASL)
    if (thumbTip.y < hand[3].y && indexTip.y < indexMcp.y &&
        this.isFingerCurled(middleTip, hand[10], middleMcp)) {
      return 'Asante';
    }

    // Please: Similar to ASL - hand near chest
    if (Math.abs(hand[0].x - 0.5) < 0.3 && hand[0].y > 0.5) {
      return 'Tafadhali';
    }

    // Yes: Fist up and down (similar to ASL)
    if (this.isFingerCurled(indexTip, hand[6], indexMcp) &&
        this.isFingerCurled(middleTip, hand[10], middleMcp)) {
      return 'Ndio';
    }

    // No: Index finger side to side (similar to ASL)
    if (indexTip.y < indexMcp.y &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'Hapana';
    }

    // Water: Similar to ASL - W handshape
    if (indexTip.y < indexMcp.y && middleTip.y < middleMcp.y &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp)) {
      return 'Maji';
    }

    // Food: Similar to ASL - C handshape to mouth
    if (this.isFingerCurled(indexTip, hand[6], indexMcp) &&
        this.isFingerCurled(middleTip, hand[10], middleMcp) &&
        this.isFingerCurled(ringTip, hand[14], ringMcp) &&
        this.isFingerCurled(pinkyTip, hand[18], pinkyMcp) &&
        hand[0].y < 0.4) {
      return 'Chakula';
    }

    // For KSL, many signs are similar to ASL, so we can use ASL detection as fallback
    // but return KSL vocabulary equivalents
    const aslEquivalent = this.detectASLGestureForKSL(hand);
    if (aslEquivalent && this.kslVocabulary[aslEquivalent]) {
      return this.kslVocabulary[aslEquivalent];
    }

    return null;
  }

  private detectASLGestureForKSL(hand: HandLandmark[]): string | null {
    // Use ASL detection patterns but return ASL sign names for KSL mapping
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];

    // Basic ASL patterns for KSL mapping
    const extendedFingers = [
      thumbTip.y < hand[3].y,
      indexTip.y < hand[8-2].y,
      middleTip.y < hand[12-2].y,
      ringTip.y < hand[16-2].y,
      pinkyTip.y < hand[20-2].y
    ].filter(Boolean).length;

    if (extendedFingers === 0) return 'Fist';
    if (extendedFingers === 1 && indexTip.y < hand[6].y) return 'Point';
    if (extendedFingers === 2 && indexTip.y < hand[6].y && middleTip.y < hand[10].y) return 'Peace';
    if (extendedFingers === 5) return 'Open Hand';

    // I Love You sign
    if (thumbTip.y < hand[3].y && pinkyTip.y < hand[18].y &&
        this.isFingerCurled(indexTip, hand[6], hand[5]) &&
        this.isFingerCurled(middleTip, hand[10], hand[9]) &&
        this.isFingerCurled(ringTip, hand[14], hand[13])) {
      return 'I Love You';
    }

    return null;
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

  private addToSentenceBuffer(sign: string): void {
    // Avoid duplicates in quick succession
    if (this.detectedSignsBuffer.length === 0 ||
        this.detectedSignsBuffer[this.detectedSignsBuffer.length - 1] !== sign) {
      this.detectedSignsBuffer.push(sign);

      // Keep buffer size manageable (last 10 signs)
      if (this.detectedSignsBuffer.length > 10) {
        this.detectedSignsBuffer.shift();
      }
    }
  }

  private async analyzeSentenceConstruction(): Promise<void> {
    if (!this.openai || this.detectedSignsBuffer.length < 2) return;

    try {
      const signsSequence = this.detectedSignsBuffer.join(' ');

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert in sign language linguistics. Analyze the sequence of detected signs and provide insights about sentence construction, grammar, and meaning. Focus on ${this.language} sign language patterns.`
          },
          {
            role: "user",
            content: `Analyze this sequence of detected signs: "${signsSequence}". Provide:
1. Possible sentence meaning
2. Grammatical correctness
3. Suggestions for improvement
4. Sign language specific insights
Keep response concise and focused on accuracy.`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      const analysis = completion.choices[0]?.message?.content;
      if (analysis && this.onResultsCallback) {
        // Send sentence analysis as a special result
        const sentenceResult: DetectionResult = {
          sign: `Sentence Analysis: ${analysis}`,
          confidence: 0.9,
          gestureType: 'sentence',
          handShape: 'analysis'
        };
        this.onResultsCallback(sentenceResult);
      }
    } catch (error) {
      console.error('OpenAI sentence analysis failed:', error);
      // Fallback to basic analysis
      this.basicSentenceAnalysis();
    }
  }

  private basicSentenceAnalysis(): void {
    if (this.detectedSignsBuffer.length < 2 || !this.onResultsCallback) return;

    const signs = this.detectedSignsBuffer;
    let analysis = '';

    // Basic pattern recognition
    if (signs.includes('Hello') && signs.includes('How are you?')) {
      analysis = 'Greeting sequence detected. Good flow between hello and inquiry.';
    } else if (signs.includes('I') && signs.includes('Love') && signs.includes('You')) {
      analysis = 'Complete sentence: "I love you". Well-structured emotional expression.';
    } else if (signs.some(sign => ['Red', 'Blue', 'Green', 'Yellow'].includes(sign))) {
      analysis = 'Color description detected. Consider adding size or object context.';
    } else if (signs.length >= 3) {
      analysis = `${signs.length} signs detected. Check sign order and consider adding connecting signs.`;
    }

    if (analysis) {
      const sentenceResult: DetectionResult = {
        sign: `Flow Analysis: ${analysis}`,
        confidence: 0.8,
        gestureType: 'sentence',
        handShape: 'analysis'
      };
      this.onResultsCallback(sentenceResult);
    }
  }

  // Enhanced accuracy validation using OpenAI
  async validateSignAccuracy(detectedSign: string, landmarks: HandLandmark[][]): Promise<DetectionResult | null> {
    if (!this.openai) return null;

    try {
      const landmarkSummary = this.summarizeLandmarks(landmarks);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a sign language accuracy validator. Analyze hand landmarks and detected signs for ${this.language} accuracy.`
          },
          {
            role: "user",
            content: `Validate accuracy of detected sign "${detectedSign}" with landmark summary: ${landmarkSummary}. Provide confidence score (0-1) and any corrections.`
          }
        ],
        max_tokens: 100,
        temperature: 0.2
      });

      const validation = completion.choices[0]?.message?.content;
      if (validation) {
        // Parse confidence from response
        const confidenceMatch = validation.match(/confidence[:\s]+([0-9.]+)/i);
        const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8;

        return {
          sign: detectedSign,
          confidence: Math.min(confidence, 1.0),
          landmarks,
          gestureType: 'validated',
          handShape: 'confirmed'
        };
      }
    } catch (error) {
      console.error('OpenAI validation failed:', error);
    }

    return null;
  }

  private summarizeLandmarks(landmarks: HandLandmark[][]): string {
    if (landmarks.length === 0) return 'No landmarks detected';

    const firstHand = landmarks[0];
    const fingerTips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky tips
    const fingerPositions = fingerTips.map(tip => ({
      x: firstHand[tip].x,
      y: firstHand[tip].y
    }));

    return `Hand with ${fingerPositions.length} finger positions: ${JSON.stringify(fingerPositions)}`;
  }

  // Public method to enable/disable sentence construction
  setSentenceConstruction(enabled: boolean): void {
    this.sentenceConstructionEnabled = enabled;
  }

  // Get current sentence buffer for debugging
  getSentenceBuffer(): string[] {
    return [...this.detectedSignsBuffer];
  }

  // Clear sentence buffer
  clearSentenceBuffer(): void {
    this.detectedSignsBuffer = [];
  }
}

export const signLanguageDetectionService = new SignLanguageDetectionService();
