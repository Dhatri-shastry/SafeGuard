import React, { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';

/**
 * ShakeDetectionPage
 * - Detects a shake using device motion events.
 * - Algorithm: count peaks above threshold within a short window -> trigger.
 * - Handles iOS permission flow.
 *
 * Props:
 * - userProfile (optional) - used for display or sending to contacts
 * - onTriggerSOS (optional) - callback to call when shake triggers SOS
 */
const ShakeDetectionPage = ({ userProfile, onTriggerSOS }) => {
  const [enabled, setEnabled] = useState(false);              // motion listener enabled
  const [permissionGranted, setPermissionGranted] = useState(null); // null = unknown, true/false afterwards
  const [statusMsg, setStatusMsg] = useState('Not listening');
  const [threshold, setThreshold] = useState(15);             // m/s^2 threshold for peak
  const [windowMs, setWindowMs] = useState(1000);             // time window to count peaks
  const [requiredPeaks, setRequiredPeaks] = useState(2);      // how many peaks within window -> shake
  const [cooldownMs, setCooldownMs] = useState(5000);         // cooldown after a trigger
  const lastTriggerRef = useRef(0);
  const peaksRef = useRef([]);                                // timestamps of recent peaks
  const listenerRef = useRef(null);

  // helper: trigger SOS action
  const triggerSOS = () => {
    const now = Date.now();
    if (now - lastTriggerRef.current < cooldownMs) {
      setStatusMsg('In cooldown — already triggered recently');
      return;
    }
    lastTriggerRef.current = now;

    // vibration (mobile)
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    // You can replace this with your real SOS behavior (call API, navigate to SOS page, etc.)
    if (typeof onTriggerSOS === 'function') {
      onTriggerSOS();
    } else {
      // default demo action:
      const contacts = userProfile?.emergencyContacts?.map(c => `${c.name} (${c.phone})`).join(', ') || 'No contacts';
      alert(`🚨 Shake detected — SOS triggered!\nNotifying: ${contacts}`);
    }

    setStatusMsg('SOS triggered! Cooldown active.');
    // clear peaks to avoid immediate retrigger
    peaksRef.current = [];
  };

  // called when devicemotion fires
  const handleDeviceMotion = (event) => {
    // Use acceleration if available; fallback to accelerationIncludingGravity
    const a = event.acceleration || event.accelerationIncludingGravity;
    if (!a) return;

    const x = a.x || 0;
    const y = a.y || 0;
    const z = a.z || 0;

    // magnitude of acceleration vector (m/s^2)
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // detect a peak
    if (magnitude > threshold) {
      const now = Date.now();
      // push timestamp
      peaksRef.current.push(now);
      // remove old peaks outside the window
      peaksRef.current = peaksRef.current.filter(ts => now - ts <= windowMs);

      // if enough peaks within window -> shake
      if (peaksRef.current.length >= requiredPeaks) {
        triggerSOS();
      } else {
        setStatusMsg(`Detected peak (${magnitude.toFixed(1)}). ${peaksRef.current.length}/${requiredPeaks} in ${windowMs}ms`);
      }
    }
  };

  // enable listening: either attach listener or request iOS permission first
  const enableListening = async () => {
    setStatusMsg('Requesting permission (if required)...');

    // iOS 13+ requires DeviceMotionEvent.requestPermission() when accessed via Safari
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const result = await DeviceMotionEvent.requestPermission();
        if (result === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
          setStatusMsg('Permission denied for motion sensors.');
          return;
        }
      } catch (err) {
        setPermissionGranted(false);
        setStatusMsg('Permission request failed or was dismissed.');
        console.error('DeviceMotion permission error:', err);
        return;
      }
    } else {
      // non-iOS or older browsers, permission not required
      setPermissionGranted(true);
    }

    // add listener
    if (!listenerRef.current) {
      listenerRef.current = handleDeviceMotion;
      window.addEventListener('devicemotion', listenerRef.current, { passive: true });
      setEnabled(true);
      setStatusMsg('Listening for shake...');
    }
  };

  const disableListening = () => {
    if (listenerRef.current) {
      window.removeEventListener('devicemotion', listenerRef.current);
      listenerRef.current = null;
    }
    setEnabled(false);
    setStatusMsg('Not listening');
    peaksRef.current = [];
  };

  // Simulate shake for desktop/testing
  const simulateShake = () => {
    // simulate two peaks quickly
    const now = Date.now();
    peaksRef.current.push(now - 300);
    peaksRef.current.push(now);
    // filter as usual
    peaksRef.current = peaksRef.current.filter(ts => now - ts <= windowMs);
    if (peaksRef.current.length >= requiredPeaks) triggerSOS();
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener('devicemotion', listenerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Shake Detection</h2>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <p className="text-gray-700 mb-3">
          Shake your phone vigorously (or use the simulate button) to trigger an SOS alert.
        </p>

        <div className="flex gap-2 items-center mb-4">
          {!enabled ? (
            <button
              onClick={enableListening}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Enable Motion
            </button>
          ) : (
            <button
              onClick={disableListening}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Disable Motion
            </button>
          )}

          <button
            onClick={simulateShake}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            title="Simulate a shake (for desktop/testing)"
          >
            Simulate Shake
          </button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Status: <span className="font-medium text-gray-800">{statusMsg}</span></div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Threshold (m/s²)</span>
              <input
                type="range"
                min="5"
                max="30"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <span className="text-sm text-gray-600">{threshold} m/s²</span>
            </label>

            <label className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Peaks needed</span>
              <input
                type="range"
                min="1"
                max="4"
                value={requiredPeaks}
                onChange={(e) => setRequiredPeaks(Number(e.target.value))}
              />
              <span className="text-sm text-gray-600">{requiredPeaks} peaks</span>
            </label>
          </div>

          <div className="mt-3 text-sm text-gray-500">
            Window: {windowMs} ms • Cooldown: {cooldownMs} ms
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <div>Device motion permission: {permissionGranted === null ? 'unknown' : permissionGranted ? 'granted' : 'denied'}</div>
          <div>Last trigger: {lastTriggerRef.current ? new Date(lastTriggerRef.current).toLocaleTimeString() : 'never'}</div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
        <strong>Notes:</strong>
        <ul className="list-disc pl-5 mt-2">
          <li>iOS (Safari) requires you to tap "Enable Motion" and grant permission.</li>
          <li>Adjust the threshold and peaks if your device is too sensitive or not sensitive enough.</li>
          <li>Use the simulate button when testing on desktop or emulators.</li>
        </ul>
      </div>
    </div>
  );
};

export default ShakeDetectionPage;
