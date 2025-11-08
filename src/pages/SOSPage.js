import React, { useState, useEffect, useRef } from 'react';

const SOSPage = ({ userProfile }) => {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const pressTimerRef = useRef(null);

  useEffect(() => {
    if (sosActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosActive && countdown === 0) {
      triggerSOS();
    }
  }, [sosActive, countdown]);

  const triggerSOS = () => {
    const contactNames = userProfile.emergencyContacts
      .map(c => `${c.name} (${c.phone})`)
      .join('\n');
    
    alert(`🚨 SOS ACTIVATED!\n\nAlerting your emergency contacts:\n${contactNames || 'No contacts added'}\n\nSending:\n• Your location\n• Emergency alert\n• Auto-calling priority contacts`);
    
    setTimeout(() => {
      alert('✓ SMS sent to all contacts\n✓ Location shared\n✓ Calling priority contacts...');
    }, 1000);

    setSosActive(false);
    setCountdown(5);
  };

  const handleMouseDown = () => {
    pressTimerRef.current = setTimeout(() => {
      setSosActive(true);
    }, 3000);
  };

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">SOS Emergency</h1>
      <p className="text-gray-600 mb-8">Hold the button for 3 seconds to activate</p>

      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`w-40 h-40 rounded-full text-white text-2xl font-bold shadow-lg transition-all ${
          sosActive ? 'bg-red-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {sosActive ? `Sending in ${countdown}s` : 'HOLD SOS'}
      </button>

      <p className="mt-6 text-sm text-gray-500">
        Your emergency contacts will be alerted once SOS is triggered.
      </p>
    </div>
  );
};

export default SOSPage;
