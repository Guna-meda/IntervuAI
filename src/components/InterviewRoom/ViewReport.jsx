// New ViewReport.jsx (place in the same directory or appropriate folder)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { getInterviewDetails } from '../../services/interviewService';
import { BarChart3, CheckCircle, ChevronDown, Star, Award, Brain, Target } from 'lucide-react';

export default function ViewReport() {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRounds, setExpandedRounds] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const interviewId = location.state?.interviewId;

  useEffect(() => {
    if (!interviewId) {
      navigate('/'); // Redirect if no ID
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
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getOverallScore = () => {
    if (!interview?.rounds) return 0;
    const completedRounds = interview.rounds.filter((r) => r.status === 'completed');
    if (completedRounds.length === 0) return 0;
    const total = completedRounds.reduce((sum, r) => {
      const roundScore = r.questions.reduce((qSum, q) => qSum + (q.score || 0), 0) / r.questions.length;
      return sum + roundScore;
    }, 0);
    return (total / completedRounds.length).toFixed(1);
  };

  const getRoundScore = (round) => {
    if (!round.questions?.length) return 0;
    const avg = round.questions.reduce((sum, q) => sum + (q.score || 0), 0) / round.questions.length;
    return avg.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">No report found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8 border border-gray-100/50"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-md opacity-50" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-xl">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Interview Report</h1>
                <p className="text-sm text-gray-500 mt-1">{interview.role} • Completed on {new Date(interview.completedAt || interview.lastActiveAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 rounded-xl border border-green-100 shadow-inner">
              <div className="text-center">
                <p className="text-sm text-green-700 font-medium">Overall Score</p>
                <p className="text-3xl font-bold text-green-800">{getOverallScore()}/10</p>
              </div>
              <div className="w-px h-10 bg-green-100" />
              <div className="text-center">
                <p className="text-sm text-green-700 font-medium">Rounds Completed</p>
                <p className="text-3xl font-bold text-green-800">{interview.rounds.filter(r => r.status === 'completed').length}/{interview.totalRounds}</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Overall Summary */}
        {interview.overallSummary && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-8 border border-gray-100/50"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Overall Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{interview.overallSummary}</p>
          </motion.section>
        )}

        {/* Rounds */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Round Breakdown
          </h2>
          {interview.rounds.map((round) => (
            <motion.div
              key={round.roundNumber}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-gray-100/50"
            >
              <div
                onClick={() => toggleRound(round.roundNumber)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">{round.roundNumber}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Round {round.roundNumber}</h3>
                    <p className="text-xs text-gray-500">{round.questions.length} questions • Score: {getRoundScore(round)}/10</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedRounds.includes(round.roundNumber) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedRounds.includes(round.roundNumber) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="border-t border-gray-100/50"
                  >
                    <div className="p-5 space-y-4">
                      {round.questions.map((q, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`p-4 rounded-xl border ${getScoreColor(q.score)} shadow-sm`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-indigo-600" />
                              Question {idx + 1}
                            </h4>
                            <div className={`flex items-center gap-1 font-bold ${getScoreColor(q.score).split(' ')[0]}`}>
                              <Star className="w-4 h-4" />
                              {q.score}/10
                            </div>
                          </div>
                          <p className="text-sm text-gray-800 mb-3 font-medium">{q.question}</p>
                          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
                            <p className="text-xs text-gray-700 leading-relaxed">{q.answer}</p>
                          </div>
                          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-lg border border-yellow-200">
                            <p className="text-xs text-yellow-800 font-medium leading-relaxed">{q.feedback}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.section>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/interviewPage')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
          >
            Back to Interview
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}