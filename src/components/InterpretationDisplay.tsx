
import { useEffect, useState } from 'react';
import { Volume2, Copy, RotateCcw, VolumeX } from 'lucide-react';
import { textToSpeechService } from '../services/textToSpeech';

interface InterpretationDisplayProps {
  interpretedText: string;
  isRecording: boolean;
}

const InterpretationDisplay = ({ interpretedText, isRecording }: InterpretationDisplayProps) => {
  const [textHistory, setTextHistory] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  useEffect(() => {
    if (interpretedText && interpretedText !== currentText) {
      setCurrentText(interpretedText);
      setTextHistory(prev => [...prev.slice(-4), interpretedText]);
      
      // Auto-speak new interpretations if enabled
      if (autoSpeak && interpretedText.trim()) {
        speakText(interpretedText);
      }
    }
  }, [interpretedText, currentText, autoSpeak]);

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      await textToSpeechService.speak(text, {
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
        lang: 'en-US'
      });
    } catch (error) {
      console.error('Text-to-speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    textToSpeechService.stop();
    setIsSpeaking(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const clearHistory = () => {
    setTextHistory([]);
    setCurrentText('');
    stopSpeaking();
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Interpretation Output</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-lg transition-colors ${
              autoSpeak ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
          >
            {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={clearHistory}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear history"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Current Interpretation */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Current Detection</span>
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Listening</span>
              </div>
            )}
            {isSpeaking && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-600">Speaking</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="min-h-[60px] flex items-center">
          {currentText ? (
            <div className="space-y-3 w-full">
              <p className="text-2xl font-medium text-gray-900 animate-fade-in">
                {currentText}
              </p>
              <div className="flex space-x-2">
                {isSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm"
                  >
                    <VolumeX className="h-3 w-3" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => speakText(currentText)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>Speak</span>
                  </button>
                )}
                <button
                  onClick={() => copyToClipboard(currentText)}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic">
              {isRecording ? 'Watching for sign language...' : 'Start detection to see interpretations'}
            </p>
          )}
        </div>
      </div>

      {/* History */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Recent Interpretations</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {textHistory.length > 0 ? (
            textHistory.slice().reverse().map((text, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <span className="text-gray-700 flex-1">{text}</span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => speakText(text)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Speak"
                  >
                    <Volume2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(text)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm italic text-center py-4">
              No interpretations yet
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>AI-Powered Recognition:</strong> Using MediaPipe Hands for real-time gesture detection with automatic text-to-speech output.
          {autoSpeak && ' Auto-speak is enabled for new detections.'}
        </p>
      </div>
    </div>
  );
};

export default InterpretationDisplay;
