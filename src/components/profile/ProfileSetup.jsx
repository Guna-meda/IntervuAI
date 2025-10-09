import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, FileText, Plus, X, Save, Globe, Github, Linkedin } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function ProfileSetup({ onSave, onComplete }) {
  const { user: firebaseUser, mongoUser, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: firebaseUser?.displayName || '',
    role: '',
    company: '',
    joinDate: '',
    bio: '',
    linkedin: '',
    github: '',
    website: '',
    skills: [],
    experience: [],
    resumeText: ''
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [currentExperience, setCurrentExperience] = useState({
    company: '',
    role: '',
    duration: '',
    description: '',
    current: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addExperience = () => {
    if (currentExperience.company && currentExperience.role && currentExperience.duration) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...currentExperience }]
      }));
      setCurrentExperience({
        company: '',
        role: '',
        duration: '',
        description: '',
        current: false
      });
    }
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setSaving(true);
    setError('');

    try {
      const updatedMongoUser = {
        ...(mongoUser || {}),
        profileSetup: true,
        profile: { ...formData },
      };

      setUser(firebaseUser, updatedMongoUser);

      if (typeof onSave === 'function') {
        await onSave(formData);
      }

      if (typeof onComplete === 'function') {
        onComplete();
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addSkill();
    }
  };

  const handleExperienceKeyPress = (e) => {
    if (e.key === 'Enter') {
      addExperience();
    }
  };

  const isFormValid = formData.fullName && formData.role && formData.bio && 
                     formData.skills.length > 0 && formData.resumeText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Setup Your Profile
          </h1>
          <p className="text-gray-600">
            Complete your profile to get personalized interview preparation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role/Title *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="Current company"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Join Date
              </label>
              <input
                type="text"
                value={formData.joinDate}
                onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="e.g. January 2023"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                placeholder="Tell us about your experience and interests..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LinkedIn
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="LinkedIn profile URL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                GitHub
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="GitHub profile URL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Personal website URL"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Skills *
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                placeholder="Add a skill (e.g. React, Node.js)"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addSkill}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
            {formData.skills.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Add at least one skill</p>
            )}
          </div>

          {/* Experience */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience
            </label>
            <div className="space-y-4 mb-3">
              <div>
                <input
                  type="text"
                  value={currentExperience.company}
                  onChange={(e) => setCurrentExperience(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                  placeholder="Company name"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={currentExperience.role}
                  onChange={(e) => setCurrentExperience(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                  placeholder="Role/Title"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={currentExperience.duration}
                  onChange={(e) => setCurrentExperience(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                  placeholder="Duration (e.g. Jan 2020 - Present)"
                  onKeyPress={handleExperienceKeyPress}
                />
              </div>
              <div>
                <textarea
                  value={currentExperience.description}
                  onChange={(e) => setCurrentExperience(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
                  placeholder="Description of responsibilities and achievements"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentExperience.current}
                  onChange={(e) => setCurrentExperience(prev => ({ ...prev, current: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Current position</label>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addExperience}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Experience
              </motion.button>
            </div>
            <div className="space-y-2">
              {formData.experience.map((exp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{exp.role}</p>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                      <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                      {exp.current && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeExperience(idx)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            {formData.experience.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No experience added yet</p>
            )}
          </div>

          {/* Resume */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Resume Text *
            </label>
            <textarea
              value={formData.resumeText}
              onChange={(e) => setFormData(prev => ({ ...prev, resumeText: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              placeholder="Paste your resume content here. Include your experience, education, skills, and achievements..."
            />
            <p className="text-sm text-gray-500 mt-2">
              This will help us provide personalized interview questions and feedback
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!isFormValid || saving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Complete Setup
              </>
            )}
          </motion.button>

          {!isFormValid && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              Please fill all required fields (*) to complete your profile
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}