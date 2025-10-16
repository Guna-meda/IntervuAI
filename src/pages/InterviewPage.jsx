import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Play, RotateCcw, 
  Volume2, VolumeX, CheckCircle, MessageSquare,
  Clock, Award, ChevronRight, ChevronDown, Video, 
  Settings, Brain, Target, BarChart3, User,
  Mic, MicOff, Star, Zap, Crown, Trash2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import LiveInterview from '../components/InterviewRoom/LiveInterview';
import { useUserInterviewStore } from '../store/interviewStore';
import { generateAnswerFeedback, completeRound, startRound, generatePreparedQuestion, generateContextualFollowUp, getInterviewDetails, cancelInterview, deleteInterview } from '../services/interviewService';

export default function InterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [interviewStage, setInterviewStage] = useState('ready');
  const [responses, setResponses] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roundQuestions, setRoundQuestions] = useState([]);
  const [showRoundComplete, setShowRoundComplete] = useState(false);
  const [currentQuestionType, setCurrentQuestionType] = useState('prepared');
  const [interviewData, setInterviewData] = useState({
    role: 'Frontend Developer',
    totalRounds: 3,
    interviewId: null
  });
  const [fullInterview, setFullInterview] = useState(null);

  const { 
    currentInterviewId, 
    availableRoles,
    setCurrentInterviewId 
  } = useUserInterviewStore();

  const navigate = useNavigate();
  const location = useLocation();
  const isNew = location.state?.isNew || false;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('closeSidebar'));
    
    if (!currentInterviewId) {
      const newInterviewId = `interview_${Date.now()}`;
      setCurrentInterviewId(newInterviewId);
      setInterviewData(prev => ({ ...prev, interviewId: newInterviewId }));
    } else {
      setInterviewData(prev => ({ ...prev, interviewId: currentInterviewId }));
    }
  }, [currentInterviewId, setCurrentInterviewId]);

  useEffect(() => {
    if (interviewData.interviewId) {
      const loadInterview = async () => {
        try {
          const response = await getInterviewDetails(interviewData.interviewId);
          const data = response.interview;
          if (data) {
            setFullInterview(data);
            setCurrentRound(data.currentRound);
            const currentRoundIndex = data.currentRound - 1;
            const currentRoundData = data.rounds[currentRoundIndex] || { questions: [], status: 'not_started' };
            setRoundQuestions(currentRoundData.questions || []);
            setResponses((currentRoundData.questions || []).map((q, index) => ({
              id: Date.now() + index,
              question: q.question,
              answer: q.answer,
              timestamp: q.answeredAt || new Date().toISOString(),
              score: q.score || 0,
              feedback: q.feedback || '',
              expectedAnswer: q.expectedAnswer || '',
              summary: q.feedback ? q.feedback.substring(0, 100) + '...' : '',
              status: 'completed',
              questionType: q.questionType || 'prepared'
            })));
            setInterviewStage(data.status === 'active' || isNew ? 'ready' : data.status);
            if (currentRoundData.status === 'in_progress' && !isNew) {
              setInterviewStage('active');
              if ((currentRoundData.questions || []).length < 6) {
                await generateNextQuestion();
              } else {
                setShowRoundComplete(true);
              }
            } else if (isNew) {
              setInterviewStage('ready');
              setResponses([]);
              setRoundQuestions([]);
              setCurrentQuestion('');
              setShowRoundComplete(false);
            }
          }
        } catch (error) {
          console.error('Error loading interview:', error);
        }
      };
      loadInterview();
    }
  }, [interviewData.interviewId, isNew]);

  const generateNextQuestion = async () => {
    try {
      const previousQuestions = roundQuestions.map(q => ({
        question: q.question,
        answer: q.answer,
        feedback: q.feedback,
        score: q.score
      }));
      const response = await generatePreparedQuestion(currentInterviewId, currentRound, previousQuestions);
      
      if (response?.data?.question) {
        console.log('Prepared question generated:', response.data.question);
        setCurrentQuestion(response.data.question);
        setCurrentQuestionType('prepared');
      } else {
        console.warn('No prepared question received, using fallback');
        const fallbackQuestions = [
          "Can you explain how the Virtual DOM works in React and its performance benefits?",
          "What are the key differences between useMemo and useCallback in React?",
          "How do you manage state in a large-scale React application?",
          "What is the difference between controlled and uncontrolled components in React?",
          "How would you optimize a React application's rendering performance?"
        ];
        const nextQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
        setCurrentQuestion(nextQuestion);
        setCurrentQuestionType('prepared');
      }
      
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    } catch (error) {
      console.error('Error generating next question:', error);
      const fallbackQuestions = [
        "Can you explain how the Virtual DOM works in React and its performance benefits?",
        "What are the key differences between useMemo and useCallback in React?",
        "How do you manage state in a large-scale React application?"
      ];
      const nextQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      setCurrentQuestion(nextQuestion);
      setCurrentQuestionType('prepared');
      
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const handleUserResponse = async (transcript) => {
    if (!transcript || transcript.trim().length === 0) {
      console.warn('Empty or invalid transcript received');
      return;
    }
    
    setLoading(true);
    
    try {
      const isNonInformative = transcript.trim().toLowerCase() === "i don't know" || 
                             transcript.trim().toLowerCase() === "i dont know" ||
                             transcript.trim().length < 10;
      
      const newResponse = {
        id: Date.now(),
        question: currentQuestion,
        answer: transcript,
        timestamp: new Date().toISOString(),
        score: 0,
        feedback: '',
        expectedAnswer: '',
        status: 'processing',
        questionType: currentQuestionType
      };
      
      setResponses(prev => [...prev, newResponse]);
      
      const feedbackData = await generateAnswerFeedback(
        currentQuestion,
        transcript,
        currentInterviewId,
        currentRound
      );
      
      setResponses(prev => 
        prev.map(response => 
          response.id === newResponse.id 
            ? { 
                ...response, 
                score: feedbackData.score || (isNonInformative ? 2 : 7),
                feedback: feedbackData.feedback || (isNonInformative ? 'Please provide a more detailed response or clarify if you need help.' : 'Good response, could use more detail.'),
                expectedAnswer: feedbackData.expectedAnswer || 'A complete response addressing the question.',
                summary: feedbackData.summary || transcript.substring(0, 100) + '...',
                status: 'completed'
              }
            : response
        )
      );
      
      const questionData = {
        question: currentQuestion,
        answer: transcript,
        score: feedbackData.score || (isNonInformative ? 2 : 7),
        feedback: feedbackData.feedback,
        expectedAnswer: feedbackData.expectedAnswer || 'A complete response addressing the question.',
        summary: feedbackData.summary,
        timestamp: new Date().toISOString(),
        questionType: currentQuestionType
      };

      const newRoundQuestions = [...roundQuestions, questionData];
      setRoundQuestions(newRoundQuestions);

      if (newRoundQuestions.length >= 6) {
        console.log('Round question limit reached, completing round', currentRound);
        await completeCurrentRound();
        return;
      }

      if (feedbackData.needsFollowUp && !isNonInformative) {
        try {
          const previousQuestions = roundQuestions.map(q => ({  
            question: q.question,
            answer: q.answer,
            feedback: q.feedback
          }));
          console.log('Generating follow-up question with data:', {
            interviewId: currentInterviewId,
            roundNumber: currentRound,
            currentQuestion,
            userResponse: transcript,
            previousQuestions,
            feedbackData,
            followUpType: feedbackData.followUpType
          });
          
          const followUpResponse = await generateContextualFollowUp(
            currentInterviewId,
            currentRound,
            currentQuestion,
            transcript,
            previousQuestions,
            feedbackData,
            feedbackData.followUpType
          );

          if (followUpResponse?.data?.question) {
            console.log('Follow-up question generated:', followUpResponse.data.question);
            setCurrentQuestion(followUpResponse.data.question);
            setCurrentQuestionType('followup');
            setIsPlaying(true);
            setTimeout(() => setIsPlaying(false), 2000);
          } else {
            console.warn('No follow-up question received, generating next prepared question');
            await generateNextQuestion();
          }
        } catch (error) {
          console.error('Error generating follow-up question:', error);
          await generateNextQuestion();
        }
      } else {
        console.log('No follow-up needed or non-informative response, generating next prepared question');
        await generateNextQuestion();
      }
    } catch (error) {
      console.error('Error processing response:', error);
      setResponses(prev =>
        prev.map(response =>
          response.id === newResponse.id
            ? { 
                ...response, 
                status: 'error', 
                feedback: 'Error processing response',
                expectedAnswer: 'A complete response addressing the question.'
              }
            : response
        )
      );
      console.log('Recovering from error by generating next question');
      await generateNextQuestion();
    } finally {
      setLoading(false);
    }
  };

  const completeCurrentRound = async () => {
    try {
      setLoading(true);
      
      const roundScore = roundQuestions.reduce((sum, q) => sum + q.score, 0) / Math.max(roundQuestions.length, 1);
      const roundFeedback = `Round ${currentRound} completed with average score of ${roundScore.toFixed(1)}/10. ${roundScore >= 7 ? 'Excellent performance!' : 'Good technical knowledge demonstrated.'}`;
      
      const response = await completeRound(
        currentInterviewId, 
        currentRound, 
        roundQuestions, 
        roundFeedback
      );
      
      setFullInterview(response.interview);
      setCurrentRound(response.interview.currentRound);
      
      if (currentRound < interviewData.totalRounds) {
        setShowRoundComplete(true);
      } else {
        setInterviewStage('completed');
      }
    } catch (error) {
      console.error('Error completing round:', error);
      if (currentRound < interviewData.totalRounds) {
        setShowRoundComplete(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const startNewInterview = async () => {
    try {
      setLoading(true);

      if (fullInterview && fullInterview.status === 'active') {
        const currentRoundIndex = currentRound - 1;
        let currentRoundData = fullInterview.rounds[currentRoundIndex];
        if (currentRoundData.status === 'not_started') {
          await startRound(interviewData.interviewId, currentRound);
          currentRoundData = { ...currentRoundData, status: 'in_progress', startedAt: new Date() };
          const updatedRounds = [...fullInterview.rounds];
          updatedRounds[currentRoundIndex] = currentRoundData;
          setFullInterview({ ...fullInterview, rounds: updatedRounds });
        }
        setInterviewStage('active');
        if (roundQuestions.length < 6) {
          await generateNextQuestion();
        } else {
          setShowRoundComplete(true);
        }
      } else {
        setInterviewStage('active');
        await generateNextQuestion();
      }
    } catch (error) {
      console.error('Error starting/resuming interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueRound = async () => {
    setShowRoundComplete(false);
    setRoundQuestions([]);
    setResponses([]);
    setCurrentQuestionType('prepared');
    setCurrentQuestion('');
    await startRound(interviewData.interviewId, currentRound);
    await generateNextQuestion();
  };

  const handleEndInterview = async () => {
    try {
      await cancelInterview(interviewData.interviewId);
      setFullInterview({ ...fullInterview, status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling interview:', error);
    }
    setShowRoundComplete(false);
    setInterviewStage('completed');
  };

  const handleDeleteInterview = async () => {
    if (window.confirm('Are you sure you want to delete this interview? This action cannot be undone.')) {
      try {
        await deleteInterview(interviewData.interviewId);
        navigate('/pre-interview');
      } catch (error) {
        console.error('Error deleting interview:', error);
        alert('Failed to delete interview. Please try again.');
      }
    }
  };

  const handleViewReport = () => {
    navigate('/view-report', { state: { interviewId: interviewData.interviewId } });
  };

  const resetInterview = () => {
    setCurrentInterviewId(null);
    setFullInterview(null);
    setInterviewData({
      role: 'Frontend Developer',
      totalRounds: 3,
      interviewId: null
    });
    setResponses([]);
    setRoundQuestions([]);
    setCurrentQuestion('');
    setInterviewStage('ready');
    setShowRoundComplete(false);
    navigate('/pre-interview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Target className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">Progress</span>
                </div>
                <div className="text-xs text-slate-500">
                  Round {currentRound}/{interviewData.totalRounds}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Questions Answered</span>
                  <span className="text-slate-900">{responses.length}/6</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(responses.length / 6) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {responses.length > 0 && (
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Average Score</span>
                  <span className="text-emerald-600">
                    {(responses.reduce((sum, r) => sum + r.score, 0) / responses.length).toFixed(1)}/10
                  </span>
                </div>
              )}
            </motion.div>

            {currentQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200/60"
              >
                <p className="text-xs font-semibold text-cyan-700 mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  CURRENT QUESTION
                </p>
                <div className="max-h-24 overflow-y-auto">
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {currentQuestion}
                  </p>
                </div>
              </motion.div>
            )}

            {responses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs"
              >
                <div 
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">Responses ({responses.length})</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showHistory ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 max-h-40 overflow-y-auto space-y-2">
                        {responses.slice().reverse().map((response, idx) => (
                          <motion.div
                            key={response.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-2 rounded-lg bg-slate-50/50 border border-slate-200/40"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-cyan-600">
                                Q{responses.length - idx}
                              </span>
                              <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  response.status === 'completed' ? 'bg-emerald-500' : 
                                  response.status === 'processing' ? 'bg-amber-500' : 'bg-rose-500'
                                }`} />
                                <span className="text-xs font-semibold text-slate-700">
                                  {response.score}/10
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {response.answer}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 flex flex-col h-full"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-cyan-200/40 shadow-xs flex-1 flex flex-col">
              <div className="p-4 border-b border-slate-200/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Live Session</h3>
                    <p className="text-xs text-slate-600">
                      Round {currentRound} • Question {roundQuestions.length + 1}/6
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded-lg transition-colors ${
                      isMuted ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 p-4">
                <LiveInterview 
                  currentQuestion={currentQuestion}
                  onUserResponse={handleUserResponse}
                  onStatusUpdate={(status) => console.log('Interview status:', status)}
                  disabled={interviewStage !== 'active' || loading || showRoundComplete}
                />
              </div>

              <div className="p-4 border-t border-slate-200/40">
                <AnimatePresence mode="wait">
                  {interviewStage === 'ready' && (
                    <motion.button
                      key="start"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={startNewInterview}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {loading ? 'Starting...' : 'Begin Interview'}
                    </motion.button>
                  )}

                  {interviewStage === 'active' && !showRoundComplete && (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center gap-4 text-xs text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Speak clearly into your microphone</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-500" />
                          <span>Round {currentRound} in progress</span>
                        </div>
                      </div>
                      {loading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-2 text-sm text-slate-600"
                        >
                          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                          Analyzing your response...
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {showRoundComplete && (
                    <motion.div
                      key="round-complete"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center space-y-4 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200/60"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-12 h-12 mx-auto bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-emerald-800">Round {currentRound - 1} Complete!</h3>
                        <p className="text-sm text-emerald-600 mt-1">
                          {currentRound <= interviewData.totalRounds ? 'Ready for next round?' : 'All rounds completed!'}
                        </p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        {currentRound <= interviewData.totalRounds ? (
                          <>
                            <motion.button
                              onClick={handleContinueRound}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                            >
                              Next Round
                            </motion.button>
                            <motion.button
                              onClick={handleEndInterview}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-300 transition-all"
                            >
                              End Interview
                            </motion.button>
                          </>
                        ) : (
                          <motion.button
                            onClick={handleViewReport}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                          >
                            View Final Report
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {interviewStage === 'completed' && !showRoundComplete && (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-4 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/60"
                    >
                      <motion.div
                        className="w-12 h-12 mx-auto bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Crown className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-cyan-800">Interview Complete!</h3>
                        <p className="text-sm text-cyan-600 mt-1">
                          You've completed all {interviewData.totalRounds} rounds
                        </p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <motion.button
                          onClick={resetInterview}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                        >
                          New Session
                        </motion.button>
                        <motion.button
                          onClick={handleViewReport}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-300 transition-all"
                        >
                          View Report
                        </motion.button>
                        <motion.button
                          onClick={handleDeleteInterview}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-rose-500 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
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