import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { 
  BarChart2, TrendingUp, LineChart, Target, Clock, Zap, 
  Users, Brain, Star, AlertTriangle 
} from 'lucide-react';
import { getAnalytics, getPerformanceTrends, getSkillAnalysis } from '../services/interviewService';
import { useUserStore } from '../store/userStore';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [skillData, setSkillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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
      setError(null);
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
      setError('Failed to load analytics data. Please try again later or check your internet connection.');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-white/70 rounded-2xl border border-cyan-200/40 shadow-md"
        >
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-slate-700 font-medium">{error}</p>
          <button
            onClick={loadAnalyticsData}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
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
            className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4"
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

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-cyan-600 text-white' : 'bg-white/70 text-cyan-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'trends' ? 'bg-cyan-600 text-white' : 'bg-white/70 text-cyan-700'}`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'skills' ? 'bg-cyan-600 text-white' : 'bg-white/70 text-cyan-700'}`}
          >
            Skills
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            ref={statsRef}
            className="space-y-8"
          >
            {analyticsData?.overview ? (
              <>
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart2 className="w-5 h-5 text-cyan-600" />
                      <h3 className="text-lg font-semibold text-slate-900">Total Sessions</h3>
                    </div>
                    <p className="text-2xl font-bold text-cyan-700">{analyticsData.overview.totalSessions}</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-cyan-600" />
                      <h3 className="text-lg font-semibold text-slate-900">Avg Score</h3>
                    </div>
                    <p className="text-2xl font-bold text-cyan-700">{analyticsData.overview.averageScore}</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-cyan-600" />
                      <h3 className="text-lg font-semibold text-slate-900">Total Practice Time</h3>
                    </div>
                    <p className="text-2xl font-bold text-cyan-700">{analyticsData.overview.totalPracticeTime} mins</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-cyan-600" />
                      <h3 className="text-lg font-semibold text-slate-900">Current Streak</h3>
                    </div>
                    <p className="text-2xl font-bold text-cyan-700">{analyticsData.overview.currentStreak} days</p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Activity</h3>
                  {analyticsData.recentActivity.length > 0 ? (
                    <ul className="space-y-4">
                      {analyticsData.recentActivity.map((activity, index) => (
                        <li key={index} className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/40">
                          <p>Date: {new Date(activity.date).toLocaleDateString()}</p>
                          <p>Role: {activity.role}</p>
                          <p>Score: {activity.score}</p>
                          <p>Status: {activity.status}</p>
                          <p>Duration: {activity.duration} mins</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-600">No recent activity available.</p>
                  )}
                </motion.div>
              </>
            ) : (
              <motion.div variants={itemVariants} className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs">
                <p className="text-slate-600">No analytics data available yet. Start an interview to see your performance overview!</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            ref={trendsRef}
            className="space-y-8"
          >
            {trendsData ? (
              <>
                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                    Daily Performance Trends
                  </h3>
                  {/* Assuming trendsData contains weeklyProgress or similar data */}
                  {trendsData.weeklyProgress && trendsData.weeklyProgress.length > 0 ? (
                    <div className="h-64">
                      {/* Placeholder for chart - replace with real data when available */}
                      <div className="text-slate-600">Chart will display when data is available. Contact support if issue persists.</div>
                    </div>
                  ) : (
                    <p className="text-slate-600">No performance trends data available yet. Conduct more interviews to see trends!</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Progress Insights</h3>
                  {trendsData.performanceTrends ? (
                    <div className="space-y-4">
                      {Object.entries(trendsData.performanceTrends).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                          <span className="text-slate-700 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-bold text-cyan-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600">No progress insights available yet.</p>
                  )}
                </motion.div>
              </>
            ) : (
              <motion.div variants={itemVariants} className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs">
                <p className="text-slate-600">No trends data available yet. Start an interview to see your performance trends!</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            ref={chartsRef}
            className="space-y-8"
          >
            {skillData?.skillBreakdown && skillData.skillBreakdown.length > 0 ? (
              <>
                <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-600" />
                    Skill Radar Analysis
                  </h3>
                  <div className="h-96">
                    {/* Placeholder for radar chart - replace with real data when available */}
                    <div className="text-slate-600">Radar chart will display when data is available. Contact support if issue persists.</div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Skill Comparison</h3>
                    <div className="h-64">
                      {/* Placeholder for bar chart - replace with real data when available */}
                      <div className="text-slate-600">Bar chart will display when data is available. Contact support if issue persists.</div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Skill Recommendations</h3>
                    {skillData.recommendations && skillData.recommendations.length > 0 ? (
                      <div className="space-y-4">
                        {skillData.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/40">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-slate-900">{rec.skill}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                rec.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {rec.priority} Priority
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">{rec.action}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600">No skill recommendations available yet.</p>
                    )}
                  </motion.div>
                </div>
              </>
            ) : (
              <motion.div variants={itemVariants} className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs">
                <p className="text-slate-600">No skill data available yet. Complete an interview to see your skill analysis!</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}