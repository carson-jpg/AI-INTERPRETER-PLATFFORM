
import { useState } from 'react';
import { BookOpen, Play, CheckCircle, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getLessons, getStudentProgress, getSigns } from '../services/mongoApi';
import { useAuth } from '../hooks/useAuth';
import { ILesson, ISign } from '../lib/mongo';

const LearningModule = () => {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<ILesson | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch lessons
  const { data: lessonsData, isLoading: lessonsLoading, error: lessonsError } = useQuery({
    queryKey: ['lessons'],
    queryFn: getLessons,
  });

  // Fetch student progress if user is authenticated
  const { data: progressData, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ['studentProgress', user?.id],
    queryFn: () => getStudentProgress(user?.id),
    enabled: !!user?.id,
  });

  // Fetch signs for quick practice
  const { data: signsData, isLoading: signsLoading, error: signsError } = useQuery({
    queryKey: ['signs'],
    queryFn: getSigns,
  });

  // Map lessons data to component format
  const lessons = lessonsData?.map((lesson: ILesson) => ({
    id: parseInt(lesson.id),
    title: lesson.title,
    description: lesson.description || '',
    difficulty: lesson.difficulty_level.charAt(0).toUpperCase() + lesson.difficulty_level.slice(1),
    duration: `${lesson.estimated_duration} min`,
    signs: lesson.objectives || [], // Assuming objectives contain sign names
    completed: progressData ? (progressData as any).total_sessions > 0 : false, // Simple completion logic
    originalLesson: lesson, // Keep original lesson data
  })) || [];

  // Calculate progress stats
  const signsLearned = progressData ? (progressData as any).signs_learned : 0;
  const completedLessons = progressData ? (progressData as any).total_sessions : 0;
  const inProgressLessons = lessons.length - completedLessons;
  const overallProgress = progressData ? Math.round((progressData as any).accuracy_rate * 100) : 0;

  // Quick practice logic
  const getRandomSign = () => {
    if (!signsData || signsData.length === 0) return null;
    return signsData[Math.floor(Math.random() * signsData.length)];
  };

  const currentSign = getRandomSign();
  const signEmojiMap: { [key: string]: string } = {
    'Hello': '👋',
    'Thank you': '🙏',
    'Please': '🤲',
    'Sorry': '🙏',
    'Good morning': '🌅',
    'Good night': '🌙',
    'Happy': '😊',
    'Sad': '😢',
    'Love': '❤️',
    'Friend': '👫',
  };

  const getSignEmoji = (signName: string) => signEmojiMap[signName] || '🤟';

  const generateOptions = (correctSign: ISign) => {
    const options = [correctSign.name];
    const otherSigns = signsData?.filter(sign => sign.id !== correctSign.id) || [];
    while (options.length < 3 && otherSigns.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherSigns.length);
      const randomSign = otherSigns.splice(randomIndex, 1)[0];
      options.push(randomSign.name);
    }
    return options.sort(() => Math.random() - 0.5);
  };

  const quickPracticeOptions = currentSign ? generateOptions(currentSign) : [];

  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-yellow-100 text-yellow-800",
    Advanced: "bg-red-100 text-red-800"
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Learn Sign Language
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Master sign language with our interactive lessons. Start with basics and progress to advanced communication.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-600">
              {progressLoading ? (
                <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
              ) : (
                `${signsLearned} signs learned`
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            {progressLoading ? (
              <div className="animate-pulse h-8 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
            ) : (
              <div className="text-2xl font-bold text-green-600">{completedLessons}</div>
            )}
            <div className="text-sm text-gray-600">Completed Lessons</div>
          </div>
          <div className="text-center">
            {progressLoading ? (
              <div className="animate-pulse h-8 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
            ) : (
              <div className="text-2xl font-bold text-blue-600">{Math.max(0, inProgressLessons)}</div>
            )}
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            {progressLoading ? (
              <div className="animate-pulse h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
            ) : (
              <div className="text-2xl font-bold text-gray-600">{overallProgress}%</div>
            )}
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedLesson && currentLesson && (
          <div className="col-span-full bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Lesson: {currentLesson.title}</h3>
            <p className="text-gray-600 mb-4">{currentLesson.description}</p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedLesson(null);
                  setCurrentLesson(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Lessons
              </button>
              <button
                onClick={() => {
                  if (currentLesson) {
                    navigate(`/lesson/${currentLesson.id}`);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Lesson
              </button>
            </div>
          </div>
        )}
        {lessonsLoading ? (
          // Loading skeletons for lessons
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  <div className="h-6 w-12 bg-gray-200 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-14 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : lessonsError ? (
          <div className="col-span-full text-center py-8">
            <p className="text-red-600">Failed to load lessons. Please try again later.</p>
          </div>
        ) : (
          lessons.map((lesson, index) => (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => {
                setSelectedLesson(lesson.id);
                setCurrentLesson(lesson.originalLesson);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[lesson.difficulty as keyof typeof difficultyColors]}`}>
                    {lesson.difficulty}
                  </span>
                </div>
                {lesson.completed && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {lesson.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                {lesson.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{lesson.duration}</span>
                <span>{lesson.signs.length} signs</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {lesson.signs.slice(0, 3).map((sign, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {sign}
                  </span>
                ))}
                {lesson.signs.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{lesson.signs.length - 3} more
                  </span>
                )}
              </div>

              <button className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 group-hover:shadow-md">
                <Play className="h-4 w-4" />
                <span>{lesson.completed ? 'Review' : 'Start Lesson'}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Quick Practice Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 border border-blue-200">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">Quick Practice</h3>
          <p className="text-gray-600">
            Test your knowledge with a quick practice session
          </p>
          {signsLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse h-16 w-16 bg-gray-200 rounded-full mx-auto"></div>
              <div className="animate-pulse h-6 bg-gray-200 rounded w-48 mx-auto"></div>
              <div className="flex justify-center space-x-4">
                <div className="animate-pulse h-10 w-20 bg-gray-200 rounded-lg"></div>
                <div className="animate-pulse h-10 w-24 bg-gray-200 rounded-lg"></div>
                <div className="animate-pulse h-10 w-20 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ) : signsError ? (
            <p className="text-red-600">Failed to load practice signs. Please try again later.</p>
          ) : currentSign ? (
            <div className="space-y-4">
              <div className="text-4xl font-bold text-gray-800">{getSignEmoji(currentSign.name)}</div>
              <p className="text-lg">What does this sign mean?</p>
              <div className="flex justify-center space-x-4">
                {quickPracticeOptions.map((option, index) => (
                  <button
                    key={index}
                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No signs available for practice at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningModule;
