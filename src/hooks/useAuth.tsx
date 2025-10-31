
import { createContext, useContext, useEffect, useState } from 'react';
import { signUpUser, signInUser, getUserProfile, updateUserProfile } from '../services/mongoApi';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string; bio?: string; learning_goals?: string; skill_level?: 'beginner' | 'intermediate' | 'advanced'; preferred_language?: 'ASL' | 'KSL' | 'BSL' }) => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if MySQL is configured
    const mysqlConfigured = true; // MySQL is now configured by default
    
    if (!mysqlConfigured) {
      console.warn('MySQL not configured. Running in demo mode.');
      setIsConfigured(false);
      setLoading(false);
      return;
    }

    setIsConfigured(true);
    setLoading(false);

    // Check for existing user session in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isConfigured) {
      throw new Error('MySQL is not configured. Please check your database connection.');
    }
    
    try {
      const newUser = await signUpUser(email, password, fullName);
      const userData = {
        id: newUser.id.toString(),
        email: newUser.email,
        user_metadata: { full_name: newUser.full_name, avatar_url: newUser.avatar_url }
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('SignUp error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signInWithGoogle = () => {
    const baseUrl = import.meta.env.DEV ? 'http://localhost:3000' : 'https://ai-interpreter-platfform.onrender.com';
    window.location.href = `${baseUrl}/api/auth/google`;
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      throw new Error('MySQL is not configured. Please check your database connection.');
    }
    
    try {
      const authUser = await signInUser(email, password);
      const userData = {
        id: authUser.id.toString(),
        email: authUser.email,
        user_metadata: { full_name: authUser.full_name, avatar_url: authUser.avatar_url }
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('SignIn error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string; bio?: string; learning_goals?: string; skill_level?: 'beginner' | 'intermediate' | 'advanced'; preferred_language?: 'ASL' | 'KSL' | 'BSL' }) => {
    if (!isConfigured || !user) {
      throw new Error('MySQL is not configured or user not found.');
    }
    
    try {
      const updatedProfile = await updateUserProfile(user.id, updates);
      
      if (updatedProfile) {
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            full_name: updatedProfile.full_name,
            avatar_url: updatedProfile.avatar_url,
          }
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('UpdateProfile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      isConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
