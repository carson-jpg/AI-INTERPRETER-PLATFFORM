import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile, getLessonSchedules } from '../services/mongoApi';
import { User, Edit3, Camera, Save, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { ILessonSchedule } from '../lib/mongo';

interface StudentProfile {
  id: string;
  user_id: string;
  full_name?: string;
  bio?: string;
  learning_goals?: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  preferred_language: 'ASL' | 'KSL' | 'BSL';
  avatar_url?: string;
}

interface ProfileFormData {
  full_name: string;
  bio: string;
  learning_goals: string;
  skill_level: string;
  preferred_language: string;
}

const StudentProfile = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [lessonSchedules, setLessonSchedules] = useState<ILessonSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule'>('profile');
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    bio: '',
    learning_goals: '',
    skill_level: '',
    preferred_language: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Load profile
          const userProfile = await getUserProfile(user.id);
          if (userProfile) {
            setProfile(userProfile as StudentProfile);
            setFormData({
              full_name: userProfile.full_name || '',
              bio: userProfile.bio || '',
              learning_goals: userProfile.learning_goals || '',
              skill_level: userProfile.skill_level,
              preferred_language: userProfile.preferred_language,
            });
          }

          // Load lesson schedules
          const schedules = await getLessonSchedules(user.id);
          setLessonSchedules(schedules);
        } catch (error) {
          console.error('Failed to load data', error);
          toast({
            title: "Error",
            description: "Failed to load profile data.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const updates: any = {};
      if (formData.full_name) updates.full_name = formData.full_name;
      if (formData.bio) updates.bio = formData.bio;
      if (formData.learning_goals) updates.learning_goals = formData.learning_goals;
      if (formData.skill_level) updates.skill_level = formData.skill_level;
      if (formData.preferred_language) updates.preferred_language = formData.preferred_language;

      await updateProfile(updates);

      setProfile({ ...profile, ...updates });
      setEditing(false);

      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your learning profile and schedule</p>
              </div>
            </div>
            {activeTab === 'profile' && (
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
              >
                <Edit3 className="h-4 w-4" />
                <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'schedule'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>My Schedule</span>
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
              {editing && (
                <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-gray-200">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="text-2xl font-bold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                  />
                ) : (
                  profile?.full_name || 'Student'
                )}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-700">
                  {profile?.bio || 'No bio added yet.'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Goals
              </label>
              {editing ? (
                <textarea
                  value={formData.learning_goals}
                  onChange={(e) => setFormData({ ...formData, learning_goals: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="What do you want to achieve?"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-700">
                  {profile?.learning_goals || 'No learning goals set yet.'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Level
              </label>
              {editing ? (
                <select
                  value={formData.skill_level}
                  onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-700 capitalize">
                  {profile?.skill_level || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Sign Language
              </label>
              {editing ? (
                <select
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ASL">American Sign Language (ASL)</option>
                  <option value="KSL">Kenyan Sign Language (KSL)</option>
                  <option value="BSL">British Sign Language (BSL)</option>
                </select>
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-700">
                  {profile?.preferred_language === 'ASL' && 'American Sign Language (ASL)'}
                  {profile?.preferred_language === 'KSL' && 'Kenyan Sign Language (KSL)'}
                  {profile?.preferred_language === 'BSL' && 'British Sign Language (BSL)'}
                  {!profile?.preferred_language && 'Not set'}
                </p>
              )}
            </div>
          </div>

          {editing && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Lesson Schedule</h2>
                <p className="text-gray-600 mt-1">View your scheduled lessons and learning plan</p>
              </div>
              <div className="text-sm text-gray-500">
                {lessonSchedules.length} scheduled lesson{lessonSchedules.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="space-y-4">
              {lessonSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled lessons</h3>
                  <p className="text-gray-600">
                    Your instructor hasn't scheduled any lessons yet. Check back later!
                  </p>
                </div>
              ) : (
                lessonSchedules
                  .sort((a, b) => {
                    const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
                    const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-6 rounded-xl border transition-all ${
                        schedule.is_completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {schedule.lesson_title}
                            </h3>
                            {schedule.is_completed && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(schedule.scheduled_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{schedule.scheduled_time} ({schedule.duration_minutes} min)</span>
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm">
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                              {schedule.lesson_category}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                              {schedule.lesson_language}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              schedule.is_completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {schedule.is_completed ? 'Completed' : 'Scheduled'}
                            </span>
                          </div>

                          {schedule.notes && (
                            <p className="text-sm text-gray-600 mt-3 italic">
                              "{schedule.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentProfile;
