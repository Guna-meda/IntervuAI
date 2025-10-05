import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { User, Lock, Mail, Edit } from 'lucide-react';
import userImg from '../assets/user-img.png'; // Replace with your image path

export default function Profile() {
  const [userName, setUserName] = useState('Guna');

  const detailsRef = useRef(null);
  const settingsRef = useRef(null);
  const detailsInView = useInView(detailsRef, { once: true, margin: '-100px' });
  const settingsInView = useInView(settingsRef, { once: true, margin: '-100px' });
  const detailsControls = useAnimation();
  const settingsControls = useAnimation();

  useEffect(() => {
    if (detailsInView) detailsControls.start('visible');
    if (settingsInView) settingsControls.start('visible');
  }, [detailsInView, settingsInView, detailsControls, settingsControls]);

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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Profile</h1>
          </div>
        </div>

        <div ref={detailsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={detailsControls}
            custom={0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <div className="flex items-center gap-4">
              <img src={userImg} alt="User Profile" className="w-20 h-20 rounded-full border-2 border-white shadow-md" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">Guna</h3>
                <p className="text-sm text-gray-600">Technical Lead</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={detailsControls}
            custom={1}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <Mail className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Email</h3>
            <p className="text-sm text-gray-600">guna@example.com</p>
          </motion.div>
        </div>

        <div ref={settingsRef} className="grid grid-cols-1 gap-4">
          <motion.div
            className="group relative bg-blue-100/20 backdrop-blur-md rounded-xl p-6 shadow-md border border-blue-200/50 transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate={settingsControls}
            custom={0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <Lock className="w-6 h-6 text-cyan-500 mb-2" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Change Password</h3>
            <motion.button
              className="px-4 py-2 bg-cyan-500/20 rounded-lg text-cyan-600 text-sm font-semibold"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Edit className="w-4 h-4 inline mr-1" /> Update
            </motion.button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}