// ViewReport.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { getInterviewDetails } from '../../services/interviewService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Award, Brain, Target, ChevronDown, MessageSquare, Star } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ViewReport() {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRounds, setExpandedRounds] = useState([]);
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
    if (score >= 8) return 'text-green-600 bg-green-100/50 border-green-200';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100/50 border-yellow-200';
    return 'text-red-600 bg-red-100/50 border-red-200';
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

  const getProgressWidth = (score) => Math.min((score / 10) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <p className="text-xl font-medium text-gray-700">No report found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div ref={reportRef} className="max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Interview Report</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {interview.role} • {new Date(interview.completedAt || interview.lastActiveAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 rounded-xl border border-emerald-200">
              <div className="text-center">
                <p className="text-sm text-emerald-800 font-medium">Overall Score</p>
                <p className="text-2xl font-bold text-emerald-900">{getOverallScore()}/10</p>
                <div className="mt-2 w-24 h-2 bg-gray-200 rounded-full">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    animate={{ width: `${getProgressWidth(getOverallScore())}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <div className="w-px h-8 bg-emerald-200" />
              <div className="text-center">
                <p className="text-sm text-emerald-800 font-medium">Rounds Completed</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {interview.rounds.filter(r => r.status === 'completed').length}/{interview.totalRounds}
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {interview.overallSummary && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" /> Overall Performance Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {interview.overallSummary}
            </p>
          </motion.section>
        )}

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" /> Round Breakdown
          </h2>

          {interview.rounds.map((round) => (
            <motion.div
              key={round.roundNumber}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div
                onClick={() => toggleRound(round.roundNumber)}
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg shadow">
                    {round.roundNumber}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Round {round.roundNumber}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <p>{round.questions?.length || 0} questions</p>
                      <p>Score: {getRoundScore(round)}/10</p>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedRounds.includes(round.roundNumber) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedRounds.includes(round.roundNumber) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-6">
                      <div className="w-full h-56 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                        <ResponsiveContainer width="95%" height="100%">
                          <BarChart data={round.questions.map((q, i) => ({ name: `Q${i + 1}`, score: q.score || 0 }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {round.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className={`p-5 rounded-xl border ${getScoreColor(q.score)} bg-white shadow-sm`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-indigo-600" />
                              Question {idx + 1}
                            </h4>
                            <div className={`flex items-center gap-2 font-semibold ${getScoreColor(q.score).split(' ')[0]}`}>
                              <Star className="w-5 h-5" /> {q.score || 0}/10
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2"><strong>Question:</strong> {q.question}</p>
                          <p className="text-sm text-gray-700 mb-2"><strong>Your Answer:</strong> {q.answer || 'No answer provided'}</p>
                          <p className="text-sm text-gray-700 mb-2"><strong>Expected Answer:</strong> {q.expectedAnswer || 'Not available'}</p>
                          <p className="text-sm text-gray-700"><strong>Feedback:</strong> {q.feedback || 'No feedback provided'}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </section>

        <div className="mt-10 text-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/interviewPage')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition text-sm"
          >
            Back to Interview
          </motion.button>
        </div>
      </div>
    </div>
  );
}