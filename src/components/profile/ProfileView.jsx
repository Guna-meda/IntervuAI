import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Briefcase, Calendar,
  Award, Target, TrendingUp, Edit2, Save, X, Plus,
  FileText, Upload, Check, Camera, Building, Linkedin,
  Github, Globe, Copy, CheckCircle2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function ProfileView() {
  const { mongoUser, user: firebaseUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use real user data from store
  const profile = mongoUser?.profile || {};
  const userStats = mongoUser?.stats || {};
  const userSkills = profile?.skills || [];

  const stats = [
    { icon: Target, label: 'Interviews', value: userStats.interviews || '0', color: 'from-blue-500 to-cyan-500' },
    { icon: TrendingUp, label: 'Success Rate', value: `${userStats.successRate || '0'}%`, color: 'from-blue-500 to-green-500' },
    { icon: Award, label: 'Certificates', value: userStats.certificates || '0', color: 'from-orange-500 to-yellow-500' },
    { icon: Briefcase, label: 'Projects', value: userStats.projects || '0', color: 'from-purple-500 to-pink-500' },
  ];

  // Initialize resume text from user data
  useEffect(() => {
    if (profile?.resumeText) {
      setResumeText(profile.resumeText);
    }
  }, [profile?.resumeText]);

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
        body: JSON.stringify({
          resumeText: resumeText
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resume');
      }

      const updatedUser = await response.json();
  // Update the store with new user data
useAuthStore.getState().setUser(firebaseUser, updatedUser.data || updatedUser);
      setShowResumeDialog(false);
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (isEditing) {
      // Save profile changes
      setLoading(true);
      try {
        const idToken = await firebaseUser.getIdToken(true);

        const response = await fetch("http://localhost:3001/api/v1/users/update-profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(profile),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        const updatedUser = await response.json();
  // Update the store with new user data
  useAuthStore.getState().setUser(firebaseUser, updatedUser);
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setLoading(false);
      }
    }
    setIsEditing(!isEditing);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get initial from name or email
  const getInitial = () => {
    if (profile?.fullName) {
      return profile.fullName.charAt(0).toUpperCase();
    }
    if (mongoUser?.displayName) {
      return mongoUser.displayName.charAt(0).toUpperCase();
    }
    if (firebaseUser?.email) {
      return firebaseUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (!mongoUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6"
        >
          {/* Cover Photo */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
            <div className="absolute inset-0 bg-blue-400/20" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-colors"
            >
              <Camera className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 sm:px-8 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 sm:-mt-20 mb-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative inline-block"
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold border-4 border-white shadow-2xl">
                  {getInitial()}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-2 right-2 p-2.5 bg-white rounded-xl shadow-lg text-gray-700 hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>

            {/* Name and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {profile?.fullName || mongoUser?.displayName || 'User'}
                  </h1>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
                <p className="text-lg text-gray-600 font-medium">{profile?.role || 'Add your role'}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {profile?.company && (
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile?.joinDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {profile.joinDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditProfile}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isEditing ? (
                    <Save className="w-4 h-4" />
                  ) : (
                    <Edit2 className="w-4 h-4" />
                  )}
                  {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit Profile'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">About</h2>
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                {profile?.bio || 'Add a bio to tell others about yourself...'}
              </p>
            </motion.div>

            {/* Skills Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {userSkills.length > 0 ? (
                  userSkills.map((skill, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl font-medium text-sm border border-blue-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      {skill}
                    </motion.span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            </motion.div>

            {/* Resume Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Resume</h2>
                    <p className="text-sm text-gray-500">Manage your resume content</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResumeDialog(true)}
                  className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>

              {profile?.resumeText ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Resume Added</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{profile.resumeText}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowResumeDialog(true)}
                      className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => copyToClipboard(profile.resumeText)}
                      className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowResumeDialog(true)}
                  className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-semibold mb-1">Add Your Resume</p>
                      <p className="text-sm text-gray-500">Paste your resume text to get started</p>
                    </div>
                  </div>
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-5">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-900 font-medium">{firebaseUser?.email}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-5">Social Profiles</h3>
              <div className="space-y-3">
                {[
                  { icon: Linkedin, label: 'LinkedIn', value: profile.linkedin, color: 'from-blue-600 to-blue-700' },
                  { icon: Github, label: 'GitHub', value: profile.github, color: 'from-gray-700 to-gray-900' },
                  { icon: Globe, label: 'Website', value: profile.website, color: 'from-blue-600 to-blue-700' },
                ].map((social, idx) => (
                  social.value && (
                    <motion.a
                      key={idx}
                      href={`https://${social.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center shadow-md`}>
                        <social.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">{social.label}</p>
                        <p className="text-sm text-gray-900 font-medium group-hover:text-blue-600 transition-colors">{social.value}</p>
                      </div>
                    </motion.a>
                  )
                ))}
                {!profile.linkedin && !profile.github && !profile.website && (
                  <p className="text-gray-500 text-sm text-center py-4">No social links added</p>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg text-white"
            >
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all text-left font-medium"
                >
                  Download CV
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all text-left font-medium"
                >
                  Share Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all text-left font-medium"
                >
                  View Analytics
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Resume Dialog */}
      <AnimatePresence>
        {showResumeDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResumeDialog(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* Dialog Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {profile?.resumeText ? 'Edit Resume' : 'Add Resume'}
                        </h2>
                        <p className="text-blue-100 text-sm">Paste your resume content below</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowResumeDialog(false)}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Dialog Content */}
                <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Resume Text
                      </label>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume text here...&#10;&#10;Include your experience, education, skills, and achievements."
                        className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none text-gray-800 placeholder-gray-400"
                      />
                    </div>
                    <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Your resume will be used by our AI to provide personalized interview questions and feedback.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dialog Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowResumeDialog(false)}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveResume}
                    disabled={!resumeText.trim() || loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {loading ? 'Saving...' : 'Save Resume'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}