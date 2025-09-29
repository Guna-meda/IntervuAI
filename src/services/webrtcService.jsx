class WebRTCService {
  constructor() {
    this.localStream = null;
    this.audioContext = null;
    this.analyser = null;
    this.isSpeaking = false;
    this.silenceThreshold = 0.01;
  }

  /**
   * Get live video + audio stream using WebRTC
   */
  async getLiveStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
          frameRate: 30
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Optimized for Whisper
          channelCount: 1
        }
      });

      this.setupAudioAnalysis();
      return this.localStream;

    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  /**
   * Setup audio analysis for speech detection
   */
  setupAudioAnalysis() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(this.localStream);
    source.connect(this.analyser);
    
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;
  }

  /**
   * Check if user is currently speaking
   */
  detectSpeech() {
    if (!this.analyser) return false;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate volume level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length / 255; // Normalize to 0-1

    const wasSpeaking = this.isSpeaking;
    this.isSpeaking = average > this.silenceThreshold;

    return {
      isSpeaking: this.isSpeaking,
      volume: average,
      startedSpeaking: !wasSpeaking && this.isSpeaking,
      stoppedSpeaking: wasSpeaking && !this.isSpeaking
    };
  }

 // Get audio track for Whisper processing

  getAudioTrack() {
    return this.localStream ? this.localStream.getAudioTracks()[0] : null;
  }


   //Stop all tracks and cleanup

  stopStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default new WebRTCService();