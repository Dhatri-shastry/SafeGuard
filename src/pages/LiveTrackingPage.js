import React, { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const LiveTrackingPage = ({ currentUser }) => {
  const [contacts, setContacts] = useState([]);
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  // 🔹 Fetch contacts once user logs in
  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser?.uid) return;
      const ref = collection(db, "users", currentUser.uid, "emergencyContacts");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setContacts(data);
    };
    fetchContacts();
  }, [currentUser]);

  // 🔹 Start tracking live location
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("❌ Geolocation not supported.");
      return;
    }

    setTracking(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);

        sendWhatsApp(coords); // initial send

        // 🔁 Start live updating every 30 seconds
        intervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const newCoords = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              };
              setLocation(newCoords);
              sendWhatsApp(newCoords);
            },
            (err) => console.error("Location error:", err),
            { enableHighAccuracy: true }
          );
        }, 30000);

        // 🔄 Continuous location updates in map
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (err) => console.error("Geo error:", err),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      },
      (err) => {
        console.error("Error getting location:", err);
        alert("⚠️ Please enable location permission");
      }
    );
  };

  // 🔹 Send WhatsApp messages to all priority contacts
  const sendWhatsApp = (coords) => {
  const priorityContacts = contacts.filter(
    (c) => c && (c.priority === true || c.priority === "true" || c.priority)
  );
  if (priorityContacts.length === 0) {
    console.warn("No priority contacts found to receive live updates.");
    return;
  }

  const msg = encodeURIComponent(
    `🚨 *Live SOS Location Update from SafeGuard*\n\n📍 My current location:\nhttps://www.google.com/maps?q=${coords.lat},${coords.lng}\n\nThis message updates automatically every 30 seconds. Stay connected. 💜`
  );

  priorityContacts.forEach((contact) => {
    let phone = (contact.phone || "").replace(/\D/g, ""); // remove non-digits

    // ✅ Add country code if missing
    if (phone.startsWith("0")) {
      phone = phone.substring(1); // remove starting 0
    }
    if (!phone.startsWith("91")) {
      phone = "91" + phone; // default to India
    }

    const link = `https://wa.me/${phone}?text=${msg}`;
    window.open(link, "_blank");
  });
};

  // 🔹 Cleanup intervals & watchers
  useEffect(() => {
    return () => {
      if (watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📍 Live Location Tracking
      </h2>

      <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-md border border-gray-200">
        <button
          onClick={startTracking}
          disabled={tracking}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
        >
          {tracking ? "Live Tracking Active" : "Start Live Tracking"}
        </button>
      </div>

      {location && (
        <div className="mt-6 bg-white/70 p-4 rounded-2xl shadow-md border border-gray-200">
          <iframe
            title="live-map"
            width="100%"
            height="400"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              location.lng - 0.01
            }%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${
              location.lat + 0.01
            }&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
          ></iframe>

          <p className="mt-3 text-sm text-gray-700">
            📍 Current Location: {location.lat.toFixed(4)},{" "}
            {location.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingPage;
