// components/PreInterviewPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserInterviewStore } from '../../store/interviewStore';
import { 
  startInterview, 
  getAllInterviews 
} from '../../services/interviewService';

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
            cacheInterview(response.interview);
          }
        } catch (error) {
          console.error('Error loading interview:', error);
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
  }, [interviewId, isExistingInterview]);

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
        
        const response = await startInterview({
          role: roleData.label,
          totalRounds: 3
        });
        
        interviewData = response.interview;
        setCurrentInterviewId(interviewData.interviewId);
        cacheInterview(interviewData);
      }

      // Pass to parent to start the actual interview
      onStartInterview(interviewData);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <motion.header 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {isExistingInterview ? 'Continue Interview' : 'Start New Interview'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isExistingInterview 
              ? 'Resume your technical interview session' 
              : 'Get ready for your technical assessment'
            }
          </p>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Camera & Controls */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-6">
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
                  <div className="text-center text-white p-8">
                    <div className="text-4xl mb-4">📹</div>
                    <p>Camera Preview</p>
                    <p className="text-sm text-gray-400 mt-2">Enable camera to see preview</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    localMediaSettings.video 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleMediaToggle('video')}
                >
                  {localMediaSettings.video ? '📹 Camera On' : '📷 Camera Off'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    localMediaSettings.audio 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleMediaToggle('audio')}
                >
                  {localMediaSettings.audio ? '🎤 Mic On' : '🔇 Mic Off'}
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
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Camera:</label>
                    <select
                      value={localMediaSettings.videoDeviceId || ''}
                      onChange={(e) => handleDeviceChange('video', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">Microphone:</label>
                    <select
                      value={localMediaSettings.audioDeviceId || ''}
                      onChange={(e) => handleDeviceChange('audio', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          className="bg-white rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="space-y-6">
            {/* Role Selection for New Interview */}
            <AnimatePresence>
              {!isExistingInterview && (
                <motion.div 
                  className="role-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Select Your Role</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableRoles.map((role) => (
                      <motion.div
                        key={role.value}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedRole === role.value 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleRoleSelect(role.value)}
                      >
                        <div className="text-2xl mb-2">{role.icon}</div>
                        <h3 className="font-semibold text-gray-800 mb-1">{role.label}</h3>
                        <p className="text-sm text-gray-600">
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
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Interview Progress</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <span className="block text-sm text-gray-600 mb-1">Current Round</span>
                      <span className="text-xl font-bold text-gray-800">
                        {interview.currentRound} of {interview.totalRounds || 3}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <span className="block text-sm text-gray-600 mb-1">Status</span>
                      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                        interview.status === 'active' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {interview.status}
                      </span>
                    </div>
                    {getOverallScore() && (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <span className="block text-sm text-gray-600 mb-1">Overall Score</span>
                        <span className="text-xl font-bold text-green-600">
                          {getOverallScore()}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rounds Overview - Data from backend */}
                  <div className="rounds-overview">
                    <h3 className="font-semibold text-gray-800 mb-3">Rounds</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {interview.rounds?.map((round, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800">
                              Round {round.roundNumber}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              round.status === 'completed' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-yellow-100 text-yellow-600'
                            }`}>
                              {round.status}
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
            <motion.div className="action-section pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  isLoading || (!isExistingInterview && !selectedRole)
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg'
                }`}
                onClick={handleStartInterview}
                disabled={isLoading || (!isExistingInterview && !selectedRole)}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Preparing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    {isExistingInterview ? 'Continue Interview' : 'Start Interview'}
                  </div>
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