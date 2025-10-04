import { useState } from 'react';
import AIAvatar from '../components/InterviewRoom/AIAvatar';
import LiveInterview from '../components/InterviewRoom/LiveInterview';

export default function InterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [interviewStage, setInterviewStage] = useState('not-started');
  const [responses, setResponses] = useState([]);
  const [userTranscript, setUserTranscript] = useState('');

  const handleResponseComplete = async (blob, type) => {
    console.log(`${type} response received:`, blob);
    
    const newResponse = {
      id: Date.now(),
      type,
      blob,
      question: currentQuestion,
      timestamp: new Date().toISOString()
    };
    
    setResponses(prev => [...prev, newResponse]);
    await analyzeResponse(blob, type);
    
    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  };

  const handleUserResponse = async (transcript) => {
    console.log('User response received:', transcript);
    
    if (!transcript || transcript.trim().length === 0) {
      console.log('Empty transcript received');
      setUserTranscript("No speech detected. Please try again.");
      return;
    }
    
    const newResponse = {
      id: Date.now(),
      transcript: transcript,
      question: currentQuestion,
      timestamp: new Date().toISOString()
    };
    
    setResponses(prev => [...prev, newResponse]);
    
    console.log('Sending to LLM for analysis...');
    
    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  };

  const handleStatusUpdate = (status) => {
    console.log('Interview status:', status);
  };

  const analyzeResponse = async (blob, type) => {
    console.log(`Analyzing ${type} response...`);
    
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
    const questions = [
      "Tell me about yourself and your background.",
      "What are your greatest strengths?",
      "Describe a challenging project you worked on.",
      "Where do you see yourself in 5 years?",
      "Why do you want to work for this company?"
    ];
    
    const question = questions[responses.length % questions.length];
    setCurrentQuestion(question);
    
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Interview Prep Pro</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master your interview skills with AI-powered practice sessions and real-time feedback
          </p>
        </div>
        
        {interviewStage === 'not-started' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Ace Your Interview?</h2>
              <p className="text-gray-600 mb-2">You'll be asked 5 realistic interview questions</p>
              <p className="text-gray-600 mb-6">Speak your answers naturally and receive AI-powered feedback</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">Real-time Analysis</span>
                </div>
                <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-green-900">Instant Feedback</span>
                </div>
                <div className="flex items-center justify-center p-4 bg-purple-50 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-900">Video Recording</span>
                </div>
              </div>
              
              <button
                onClick={startInterview}
                className="w-full max-w-xs mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Practice Session
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                Estimated time: 10-15 minutes • 5 questions
              </p>
            </div>
          </div>
        )}

        {interviewStage === 'in-progress' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* AI Interviewer Panel - Left Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">AI Interviewer</h2>
                    <p className="text-sm text-gray-500">Virtual Assistant</p>
                  </div>
                </div>

                <AIAvatar text={currentQuestion} isSpeaking={isPlaying} />

                {/* Progress Section */}
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Session Progress</span>
                    <span className="text-sm font-bold text-blue-600">{responses.length + 1}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((responses.length + 1) / 5) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Question {responses.length + 1}</span>
                    <span>{Math.round(((responses.length + 1) / 5) * 100)}% Complete</span>
                  </div>
                </div>

                {/* Session Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold text-blue-900 text-sm mb-2">Current Question</h3>
                  <p className="text-blue-800 text-sm leading-relaxed">{currentQuestion}</p>
                </div>
              </div>
            </div>

            {/* Main Interview Area - Right Content */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Live Interview Session</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">LIVE</span>
                  </div>
                </div>

                <LiveInterview
                  currentQuestion={currentQuestion}
                  onUserResponse={handleUserResponse}
                  onStatusUpdate={handleStatusUpdate}
                />

                {/* Response History */}
                {responses.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Responses</h3>
                    <div className="space-y-4">
                      {responses.slice().reverse().map((response) => (
                        <div key={response.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-700">Question {responses.indexOf(response) + 1}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{response.question}</p>
                          <p className="text-gray-800 bg-white p-3 rounded border text-sm">
                            {response.transcript}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}