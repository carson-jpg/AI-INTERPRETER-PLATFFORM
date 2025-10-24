// User interfaces for MongoDB
export interface IUser {
  id: string;
  email: string;
  password?: string; // Made optional as it's not always needed on client
  full_name?: string;
  avatar_url?: string;
  role: 'student' | 'admin';
  created_at?: Date;
  updated_at?: Date;
}

export interface IStudentProfile {
  id: string;
  user_id: string;
  full_name?: string;
  bio?: string;
  learning_goals?: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  preferred_language: 'ASL' | 'KSL' | 'BSL';
  avatar_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IStudentProgress {
  id: string;
  user_id: string;
  signs_learned: number;
  total_practice_time: number;
  accuracy_rate: number;
  total_sessions: number;
  weekly_progress: number;
  monthly_goal: number;
  streak_days: number;
  last_session?: Date;
  last_active?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface ILearningMaterials {
  id: string;
  title: string;
  description?: string;
  category: 'basics' | 'alphabet' | 'numbers' | 'phrases' | 'advanced';
  language: 'ASL' | 'KSL' | 'BSL';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  content_type: 'video' | 'document' | 'interactive' | 'quiz';
  content_url?: string;
  thumbnail_url?: string;
  duration?: number;
  is_free: boolean;
  order_index?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ILesson {
  id: string;
  title: string;
  description?: string;
  category: 'basics' | 'alphabet' | 'numbers' | 'phrases' | 'intermediate' | 'advanced';
  language: 'ASL' | 'KSL' | 'BSL';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  material_ids: string[];
  estimated_duration: number;
  objectives: string[];
  prerequisites?: string[];
  is_active: boolean;
  order_index?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ISign {
  id: string;
  name: string;
  description?: string;
  category: 'basics' | 'alphabet' | 'numbers' | 'phrases' | 'intermediate' | 'advanced';
  language: 'ASL' | 'KSL' | 'BSL';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  video_url?: string;
  image_url?: string;
  landmark_data?: any; // MediaPipe landmark data
  phonetic_guide?: string;
  common_mistakes?: string[];
  related_signs?: string[];
  tags: string[];
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface IPracticeSession {
  id: string;
  user_id: string;
  lesson_id?: string;
  sign_ids: string[];
  start_time: Date;
  end_time?: Date;
  duration?: number;
  total_attempts: number;
  correct_attempts: number;
  accuracy_rate: number;
  feedback_given?: string;
  completed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface IGestureAttempt {
  id: string;
  user_id: string;
  session_id: string;
  sign_id: string;
  attempt_number: number;
  detected_sign: string;
  confidence_score: number;
  landmark_data: any; // MediaPipe landmark data
  is_correct: boolean;
  feedback?: string;
  timestamp: Date;
  created_at?: Date;
}

export interface IAchievement {
  id: string;
  user_id: string;
  type: 'streak' | 'accuracy' | 'completion' | 'speed' | 'consistency';
  title: string;
  description: string;
  icon_url?: string;
  points: number;
  unlocked_at: Date;
  metadata?: any; // Additional achievement-specific data
  created_at?: Date;
}

export interface IFeedback {
  id: string;
  user_id: string;
  type: 'material' | 'lesson' | 'sign' | 'system' | 'general';
  target_id?: string; // ID of the material/lesson/sign being reviewed
  rating: number; // 1-5 scale
  comment?: string;
  category?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  admin_response?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IAdmin {
  id: string;
  user_id: string;
  permissions: string[];
  role: 'moderator' | 'content_manager' | 'system_admin';
  last_login?: Date;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ISystemLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
}

export interface IUserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info?: any;
  ip_address?: string;
  user_agent?: string;
  login_time: Date;
  last_activity: Date;
  expires_at: Date;
  is_active: boolean;
  created_at?: Date;
}

export interface INotification {
  id: string;
  user_id: string;
  type: 'achievement' | 'reminder' | 'system' | 'social';
  title: string;
  message: string;
  data?: any; // Additional notification data
  is_read: boolean;
  read_at?: Date;
  expires_at?: Date;
  created_at?: Date;
}
