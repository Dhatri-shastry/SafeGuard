import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";

// Icons
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [38, 38],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2967/2967351.png",
  iconSize: [32, 32],
});

const policeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2991/2991101.png",
  iconSize: [32, 32],
});

const ngoIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448335.png",
  iconSize: [32, 32],
});

const HelpCentersPage = () => {
  const [position, setPosition] = useState(null);
  const [helpCenters, setHelpCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const routingControlRef = useRef(null);

  // Get location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        fetchHelpCenters(coords);
      },
      (err) => {
        console.error("Location error:", err);
        alert("Please enable location access to view nearby help centers.");
      }
    );
  }, []);

  // Fetch help centers using Overpass API
  const fetchHelpCenters = async ([lat, lon]) => {
    const query = `
      [out:json];
      (
        node["amenity"="police"](around:5000,${lat},${lon});
        node["amenity"="hospital"](around:5000,${lat},${lon});
        node["amenity"="social_facility"](around:5000,${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const data = await response.json();
      const centers = data.elements.map((el) => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags.name || "Unnamed Center",
        type: el.tags.amenity,
        distance: calculateDistance(lat, lon, el.lat, el.lon),
      }));
      centers.sort((a, b) => a.distance - b.distance);
      setHelpCenters(centers);
    } catch (error) {
      console.error("Error fetching help centers:", error);
    }
  };

  // Distance calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  // ✅ Safe Routing handler (no more removeLayer errors)
  const Routing = ({ from, to }) => {
    const map = useMap();

    useEffect(() => {
      if (!from || !to || !map) return;

      // Clear existing route safely
      if (routingControlRef.current) {
        try {
          routingControlRef.current.getPlan()?.setWaypoints([]);
          map.removeControl(routingControlRef.current);
        } catch (err) {
          console.warn("Safe cleanup:", err.message);
        }
        routingControlRef.current = null;
      }

      // Create new route
      const control = L.Routing.control({
        waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        show: false,
        lineOptions: {
          styles: [{ color: "#8b5cf6", weight: 5, opacity: 0.8 }],
        },
        createMarker: () => null,
        router: new L.Routing.OSRMv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
      }).addTo(map);

      routingControlRef.current = control;

      // Safe cleanup
      return () => {
        if (routingControlRef.current) {
          try {
            routingControlRef.current.getPlan()?.setWaypoints([]);
            map.removeControl(routingControlRef.current);
          } catch (err) {
            console.warn("Cleanup skipped:", err.message);
          }
          routingControlRef.current = null;
        }
      };
    }, [from, to, map]);

    return null;
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {position ? (
        <>
          {/* Map Section */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-xl">
            <MapContainer
              center={position}
              zoom={14}
              style={{ height: "60vh", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={position} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
              <Circle center={position} radius={1000} color="#6d28d9" />

              {helpCenters.map((center) => (
                <Marker
                  key={center.id}
                  position={[center.lat, center.lon]}
                  icon={
                    center.type === "hospital"
                      ? hospitalIcon
                      : center.type === "police"
                      ? policeIcon
                      : ngoIcon
                  }
                >
                  <Popup>
                    <div className="text-sm font-semibold text-purple-700">
                      {center.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Type: {center.type}
                      <br />
                      Distance: {center.distance} km
                    </div>

                    <button
                      onClick={() => setSelectedCenter(center)}
                      className="mt-2 px-3 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                    >
                      🚗 Navigate
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-center px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      Open in Google Maps
                    </a>
                  </Popup>
                </Marker>
              ))}

              {selectedCenter && (
                <Routing
                  from={position}
                  to={[selectedCenter.lat, selectedCenter.lon]}
                />
              )}
            </MapContainer>
          </div>

          {/* ✅ Clear Route Button */}
          {selectedCenter && (
            <div className="text-center mt-5">
              <button
                onClick={() => setSelectedCenter(null)}
                className="px-6 py-2 bg-white/30 backdrop-blur-md text-purple-800 font-semibold rounded-2xl shadow-md border border-white/40 hover:bg-white/50 transition-all"
              >
                ❌ Clear Route
              </button>
            </div>
          )}

          {/* Info Panel */}
          <div className="mt-6 bg-white/30 backdrop-blur-lg rounded-2xl p-5 shadow-xl border border-white/40">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              🏥 Nearby Help Centers
            </h2>
            {helpCenters.length > 0 ? (
              <ul className="space-y-3 overflow-y-auto max-h-[40vh] pr-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
                {helpCenters.map((center, index) => (
                  <li
                    key={center.id}
                    onClick={() => setSelectedCenter(center)}
                    className="p-4 rounded-xl bg-white/50 cursor-pointer hover:bg-purple-100 border border-white/40 transition-all"
                  >
                    <div className="font-semibold text-gray-800">
                      {index + 1}. {center.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {center.type.charAt(0).toUpperCase() +
                        center.type.slice(1)}{" "}
                      — {center.distance} km away
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 italic">Fetching nearby centers...</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-screen text-purple-700 font-semibold text-lg">
          🔍 Detecting your location...
        </div>
      )}
    </div>
  );
};

export default HelpCentersPage;
