import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Eye, TrendingUp, Calendar } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getStudentProgress } from '../services/mongoApi';

interface StudentTracking {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  signs_learned: number;
  total_practice_time: number;
  accuracy_rate: number;
  last_active: string;
  skill_level: string;
  preferred_language: string;
  weekly_progress: number;
  monthly_goal: number;
  streak_days: number;
}

interface StudentTrackingTableProps {
  refreshTrigger?: number;
}

const StudentTrackingTable = ({ refreshTrigger }: StudentTrackingTableProps) => {
  const [students, setStudents] = useState<StudentTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentTracking | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStudentTracking();
  }, [refreshTrigger]);

  const loadStudentTracking = async () => {
    try {
      setLoading(true);
      
      const progressData = await getStudentProgress();
      
      if (Array.isArray(progressData)) {
        const formattedData = progressData.map((progress: any) => ({
          id: progress.id.toString(),
          user_id: progress.user_id.toString(),
          full_name: progress.user_full_name || 'Unknown',
          email: progress.email,
          signs_learned: progress.signs_learned || 0,
          total_practice_time: progress.total_practice_time || 0,
          accuracy_rate: progress.accuracy_rate || 0,
          last_active: progress.last_active || new Date().toISOString(),
          skill_level: progress.skill_level || 'Not set',
          preferred_language: progress.preferred_language || 'Not set',
          weekly_progress: progress.weekly_progress || 0,
          monthly_goal: progress.monthly_goal || 100,
          streak_days: progress.streak_days || 0,
        }));
        
        setStudents(formattedData);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading student tracking:', error);
      toast({
        title: "Error",
        description: "Failed to load student tracking data",
        variant: "destructive",
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityStatus = (lastActive: string) => {
    const daysSince = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince === 0) return { label: 'Active Today', color: 'bg-green-100 text-green-800' };
    if (daysSince <= 3) return { label: `${daysSince} days ago`, color: 'bg-yellow-100 text-yellow-800' };
    return { label: `${daysSince} days ago`, color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Progress Tracking</h3>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Skill Level</TableHead>
                  <TableHead>Signs Learned</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Practice Time</TableHead>
                  <TableHead>Weekly Progress</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const activityStatus = getActivityStatus(student.last_active);
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{student.full_name}</div>
                          <div className="text-sm text-gray-600">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSkillLevelColor(student.skill_level)}>
                          {student.skill_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{student.signs_learned}</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{student.accuracy_rate}%</span>
                          </div>
                          <Progress value={student.accuracy_rate} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{student.total_practice_time} min</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{student.weekly_progress}/{student.monthly_goal}</span>
                          </div>
                          <Progress value={(student.weekly_progress / student.monthly_goal) * 100} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">{student.streak_days} days</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={activityStatus.color}>
                          {activityStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No student data available yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Student Details</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedStudent.full_name}</p>
                  <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                  <p><span className="font-medium">Skill Level:</span> {selectedStudent.skill_level}</p>
                  <p><span className="font-medium">Preferred Language:</span> {selectedStudent.preferred_language}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Progress Metrics</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Signs Learned:</span> {selectedStudent.signs_learned}</p>
                  <p><span className="font-medium">Accuracy Rate:</span> {selectedStudent.accuracy_rate}%</p>
                  <p><span className="font-medium">Practice Time:</span> {selectedStudent.total_practice_time} minutes</p>
                  <p><span className="font-medium">Current Streak:</span> {selectedStudent.streak_days} days</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Weekly Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {selectedStudent.weekly_progress}/{selectedStudent.monthly_goal}</span>
                  <span>{Math.round((selectedStudent.weekly_progress / selectedStudent.monthly_goal) * 100)}%</span>
                </div>
                <Progress value={(selectedStudent.weekly_progress / selectedStudent.monthly_goal) * 100} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTrackingTable;
