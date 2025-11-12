import React, { useState, useEffect, useRef } from "react";

const SOSPage = ({ userProfile }) => {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [holding, setHolding] = useState(false);
  const [location, setLocation] = useState(null);
  const [readyToSend, setReadyToSend] = useState(false);
  const pressTimerRef = useRef(null);
  const audioRef = useRef(null); // 🎵 reference for SOS sound

  // 🧭 Get location once SOS starts
  useEffect(() => {
    if (sosActive) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (err) => {
            console.warn("Location error:", err.message);
            alert("⚠️ Please enable location access for SOS.");
          }
        );
      }
    }
  }, [sosActive]);

  // 🕒 Countdown logic
  useEffect(() => {
    if (sosActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosActive && countdown === 0) {
      setReadyToSend(true);
    }
  }, [sosActive, countdown]);

  // 🚨 Play SOS Sound when activated
  useEffect(() => {
    if (sosActive) {
      try {
        audioRef.current?.play().catch(() => {
          console.warn("Autoplay blocked. User interaction needed.");
        });
      } catch (err) {
        console.error("Error playing sound:", err);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // reset sound
      }
    }
  }, [sosActive]);

  // 🚨 Function to send WhatsApp message
  const sendViaWhatsApp = () => {
    const contacts = userProfile?.emergencyContacts?.filter((c) => c.priority) || [];
    if (!contacts.length) {
      alert("⚠️ No priority contacts found. Please add them first.");
      resetSOS();
      return;
    }

    const message = encodeURIComponent(
      `🚨 SOS ALERT 🚨\n\n${userProfile?.name || "A user"} needs immediate help!\n` +
        `📍 Location: https://www.google.com/maps?q=${location?.lat},${location?.lng}\n\n` +
        `Please respond immediately!`
    );

    contacts.forEach((contact, i) => {
      const phone = contact.phone.replace(/\D/g, "");
      setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
      }, i * 800);
    });

    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    alert("✅ WhatsApp message opened for all priority contacts!");
    resetSOS();
  };

  const resetSOS = () => {
    setSosActive(false);
    setCountdown(5);
    setHolding(false);
    setReadyToSend(false);
  };

  // ✋ Detect 3-second hold
  const startHold = () => {
    setHolding(true);
    pressTimerRef.current = setTimeout(() => {
      setSosActive(true);
      setHolding(false);
    }, 3000);
  };

  const endHold = () => {
    setHolding(false);
    clearTimeout(pressTimerRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-pink-100">
      <h1 className="text-3xl font-bold text-red-600 mb-6">🚨 SOS Emergency</h1>
      <p className="text-gray-700 mb-8 text-center">
        Hold the <b>SOS</b> button for 3 seconds to activate an alert.
      </p>

      {/* 🎵 SOS Alarm Sound */}
      <audio ref={audioRef} src="/sos-alarm.mp3" loop preload="auto" />

      {/* SOS Button */}
      <button
        onMouseDown={startHold}
        onMouseUp={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        className={`w-48 h-48 rounded-full text-white text-2xl font-bold shadow-2xl transition-all duration-300 ${
          sosActive
            ? "bg-red-700 animate-pulse scale-105"
            : holding
            ? "bg-red-600 scale-95"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {sosActive
          ? readyToSend
            ? "Ready to Send!"
            : `Sending in ${countdown}s`
          : holding
          ? "Hold..."
          : "HOLD SOS"}
      </button>

      {readyToSend && (
        <div className="mt-8 flex flex-col items-center">
          <p className="text-gray-700 mb-3 text-center">
            🚨 SOS activated! Click below to open WhatsApp and notify your contacts.
          </p>
          <button
            onClick={sendViaWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md font-semibold transition"
          >
            📲 Send via WhatsApp
          </button>
        </div>
      )}

      {location && (
        <p className="mt-4 text-sm text-gray-500">
          📍 Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      )}
    </div>
  );
};

export default SOSPage;
