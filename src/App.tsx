import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { checkAdminStatus } from "./services/mongoApi";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import StudentProfile from "./pages/StudentProfile";
import LearningMaterials from "./pages/LearningMaterials";
import LessonPage from "./pages/LessonPage";
import { CommunitySigns } from "./pages/CommunitySigns";
import AuthModal from "./components/auth/AuthModal";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userParam = urlParams.get('user');
      const error = urlParams.get('error');

      if (error) {
        console.error('Auth error:', error);
        // Remove error from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (token && userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          localStorage.setItem('user', JSON.stringify(userData));
          // Remove token and user from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.reload();
        } catch (error) {
          console.error('Error parsing auth callback:', error);
        }
      }
    };

    handleAuthCallback();

    const checkAdminAndRedirect = async () => {
      if (user && location.pathname === "/") {
        try {
          const isAdmin = await checkAdminStatus(user.id);
          if (isAdmin) {
            navigate("/admin");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }
    };

    checkAdminAndRedirect();
  }, [user, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <AuthModal isOpen={true} onClose={() => {}} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<StudentProfile />} />
      <Route path="/materials" element={<LearningMaterials />} />
      <Route path="/lesson/:lessonId" element={<LessonPage />} />
      <Route path="/community" element={<CommunitySigns />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
