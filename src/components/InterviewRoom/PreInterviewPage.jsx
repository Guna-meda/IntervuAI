import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserInterviewStore } from '../../store/interviewStore';
import { startInterview, getAllInterviews, getInterviewDetails } from '../../services/interviewService';
import { auth } from '../../firebase/config';
import { 
  Rocket, Video, Mic, Settings, Play, Clock, Award, 
  Zap, Sparkles, Target, Users, Brain, Crown, Star,
  ChevronRight, CheckCircle2, Circle, ArrowRight, Camera,
  MicOff, VideoOff, Wifi, Shield, Calendar
} from 'lucide-react';

const PreInterviewPage = ({ interviewId, onStartInterview }) => {
  const { mediaSettings, setMediaSettings, availableRoles, setCurrentInterviewId } =
    useUserInterviewStore();

  const [selectedRole, setSelectedRole] = useState('');
  const [localMediaSettings, setLocalMediaSettings] = useState(mediaSettings);
  const [mediaDevices, setMediaDevices] = useState({ video: [], audio: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [interview, setInterview] = useState(null);
  const [userInterviews, setUserInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState('setup');
  const [cameraActive, setCameraActive] = useState(true);
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
          const response = await getInterviewDetails(interviewIdFromState);
          setInterview(response.interview);
          setSelectedRole(response.interview.role.toLowerCase().replace(' ', ''));
          setCurrentInterviewId(interviewIdFromState);
        } catch (error) {
          console.error('Error loading interview:', error);
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
      setMediaSettings(localMediaSettings);
      let interviewData;

      if (isExistingInterview) {
        interviewData = interview;
        setCurrentInterviewId(interview.interviewId);
      } else {
        const roleData = availableRoles.find((r) => r.value === selectedRole);
        if (!roleData) {
          throw new Error('Selected role not found');
        }

        const response = await startInterview({
          role: roleData.label,
          totalRounds: 3,
        });

        interviewData = response.interview;
        setCurrentInterviewId(interviewData.interviewId);
      }

      if (typeof onStartInterview === 'function') {
        onStartInterview(interviewData);
      }

      navigate('/interviewPage', { state: { interviewId: interviewData.interviewId } });
    } catch (error) {
      console.error('Error starting interview:', error);
      alert(`Failed to start interview: ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoundScore = (round) => {
    if (!round.questions || round.questions.length === 0) return null;
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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };

  const handleViewReport = () => {
    navigate('/view-report', { state: { interviewId: interview.interviewId } });
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
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <motion.header
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-2xl px-4 py-2 border border-cyan-200/50 shadow-xs mb-4"
          >
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-cyan-700 text-sm font-medium">
              {isExistingInterview ? 'Resume Your Journey' : 'AI Interview Coach Ready'}
            </span>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4"
          >
            {isExistingInterview ? 'Continue Interview' : 'Launch Interview Session'}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-slate-600 text-lg max-w-2xl mx-auto"
          >
            {isExistingInterview
              ? 'Pick up where you left off and continue your path to mastery'
              : 'Get ready to ace your next interview with AI-powered practice'}
          </motion.p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Completed Interview Section */}
            {isExistingInterview && interview?.status === 'completed' && (
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200/60 shadow-xs text-center"
              >
                <motion.div
                  variants={itemVariants}
                  className="w-12 h-12 mx-auto bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </motion.div>
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl font-bold text-emerald-800 mb-2"
                >
                  Yayy, Completed!
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  className="text-slate-600 text-sm mb-4"
                >
                  You've successfully completed your interview for {interview.role}.
                </motion.p>
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewReport}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                >
                  View Report
                </motion.button>
              </motion.section>
            )}

            {/* Role Selection */}
            {!isExistingInterview && (
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-100 rounded-xl">
                    <Target className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h2 className="font-semibold text-slate-900 text-xl">Choose Your Role</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRoles.map((role, roleIdx) => (
                    <motion.div
                      key={role.value}
                      variants={itemVariants}
                      custom={roleIdx}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all group ${
                        selectedRole === role.value
                          ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-cyan-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleRoleSelect(role.value)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          selectedRole === role.value 
                            ? 'bg-cyan-500 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className="text-sm">{role.icon}</span>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-lg">{role.label}</h3>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {role.value === 'frontend' && 'React, Vue, Angular, UI/UX, JavaScript, CSS'}
                        {role.value === 'backend' && 'Node.js, Python, APIs, Databases, System Design'}
                        {role.value === 'fullstack' && 'End-to-end development, Full technology stack'}
                        {role.value === 'app' && 'iOS, Android, React Native, Mobile Development'}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-slate-500">3 rounds • 45 mins</span>
                        {selectedRole === role.value && (
                          <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Interview Progress */}
            {isExistingInterview && interview && interview.status !== 'completed' && (
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="font-semibold text-slate-900 text-xl">Interview Progress</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl text-center">
                    <span className="block text-sm text-slate-600 mb-1">Current Round</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {interview?.currentRound ?? '—'} of {interview?.totalRounds || 3}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl text-center">
                    <span className="block text-sm text-slate-600 mb-1">Status</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      interview.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-cyan-100 text-cyan-700'
                    }`}>
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </span>
                  </div>
                  {getOverallScore() && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl text-center">
                      <span className="block text-sm text-slate-600 mb-1">Overall Score</span>
                      <span className="text-2xl font-bold text-emerald-700">{getOverallScore()}/10</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 text-lg">Rounds Overview</h3>
                  {interview.rounds?.map((round, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gradient-to-r from-slate-50 to-blue-50/30 p-4 rounded-xl border border-slate-200/40"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            round.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-cyan-100 text-cyan-600'
                          }`}>
                            {round.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </div>
                          <span className="font-semibold text-slate-900">
                            Round {round.roundNumber}
                          </span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          round.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                        </span>
                      </div>
                      {round.status === 'completed' && (
                        <div className="text-sm text-slate-700 mb-2">
                          Score: <span className="font-semibold text-emerald-600">{getRoundScore(round)}/10</span>
                        </div>
                      )}
                      <div className="text-sm text-slate-600">
                        {round.questions?.length || 0} questions completed
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Media Setup */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Video className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="font-semibold text-slate-900 text-xl">Media Setup</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Camera Preview */}
                <div className="space-y-4">
                  <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                    {cameraActive && localMediaSettings.video ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">Camera is off</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleCamera}
                        className={`p-2 rounded-lg backdrop-blur-sm ${
                          cameraActive ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Media Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/40">
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">Camera</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMediaToggle('video')}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        localMediaSettings.video ? 'bg-cyan-500' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div
                        className={`w-4 h-4 bg-white rounded-full m-1 ${
                          localMediaSettings.video ? 'translate-x-6' : 'translate-x-0'
                        }`}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/40">
                    <div className="flex items-center gap-3">
                      <Mic className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">Microphone</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMediaToggle('audio')}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        localMediaSettings.audio ? 'bg-cyan-500' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div
                        className={`w-4 h-4 bg-white rounded-full m-1 ${
                          localMediaSettings.audio ? 'translate-x-6' : 'translate-x-0'
                        }`}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    </motion.button>
                  </div>

                  {/* Device Selection */}
                  <div className="space-y-3">
                    <select
                      value={localMediaSettings.videoDeviceId || ''}
                      onChange={(e) => handleDeviceChange('video', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200/40 bg-white/50 backdrop-blur-sm text-slate-900 text-sm"
                    >
                      <option value="">Default Camera</option>
                      {mediaDevices.video.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${mediaDevices.video.indexOf(device) + 1}`}
                        </option>
                      ))}
                    </select>

                    <select
                      value={localMediaSettings.audioDeviceId || ''}
                      onChange={(e) => handleDeviceChange('audio', e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200/40 bg-white/50 backdrop-blur-sm text-slate-900 text-sm"
                    >
                      <option value="">Default Microphone</option>
                      {mediaDevices.audio.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${mediaDevices.audio.indexOf(device) + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start Button Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Ready to Launch</h3>
                    <p className="text-cyan-100 text-sm opacity-90">
                      {isExistingInterview ? 'Continue your journey' : 'Start new session'}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartInterview}
                  disabled={isLoading || (!isExistingInterview && !selectedRole)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    isLoading || (!isExistingInterview && !selectedRole)
                      ? 'bg-white/30 text-white/70 cursor-not-allowed'
                      : 'bg-white text-cyan-600 hover:shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                      Preparing Session...
                    </>
                  ) : isExistingInterview ? (
                    <>
                      <Play className="w-4 h-4" />
                      Continue Interview
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Launch Interview
                    </>
                  )}
                </motion.button>

                <div className="mt-4 space-y-2 text-cyan-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    <span>Secure & Private</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3 h-3" />
                    <span>Real-time AI Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>45 min session</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Pro Tips</h3>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Ensure good lighting and clear audio</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Close unnecessary applications</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Have a glass of water nearby</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Take deep breaths and relax</span>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-cyan-200/40 shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Your Stats</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Sessions</span>
                  <span className="font-semibold text-slate-900">{userInterviews.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Success Rate</span>
                  <span className="font-semibold text-emerald-600">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Current Level</span>
                  <span className="font-semibold text-amber-600">Expert</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreInterviewPage;