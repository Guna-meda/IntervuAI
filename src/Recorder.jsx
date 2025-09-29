import { useState } from "react";

export default function AudioRecorder() {
  const [recorder, setRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        chunks = [];
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (err) {
      setError(`Failed to start recording: ${err.message}`);
      console.error("Error starting recording:", err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recorder && isRecording) {
      recorder.stop();
      setRecorder(null);
      setIsRecording(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🎤 Test Recorder</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={startRecording} 
          disabled={isRecording}
          style={{
            padding: "10px 20px",
            margin: "5px",
            backgroundColor: isRecording ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isRecording ? "not-allowed" : "pointer"
          }}
        >
          Start Recording
        </button>
        <button 
          onClick={stopRecording} 
          disabled={!isRecording}
          style={{
            padding: "10px 20px",
            margin: "5px",
            backgroundColor: !isRecording ? "#ccc" : "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: !isRecording ? "not-allowed" : "pointer"
          }}
        >
          Stop Recording
        </button>
      </div>

      {error && (
        <div style={{ color: "red", margin: "10px 0" }}>
          {error}
        </div>
      )}

      {isRecording && (
        <div style={{ color: "green", margin: "10px 0" }}>
          ● Recording...
        </div>
      )}

      {audioURL && (
        <div>
          <h3>Playback:</h3>
          <audio controls src={audioURL} style={{ marginTop: "10px" }}></audio>
          <br />
          <a 
            href={audioURL} 
            download="recording.webm"
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px"
            }}
          >
            Download Recording
          </a>
        </div>
      )}
    </div>
  );
}