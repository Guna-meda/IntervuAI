import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Video, Zap, Calendar, Play, Clock, Award, 
  TrendingUp, Star, ChevronRight, Sparkles,
  MessageSquare, Target, Brain, ChevronLeft,
  BarChart3, RotateCcw, Plus, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserInterviews, getInterviewStats } from '../services/interviewService';
import { useUserInterviewStore } from '../store/interviewStore';

export default function IntervuAI() {
  const [userName] = useState('Guna');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeInterviews, setActiveInterviews] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAllInterviews, setShowAllInterviews] = useState(false);

  const navigate = useNavigate();
  const { availableRoles } = useUserInterviewStore();

  const sessionsRef = useRef(null);
  const feedbackRef = useRef(null);
  const statsInView = useInView(sessionsRef, { once: true, margin: '-100px' });
  const feedbackInView = useInView(feedbackRef, { once: true, margin: '-100px' });
  const sessionsControls = useAnimation();
  const feedbackControls = useAnimation();

  useEffect(() => {
    if (statsInView) sessionsControls.start('visible');
    if (feedbackInView) feedbackControls.start('visible');
  }, [statsInView, feedbackInView, sessionsControls, feedbackControls]);

  // Load data from backend
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load interviews and stats in parallel
      const [interviewsResponse, statsResponse] = await Promise.all([
        getUserInterviews({ 
          sortBy: 'lastActiveAt', 
          order: 'desc',
          limit: 10 
        }),
        getInterviewStats()
      ]);

      const interviews = interviewsResponse.interviews || [];
      setAllInterviews(interviews);
      
      // Filter active interviews
      const active = interviews.filter(interview => interview.status === 'active');
      setActiveInterviews(active);
      
      setStats(statsResponse || {});
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } 
    }),
  };

  const getRoundScore = (round) => {
    if (!round.questions || round.questions.length === 0) return 0;
    const avgScore = round.questions.reduce((sum, q) => sum + (q.score || 0), 0) / round.questions.length;
    return Math.round(avgScore * 10) / 10;
  };

  const getOverallScore = (interview) => {
    if (!interview.rounds) return 0;
    const completedRounds = interview.rounds.filter(round => round.status === 'completed');
    if (completedRounds.length === 0) return 0;
    
    const totalScore = completedRounds.reduce((sum, round) => {
      const roundScore = getRoundScore(round);
      return sum + (roundScore || 0);
    }, 0);
    
    return Math.round((totalScore / completedRounds.length) * 10) / 10;
  };

  const getProgressPercentage = (interview) => {
    if (!interview.rounds || !interview.totalRounds) return 0;
    const completedRounds = interview.rounds.filter(round => round.status === 'completed').length;
    return Math.round((completedRounds / interview.totalRounds) * 100);
  };


  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = [
    { short: 'S', full: 'Sunday' },
    { short: 'M', full: 'Monday' },
    { short: 'T', full: 'Tuesday' },
    { short: 'W', full: 'Wednesday' },
    { short: 'T', full: 'Thursday' },
    { short: 'F', full: 'Friday' },
    { short: 'S', full: 'Saturday' }
  ];

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleContinueInterview = (interview) => {
    navigate('/pre-interview', { state: { interviewId: interview.interviewId } });
  };

  const handleNewInterview = () => {
    navigate('/pre-interview');
  };

  const displayedInterviews = showAllInterviews ? activeInterviews : activeInterviews.slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs text-gray-500 mb-1">Welcome back, {userName} ⭐</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">IntervuAI</h1>
            <p className="text-sm text-gray-600">AI-powered interview preparation platform</p>
          </motion.div>
        </div>

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Your Progress</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Total Sessions</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalInterviews || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Avg Score</p>
              <p className="text-xl font-bold text-green-600">{stats.averageScore || 0}%</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Active Interviews</p>
              <p className="text-xl font-bold text-blue-600">{activeInterviews.length}</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Completion Rate</p>
              <p className="text-xl font-bold text-orange-600">{stats.completionRate || 0}%</p>
            </div>
          </div>
        </motion.div>

        {/* Active Interviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Active Interviews</h2>
            <div className="flex gap-2">
              {activeInterviews.length > 2 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAllInterviews(!showAllInterviews)}
                  className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50"
                >
                  {showAllInterviews ? 'Show Less' : `Show All (${activeInterviews.length})`}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAllInterviews ? 'rotate-180' : ''}`} />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewInterview}
                className="text-xs text-white font-semibold flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600"
              >
                <Plus className="w-3 h-3" />
                New Interview
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedInterviews.map((interview, index) => (
              <motion.div
                key={interview.interviewId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{interview.role}</h3>
                    <p className="text-xs text-gray-500">Interview ID: {interview.interviewId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      interview.status === 'active' 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Current Round</p>
                    <p className="text-sm font-bold text-gray-800">
                      {interview.currentRound} of {interview.totalRounds}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Progress</p>
                    <p className="text-sm font-bold text-blue-600">
                      {getProgressPercentage(interview)}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage(interview)}%` }}
                  ></div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleContinueInterview(interview)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Continue
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gray-100 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-200"
                  >
                    <BarChart3 className="w-3 h-3" />
                    Analytics
                  </motion.button>
                </div>
              </motion.div>
            ))}

            {/* New Interview Card */}
            {activeInterviews.length < 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (displayedInterviews.length + 1) }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-dashed border-blue-200 hover:border-blue-300 transition-all cursor-pointer group"
                onClick={handleNewInterview}
              >
                <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-blue-600 text-sm mb-1">Start New Interview</h3>
                  <p className="text-xs text-blue-500">Begin a new practice session</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Rest of the content remains similar but with real data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Session Types & Recent Sessions */}
          <div className="lg:col-span-2 space-y-6">
           

            {/* Recent Sessions */}
           {allInterviews.length > 0 && (
    <motion.div ref={feedbackRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Recent Sessions</h2>
        <button className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
          View All
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {allInterviews.slice(0, 3).map((interview, idx) => (
          <motion.div
            key={interview.interviewId}
            variants={cardVariants}
            initial="hidden"
            animate={feedbackControls}
            custom={idx}
            className="bg-white rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-gray-800">
                  {getOverallScore(interview)}%
                </span>
              </div>
            </div>
            <h3 className="text-xs font-bold text-gray-800 mb-1">{interview.role}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Round {interview.currentRound}
              </span>
              <span>•</span>
              <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Award className="w-3 h-3 text-blue-500" />
                {interview.status === 'completed' ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )}
          </div>

          {/* Right Column: Calendar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg p-3 shadow-md border border-gray-100 max-w-xs aspect-square"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(-1)}
                    className="p-1 rounded-md hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(1)}
                    className="p-1 rounded-md hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {dayNames.map((day, index) => (
                  <div key={day.full} className="text-center font-semibold text-gray-500 py-1">
                    {day.short}
                  </div>
                ))}
                {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-6"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`h-6 rounded-md flex items-center justify-center text-xs font-medium transition-all ${
                        isToday(day)
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md'
                          : isSelected(day)
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}