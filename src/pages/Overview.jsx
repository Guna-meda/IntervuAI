import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { BarChart2, Calendar, TrendingUp, Award, FileText, Brain } from 'lucide-react';
import userImg from '../assets/user-img.png'; // Replace with your image path

export default function Overview() {
  const [userName, setUserName] = useState('Guna'); // Placeholder, replace with auth context

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
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' } }),
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 8px 24px rgba(0, 136, 255, 0.3)' },
    tap: { scale: 0.95 },
  };

  return (
  <main className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Welcome back, {userName} ⭐</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }}><Brain className="w-5 h-5 text-gray-500" /></motion.div>
            <motion.div whileHover={{ scale: 1.05 }}><Award className="w-5 h-5 text-gray-500" /></motion.div>
              <motion.div className="flex items-center gap-2 cursor-pointer" whileHover={{ scale: 1.05 }}>
              <img src={userImg} alt="User" className="w-8 h-8 rounded-full" />
              <span className="hidden md:inline text-gray-800 font-semibold">Guna</span>
            </motion.div>
          </div>
        </div>

        {/* Profile Card */}
        <motion.div
          className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          <div className="flex items-center gap-4">
            <img src={userImg} alt="User Profile" className="w-20 h-20 rounded-full border-2 border-white shadow-md" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Guna</h3>
              <p className="text-sm text-gray-600">Technical Lead</p>
              <p className="text-xs text-gray-500">Last login: 01:00 AM, Oct 06, 2025</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Section */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={statsControls}
            custom={0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Practice Statistics</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-full bg-blue-200/50 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-xl font-bold text-blue-500">10</p>
                <p className="text-xs text-gray-600">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-cyan-500">85%</p>
                <p className="text-xs text-gray-600">Avg Score</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-500">2</p>
                <p className="text-xs text-gray-600">Retries</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={statsControls}
            custom={1}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Next Session</h3>
            <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Mock Interview</p>
                <p className="text-xs text-gray-500">2:00 PM, Oct 07, 2025</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metrics Cards */}
        <div ref={metricsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={metricsControls}
            custom={0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">65%</p>
            <p className="text-sm text-gray-600">Progress</p>
          </motion.div>

          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={metricsControls}
            custom={1}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <Award className="w-8 h-8 text-cyan-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">8.5</p>
            <p className="text-sm text-gray-600">Confidence</p>
          </motion.div>

          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={metricsControls}
            custom={2}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <FileText className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">15</p>
            <p className="text-sm text-gray-600">Sessions</p>
          </motion.div>

          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={metricsControls}
            custom={3}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <Brain className="w-8 h-8 text-cyan-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">90%</p>
            <p className="text-sm text-gray-600">Feedback</p>
          </motion.div>
        </div>

        {/* Reminder Card */}
        <motion.div
          className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 shadow-md text-white transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-lg font-bold mb-4">Don't Forget</h3>
          <p className="text-base mb-4">Schedule your next mock interview</p>
          <motion.button
            className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm font-semibold"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Schedule Now
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}