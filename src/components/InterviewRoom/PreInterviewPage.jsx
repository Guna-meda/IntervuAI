import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserInterviewStore } from '../../store/interviewStore';
import { startInterview, getAllInterviews, getInterviewDetails } from '../../services/interviewService';
import { auth } from '../../firebase/config';
import { 
  Rocket, Video, Mic,  
  Star,
  ChevronRight, CheckCircle2, Circle,
  MicOff, VideoOff, Edit, Trash2, Plus, X, ChevronDown
} from 'lucide-react';

const PreInterviewPage = ({ interviewId, onStartInterview }) => {
  const { mediaSettings, setMediaSettings, availableRoles, setCurrentInterviewId, skills: storedSkills, setSkills } =
    useUserInterviewStore();

  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [localMediaSettings, setLocalMediaSettings] = useState(mediaSettings);
  const [mediaDevices, setMediaDevices] = useState({ video: [], audio: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interview, setInterview] = useState(null);
  const [userInterviews, setUserInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState('setup');
  const [cameraActive, setCameraActive] = useState(true);
const [localSkills, setLocalSkills] = useState(Array.isArray(storedSkills) ? storedSkills : []);  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkillIndex, setEditingSkillIndex] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newProficiency, setNewProficiency] = useState(3);
  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const interviewIdFromState = location.state?.interviewId || interviewId;
  const isExistingInterview = !!interviewIdFromState;

  useEffect(() => {
    const loadInterviewData = async () => {
      if (isExistingInterview) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await getInterviewDetails(interviewIdFromState);
          setInterview(response.interview);
          setSelectedRole(response.interview.role.toLowerCase().replace(' ', ''));
          setCurrentInterviewId(interviewIdFromState);
        } catch (error) {
          console.error('Error loading interview:', error);
          setError('Failed to load interview details. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }

      try {
        const response = await getAllInterviews();
        setUserInterviews(response.interviews || []);
      } catch (error) {
        console.error('Error loading interviews:', error);
      }
    };

    loadInterviewData();
  }, [interviewIdFromState, isExistingInterview, setCurrentInterviewId]);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        const audioDevices = devices.filter((device) => device.kind === 'audioinput');

        setMediaDevices({
          video: videoDevices,
          audio: audioDevices,
        });
      } catch (error) {
        console.error('Error loading media devices:', error);
      }
    };

    loadDevices();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (cameraActive && (localMediaSettings.video || localMediaSettings.audio)) {
        try {
          const constraints = {
            video: localMediaSettings.video
              ? {
                  deviceId: localMediaSettings.videoDeviceId
                    ? { exact: localMediaSettings.videoDeviceId }
                    : undefined,
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
              : false,
            audio: localMediaSettings.audio
              ? {
                  deviceId: localMediaSettings.audioDeviceId
                    ? { exact: localMediaSettings.audioDeviceId }
                    : undefined,
                }
              : false,
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setCameraActive(false);
        }
      } else {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localMediaSettings, cameraActive]);

  const allRoles = [ ...availableRoles];
  const filteredRoles = allRoles.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase()));

  const handleRoleChange = (value) => {
    if (value === 'custom') {
      setIsCustomRole(true);
      setSelectedRole('');
    } else {
      setIsCustomRole(false);
      setSelectedRole(value);
    }
  };

  const handleAddOrEditSkill = () => {
    if (!newSkillName.trim()) return;
    const skillObj = { skill: newSkillName, proficiency: newProficiency };
    let updatedSkills;
    if (editingSkillIndex !== null) {
      updatedSkills = localSkills.map((s, idx) => idx === editingSkillIndex ? skillObj : s);
    } else {
      updatedSkills = [...localSkills, skillObj];
    }
    setLocalSkills(updatedSkills);
    setSkills(updatedSkills);
    setShowSkillModal(false);
    setNewSkillName('');
    setNewProficiency(3);
    setEditingSkillIndex(null);
  };

  const handleEditSkill = (index) => {
    const skill = localSkills[index];
    setNewSkillName(skill.skill);
    setNewProficiency(skill.proficiency);
    setEditingSkillIndex(index);
    setShowSkillModal(true);
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = localSkills.filter((_, idx) => idx !== index);
    setLocalSkills(updatedSkills);
    setSkills(updatedSkills);
  };

  const renderStars = (prof) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < prof ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const handleStartInterview = async (isRetake = false, difficulty = selectedDifficulty) => {
    if (!auth.currentUser) {
      alert('Please log in to start an interview');
      return;
    }

    let finalRole = '';
    if (isCustomRole) {
      if (!customRole.trim()) {
        alert('Please enter a custom role');
        return;
      }
      finalRole = customRole;
    } else {
      if (!isExistingInterview && !isRetake && !selectedRole) {
        alert('Please select a role to continue');
        return;
      }
      const roleData = isRetake && interview
        ? { label: interview.role }
        : allRoles.find(r => r.value === selectedRole);
      if (!roleData) {
        throw new Error('Selected role not found');
      }
      finalRole = roleData.label;
    }

    setIsLoading(true);
    setError(null);

    try {
      setMediaSettings(localMediaSettings);
      let interviewData;

      if (isExistingInterview && !isRetake && interview) {
        interviewData = interview;
        setCurrentInterviewId(interview.interviewId);
      } else {
        const response = await startInterview({
          role: finalRole,
          totalRounds: 3,
          difficulty,
          skills: localSkills,
          previousInterviewId: isRetake && interview ? interview.interviewId : undefined,
        });
        interviewData = response.data.interview;
        setCurrentInterviewId(interviewData.interviewId);
      }

      if (typeof onStartInterview === 'function') {
        onStartInterview(interviewData);
      }

      navigate('/interviewPage', { state: { interviewId: interviewData.interviewId, isNew: isRetake || !isExistingInterview } });
    } catch (error) {
      console.error('Error starting interview:', error);
      setError(`Failed to start interview: ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoundScore = (round) => {
    if (!round?.questions || round.questions.length === 0) return null;
    const avgScore = round.questions.reduce((sum, q) => sum + (q.score || 0), 0) / round.questions.length;
    return Math.round(avgScore * 10) / 10;
  };

  const getOverallScore = () => {
    if (!interview?.rounds) return null;
    const completedRounds = interview.rounds.filter((round) => round.status === 'completed');
    if (completedRounds.length === 0) return null;

    const totalScore = completedRounds.reduce((sum, round) => {
      const roundScore = getRoundScore(round);
      return sum + (roundScore || 0);
    }, 0);

    return Math.round((totalScore / completedRounds.length) * 10) / 10;
  };

  const handleMediaToggle = (type) => {
    setLocalMediaSettings((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleDeviceChange = (type, deviceId) => {
    setLocalMediaSettings((prev) => ({
      ...prev,
      [`${type}DeviceId`]: deviceId,
    }));
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  const handleViewReport = () => {
    navigate('/view-report', { state: { interviewId: interview?.interviewId } });
  };

  const handleRetakeInterview = (difficulty) => {
    if (!interview) {
      setError('No interview data available for retake. Please start a new interview.');
      return;
    }
    setSelectedDifficulty(difficulty);
    handleStartInterview(true, difficulty);
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

 return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50/30 to-blue-50/20 relative overflow-hidden">
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
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.header
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200 shadow-sm mb-4"
          >
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-gray-700 text-sm font-medium">
              {isExistingInterview ? 'Resume Your Interview' : 'AI Interview Coach Ready'}
            </span>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4"
          >
            {isExistingInterview ? 'Continue Interview' : 'Start New Interview'}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            {isExistingInterview
              ? 'Continue your interview preparation journey'
              : 'Practice with AI-powered interview simulations'}
          </motion.p>
        </motion.header>

        {error && (
          <motion.div
            variants={itemVariants}
            className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-center justify-between"
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {isExistingInterview && interview?.status === 'completed' && (
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Interview Completed
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You've successfully completed your interview for {interview.role}.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleViewReport}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Detailed Report
                    </button>
                    <div className="flex gap-2">
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <button
                        onClick={() => handleRetakeInterview(selectedDifficulty)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Retake Interview
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {!isExistingInterview && (
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Interview Configuration</h2>

                <div className="space-y-6">
                  {/* Difficulty Level Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none cursor-pointer"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Role Selection Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Role
                    </label>
                    
                    {/* Main Role Dropdown Trigger */}
                    <div className="relative">
                      <button
                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-left flex items-center justify-between"
                      >
                        <span className={selectedRole ? "text-gray-900" : "text-gray-500"}>
                          {selectedRole ? (isCustomRole ? customRole : selectedRole) : "Select a role"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Content */}
                      {showRoleDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-hidden">
                          {/* Search Bar */}
                          <div className="p-3 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder="Search roles..."
                              value={roleSearch}
                              onChange={(e) => setRoleSearch(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                              autoFocus
                            />
                          </div>

                          {/* Roles List */}
                          <div className="max-h-48 overflow-y-auto">
                            {filteredRoles.length === 0 ? (
                              <div className="p-3 text-center text-gray-500 text-sm">
                                No roles found
                              </div>
                            ) : (
                              filteredRoles.map((role) => (
                                <button
                                  key={role.value}
                                  onClick={() => {
                                    handleRoleChange(role.value);
                                    setShowRoleDropdown(false);
                                  }}
                                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                                >
                                  <span className="font-medium text-gray-900">{role.label}</span>
                                  {role.isRecent && (
                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Recent</span>
                                  )}
                                </button>
                              ))
                            )}
                          </div>

                          {/* Custom Role Option */}
                          <button
                            onClick={() => {
                              handleRoleChange('custom');
                              setShowRoleDropdown(false);
                            }}
                            className="w-full p-3 text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-t border-gray-200"
                          >
                            <Plus className="w-4 h-4" />
                            Add Custom Role
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Custom Role Input */}
                    <AnimatePresence>
                      {isCustomRole && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3"
                        >
                          <input
                            type="text"
                            placeholder="Enter custom job role..."
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-900">Technical Skills</label>
                      <button
                        onClick={() => setShowSkillModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Skill
                      </button>
                    </div>

                    {localSkills.length === 0 ? (
                      <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 text-sm">No skills added yet</p>
                        <button
                          onClick={() => setShowSkillModal(true)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Add your first skill
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {localSkills.map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="flex items-center gap-4">
                              <span className="font-medium text-gray-900">{s.skill}</span>
                              <div className="flex gap-1">{renderStars(s.proficiency)}</div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditSkill(i)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleRemoveSkill(i)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Existing Interview Progress Section */}
            {isExistingInterview && interview?.status !== 'completed' && (
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Interview Progress</h2>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading interview details...</p>
                  </div>
                ) : !interview ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Unable to load interview details.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                        <span className="block text-sm text-gray-600 mb-1">Current Round</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {interview.currentRound || 1} of {interview.totalRounds || 3}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                        <span className="block text-sm text-gray-600 mb-1">Status</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          interview.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </span>
                      </div>
                      {getOverallScore() && (
                        <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                          <span className="block text-sm text-gray-600 mb-1">Overall Score</span>
                          <span className="text-2xl font-bold text-green-700">{getOverallScore()}/10</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Rounds Overview</h3>
                      <div className="space-y-3">
                        {interview.rounds?.map((round, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  round.status === 'completed'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {round.status === 'completed' ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </div>
                                <span className="font-semibold text-gray-900">
                                  Round {round.roundNumber}
                                </span>
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                round.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                              </span>
                            </div>
                            {round.status === 'completed' && (
                              <div className="text-sm text-gray-700 mb-2">
                                Score: <span className="font-semibold text-green-600">{getRoundScore(round)}/10</span>
                              </div>
                            )}
                            <div className="text-sm text-gray-600">
                              {round.questions?.length || 0} questions completed
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.section>
            )}

            {/* Media Settings Section */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Media Setup</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
                    {cameraActive && localMediaSettings.video ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-center">
                          <VideoOff className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Camera is off</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={toggleCamera}
                      className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                        cameraActive 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      } transition-colors`}
                    >
                      {cameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      {cameraActive ? 'Turn Off' : 'Turn On'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Camera</span>
                    </div>
                    <button
                      onClick={() => handleMediaToggle('video')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localMediaSettings.video ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localMediaSettings.video ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Mic className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Microphone</span>
                    </div>
                    <button
                      onClick={() => handleMediaToggle('audio')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localMediaSettings.audio ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localMediaSettings.audio ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <select
                        value={localMediaSettings.videoDeviceId || ''}
                        onChange={(e) => handleDeviceChange('video', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Default Camera</option>
                        {mediaDevices.video.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${mediaDevices.video.indexOf(device) + 1}`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={localMediaSettings.audioDeviceId || ''}
                        onChange={(e) => handleDeviceChange('audio', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Default Microphone</option>
                        {mediaDevices.audio.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${mediaDevices.audio.indexOf(device) + 1}`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {(!isExistingInterview || interview?.status !== 'completed') && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-600 rounded-xl p-6 text-white"
              >
                <h3 className="font-semibold text-lg mb-4">Ready to Start</h3>
                <p className="text-blue-100 text-sm mb-6">
                  {isExistingInterview ? 'Continue your interview preparation' : 'Begin your practice session'}
                </p>

                <button
                  onClick={() => handleStartInterview()}
                  disabled={isLoading || (!isExistingInterview && !selectedRole)}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-sm transition-all ${
                    isLoading || (!isExistingInterview && !selectedRole)
                      ? 'bg-blue-400 text-blue-200 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Preparing Session...
                    </div>
                  ) : isExistingInterview ? (
                    'Continue Interview'
                  ) : (
                    'Start Interview Session'
                  )}
                </button>

                <div className="mt-4 space-y-2 text-blue-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span>• Secure & private session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>• Real-time AI feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>• 30-45 minute session</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tips and Stats sections remain the same */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Preparation Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Ensure good lighting and clear audio quality</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Close unnecessary applications on your device</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Use a quiet environment with minimal background noise</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Have a glass of water nearby</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold text-gray-900">{userInterviews.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-semibold text-green-600">8.2/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-blue-600">94%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Skill Modal remains the same */}
      <AnimatePresence>
        {showSkillModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSkillModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-6 max-w-md w-full border border-gray-200 shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {editingSkillIndex !== null ? 'Edit Skill' : 'Add Skill'}
                </h3>
                <button 
                  onClick={() => setShowSkillModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                  <input
                    type="text"
                    placeholder="e.g., JavaScript, React, Node.js"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proficiency Level</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button 
                        key={level} 
                        onClick={() => setNewProficiency(level)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-8 h-8 ${
                          level <= newProficiency 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowSkillModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddOrEditSkill} 
                  disabled={!newSkillName.trim()}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {editingSkillIndex !== null ? 'Update Skill' : 'Add Skill'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreInterviewPage;