import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  PlusCircle,
  Trash2,
  Shield,
  Mic,
  Activity,
} from "lucide-react";

const EmergencyDialPage = () => {
  const [customContacts, setCustomContacts] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [lastShake, setLastShake] = useState(0);

  const defaultContacts = [
    { name: "Women Helpline", number: "1091" },
    { name: "Police", number: "100" },
    { name: "Ambulance", number: "102" },
    { name: "Fire Station", number: "101" },
    { name: "National Emergency", number: "112" },
  ];

  const makeCall = (number) => {
    alert(`📞 Dialing ${number}...`);
    window.location.href = `tel:${number}`;
  };

  const addCustomContact = () => {
    if (!newName || !newNumber) {
      alert("Please enter both name and number.");
      return;
    }
    const newContact = { name: newName, number: newNumber };
    setCustomContacts([...customContacts, newContact]);
    setNewName("");
    setNewNumber("");
  };

  const deleteContact = (index) => {
    const updated = [...customContacts];
    updated.splice(index, 1);
    setCustomContacts(updated);
  };

  const startVoiceCommand = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    setVoiceActive(true);
    recognition.start();

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command:", command);
      setVoiceActive(false);

      if (command.includes("police")) makeCall("100");
      else if (command.includes("ambulance")) makeCall("102");
      else if (command.includes("fire")) makeCall("101");
      else if (command.includes("sos") || command.includes("help"))
        makeCall("112");
      else alert(`Unrecognized command: "${command}"`);
    };

    recognition.onerror = () => {
      alert("Voice recognition failed. Try again.");
      setVoiceActive(false);
    };
  };

  useEffect(() => {
    const handleMotion = (event) => {
      const { accelerationIncludingGravity } = event;
      const totalAcceleration = Math.sqrt(
        accelerationIncludingGravity.x ** 2 +
          accelerationIncludingGravity.y ** 2 +
          accelerationIncludingGravity.z ** 2
      );

      const now = Date.now();

      if (totalAcceleration > 25 && now - lastShake > 3000) {
        setLastShake(now);
        alert("🚨 Shake detected! Calling SOS...");
        makeCall("112");
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [lastShake]);

  const [nearbyHelp, setNearbyHelp] = useState([]);
  const findNearbyCenters = () => {
    setNearbyHelp([
      { name: "Mahila Seva Center", type: "Women Safety", distance: "0.8 km" },
      { name: "City Police Station", type: "Police", distance: "1.1 km" },
      { name: "Apollo Hospital", type: "Medical", distance: "2.3 km" },
    ]);
  };

  useEffect(() => {
    findNearbyCenters();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Shield className="w-7 h-7 text-purple-600" />
        Emergency Dial
      </h2>

      <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl mb-6">
        <p className="text-sm text-gray-700">
          🎙️ Say <b>"Call Police"</b> / <b>"SOS"</b> / <b>"Ambulance"</b> or
          just shake your phone to auto-trigger emergency calls.
        </p>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={startVoiceCommand}
          className={`px-6 py-3 rounded-full font-semibold transition shadow-md ${
            voiceActive
              ? "bg-red-600 text-white animate-pulse"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          }`}
        >
          <Mic className="inline w-5 h-5 mr-2" />
          {voiceActive ? "Listening..." : "Activate Voice Command"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {defaultContacts.map((contact) => (
          <button
            key={contact.number}
            onClick={() => makeCall(contact.number)}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl py-4 px-3 flex flex-col items-center hover:scale-105 transition transform shadow-md"
          >
            <PhoneCall className="w-6 h-6 mb-2" />
            <span className="font-semibold text-sm">{contact.name}</span>
            <span className="text-xs opacity-80">{contact.number}</span>
          </button>
        ))}
      </div>

      {/* ✅ Fixed layout for mobile responsiveness */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Your Trusted Contacts
        </h3>

        {/* Stack on small screens, row on larger */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full sm:flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            className="w-full sm:flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={addCustomContact}
            className="w-full sm:w-auto bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 flex items-center justify-center gap-1"
          >
            <PlusCircle className="w-5 h-5" />
            Add
          </button>
        </div>

        {customContacts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No custom contacts added yet. Add your family or trusted friends.
          </p>
        ) : (
          <ul className="space-y-3">
            {customContacts.map((contact, index) => (
              <li
                key={index}
                className="flex justify-between items-center border p-3 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.number}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => makeCall(contact.number)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <PhoneCall className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteContact(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Nearby Help Centers
        </h3>
        <ul className="space-y-3">
          {nearbyHelp.map((place, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-800">{place.name}</p>
                <p className="text-xs text-gray-600">
                  {place.type} • {place.distance} away
                </p>
              </div>
              <Activity className="w-5 h-5 text-green-600" />
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => makeCall("112")}
          className="bg-red-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-red-700 shadow-lg transition"
        >
          🚨 SOS Quick Call
        </button>
        <p className="text-xs text-gray-500 mt-2">
          This will instantly dial the National Emergency number (112)
        </p>
      </div>
    </div>
  );
};

export default EmergencyDialPage;
