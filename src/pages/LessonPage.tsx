import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLessons } from '../services/mongoApi';
import { ILesson } from '../lib/mongo';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();

  const { data: lessonsData, isLoading, error } = useQuery({
    queryKey: ['lessons'],
    queryFn: getLessons,
  });

  const lesson = lessonsData?.find((l: ILesson) => l.id === lessonId);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{lesson.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Difficulty: {lesson.difficulty_level}</span>
              <span>Duration: {lesson.estimated_duration} minutes</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Objectives</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {lesson.objectives?.map((objective, index) => (
                  <li key={index}>{objective}</li>
                )) || <li>No objectives specified</li>}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lesson Content</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600">
                  Lesson content will be displayed here. This could include video tutorials,
                  interactive exercises, and practice activities for the signs covered in this lesson.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Lessons
              </button>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Mark as Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
