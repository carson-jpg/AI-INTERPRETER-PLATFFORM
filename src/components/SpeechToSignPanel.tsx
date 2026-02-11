
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Settings, RotateCcw, Wand2 } from 'lucide-react';
import { speechRecognitionService, SpeechRecognitionResult } from '../services/speechRecognition';
import SignAvatar from './SignAvatar';
import { ThreeDAvatar } from './avatar';

interface SpeechToSignPanelProps {
  language?: string;
}

const SpeechToSignPanel = ({ language = 'en-US' }: SpeechToSignPanelProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [use3DAvatar, setUse3DAvatar] = useState(true);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<boolean>(false);

  useEffect(() => {
    // Check if speech recognition is supported
    if (!speechRecognitionService.isSupported()) {
      setSpeechSupported(false);
      console.warn('Speech recognition is not supported in this browser');
    }

    // Set up speech recognition callbacks
    speechRecognitionService.onResult((result: SpeechRecognitionResult) => {
      if (result.isFinal) {
        setTranscript((prev) => {
          const newTranscript = prev + (prev ? ' ' : '') + result.transcript;
          setWordCount(newTranscript.split(/\s+/).filter(w => w.length > 0).length);
          setCharCount(newTranscript.length);
          return newTranscript;
        });
        setInterimTranscript('');
      } else {
        setInterimTranscript(result.transcript);
      }
    });

    speechRecognitionService.onError((error: string) => {
      console.error('Speech recognition error:', error);
      if (error === 'not-allowed') {
        setSpeechSupported(false);
      }
      setIsListening(false);
      recognitionRef.current = false;
    });

    speechRecognitionService.onEnd(() => {
      setIsListening(false);
      recognitionRef.current = false;
    });

    return () => {
      if (recognitionRef.current) {
        speechRecognitionService.stop();
      }
    };
  }, []);

  // Auto-animate when transcript changes
  useEffect(() => {
    if (transcript && autoPlay && !isAnimating) {
      // Trigger animation when we have a complete transcript
      debounceRef.current = setTimeout(() => {
        setIsAnimating(true);
      }, 500);
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [transcript, autoPlay, isAnimating]);

  const toggleListening = () => {
    if (isListening) {
      speechRecognitionService.stop();
      setIsListening(false);
      recognitionRef.current = false;
    } else {
      speechRecognitionService.setLanguage(selectedLanguage);
      speechRecognitionService.start();
      setIsListening(true);
      recognitionRef.current = true;
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setIsAnimating(false);
    setWordCount(0);
    setCharCount(0);
  };

  const retryAnimation = () => {
    if (transcript) {
      setIsAnimating(true);
    }
  };

  const loadSamplePhrase = () => {
    const samplePhrases = [
      'Hello, how are you today',
      'Thank you for your help',
      'I love learning sign language',
      'Good morning, nice to see you',
      'Please help me understand',
    ];
    const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
    setTranscript(randomPhrase);
    setWordCount(randomPhrase.split(' ').length);
    setCharCount(randomPhrase.length);
    setIsAnimating(true);
  };

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  ];

  if (!speechSupported) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <MicOff className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Speech Recognition Not Supported</h3>
            <p className="text-red-600 mb-4">
              Your browser doesn't support speech recognition. Please try using Google Chrome, Microsoft Edge, or Safari.
            </p>
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Alternative options:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Type in the text box below to see the sign animation</li>
                <li>• Use a different browser that supports speech recognition</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Manual text input option */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or type text to see signs:
          </label>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setWordCount(e.target.value.split(/\s+/).filter(w => w.length > 0).length);
              setCharCount(e.target.value.length);
            }}
            placeholder="Type here to see the sign language animation..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <button
            onClick={() => transcript && setIsAnimating(true)}
            disabled={!transcript}
            className="mt-3 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5" />
            Animate Signs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Speech to Sign Translation</h2>
          <p className="text-gray-600">Speak or type to see your words in sign language</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/60 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-gray-500">Words</p>
            <p className="text-lg font-bold text-gray-900">{wordCount}</p>
          </div>
          <div className="bg-white/60 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-gray-500">Characters</p>
            <p className="text-lg font-bold text-gray-900">{charCount}</p>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Recognition Language
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 ${
            isListening
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30'
              : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg shadow-blue-500/30'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-6 w-6" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="h-6 w-6" />
              Start Speaking
            </>
          )}
        </button>

        {transcript && (
          <>
            <button
              onClick={() => setIsAnimating(true)}
              disabled={isAnimating}
              className="flex items-center gap-2 px-6 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <Play className="h-5 w-5" />
              {isAnimating ? 'Playing...' : 'Play Signs'}
            </button>
            <button
              onClick={retryAnimation}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              Replay
            </button>
            <button
              onClick={clearTranscript}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Clear
            </button>
          </>
        )}

        <button
          onClick={loadSamplePhrase}
          className="flex items-center gap-2 px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium transition-colors"
        >
          <Wand2 className="h-5 w-5" />
          Try Sample
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setUse3DAvatar(!use3DAvatar)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              use3DAvatar ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
            title={use3DAvatar ? '3D Avatar enabled' : '2D Avatar enabled'}
          >
            <span className="text-sm">{use3DAvatar ? '3D' : '2D'}</span>
          </button>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              autoPlay ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
            title={autoPlay ? 'Auto-play enabled' : 'Auto-play disabled'}
          >
            {autoPlay ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            <span className="text-sm">Auto</span>
          </button>
        </div>
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <span className="text-lg">🎤</span>
              Recognized Speech
            </h3>
            {isListening && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-600 font-medium">Listening...</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <p className="text-2xl font-medium text-gray-900 leading-relaxed">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-400 italic ml-2">{interimTranscript}</span>
              )}
            </p>
          </div>

          {/* Quick actions */}
          {transcript && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(transcript)}
                className="text-sm text-gray-600 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(transcript);
                  utterance.lang = selectedLanguage;
                  speechSynthesis.speak(utterance);
                }}
                className="text-sm text-gray-600 hover:text-green-600 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
              >
                🔊 Speak
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual input option */}
      {!transcript && !isListening && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Or type text manually:
          </label>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setWordCount(e.target.value.split(/\s+/).filter(w => w.length > 0).length);
              setCharCount(e.target.value.length);
            }}
            placeholder="Type here to see the sign language animation..."
            className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <button
            onClick={() => transcript && setIsAnimating(true)}
            disabled={!transcript}
            className="mt-3 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5" />
            Animate Signs
          </button>
        </div>
      )}

      {/* Avatar Display */}
      {use3DAvatar ? (
        <ThreeDAvatar
          text={transcript}
          isAnimating={isAnimating}
          onAnimationComplete={handleAnimationComplete}
        />
      ) : (
        <SignAvatar
          text={transcript}
          isAnimating={isAnimating}
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      {/* Instructions */}
      {!transcript && !isListening && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <span>✨</span>
            How to Use
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-medium text-blue-900">Select Language</p>
                  <p className="text-sm text-blue-700">Choose your speaking language from the dropdown</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-medium text-blue-900">Start Speaking</p>
                  <p className="text-sm text-blue-700">Click the microphone button and speak clearly</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-medium text-blue-900">Watch Animation</p>
                  <p className="text-sm text-blue-700">The avatar will sign what you say</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <p className="font-medium text-blue-900">Type Instead</p>
                  <p className="text-sm text-blue-700">You can also type text manually</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
          <span>💡</span>
          Tips for Best Results
        </h4>
        <ul className="text-sm text-yellow-700 grid md:grid-cols-2 gap-2">
          <li className="flex items-center gap-2">
            <span>🎯</span>
            Speak clearly and at a moderate pace
          </li>
          <li className="flex items-center gap-2">
            <span>🔇</span>
            Reduce background noise
          </li>
          <li className="flex items-center gap-2">
            <span>📝</span>
            Use complete sentences for better mapping
          </li>
          <li className="flex items-center gap-2">
            <span>🌐</span>
            Supports multiple languages
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechToSignPanel;
