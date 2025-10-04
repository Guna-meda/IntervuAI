// src/services/LiveSpeechService.js
let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;

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
      
      // Setup audio analysis for silence detection
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

  // Check if audio contains speech (not silence)
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
    
    // Threshold for speech detection (adjust as needed)
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
          
          // VALIDATION: Check if audio is worth sending
          const audioDuration = await this.getAudioDuration(audioBlob);
          const hasSpeech = this.hasSpeechContent();
          
          console.log('Audio validation:', {
            duration: audioDuration,
            hasSpeech: hasSpeech,
            size: audioBlob.size
          });

          // Don't call API if:
          // - Audio is too short (< 1 second)
          // - No speech detected
          // - File size too small (likely silence)
          if (audioDuration < 1 || !hasSpeech || audioBlob.size < 1000) {
            console.log('LiveSpeechService: Skipping API call - no meaningful audio');
            resolve(''); // Return empty transcript
            return;
          }

          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');

          console.log('LiveSpeechService: Sending meaningful audio to backend...');
          
          const res = await fetch('http://localhost:3001/api/v1/speech/transcribe', {
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