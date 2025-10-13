import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../services/mongoApi';
import { User, Edit3, Camera, Save } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

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
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    bio: '',
    learning_goals: '',
    skill_level: '',
    preferred_language: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setLoading(true);
        try {
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
        } catch (error) {
          console.error('Failed to load profile', error);
          toast({
            title: "Error",
            description: "Failed to load profile.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    loadProfile();
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
                <p className="text-sm text-gray-600">Manage your learning profile</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
            >
              <Edit3 className="h-4 w-4" />
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
};

export default StudentProfile;
