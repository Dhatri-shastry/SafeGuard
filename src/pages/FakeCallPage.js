// src/pages/FakeCallPage.js
import React, { useEffect, useRef, useState } from 'react';
import { PhoneCall, X, User } from 'lucide-react';

/**
 * FakeCallPage
 * - schedule a fake call
 * - choose caller name, type, ring delay
 * - WebAudio ringtone and generated voice script (speechSynthesis)
 * - saves call history to localStorage
 *
 * Props:
 * - onQuickExit: optional function to call when user chooses quick exit (e.g., trigger SOS)
 */
const FakeCallPage = ({ onQuickExit }) => {
  const [callerName, setCallerName] = useState('Mom');
  const [callType, setCallType] = useState('Casual'); // Casual | Urgent | Rescue
  const [ringDelay, setRingDelay] = useState(5);
  const [callScheduled, setCallScheduled] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [autoAnswer, setAutoAnswer] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fakeCallHistory') || '[]'); } catch { return []; }
  });

  const ringtoneRef = useRef(null);
  const ringTimeoutRef = useRef(null);
  const autoEndTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Create ringtone using Web Audio API (kept simple tone + tremolo)
  const startRingtone = () => {
    if (!window.AudioContext) return;
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // tremolo via LFO
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 420; // base freq
    gain.gain.value = 0.6;
    lfo.frequency.value = 4; // tremolo rate
    lfoGain.gain.value = 0.2;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    lfo.start();
    oscillatorRef.current = { osc, lfo, ctx };
    ringtoneRef.current = true;
  };

  const stopRingtone = () => {
    const o = oscillatorRef.current;
    if (o && o.ctx) {
      try {
        o.osc.stop();
        o.lfo.stop();
        o.ctx.close();
      } catch (e) {}
    }
    oscillatorRef.current = null;
    ringtoneRef.current = null;
  };

  // Build a short conversation based on callType
  const getScriptForType = (name, type) => {
    if (type === 'Urgent') {
      return `${name}, are you there? Please call me back right now. It's important.`;
    }
    if (type === 'Rescue') {
      return `${name}, emergency at home. I need you to come now. Call me immediately.`;
    }
    // Casual by default
    return `${name}, hey! Wanted to check in — call me when you get a sec.`;
  };

  // Speak script using speechSynthesis (native TTS)
  const speakScript = (text) => {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    // try to pick a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      // prefer a female voice or the default
      const pick = voices.find(v => /female|woman|female/i.test(v.name)) || voices[0];
      if (pick) utter.voice = pick;
    }
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  };

  // Save a call to history (localStorage)
  const pushToHistory = (entry) => {
    const newHist = [entry, ...history].slice(0, 30);
    setHistory(newHist);
    localStorage.setItem('fakeCallHistory', JSON.stringify(newHist));
  };

  // Schedule fake call
  const scheduleCall = () => {
    clearAllTimers();
    setCallScheduled(true);
    setIncoming(false);
    setCallActive(false);
    const scheduledAt = Date.now() + ringDelay * 1000;
    // set timeout to "ring"
    ringTimeoutRef.current = setTimeout(() => {
      setIncoming(true);
      startRingtone();

      // if autoAnswer or callType === Rescue -> auto-answer after short delay
      if (autoAnswer || callType === 'Rescue') {
        const answerAfter = 1500; // ms
        autoEndTimeoutRef.current = setTimeout(() => {
          answerCall();
        }, answerAfter);
      }
    }, ringDelay * 1000);

    pushToHistory({
      id: Date.now(),
      callerName,
      callType,
      scheduledAt,
      status: 'scheduled',
    });
  };

  const clearAllTimers = () => {
    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null; }
    if (autoEndTimeoutRef.current) { clearTimeout(autoEndTimeoutRef.current); autoEndTimeoutRef.current = null; }
    stopRingtone();
  };

  const cancelScheduled = () => {
    clearAllTimers();
    setCallScheduled(false);
    setIncoming(false);
    setCallActive(false);
  };

  const answerCall = () => {
    clearTimeout(ringTimeoutRef.current);
    stopRingtone();
    setIncoming(false);
    setCallActive(true);

    // play scripted conversation
    const script = getScriptForType(callerName, callType);
    // speak script, then after it ends auto-end call
    speakScript(script);

    // auto-end: short or longer depending on type
    const duration = callType === 'Casual' ? 3500 : callType === 'Urgent' ? 5000 : 7000;
    autoEndTimeoutRef.current = setTimeout(() => {
      endCall('completed');
    }, duration);
  };

  const declineCall = () => {
    clearAllTimers();
    // log decline to history
    pushToHistory({
      id: Date.now(),
      callerName,
      callType,
      scheduledAt: Date.now(),
      status: 'declined',
    });
    setIncoming(false);
    setCallScheduled(false);
  };

  const endCall = (status = 'completed') => {
    clearAllTimers();
    setCallActive(false);
    setCallScheduled(false);
    setIncoming(false);
    pushToHistory({
      id: Date.now(),
      callerName,
      callType,
      scheduledAt: Date.now(),
      status,
    });
  };

  // Quick Exit - call a callback (e.g., to trigger SOS or navigate)
  const handleQuickExit = () => {
    // stop everything
    clearAllTimers();
    setIncoming(false);
    setCallActive(false);
    setCallScheduled(false);

    // log quick-exit
    pushToHistory({
      id: Date.now(),
      callerName,
      callType,
      scheduledAt: Date.now(),
      status: 'quick-exit',
    });

    if (typeof onQuickExit === 'function') onQuickExit();
    else {
      // default: close UI and show alert
      alert('Quick exit: performing safe exit steps (you can wire this to SOS).');
    }
  };

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // small helper: pretty time
  const formatTime = (ms) => new Date(ms).toLocaleTimeString();

  // UI
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Fake Call — Quick Exit Tool</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <label className="block text-sm text-gray-600 mb-2">Caller Name</label>
          <input
            value={callerName}
            onChange={(e) => setCallerName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-4"
          />

          <label className="block text-sm text-gray-600 mb-2">Call Type</label>
          <select value={callType} onChange={(e) => setCallType(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-4">
            <option>Casual</option>
            <option>Urgent</option>
            <option>Rescue</option>
          </select>

          <label className="block text-sm text-gray-600 mb-2">Ring after (seconds): <span className="font-semibold">{ringDelay}</span></label>
          <input type="range" min="0" max="30" value={ringDelay} onChange={(e) => setRingDelay(Number(e.target.value))} className="w-full mb-4" />

          <label className="inline-flex items-center gap-2 text-sm mb-4">
            <input type="checkbox" checked={autoAnswer} onChange={(e) => setAutoAnswer(e.target.checked)} />
            <span>Auto-answer (or Rescue type auto-answers)</span>
          </label>

          <div className="flex gap-2">
            {!callScheduled ? (
              <button onClick={scheduleCall} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Schedule Fake Call</button>
            ) : (
              <button onClick={cancelScheduled} className="flex-1 py-2 bg-red-500 text-white rounded-lg">Cancel Scheduled</button>
            )}
            <button onClick={() => {
              // immediate incoming (useful for quick test)
              cancelScheduled();
              setIncoming(true);
              startRingtone();
              if (autoAnswer) setTimeout(answerCall, 1500);
            }} className="py-2 px-4 bg-gray-200 rounded-lg">Ring Now</button>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={handleQuickExit} className="flex-1 py-2 bg-yellow-500 text-white rounded-lg">Quick Exit</button>
            <button onClick={() => {
              // clear history
              localStorage.removeItem('fakeCallHistory');
              setHistory([]);
            }} className="py-2 px-4 bg-gray-100 rounded-lg">Clear History</button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Tip: Use <strong>Rescue</strong> for automatic, convincing calls (auto answers + longer script). Use Quick Exit to immediately run your safety action.
          </div>
        </div>

        {/* Right: Incoming / Active UI + History */}
        <div className="space-y-6">
          {/* Incoming or active call UI */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            {!incoming && !callActive ? (
              <div>
                <div className="text-sm text-gray-500">No incoming call</div>
                {callScheduled && <div className="mt-3 text-sm text-gray-600">Scheduled to ring at {formatTime(Date.now() + ringDelay * 1000)}</div>}
              </div>
            ) : incoming ? (
              <div>
                <div className="text-gray-700 font-semibold mb-2">Incoming Call</div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{callerName}</div>
                    <div className="text-sm text-gray-500">{callType} call</div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={declineCall} className="px-6 py-2 rounded-full bg-red-500 text-white">Decline</button>
                  <button onClick={answerCall} className="px-6 py-2 rounded-full bg-green-600 text-white">Answer</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-gray-700 font-semibold mb-2">In Call</div>
                <div className="text-lg font-bold">{callerName}</div>
                <div className="text-sm text-gray-500 mb-4">{callType} conversation</div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => endCall('ended-by-user')} className="px-6 py-2 bg-gray-800 text-white rounded-lg">End Call</button>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-800">Call History</div>
              <div className="text-sm text-gray-500">{history.length} items</div>
            </div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {history.length === 0 && <div className="text-sm text-gray-500">No history yet</div>}
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{h.callerName} <span className="text-xs text-gray-500">({h.callType})</span></div>
                    <div className="text-xs text-gray-500">At {formatTime(h.scheduledAt)}</div>
                  </div>
                  <div className="text-xs text-gray-600">{h.status}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FakeCallPage;
