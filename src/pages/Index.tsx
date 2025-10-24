
import { useState, useEffect } from 'react';
import { Camera, BookOpen, MessageSquare, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import CameraFeed from '../components/CameraFeed';
import InterpretationDisplay from '../components/InterpretationDisplay';
import LearningModule from '../components/LearningModule';
import Navigation from '../components/Navigation';
import AuthModal from '../components/auth/AuthModal';
import LearningMaterials from '../pages/LearningMaterials';
import { useAuth } from '../hooks/useAuth';
import { getSystemStats } from '../services/mongoApi';
import { textToSpeechService } from '../services/textToSpeech';
import { signLanguageDetectionService } from '../services/signLanguageDetection';

const Index = () => {
  const [activeMode, setActiveMode] = useState<'interpret' | 'learn' | 'settings' | 'profile' | 'materials'>('interpret');
  const [interpretedText, setInterpretedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading, isConfigured } = useAuth();

  // Settings state
  const [settings, setSettings] = useState({
    language: 'American Sign Language (ASL)',
    ttsEnabled: true,
    sensitivity: 7
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['systemStats'],
    queryFn: getSystemStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('signLanguageSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('signLanguageSettings', JSON.stringify(settings));
  }, [settings]);

  // Update detection service when settings change
  useEffect(() => {
    signLanguageDetectionService.updateSettings(settings.sensitivity, settings.language);
  }, [settings.sensitivity, settings.language]);

  const handleModeChange = (mode: 'interpret' | 'learn' | 'settings' | 'profile' | 'materials') => {
    setActiveMode(mode);
  };

  const handleTextInterpretation = (text: string) => {
    setInterpretedText(text);
    // Speak the interpreted text if TTS is enabled
    if (settings.ttsEnabled && text.trim()) {
      textToSpeechService.speak(text).catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Meshack Isava</h1>
                <p className="text-sm text-gray-600">Sign Language Learning Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Navigation activeMode={activeMode} onModeChange={handleModeChange} />
              {!user && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeMode === 'interpret' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Real-Time Sign Language Interpreter
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Use your camera to translate sign language into text and speech instantly.
                Promoting accessibility and inclusion through AI technology.
              </p>
            </div>

            {/* Main Interpreter Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CameraFeed
                isRecording={isRecording}
                onToggleRecording={setIsRecording}
                onInterpretation={handleTextInterpretation}
              />
              <InterpretationDisplay
                interpretedText={interpretedText}
                isRecording={isRecording}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Camera className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recognition Accuracy</p>
                    {statsLoading ? (
                      <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.recognitionAccuracy.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Words Interpreted</p>
                    {statsLoading ? (
                      <div className="animate-pulse h-8 bg-gray-200 rounded w-20"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.wordsInterpreted.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Signs Learned</p>
                    {statsLoading ? (
                      <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.signsLearned.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMode === 'learn' && (
          <LearningModule />
        )}

        {activeMode === 'materials' && user && (
          <LearningMaterials />
        )}

        {activeMode === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language Detection
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>American Sign Language (ASL)</option>
                    <option>Kenyan Sign Language (KSL)</option>
                    <option>British Sign Language (BSL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speech Output
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.ttsEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, ttsEnabled: e.target.checked }))}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Enable text-to-speech</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detection Sensitivity: {settings.sensitivity}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.sensitivity}
                    onChange={(e) => setSettings(prev => ({ ...prev, sensitivity: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeMode === 'profile' || activeMode === 'materials') && !user && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="mb-4">
                <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  {activeMode === 'profile' ? 'User Profile' : 'Learning Materials'}
                </h3>
                <p className="text-blue-700">
                  {activeMode === 'profile'
                    ? 'Sign in to access your profile and track your learning progress.'
                    : 'Sign in to access comprehensive learning materials and track your progress.'
                  }
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Index;
