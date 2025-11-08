import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const LiveTrackingPage = ({ userProfile }) => {
  const [tracking, setTracking] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef(null);

  // Toggle contact selection
  const toggleContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Start tracking user location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('❌ Your browser does not support live location tracking.');
      return;
    }

    setTracking(true);
    setError(null);
    setLoading(true);
    

    // Start watching position (auto updates every few seconds)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
        setLoading(false);
        console.log("📍 Updated Location:", pos.coords);
      },
      (err) => {
        console.error("⚠️ Geolocation error:", err);
        setError('⚠️ Location access denied. Using default location (Bangalore).');
        setLocation({ lat: 12.9716, lng: 77.5946 });
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  // Stop tracking when leaving page
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Simulate sharing location to selected contacts (mock)
  useEffect(() => {
    if (tracking && location && selectedContacts.length > 0) {
      console.log(`📡 Sharing location with ${selectedContacts.length} contact(s)...`);
    }
  }, [location]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📍 Live Location Tracking</h2>

      {/* --- Contact Selection --- */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Select Contacts to Share Location</h3>

        {!userProfile?.emergencyContacts?.length ? (
          <p className="text-gray-600 text-sm">
            You have no emergency contacts added yet. Please add them in your profile setup.
          </p>
        ) : (
          <div className="space-y-2 mb-6">
            {userProfile.emergencyContacts.map((contact) => (
              <label
                key={contact.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => toggleContact(contact.id)}
                  className="w-5 h-5 text-purple-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{contact.name}</div>
                  <div className="text-sm text-gray-600">{contact.phone}</div>
                </div>
                {contact.priority && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Priority
                  </span>
                )}
              </label>
            ))}
          </div>
        )}

        <button
  onClick={startTracking}
  disabled={tracking}
  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
>
  <MapPin className="w-5 h-5" />
  {tracking ? 'Tracking Active' : 'Start Live Tracking'}
</button>

      </div>

      {/* --- Map Display --- */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Your Current Location</h3>

        {location ? (
          <div className="bg-gray-100 rounded-lg h-96 overflow-hidden">
            <iframe
              title="live-map"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                location.lng - 0.01
              }%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${
                location.lat + 0.01
              }&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            <MapPin className="w-8 h-8 mr-2" />
            {loading ? 'Fetching location...' : 'No location data yet'}
          </div>
        )}

        {location && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>
              Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
        )}

        {tracking && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">Live tracking active</span>
            </div>
            <p className="text-sm text-gray-600">
              Sharing location with {selectedContacts.length} contact(s)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
      )}

      <p className="mt-6 text-xs text-gray-500 text-center">
        © OpenStreetMap contributors — Free, real-time live tracking
      </p>
    </div>
  );
};

export default LiveTrackingPage;
