class LiveWhisperService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  /**
   * Start recording audio
   */
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      console.log("🎤 Recording started");
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }

  /**
   * Stop recording and send to backend for transcription
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) return resolve(null);

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        this.audioChunks = [];
        this.isRecording = false;

        try {
          const transcript = await this.sendAudioToBackend(audioBlob);
          resolve(transcript);
        } catch (err) {
          reject(err);
        }
      };

      this.mediaRecorder.stop();

      // Stop all tracks
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      console.log("🎤 Recording stopped");
    });
  }

  /**
   * Send audio to backend Whisper API
   */
  async sendAudioToBackend(audioBlob) {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const response = await fetch(
        "http://localhost:3001/api/v1/whisper/transcribe",
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error("Error sending audio to backend:", err);
      return null;
    }
  }
}

export default new LiveWhisperService();
