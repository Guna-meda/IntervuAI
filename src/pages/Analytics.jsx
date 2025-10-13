import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  BarChart2, TrendingUp, LineChart, Target, Award, Clock, 
  Zap, Users, Brain, Star, ChevronRight, Calendar,
  PieChart, Activity, Target as TargetIcon, Crown,
  Sparkles, Rocket, BarChart3, ArrowUp, ArrowDown
} from 'lucide-react';

import { getAnalytics, getPerformanceTrends, getSkillAnalysis } from '../services/interviewService';
import { useUserStore } from '../store/userStore';
import {
  SafeBarChart, SafeLineChart, SafeAreaChart, SafePieChart, SafeRadarChart,
  Bar, XAxis, YAxis, Line, Area, Pie, Cell, Radar
} from '../components/analytics/ChartWrapper';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [skillData, setSkillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useUserStore();

  const statsRef = useRef(null);
  const chartsRef = useRef(null);
  const trendsRef = useRef(null);
  
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });
  const chartsInView = useInView(chartsRef, { once: true, margin: '-100px' });
  const trendsInView = useInView(trendsRef, { once: true, margin: '-100px' });
  
  const statsControls = useAnimation();
  const chartsControls = useAnimation();
  const trendsControls = useAnimation();

  useEffect(() => {
    if (statsInView) statsControls.start('visible');
    if (chartsInView) chartsControls.start('visible');
    if (trendsInView) trendsControls.start('visible');
  }, [statsInView, chartsInView, trendsInView, statsControls, chartsControls, trendsControls]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analytics, trends, skills] = await Promise.all([
        getAnalytics(),
        getPerformanceTrends(),
        getSkillAnalysis()
      ]);
      
      setAnalyticsData(analytics);
      setTrendsData(trends);
      setSkillData(skills);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
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
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
          <p className="text-slate-600 font-medium">Loading your analytics...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 relative overflow-hidden">
      {/* Background Elements */}
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
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.header
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-2 border border-cyan-200/50 shadow-xs mb-4"
          >
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-cyan-700 text-sm font-medium">Real-time Analytics Dashboard</span>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4"
          >
            Performance Analytics
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-slate-600 text-lg max-w-2xl"
          >
            Track your interview performance, identify strengths, and discover areas for improvement with detailed insights.
          </motion.p>
        </motion.header>

        {/* Navigation Tabs */}
        <motion.div
          variants={itemVariants}
          className="flex gap-2 mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-2 border border-cyan-200/40 max-w-md"
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'skills', label: 'Skills', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all flex-1 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Stats Overview */}
            <motion.section
              ref={statsRef}
              variants={containerVariants}
              initial="hidden"
              animate={statsControls}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { 
                  icon: Award, 
                  label: 'Average Score', 
                  value: `${analyticsData?.overview?.averageScore || '0'}/10`, 
                  change: '+12%', 
                  color: 'from-cyan-500 to-blue-500' 
                },
                { 
                  icon: Clock, 
                  label: 'Practice Time', 
                  value: `${analyticsData?.overview?.totalPracticeTime || '0'}m`, 
                  change: '+28%', 
                  color: 'from-emerald-500 to-green-500' 
                },
                { 
                  icon: Target, 
                  label: 'Sessions', 
                  value: analyticsData?.overview?.totalSessions || '0', 
                  change: '+15%', 
                  color: 'from-amber-500 to-orange-500' 
                },
                { 
                  icon: Zap, 
                  label: 'Improvement', 
                  value: `${analyticsData?.overview?.improvementRate || '0'}%`, 
                  change: '+8%', 
                  color: 'from-purple-500 to-pink-500' 
                }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  custom={idx}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs relative overflow-hidden group cursor-pointer"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                        <ArrowUp className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 text-xs font-semibold">{stat.change}</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-1 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    
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

            {/* Charts Grid */}
            <motion.section
              ref={chartsRef}
              variants={containerVariants}
              initial="hidden"
              animate={chartsControls}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Weekly Progress */}
              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                    Weekly Progress
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Trending Up</span>
                  </div>
                </div>
                <div className="h-64">
                 <SafeAreaChart data={analyticsData?.weeklyProgress || []}>
  <XAxis dataKey="week" />
  <YAxis domain={[0, 10]} />
  <Area
    type="monotone"
    dataKey="score"
    stroke="#06b6d4"
    fill="#06b6d4"
    fillOpacity={0.3}
  />
</SafeAreaChart>
                </div>
              </motion.div>

              {/* Skill Distribution */}
              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Skill Distribution
                  </h3>
                  <div className="text-sm text-slate-500">This Month</div>
                </div>
                <div className="h-64">
                  <SafeBarChart data={analyticsData?.skillBreakdown || []}>
  <XAxis dataKey="skill" />
  <YAxis domain={[0, 10]} />
  <Bar 
    dataKey="score" 
    radius={[6, 6, 0, 0]}
    className="fill-cyan-500"
  />
</SafeBarChart>
                </div>
              </motion.div>
            </motion.section>

            {/* Performance Trends */}
            <motion.section
              ref={trendsRef}
              variants={containerVariants}
              initial="hidden"
              animate={trendsControls}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {[
                { 
                  label: 'Technical Skills', 
                  value: analyticsData?.performanceTrends?.technical || 0, 
                  target: 9.0,
                  color: 'from-cyan-500 to-blue-500'
                },
                { 
                  label: 'Communication', 
                  value: analyticsData?.performanceTrends?.communication || 0, 
                  target: 8.5,
                  color: 'from-emerald-500 to-green-500'
                },
                { 
                  label: 'Problem Solving', 
                  value: analyticsData?.performanceTrends?.problemSolving || 0, 
                  target: 9.2,
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((metric, idx) => (
                <motion.div
                  key={metric.label}
                  variants={itemVariants}
                  custom={idx}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
                >
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">{metric.label}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900">{metric.value}/10</span>
                      <span className="text-sm text-slate-500">Target: {metric.target}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(metric.value / 10) * 100}%` }}
                        transition={{ delay: idx * 0.1 }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Current</span>
                      <span>Goal</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.section>
          </motion.div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Daily Performance */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-cyan-600" />
                Daily Performance Trends
              </h3>
              <div className="h-80">
                <SafeLineChart data={trendsData?.dailyScores || []}>
  <XAxis dataKey="day" />
  <YAxis domain={[0, 10]} />
  <Line
    type="monotone"
    dataKey="score"
    stroke="#06b6d4"
    strokeWidth={3}
    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
    activeDot={{ r: 6, fill: '#06b6d4' }}
  />
</SafeLineChart>
              </div>
            </motion.section>

            {/* Monthly Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Monthly Progress</h3>
                <div className="h-64">
                  <SafeBarChart data={trendsData?.monthlyProgress || []}>
  <XAxis dataKey="month" />
  <YAxis yAxisId="left" domain={[0, 10]} />
  <YAxis yAxisId="right" orientation="right" domain={[0, 25]} />
  <Bar yAxisId="left" dataKey="score" fill="#06b6d4" radius={[6, 6, 0, 0]} />
  <Line yAxisId="right" type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} />
</SafeBarChart>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Progress Insights</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Consistent Improvement', value: '15%', trend: 'up', color: 'text-emerald-600' },
                    { label: 'Practice Frequency', value: '4.2/week', trend: 'up', color: 'text-cyan-600' },
                    { label: 'Score Stability', value: '92%', trend: 'stable', color: 'text-amber-600' },
                    { label: 'Goal Progress', value: '78%', trend: 'up', color: 'text-purple-600' }
                  ].map((insight, idx) => (
                    <div key={insight.label} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                      <span className="text-slate-700 font-medium">{insight.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${insight.color}`}>{insight.value}</span>
                        {insight.trend === 'up' && <ArrowUp className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Radar Chart */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <TargetIcon className="w-6 h-6 text-cyan-600" />
                Skill Radar Analysis
              </h3>
              <div className="h-96">
                <SafeRadarChart data={skillData?.radarData || []}>
  <Radar
    name="Your Skills"
    dataKey="score"
    stroke="#06b6d4"
    fill="#06b6d4"
    fillOpacity={0.3}
  />
</SafeRadarChart>
              </div>
            </motion.section>

            {/* Skill Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Skill Comparison</h3>
                <div className="h-64">
                  <SafeBarChart data={[
  { skill: 'Technical', you: 85, average: 72 },
  { skill: 'Communication', you: 78, average: 75 },
  { skill: 'Problem Solving', you: 92, average: 68 },
  { skill: 'System Design', you: 88, average: 70 }
]}>
  <XAxis dataKey="skill" />
  <YAxis domain={[0, 100]} />
  <Bar dataKey="you" fill="#06b6d4" radius={[6, 6, 0, 0]} />
  <Bar dataKey="average" fill="#94a3b8" radius={[6, 6, 0, 0]} />
</SafeBarChart>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Skill Recommendations</h3>
                <div className="space-y-4">
                  {[
                    { skill: 'System Design', priority: 'High', action: 'Practice architecture patterns' },
                    { skill: 'Communication', priority: 'Medium', action: 'Focus on clarity in responses' },
                    { skill: 'Debugging', priority: 'Medium', action: 'Work on problem-solving approach' }
                  ].map((rec, idx) => (
                    <motion.div
                      key={rec.skill}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200/40"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">{rec.skill}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'High' 
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {rec.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{rec.action}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}