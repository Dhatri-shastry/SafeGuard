import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Shield } from "lucide-react";

// Fix Leaflet default marker path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const SafeWalkPage = () => {
  const [location, setLocation] = useState(null);
  const [safeScore, setSafeScore] = useState(null);
  const [dangerZones, setDangerZones] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [sevaCenters, setSevaCenters] = useState([]);
  const [showSafetyLayer, setShowSafetyLayer] = useState(false);

  // Fake safety score logic
  const fetchSafetyScore = async (lat, lng) => {
    const base = 70 + 20 * Math.sin(lat * 0.1 + lng * 0.1);
    const noise = Math.random() * 10 - 5;
    return Math.max(0, Math.min(100, Math.round(base + noise)));
  };

  // Get current location and generate zones
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Location access not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        const score = await fetchSafetyScore(latitude, longitude);
        setSafeScore(score);

        // Generate mock data
        const generatedDanger = Array.from({ length: 5 }).map(() => ({
          id: Math.random(),
          lat: latitude + (Math.random() - 0.5) * 0.02,
          lng: longitude + (Math.random() - 0.5) * 0.02,
          type: Math.random() > 0.5 ? "bar" : "isolated",
        }));

        const generatedSafe = Array.from({ length: 5 }).map(() => ({
          id: Math.random(),
          lat: latitude + (Math.random() - 0.5) * 0.02,
          lng: longitude + (Math.random() - 0.5) * 0.02,
          type: Math.random() > 0.5 ? "road" : "police",
        }));

        const generatedSeva = Array.from({ length: 3 }).map(() => ({
          id: Math.random(),
          lat: latitude + (Math.random() - 0.5) * 0.015,
          lng: longitude + (Math.random() - 0.5) * 0.015,
        }));

        setDangerZones(generatedDanger);
        setSafeZones(generatedSafe);
        setSevaCenters(generatedSeva);
      },
      (err) => {
        console.error(err);
        alert("Using fallback location (Bangalore).");
        setLocation({ lat: 12.9716, lng: 77.5946 });
        fetchSafetyScore(12.9716, 77.5946).then(setSafeScore);
      }
    );
  }, []);

  const getSafetyColor = () => {
    if (safeScore >= 70) return "green";
    if (safeScore >= 40) return "orange";
    return "red";
  };

  const handleShowSafety = () => {
    setShowSafetyLayer(true);
  };

  // Custom icons
  const redDangerIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/463/463612.png",
    iconSize: [38, 38],
  });

  const greenSafeIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/845/845646.png",
    iconSize: [38, 38],
  });

  const shieldIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
    iconSize: [40, 40],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <Navigation className="w-6 h-6 text-purple-600" />
        Smart Safe Walk
      </h2>

      {/* Top info */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        {location && (
          <p className="text-gray-600 text-sm">
            📍 Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        )}
        <p className="text-sm mt-1">
          Safety Score:{" "}
          <span className="font-bold" style={{ color: getSafetyColor() }}>
            {safeScore ?? "—"}
          </span>{" "}
          {safeScore
            ? safeScore >= 70
              ? "✅ High Safety"
              : safeScore >= 40
              ? "⚠️ Moderate Safety"
              : "🚨 Low Safety"
            : ""}
        </p>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleShowSafety}
            className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Find Safe Route
          </button>
        </div>
      </div>

      {/* Map container */}
      <div
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ height: "600px", position: "relative" }}
      >
        {location ? (
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='© OpenStreetMap | CartoDB'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            />

            {/* Your current location */}
            <Marker position={[location.lat, location.lng]}>
              <Popup>📍 You are here</Popup>
            </Marker>

            {/* Show only after click */}
            {showSafetyLayer && (
              <>
                {/* Green safe zone glow */}
                <Circle
                  center={[location.lat, location.lng]}
                  radius={800}
                  pathOptions={{
                    color: "#16a34a",
                    fillColor: "#22c55e",
                    fillOpacity: 0.15,
                  }}
                />

                {/* Red danger zones */}
                {dangerZones.map((zone) => (
                  <Marker
                    key={zone.id}
                    position={[zone.lat, zone.lng]}
                    icon={redDangerIcon}
                  >
                    <Popup>
                      🚨 {zone.type === "bar" ? "Bar / Pub Area" : "Isolated Zone"}
                    </Popup>
                  </Marker>
                ))}

                {/* Green safe zones */}
                {safeZones.map((zone) => (
                  <Marker
                    key={zone.id}
                    position={[zone.lat, zone.lng]}
                    icon={greenSafeIcon}
                  >
                    <Popup>
                      ✅{" "}
                      {zone.type === "police"
                        ? "Police Station"
                        : "Main Road / Safe Path"}
                    </Popup>
                  </Marker>
                ))}

                {/* Mahila Seva Centers */}
                {sevaCenters.map((center) => (
                  <Marker
                    key={center.id}
                    position={[center.lat, center.lng]}
                    icon={shieldIcon}
                  >
                    <Popup>🛡️ Mahila Seva Center</Popup>
                  </Marker>
                ))}
              </>
            )}
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Loading map...
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-gray-700 text-sm flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-600" />
        <span>
          🛡️ Seva Centers | ✅ Safe Zones | 🚨 Unsafe Regions | Green area =
          Safe Radius
        </span>
      </div>
    </div>
  );
};

export default SafeWalkPage;
