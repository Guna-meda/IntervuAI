import { useState, useEffect, useRef } from 'react';
import WebRTCService from '../../services/webrtcService';
import LiveSpeechService from '../../services/LiveSpeechService'; // ✅ replaced Whisper

export default function LiveInterview({ 
  currentQuestion, 
  onResponse,
  onUserResponse,
  onStatusUpdate,
  onStopAudio
}) {
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const [showNoSpeechPopup, setShowNoSpeechPopup] = useState(false);

  // Initialize WebRTC stream when component mounts
  useEffect(() => {
    initializeWebRTC();
    
    return () => {
      // Cleanup
      WebRTCService.stopStream();
      LiveSpeechService.stopRecording(); // ✅ changed name
    };
  }, [])
  

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
  if (onStopAudio) onStopAudio(); // ✅ STOP QUESTION AUDIO

  setIsListening(true);
  setUserTranscript("🎤 Listening... Speak your answer");
  if (onStatusUpdate) onStatusUpdate('listening');

  try {
    await LiveSpeechService.startRecording();
  } catch (error) {
    console.error('Failed to start recording:', error);
    setUserTranscript('❌ Microphone access required');
    setIsListening(false);
  }
};

const stopListening = async () => {
  try {
      if (onStopAudio) onStopAudio();
    console.log('Stopping recording and processing...');
    
    const transcript = await LiveSpeechService.stopRecording();
    console.log('Transcript result:', transcript);

    setIsListening(false);

    // Handle different transcript scenarios
    if (transcript && transcript.trim().length > 0) {
      setUserTranscript(transcript);
      const responder = onResponse || onUserResponse;
      if (responder) responder(transcript);
      if (onStatusUpdate) onStatusUpdate('processing');
    }else if (transcript === '') {
  setShowNoSpeechPopup(true); // ✅ trigger popup
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
      <div>
        {/* Video Section */}
        <div className="video-section">
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
  <div className="mt-4 flex space-x-4">
            <button
              onClick={startListening}
              disabled={isListening || !currentQuestion }
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

      {showNoSpeechPopup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        No Answer Detected 
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        You need to answer the question before proceeding.
      </p>
      <button
        onClick={() => setShowNoSpeechPopup(false)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Try Again
      </button>
    </div>
  </div>
)}
    </div>
    
  );
}
