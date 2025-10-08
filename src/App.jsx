import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import LandingPage from "./pages/LandingPage";
import Sidebar from './components/Overall/Sidebar';
import Overview from './pages/Overview';
import IntervuAI from './pages/IntervuAI';
import Analytics from './pages/Analytics';
import InterviewPage from "./pages/InterviewPage";
import ProfilePage from "./pages/ProfilePage";

const AppContent = () => {
  const { user, loading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    const closeSidebar = () => {
      setIsSidebarOpen(false);
    };

    window.addEventListener('closeSidebar', closeSidebar);

    return () => {
      window.removeEventListener('closeSidebar', closeSidebar);
    };
  }, []);

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
          <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
            <Routes>
              <Route path="/overview" element={<Overview />} />
              <Route path="/intervuai" element={<IntervuAI />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/interviewPage" element={<InterviewPage />} />
              <Route path="/profile" element={<ProfilePage />} />
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