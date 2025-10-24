import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, CheckCircle, ArrowLeft, BookOpen, Target, Clock } from 'lucide-react';
import { getLessons, createPracticeSession } from '../services/mongoApi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { ILesson } from '../lib/mongo';
import CameraFeed from '../components/CameraFeed';
import InterpretationDisplay from '../components/InterpretationDisplay';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'learn' | 'practice'>('learn');
  const [isRecording, setIsRecording] = useState(false);
  const [interpretedText, setInterpretedText] = useState('');
  const [practiceStartTime, setPracticeStartTime] = useState<Date | null>(null);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);

  const { data: lessonsData, isLoading, error } = useQuery({
    queryKey: ['lessons'],
    queryFn: getLessons,
  });

  const lesson = lessonsData?.find((l: ILesson) => l.id === lessonId);

  // Generate practice signs based on lesson content, level, and selected language
  const getPracticeSigns = (lesson: ILesson) => {
    if (lesson.category === 'numbers') {
      return Array.from({ length: 10 }, (_, i) => (i + 1).toString());
    } else if (lesson.category === 'alphabet') {
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    } else if (lesson.category === 'basics') {
      // Basic level vocabulary
      if (lesson.language === 'KSL') {
        return ['Hodi', 'Asante', 'Tafadhali', 'Ndio', 'Hapana', 'Habari za asubuhi', 'Msaada', 'Maji', 'Chakula', 'Nyumbani'];
      } else {
        return ['Hello', 'Thank you', 'Please', 'Yes', 'No', 'Good morning', 'Help', 'Water', 'Food', 'Home'];
      }
    } else if (lesson.category === 'intermediate') {
      // Intermediate level vocabulary
      if (lesson.language === 'KSL') {
        return ['Jana', 'Leo', 'Kesho', 'Asubuhi', 'Mchana', 'Jioni', 'Mkubwa', 'Mdogo', 'Nyekundu', 'Bluu', 'Kijani', 'Njano', 'Nani', 'Nini', 'Wapi', 'Lini', 'Kazi', 'Shule', 'Mama', 'Baba'];
      } else {
        return ['Yesterday', 'Today', 'Tomorrow', 'Morning', 'Afternoon', 'Evening', 'Big', 'Small', 'Red', 'Blue', 'Green', 'Yellow', 'Who', 'What', 'Where', 'When', 'Work', 'School', 'Mother', 'Father'];
      }
    } else if (lesson.category === 'advanced') {
      // Advanced level vocabulary
      if (lesson.language === 'KSL') {
        return ['Mwalimu', 'Daktari', 'Mwanasheria', 'Mhandisi', 'Mchapishaji', 'Mwanafunzi', 'Chuo', 'Hospitali', 'Mahakama', 'Kampuni', 'Elimu', 'Afya', 'Sheria', 'Teknolojia', 'Utawala'];
      } else {
        return ['Teacher', 'Doctor', 'Lawyer', 'Engineer', 'Programmer', 'Student', 'University', 'Hospital', 'Court', 'Company', 'Education', 'Health', 'Law', 'Technology', 'Government'];
      }
    } else {
      // Default phrases
      if (lesson.language === 'KSL') {
        return ['Hodi', 'Asante', 'Tafadhali', 'Ndio', 'Hapana', 'Habari za asubuhi'];
      } else {
        return ['Hello', 'Thank you', 'Please', 'Yes', 'No', 'Good morning'];
      }
    }
  };

  const practiceSigns = lesson ? getPracticeSigns(lesson) : [];

  const handleTextInterpretation = (text: string) => {
    setInterpretedText(text);

    // Check if the interpreted text matches the current practice sign
    if (activeTab === 'practice' && text.trim() === practiceSigns[currentSignIndex]) {
      toast({
        title: "Correct!",
        description: `Great job! You signed "${text}" correctly.`,
      });

      // Move to next sign
      if (currentSignIndex < practiceSigns.length - 1) {
        setCurrentSignIndex(currentSignIndex + 1);
      } else {
        // Completed all signs
        handleCompleteLesson();
      }
    }
  };

  const handleStartPractice = () => {
    setActiveTab('practice');
    setPracticeStartTime(new Date());
    setCurrentSignIndex(0);
    setIsRecording(true);
  };

  const handleCompleteLesson = async () => {
    if (!user || !lesson) return;

    try {
      const duration = practiceStartTime ? Math.floor((new Date().getTime() - practiceStartTime.getTime()) / 1000 / 60) : 5;

      await createPracticeSession({
        user_id: user.id,
        lesson_id: lesson.id,
        sign_ids: [lesson.id], // Use lesson ID as sign ID for now
        start_time: practiceStartTime || new Date(),
        end_time: new Date(),
        duration: duration,
        total_attempts: practiceSigns.length,
        correct_attempts: practiceSigns.length,
        accuracy_rate: 85, // Mock accuracy for now
        feedback_given: `Completed ${lesson.title} lesson`,
        completed: true
      });

      toast({
        title: "Lesson Completed!",
        description: "Congratulations! You've successfully completed this lesson.",
      });

      navigate('/materials');
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h2>
          <p className="text-gray-600 mb-8">The lesson you're looking for doesn't exist.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/materials')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Materials</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{lesson.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Difficulty: {lesson.difficulty_level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Duration: {lesson.estimated_duration} minutes</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('learn')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'learn'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Learn
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'practice'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Practice
            </button>
          </div>

          {activeTab === 'learn' && (
            <div className="space-y-8">
              {/* Module Introduction */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Module Introduction</h2>
                    <p className="text-gray-600">Welcome to {lesson.title}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {lesson.description || `This comprehensive module will guide you through learning ${lesson.category} in ${lesson.language}.
                  You'll master essential signs through interactive lessons, visual demonstrations, and hands-on practice.`}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Learning Objectives</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.objectives && lesson.objectives.length > 0 ? (
                    lesson.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{objective}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Objectives will be loaded for this lesson</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Prerequisites */}
              {lesson.prerequisites && lesson.prerequisites.length > 0 && (
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">Prerequisites</h3>
                  <ul className="space-y-2">
                    {lesson.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-center space-x-2 text-amber-800">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lesson Content */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Lesson Content</h3>

                {lesson.category === 'numbers' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Understanding Number Signs</h4>
                      <p className="text-gray-600 mb-4">
                        Numbers in sign language are formed using your fingers to represent quantities.
                        This lesson covers numbers 1-10 with clear visual demonstrations and practice exercises.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Numbers 1-10 Visual Guide</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                          <div key={num} className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
                            <div className="text-3xl font-bold text-blue-600 mb-2">{num}</div>
                            <div className="text-sm text-gray-600 font-medium">Number {num}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {num <= 5 ? `${num} finger${num > 1 ? 's' : ''}` : 'Hand shape'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-blue-900 mb-2">How to Form Numbers:</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>Numbers 1-5:</strong> Start with fist closed, extend the corresponding number of fingers from your index finger outward.</p>
                        <p><strong>Numbers 6-10:</strong> Combine handshapes - for example, show 5 with one hand and 1 with the other hand for 6.</p>
                        <p><strong>Practice Tip:</strong> Always start from a closed fist position and extend fingers smoothly.</p>
                      </div>
                    </div>
                  </div>
                )}

                {lesson.category === 'alphabet' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">The ASL Alphabet</h4>
                      <p className="text-gray-600 mb-4">
                        The American Sign Language alphabet consists of 26 handshapes representing each letter.
                        Mastering the alphabet is fundamental for fingerspelling names, places, and words not in common signs.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Alphabet Overview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                          <div key={letter} className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center border border-green-200">
                            <div className="text-2xl font-bold text-green-600">{letter}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-green-900 mb-2">Fingerspelling Tips:</h4>
                      <div className="space-y-2 text-sm text-green-800">
                        <p><strong>Hand Position:</strong> Keep your hand at chest level, palm facing outward.</p>
                        <p><strong>Movement:</strong> Make each letter clearly and pause slightly between letters.</p>
                        <p><strong>Practice:</strong> Start with your name, then common words you fingerspell often.</p>
                      </div>
                    </div>
                  </div>
                )}

                {lesson.category === 'basics' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Essential Signs for Communication</h4>
                      <p className="text-gray-600 mb-4">
                        Basic signs form the foundation of sign language communication. This module covers
                        greetings, courtesy phrases, and fundamental expressions used in daily conversations.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Signs You'll Learn</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['Hello', 'Thank you', 'Please', 'Sorry', 'Yes', 'No', 'Help', 'Good morning'].map(sign => (
                          <div key={sign} className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200">
                            <div className="text-lg font-semibold text-purple-600">{sign}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-purple-900 mb-2">Communication Basics:</h4>
                      <div className="space-y-2 text-sm text-purple-800">
                        <p><strong>Greetings:</strong> Start conversations with appropriate signs for hello and introductions.</p>
                        <p><strong>Courtesy:</strong> Learn please, thank you, and sorry to show respect in conversations.</p>
                        <p><strong>Responses:</strong> Master yes/no responses and basic question forms.</p>
                      </div>
                    </div>
                  </div>
                )}

                {lesson.category === 'phrases' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Common Phrases and Expressions</h4>
                      <p className="text-gray-600 mb-4">
                        Expand your vocabulary with practical phrases used in everyday situations.
                        Learn to combine signs into meaningful expressions and conversations.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Phrase Categories</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                          <h5 className="font-semibold text-indigo-900 mb-2">Social Expressions</h5>
                          <ul className="text-sm text-indigo-800 space-y-1">
                            <li>• How are you?</li>
                            <li>• Nice to meet you</li>
                            <li>• What's your name?</li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                          <h5 className="font-semibold text-pink-900 mb-2">Daily Communication</h5>
                          <ul className="text-sm text-pink-800 space-y-1">
                            <li>• I love you</li>
                            <li>• I'm hungry</li>
                            <li>• I need help</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {lesson.category === 'intermediate' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Intermediate Sign Language Skills</h4>
                      <p className="text-gray-600 mb-4">
                        Build upon your foundational knowledge with more complex vocabulary, sentence structure,
                        and conversational skills. This intermediate level focuses on practical communication.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Intermediate Concepts</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-900 mb-2">Time Expressions</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Yesterday, Today, Tomorrow</li>
                            <li>• Morning, Afternoon, Evening</li>
                            <li>• Week, Month, Year</li>
                            <li>• Before, After, During</li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-green-900 mb-2">Descriptive Signs</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Colors (all basic colors)</li>
                            <li>• Sizes (big, small, medium)</li>
                            <li>• Emotions (feelings & states)</li>
                            <li>• Qualities (good, bad, fast, slow)</li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                          <h5 className="font-semibold text-purple-900 mb-2">Question Formation</h5>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Who, What, Where, When</li>
                            <li>• Why, How, Which</li>
                            <li>• Yes/No questions</li>
                            <li>• Wh-questions</li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                          <h5 className="font-semibold text-orange-900 mb-2">Compound Signs</h5>
                          <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Family relationships</li>
                            <li>• Professions & occupations</li>
                            <li>• Locations & directions</li>
                            <li>• Actions & activities</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-blue-900 mb-2">Intermediate Practice Focus:</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>Conversational Skills:</strong> Learn to have basic conversations about daily topics.</p>
                        <p><strong>Sign Combinations:</strong> Practice combining multiple signs into coherent sentences.</p>
                        <p><strong>Non-Manual Signals:</strong> Understand the importance of facial expressions and body language.</p>
                        <p><strong>Regional Variations:</strong> Learn about different signing styles and regional differences.</p>
                      </div>
                    </div>
                  </div>
                )}

                {lesson.category === 'advanced' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Advanced Sign Language Mastery</h4>
                      <p className="text-gray-600 mb-4">
                        Achieve fluency with complex grammatical structures, classifiers, spatial referencing,
                        and advanced conversational skills. This advanced level prepares you for professional interpretation.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Advanced Linguistic Concepts</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                          <h5 className="font-semibold text-red-900 mb-2">Classifiers & Spatial Language</h5>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Semantic classifiers (CL:C, CL:B)</li>
                            <li>• Descriptive classifiers</li>
                            <li>• Locative classifiers</li>
                            <li>• Body classifiers</li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                          <h5 className="font-semibold text-indigo-900 mb-2">Complex Sentence Structure</h5>
                          <ul className="text-sm text-indigo-800 space-y-1">
                            <li>• Conditional sentences</li>
                            <li>• Relative clauses</li>
                            <li>• Embedded structures</li>
                            <li>• Topic-comment constructions</li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                          <h5 className="font-semibold text-teal-900 mb-2">Professional Terminology</h5>
                          <ul className="text-sm text-teal-800 space-y-1">
                            <li>• Academic vocabulary</li>
                            <li>• Technical terms</li>
                            <li>• Medical terminology</li>
                            <li>• Legal terminology</li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                          <h5 className="font-semibold text-pink-900 mb-2">Cultural & Social Context</h5>
                          <ul className="text-sm text-pink-800 space-y-1">
                            <li>• Deaf culture awareness</li>
                            <li>• Social etiquette</li>
                            <li>• Community involvement</li>
                            <li>• Advocacy & rights</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                      <h4 className="text-md font-semibold text-red-900 mb-2">Advanced Mastery Skills:</h4>
                      <div className="space-y-2 text-sm text-red-800">
                        <p><strong>Interpretation Techniques:</strong> Learn simultaneous interpretation and transliteration skills.</p>
                        <p><strong>Speed & Fluency:</strong> Develop natural signing speed and rhythm for professional communication.</p>
                        <p><strong>Specialized Vocabulary:</strong> Master terminology for specific fields and professions.</p>
                        <p><strong>Cultural Mediation:</strong> Understand and bridge communication between deaf and hearing communities.</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h4 className="text-md font-semibold text-yellow-900 mb-2">Professional Development:</h4>
                      <div className="space-y-2 text-sm text-yellow-800">
                        <p><strong>Certification Preparation:</strong> Skills needed for professional interpreter certification.</p>
                        <p><strong>Ethical Standards:</strong> Understanding professional ethics and confidentiality in interpretation.</p>
                        <p><strong>Continuing Education:</strong> Resources for ongoing professional development and skill maintenance.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default content for unspecified categories */}
                {!['numbers', 'alphabet', 'basics', 'phrases', 'intermediate', 'advanced'].includes(lesson.category) && (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Lesson Content</h4>
                    <p className="text-gray-600">
                      Interactive lesson content will be displayed here, including video demonstrations,
                      step-by-step instructions, and practice exercises for the signs covered in this lesson.
                    </p>
                  </div>
                )}
              </div>

              {/* Module Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Accomplish</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{lesson.estimated_duration}</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{practiceSigns.length}</div>
                    <div className="text-sm text-gray-600">Signs to Learn</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{lesson.difficulty_level}</div>
                    <div className="text-sm text-gray-600">Level</div>
                  </div>
                </div>
              </div>

              {/* Start Practice CTA */}
              <div className="text-center pt-6">
                <button
                  onClick={handleStartPractice}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:from-blue-700 hover:to-green-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  <Play className="h-6 w-6" />
                  <span>Start Learning Module</span>
                </button>
                <p className="text-gray-600 mt-3">
                  Ready to begin? Click above to start your interactive learning experience.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Session</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {practiceSigns[currentSignIndex] || 'Complete!'}
                  </div>
                  <p className="text-gray-600">
                    Sign the {lesson.category === 'numbers' ? 'number' : 'letter/sign'} shown above
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    Progress: {currentSignIndex + 1} / {practiceSigns.length}
                  </div>
                </div>
              </div>

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

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setActiveTab('learn')}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Learn
                </button>
                <button
                  onClick={handleCompleteLesson}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Complete Lesson</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
