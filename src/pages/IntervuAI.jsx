import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Video, Zap, Calendar, Play } from 'lucide-react';

export default function IntervuAI() {
  const [userName, setUserName] = useState('Guna');

  const sessionsRef = useRef(null);
  const feedbackRef = useRef(null);
  const sessionsInView = useInView(sessionsRef, { once: true, margin: '-100px' });
  const feedbackInView = useInView(feedbackRef, { once: true, margin: '-100px' });
  const sessionsControls = useAnimation();
  const feedbackControls = useAnimation();

  useEffect(() => {
    if (sessionsInView) sessionsControls.start('visible');
    if (feedbackInView) feedbackControls.start('visible');
  }, [sessionsInView, feedbackInView, sessionsControls, feedbackControls]);

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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Welcome back, {userName} ⭐</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">IntervuAI</h1>
          </div>
        </div>

        <div ref={sessionsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={sessionsControls}
            custom={0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <Video className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Schedule Session</h3>
            <p className="text-sm text-gray-600 mb-4">Book your next AI interview.</p>
            <motion.button
              className="px-4 py-2 bg-blue-500/20 rounded-lg text-blue-600 text-sm font-semibold"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Calendar className="w-4 h-4 inline mr-1" /> Schedule
            </motion.button>
          </motion.div>

          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={sessionsControls}
            custom={1}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <Play className="w-8 h-8 text-cyan-500 mb-2" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Start Practice</h3>
            <p className="text-sm text-gray-600 mb-4">Begin your AI mock interview now.</p>
            <motion.button
              className="px-4 py-2 bg-cyan-500/20 rounded-lg text-cyan-600 text-sm font-semibold"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Start Now
            </motion.button>
          </motion.div>
        </div>

        <div ref={feedbackRef} className="grid grid-cols-1 gap-4">
          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={feedbackControls}
            custom={0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <Zap className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Recent Feedback</h3>
            <p className="text-sm text-gray-600">Your last session: 87% - Great confidence!</p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}