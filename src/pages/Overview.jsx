// components/Dashboard/Overview.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Target,
  Users,
  Zap,
  Crown,
  Star,
  Award,
  TrendingUp,
  Clock,
  Share2,
  BookOpen,
  Brain,
  Rocket,
  Sparkles,
  ChevronRight,
  Calendar,
  Mic,
  Video,
  Settings,
} from "lucide-react";
import { useUserStore } from "../store/userStore";
import { useUserInterviewStore } from "../store/interviewStore";

// Color palette - Light blue theme
const COLORS = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
};

const LEVELS = [
  {
    level: 1,
    name: "Beginner",
    interviewsRequired: 0,
    icon: "/Levels/Level1.png",
  },
  {
    level: 2,
    name: "Intermediate",
    interviewsRequired: 5,
    icon: "/Levels/Level2.png",
  },
  {
    level: 3,
    name: "Advanced",
    interviewsRequired: 20,
    icon: "/Levels/Level3.png",
  },
  {
    level: 4,
    name: "Expert",
    interviewsRequired: 50,
    icon: "/Levels/Level4.png",
  },
  {
    level: 5,
    name: "Master",
    interviewsRequired: 75,
    icon: "/Levels/Level5.png",
  },
];

const FEATURES = [
  {
    title: "Flashcard Sessions",
    description: "Master key concepts with interactive flashcards",
    icon: BookOpen,
    status: "New",
  },
  {
    title: "AI Feedback Pro",
    description: "Enhanced feedback with detailed analysis",
    icon: Brain,
    status: "Coming Soon",
  },
  {
    title: "Progress Analytics",
    description: "Deep insights into your improvement",
    icon: TrendingUp,
    status: "New",
  },
];

export default function Overview() {
  const { user, dashboardData, fetchDashboardData, fetchUserData } =
    useUserStore();
  const { availableRoles, startNewInterview } = useUserInterviewStore();
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchUserData(), fetchDashboardData()]);

      // Generate flashcards from recent interviews
      if (dashboardData?.recentInterviews) {
        setFlashcards(generateFlashcards(dashboardData.recentInterviews));
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = (interviews) => {
    // Extract questions from recent interviews to create flashcards
    const cards = [];
    interviews.forEach((interview) => {
      interview.questions?.forEach((q) => {
        if (cards.length < 3) {
          // Limit to 3 cards
          cards.push({
            question: q.question,
            answer:
              q.expectedAnswer ||
              "Review your interview feedback for detailed insights",
            category: interview.role || "General",
            difficulty: q.difficulty || "Medium",
          });
        }
      });
    });

    // Fallback cards if no interview data
    if (cards.length === 0) {
      return [
        {
          question: "What is React's virtual DOM?",
          answer:
            "A lightweight copy of the actual DOM that allows React to optimize updates",
          category: "Frontend",
          difficulty: "Medium",
        },
        {
          question: "Explain dependency injection",
          answer:
            "A technique where one object supplies the dependencies of another object",
          category: "Backend",
          difficulty: "Hard",
        },
      ];
    }

    return cards;
  };

  const handleStartInterview = () => {
    startNewInterview();
    // Navigation logic would go here
  };

  // Derived data from dashboard
  const userLevel = dashboardData?.userLevel?.currentLevel || 1;
  const interviewCount = dashboardData?.userLevel?.completedInterviews || 0;
  const readinessScore = dashboardData?.readinessScore || 0;
  const badges = dashboardData?.badges || [];
  const stats = dashboardData?.stats || {};

  const nextLevel = LEVELS.find((level) => level.level === userLevel + 1);
  const interviewsToNextLevel = nextLevel
    ? Math.max(nextLevel.interviewsRequired - interviewCount, 0)
    : 0;
  const currentLevelData = LEVELS.find((level) => level.level === userLevel);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50/30 to-cyan-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-3 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">
            Preparing your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50/30 to-cyan-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-200/15 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, {user?.displayName || "there"}!
              </motion.h1>
              <motion.p
                className="text-slate-600 mt-2 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {interviewCount > 0
                  ? `You've completed ${interviewCount} interview${
                      interviewCount !== 1 ? "s" : ""
                    }`
                  : "Start your first interview to begin your journey"}
              </motion.p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartInterview}
              className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Rocket className="w-5 h-5" />
                <span>New Interview</span>
              </div>
            </motion.button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Level Progress & Badges */}
          <div className="xl:col-span-2 space-y-8">
            {/* Level Progress */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100/60 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Level Progress
                  </h2>
                  <p className="text-slate-600">
                    Your journey to interview mastery
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Level */}
              {/* Current Level */}
<div className="text-center mb-6">
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.4, duration: 0.5 }}
    className="inline-block relative"
  >
    <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg ring-4 ring-blue-200/50">
      <img 
        src={LEVELS[userLevel - 1].icon} 
        alt={LEVELS[userLevel - 1].name} 
        className="w-16 h-16 mx-auto drop-shadow-xl"
      />
    </div>

    {/* Subtle glow effect */}
    <div className="absolute inset-0 blur-xl bg-blue-400/40 rounded-2xl -z-10 animate-pulse"></div>
  </motion.div>

  <h4 className="font-bold text-xl text-slate-900 mt-4">
    {LEVELS[userLevel - 1].name}
  </h4>
  <p className="text-slate-600 text-sm">
    {interviewCount} interviews completed
  </p>
</div>


                {/* Progress to Next Level */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-700 font-medium">
                        Progress to Level {userLevel + 1}
                      </span>
                      <span className="text-blue-600 font-bold">
                        {interviewCount}/
                        {nextLevel?.interviewsRequired || "Max"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <motion.div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (interviewCount /
                              (nextLevel?.interviewsRequired || 1)) *
                            100
                          }%`,
                        }}
                        transition={{ delay: 0.6, duration: 1 }}
                      />
                    </div>
                  </div>

                  {nextLevel && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="bg-blue-50 rounded-2xl p-4 border border-blue-200"
                    >
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-blue-800 font-medium">
                            {interviewsToNextLevel} interview
                            {interviewsToNextLevel !== 1 ? "s" : ""} to reach{" "}
                            {nextLevel.name}
                          </p>
                          <p className="text-blue-600 text-sm">
                            Keep practicing!
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-5 gap-2">
                    {LEVELS.map((level) => (
                      <div
                        key={level.level}
                        className={`text-center p-2 rounded-xl transition-all ${
                          userLevel >= level.level
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <img
                          src={level.icon}
                          alt={`Level ${level.level} - ${level.name}`}
                          className="w-8 h-8 mx-auto mb-1"
                        />
                        <div className="text-xs font-bold">L{level.level}</div>
                        <div className="text-[10px] mt-1">
                          {level.interviewsRequired}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Badges Collection */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100/60 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Your Achievements
                  </h2>
                  <p className="text-slate-600">
                    Earned badges and accomplishments
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {badges.length > 0 ? (
                  badges.slice(0, 5).map((badge, index) => (
                    <motion.div
                      key={badge.badgeId}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-sm"
                    >
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <h3 className="font-semibold text-slate-900 text-sm mb-1">
                        {badge.name}
                      </h3>
                      <p className="text-slate-600 text-xs leading-tight">
                        {badge.description}
                      </p>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2 text-blue-600 text-xs font-bold"
                      >
                        Earned!
                      </motion.div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-5 text-center py-8">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      Complete interviews to earn badges
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          </div>

          {/* Right Column - Metrics & Features */}
          <div className="space-y-8">
            {/* Interview Readiness Score */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100/60 shadow-sm"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Readiness Score
                </h2>
                <p className="text-slate-600">
                  Your overall interview preparedness
                </p>
              </div>

              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />

                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#readinessGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    initial={{
                      strokeDasharray: "283",
                      strokeDashoffset: "283",
                    }}
                    animate={{
                      strokeDashoffset: 283 - (283 * readinessScore) / 100,
                    }}
                    transition={{ delay: 0.6, duration: 1.5 }}
                  />

                  <defs>
                    <linearGradient
                      id="readinessGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                    >
                      {readinessScore}%
                    </motion.span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Practice Volume",
                    value: Math.min(interviewCount * 2, 40),
                  },
                  {
                    label: "Performance",
                    value: Math.min(stats.averageScore * 0.35, 35),
                  },
                  {
                    label: "Consistency",
                    value: Math.min(stats.completionRate * 0.25, 25),
                  },
                ].map((metric, index) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-slate-700 text-sm">
                      {metric.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ delay: 1 + index * 0.2 }}
                        />
                      </div>
                      <span className="text-slate-900 font-medium text-sm w-8">
                        {Math.round(metric.value)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Stats Overview */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-blue-100/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Performance Stats
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Your interview metrics
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalInterviews || 0}
                  </div>
                  <div className="text-sm text-slate-600">Total</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.averageScore || 0}%
                  </div>
                  <div className="text-sm text-slate-600">Avg Score</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.completionRate || 0}%
                  </div>
                  <div className="text-sm text-slate-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.currentStreak || 0}
                  </div>
                  <div className="text-sm text-slate-600">Day Streak</div>
                </div>
              </div>
            </motion.section>

            {/* Flashcard Sessions */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-blue-100/60 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Flashcard Sessions
                  </h3>
                  <p className="text-slate-600 text-sm">Review key concepts</p>
                </div>
              </div>

              <div className="space-y-3">
                {flashcards.slice(0, 2).map((flashcard, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-900 font-medium text-sm line-clamp-2">
                        {flashcard.question}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-xs">
                        {flashcard.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          flashcard.difficulty === "Easy"
                            ? "bg-emerald-100 text-emerald-700"
                            : flashcard.difficulty === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {flashcard.difficulty}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start Flashcard Session
              </motion.button>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
