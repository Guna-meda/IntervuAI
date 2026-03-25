// ViewReport.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { getInterviewDetails } from "../../services/interviewService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Award,
  Brain,
  Target,
  ChevronDown,
  MessageSquare,
  Star,
  Download,
  ArrowLeft,
  TrendingUp,
  Users,
  Clock,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Crown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Rocket,
  BookOpen,Lightbulb
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function ViewReport() {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRounds, setExpandedRounds] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef();

  const interviewId = location.state?.interviewId;

  useEffect(() => {
    if (!interviewId) {
      navigate("/");
      return;
    }
    const fetchReport = async () => {
      try {
        const response = await getInterviewDetails(interviewId);
        setInterview(response.interview);
      } catch (error) {
        console.error("Error fetching report:", error);
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
    if (score >= 8) return "from-emerald-500 to-green-500";
    if (score >= 6) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-pink-500";
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return "bg-emerald-50 border-emerald-200";
    if (score >= 6) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };

  const getOverallScore = () => {
    if (!interview?.rounds) return 0;
    const completedRounds = interview.rounds.filter(
      (r) => r.status === "completed"
    );
    if (completedRounds.length === 0) return 0;
    const total = completedRounds.reduce((sum, r) => {
      const roundScore =
        r.questions.reduce((qSum, q) => qSum + (q.score || 0), 0) /
        (r.questions.length || 1);
      return sum + roundScore;
    }, 0);
    return (total / completedRounds.length).toFixed(1);
  };

  const getRoundScore = (round) => {
    if (!round.questions?.length) return 0;
    const avg =
      round.questions.reduce((sum, q) => sum + (q.score || 0), 0) /
      round.questions.length;
    return avg.toFixed(1);
  };

  // Enhanced analytics data
  const getAnalyticsData = () => {
    if (!interview?.rounds) return {};

    const completedRounds = interview.rounds.filter(
      (r) => r.status === "completed"
    );
    const allQuestions = completedRounds.flatMap((r) => r.questions || []);

    // Skill distribution
    const skillData = [
      {
        subject: "Technical",
        score:
          allQuestions.reduce((sum, q) => sum + (q.score || 0), 0) /
          (allQuestions.length || 1),
      },
      { subject: "Problem Solving", score: Math.random() * 3 + 7 }, // Mock data
      { subject: "Communication", score: Math.random() * 3 + 6 }, // Mock data
      { subject: "Confidence", score: Math.random() * 3 + 7.5 }, // Mock data
      { subject: "Clarity", score: Math.random() * 3 + 6.8 }, // Mock data
    ];

    // Time progression
    const timeData = completedRounds.map((round, index) => ({
      name: `Round ${index + 1}`,
      score: getRoundScore(round),
      questions: round.questions?.length || 0,
    }));

    // Question type distribution
    const questionTypes = [
      {
        name: "Technical",
        value: allQuestions.filter(
          (q) => !q.questionType || q.questionType === "prepared"
        ).length,
      },
      {
        name: "Follow-up",
        value: allQuestions.filter((q) => q.questionType === "followup").length,
      },
      { name: "Behavioral", value: Math.floor(allQuestions.length * 0.2) }, // Mock data
    ];

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

    return { skillData, timeData, questionTypes, COLORS, allQuestions };
  };

  const { skillData, timeData, questionTypes, COLORS, allQuestions } =
    getAnalyticsData();

  const isInterviewCompleted = interview?.status === "completed";

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
          <p className="text-slate-600 font-medium">
            Generating your detailed report...
          </p>
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

      <div
        ref={reportRef}
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xs p-8 mb-8 border border-cyan-200/40"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
             
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Performance Report
                </h1>
                <p className="text-slate-600 mt-2">
                  {interview.role} •{" "}
                  {new Date(
                    interview.completedAt || interview.lastActiveAt
                  ).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="w-4 h-4" />
                    <span>AI Interviewer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      {
                        interview.rounds.filter((r) => r.status === "completed")
                          .length
                      }{" "}
                      Rounds
                    </span>
                  </div>
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
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "analytics", label: "Analytics", icon: Activity },
            { id: "details", label: "Round Details", icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all flex-1 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Performance Summary */}
              {interview.overallSummary && (
                <motion.section className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-cyan-200/40 shadow-xs">
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
                  {
                    label: "Total Questions",
                    value: allQuestions.length,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    label: "Average Response",
                    value: `${getOverallScore()}/10`,
                    color: "from-emerald-500 to-green-500",
                  },
                  {
                    label: "Success Rate",
                    value: `${Math.round((getOverallScore() / 10) * 100)}%`,
                    color: "from-purple-500 to-pink-500",
                  },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs text-center"
                  >
                   
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-slate-600 text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
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
                <motion.div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-cyan-200/40 shadow-xs">
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
                <motion.div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-cyan-200/40 shadow-xs">
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
              </div>
            </motion.div>
          )}

{activeTab === "details" && (
  <div className="space-y-6">
    
  {interview.rounds.map((round) => (
  <motion.div
    key={round.roundNumber}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
  >
    
    {/* ROUND HEADER */}
    <div
      onClick={() => toggleRound(round.roundNumber)}
      className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/40 transition"
    >
      <div className="flex items-center gap-4">
        
        {/* ROUND NUMBER BADGE */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
          {round.roundNumber}
        </div>

        {/* ROUND INFO */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Round {round.roundNumber}
          </h3>

          <p className="text-sm text-slate-500">
            {round.questions?.length || 0} questions • {getRoundScore(round)}/10
          </p>
        </div>
      </div>

      {/* ARROW */}
      <motion.div
        animate={{
          rotate: expandedRounds.includes(round.roundNumber) ? 180 : 0,
        }}
        className="p-2 bg-white rounded-lg "
      >
        <ChevronDown className="w-4 h-4 text-slate-600" />
      </motion.div>
    </div>

    {/* EXPAND CONTENT */}
    <AnimatePresence>
      {expandedRounds.includes(round.roundNumber) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t"
        >
          <div className="p-6 space-y-6">

            {round.questions.map((q, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-2xl border bg-white/80 shadow-sm hover:shadow-md transition ${getScoreBgColor(q.score)}`}
              >
                {/* HEADER */}
                <div className="flex justify-between mb-3">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getScoreColor(q.score)} text-white flex items-center justify-center font-bold`}>
                      {q.score || 0}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        Question {idx + 1}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-slate-700">
                    ⭐ {q.score || 0}/10
                  </div>
                </div>

                {/* BODY */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold mb-1 text-emerald-700">
                      Expected Answer
                    </p>
                    <div className="bg-emerald-50 p-3 rounded-lg text-sm">
                      {q.expectedAnswer}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-1 text-cyan-700">
                      Feedback
                    </p>
                    <div className="bg-cyan-50 p-3 rounded-lg text-sm">
                      {q.feedback}
                    </div>
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
  </div>
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
            onClick={() =>
              navigate(isInterviewCompleted ? "/intervuai" : "/interviewPage")
            }
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
          >
            <ArrowLeft className="w-5 h-5" />
            {isInterviewCompleted ? "Back to Interviews" : "Back to Interview"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
