import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Play, Pause, RotateCcw, 
  Volume2, VolumeX, CheckCircle, Circle, MessageSquare,
  Clock, Award, ChevronRight, ChevronDown, Video, 
  VideoOff, Settings, Maximize2
} from 'lucide-react';
import LiveInterview from '../components/InterviewRoom/LiveInterview';  // Adjust path if needed (e.g., '../components/LiveInterview')

export default function InterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [interviewStage, setInterviewStage] = useState('ready');
  const [responses, setResponses] = useState([]);
  const [originalQIndex, setOriginalQIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const questions = [
    "Tell me about yourself and your background.",
    "What are your greatest strengths?",
    "Describe a challenging project you worked on.",
    "Where do you see yourself in 5 years?",
    "Why do you want to work for this company?"
  ];

  useEffect(() => {
    // Signal to close sidebar when component mounts
    window.dispatchEvent(new CustomEvent('closeSidebar'));
  }, []);

  const handleUserResponse = async (transcript) => {
    if (!transcript || transcript.trim().length === 0) {
      return;
    }
    
    const newResponse = {
      id: Date.now(),
      transcript: transcript,
      question: currentQuestion,
      timestamp: new Date().toISOString()
    };
    
    setResponses(prev => [...prev, newResponse]);
    
    // Call LLM for follow-up question
    try {
      const response = await fetch('http://localhost:3001/api/v1/llm/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentQuestion: currentQuestion,
          userResponse: transcript
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data.followUpQuestion) {
        setCurrentQuestion(data.data.followUpQuestion);
        
        // TTS Logic for follow-up question (simulated)
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), 3000);
      } else {
        // Fallback to original question list if AI fails
        askNextQuestion();
      }
      
    } catch (error) {
      console.error('Error getting follow-up question:', error);
      // Fallback to original question list
      askNextQuestion();
    }
  };

  const handleStatusUpdate = (status) => {
    console.log('Interview status:', status);
  };

  const startInterview = () => {
    setInterviewStage('in-progress');
    askNextQuestion();
  };

  const askNextQuestion = () => {
    if (originalQIndex < questions.length) {
      const question = questions[originalQIndex];
      setCurrentQuestion(question);
      setOriginalQIndex(prev => prev + 1);
      
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 3000);
    } else {
      setInterviewStage('completed');
    }
  };

  const resetInterview = () => {
    setInterviewStage('ready');
    setCurrentQuestion('');
    setOriginalQIndex(0);
    setResponses([]);
    setIsMuted(false);
    setShowHistory(false);
    setVideoEnabled(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Sleek Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-50"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Interview Room</h1>
                <p className="text-xs text-gray-500">Practice with Veda AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100"
              >
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Question {originalQIndex}/{questions.length}
                </span>
              </motion.div>
              <motion.button
                onClick={resetInterview}
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200/50 rounded-full h-1 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-1"
                initial={{ width: 0 }}
                animate={{ width: `${(originalQIndex / questions.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Interviewer Panel - Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 space-y-4"
          >
            {/* AI Avatar Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* 3D Avatar */}
              <div className="relative p-8 bg-gradient-to-br from-slate-50 to-blue-50/50">
                <motion.div
                  className="relative aspect-square max-w-[280px] mx-auto"
                  animate={{
                    scale: isPlaying ? [1, 1.02, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isPlaying ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                >
                  <img 
                    src="/AI-avatar.png" 
                    alt="Veda AI Assistant"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                  
                  {/* Speaking Indicator */}
                  {isPlaying && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4"
                    >
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                        <motion.div
                          className="w-2 h-2 bg-white rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                        <span className="text-xs font-semibold">Speaking</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* AI Info */}
                <div className="text-center mt-4">
                  <h3 className="text-lg font-bold text-gray-900">Veda AI</h3>
                  <p className="text-sm text-gray-500">Senior Technical Interviewer</p>
                </div>
              </div>

              {/* Question Display */}
              {currentQuestion && (
                <div className="p-6 border-t border-gray-100">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" />
                      CURRENT QUESTION
                    </p>
                    <p className="text-base font-medium text-gray-800 leading-relaxed">
                      {currentQuestion}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Response History */}
            {responses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div 
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Response History</h3>
                      <p className="text-xs text-gray-500">{responses.length} responses recorded</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: showHistory ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="max-h-96 overflow-y-auto"
                    >
                      <div className="divide-y divide-gray-100">
                        {responses.slice().reverse().map((response, idx) => (
                          <motion.div
                            key={response.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-5 hover:bg-gray-50/50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-full">
                                Q{responses.length - idx}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 font-medium mb-2">
                              {response.question}
                            </p>
                            <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 p-3 rounded-lg border border-gray-200">
                              <p className="text-sm text-gray-800 leading-relaxed">
                                {response.transcript}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>

          {/* User Panel - Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-8"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full">
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Live Interview Session</h3>
                    <p className="text-xs text-gray-500">Powered by Veda AI</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Live Interview Component */}
              <div className="p-6">
                <LiveInterview 
                  currentQuestion={currentQuestion}
                  onUserResponse={handleUserResponse}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>

              {/* Start/Complete Controls */}
              <div className="p-6 border-t border-gray-100">
                <AnimatePresence mode="wait">
                  {interviewStage === 'ready' && (
                    <motion.button
                      key="start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={startInterview}
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                    >
                      <Play className="w-5 h-5 inline mr-2" />
                      Begin Interview Session
                    </motion.button>
                  )}

                  {interviewStage === 'completed' && (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-4"
                    >
                      <motion.div
                        className="w-16 h-16 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <CheckCircle className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Interview Complete!</h3>
                        <p className="text-sm text-gray-600 mt-1">Great job! Review your responses below.</p>
                      </div>
                      <motion.button
                        onClick={resetInterview}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        Start New Session
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}