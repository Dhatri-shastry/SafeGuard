import React, { useEffect, useRef, useState } from "react";
import { Phone } from "lucide-react";

const ShakeDetectionPage = ({ userProfile }) => {
  const [enabled, setEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [statusMsg, setStatusMsg] = useState("Not listening");
  const [threshold, setThreshold] = useState(15);
  const [windowMs, setWindowMs] = useState(1000);
  const [requiredPeaks, setRequiredPeaks] = useState(2);
  const [cooldownMs, setCooldownMs] = useState(5000);
  const lastTriggerRef = useRef(0);
  const peaksRef = useRef([]);
  const listenerRef = useRef(null);

  // ✅ Load cached contacts from localStorage for instant SOS
  const [contacts, setContacts] = useState([]);
  useEffect(() => {
    const cached = localStorage.getItem("emergencyContacts");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setContacts(parsed);
        console.log("✅ Loaded contacts from localStorage:", parsed);
      } catch (err) {
        console.error("❌ Failed to parse local contacts:", err);
      }
    } else {
      console.warn("⚠️ No contacts found in cache!");
    }
  }, []);

  // ✅ Real SOS trigger (replaces the old dummy one)
  const triggerSOS = async () => {
    const now = Date.now();
    if (now - lastTriggerRef.current < cooldownMs) {
      setStatusMsg("In cooldown — already triggered recently");
      return;
    }
    lastTriggerRef.current = now;

    // Vibration
    if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);

    setStatusMsg("🚨 SOS Triggered via Shake!");

    // ✅ Get current location
    let location = null;
    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            location = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            resolve();
          },
          (err) => {
            console.warn("⚠️ Location access denied:", err.message);
            resolve();
          }
        );
      });
    }

    // ✅ Filter only priority contacts
    const priorityContacts = contacts.filter(
      (c) => c.priority === true || c.priority === "true"
    );

    console.log("📱 All contacts:", contacts);
    console.log("⭐ Priority contacts:", priorityContacts);

    if (!priorityContacts.length) {
      alert("⚠️ No priority contacts found. Please add them in HomePage.");
      return;
    }

    // ✅ Prepare WhatsApp message
    const msg = encodeURIComponent(
      `🚨 SOS ALERT (Shake Activated)\n\nUser: ${
        userProfile?.name || "Someone"
      }\n📍 Location: ${
        location
          ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
          : "Unavailable"
      }\n\nPlease respond immediately!`
    );

    // ✅ Open WhatsApp for each priority contact (auto-open)
    priorityContacts.forEach((contact, index) => {
      const phone = contact.phone.replace(/\D/g, "");
      setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      }, index * 1500);
    });

    alert("✅ WhatsApp message opened for all priority contacts!");

    peaksRef.current = [];
  };

  // ✅ Motion Detection (same logic)
  const handleDeviceMotion = (event) => {
    const a = event.acceleration || event.accelerationIncludingGravity;
    if (!a) return;

    const x = a.x || 0;
    const y = a.y || 0;
    const z = a.z || 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    if (magnitude > threshold) {
      const now = Date.now();
      peaksRef.current.push(now);
      peaksRef.current = peaksRef.current.filter((ts) => now - ts <= windowMs);

      if (peaksRef.current.length >= requiredPeaks) {
        triggerSOS();
      } else {
        setStatusMsg(
          `Detected peak (${magnitude.toFixed(1)}). ${
            peaksRef.current.length
          }/${requiredPeaks}`
        );
      }
    }
  };

  const enableListening = async () => {
    setStatusMsg("Requesting permission (if required)...");
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      try {
        const result = await DeviceMotionEvent.requestPermission();
        if (result !== "granted") {
          setPermissionGranted(false);
          setStatusMsg("Permission denied for motion sensors.");
          return;
        }
        setPermissionGranted(true);
      } catch (err) {
        console.error("Permission error:", err);
        setStatusMsg("Permission request failed.");
        return;
      }
    } else {
      setPermissionGranted(true);
    }

    if (!listenerRef.current) {
      listenerRef.current = handleDeviceMotion;
      window.addEventListener("devicemotion", listenerRef.current, {
        passive: true,
      });
      setEnabled(true);
      setStatusMsg("Listening for shake...");
    }
  };

  const disableListening = () => {
    if (listenerRef.current) {
      window.removeEventListener("devicemotion", listenerRef.current);
      listenerRef.current = null;
    }
    setEnabled(false);
    setStatusMsg("Not listening");
    peaksRef.current = [];
  };

  const simulateShake = () => {
    peaksRef.current.push(Date.now() - 300);
    peaksRef.current.push(Date.now());
    peaksRef.current = peaksRef.current.filter(
      (ts) => Date.now() - ts <= windowMs
    );
    if (peaksRef.current.length >= requiredPeaks) triggerSOS();
  };

  useEffect(() => {
    return () => {
      if (listenerRef.current)
        window.removeEventListener("devicemotion", listenerRef.current);
    };
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
          >
            Simulate Shake
          </button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            Status:{" "}
            <span className="font-medium text-gray-800">{statusMsg}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">
                Threshold (m/s²)
              </span>
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
              <span className="text-sm text-gray-600">
                {requiredPeaks} peaks
              </span>
            </label>
          </div>

          <div className="mt-3 text-sm text-gray-500">
            Window: {windowMs} ms • Cooldown: {cooldownMs} ms
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <div>
            Device motion permission:{" "}
            {permissionGranted === null
              ? "unknown"
              : permissionGranted
              ? "granted"
              : "denied"}
          </div>
          <div>
            Last trigger:{" "}
            {lastTriggerRef.current
              ? new Date(lastTriggerRef.current).toLocaleTimeString()
              : "never"}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
        <strong>Notes:</strong>
        <ul className="list-disc pl-5 mt-2">
          <li>Tap "Enable Motion" to start listening.</li>
          <li>Shake phone strongly twice within a second to trigger SOS.</li>
          <li>Works instantly using cached contacts (from HomePage).</li>
          <li>Use “Simulate Shake” for desktop testing.</li>
        </ul>
      </div>
    </div>
  );
};

export default ShakeDetectionPage;
