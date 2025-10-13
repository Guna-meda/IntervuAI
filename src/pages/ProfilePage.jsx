// ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Briefcase, Calendar, Award, Target, 
  TrendingUp, Edit2, Plus, FileText, Upload, 
  Check, Camera, Building, Linkedin, Github, 
  Globe, Copy, CheckCircle2, User, Sparkles,
  Zap, Rocket, Crown, Star, Download, Share,
  BarChart3, Settings, Video, Mic, Wifi,
  Brain, Cpu, Cloud, ArrowRight, Users,
  MessageCircle, Bell, Shield, Clock
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { getUserInterviews, getInterviewStats } from '../services/interviewService';
import ProfileEditDialog from '../components/profile/ProfileEditDialog';

export default function ProfileView() {
  const { mongoUser, user: firebaseUser } = useAuthStore();
  const { userStats, fetchUserStats } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  const profile = mongoUser?.profile || {};
  const userSkills = profile?.skills || [];
  const userExperience = profile?.experience || [];

  useEffect(() => {
    if (profile?.resumeText) {
      setResumeText(profile.resumeText);
    }
    loadRealData();
  }, [profile?.resumeText]);

  const loadRealData = async () => {
    try {
      // Load interviews
      const interviewsResponse = await getUserInterviews({ limit: 10 });
      setInterviews(interviewsResponse.interviews || []);
      
      // Load stats
      const statsResponse = await getInterviewStats();
      setStats(statsResponse || {});
      
      // Load user stats
      await fetchUserStats();
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  // Real-time stats calculation
  const realStats = {
    interviews: interviews.length,
    successRate: stats.completionRate || 0,
    averageScore: stats.averageScore || 0,
    totalPractice: interviews.reduce((total, interview) => total + (interview.duration || 30), 0),
    currentStreak: stats.currentStreak || 0,
  };

  const achievementStats = [
    { 
      icon: Target, 
      label: 'Total Interviews', 
      value: realStats.interviews.toString(), 
      change: '+12%', 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50/50'
    },
    { 
      icon: TrendingUp, 
      label: 'Success Rate', 
      value: `${realStats.successRate}%`, 
      change: '+5.2%', 
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50/50'
    },
    { 
      icon: Award, 
      label: 'Avg Score', 
      value: `${realStats.averageScore}/10`, 
      change: '+3.1%', 
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50/50'
    },
    { 
      icon: Zap, 
      label: 'Practice Time', 
      value: `${realStats.totalPractice}m`, 
      change: '+28%', 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50/50'
    },
  ];

  const handleSaveResume = async () => {
    setLoading(true);
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch("http://localhost:3001/api/v1/users/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ resumeText: resumeText }),
      });

      if (!response.ok) throw new Error('Failed to update resume');
      
      const updatedUser = await response.json();
      useAuthStore.getState().setUser(firebaseUser, updatedUser.data || updatedUser);
      setShowResumeDialog(false);
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitial = () => {
    if (profile?.fullName) return profile.fullName.charAt(0).toUpperCase();
    if (mongoUser?.displayName) return mongoUser.displayName.charAt(0).toUpperCase();
    if (firebaseUser?.email) return firebaseUser.email.charAt(0).toUpperCase();
    return 'U';
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
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  if (!mongoUser) {
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
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 relative overflow-hidden">
      {/* Enhanced Background Elements */}
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
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          transition={{ delay: 2 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-200/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section with Glass Effect */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xs border border-cyan-200/40 overflow-hidden mb-8 relative"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
          
          {/* Cover Section */}
          <div className="relative h-48 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-sm rounded-2xl text-slate-600 hover:bg-white transition-all shadow-sm hover:shadow-md">
              <Camera className="w-5 h-5" />
            </button>
            
            {/* Profile Avatar */}
            <div className="absolute -bottom-8 left-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-2xl shadow-cyan-500/25">
                  {getInitial()}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-1 -right-1 p-2 bg-white rounded-2xl shadow-lg text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 transition-all"
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-12 px-8 pb-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      {profile?.fullName || mongoUser?.displayName || 'User'}
                    </h1>
                    <p className="text-slate-600 font-medium text-lg mt-1">{profile?.role || 'Add your role'}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 text-sm font-medium">Verified</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  {profile?.company && (
                    <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200/40">
                      <Building className="w-4 h-4" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile?.joinDate && (
                    <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200/40">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {profile.joinDate}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200/40">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Level {Math.floor(realStats.interviews / 5) + 1} Expert</span>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEditDialog(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Achievement Stats */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {achievementStats.map((stat, idx) => (
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
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 text-xs font-semibold">{stat.change}</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-1 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    
                    {/* Animated progress bar */}
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
            </motion.div>

            {/* About & Skills Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* About Section */}
              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-100 rounded-xl">
                    <User className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="font-semibold text-slate-900 text-lg">About Me</h2>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {profile?.bio || 'Add a bio to tell others about yourself and your professional journey...'}
                </p>
              </motion.div>

              {/* Skills Section */}
              <motion.div
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="font-semibold text-slate-900 text-lg">Skills & Expertise</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditDialog(true)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userSkills.length > 0 ? (
                    userSkills.map((skill, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 rounded-xl text-sm font-medium border border-cyan-200/60 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                      >
                        {skill}
                      </motion.span>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No skills added yet</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Experience Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="font-semibold text-slate-900 text-lg">Experience</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditDialog(true)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="space-y-4">
                {userExperience.length > 0 ? (
                  userExperience.map((exp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-slate-50/50 to-blue-50/30 border border-slate-200/40 hover:border-cyan-200/60 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 text-base">{exp.role}</h3>
                            {exp.current && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm">{exp.company}</p>
                          <p className="text-slate-500 text-xs">{exp.duration}</p>
                          {exp.description && (
                            <p className="text-slate-700 text-sm leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                        <Building className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm text-center py-4">No experience added yet</p>
                )}
              </div>
            </motion.div>

            {/* Resume Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 text-lg">AI Resume</h2>
                    <p className="text-slate-500 text-sm">Powered by our AI analysis</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResumeDialog(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all text-sm"
                >
                  {profile?.resumeText ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {profile?.resumeText ? 'Edit' : 'Add'} Resume
                </motion.button>
              </div>

              {profile?.resumeText ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold text-sm">Resume Analyzed & Ready</span>
                    </div>
                    <p className="text-slate-700 text-sm line-clamp-3">{profile.resumeText}</p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowResumeDialog(true)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all text-sm"
                    >
                      Edit Content
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(profile.resumeText)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy Text'}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResumeDialog(true)}
                  className="w-full p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-cyan-400 hover:bg-cyan-50/30 transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-slate-900 font-semibold text-base mb-1">Add Your Resume</p>
                      <p className="text-slate-500 text-sm">Let AI analyze your resume for better interview questions</p>
                    </div>
                  </div>
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact & Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-cyan-200/40 shadow-xs"
            >
              <h3 className="font-semibold text-slate-900 mb-4 text-lg">Contact & Social</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-200/40">
                  <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-slate-900 font-medium truncate max-w-[140px]">
                      {firebaseUser?.email}
                    </p>
                  </div>
                </div>

                {/* Social Links */}
                {[
                  { icon: Linkedin, label: 'LinkedIn', value: profile.linkedin, color: 'bg-blue-600' },
                  { icon: Github, label: 'GitHub', value: profile.github, color: 'bg-slate-800' },
                  { icon: Globe, label: 'Website', value: profile.website, color: 'bg-cyan-500' },
                ].map((social, idx) => (
                  social.value && (
                    <motion.a
                      key={idx}
                      href={social.value.startsWith('http') ? social.value : `https://${social.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-200/40 hover:border-cyan-200/60 transition-all group"
                    >
                      <div className={`w-10 h-10 ${social.color} rounded-xl flex items-center justify-center`}>
                        <social.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{social.label}</p>
                        <p className="text-sm text-slate-900 font-medium group-hover:text-cyan-600 transition-colors truncate max-w-[120px]">
                          {social.value.replace(/^https?:\/\//, '')}
                        </p>
                      </div>
                    </motion.a>
                  )
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Actions</h3>
                    <p className="text-cyan-100 text-sm opacity-90">Jump back in</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: Video, label: 'New Interview', color: 'bg-white/20' },
                    { icon: Download, label: 'Export CV', color: 'bg-white/20' },
                    { icon: Share, label: 'Share Profile', color: 'bg-white/20' },
                    { icon: BarChart3, label: 'Analytics', color: 'bg-white/20' },
                  ].map((action, idx) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                    >
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Achievement Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-cyan-200/40 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100/30 rounded-full -translate-y-8 translate-x-8" />
              
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Current Level</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      <span className="font-bold text-amber-600">Expert </span>
                      • {realStats.interviews} interviews completed
                    </p>
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-1">
                      <motion.div
                        className="h-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((realStats.interviews / 20) * 100, 100)}%` }}
                        transition={{ delay: 0.8, duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Resume Dialog */}
      <AnimatePresence>
        {showResumeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-cyan-200/40"
            >
              <div className="border-b border-slate-200/40 p-6 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {profile?.resumeText ? 'Edit AI Resume' : 'Add AI Resume'}
                      </h2>
                      <p className="text-slate-600 text-sm">Let our AI analyze your resume for better interview preparation</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowResumeDialog(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5 text-slate-400 transform rotate-45" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6 max-h-[50vh] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Resume Content
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your complete resume text here...\n\nInclude:\n• Work experience\n• Education\n• Skills\n• Projects\n• Achievements\n\nOur AI will analyze this to create personalized interview questions."
                      className="w-full h-64 px-4 py-3 border border-slate-300 rounded-2xl focus:border-cyan-500 focus:ring-3 focus:ring-cyan-100 outline-none transition-all resize-none text-slate-800 placeholder-slate-400 text-sm leading-relaxed"
                    />
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-cyan-50 border border-cyan-200 rounded-2xl">
                    <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-cyan-800 font-medium text-sm mb-1">AI-Powered Analysis</p>
                      <p className="text-cyan-700 text-sm">
                        Your resume will be analyzed to identify key skills, experience, and create tailored interview questions that match your background.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200/40 p-6 bg-slate-50/50 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResumeDialog(false)}
                  className="flex-1 px-6 py-3.5 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveResume}
                  disabled={!resumeText.trim() || loading}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {loading ? 'Analyzing...' : 'Save & Analyze'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditDialog && (
          <ProfileEditDialog
            onClose={() => setShowEditDialog(false)} 
            onSave={(updatedUser) => {
              const firebaseUser = useAuthStore.getState().user;
              if (updatedUser) useAuthStore.getState().setUser(firebaseUser, updatedUser);
              setShowEditDialog(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}