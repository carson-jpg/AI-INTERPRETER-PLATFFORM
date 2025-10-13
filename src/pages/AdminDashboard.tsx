import { useEffect, useState } from 'react';
import { checkAdminStatus, getStudentProgress, createAdminUser } from '../services/mongoApi';
import { useAuth } from '../hooks/useAuth';
import { Users, BookOpen, TrendingUp, Settings, UserPlus, LogOut } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import StudentTrackingTable from '../components/StudentTrackingTable';

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
  const [adminForm, setAdminForm] = useState({ email: '', password: '', fullName: '' });
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
      loadStudentProgress();
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
          last_session: item.last_session || item.last_active || new Date().toISOString(),
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
      </main>

      {/* Create Admin Modal */}
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
