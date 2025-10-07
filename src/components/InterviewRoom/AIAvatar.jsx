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
    <div className="ai-avatar relative w-full h-full">
      <div
        className="avatar-container w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(/AI-avatar.png)` }}
      ></div>
      
      {isSpeaking && (
        <div className="speaking-indicator absolute top-2 right-2 text-center">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-6 bg-blue-500 rounded animate-bounce"></div>
            <div className="w-2 h-6 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-6 bg-blue-500 rounded animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}