// Advanced Kannada Speech Recognition Engine for Sobagu

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

let activeRecognition = null;

export const isSTTSupported = () => !!SpeechRecognition;

export const getSTTStatus = () => ({
  supported: isSTTSupported(),
  browser: typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').pop() : 'unknown',
});

/**
 * Listen for Kannada speech — returns Promise with transcript
 * @param {object} options
 * @param {number} options.timeoutMs - Max listen duration
 * @param {function} options.onInterim - Called with partial transcripts
 * @param {function} options.onStart - Called when mic starts
 */
export const listenForKannada = ({
  timeoutMs = 8000,
  onInterim,
  onStart,
} = {}) => {
  return new Promise((resolve, reject) => {
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition is not supported in this browser. Try Chrome or Edge.'));
      return;
    }

    if (activeRecognition) {
      try { activeRecognition.abort(); } catch { /* ignore */ }
    }

    const recognition = new SpeechRecognition();
    activeRecognition = recognition;

    recognition.lang = 'kn-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;

    let finalTranscript = '';
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { recognition.stop(); } catch { /* ignore */ }
        resolve({ transcript: finalTranscript, timedOut: true, confidence: 0 });
      }
    }, timeoutMs);

    recognition.onstart = () => onStart?.();

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript || '';
        if (result.isFinal) {
          finalTranscript = text;
        } else {
          interim = text;
        }
      }
      if (interim) onInterim?.(interim);
    };

    recognition.onend = () => {
      clearTimeout(timer);
      activeRecognition = null;
      if (!resolved) {
        resolved = true;
        resolve({ transcript: finalTranscript.trim(), timedOut: false, confidence: finalTranscript ? 0.8 : 0 });
      }
    };

    recognition.onerror = (event) => {
      clearTimeout(timer);
      activeRecognition = null;
      if (!resolved) {
        resolved = true;
        const noSpeech = event.error === 'no-speech';
        if (noSpeech) {
          resolve({ transcript: '', timedOut: false, confidence: 0, noSpeech: true });
        } else {
          reject(new Error(getErrorMessage(event.error)));
        }
      }
    };

    try {
      recognition.start();
    } catch (err) {
      clearTimeout(timer);
      activeRecognition = null;
      reject(err);
    }
  });
};

export const stopListening = () => {
  if (activeRecognition) {
    try { activeRecognition.stop(); } catch { /* ignore */ }
    activeRecognition = null;
  }
};

export const abortListening = () => {
  if (activeRecognition) {
    try { activeRecognition.abort(); } catch { /* ignore */ }
    activeRecognition = null;
  }
};

const getErrorMessage = (error) => {
  const messages = {
    'not-allowed': 'Microphone access denied. Please allow mic permissions in your browser.',
    'no-speech': 'No speech detected. Try speaking louder and closer to the mic.',
    'network': 'Network error. Speech recognition requires an internet connection.',
    'aborted': 'Listening was cancelled.',
    'audio-capture': 'No microphone found. Please connect a microphone.',
    'service-not-allowed': 'Speech recognition service is not available.',
  };
  return messages[error] || `Speech recognition error: ${error}`;
};

/** Request microphone permission proactively */
export const requestMicPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch {
    return false;
  }
};
