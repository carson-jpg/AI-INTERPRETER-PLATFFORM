import { useEffect, useState } from 'react';
import { checkAdminStatus, getStudentProgress, createAdminUser, getLessonSchedules, createLessonSchedule, updateLessonSchedule, deleteLessonSchedule, getLessons } from '../services/mongoApi';
import { useAuth } from '../hooks/useAuth';
import { Users, BookOpen, TrendingUp, Settings, UserPlus, LogOut, CheckCircle, Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import StudentTrackingTable from '../components/StudentTrackingTable';
import { SignModerationPanel } from '../components/SignModerationPanel';
import { ILessonSchedule, ILesson } from '../lib/mongo';

interface StudentProgress {
  id: string;
  user_id: string;
  signs_learned: number;
  accuracy_rate: number;
  total_sessions: number;
  last_session: string;
  user: {
    email: string;
    user_metadata: {
      full_name: string;
    };
  };
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'scheduling'>('overview');
  const [adminForm, setAdminForm] = useState({ email: '', password: '', fullName: '' });
  const [lessonSchedules, setLessonSchedules] = useState<ILessonSchedule[]>([]);
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    lesson_id: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 30,
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAdminStatus();
  }, [user]);

  const loadAdminStatus = async () => {
    if (!user) return;

    try {
      // TODO: Check admin status in MongoDB
      console.log('Checking admin status for user:', user.id);

      // Check admin status from MongoDB
      const isAdmin = await checkAdminStatus(user.id);
      setIsAdmin(isAdmin);
      if (isAdmin) {
        loadStudentProgress();
        loadLessonSchedules();
        loadLessons();
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const loadStudentProgress = async () => {
    try {
      console.log('Loading student progress from MongoDB');

      const progressData = await getStudentProgress();
      if (Array.isArray(progressData)) {
        const mappedStudents: StudentProgress[] = progressData.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          signs_learned: item.signs_learned,
          accuracy_rate: item.accuracy_rate,
          total_sessions: item.total_sessions,
          last_session: item.last_session || item.last_active || item.created_at || new Date().toISOString(),
          user: {
            email: item.email,
            user_metadata: {
              full_name: item.user_full_name || 'Unknown'
            }
          }
        }));
        setStudents(mappedStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load student progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLessonSchedules = async () => {
    try {
      const schedules = await getLessonSchedules();
      setLessonSchedules(schedules);
    } catch (error) {
      console.error('Error loading lesson schedules:', error);
    }
  };

  const loadLessons = async () => {
    try {
      const lessonsData = await getLessons();
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get all students
      const allStudents = students;

      // Create schedule for each student
      const schedulePromises = allStudents.map(student =>
        createLessonSchedule({
          user_id: student.user_id,
          lesson_id: scheduleForm.lesson_id,
          scheduled_date: new Date(scheduleForm.scheduled_date),
          scheduled_time: scheduleForm.scheduled_time,
          duration_minutes: scheduleForm.duration_minutes,
          notes: scheduleForm.notes,
          created_by: user!.id,
          is_completed: false,
          reminder_sent: false
        })
      );

      await Promise.all(schedulePromises);

      toast({
        title: "Success",
        description: `Lesson schedule created for ${allStudents.length} students`,
      });
      setScheduleForm({
        lesson_id: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 30,
        notes: ''
      });
      setShowScheduleForm(false);
      loadLessonSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create lesson schedules",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this lesson schedule?')) return;

    try {
      await deleteLessonSchedule(scheduleId);
      toast({
        title: "Success",
        description: "Lesson schedule deleted successfully",
      });
      loadLessonSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete lesson schedule",
        variant: "destructive",
      });
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminUser(adminForm.email, adminForm.password, adminForm.fullName);
      toast({
        title: "Success",
        description: "Admin user created successfully",
      });
      setAdminForm({ email: '', password: '', fullName: '' });
      setShowCreateAdmin(false);
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: "Failed to create admin user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const totalStudents = students.length;
  const averageAccuracy = students.reduce((acc, student) => acc + student.accuracy_rate, 0) / totalStudents || 0;
  const totalSessions = students.reduce((acc, student) => acc + student.total_sessions, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Meshack Isava - Student Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Admin</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'moderation'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Sign Moderation</span>
          </button>
          <button
            onClick={() => setActiveTab('scheduling')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'scheduling'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Lesson Scheduling</span>
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{averageAccuracy.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Student Tracking */}
        <StudentTrackingTable refreshTrigger={students.length} />

        {/* Students Table */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Progress</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Signs Learned</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Accuracy</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Sessions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Last Session</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.user?.user_metadata?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">{student.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{student.signs_learned}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.accuracy_rate >= 90 ? 'bg-green-100 text-green-800' :
                          student.accuracy_rate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.accuracy_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{student.total_sessions}</td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(student.last_session).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {students.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No student progress data available yet.</p>
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {activeTab === 'moderation' && (
          <SignModerationPanel />
        )}

        {activeTab === 'scheduling' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Lesson Scheduling</h2>
                <p className="text-gray-600 mt-2">Create and manage lesson schedules for students</p>
              </div>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Schedule Lesson</span>
              </button>
            </div>

            {/* Lesson Schedules Table */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Scheduled Lessons</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Lesson</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date & Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessonSchedules.map((schedule) => (
                        <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{schedule.user_name}</p>
                              <p className="text-sm text-gray-600">{schedule.user_email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{schedule.lesson_title}</p>
                              <p className="text-sm text-gray-600">{schedule.lesson_category} • {schedule.lesson_language}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{new Date(schedule.scheduled_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{schedule.scheduled_time}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-900">
                            {schedule.duration_minutes} min
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              schedule.is_completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {schedule.is_completed ? 'Completed' : 'Scheduled'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Delete Schedule"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {lessonSchedules.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No lesson schedules yet. Create your first schedule!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Admin Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Schedule New Lesson</h3>
            <form onSubmit={handleCreateSchedule}>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      This will schedule the lesson for ALL students ({students.length} students)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesson</label>
                  <select
                    value={scheduleForm.lesson_id}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, lesson_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a lesson</option>
                    {lessons.map(lesson => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.title} ({lesson.category} - {lesson.language})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleForm.scheduled_date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={scheduleForm.scheduled_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={scheduleForm.duration_minutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Optional notes for all students..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-colors"
                >
                  Schedule Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Admin User</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={adminForm.fullName}
                  onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
