// Overview.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { 
  Calendar, TrendingUp, Award, Activity, Clock, ChevronRight, Zap, 
  ChevronLeft, Target, Users, BarChart3, Star, Play, Brain, Rocket,
  MessageCircle, FileText, Sparkles, Cpu, Cloud, ArrowUp, ArrowDown,
  Video, Mic, Settings, Bell, Crown, Target as TargetIcon
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { getUserInterviews, getInterviewStats } from '../services/interviewService';

export default function Overview() {
  const { user, userStats, fetchUserData, fetchUserStats } = useUserStore();
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  const statsRef = useRef(null);
  const metricsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });
  const metricsInView = useInView(metricsRef, { once: true, margin: '-100px' });
  const statsControls = useAnimation();
  const metricsControls = useAnimation();

  useEffect(() => {
    if (statsInView) statsControls.start('visible');
    if (metricsInView) metricsControls.start('visible');
  }, [statsInView, metricsInView, statsControls, metricsControls]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchUserStats(),
        loadInterviews(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInterviews = async () => {
    try {
      const response = await getUserInterviews({ 
        sortBy: 'lastActiveAt', 
        order: 'desc',
        limit: 5 
      });
      setInterviews(response.interviews || []);
    } catch (error) {
      console.error('Error loading interviews:', error);
      setInterviews([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getInterviewStats();
      setStats(response || {});
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({});
    }
  };

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

  // Enhanced stats with real data
  const dashboardStats = [
    { 
      label: 'Total Sessions', 
      value: stats.totalInterviews || '0', 
      change: '+12%', 
      color: 'from-purple-500 to-purple-600', 
      icon: Target,
      trend: 'up'
    },
    { 
      label: 'Average Score', 
      value: `${stats.averageScore || '0'}/10`, 
      change: '+5.2%', 
      color: 'from-cyan-500 to-blue-600', 
      icon: TrendingUp,
      trend: 'up'
    },
    { 
      label: 'Success Rate', 
      value: `${stats.completionRate || '0'}%`, 
      change: '+8.3%', 
      color: 'from-emerald-500 to-green-600', 
      icon: Award,
      trend: 'up'
    },
    { 
      label: 'Active Streak', 
      value: `${stats.currentStreak || '0'} days`, 
      change: '+7 days', 
      color: 'from-amber-500 to-orange-600', 
      icon: Users,
      trend: 'up'
    },
  ];

  const performanceMetrics = [
    { label: 'Technical Skills', value: stats.technicalScore || 75, color: 'from-cyan-500 to-blue-500' },
    { label: 'Communication', value: stats.communicationScore || 82, color: 'from-emerald-500 to-green-500' },
    { label: 'Problem Solving', value: stats.problemSolvingScore || 78, color: 'from-purple-500 to-pink-500' },
    { label: 'Confidence Level', value: stats.confidenceScore || 85, color: 'from-amber-500 to-orange-500' },
  ];

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

  const getUpcomingSessions = () => {
    return interviews.slice(0, 3).map(interview => ({
      title: interview.role,
      time: new Date(interview.scheduledAt || interview.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(interview.scheduledAt || interview.lastActiveAt).toLocaleDateString(),
      type: interview.type || 'Technical',
      color: 'cyan'
    }));
  };

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
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <motion.header
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-2 border border-cyan-200/50 shadow-xs mb-4"
              >
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                <span className="text-cyan-700 text-sm font-medium">
                  {user?.profile?.role ? `Ready for ${user.profile.role} interviews` : 'AI Interview Coach Active'}
                </span>
              </motion.div>
              
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
              >
                Welcome back, {user?.displayName || 'there'}! 👋
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-slate-600 mt-2 max-w-2xl text-base md:text-lg"
              >
                Your interview performance is trending up! Continue your journey to mastery.
              </motion.p>
            </div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Rocket className="w-5 h-5" />
                <span className="text-sm">New Practice Session</span>
              </div>
            </motion.button>
          </div>
        </motion.header>

        {/* Stats Overview */}
        <motion.section
          ref={statsRef}
          variants={containerVariants}
          initial="hidden"
          animate={statsControls}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {dashboardStats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              custom={idx}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs relative overflow-hidden group cursor-pointer"
              whileHover={{ 
                y: -4, 
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-rose-600" />
                    )}
                    <span className="text-emerald-600 text-xs font-semibold">{stat.change}</span>
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm mb-1 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                
                {/* Progress indicator */}
                <div className="mt-3 w-full bg-slate-200 rounded-full h-1">
                  <motion.div
                    className={`h-1 rounded-full bg-gradient-to-r ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ delay: idx * 0.2 + 0.5, duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column: Upcoming Sessions & Performance */}
          <div className="xl:col-span-3 space-y-6">
            {/* Upcoming Sessions */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-xl">
                    <Calendar className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="font-semibold text-slate-900 text-lg md:text-xl">Upcoming Sessions</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-cyan-600 font-medium text-sm flex items-center gap-1 hover:underline bg-cyan-50 px-3 py-1.5 rounded-lg"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="space-y-4">
                {getUpcomingSessions().map((session, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-50/50 to-blue-50/50 border border-cyan-200/40 hover:border-cyan-300 transition-all cursor-pointer group"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        <Play className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{session.title}</p>
                        <p className="text-slate-600 text-xs flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {session.time} • {session.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                        {session.type}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Performance Metrics */}
            <motion.section
              ref={metricsRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="font-semibold text-slate-900 text-lg md:text-xl">Performance Analytics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {performanceMetrics.map((metric, idx) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/40"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-700 text-sm font-medium">{metric.label}</span>
                      <span className="font-bold text-slate-900">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ delay: idx * 0.2 + 0.5, duration: 1 }}
                        className={`h-2 rounded-full bg-gradient-to-r ${metric.color} shadow-sm`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column: Calendar & Quick Actions */}
          <div className="xl:col-span-1 space-y-6">
            {/* Calendar */}
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
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-slate-500 text-xs font-medium py-2">
                    {day}
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

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">Quick Start</h3>
                    <p className="text-cyan-100 text-sm opacity-90">Jump into practice</p>
                  </div>
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Video, label: 'Mock Interview', color: 'bg-white/20' },
                    { icon: Brain, label: 'Practice Questions', color: 'bg-white/20' },
                    { icon: FileText, label: 'View Reports', color: 'bg-white/20' },
                    { icon: Settings, label: 'Settings', color: 'bg-white/20' }
                  ].map((action, idx) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Achievement */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-cyan-200/40 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-100/30 rounded-full -translate-y-8 translate-x-8" />
              
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Current Level</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      <span className="font-bold text-amber-600">Expert </span>
                      • 92% Progress
                    </p>
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-1">
                      <motion.div
                        className="h-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ delay: 0.8, duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-8 shadow-lg relative overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TargetIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Ready for your next challenge?</h3>
                </div>
                <p className="text-cyan-100 text-lg max-w-2xl">
                  Take your skills to the next level with our AI-powered interview simulator. Get real-time feedback and personalized coaching.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  className="px-8 py-3 bg-white text-cyan-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: '0 10px 20px rgba(255,255,255,0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Rocket className="w-4 h-4" />
                  Start Practice Session
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-transparent border border-white text-white rounded-xl font-bold text-sm"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Analytics
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}