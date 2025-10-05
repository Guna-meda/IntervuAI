import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart2, Brain, TrendingUp, User, Menu, X } from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navItems = [
    { href: '/overview', icon: <BarChart2 className="w-5 h-5" />, label: 'Overview' },
    { href: '/intervuai', icon: <Brain className="w-5 h-5" />, label: 'IntervuAI' },
    { href: '/analytics', icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics' },
    { href: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-blue-100/20 backdrop-blur-md border-r border-blue-200/50 shadow-md p-4 flex flex-col gap-4 z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center gap-2 mb-8">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-cyan-400 rounded-lg blur opacity-75 transition"></div>
          <div className="relative bg-gradient-to-br from-blue-400 to-cyan-500 w-8 h-8 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </motion.div>
        <div className={`overflow-hidden transition-all ${isOpen ? 'w-36' : 'w-0'}`}>
          <div className="text-lg font-bold text-gray-800">IntervuAI</div>
          <div className="text-xs text-gray-500 -mt-0.5">powered by Veda</div>
        </div>
      </div>

      <nav className="flex flex-col gap-4">
        {navItems.map((item, index) => (
          <motion.a
            key={index}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${item.href === window.location.pathname ? 'bg-blue-200/30 text-blue-600 shadow-sm' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-100/30'}`}
            whileHover={{ scale: 1.05 }}
          >
            {item.icon}
            <span className={`overflow-hidden transition-all ${isOpen ? 'w-32' : 'w-0'}`}>{item.label}</span>
          </motion.a>
        ))}
      </nav>

      <button
        className="mt-auto text-gray-800 hover:text-blue-500"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </aside>
  );
}