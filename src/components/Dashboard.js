import React, { useState } from 'react';

const Dashboard = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const handleSOSClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          // Here you would typically send this location to your emergency contacts
          console.log('Emergency location:', position.coords);
          // Add your emergency notification logic here
        },
        (error) => {
          setError('Error getting location: ' + error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={handleSOSClick}
              className="bg-red-600 text-white text-xl font-bold py-6 px-12 rounded-full hover:bg-red-700 transition-colors shadow-lg"
            >
              SOS
            </button>
            {error && (
              <div className="mt-4 text-red-600">
                {error}
              </div>
            )}
            {location && (
              <div className="mt-4">
                <p className="text-gray-600">Location sent:</p>
                <p className="text-sm">Latitude: {location.latitude}</p>
                <p className="text-sm">Longitude: {location.longitude}</p>
              </div>
            )}
          </div>

          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors">
                Call Emergency Contact
              </button>
              <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors">
                Share Location
              </button>
              <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors">
                Record Audio
              </button>
              <button className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 transition-colors">
                Safety Tips
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;