import { useState } from 'react';
import InterviewController from '../components/InterviewRoom/InterviewController';
import AIAvatar from '../components/InterviewRoom/AIAvatar';
import LiveInterview from '../components/InterviewRoom/LiveInterview';

export default function InterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [interviewStage, setInterviewStage] = useState('not-started');
  const [responses, setResponses] = useState([]);

  const handleResponseComplete = async (blob, type) => {
    console.log(`${type} response received:`, blob);
    
    // Add to responses list
    const newResponse = {
      id: Date.now(),
      type,
      blob,
      question: currentQuestion,
      timestamp: new Date().toISOString()
    };
    
    setResponses(prev => [...prev, newResponse]);
    
    // TODO: Send to backend for analysis
    await analyzeResponse(blob, type);
    
    // Get next question after a delay
    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  };

  const handleUserResponse = async (transcript) => {
    console.log('User response received:', transcript);
    
    // Store response
    const newResponse = {
      id: Date.now(),
      transcript: transcript,
      question: currentQuestion,
      timestamp: new Date().toISOString()
    };
    
    setResponses(prev => [...prev, newResponse]);
    
    // TODO: Send to LLM for analysis and next question
    console.log('Sending to LLM for analysis...');
    
    // Simulate LLM processing
    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  };

  
  const handleStatusUpdate = (status) => {
    console.log('Interview status:', status);
  };

  const analyzeResponse = async (blob, type) => {
    // TODO: Implement analysis
    console.log(`Analyzing ${type} response...`);
    
    // For now, just simulate analysis
    const analysis = {
      fluency: Math.random() * 10,
      confidence: Math.random() * 10,
      relevance: Math.random() * 10
    };
    
    console.log('Analysis results:', analysis);
  };

  const startInterview = () => {
    setInterviewStage('in-progress');
    askNextQuestion();
  };

  const askNextQuestion = async () => {
    // TODO: Integrate with LLM service
    const questions = [
      "Tell me about yourself and your background.",
      "What are your greatest strengths?",
      "Describe a challenging project you worked on.",
      "Where do you see yourself in 5 years?",
      "Why do you want to work for this company?"
    ];
    
    const question = questions[responses.length % questions.length];
    setCurrentQuestion(question);
    
    // Simulate TTS playing
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">AI Interview Preparation</h1>
        <p className="text-gray-600 text-center mb-8">Practice with AI-powered interviews</p>
        
        {interviewStage === 'not-started' && (
          <div className="text-center bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Ready to start your interview?</h2>
            <p className="text-gray-600 mb-6">You'll be asked a series of questions. Record your responses and get AI feedback.</p>
            <button
              onClick={startInterview}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Interview Session
            </button>
          </div>
        )}

       {interviewStage === 'in-progress' && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* AI Avatar Section - 1/3 width */}
    <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">AI Interviewer</h2>
      <AIAvatar text={currentQuestion} isSpeaking={isPlaying} />

      {/* Progress */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{responses.length + 1}/5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((responses.length + 1) / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>

    {/* Live Interview Section - 2/3 width */}
    <div className="lg:col-span-2">
      <LiveInterview
        currentQuestion={currentQuestion}
        onUserResponse={handleUserResponse}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>

    {/* If you want InterviewController separate, keep it here.
        Otherwise remove it to avoid double recording */}
    {/* <div className="lg:col-span-2">
      <InterviewController
        currentQuestion={currentQuestion}
        onResponseComplete={handleResponseComplete}
        recordingMode="audio"
      />
    </div> */}
  </div>
)}

      </div>
    </div>
  );
}