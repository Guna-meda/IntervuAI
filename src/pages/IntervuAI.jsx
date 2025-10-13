// IntervuAI.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Video, Zap, Calendar, Play, Clock, Award, 
  TrendingUp, Star, ChevronRight, Sparkles,
  Brain, ChevronLeft, BarChart3, Plus, ChevronDown,
  ArrowRight, CheckCircle2, Circle, Users,
  Target, MessageCircle, FileText, Rocket,
  Cloud, Waves, Cpu, BrainCircuit,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserInterviews, getInterviewDetails, getInterviewStats } from '../services/interviewService';
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
  const [isHoveringNewSession, setIsHoveringNewSession] = useState(false);

  const navigate = useNavigate();
  const { availableRoles, currentInterviewId, setCurrentInterviewId } = useUserInterviewStore();

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
        const enrichedInterviews = await Promise.all(
          interviews.map(async (interview) => {
            const { interview: details } = await getInterviewDetails(interview.interviewId);
            return details;
          })
        );

        setAllInterviews(enrichedInterviews);
        const active = enrichedInterviews.filter(interview => interview.status === 'active');
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

  const displayedInterviews = showAllInterviews ? activeInterviews : activeInterviews.slice(0, 2);

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

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header with New Session Button */}
        <motion.header
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-2 border border-cyan-200/50 shadow-xs mb-4"
              >
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                <span className="text-cyan-700 text-sm font-medium">AI Interview Coach Active</span>
              </motion.div>
              
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
              >
                Welcome back, {userName}!
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-slate-600 mt-2 max-w-2xl text-base md:text-lg"
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
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden min-w-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: isHoveringNewSession ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Rocket className="w-5 h-5" />
                </motion.div>
                <span className="text-sm">New Interview Session</span>
              </div>
              
              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100"
                style={{
                  filter: 'blur(10px)',
                }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            {/* Active Interviews Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs relative overflow-hidden"
            >
              {/* Section Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100/20 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100/20 rounded-full translate-y-12 -translate-x-12" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-xl">
                      <Play className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h2 className="font-semibold text-slate-900 text-lg md:text-xl">
                      Active Interviews
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllInterviews(!showAllInterviews)}
                    className="text-cyan-600 font-medium text-sm flex items-center gap-1 hover:underline bg-cyan-50 px-3 py-1.5 rounded-lg"
                  >
                    {showAllInterviews ? 'Show Less' : 'View All'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAllInterviews ? 'rotate-180' : ''}`} />
                  </motion.button>
                </div>

                {displayedInterviews.length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="text-center py-12 relative"
                  >
                    <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8 text-cyan-600" />
                    </div>
                    <p className="text-slate-600 font-medium mb-2">No active interviews yet.</p>
                    <p className="text-slate-500 text-sm mb-4">Start your first AI-powered interview session</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNewInterview}
                      className="inline-flex items-center gap-2 bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                      <Rocket className="w-4 h-4" />
                      Start First Interview
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedInterviews.map((interview, index) => (
                      <motion.div
                        key={interview.interviewId}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -4 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-cyan-200/40 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                      >
                        {/* Card accent */}
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-400 to-blue-400" />
                        
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-slate-900 text-base md:text-lg">{interview.role}</h3>
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              interview.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-cyan-100 text-cyan-700'
                            }`}
                          >
                            {interview.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium text-slate-900">
                              {interview.rounds.filter(r => r.status === 'completed').length}/{interview.totalRounds}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Score</span>
                            <span className="font-medium text-slate-900">{getOverallScore(interview)}/10</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Last Active</span>
                            <span className="font-medium text-slate-900">
                              {new Date(interview.lastActiveAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${getProgressPercentage(interview)}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <motion.button
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleContinueInterview(interview)}
                            className="text-cyan-600 font-medium text-sm flex items-center gap-1 hover:underline group/btn"
                          >
                            Continue
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewReport(interview.interviewId)}
                            className="text-slate-600 font-medium text-sm flex items-center gap-1 hover:underline"
                          >
                            View Report
                            <FileText className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>


{/* Completed Interviews Section */}
<motion.section
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs relative overflow-hidden"
>
  {/* Section Background Pattern */}
  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/20 rounded-full -translate-y-16 translate-x-16" />
  <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100/20 rounded-full translate-y-12 -translate-x-12" />
  
  <div className="relative z-10">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-xl">
          <Award className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="font-semibold text-slate-900 text-lg md:text-xl">
          Completed Interviews
        </h2>
      </div>
    </div>

    {allInterviews.filter(interview => interview.status === 'completed').length === 0 ? (
      <motion.div
        variants={itemVariants}
        className="text-center py-12 relative"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-emerald-600" />
        </div>
        <p className="text-slate-600 font-medium mb-2">No completed interviews yet.</p>
        <p className="text-slate-500 text-sm mb-4">Complete an interview to see your results here</p>
      </motion.div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allInterviews
          .filter(interview => interview.status === 'completed')
          .slice(0, 4)
          .map((interview, index) => (
            <motion.div
              key={interview.interviewId}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-emerald-200/40 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Card accent */}
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-400 to-teal-400" />
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 text-base md:text-lg">{interview.role}</h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  Completed
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Rounds Completed</span>
                  <span className="font-medium text-slate-900">
                    {interview.rounds.filter(r => r.status === 'completed').length}/{interview.totalRounds}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Final Score</span>
                  <span className="font-medium text-slate-900">{getOverallScore(interview)}/10</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Completed On</span>
                  <span className="font-medium text-slate-900">
                    {new Date(interview.completedAt || interview.lastActiveAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage(interview)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewReport(interview.interviewId)}
                  className="text-emerald-600 font-medium text-sm flex items-center gap-1 hover:underline group/btn"
                >
                  View Report
                  <FileText className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleContinueInterview(interview)}
                  className="text-slate-600 font-medium text-sm flex items-center gap-1 hover:underline"
                >
                  Retake
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
      </div>
    )}
  </div>
</motion.section>

            {/* Performance Analytics Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="font-semibold text-slate-900 text-lg md:text-xl">
                  Performance Analytics
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-2xl border border-slate-200/40 relative overflow-hidden group hover:shadow-md transition-all`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-sm font-medium ${stat.text}`}>{stat.label}</p>
                        <stat.icon className={`w-4 h-4 ${stat.text}`} />
                      </div>
                      <p className={`text-2xl font-bold ${stat.text.replace('700', '900')}`}>
                        {stat.value}{stat.unit}
                      </p>
                    </div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/20 rounded-tl-full" />
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
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="font-semibold text-slate-900 text-lg md:text-xl">
                  Recent Feedback
                </h2>
              </div>
              
              <div className="space-y-4">
                {allInterviews.slice(0, 3).map((interview, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="p-4 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-2xl border border-cyan-200/40 group hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-12 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 mb-1">{interview.role}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
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
          <div className="xl:col-span-1 space-y-6">
            {/* Calendar Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-cyan-200/40 shadow-xs sticky top-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(-1)}
                    className="p-1.5 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#f1f5f9' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(1)}
                    className="p-1.5 rounded-lg transition-colors"
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
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                        isToday(day)
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-md'
                          : isSelected(day)
                          ? 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-500'
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">Progress Summary</h3>
                      <p className="text-cyan-100 text-sm opacity-90">Keep up the great work!</p>
                    </div>
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between py-2 border-b border-white/20">
                      <span className="text-cyan-100 text-sm">This Week</span>
                      <span className="font-semibold">{Math.min(activeInterviews.length, 3)} sessions</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-cyan-100 text-sm">Total Practice</span>
                      <span className="font-semibold">{stats.totalInterviews * 30 || 0} min</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNewInterview}
                    className="w-full bg-white text-cyan-600 font-semibold py-2.5 px-4 rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm relative z-20"
                  >
                    <Plus className="w-4 h-4" />
                    New Session
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Daily Insight Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-cyan-200/40 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-100/30 rounded-full -translate-y-8 translate-x-8" />
              
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Daily Insight</h4>
                    <p className="text-slate-600 text-sm leading-relaxed italic">
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