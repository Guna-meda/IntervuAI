import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  Video, Zap, Calendar, Play, Clock, Award, 
  TrendingUp, Star, ChevronRight, Sparkles,
  MessageSquare, Target, Brain, ChevronLeft
} from 'lucide-react';

export default function IntervuAI() {
  const [userName] = useState('Guna');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } 
    }),
  };

  const recentSessions = [
    { 
      title: 'Technical Round', 
      date: '2 days ago', 
      score: 92, 
      duration: '45 min',
      feedback: 'Excellent problem-solving skills',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Behavioral Interview', 
      date: '5 days ago', 
      score: 88, 
      duration: '30 min',
      feedback: 'Great communication clarity',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      title: 'System Design', 
      date: '1 week ago', 
      score: 85, 
      duration: '60 min',
      feedback: 'Strong architectural thinking',
      color: 'from-cyan-500 to-cyan-600'
    },
  ];

  const sessionTypes = [
    {
      icon: Brain,
      title: 'Technical Interview',
      description: 'Data structures, algorithms, and coding challenges',
      color: 'from-blue-500 to-indigo-600',
      gradient: 'from-blue-50 to-indigo-50',
      difficulty: 'Advanced'
    },
    {
      icon: MessageSquare,
      title: 'Behavioral Round',
      description: 'Leadership, teamwork, and situational questions',
      color: 'from-purple-500 to-pink-600',
      gradient: 'from-purple-50 to-pink-50',
      difficulty: 'Intermediate'
    },
    {
      icon: Target,
      title: 'System Design',
      description: 'Architecture, scalability, and design patterns',
      color: 'from-cyan-500 to-teal-600',
      gradient: 'from-cyan-50 to-teal-50',
      difficulty: 'Expert'
    },
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
              <p className="text-xl font-bold text-gray-800">47</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Avg Score</p>
              <p className="text-xl font-bold text-green-600">88.5%</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Total Time</p>
              <p className="text-xl font-bold text-blue-600">32h</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Streak</p>
              <p className="text-xl font-bold text-orange-600">12🔥</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div
              className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 shadow-lg cursor-pointer"
              onMouseEnter={() => setHoveredCard('schedule')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"
                animate={{ opacity: hoveredCard === 'schedule' ? 0.1 : 0 }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: hoveredCard === 'schedule' ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className="w-4 h-4 text-white/80" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Schedule Interview</h3>
                <p className="text-blue-100 text-xs mb-4">Book your next AI-powered mock interview session</p>
                <motion.button
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-xs flex items-center gap-1 group/btn"
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule Now
                  <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div
              className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 shadow-lg cursor-pointer"
              onMouseEnter={() => setHoveredCard('start')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"
                animate={{ opacity: hoveredCard === 'start' ? 0.1 : 0 }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: hoveredCard === 'start' ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: hoveredCard === 'start' ? Infinity : 0 }}
                  >
                    <Zap className="w-4 h-4 text-white/80" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Quick Practice</h3>
                <p className="text-emerald-100 text-xs mb-4">Start an instant practice session right now</p>
                <motion.button
                  className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-semibold text-xs flex items-center gap-1 group/btn"
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Now
                  <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Session Types & Recent Sessions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Types */}
            <motion.div ref={sessionsRef}>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Interview Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sessionTypes.map((type, idx) => (
                  <motion.div
                    key={idx}
                    variants={cardVariants}
                    initial="hidden"
                    animate={sessionsControls}
                    custom={idx}
                    className="bg-white rounded-lg p-4 shadow-md border border-gray-100 relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${type.color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-3`}>
                        <type.icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r ${type.color} text-white mb-2`}>
                        {type.difficulty}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800 mb-1">{type.title}</h3>
                      <p className="text-xs text-gray-600">{type.description}</p>
                      <motion.div
                        className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Select
                        <ChevronRight className="w-3 h-3" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div ref={feedbackRef}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Recent Sessions</h2>
                <button className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                  View All
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recentSessions.map((session, idx) => (
                  <motion.div
                    key={idx}
                    variants={cardVariants}
                    initial="hidden"
                    animate={feedbackControls}
                    custom={idx}
                    className="bg-white rounded-lg p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${session.color} flex items-center justify-center`}>
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-800">{session.score}%</span>
                      </div>
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 mb-1">{session.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration}
                      </span>
                      <span>•</span>
                      <span>{session.date}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Award className="w-3 h-3 text-blue-500" />
                        {session.feedback}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-500 py-1">
                    {day}
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