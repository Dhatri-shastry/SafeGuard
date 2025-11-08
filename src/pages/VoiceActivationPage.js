import React, { useState, useEffect } from "react";
import { Mic } from "lucide-react";

const VoiceActivationPage = ({ currentUser }) => {
  const [contacts, setContacts] = useState([]);
  const [listening, setListening] = useState(false);
  const [safeWord, setSafeWord] = useState("help me");
  const [customWord, setCustomWord] = useState("");
  const [message, setMessage] = useState("");

  // ✅ 1️⃣ Load emergency contacts directly from localStorage
  useEffect(() => {
    const cached = localStorage.getItem("emergencyContacts");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("✅ Loaded contacts from localStorage:", parsed);
        setContacts(parsed);
      } catch (err) {
        console.error("❌ Failed to parse contacts from localStorage:", err);
      }
    } else {
      console.warn("⚠️ No contacts found in localStorage yet!");
    }
  }, []);

  // 🎙️ Voice recognition setup
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
  }

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Your browser doesn’t support voice recognition.");
      return;
    }

    setListening(true);
    setMessage("🎧 Listening... Say your safe word to trigger SOS.");
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();

      console.log("🎤 Heard:", transcript);

      if (transcript.includes(safeWord.toLowerCase())) {
        triggerSOS();
      }
    };

    recognition.onerror = (event) => {
      console.error("❌ Recognition error:", event.error);
      setMessage("Error: " + event.error);
      setListening(false);
    };

    recognition.onend = () => {
      if (listening) recognition.start(); // auto-restart
    };
  };

  const stopListening = () => {
    if (recognition) recognition.stop();
    setListening(false);
    setMessage("🛑 Voice detection stopped.");
  };

  // 🚨 2️⃣ Trigger SOS Logic
  const triggerSOS = async () => {
    stopListening();
    setMessage("🚨 SOS activated by voice command!");

    alert("🚨 SOS Activated! Preparing to send alerts...");

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

    console.log("📍 Current location:", location);

    // ✅ 3️⃣ Get priority contacts
    const priorityContacts = contacts.filter(
      (c) => c.priority === true || c.priority === "true"
    );

    console.log("🧾 All contacts:", contacts);
    console.log("⭐ Priority contacts:", priorityContacts);

    if (!priorityContacts.length) {
      alert("⚠️ No priority contacts found. Please add them first in HomePage.");
      return;
    }

    // ✅ 4️⃣ Create WhatsApp message
    const msg = encodeURIComponent(
      `🚨 SOS ALERT (Voice Activated)\n\nUser: ${
        currentUser?.displayName || "A user"
      }\n📍 Location: ${
        location
          ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
          : "Location unavailable"
      }\n\nPlease respond immediately!`
    );

    // ✅ 5️⃣ Send via WhatsApp
    priorityContacts.forEach((contact, i) => {
      const phone = contact.phone.replace(/\D/g, "");
      setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      }, i * 1200);
    });

    alert("✅ WhatsApp message opened for all priority contacts!");
  };

  // ✏️ Update custom safe word
  const updateSafeWord = () => {
    if (customWord.trim()) {
      setSafeWord(customWord.trim());
      setCustomWord("");
      alert(`✅ Safe word updated to "${customWord.trim()}"`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🎙️ Voice SOS Activation
      </h2>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <button
            onClick={listening ? stopListening : startListening}
            className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center shadow-2xl transition-all ${
              listening
                ? "bg-red-500 animate-pulse"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            <Mic className="w-16 h-16 text-white" />
          </button>
          <p className="mt-4 text-gray-600 font-medium">
            {message || "Tap to start listening"}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Safe Word
            </label>
            <div className="p-4 bg-purple-50 rounded-lg text-purple-700 font-semibold text-lg">
              "{safeWord}"
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Custom Safe Word
            </label>
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
              <li>• Click the mic to start listening</li>
              <li>• Say your safe word (default: “help me”)</li>
              <li>• SOS automatically activates and opens WhatsApp</li>
              <li>• Works instantly using cached contacts</li>
              <li>• Works best on Chrome or Edge browsers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceActivationPage;
