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
  MessageCircle, Bell, Shield, Clock, X,
  BrainCircuit, ChevronRight, ExternalLink
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { getUserInterviews, getInterviewStats } from '../services/interviewService';
import ProfileEditDialog from '../components/profile/ProfileEditDialog';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────── */
const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

/* ─────────────────────────────────────────────
   SMALL REUSABLE PIECES
───────────────────────────────────────────── */

function SectionCard({ children, className = '', style = {} }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs relative overflow-hidden ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, iconBg = 'bg-cyan-100', iconColor = 'text-cyan-600', title, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h2 className="font-semibold text-slate-900 text-base">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function StatBadge({ icon: Icon, iconBg, iconColor, label, value, valueColor = 'text-cyan-700' }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className={`text-xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      <p className="text-slate-500 text-xs text-center leading-tight">{label}</p>
    </div>
  );
}

function IconButton({ onClick, children, className = '' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

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
      const interviewsResponse = await getUserInterviews({ limit: 10 });
      setInterviews(interviewsResponse.interviews || []);
      const statsResponse = await getInterviewStats();
      setStats(statsResponse || {});
      await fetchUserStats();
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const realStats = {
    interviews: interviews.length,
    successRate: stats.completionRate || 0,
    averageScore: stats.averageScore || 0,
    totalPractice: interviews.reduce((total, interview) => total + (interview.duration || 30), 0),
    currentStreak: stats.currentStreak || 0,
  };

  const handleSaveResume = async () => {
    setLoading(true);
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ resumeText }),
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

  /* ── Loading ── */
  if (!mongoUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-[3px] border-cyan-200 border-t-cyan-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  const levelProgress = Math.min((realStats.interviews / 20) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 relative overflow-hidden">

      {/* ── Ambient Background (identical to IntervuAI) ── */}
      {/* CLEAN BACKGROUND — MATCHES APP STYLE */}
<div className="fixed inset-0 overflow-hidden pointer-events-none">
  {/* soft gradient blobs (minimal, not distracting) */}
  <div className="absolute top-1/3 -left-20 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />
  <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-200/15 rounded-full blur-3xl" />

  {/* subtle icons (VERY low opacity like your app) */}
  <div className="absolute top-20 right-20 opacity-[0.03]">
    <BrainCircuit className="w-32 h-32 text-cyan-500" />
  </div>
  <div className="absolute bottom-20 left-20 opacity-[0.03]">
    <Cpu className="w-32 h-32 text-blue-500" />
  </div>
</div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4 md:px-6 lg:px-8 relative z-10">

        {/* ════════════════════════════════════════
            MAIN GRID
        ════════════════════════════════════════ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8"
        >

          {/* ── LEFT COLUMN (3/4) ── */}
          <div className="xl:col-span-3 space-y-6 sm:space-y-8">

            {/* About + Skills row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* About */}
              <SectionCard>
                <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-100/20 rounded-full -translate-y-12 translate-x-12" />
                <div className="p-6 relative z-10">
                  <SectionTitle
                    icon={User}
                    iconBg="bg-cyan-100"
                    iconColor="text-cyan-600"
                    title="About Me"
                    action={
                      <IconButton
                        onClick={() => setShowEditDialog(true)}
                        className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </IconButton>
                    }
                  />
                  {profile?.bio ? (
                    <p className="text-slate-600 leading-relaxed text-sm">{profile.bio}</p>
                  ) : (
                    <button
                      onClick={() => setShowEditDialog(true)}
                      className="w-full p-5 border-2 border-dashed border-slate-200 rounded-xl hover:border-cyan-300 hover:bg-cyan-50/30 transition-all group text-center"
                    >
                      <Plus className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
                      <p className="text-slate-400 text-sm group-hover:text-cyan-600 transition-colors">Add a bio to tell your story</p>
                    </button>
                  )}
                </div>
              </SectionCard>

              {/* Skills */}
              <SectionCard>
                <div className="absolute top-0 right-0 w-28 h-28 bg-violet-100/20 rounded-full -translate-y-12 translate-x-12" />
                <div className="p-6 relative z-10">
                  <SectionTitle
                    icon={Zap}
                    iconBg="bg-violet-100"
                    iconColor="text-violet-600"
                    title="Skills & Expertise"
                    action={
                      <IconButton
                        onClick={() => setShowEditDialog(true)}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </IconButton>
                    }
                  />
                  {userSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userSkills.map((skill, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.06 }}
                          whileHover={{ scale: 1.05, y: -1 }}
                          className="px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 rounded-xl text-sm font-medium border border-cyan-200/60 shadow-xs hover:shadow-sm hover:border-cyan-300 transition-all cursor-default"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowEditDialog(true)}
                      className="w-full p-5 border-2 border-dashed border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50/30 transition-all group text-center"
                    >
                      <Plus className="w-5 h-5 text-slate-300 group-hover:text-violet-400 mx-auto mb-2 transition-colors" />
                      <p className="text-slate-400 text-sm group-hover:text-violet-600 transition-colors">Add your skills</p>
                    </button>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Experience */}
            <SectionCard>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/20 rounded-full -translate-y-16 translate-x-16" />
              <div className="p-6 relative z-10">
                <SectionTitle
                  icon={Briefcase}
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                  title="Experience"
                  action={
                    <IconButton
                      onClick={() => setShowEditDialog(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </IconButton>
                  }
                />
                {userExperience.length > 0 ? (
                  <div className="space-y-3">
                    {userExperience.map((exp, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="group p-4 rounded-xl bg-gradient-to-r from-slate-50/60 to-amber-50/20 border border-slate-200/40 hover:border-amber-200/60 hover:shadow-sm transition-all relative overflow-hidden"
                      >
                        {/* left accent bar */}
                        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-400 rounded-l-xl" />
                        <div className="pl-3 flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{exp.role}</h3>
                              {exp.current && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 text-sm font-medium">{exp.company}</p>
                            <p className="text-slate-400 text-xs">{exp.duration}</p>
                            {exp.description && (
                              <p className="text-slate-600 text-sm leading-relaxed mt-2">{exp.description}</p>
                            )}
                          </div>
                          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                            <Building className="w-4 h-4 text-amber-600" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowEditDialog(true)}
                    className="w-full p-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/30 transition-all group text-center"
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-5 h-5 text-amber-500" />
                    </div>
                    <p className="text-slate-600 font-medium text-sm">Add your work experience</p>
                    <p className="text-slate-400 text-xs mt-1">Your journey matters — showcase it</p>
                  </button>
                )}
              </div>
            </SectionCard>

            {/* AI Resume */}
            <SectionCard>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/20 rounded-full -translate-y-16 translate-x-16" />
              <div className="p-6 relative z-10">
                <SectionTitle
                  icon={FileText}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  title="AI Resume"
                  action={
                    <IconButton
                      onClick={() => setShowResumeDialog(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:shadow-cyan-500/20 transition-all"
                    >
                      {profile?.resumeText ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      {profile?.resumeText ? 'Edit' : 'Add'} Resume
                    </IconButton>
                  }
                />

                {profile?.resumeText ? (
                  <div className="space-y-4">
                    {/* Success banner */}
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl">
                      <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-emerald-800 font-semibold text-sm">Resume Analyzed & Ready</p>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed line-clamp-3">{profile.resumeText}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <IconButton
                        onClick={() => setShowResumeDialog(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/70 border border-slate-200/60 text-slate-700 rounded-xl font-medium text-sm hover:border-cyan-300 hover:bg-cyan-50/40 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Content
                      </IconButton>
                      <IconButton
                        onClick={() => copyToClipboard(profile.resumeText)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/70 border border-slate-200/60 text-slate-700 rounded-xl font-medium text-sm hover:border-cyan-300 hover:bg-cyan-50/40 transition-all"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy Text'}
                      </IconButton>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowResumeDialog(true)}
                    className="w-full p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-cyan-300 hover:bg-cyan-50/20 transition-all group"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-200 transition-all">
                        <Upload className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-slate-800 font-semibold text-base mb-1">Add Your Resume</p>
                        <p className="text-slate-400 text-sm">Let AI analyze your resume for smarter interview questions</p>
                      </div>
                    </div>
                  </motion.button>
                )}
              </div>
            </SectionCard>
          </div>

          {/* ── RIGHT COLUMN (1/4) ── */}
          <div className="space-y-5">

            {/* Contact & Social */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-100/20 rounded-full -translate-y-10 translate-x-10" />
              <div className="p-5 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-4 h-4 text-cyan-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base">Contact & Social</h3>
                </div>

                <div className="space-y-2.5">
                  {/* Email */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-slate-100/80">
                    <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-400 text-xs mb-0.5">Email</p>
                      <p className="text-slate-800 text-sm font-medium truncate">{firebaseUser?.email}</p>
                    </div>
                  </div>

                  {/* Social links */}
                  {[
                    { icon: Linkedin, label: 'LinkedIn', value: profile.linkedin, iconBg: 'bg-[#0077B5]' },
                    { icon: Github,   label: 'GitHub',   value: profile.github,   iconBg: 'bg-slate-800'  },
                    { icon: Globe,    label: 'Website',  value: profile.website,  iconBg: 'bg-cyan-500'   },
                  ].map((social, idx) =>
                    social.value ? (
                      <motion.a
                        key={idx}
                        href={social.value.startsWith('http') ? social.value : `https://${social.value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, x: 2 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-slate-100/80 hover:border-cyan-200/60 hover:shadow-sm transition-all group"
                      >
                        <div className={`w-9 h-9 ${social.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <social.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-400 text-xs mb-0.5">{social.label}</p>
                          <p className="text-slate-800 text-sm font-medium truncate group-hover:text-cyan-600 transition-colors">
                            {social.value.replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-500 flex-shrink-0 transition-colors" />
                      </motion.a>
                    ) : null
                  )}

                  {/* If no socials, nudge to add */}
                  {!profile.linkedin && !profile.github && !profile.website && (
                    <button
                      onClick={() => setShowEditDialog(true)}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50/30 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add social links
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

        

            {/* Quick actions card */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/20 rounded-full -translate-y-10 translate-x-10" />
              <div className="p-5 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Edit your profile',      icon: Edit2,     onClick: () => setShowEditDialog(true),    color: 'hover:border-cyan-300 hover:bg-cyan-50/30'    },
                    { label: 'Update resume',           icon: FileText,  onClick: () => setShowResumeDialog(true),  color: 'hover:border-blue-300 hover:bg-blue-50/30'    },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={action.onClick}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/50 bg-white/40 text-left text-sm text-slate-700 font-medium transition-all group ${action.color}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <action.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        {action.label}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════
          RESUME DIALOG
      ════════════════════════════════════════ */}
      <AnimatePresence>
        {showResumeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl shadow-cyan-500/10 max-w-2xl w-full max-h-[90vh] overflow-hidden border border-cyan-200/40"
            >
              {/* Dialog header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {profile?.resumeText ? 'Edit AI Resume' : 'Add AI Resume'}
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">AI will analyze it for personalized questions</p>
                  </div>
                </div>
                <IconButton
                  onClick={() => setShowResumeDialog(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </IconButton>
              </div>

              {/* Dialog body */}
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[55vh]">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Resume Content</label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder={`Paste your complete resume text here...\n\nInclude:\n• Work experience\n• Education\n• Skills\n• Projects\n• Achievements\n\nOur AI will analyze this to create personalized interview questions.`}
                      className="w-full h-56 px-4 py-3 border border-slate-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none transition-all resize-none text-slate-700 placeholder-slate-300 text-sm leading-relaxed bg-white/80"
                    />
                  </div>

                  {/* Info box */}
                  <div className="flex items-start gap-3 p-4 bg-cyan-50/80 border border-cyan-200/60 rounded-xl">
                    <div className="w-8 h-8 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-cyan-500/20">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-cyan-800 font-semibold text-sm mb-0.5">AI-Powered Analysis</p>
                      <p className="text-cyan-700 text-xs leading-relaxed">
                        Your resume will be analyzed to identify key skills, experience, and craft tailored interview questions that match your background precisely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dialog footer */}
              <div className="flex gap-3 p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50">
                <IconButton
                  onClick={() => setShowResumeDialog(false)}
                  className="flex-1 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Cancel
                </IconButton>
                <motion.button
                  whileHover={{ scale: resumeText.trim() && !loading ? 1.02 : 1 }}
                  whileTap={{ scale: resumeText.trim() && !loading ? 0.98 : 1 }}
                  onClick={handleSaveResume}
                  disabled={!resumeText.trim() || loading}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {loading ? 'Analyzing...' : 'Save & Analyze'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          EDIT PROFILE DIALOG
      ════════════════════════════════════════ */}
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