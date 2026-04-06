import { useState, useEffect, useRef } from 'react';
import WebRTCService from '../../services/webrtcService';
import LiveSpeechService from '../../services/LiveSpeechService'; // ✅ replaced Whisper

export default function LiveInterview({ 
  currentQuestion, 
  onResponse,
  onUserResponse,
  onStatusUpdate,
  onStopAudio,
  disabled = false,
}) {
  const [inputMode, setInputMode] = useState('voice');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const textAreaRef = useRef(null);
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

const handleModeSwitch = async (mode) => {
  if (mode === inputMode) return;

  // Optional UX safety: stop active recording when leaving voice mode.
  if (inputMode === 'voice' && mode === 'text' && isListening) {
    await stopListening();
  }

  // Optional UX cleanup: reset typed input when returning to voice mode.
  if (mode === 'voice') {
    setTypedAnswer('');
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '80px';
    }
  }

  setInputMode(mode);
};

const handleTypedAnswerChange = (event) => {
  const { value } = event.target;
  setTypedAnswer(value);

  if (textAreaRef.current) {
    textAreaRef.current.style.height = 'auto';
    textAreaRef.current.style.height = `${Math.max(80, textAreaRef.current.scrollHeight)}px`;
  }
};

const handleTypedSubmit = () => {
  const typedText = typedAnswer.trim();
  if (!typedText) return;

  // 🔥 ADD THIS LINE
  if (onStopAudio) onStopAudio();

  const responder = onResponse || onUserResponse;
  if (responder) responder(typedText);

  if (onStatusUpdate) onStatusUpdate('processing');

  setUserTranscript(typedText);
  setTypedAnswer('');

  if (textAreaRef.current) {
    textAreaRef.current.style.height = '80px';
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
        <div className="mt-4 inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => handleModeSwitch('voice')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              inputMode === 'voice'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Speak
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('text')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              inputMode === 'text'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Type
          </button>
        </div>

        <div
          className={`mt-4 transition-all duration-200 ${
            inputMode === 'voice' ? 'opacity-100 translate-y-0' : 'opacity-95 translate-y-0'
          }`}
        >
          {inputMode === 'voice' ? (
            <div className="flex space-x-4">
              <button
                onClick={startListening}
                disabled={disabled || isListening || !currentQuestion}
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
          ) : (
            <div className="space-y-3">
              <textarea
                ref={textAreaRef}
                value={typedAnswer}
                onChange={handleTypedAnswerChange}
                placeholder="Type your answer here..."
                rows={3}
                className="w-full min-h-[80px] rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                type="button"
                onClick={handleTypedSubmit}
                disabled={!typedAnswer.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          )}
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
