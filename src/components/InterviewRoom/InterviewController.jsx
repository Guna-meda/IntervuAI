import { useState } from 'react';
import AudioRecorder from './AudioRecorder';
import VideoRecorder from './VideoRecorder';

export default function InterviewController({ 
  currentQuestion, 
  onResponseComplete,
  recordingMode = 'audio' // 'audio' | 'video' | 'both'
}) {
  const [activeRecorder, setActiveRecorder] = useState(recordingMode);

  const handleRecordingComplete = (blob, type) => {
    console.log(`${type} recording completed:`, blob);
    if (onResponseComplete) {
      onResponseComplete(blob, type);
    }
  };

  return (
    <div className="interview-controller">
      {/* Mode Selector */}
      <div className="mode-selector mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recording Mode:
        </label>
        <div className="flex space-x-4">
          {['audio', 'video', 'both'].map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveRecorder(mode)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeRecorder === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Recording Area */}
      <div className="recording-area">
        {activeRecorder === 'audio' && (
          <AudioRecorder 
            onRecordingComplete={(blob) => handleRecordingComplete(blob, 'audio')}
          />
        )}

        {activeRecorder === 'video' && (
          <VideoRecorder 
            onRecordingComplete={(blob) => handleRecordingComplete(blob, 'video')}
          />
        )}

        {activeRecorder === 'both' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VideoRecorder 
              onRecordingComplete={(blob) => handleRecordingComplete(blob, 'video')}
            />
            <AudioRecorder 
              onRecordingComplete={(blob) => handleRecordingComplete(blob, 'audio')}
            />
          </div>
        )}
      </div>

      {/* Current Question Display */}
      {currentQuestion && (
        <div className="current-question mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Current Question:</h3>
          <p className="text-lg text-gray-800">{currentQuestion}</p>
        </div>
      )}
    </div>
  );
}