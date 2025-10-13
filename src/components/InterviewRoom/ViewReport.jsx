// ViewReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { getInterviewDetails } from '../../services/interviewService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Award, Brain, Target, ChevronDown, MessageSquare, Star, 
  Download, ArrowLeft, TrendingUp, Users, Clock, Zap,
  BarChart3, PieChart as PieChartIcon, Activity, Crown,
  CheckCircle, XCircle, AlertCircle, Sparkles, Rocket
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ViewReport() {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRounds, setExpandedRounds] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef();

  const interviewId = location.state?.interviewId;

  useEffect(() => {
    if (!interviewId) {
      navigate('/');
      return;
    }
    const fetchReport = async () => {
      try {
        const response = await getInterviewDetails(interviewId);
        setInterview(response.interview);
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [interviewId, navigate]);

  const toggleRound = (roundNumber) => {
    setExpandedRounds((prev) =>
      prev.includes(roundNumber)
        ? prev.filter((num) => num !== roundNumber)
        : [...prev, roundNumber]
    );
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'from-emerald-500 to-green-500';
    if (score >= 6) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-emerald-50 border-emerald-200';
    if (score >= 6) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  const getOverallScore = () => {
    if (!interview?.rounds) return 0;
    const completedRounds = interview.rounds.filter((r) => r.status === 'completed');
    if (completedRounds.length === 0) return 0;
    const total = completedRounds.reduce((sum, r) => {
      const roundScore =
        r.questions.reduce((qSum, q) => qSum + (q.score || 0), 0) / (r.questions.length || 1);
      return sum + roundScore;
    }, 0);
    return (total / completedRounds.length).toFixed(1);
  };

  const getRoundScore = (round) => {
    if (!round.questions?.length) return 0;
    const avg =
      round.questions.reduce((sum, q) => sum + (q.score || 0), 0) / round.questions.length;
    return avg.toFixed(1);
  };

  // Enhanced analytics data
  const getAnalyticsData = () => {
    if (!interview?.rounds) return {};
    
    const completedRounds = interview.rounds.filter(r => r.status === 'completed');
    const allQuestions = completedRounds.flatMap(r => r.questions || []);
    
    // Skill distribution
    const skillData = [
      { subject: 'Technical', score: allQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / (allQuestions.length || 1) },
      { subject: 'Problem Solving', score: Math.random() * 3 + 7 }, // Mock data
      { subject: 'Communication', score: Math.random() * 3 + 6 }, // Mock data
      { subject: 'Confidence', score: Math.random() * 3 + 7.5 }, // Mock data
      { subject: 'Clarity', score: Math.random() * 3 + 6.8 }, // Mock data
    ];

    // Time progression
    const timeData = completedRounds.map((round, index) => ({
      name: `Round ${index + 1}`,
      score: getRoundScore(round),
      questions: round.questions?.length || 0
    }));

    // Question type distribution
    const questionTypes = [
      { name: 'Technical', value: allQuestions.filter(q => !q.questionType || q.questionType === 'prepared').length },
      { name: 'Follow-up', value: allQuestions.filter(q => q.questionType === 'followup').length },
      { name: 'Behavioral', value: Math.floor(allQuestions.length * 0.2) } // Mock data
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    return { skillData, timeData, questionTypes, COLORS, allQuestions };
  };

  const { skillData, timeData, questionTypes, COLORS, allQuestions } = getAnalyticsData();

  const isInterviewCompleted = interview?.status === 'completed';

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
          <p className="text-slate-600 font-medium">Generating your detailed report...</p>
        </motion.div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 flex items-center justify-center">
        <p className="text-xl font-medium text-slate-700">No report found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl"></div>
      </div>

      <div ref={reportRef} className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xs p-8 mb-8 border border-cyan-200/40"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-4 h-4 text-white" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Performance Report
                </h1>
                <p className="text-slate-600 mt-2">
                  {interview.role} • {new Date(interview.completedAt || interview.lastActiveAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    <span>AI Interviewer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{interview.rounds.filter(r => r.status === 'completed').length} Rounds</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg text-center min-w-[140px]">
                <p className="text-sm font-medium mb-2">Overall Score</p>
                <p className="text-3xl font-bold">{getOverallScore()}/10</p>
                <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(getOverallScore() / 10) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg text-center min-w-[140px]">
                <p className="text-sm font-medium mb-2">Rounds Completed</p>
                <p className="text-3xl font-bold">
                  {interview.rounds.filter(r => r.status === 'completed').length}/{interview.totalRounds}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  {interview.rounds.map((round, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        round.status === 'completed' ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-2 border border-cyan-200/40 max-w-md"
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', icon: Activity },
            { id: 'details', label: 'Round Details', icon: Target }
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

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Performance Summary */}
              {interview.overallSummary && (
                <motion.section
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-cyan-200/40 shadow-xs"
                >
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <Brain className="w-6 h-6 text-cyan-600" />
                    AI Performance Summary
                  </h2>
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200/60">
                    <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                      {interview.overallSummary}
                    </p>
                  </div>
                </motion.section>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Questions', value: allQuestions.length, icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Average Response', value: `${getOverallScore()}/10`, icon: TrendingUp, color: 'from-emerald-500 to-green-500' },
                  { label: 'Success Rate', value: `${Math.round((getOverallScore() / 10) * 100)}%`, icon: Zap, color: 'from-purple-500 to-pink-500' }
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs text-center"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-slate-600 text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Radar Chart */}
                <motion.div
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-cyan-200/40 shadow-xs"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-600" />
                    Skill Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={skillData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 10]} />
                        <Radar
                          name="Skills"
                          dataKey="score"
                          stroke="#06b6d4"
                          fill="#06b6d4"
                          fillOpacity={0.3}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Progress Over Time */}
                <motion.div
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-cyan-200/40 shadow-xs"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Progress Over Rounds
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Question Type Distribution */}
                <motion.div
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-cyan-200/40 shadow-xs"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-600" />
                    Question Types
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={questionTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {questionTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Performance Metrics */}
                <motion.div
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-cyan-200/40 shadow-xs"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    Performance Insights
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Technical Mastery', score: 8.2, trend: 'up' },
                      { label: 'Communication', score: 7.5, trend: 'up' },
                      { label: 'Problem Solving', score: 8.8, trend: 'up' },
                      { label: 'Response Time', score: 6.9, trend: 'stable' }
                    ].map((metric, idx) => (
                      <div key={metric.label} className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">{metric.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <motion.div
                              className={`h-2 rounded-full bg-gradient-to-r ${getScoreColor(metric.score)}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(metric.score / 10) * 100}%` }}
                              transition={{ delay: idx * 0.1 }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-900 w-8">{metric.score}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {interview.rounds.map((round) => (
                <motion.div
                  key={round.roundNumber}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/70 backdrop-blur-sm rounded-3xl border border-cyan-200/40 shadow-xs overflow-hidden"
                >
                  <div
                    onClick={() => toggleRound(round.roundNumber)}
                    className="flex items-center justify-between p-8 cursor-pointer hover:bg-white/50 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {round.roundNumber}
                        </div>
                        {round.status === 'completed' && (
                          <motion.div
                            className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <CheckCircle className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Round {round.roundNumber}</h3>
                        <div className="flex items-center gap-6 text-slate-600 mt-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>{round.questions?.length || 0} questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            <span className="font-semibold">{getRoundScore(round)}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedRounds.includes(round.roundNumber) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-3 bg-slate-100 rounded-xl"
                    >
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {expandedRounds.includes(round.roundNumber) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="border-t border-cyan-200/40"
                      >
                        <div className="p-8 space-y-6">
                          {/* Round Score Chart */}
                          <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-cyan-200/40">
                            <h4 className="text-lg font-semibold text-slate-900 mb-4">Question Scores</h4>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={round.questions.map((q, i) => ({ name: `Q${i + 1}`, score: q.score || 0 }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                  <XAxis dataKey="name" />
                                  <YAxis domain={[0, 10]} />
                                  <Tooltip />
                                  <Bar 
                                    dataKey="score" 
                                    radius={[6, 6, 0, 0]}
                                    className="fill-cyan-500"
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Questions */}
                          {round.questions.map((q, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`p-6 rounded-2xl border-2 ${getScoreBgColor(q.score)}`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getScoreColor(q.score)} flex items-center justify-center text-white font-bold text-sm`}>
                                    {q.score || 0}
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-slate-900 mb-2">Question {idx + 1}</h4>
                                    <p className="text-slate-700 font-medium">{q.question}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Star className="w-4 h-4" />
                                  <span className="font-bold">{q.score || 0}/10</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 mb-1">Your Answer</p>
                                    <p className="text-slate-700 bg-white/50 rounded-lg p-3 border border-slate-200">
                                      {q.answer || 'No answer provided'}
                                    </p>
                                  </div>
                                  {q.expectedAnswer && (
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900 mb-1">Expected Answer</p>
                                      <p className="text-slate-700 bg-emerald-50/50 rounded-lg p-3 border border-emerald-200">
                                        {q.expectedAnswer}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 mb-1">AI Feedback</p>
                                  <p className="text-slate-700 bg-cyan-50/50 rounded-lg p-3 border border-cyan-200">
                                    {q.feedback || 'No feedback provided'}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 pt-8 border-t border-cyan-200/40"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(isInterviewCompleted ? '/intervuai' : '/interviewPage')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
          >
            <ArrowLeft className="w-5 h-5" />
            {isInterviewCompleted ? 'Back to Interviews' : 'Back to Interview'}
          </motion.button>
          
          
        </motion.div>
      </div>
    </div>
  );
}