import { useState, useEffect, useRef } from 'react';
import WebRTCService from '../../services/webrtcService';
import LiveSpeechService from '../../services/LiveSpeechService'; // ✅ replaced Whisper

export default function LiveInterview({ 
  currentQuestion, 
  onUserResponse,
  onStatusUpdate 
}) {
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);

  // Initialize WebRTC stream when component mounts
  useEffect(() => {
    initializeWebRTC();
    
    return () => {
      // Cleanup
      WebRTCService.stopStream();
      LiveSpeechService.stopRecording(); // ✅ changed name
    };
  }, []);

  // Start listening automatically when a new question comes
  useEffect(() => {
    if (currentQuestion) {
      setTimeout(() => {
        startListening();
      }, 3000);
    }
  }, [currentQuestion]);

  // Initialize WebRTC video/audio stream
  const initializeWebRTC = async () => {
    try {
      const stream = await WebRTCService.getLiveStream();
      setVideoStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
    }
  };

  const startListening = async () => {
    setIsListening(true);
    setUserTranscript("🎤 Listening... Speak your answer");
    if (onStatusUpdate) onStatusUpdate('listening');

    try {
      await LiveSpeechService.startRecording(); // ✅ replaced
    } catch (error) {
      console.error('Failed to start recording:', error);
      setUserTranscript('❌ Microphone access required');
      setIsListening(false);
    }
  };

const stopListening = async () => {
  try {
    console.log('Stopping recording and processing...');
    
    const transcript = await LiveSpeechService.stopRecording();
    console.log('Transcript result:', transcript);

    setIsListening(false);

    // Handle different transcript scenarios
    if (transcript && transcript.trim().length > 0) {
      setUserTranscript(transcript);
      if (onUserResponse) onUserResponse(transcript);
      if (onStatusUpdate) onStatusUpdate('processing');
    } else if (transcript === '') {
      // Empty but valid (no speech detected)
      setUserTranscript("No speech detected. Please speak clearly and try again.");
      if (onStatusUpdate) onStatusUpdate('no-speech');
    } else {
      // Undefined or error
      setUserTranscript("Error processing audio. Please try again.");
      if (onStatusUpdate) onStatusUpdate('error');
    }
    
  } catch (error) {
    console.error('Error stopping recording:', error);
    setUserTranscript("Error processing audio: " + error.message);
    setIsListening(false);
    if (onStatusUpdate) onStatusUpdate('error');
  }
};

  return (
    <div className="live-interview">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Section */}
        <div className="video-section">
          <h3 className="text-lg font-semibold mb-4">📹 Live Video</h3>
          <div className="video-container bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 lg:h-96 object-cover"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {isListening ? '● LIVE - Listening to your audio' : 'Video preview'}
          </div>
        </div>

        {/* Transcription Section */}
        <div className="transcription-section">
          <h3 className="text-lg font-semibold mb-4">💬 Live Transcription</h3>
          
          <div className={`p-4 rounded-lg min-h-48 ${
            isListening ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
          }`}>
            {userTranscript ? (
              <p className="text-gray-800 whitespace-pre-wrap">{userTranscript}</p>
            ) : (
              <p className="text-gray-400 italic">
                {currentQuestion ? 'Waiting for you to speak...' : 'Waiting for question...'}
              </p>
            )}
          </div>

          {/* Status Indicator */}
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium">
                {isListening ? 'Live Transcription Active' : 'Ready for Question'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {isListening 
                ? "Speak your answer. We'll send it when you click Stop." 
                : 'WebRTC stream active - video and audio ready'}
            </p>
          </div>

          {/* Controls */}
          <div className="mt-4 flex space-x-4">
            <button
              onClick={startListening}
              disabled={isListening || !currentQuestion}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
            >
              Start Speaking
            </button>
            <button
              onClick={stopListening}
              disabled={!isListening}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
            >
              Stop
            </button>
          </div>
        </div>
      </div>

      {/* Current Question Display */}
      {currentQuestion && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">🤔 Current Question:</h3>
          <p className="text-lg text-gray-800">{currentQuestion}</p>
        </div>
      )}
    </div>
  );
}
