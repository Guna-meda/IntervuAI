import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Briefcase, Calendar, Award, Target, 
  TrendingUp, Edit2, Save, Plus, FileText, 
  Upload, Check, Camera, Building, Linkedin,
  Github, Globe, Copy, CheckCircle2, User
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ProfileEditDialog from './ProfileEditDialog';

export default function ProfileView() {
  const { mongoUser, user: firebaseUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const profile = mongoUser?.profile || {};
  const userStats = mongoUser?.stats || {};
  const userSkills = profile?.skills || [];

  const stats = [
    { icon: Target, label: 'Interviews', value: userStats.interviews || '0', color: 'bg-blue-50 text-blue-600' },
    { icon: TrendingUp, label: 'Success Rate', value: `${userStats.successRate || '0'}%`, color: 'bg-green-50 text-green-600' },
    { icon: Award, label: 'Certificates', value: userStats.certificates || '0', color: 'bg-amber-50 text-amber-600' },
    { icon: Briefcase, label: 'Projects', value: userStats.projects || '0', color: 'bg-purple-50 text-purple-600' },
  ];

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

  const handleEditProfile = async () => {
    if (isEditing) {
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

        if (!response.ok) throw new Error('Failed to update profile');
        
        const updatedUser = await response.json();
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

  const getInitial = () => {
    if (profile?.fullName) return profile.fullName.charAt(0).toUpperCase();
    if (mongoUser?.displayName) return mongoUser.displayName.charAt(0).toUpperCase();
    if (firebaseUser?.email) return firebaseUser.email.charAt(0).toUpperCase();
    return 'U';
  };

  if (!mongoUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8"
        >
          {/* Cover Photo Section */}
          <div className="relative h-32 bg-gradient-to-r from-gray-100 to-gray-200">
            <div className="absolute inset-0 bg-black/5" />
            <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-lg text-gray-600 hover:bg-white transition-colors">
              <Camera className="w-4 h-4" />
            </button>
            <div className="absolute -bottom-6 left-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold border-4 border-white shadow-lg">
                  {getInitial()}
                </div>
                <button className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow-md text-gray-600 hover:bg-gray-50">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-8 px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.fullName || mongoUser?.displayName || 'User'}
                  </h1>
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 font-medium">{profile?.role || 'Add your role'}</p>
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
<motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditDialog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">About</h2>
                {isEditing && (
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-gray-700 leading-relaxed">
                {profile?.bio || 'Add a bio to tell others about yourself...'}
              </p>
            </motion.div>

            {/* Skills Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Skills & Expertise</h2>
                {isEditing && (
                  <button className="text-gray-400 hover:text-gray-600">
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {userSkills.length > 0 ? (
                  userSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills added yet</p>
                )}
              </div>
            </motion.div>

            {/* Resume Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Resume</h2>
                    <p className="text-sm text-gray-500">Manage your resume content</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResumeDialog(true)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {profile?.resumeText ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium text-sm">Resume Added</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{profile.resumeText}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowResumeDialog(true)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => copyToClipboard(profile.resumeText)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResumeDialog(true)}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-medium text-sm mb-1">Add Your Resume</p>
                      <p className="text-xs text-gray-500">Paste your resume text to get started</p>
                    </div>
                  </div>
                </button>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
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
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Social Profiles</h3>
              <div className="space-y-2">
                {[
                  { icon: Linkedin, label: 'LinkedIn', value: profile.linkedin, color: 'bg-blue-600' },
                  { icon: Github, label: 'GitHub', value: profile.github, color: 'bg-gray-800' },
                  { icon: Globe, label: 'Website', value: profile.website, color: 'bg-blue-500' },
                ].map((social, idx) => (
                  social.value && (
                    <a
                      key={idx}
                      href={social.value.startsWith('http') ? social.value : `https://${social.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`w-8 h-8 ${social.color} rounded-lg flex items-center justify-center`}>
                        <social.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{social.label}</p>
                        <p className="text-sm text-gray-900 font-medium group-hover:text-blue-600 transition-colors truncate max-w-[120px]">
                          {social.value.replace(/^https?:\/\//, '')}
                        </p>
                      </div>
                    </a>
                  )
                ))}
                {!profile.linkedin && !profile.github && !profile.website && (
                  <p className="text-gray-500 text-sm text-center py-3">No social links added</p>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white"
            >
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full p-2.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-left text-sm font-medium">
                  Download CV
                </button>
                <button className="w-full p-2.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-left text-sm font-medium">
                  Share Profile
                </button>
                <button className="w-full p-2.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-left text-sm font-medium">
                  View Analytics
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Resume Dialog */}
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
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {profile?.resumeText ? 'Edit Resume' : 'Add Resume'}
                      </h2>
                      <p className="text-sm text-gray-500">Paste your resume content below</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResumeDialog(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 transform rotate-45 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[50vh] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume Text
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume text here...\n\nInclude your experience, education, skills, and achievements."
                      className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-gray-800 placeholder-gray-400 text-sm"
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Your resume will be used by our AI to provide personalized interview questions and feedback.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-6 flex gap-3">
                <button
                  onClick={() => setShowResumeDialog(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResume}
                  disabled={!resumeText.trim() || loading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {loading ? 'Saving...' : 'Save Resume'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEditDialog && (
          <ProfileEditDialog
            onClose={() => setShowEditDialog(false)} 
            onSave={() => setShowEditDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}