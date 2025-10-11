import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Video, Zap, Calendar, Play, Clock, Award, 
  TrendingUp, Star, ChevronRight, Sparkles,
  Brain, ChevronLeft, BarChart3, Plus, ChevronDown,
  ArrowRight, CheckCircle2, Circle, Users,
  Target, MessageCircle, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserInterviews, getInterviewStats } from '../services/interviewService';
import { useUserInterviewStore } from '../store/interviewStore';

export default function IntervuAI() {
  const [userName] = useState('Guna');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeInterviews, setActiveInterviews] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAllInterviews, setShowAllInterviews] = useState(false);

  const navigate = useNavigate();
  const { availableRoles } = useUserInterviewStore();

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
        const [interviewsResponse, statsResponse] = await Promise.all([
          getUserInterviews({ 
            sortBy: 'lastActiveAt', 
            order: 'desc',
            limit: 10 
          }).catch(err => {
            console.warn('Failed to load interviews:', err);
            return { interviews: [] };
          }),
          getInterviewStats().catch(err => {
            console.warn('Failed to load stats:', err);
            return {};
          })
        ]);

        const interviews = interviewsResponse.interviews || [];
        setAllInterviews(interviews);
        const active = interviews.filter(interview => interview.status === 'active');
        setActiveInterviews(active);
        setStats(statsResponse || {});
      } catch (error) {
        console.error('Error loading data:', error);
        setAllInterviews([]);
        setActiveInterviews([]);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
    navigate('/pre-interview', { state: { interviewId: interview.interviewId } });
  };

  const handleNewInterview = () => {
    navigate('/pre-interview');
  };

  const displayedInterviews = showAllInterviews ? activeInterviews : activeInterviews.slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-3 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-cyan-200/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8 lg:mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <span className="text-slate-600 text-sm font-medium">Welcome back, {userName}! 👋</span>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-blue-600 tracking-tight">
                  Interview Dashboard
                </h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                  Track your progress, continue practicing, and master your interview skills
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewInterview}
              className="group relative bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-600 px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 w-fit"
            >
              <span className="relative flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                New Interview
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </div>
        </motion.header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Stats Overview */}
            {allInterviews.length > 0 && (
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { 
                    label: 'Total Interviews', 
                    value: stats.totalInterviews || 0, 
                    icon: FileText,
                    color: 'blue' 
                  },
                  { 
                    label: 'Avg Score', 
                    value: `${stats.averageScore || 0}%`, 
                    icon: TrendingUp,
                    color: 'emerald' 
                  },
                  { 
                    label: 'Active', 
                    value: activeInterviews.length, 
                    icon: Zap,
                    color: 'violet' 
                  },
                  { 
                    label: 'Completion', 
                    value: `${stats.completionRate || 0}%`, 
                    icon: CheckCircle2,
                    color: 'amber' 
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ y: -2 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 shadow-xs hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.section>
            )}

            {/* Active Interviews Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xs p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    {activeInterviews.length > 0 ? 'Continue Practicing' : 'Start Your Journey'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {activeInterviews.length > 0 
                      ? 'Pick up where you left off and keep improving'
                      : 'Begin your first mock interview with AI feedback'
                    }
                  </p>
                </div>
                {activeInterviews.length > 2 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllInterviews(!showAllInterviews)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    {showAllInterviews ? 'Show Less' : `View All (${activeInterviews.length})`}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAllInterviews ? 'rotate-180' : ''}`} />
                  </motion.button>
                )}
              </div>

              {/* Empty State */}
              <AnimatePresence>
                {activeInterviews.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={handleNewInterview}
                    className="group cursor-pointer text-center py-12 px-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg shadow-blue-500/25"
                    >
                      <MessageCircle className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Ready to Begin Your Journey?
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                      Start your first AI-powered mock interview and receive personalized feedback to help you improve and succeed.
                    </p>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-3 bg-gradient-to-br from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Start First Interview
                    </motion.button>

                    {availableRoles && availableRoles.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-slate-200">
                        <p className="text-slate-500 text-sm mb-4 font-medium">Popular interview tracks:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {availableRoles.slice(0, 4).map((role, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + idx * 0.1 }}
                              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
                            >
                              {role.label || role.value || role.name || 'Role'}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Active Interview Cards */
                  <motion.div 
                    className="space-y-4"
                    layout
                  >
                    <AnimatePresence>
                      {displayedInterviews.map((interview, index) => (
                        <motion.div
                          key={interview.interviewId}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          whileHover={{ y: -2 }}
                          className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                            {/* Interview Info */}
                            <div className="flex-1 space-y-4">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                  <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                                    {interview.role}
                                  </h3>
                                  <p className="text-slate-500 text-sm">Interview ID: {interview.interviewId}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                      interview.status === 'active' 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      <Circle className="w-1.5 h-1.5 fill-current" />
                                      {interview.status}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Progress Stats */}
                              <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                  <p className="text-slate-500 text-xs font-medium mb-1">Round</p>
                                  <p className="text-lg font-bold text-slate-900">
                                    {interview.currentRound}
                                    <span className="text-slate-400 text-sm font-normal">/{interview.totalRounds}</span>
                                  </p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                  <p className="text-slate-500 text-xs font-medium mb-1">Progress</p>
                                  <p className="text-lg font-bold text-blue-600">
                                    {getProgressPercentage(interview)}%
                                  </p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                  <p className="text-slate-500 text-xs font-medium mb-1">Score</p>
                                  <p className="text-lg font-bold text-emerald-600">
                                    {getOverallScore(interview)}%
                                  </p>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">Progress</span>
                                  <span className="text-slate-700 font-medium">{getProgressPercentage(interview)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getProgressPercentage(interview)}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 + index * 0.1 }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                  />
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-3 pt-2">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleContinueInterview(interview)}
                                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  <Play className="w-4 h-4" />
                                  Continue Practice
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  <span className="hidden sm:inline">Details</span>
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Recent Activity */}
            {allInterviews.length > 0 && (
              <motion.section
                ref={feedbackRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-xs p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Recent Activity</h2>
                    <p className="text-slate-500 text-sm">Your latest interview sessions and progress</p>
                  </div>
                  <button className="flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allInterviews.slice(0, 3).map((interview, idx) => (
                    <motion.div
                      key={interview.interviewId}
                      variants={cardVariants}
                      initial="hidden"
                      animate={feedbackControls}
                      custom={idx}
                      whileHover={{ y: -4 }}
                      className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold text-slate-900">
                            {getOverallScore(interview)}%
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2 truncate">{interview.role}</h3>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Round {interview.currentRound}</span>
                        <span>•</span>
                        <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            interview.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {interview.status}
                          </span>
                          <Award className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Calendar Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 shadow-xs sticky top-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(-1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-3">
                {dayNames.map((day) => (
                  <div key={day} className="text-slate-500 text-xs font-medium py-2">
                    {day.slice(0, 1)}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                        isToday(day)
                          ? 'bg-blue-500 text-white shadow-md'
                          : isSelected(day)
                          ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick Stats */}
            {allInterviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">Progress Summary</h3>
                    <p className="text-blue-100 text-sm opacity-90">Keep up the great work!</p>
                  </div>
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between py-2 border-b border-white/20">
                    <span className="text-blue-100 text-sm">This Week</span>
                    <span className="font-semibold">{Math.min(activeInterviews.length, 3)} sessions</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-blue-100 text-sm">Total Practice</span>
                    <span className="font-semibold">{stats.totalInterviews * 30 || 0} min</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNewInterview}
                  className="w-full bg-white text-blue-600 font-semibold py-2.5 px-4 rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Session
                </motion.button>
              </motion.div>
            )}

            {/* Motivation Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Daily Insight</h4>
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    "The expert in anything was once a beginner. Every interview is a step toward mastery."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}