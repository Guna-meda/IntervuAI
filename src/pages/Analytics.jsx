import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { BarChart2, TrendingUp, LineChart } from 'lucide-react';

export default function Analytics() {
  const [userName, setUserName] = useState('Guna');

  const chartsRef = useRef(null);
  const trendsRef = useRef(null);
  const chartsInView = useInView(chartsRef, { once: true, margin: '-100px' });
  const trendsInView = useInView(trendsRef, { once: true, margin: '-100px' });
  const chartsControls = useAnimation();
  const trendsControls = useAnimation();

  useEffect(() => {
    if (chartsInView) chartsControls.start('visible');
    if (trendsInView) trendsControls.start('visible');
  }, [chartsInView, trendsInView, chartsControls, trendsControls]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' } }),
  };

  return (
  <main className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Welcome back, {userName} ⭐</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Analytics</h1>
          </div>
        </div>

        <div ref={chartsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={chartsControls}
            custom={0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <BarChart2 className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Session Scores</h3>
            <p className="text-sm text-gray-600">View your score history.</p>
          </motion.div>

          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={chartsControls}
            custom={1}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <LineChart className="w-8 h-8 text-cyan-500 mb-2" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Progress Trend</h3>
            <p className="text-sm text-gray-600">Track your improvement over time.</p>
          </motion.div>
        </div>

        <div ref={trendsRef} className="grid grid-cols-1 gap-4">
          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={trendsControls}
            custom={0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Weekly Insights</h3>
            <p className="text-sm text-gray-600">Your performance this week: 82% average.</p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}