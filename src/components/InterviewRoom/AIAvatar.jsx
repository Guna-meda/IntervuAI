import { useState, useEffect } from 'react';

export default function AIAvatar({ text, isSpeaking }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (text) {
      setDisplayText(text);
      // TODO: Integrate with TTS service
    }
  }, [text]);

  return (
    <div className="ai-avatar">
      <div className="avatar-container w-64 h-64 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
        <div className={`avatar-face ${isSpeaking ? 'speaking' : ''}`}>
          {/* Placeholder for avatar - will replace with actual avatar later */}
          <div className="text-6xl">🤖</div>
        </div>
      </div>
      
      {isSpeaking && (
        <div className="speaking-indicator mt-4 text-center">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-6 bg-blue-500 rounded animate-bounce"></div>
            <div className="w-2 h-6 bg-blue-500 rounded animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-6 bg-blue-500 rounded animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      )}
    </div>
  );
}