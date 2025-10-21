import {
  IUser,
  IStudentProfile,
  IStudentProgress,
  ILearningMaterials,
  ILesson,
  ISign,
  IPracticeSession,
  IGestureAttempt,
  IAchievement,
  IFeedback,
  IAdmin,
  ISystemLog,
  IUserSession,
  INotification
} from '../lib/mongo';

const API_URL = 'https://ai-interpreter-platfform.onrender.com/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
};

// User Authentication Functions
export const signUpUser = async (email: string, password: string, fullName: string): Promise<IUser> => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });
  return handleResponse(response);
};

export const signInUser = async (email: string, password: string): Promise<IUser> => {
  const response = await fetch(`${API_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const getUserProfile = async (userId: string): Promise<IStudentProfile | null> => {
  const response = await fetch(`${API_URL}/profile/${userId}`);
  return handleResponse(response);
};

export const updateUserProfile = async (userId: string, updates: any): Promise<IStudentProfile | null> => {
  const response = await fetch(`${API_URL}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

export const getStudentProgress = async (userId?: string): Promise<IStudentProgress | IStudentProgress[] | null> => {
  const url = userId ? `${API_URL}/progress/${userId}` : `${API_URL}/progress`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const getLearningMaterials = async (filters?: any): Promise<ILearningMaterials[]> => {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}/materials?${params}`);
  return handleResponse(response);
};

// Lesson Functions
export const getLessons = async (filters?: any): Promise<ILesson[]> => {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}/lessons?${params}`);
  return handleResponse(response);
};

export const getLesson = async (lessonId: string): Promise<ILesson> => {
  const response = await fetch(`${API_URL}/lessons/${lessonId}`);
  return handleResponse(response);
};

// Sign Functions
export const getSigns = async (filters?: any): Promise<ISign[]> => {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}/signs?${params}`);
  return handleResponse(response);
};

export const getSign = async (signId: string): Promise<ISign> => {
  const response = await fetch(`${API_URL}/signs/${signId}`);
  return handleResponse(response);
};

// Practice Session Functions
export const getPracticeSessions = async (userId: string): Promise<IPracticeSession[]> => {
  const response = await fetch(`${API_URL}/practice-sessions/${userId}`);
  return handleResponse(response);
};

export const createPracticeSession = async (sessionData: Omit<IPracticeSession, 'id' | 'created_at' | 'updated_at'>): Promise<IPracticeSession> => {
  const response = await fetch(`${API_URL}/practice-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  });
  return handleResponse(response);
};

export const updatePracticeSession = async (sessionId: string, updates: any): Promise<IPracticeSession> => {
  const response = await fetch(`${API_URL}/practice-sessions/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

// Gesture Attempt Functions
export const createGestureAttempt = async (attemptData: Omit<IGestureAttempt, 'id' | 'created_at'>): Promise<IGestureAttempt> => {
  const response = await fetch(`${API_URL}/gesture-attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attemptData),
  });
  return handleResponse(response);
};

export const getGestureAttempts = async (sessionId: string): Promise<IGestureAttempt[]> => {
  const response = await fetch(`${API_URL}/gesture-attempts/${sessionId}`);
  return handleResponse(response);
};

// Achievement Functions
export const getUserAchievements = async (userId: string): Promise<IAchievement[]> => {
  const response = await fetch(`${API_URL}/achievements/${userId}`);
  return handleResponse(response);
};

export const createAchievement = async (achievementData: Omit<IAchievement, 'id' | 'created_at'>): Promise<IAchievement> => {
  const response = await fetch(`${API_URL}/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(achievementData),
  });
  return handleResponse(response);
};

// Feedback Functions
export const submitFeedback = async (feedbackData: Omit<IFeedback, 'id' | 'created_at' | 'updated_at'>): Promise<IFeedback> => {
  const response = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedbackData),
  });
  return handleResponse(response);
};

export const getUserFeedback = async (userId: string): Promise<IFeedback[]> => {
  const response = await fetch(`${API_URL}/feedback/${userId}`);
  return handleResponse(response);
};

// Notification Functions
export const getUserNotifications = async (userId: string): Promise<INotification[]> => {
  const response = await fetch(`${API_URL}/notifications/${userId}`);
  return handleResponse(response);
};

export const markNotificationAsRead = async (notificationId: string): Promise<INotification> => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
  return handleResponse(response);
};

export const createNotification = async (notificationData: Omit<INotification, 'id' | 'created_at'>): Promise<INotification> => {
  const response = await fetch(`${API_URL}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notificationData),
  });
  return handleResponse(response);
};

// System Stats Functions
export const getSystemStats = async (): Promise<{
  recognitionAccuracy: number;
  wordsInterpreted: number;
  signsLearned: number;
  totalUsers: number;
}> => {
  const response = await fetch(`${API_URL}/stats`);
  return handleResponse(response);
};

// Admin Functions
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/admin/check/${userId}`);
  const result = await handleResponse(response);
  return result.isAdmin;
};

export const createAdminUser = async (email: string, password: string, fullName: string): Promise<IUser> => {
  const response = await fetch(`${API_URL}/admin/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });
  return handleResponse(response);
};
