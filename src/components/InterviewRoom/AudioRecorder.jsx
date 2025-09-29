import { useState, useRef, useEffect } from "react";

export default function AudioRecorder({ onRecordingComplete }) {
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        // Send to parent component for processing
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
        
        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (err) {
      setError(`Microphone access denied: ${err.message}`);
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (recorder && isRecording) {
      recorder.stop();
      setRecorder(null);
      setIsRecording(false);
    }
  };

  return (
    <div className="audio-recorder bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Audio Recording</h3>
      
      {/* Recording Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRecording ? (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
              Stop Recording
            </div>
          ) : (
            'Start Recording'
          )}
        </button>

        {isRecording && (
          <div className="flex items-center text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            Recording...
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Audio Playback */}
      {audioURL && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Your Recording:</h4>
          <audio controls src={audioURL} className="w-full" />
          <a
            href={audioURL}
            download="interview-response.webm"
            className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Download Audio
          </a>
        </div>
      )}

    </div>
  );
}