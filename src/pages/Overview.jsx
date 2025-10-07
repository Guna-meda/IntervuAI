import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  Calendar, TrendingUp, Award, Activity, Clock, ChevronRight, Zap, ChevronLeft, Target, Users, BarChart3, Star
} from 'lucide-react';

export default function Overview() {
  const [userName] = useState('Guna');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } 
    }),
  };

  const stats = [
    { label: 'Total Sessions', value: '242', change: '+12%', color: 'from-purple-500 to-purple-600', icon: Target },
    { label: 'Average Score', value: '87.5%', change: '+5.2%', color: 'from-blue-500 to-blue-600', icon: TrendingUp },
    { label: 'Success Rate', value: '94.8%', change: '+8.3%', color: 'from-green-500 to-green-600', icon: Award },
    { label: 'Active Streak', value: '28 days', change: '+7 days', color: 'from-orange-500 to-orange-600', icon: Users },
  ];

  const upcomingSessions = [
    { title: 'Technical Interview', time: '2:00 PM', date: 'Today', type: 'Coding', color: 'blue' },
    { title: 'Behavioral Round', time: '4:30 PM', date: 'Tomorrow', type: 'HR', color: 'purple' },
    { title: 'System Design', time: '10:00 AM', date: 'Oct 10', type: 'Technical', color: 'cyan' },
  ];

  const recentActivity = [
    { action: 'Completed Mock Interview', score: '92%', time: '2 hours ago' },
    { action: 'Practice Session - DSA', score: '88%', time: '5 hours ago' },
    { action: 'Behavioral Questions', score: '95%', time: '1 day ago' },
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
    <main className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-600">Welcome back, {userName} ⭐</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Interview Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              initial="hidden"
              animate={statsControls}
              custom={idx}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100 relative overflow-hidden group cursor-pointer"
              whileHover={{ 
                y: -4, 
                scale: 1.02,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-green-600 text-xs font-semibold bg-green-50 px-1.5 py-0.5 rounded-full">{stat.change}</span>
                </div>
                <p className="text-gray-600 text-xs mb-1 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column: Upcoming Sessions & Recent Activity */}
          <div className="xl:col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800">Upcoming Sessions</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </motion.button>
              </div>
              <div className="space-y-3">
                {upcomingSessions.map((session, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-${session.color}-50 hover:to-white border border-gray-100 hover:border-${session.color}-200 transition-all cursor-pointer group`}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${session.color}-500 to-${session.color}-600 flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                        {session.date === 'Today' ? 'NOW' : session.date.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{session.title}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {session.time} • {session.date}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 group-hover:text-${session.color}-500 group-hover:translate-x-0.5 transition-all`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <h2 className="text-base font-bold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all cursor-pointer group"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full group-hover:bg-green-100 transition-colors">
                        {activity.score}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Calendar & Performance */}
          <div className="xl:col-span-2 space-y-6">
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100 max-w-xs aspect-square"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(-1)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => changeMonth(1)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
              </div>

              {/* Compact Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-xs mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-8"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const today = isToday(day);
                  const selected = isSelected(day);
                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all relative ${
                        today
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm'
                          : selected
                          ? 'bg-blue-100 text-blue-600 border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day}
                      {today && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Selected Date Info */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
              >
                <p className="text-xs text-gray-600 mb-0.5">Selected Date</p>
                <p className="font-semibold text-gray-800 text-xs">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </motion.div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              ref={metricsRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-center gap-1 mb-4">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <h2 className="text-base font-bold text-gray-800">Performance Metrics</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">Progress Tracking</span>
                    <span className="font-bold text-gray-800">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">Confidence Level</span>
                    <span className="font-bold text-gray-800">8.5/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ delay: 0.7, duration: 1 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">Feedback Score</span>
                    <span className="font-bold text-gray-800">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '90%' }}
                      transition={{ delay: 0.9, duration: 1 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 shadow-lg relative overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white opacity-5 rounded-full -ml-18 -mb-18 group-hover:scale-150 transition-transform duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Ready for your next challenge?</h3>
            </div>
            <p className="text-blue-100 text-sm mb-4 max-w-xl">
              Schedule a mock interview with our AI system and get personalized feedback
            </p>
            <div className="flex gap-3">
              <motion.button
                className="px-6 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm flex items-center gap-1"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 10px 20px rgba(255,255,255,0.3)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="w-4 h-4" />
                Schedule Now
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-transparent border border-white text-white rounded-lg font-bold text-sm"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}