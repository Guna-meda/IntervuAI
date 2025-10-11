import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Play, RotateCcw, 
  Volume2, VolumeX, CheckCircle, MessageSquare,
  Clock, Award, ChevronRight, ChevronDown, Video, 
  Settings, Brain, Target, BarChart3, User
} from 'lucide-react';
import LiveInterview from '../components/InterviewRoom/LiveInterview';
import { useUserInterviewStore } from '../store/interviewStore';
import { generateAnswerFeedback, completeRound, startInterview, generatePreparedQuestion } from '../services/interviewService';

export default function InterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [interviewStage, setInterviewStage] = useState('ready'); // ready, in-progress, completed
  const [responses, setResponses] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roundQuestions, setRoundQuestions] = useState([]);
  const [interviewData, setInterviewData] = useState({
    role: 'Frontend Developer',
    totalRounds: 3,
    interviewId: null
  });

  // Get data from store
  const { 
    currentInterviewId, 
    availableRoles,
    setCurrentInterviewId 
  } = useUserInterviewStore();

  useEffect(() => {
    // Close sidebar when component mounts
    window.dispatchEvent(new CustomEvent('closeSidebar'));
    
    // Initialize interview if not already set
    if (!currentInterviewId) {
      const newInterviewId = `interview_${Date.now()}`;
      setCurrentInterviewId(newInterviewId);
      setInterviewData(prev => ({ ...prev, interviewId: newInterviewId }));
    } else {
      setInterviewData(prev => ({ ...prev, interviewId: currentInterviewId }));
    }
  }, [currentInterviewId, setCurrentInterviewId]);

  const handleUserResponse = async (transcript) => {
    if (!transcript || transcript.trim().length === 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create response object
      const newResponse = {
        id: Date.now(),
        question: currentQuestion,
        answer: transcript,
        timestamp: new Date().toISOString(),
        score: 0,
        feedback: '',
        status: 'processing'
      };
      
      setResponses(prev => [...prev, newResponse]);
      
      // Call feedback API
      const feedbackData = await generateAnswerFeedback(
        currentQuestion,
        transcript,
        currentInterviewId,
        currentRound
      );
      
      // Update response with feedback
      setResponses(prev => 
        prev.map(response => 
          response.id === newResponse.id 
            ? { 
                ...response, 
                score: feedbackData.score || 7,
                feedback: feedbackData.feedback || 'Good response, could use more detail.',
                summary: feedbackData.summary || transcript.substring(0, 100) + '...',
                status: 'completed'
              }
            : response
        )
      );
      
      // Store question in round questions for completion
      const questionData = {
        question: currentQuestion,
        answer: transcript,
        score: feedbackData.score || 7,
        feedback: feedbackData.feedback,
        summary: feedbackData.summary,
        timestamp: new Date().toISOString()
      };
      
      setRoundQuestions(prev => [...prev, questionData]);
      
      // Generate follow-up question or move to next
      if (roundQuestions.length < 2) { // 2 questions per round (can adjust)
        await generateNextQuestion();
      } else {
        // Round complete
        await completeCurrentRound();
      }
      
    } catch (error) {
      console.error('Error processing response:', error);
      // Update response with error
      setResponses(prev => 
        prev.map(response => 
          response.id === Date.now() 
            ? { ...response, status: 'error', feedback: 'Failed to process response' }
            : response
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const generateNextQuestion = async () => {
    try {
      // Use the actual API to generate prepared question
      const response = await generatePreparedQuestion(currentInterviewId, currentRound);
      
      if (response.data && response.data.question) {
        setCurrentQuestion(response.data.question);
      } else {
        // Fallback questions if API fails
        const fallbackQuestions = [
          "Can you explain the Virtual DOM in React and how it improves performance?",
          "What are React hooks and when would you use useMemo vs useCallback?",
          "How do you handle state management in large React applications?",
          "What's the difference between controlled and uncontrolled components?",
          "How would you optimize a React application for better performance?"
        ];
        const nextQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
        setCurrentQuestion(nextQuestion);
      }
      
      // Simulate AI speaking
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
      
    } catch (error) {
      console.error('Error generating next question:', error);
      // Use fallback questions
      const fallbackQuestions = [
        "Can you explain the Virtual DOM in React and how it improves performance?",
        "What are React hooks and when would you use useMemo vs useCallback?",
        "How do you handle state management in large React applications?"
      ];
      const nextQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      setCurrentQuestion(nextQuestion);
      
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const completeCurrentRound = async () => {
    try {
      setLoading(true);
      
      // Calculate round feedback
      const roundScore = roundQuestions.reduce((sum, q) => sum + q.score, 0) / roundQuestions.length;
      const roundFeedback = `Round ${currentRound} completed with average score of ${roundScore.toFixed(1)}/10. ${roundScore >= 7 ? 'Excellent performance!' : 'Good technical knowledge demonstrated.'}`;
      
      // Call backend to complete round
      await completeRound(
        currentInterviewId, 
        currentRound, 
        roundQuestions, 
        roundFeedback
      );
      
      // Move to next round or complete interview
      if (currentRound < interviewData.totalRounds) {
        setCurrentRound(prev => prev + 1);
        setRoundQuestions([]);
        setCurrentQuestion('');
        await generateNextQuestion(); // Start next round with first question
      } else {
        setInterviewStage('completed');
      }
      
    } catch (error) {
      console.error('Error completing round:', error);
      // Continue with UI even if API call fails
      if (currentRound < interviewData.totalRounds) {
        setCurrentRound(prev => prev + 1);
        setRoundQuestions([]);
        setCurrentQuestion('');
        await generateNextQuestion();
      } else {
        setInterviewStage('completed');
      }
    } finally {
      setLoading(false);
    }
  };

  const startNewInterview = async () => {
    try {
      setLoading(true);
      
      const interviewDataToSend = {
        role: interviewData.role,
        totalRounds: interviewData.totalRounds,
        interviewId: currentInterviewId
      };
      
      // Start the interview via API
      const response = await startInterview(interviewDataToSend);
      
      if (response.interviewId) {
        setCurrentInterviewId(response.interviewId);
        setInterviewData(prev => ({ ...prev, interviewId: response.interviewId }));
      }
      
      setInterviewStage('in-progress');
      await generateNextQuestion(); // Generate first question
      
    } catch (error) {
      console.error('Error starting interview:', error);
      // Continue with UI even if API call fails
      setInterviewStage('in-progress');
      await generateNextQuestion();
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setInterviewStage('ready');
    setCurrentQuestion('');
    setCurrentRound(1);
    setResponses([]);
    setRoundQuestions([]);
    setIsMuted(false);
    setShowHistory(false);
    
    // Generate new interview ID
    const newInterviewId = `interview_${Date.now()}`;
    setCurrentInterviewId(newInterviewId);
    setInterviewData(prev => ({ ...prev, interviewId: newInterviewId }));
  };

  const getRoundProgress = () => {
    return Math.min((roundQuestions.length / 2) * 100, 100); // 2 questions per round
  };

  const getOverallProgress = () => {
    const roundsCompleted = currentRound - 1;
    const currentRoundProgress = roundQuestions.length / 2;
    const totalProgress = (roundsCompleted + currentRoundProgress) / interviewData.totalRounds;
    return Math.round(totalProgress * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
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
                  <Brain className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">AI Interview Room</h1>
                <p className="text-xs text-gray-500">Real-time practice with instant feedback</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Interview Info */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{interviewData.role}</p>
                  <p className="text-xs text-gray-500">Round {currentRound} of {interviewData.totalRounds}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>

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

          {/* Progress Bars */}
          <div className="mt-3 space-y-2">
            {/* Overall Progress */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Overall Progress</span>
              <span>{getOverallProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2"
                initial={{ width: 0 }}
                animate={{ width: `${getOverallProgress()}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            
            {/* Round Progress */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Round {currentRound} Progress</span>
              <span>{roundQuestions.length}/2 questions</span>
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-1 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-1"
                initial={{ width: 0 }}
                animate={{ width: `${getRoundProgress()}%` }}
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
              <div className="relative p-6 bg-gradient-to-br from-slate-50 to-blue-50/50">
                <motion.div
                  className="relative aspect-square max-w-[240px] mx-auto"
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
                      className="absolute top-3 right-3"
                    >
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full shadow-lg text-xs">
                        <motion.div
                          className="w-1.5 h-1.5 bg-white rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                        <span className="font-semibold">Speaking</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* AI Info */}
                <div className="text-center mt-4">
                  <h3 className="text-lg font-bold text-gray-900">Veda AI</h3>
                  <p className="text-sm text-gray-500">Senior Technical Interviewer</p>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      {interviewData.role}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <BarChart3 className="w-3 h-3" />
                      Round {currentRound}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Question */}
              {currentQuestion && (
                <div className="p-5 border-t border-gray-100">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" />
                      CURRENT QUESTION
                    </p>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">
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
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Response History</h3>
                      <p className="text-xs text-gray-500">{responses.length} responses</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: showHistory ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="max-h-80 overflow-y-auto"
                    >
                      <div className="divide-y divide-gray-100">
                        {responses.slice().reverse().map((response, idx) => (
                          <motion.div
                            key={response.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 hover:bg-gray-50/50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-full">
                                Q{responses.length - idx}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  response.status === 'completed' ? 'bg-green-500' : 
                                  response.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                                <span className="text-xs text-gray-500">
                                  {response.score}/10
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-700 font-medium mb-2 line-clamp-2">
                              {response.question}
                            </p>
                            <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 p-2 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-800 leading-relaxed line-clamp-3">
                                {response.answer}
                              </p>
                            </div>
                            {response.feedback && (
                              <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-xs text-yellow-800 line-clamp-2">
                                  {response.feedback}
                                </p>
                              </div>
                            )}
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
                    <p className="text-xs text-gray-500">
                      {interviewData.role} • Round {currentRound} • {roundQuestions.length}/2 Questions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <Settings className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Live Interview Component */}
              <div className="p-6">
                <LiveInterview 
                  currentQuestion={currentQuestion}
                  onUserResponse={handleUserResponse}
                  onStatusUpdate={(status) => console.log('Interview status:', status)}
                  disabled={interviewStage !== 'in-progress' || loading}
                />
                
                {/* Loading State */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                      Processing your response...
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Controls */}
              <div className="p-6 border-t border-gray-100">
                <AnimatePresence mode="wait">
                  {interviewStage === 'ready' && (
                    <motion.button
                      key="start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onClick={startNewInterview}
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4 inline mr-2" />
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
                        <p className="text-sm text-gray-600 mt-1">
                          You've completed all {interviewData.totalRounds} rounds. Great work!
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          onClick={resetInterview}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          New Session
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                        >
                          View Report
                        </motion.button>
                      </div>
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