let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const LiveSpeechService = {
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        } 
      });
      
      // Setup audio analysis (retained for potential future use, but not used for validation)
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.start();
      console.log('LiveSpeechService: Recording started');
    } catch (error) {
      console.error('LiveSpeechService: Failed to start recording:', error);
      throw error;
    }
  },

  // Check if audio contains speech (not silence) - retained but not used
  hasSpeechContent(audioBuffer) {
    if (!analyser) return false;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate volume level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length / 255;
    
    // Threshold for speech detection
    return average > 0.02;
  },

  // Get audio duration in seconds
  getAudioDuration(audioBlob) {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      };
    });
  },

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        return reject('No active recording found');
      }

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // VALIDATION: Check audio duration
          const audioDuration = await this.getAudioDuration(audioBlob);
          
          console.log('Audio validation:', {
            duration: audioDuration
          });

          // Don't call API if audio is too short (< 2 seconds)
          if (audioDuration < 2) {
            console.log('LiveSpeechService: Skipping API call - audio shorter than 2 seconds');
            resolve(''); // Return empty transcript
            return;
          }

          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');

          console.log('LiveSpeechService: Sending audio to backend...');

          const res = await fetch(`${API_BASE_URL}/speech/transcribe`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();
          console.log('LiveSpeechService: Backend response:', data);

          if (data && data.data && typeof data.data.text === 'string') {
            resolve(data.data.text);
          } else {
            resolve('');
          }
        } catch (error) {
          console.error('LiveSpeechService: Error processing audio:', error);
          reject(error);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('LiveSpeechService: MediaRecorder error:', event);
        reject('MediaRecorder error occurred');
      };

      mediaRecorder.stop();
      
      // Cleanup
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
    });
  }
};

export default LiveSpeechService;