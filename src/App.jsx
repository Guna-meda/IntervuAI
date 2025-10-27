import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import LandingPage from "./pages/LandingPage";
import Sidebar from './components/Overall/Sidebar';
import Overview from './pages/Overview';
import IntervuAI from './pages/IntervuAI';
import Analytics from './pages/Analytics';
import InterviewPage from "./pages/InterviewPage";
import ProfilePage from "./pages/ProfilePage";
import PreInterviewPage from "./components/InterviewRoom/PreInterviewPage";
import ViewReport from "./components/InterviewRoom/ViewReport";

const AppContent = () => {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Combine both useEffects into one to maintain hook order
  React.useEffect(() => {
    // Sidebar close listener
    const closeSidebar = () => {
      setIsSidebarOpen(false);
    };
    window.addEventListener('closeSidebar', closeSidebar);

    // Navigation logic based on auth state
    if (!loading && user) {
      try {
        const path = window.location.pathname;
        if (path === '/' || path === '/landing') {
          navigate('/overview', { replace: true });
        }
      } catch (e) {
        console.debug('Navigation during auth state change failed', e);
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener('closeSidebar', closeSidebar);
    };
  }, [user, loading, navigate]); // Dependencies include user, loading, and navigate

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64 ml-0' : 'lg:ml-20 ml-0'} pt-16 lg:pt-0`}>
            <Routes>
              <Route path="/overview" element={<Overview />} />
              <Route path="/intervuai" element={<IntervuAI />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/interviewPage" element={<InterviewPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/pre-interview" element={<PreInterviewPage />} />
              <Route path="/view-report" element={<ViewReport />} />
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;