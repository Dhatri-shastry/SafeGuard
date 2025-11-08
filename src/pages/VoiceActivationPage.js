import React, { useState, useEffect } from 'react';
import { Mic, Shield, AlertCircle } from 'lucide-react';

const VoiceActivationPage = () => {
  const [listening, setListening] = useState(false);
  const [safeWord, setSafeWord] = useState('help me');
  const [customWord, setCustomWord] = useState('');
  const [message, setMessage] = useState('');

  // Browser Speech Recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
  }

  const startListening = () => {
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in your browser.');
      return;
    }

    setListening(true);
    setMessage('Listening... Say your safe word to trigger SOS.');

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log('Heard:', transcript);

      if (transcript.includes(safeWord.toLowerCase())) {
        triggerSOS();
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setMessage('Error: ' + event.error);
      setListening(false);
    };

    recognition.onend = () => {
      if (listening) recognition.start(); // Auto-restart
    };
  };

  const stopListening = () => {
    if (recognition) recognition.stop();
    setListening(false);
    setMessage('Voice detection stopped.');
  };

  const triggerSOS = () => {
    alert('🚨 SOS Activated by Voice Command!');
    stopListening();
  };

  const updateSafeWord = () => {
    if (customWord.trim() !== '') {
      setSafeWord(customWord.trim());
      setCustomWord('');
      alert(`✅ Safe word updated to "${customWord.trim()}"`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Voice SOS Activation</h2>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <button
            onClick={listening ? stopListening : startListening}
            className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center shadow-2xl transition-all ${
              listening ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <Mic className="w-16 h-16 text-white" />
          </button>
          <p className="mt-4 text-gray-600 font-medium">{message || 'Tap to start voice detection'}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Safe Word</label>
            <div className="p-4 bg-purple-50 rounded-lg text-purple-700 font-semibold text-lg">
              "{safeWord}"
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Set Custom Safe Word</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your new safe word"
              />
              <button
                onClick={updateSafeWord}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Set
              </button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">How It Works</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click the mic button to start listening</li>
              <li>• Say your safe word (e.g., “help me”)</li>
              <li>• The app will instantly trigger SOS</li>
              <li>• You can change the safe word anytime</li>
              <li>• Works best on Chrome or Edge browsers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceActivationPage;
