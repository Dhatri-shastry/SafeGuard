import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Navigation, Shield, Building2, Ambulance } from 'lucide-react';

// Haversine distance (km)
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Returns Overpass QL to search amenities within radius (meters)
const buildOverpassQuery = (lat, lon, radiusMeters = 3000) => {
  // We'll search for nodes/ways/relations with amenity tags we care about
  // police, hospital, fire_station, clinic, social_facility
  return `
    [out:json][timeout:25];
    (
      node["amenity"~"police|hospital|fire_station|clinic|social_facility"](around:${radiusMeters},${lat},${lon});
      way["amenity"~"police|hospital|fire_station|clinic|social_facility"](around:${radiusMeters},${lat},${lon});
      relation["amenity"~"police|hospital|fire_station|clinic|social_facility"](around:${radiusMeters},${lat},${lon});
    );
    out center meta;
  `;
};

const HelpCentersOSM = () => {
  const [location, setLocation] = useState(null);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(3000); // meters

  useEffect(() => {
    // Get user's live location
    if (!navigator.geolocation) {
      setError('Geolocation not supported in this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(coords);
        fetchNearby(coords.lat, coords.lon, radius);
      },
      (err) => {
        console.error(err);
        setError('Location access denied. Please enable location/GPS.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch from Overpass
  const fetchNearby = async (lat, lon, radiusMeters = 3000) => {
    setLoading(true);
    setError('');
    setCenters([]);

    const query = buildOverpassQuery(lat, lon, radiusMeters);
    const endpoint = 'https://overpass-api.de/api/interpreter';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams({ data: query }).toString()
      });

      if (!res.ok) {
        throw new Error(`Overpass error: ${res.status}`);
      }

      const data = await res.json();

      // Overpass returns elements: nodes/ways/relations. For ways/relations, geometry center is in .center
      const places = data.elements
        .map((el) => {
          const latEl = el.lat ?? el.center?.lat;
          const lonEl = el.lon ?? el.center?.lon;
          if (!latEl || !lonEl) return null;

          // Determine type with priority
          const tags = el.tags || {};
          const amen = tags.amenity || tags.shop || tags.office || 'help';
          const type =
            amen.includes('police') ? 'Police Station' :
            amen.includes('hospital') ? 'Hospital' :
            amen.includes('fire_station') ? 'Fire Station' :
            amen.includes('clinic') ? 'Clinic' :
            amen.includes('social_facility') ? 'Social Facility' :
            'Help Center';

          return {
            id: `${el.type}/${el.id}`,
            name: tags.name || (type === 'Police Station' ? 'Police Station' : 'Help Center'),
            address: tags['addr:full'] || tags['addr:street'] || tags.vicinity || tags['contact:phone'] || '',
            lat: Number(latEl),
            lon: Number(lonEl),
            type,
            phone: tags['phone'] || tags['contact:phone'] || '',
            distanceKm: haversineKm(lat, lon, Number(latEl), Number(lonEl))
          };
        })
        .filter(Boolean)
        // unique by id (Overpass may return duplicates)
        .reduce((acc, cur) => {
          if (!acc.find((x) => x.id === cur.id)) acc.push(cur);
          return acc;
        }, [])
        .sort((a, b) => a.distanceKm - b.distanceKm);

      setCenters(places);
    } catch (err) {
      console.error('Overpass fetch error', err);
      setError('Failed to fetch nearby help centers. Try again (rate limits may apply).');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (!location) return;
    fetchNearby(location.lat, location.lon, radius);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        Fetching nearby help centers...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        {error} <br />
        <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-gray-100 rounded">Reload</button>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Nearby Help Centers (OpenStreetMap)
          </h2>
          {location && (
            <div className="text-sm text-gray-600 mt-1">
              <MapPin className="inline-block w-4 h-4 text-purple-600 mr-1" />
              Your location: {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Radius (m)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded"
          />
          <button onClick={handleRefresh} className="px-3 py-1 bg-purple-600 text-white rounded">Refresh</button>
        </div>
      </div>

      {centers.length === 0 ? (
        <div className="p-6 bg-yellow-50 rounded">No help centers found in this radius. Try increasing radius or refresh.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {centers.map((c) => (
            <div key={c.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                  {c.type.includes('Police') ? <Shield className="w-6 h-6 text-blue-600" /> :
                   c.type.includes('Hospital') ? <Ambulance className="w-6 h-6 text-red-600" /> :
                   <Building2 className="w-6 h-6 text-green-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{c.name}</div>
                      <div className="text-sm text-gray-500">{c.address || 'Address not available'}</div>
                    </div>
                    <div className="text-sm text-gray-600">{(c.distanceKm).toFixed(2)} km</div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <a
                      className="flex-1 py-2 bg-green-600 text-white rounded text-center text-sm"
                      href={c.phone ? `tel:${c.phone}` : `tel:`}
                      onClick={(e) => {
                        if (!c.phone) {
                          e.preventDefault();
                          alert('Phone number not available for this place.');
                        }
                      }}
                    >
                      <Phone className="inline-block w-4 h-4 mr-2" /> Call
                    </a>

                    <a
                      className="flex-1 py-2 bg-blue-600 text-white rounded text-center text-sm"
                      href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${location.lat}%2C${location.lon}%3B${c.lat}%2C${c.lon}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Navigation className="inline-block w-4 h-4 mr-2" /> Navigate
                    </a>

                    <button
                      className="px-3 py-2 bg-gray-100 rounded text-sm"
                      onClick={() => {
                        // open OSM place page in new tab
                        const osmTypeId = c.id; // e.g., node/12345 or way/6789
                        const [type, id] = osmTypeId.split('/');
                        const url = `https://www.openstreetmap.org/${type}/${id}`;
                        window.open(url, '_blank');
                      }}
                    >
                      View on OSM
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        Data from OpenStreetMap contributors. Powered by Overpass API. Please respect Overpass rate limits (public endpoints may throttle).
      </div>

      <div className="mt-4">
        {/* Simple OSM embed showing user marker centered (no marker pin library) */}
        {location && (
          <div className="mt-4 border rounded overflow-hidden">
            <iframe
              title="osm-map"
              width="100%"
              height="360"
              frameBorder="0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon-0.03}%2C${location.lat-0.015}%2C${location.lon+0.03}%2C${location.lat+0.015}&layer=mapnik&marker=${location.lat}%2C${location.lon}`}
            />
            <div className="p-2 text-xs text-gray-600">Map: OpenStreetMap — your location in center</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCentersOSM;
