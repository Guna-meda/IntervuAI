import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Video, Zap, Calendar, Play, Clock, Award, 
  TrendingUp, Star, ChevronRight, Sparkles,
  Brain, ChevronLeft, BarChart3, Plus, ChevronDown,
  ArrowRight, CheckCircle2, Circle, Users,
  Target, MessageCircle, FileText, Rocket,
  Cloud, Waves, Cpu, BrainCircuit,
  RotateCcw, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserInterviews, getInterviewDetails, getInterviewStats, deleteInterview } from '../services/interviewService';
import { useUserInterviewStore } from '../store/interviewStore';

export default function IntervuAI() {
  const [userName] = useState('Guna');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeInterviews, setActiveInterviews] = useState([]);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [isHoveringNewSession, setIsHoveringNewSession] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [activeTotal, setActiveTotal] = useState(0);
  const [completedTotal, setCompletedTotal] = useState(0);
  const limit = 10;

  const navigate = useNavigate();
  const { availableRoles, currentInterviewId, setCurrentInterviewId, clearInterviewData } = useUserInterviewStore();

  const feedbackRef = useRef(null);
  const feedbackInView = useInView(feedbackRef, { once: true, margin: '-50px' });
  const feedbackControls = useAnimation();

  useEffect(() => {
    if (feedbackInView) feedbackControls.start('visible');
  }, [feedbackInView, feedbackControls]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [activeResponse, completedResponse, statsResponse] = await Promise.all([
          getUserInterviews({ 
            status: 'active',
            limit,
            page: activePage,
            sortBy: 'lastActiveAt',
            order: 'desc'
          }).catch(err => {
            console.warn('Failed to load active interviews:', err);
            return { interviews: [], totalCount: 0, activeCount: 0, completedCount: 0, page: 1, limit };
          }),
          getUserInterviews({ 
            status: 'completed',
            limit,
            page: completedPage,
            sortBy: 'completedAt',
            order: 'desc'
          }).catch(err => {
            console.warn('Failed to load completed interviews:', err);
            return { interviews: [], totalCount: 0, activeCount: 0, completedCount: 0, page: 1, limit };
          }),
          getInterviewStats().catch(err => {
            console.warn('Failed to load stats:', err);
            return {};
          })
        ]);

        const activeInterviews = activeResponse.interviews || [];
        const completedInterviews = completedResponse.interviews || [];
        const allInts = [...activeInterviews, ...completedInterviews];

        const enrichedActive = await Promise.all(
          activeInterviews.map(async (interview) => {
            const { interview: details } = await getInterviewDetails(interview.interviewId);
            return details;
          })
        );

        const enrichedCompleted = await Promise.all(
          completedInterviews.map(async (interview) => {
            const { interview: details } = await getInterviewDetails(interview.interviewId);
            return details;
          })
        );

        const enrichedAll = [...enrichedActive, ...enrichedCompleted];

        setActiveInterviews(enrichedActive);
        setCompletedInterviews(enrichedCompleted);
        setAllInterviews(enrichedAll);
        setActiveTotal(activeResponse.totalCount || 0);
        setCompletedTotal(completedResponse.totalCount || 0);
        setStats(statsResponse || {});
      } catch (error) {
        console.error('Error loading data:', error);
        setActiveInterviews([]);
        setCompletedInterviews([]);
        setAllInterviews([]);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activePage, completedPage]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i) => ({ 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: i * 0.1, 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }),
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  const toastVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      x: 50,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  };

  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
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

  const getSessionCountForDay = (day) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return allInterviews.filter(interview => {
      const sessionDate = new Date(interview.completedAt || interview.lastActiveAt);
      return (
        sessionDate.getFullYear() === targetDate.getFullYear() &&
        sessionDate.getMonth() === targetDate.getMonth() &&
        sessionDate.getDate() === targetDate.getDate()
      );
    }).length;
  };

  const getGreenShade = (sessionCount) => {
    if (sessionCount === 0) return '';
    if (sessionCount === 1) return 'bg-emerald-100';
    if (sessionCount === 2) return 'bg-emerald-200';
    if (sessionCount === 3) return 'bg-emerald-300';
    return 'bg-emerald-400';
  };

  const handleActivePageChange = async (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(activeTotal / limit)) return;
    setActivePage(newPage);
  };

  const handleCompletedPageChange = async (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(completedTotal / limit)) return;
    setCompletedPage(newPage);
  };

  const handleDeleteInterview = async (interviewId) => {
    try {
      await deleteInterview(interviewId);
      setAllInterviews(prev => prev.filter(interview => interview.interviewId !== interviewId));
      setActiveInterviews(prev => prev.filter(interview => interview.interviewId !== interviewId));
      setCompletedInterviews(prev => prev.filter(interview => interview.interviewId !== interviewId));
      if (currentInterviewId === interviewId) clearInterviewData();
      const statsResponse = await getInterviewStats().catch(err => {
        console.warn('Failed to load stats:', err);
        return {};
      });
      setStats(statsResponse || {});
      setToast({ type: 'success', message: 'Interview deleted successfully' });
      setTimeout(() => setToast(null), 3000);
      handleActivePageChange(activePage);
      handleCompletedPageChange(completedPage);
    } catch (error) {
      console.error('Error deleting interview:', error);
      setToast({ type: 'error', message: error.message || 'Failed to delete interview. Please try again.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setShowDeleteConfirm(false);
      setInterviewToDelete(null);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    setCurrentInterviewId(interview.interviewId);
    navigate('/pre-interview', { state: { interviewId: interview.interviewId } });
  };

  const handleNewInterview = () => {
    setCurrentInterviewId(null);
    navigate('/pre-interview');
  };

  const handleViewReport = (interviewId) => {
    navigate('/view-report', { state: { interviewId } });
  };

  const displayedActive = showAllActive ? activeInterviews : activeInterviews.slice(0, 2);
  const displayedCompleted = showAllCompleted ? completedInterviews : completedInterviews.slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-3 border-cyan-200 border-t-cyan-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 relative overflow-hidden">
      {/* Confirmation Popup */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Interview</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to delete this interview? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-slate-600 font-medium rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteInterview(interviewToDelete)}
                  className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed top-4 right-4 rounded-2xl p-4 max-w-sm w-full shadow-xl z-50 ${
              toast.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
            }`}
          >
            <p className={`font-medium ${toast.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
              {toast.message}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setToast(null)}
              className={`mt-2 text-sm font-medium ${toast.type === 'success' ? 'text-emerald-600 hover:underline' : 'text-red-600 hover:underline'}`}
            >
              Close
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          className="absolute top-1/4 -left-10 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          transition={{ delay: 1 }}
          className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          transition={{ delay: 2 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-200/10 rounded-full blur-3xl"
        />
        
        {/* Geometric Patterns */}
        <div className="absolute top-20 right-20 opacity-5">
          <BrainCircuit className="w-40 h-40 text-cyan-500" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-5">
          <Cpu className="w-40 h-40 text-blue-500" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header with New Session Button */}
        <motion.header
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 border border-cyan-200/50 shadow-xs mb-2 sm:mb-4"
              >
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                <span className="text-cyan-700 text-xs sm:text-sm font-medium">AI Interview Coach Active</span>
              </motion.div>
              
              <motion.h1
                variants={itemVariants}
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
              >
                Welcome back, {userName}!
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-slate-600 mt-1 sm:mt-2 max-w-xs sm:max-w-2xl text-sm sm:text-base md:text-lg"
              >
                Ready to ace your next interview? Practice with our AI-powered sessions and get instant feedback.
              </motion.p>
            </div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHoveringNewSession(true)}
              onHoverEnd={() => setIsHoveringNewSession(false)}
              onClick={handleNewInterview}
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden min-w-[160px] sm:min-w-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                <motion.div
                  animate={{ rotate: isHoveringNewSession ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
                <span className="text-xs sm:text-sm">New Interview Session</span>
              </div>
              
              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100"
                style={{ filter: 'blur(8px)' }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Active Interviews Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-cyan-200/40 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-cyan-100/20 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16" />
              <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-blue-100/20 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-cyan-100 rounded-lg sm:rounded-xl">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                    </div>
                    <h2 className="font-semibold text-slate-900 text-base sm:text-lg md:text-xl">
                      Active Interviews
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllActive(!showAllActive)}
                    className="text-cyan-600 font-medium text-xs sm:text-sm flex items-center gap-1 hover:underline bg-cyan-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg"
                  >
                    {showAllActive ? 'Show Less' : 'View All'}
                    <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showAllActive ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>

                {displayedActive.length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="text-center py-6 sm:py-8 relative"
                  >
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Video className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
                    </div>
                    <p className="text-slate-600 font-medium text-sm sm:text-base mb-1 sm:mb-1.5">No active interviews yet.</p>
                    <p className="text-slate-500 text-xs sm:text-sm mb-2 sm:mb-3">Start your first AI-powered interview session</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNewInterview}
                      className="inline-flex items-center gap-1.5 sm:gap-2 bg-cyan-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                      <Rocket className="w-3 h-3 sm:w-4 h-4" />
                      Start First Interview
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {displayedActive.map((interview, index) => (
                      <motion.div
                        key={interview.interviewId}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -2 }}
                        className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-cyan-200/40 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 w-1 sm:w-2 h-full bg-gradient-to-b from-cyan-400 to-blue-400" />
                        
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <h3 className="font-semibold text-slate-900 text-sm sm:text-base md:text-lg line-clamp-1">{interview.role}</h3>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span
                              className={`text-xs font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
                                interview.status === 'completed' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-cyan-100 text-cyan-700'
                              }`}
                            >
                              {interview.status}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setInterviewToDelete(interview.interviewId);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-2 mb-1 sm:mb-2 text-xs sm:text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium text-slate-900">
                              {interview.rounds.filter(r => r.status === 'completed').length}/{interview.totalRounds}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Score</span>
                            <span className="font-medium text-slate-900">{getOverallScore(interview)}/10</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Last Active</span>
                            <span className="font-medium text-slate-900">
                              {new Date(interview.lastActiveAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-1 sm:mt-2 h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgressPercentage(interview)}%` }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                          />
                        </div>
                        
                        <div className="mt-1 sm:mt-2 flex items-center justify-between flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm">
                          <motion.button
                            whileHover={{ scale: 1.05, x: 1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleContinueInterview(interview)}
                            className="text-cyan-600 font-medium flex items-center gap-0.5 sm:gap-1 hover:underline group/btn"
                          >
                            Continue
                            <ArrowRight className="w-2.5 h-2.5 sm:w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewReport(interview.interviewId)}
                            className="text-slate-600 font-medium flex items-center gap-0.5 sm:gap-1 hover:underline"
                          >
                            View Report
                            <FileText className="w-2.5 h-2.5 sm:w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {showAllActive && activeTotal > limit && (
                  <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActivePageChange(activePage - 1)}
                      disabled={activePage === 1}
                      className="px-2 sm:px-3 py-1 bg-slate-200 text-slate-700 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-all"
                    >
                      Previous
                    </motion.button>
                    {Array.from({ length: Math.ceil(activeTotal / limit) }, (_, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActivePageChange(i + 1)}
                        className={`px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          activePage === i + 1 ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {i + 1}
                      </motion.button>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActivePageChange(activePage + 1)}
                      disabled={activePage === Math.ceil(activeTotal / limit)}
                      className="px-2 sm:px-3 py-1 bg-slate-200 text-slate-700 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-all"
                    >
                      Next
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Completed Interviews Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-cyan-200/40 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-emerald-100/20 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16" />
              <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-teal-100/20 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg sm:rounded-xl">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    </div>
                    <h2 className="font-semibold text-slate-900 text-base sm:text-lg md:text-xl">
                      Completed Interviews
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                    className="text-emerald-600 font-medium text-xs sm:text-sm flex items-center gap-1 hover:underline bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg"
                  >
                    {showAllCompleted ? 'Show Less' : 'View All'}
                    <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showAllCompleted ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>

                {displayedCompleted.length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="text-center py-6 sm:py-8 relative"
                  >
                    <div className="w-16 sm:w-20 h-16 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Award className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                    </div>
                    <p className="text-slate-600 font-medium text-sm sm:text-base mb-1 sm:mb-1.5">No completed interviews yet.</p>
                    <p className="text-slate-500 text-xs sm:text-sm mb-2 sm:mb-3">Complete an interview to see your results here</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {displayedCompleted.map((interview, index) => (
                      <motion.div
                        key={interview.interviewId}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -2 }}
                        className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-emerald-200/40 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 w-1 sm:w-2 h-full bg-gradient-to-b from-emerald-400 to-teal-400" />
                        
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <h3 className="font-semibold text-slate-900 text-sm sm:text-base md:text-lg line-clamp-1">{interview.role}</h3>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-xs font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-700">
                              Completed
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setInterviewToDelete(interview.interviewId);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-2 mb-1 sm:mb-2 text-xs sm:text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Rounds Completed</span>
                            <span className="font-medium text-slate-900">
                              {interview.rounds.filter(r => r.status === 'completed').length}/{interview.totalRounds}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Final Score</span>
                            <span className="font-medium text-slate-900">{getOverallScore(interview)}/10</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Completed On</span>
                            <span className="font-medium text-slate-900">
                              {new Date(interview.completedAt || interview.lastActiveAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-1 sm:mt-2 h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgressPercentage(interview)}%` }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                          />
                        </div>
                        
                        <div className="mt-1 sm:mt-2 flex items-center justify-between flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm">
                          <motion.button
                            whileHover={{ scale: 1.05, x: 1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewReport(interview.interviewId)}
                            className="text-emerald-600 font-medium flex items-center gap-0.5 sm:gap-1 hover:underline group/btn"
                          >
                            View Report
                            <FileText className="w-2.5 h-2.5 sm:w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleContinueInterview(interview)}
                            className="text-slate-600 font-medium flex items-center gap-0.5 sm:gap-1 hover:underline"
                          >
                            Retake
                            <RotateCcw className="w-2.5 h-2.5 sm:w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {showAllCompleted && completedTotal > limit && (
                  <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCompletedPageChange(completedPage - 1)}
                      disabled={completedPage === 1}
                      className="px-2 sm:px-3 py-1 bg-slate-200 text-slate-700 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-all"
                    >
                      Previous
                    </motion.button>
                    {Array.from({ length: Math.ceil(completedTotal / limit) }, (_, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCompletedPageChange(i + 1)}
                        className={`px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          completedPage === i + 1 ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {i + 1}
                      </motion.button>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCompletedPageChange(completedPage + 1)}
                      disabled={completedPage === Math.ceil(completedTotal / limit)}
                      className="px-2 sm:px-3 py-1 bg-slate-200 text-slate-700 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-all"
                    >
                      Next
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Performance Analytics Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg sm:rounded-xl">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                </div>
                <h2 className="font-semibold text-slate-900 text-base sm:text-lg md:text-xl">
                  Performance Analytics
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Average Score', value: stats.averageScore || 0, unit: '/10', 
                    gradient: 'from-cyan-50 to-blue-50', text: 'text-cyan-700', icon: TrendingUp },
                  { label: 'Completion Rate', value: stats.completionRate || 0, unit: '%', 
                    gradient: 'from-emerald-50 to-teal-50', text: 'text-emerald-700', icon: CheckCircle2 },
                  { label: 'Recent Activity', value: stats.recentActivity || 0, unit: 'sessions', 
                    gradient: 'from-amber-50 to-orange-50', text: 'text-amber-700', icon: Zap }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    className={`bg-gradient-to-br ${stat.gradient} p-2 sm:p-3 rounded-lg sm:rounded-2xl border border-slate-200/40 relative overflow-hidden group hover:shadow-md transition-all`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                        <p className={`text-xs sm:text-sm font-medium ${stat.text}`}>{stat.label}</p>
                        <stat.icon className={`w-3 h-3 sm:w-4 h-4 ${stat.text}`} />
                      </div>
                      <p className={`text-lg sm:text-2xl font-bold ${stat.text.replace('700', '900')}`}>
                        {stat.value}{stat.unit}
                      </p>
                    </div>
                    <div className="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-white/20 rounded-tl-full" />
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Recent Feedback Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              ref={feedbackRef}
              className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg sm:rounded-xl">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                </div>
                <h2 className="font-semibold text-slate-900 text-base sm:text-lg md:text-xl">
                  Recent Feedback
                </h2>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {allInterviews.slice(0, 3).map((interview, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="p-2 sm:p-3 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-lg sm:rounded-2xl border border-cyan-200/40 group hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-1.5 sm:gap-2 flex-wrap">
                      <div className="w-1.5 sm:w-2 h-8 sm:h-12 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 mb-0.5 sm:mb-1 text-sm sm:text-base truncate">{interview.role}</p>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {interview.overallFeedback || 'No feedback yet. Complete an interview round to get AI-powered feedback.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Calendar Widget */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-cyan-200/40 shadow-xs sticky top-4 sm:top-6 w-full max-w-xs mx-auto"
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <h3 className="font-semibold text-slate-900 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base">
                  <Calendar className="w-3 h-3 sm:w-4 h-4 text-cyan-500" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-0.5 sm:gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(-1)}
                    className="p-0.5 sm:p-1 rounded-md sm:rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-2 h-2 sm:w-3 sm:h-3 text-slate-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(1)}
                    className="p-0.5 sm:p-1 rounded-md sm:rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-2 h-2 sm:w-3 sm:h-3 text-slate-600" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center mb-0.5 sm:mb-1">
                {dayNames.map((day) => (
                  <div key={day} className="text-slate-500 text-xxs sm:text-xs font-medium py-0.5 sm:py-1">
                    {day.slice(0, 1)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const sessionCount = getSessionCountForDay(day);
                  const greenShade = getGreenShade(sessionCount);
                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center text-xxs sm:text-xs md:text-sm font-medium transition-all ${
                        isToday(day)
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-md'
                          : isSelected(day)
                          ? 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-500'
                          : sessionCount > 0
                          ? `${greenShade} text-slate-900`
                          : 'text-slate-700 hover:bg-cyan-50'
                      }`}
                    >
                      {day}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Progress Summary Card */}
            {allInterviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-white shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-white/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16" />
                <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">Progress Summary</h3>
                      <p className="text-cyan-100 text-xs sm:text-sm opacity-90">Keep up the great work!</p>
                    </div>
                    <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                      <TrendingUp className="w-3 h-3 sm:w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                    <div className="flex items-center justify-between py-1 border-b border-white/20 flex-wrap gap-1">
                      <span className="text-cyan-100 text-xs sm:text-sm">This Week</span>
                      <span className="font-semibold">{Math.min(activeInterviews.length, 3)} sessions</span>
                    </div>
                    <div className="flex items-center justify-between py-1 flex-wrap gap-1">
                      <span className="text-cyan-100 text-xs sm:text-sm">Total Practice</span>
                      <span className="font-semibold">{stats.totalInterviews * 30 || 0} min</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNewInterview}
                    className="w-full bg-white text-cyan-600 font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm relative z-20"
                  >
                    <Plus className="w-3 h-3 sm:w-4 h-4" />
                    New Session
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Daily Insight Card */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-cyan-200/40 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-cyan-100/30 rounded-full -translate-y-8 sm:-translate-y-8 translate-x-8 sm:translate-x-8" />
              
              <div className="relative z-10">
                <div className="flex items-start gap-1.5 sm:gap-2 flex-wrap">
                  <div className="flex-shrink-0 w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <Sparkles className="w-3 h-3 sm:w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Daily Insight</h4>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic line-clamp-2 sm:line-clamp-3">
                      "The expert in anything was once a beginner. Every interview is a step toward mastery."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}