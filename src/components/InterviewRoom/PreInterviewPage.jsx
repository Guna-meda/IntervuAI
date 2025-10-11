// components/PreInterviewPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserInterviewStore } from '../../store/interviewStore';
import { 
  startInterview, 
  getAllInterviews,
  getInterviewDetails 
} from '../../services/interviewService';
import { auth } from '../../firebase/config'; // Import Firebase auth for user check

const PreInterviewPage = ({ interviewId, onStartInterview }) => {
  const {
    mediaSettings,
    setMediaSettings,
    availableRoles,
    setCurrentInterviewId,
    cacheInterview,
    getCachedInterview
  } = useUserInterviewStore();
  
  const [selectedRole, setSelectedRole] = useState('');
  const [localMediaSettings, setLocalMediaSettings] = useState(mediaSettings);
  const [mediaDevices, setMediaDevices] = useState({ video: [], audio: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [interview, setInterview] = useState(null);
  const [userInterviews, setUserInterviews] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const isExistingInterview = !!interviewId;
  const navigate = useNavigate();

  // Load interview data from backend
  useEffect(() => {
    const loadInterviewData = async () => {
      if (isExistingInterview) {
        try {
          // Try cache first
          const cached = getCachedInterview(interviewId);
          if (cached) {
            setInterview(cached);
          } else {
            // Fetch from backend
            const response = await getInterviewDetails(interviewId);
            setInterview(response.interview);
            try {
              cacheInterview(response.interview);
            } catch (cacheError) {
              console.error('Error caching interview:', cacheError);
            }
          }
        } catch (error) {
          console.error('Error loading interview:', error);
          alert(`Failed to load interview: ${error.message || 'Please try again.'}`);
        }
      }
      
      // Load user's interview history
      try {
        const response = await getAllInterviews();
        setUserInterviews(response.interviews || []);
      } catch (error) {
        console.error('Error loading interviews:', error);
      }
    };

    loadInterviewData();
  }, [interviewId, isExistingInterview, getCachedInterview, cacheInterview]);

  // Camera setup
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        setMediaDevices({
          video: videoDevices,
          audio: audioDevices
        });
      } catch (error) {
        console.error('Error loading media devices:', error);
      }
    };
    
    loadDevices();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (localMediaSettings.video || localMediaSettings.audio) {
        try {
          const constraints = {
            video: localMediaSettings.video ? { 
              deviceId: localMediaSettings.videoDeviceId ? { exact: localMediaSettings.videoDeviceId } : undefined 
            } : false,
            audio: localMediaSettings.audio ? {
              deviceId: localMediaSettings.audioDeviceId ? { exact: localMediaSettings.audioDeviceId } : undefined
            } : false
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [localMediaSettings]);

  const handleStartInterview = async () => {
    if (!auth.currentUser) {
      alert('Please log in to start an interview');
      return;
    }

    if (!isExistingInterview && !selectedRole) {
      alert('Please select a role to continue');
      return;
    }

    setIsLoading(true);
    
    try {
      // Save media settings to store
      setMediaSettings(localMediaSettings);

      let interviewData;
      
      if (isExistingInterview) {
        // Use existing interview data (already loaded from backend)
        interviewData = interview;
        setCurrentInterviewId(interview.interviewId);
      } else {
        // Start NEW interview - call backend API
        const roleData = availableRoles.find(r => r.value === selectedRole);
        if (!roleData) {
          throw new Error('Selected role not found');
        }
        
        const response = await startInterview({
          role: roleData.label,
          totalRounds: 3
          // Note: Do NOT send interviewId for new interviews; let backend generate it
        });
        
        interviewData = response.interview;
        setCurrentInterviewId(interviewData.interviewId);
        try {
          cacheInterview(interviewData);
        } catch (cacheError) {
          console.error('Error caching interview:', cacheError);
          // Continue despite cache error to avoid blocking the user
        }
      }

      // Pass to parent to start the actual interview
      if (typeof onStartInterview === 'function') {
        onStartInterview(interviewData);
      }

      // Navigate to the InterviewPage
      navigate('/interviewPage');
    } catch (error) {
      console.error('Error starting interview:', error);
      alert(`Failed to start interview: ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for displaying data
  const getRoundScore = (round) => {
    if (!round.questions || round.questions.length === 0) return null;
    const avgScore = round.questions.reduce((sum, q) => sum + (q.score || 0), 0) / round.questions.length;
    return Math.round(avgScore * 10) / 10;
  };

  const getOverallScore = () => {
    if (!interview?.rounds) return null;
    const completedRounds = interview.rounds.filter(round => round.status === 'completed');
    if (completedRounds.length === 0) return null;
    
    const totalScore = completedRounds.reduce((sum, round) => {
      const roundScore = getRoundScore(round);
      return sum + (roundScore || 0);
    }, 0);
    
    return Math.round((totalScore / completedRounds.length) * 10) / 10;
  };

  // Media control handlers
  const handleMediaToggle = (type) => {
    setLocalMediaSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleDeviceChange = (type, deviceId) => {
    setLocalMediaSettings(prev => ({
      ...prev,
      [`${type}DeviceId`]: deviceId
    }));
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 lg:p-12">
      {/* Header */}
      <motion.header 
        className="mb-8 md:mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
            {isExistingInterview ? 'Continue Interview' : 'Start New Interview'}
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            {isExistingInterview 
              ? 'Resume your technical interview session' 
              : 'Get ready for your technical assessment'
            }
          </p>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        {/* Left Panel - Camera & Controls */}
        <motion.div 
          className="bg-white rounded-2xl shadow-md p-6 md:p-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="space-y-6 md:space-y-8">
            <div className="camera-container">
              <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                {(localMediaSettings.video || localMediaSettings.audio) ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white p-6 md:p-8">
                    <p className="text-lg md:text-xl font-medium mb-2">Camera Preview</p>
                    <p className="text-sm text-gray-400">Enable camera to see preview</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`py-3 px-4 rounded-lg font-medium text-sm md:text-base transition-colors ${
                    localMediaSettings.video 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleMediaToggle('video')}
                >
                  {localMediaSettings.video ? 'Camera On' : 'Camera Off'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`py-3 px-4 rounded-lg font-medium text-sm md:text-base transition-colors ${
                    localMediaSettings.audio 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleMediaToggle('audio')}
                >
                  {localMediaSettings.audio ? 'Mic On' : 'Mic Off'}
                </motion.button>
              </div>

              {/* Device selectors */}
              <AnimatePresence>
                {localMediaSettings.video && mediaDevices.video.length > 1 && (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Camera</label>
                    <select
                      value={localMediaSettings.videoDeviceId || ''}
                      onChange={(e) => handleDeviceChange('video', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {mediaDevices.video.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${mediaDevices.video.indexOf(device) + 1}`}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {localMediaSettings.audio && mediaDevices.audio.length > 1 && (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Microphone</label>
                    <select
                      value={localMediaSettings.audioDeviceId || ''}
                      onChange={(e) => handleDeviceChange('audio', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {mediaDevices.audio.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Mic ${mediaDevices.audio.indexOf(device) + 1}`}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Uses data from backend APIs */}
        <motion.div 
          className="bg-white rounded-2xl shadow-md p-6 md:p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        >
          <div className="space-y-6 md:space-y-8">
            {/* Role Selection for New Interview */}
            <AnimatePresence>
              {!isExistingInterview && (
                <motion.div 
                  className="role-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">Select Your Role</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableRoles.map((role, roleIdx) => (
                      <motion.div
                        key={role.value ?? `role-${roleIdx}`}
                        whileHover={{ scale: 1.02, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 md:p-5 rounded-xl border cursor-pointer transition-all ${
                          selectedRole === role.value 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleRoleSelect(role.value)}
                      >
                        <h3 className="font-semibold text-gray-900 mb-1 text-base md:text-lg">{role.label}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {role.value === 'frontend' && 'React, Vue, Angular, UI/UX'}
                          {role.value === 'backend' && 'Node.js, Python, APIs, Databases'}
                          {role.value === 'fullstack' && 'End-to-end development'}
                          {role.value === 'app' && 'iOS, Android, React Native'}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interview Progress for Existing Interview - Data from backend */}
            <AnimatePresence>
              {isExistingInterview && interview && (
                <motion.div 
                  className="interview-progress"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">Interview Progress</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <span className="block text-sm text-gray-600 mb-1">Current Round</span>
                      <span className="text-xl font-bold text-gray-900">
                        {interview.currentRound} of {interview.totalRounds || 3}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <span className="block text-sm text-gray-600 mb-1">Status</span>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        interview.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                    </div>
                    {getOverallScore() && (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <span className="block text-sm text-gray-600 mb-1">Overall Score</span>
                        <span className="text-xl font-bold text-green-700">
                          {getOverallScore()}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rounds Overview - Data from backend */}
                  <div className="rounds-overview">
                    <h3 className="font-semibold text-gray-900 mb-3 text-base md:text-lg tracking-tight">Rounds Overview</h3>
                    <div className="space-y-3">
                      {interview.rounds?.map((round, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.01, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900 text-sm md:text-base">
                              Round {round.roundNumber}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              round.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                            </span>
                          </div>
                          {round.status === 'completed' && (
                            <div className="text-sm text-gray-700 mb-1">
                              Score: {getRoundScore(round)}/10
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            {round.questions?.length || 0} questions
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start Button */}
            <motion.div className="action-section pt-4 md:pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 px-6 rounded-xl font-medium text-base md:text-lg transition-all ${
                  isLoading || (!isExistingInterview && !selectedRole)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md'
                }`}
                onClick={handleStartInterview}
                disabled={isLoading || (!isExistingInterview && !selectedRole)}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Preparing...
                  </div>
                ) : (
                  isExistingInterview ? 'Continue Interview' : 'Start Interview'
                )}
              </motion.button>
              
              <p className="text-center text-gray-600 mt-3 text-sm">
                {isExistingInterview 
                  ? 'Continue from where you left off' 
                  : 'You will have 3 rounds of technical questions'
                }
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PreInterviewPage;