import React, { useState } from 'react';
import { MapPin, Phone, Users, X, User } from 'lucide-react';

const ProfileSetup = ({ setUserProfile, setCurrentPage }) => {
  const [name, setName] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);
  const [contactsPermission, setContactsPermission] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', priority: false });

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission(true);
          alert('Location access granted!');
        },
        () => {
          alert('Location access denied. Please enable it in your browser settings.');
        }
      );
    }
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      setEmergencyContacts([...emergencyContacts, { ...newContact, id: Date.now() }]);
      setNewContact({ name: '', phone: '', priority: false });
    }
  };

  const removeContact = (id) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  const handleComplete = () => {
    if (!name) {
      alert('Please enter your name');
      return;
    }
    setUserProfile({
      name,
      locationPermission,
      contactsPermission,
      emergencyContacts
    });
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">Set up your safety preferences</p>

          {/* Name input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Location & Contacts Permissions */}
          <div className="space-y-4 mb-6">
            <div className="p-4 border-2 border-gray-300 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-800">Location Access</div>
                  <div className="text-sm text-gray-600">Required for tracking and emergency features</div>
                </div>
              </div>
              <button
                onClick={requestLocationPermission}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  locationPermission 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {locationPermission ? '✓ Enabled' : 'Enable'}
              </button>
            </div>

            <div className="p-4 border-2 border-gray-300 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-800">Contacts Access</div>
                  <div className="text-sm text-gray-600">Quick add emergency contacts</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={contactsPermission}
                onChange={(e) => setContactsPermission(e.target.checked)}
                className="w-5 h-5 accent-purple-600"
              />
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Emergency Contacts
            </h3>

            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex justify-between items-center bg-gray-50 p-3 mb-2 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{contact.name}</div>
                  <div className="text-sm text-gray-600">{contact.phone}</div>
                </div>
                <button onClick={() => removeContact(contact.id)}>
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ))}

            <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg">
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Contact Name"
              />
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Phone Number"
              />
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={newContact.priority}
                  onChange={(e) => setNewContact({ ...newContact, priority: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-700">Set as priority contact</span>
              </label>
              <button
                onClick={handleAddContact}
                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Add Contact
              </button>
            </div>
          </div>

          {/* Complete Button */}
          <button
            onClick={handleComplete}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
            Complete Setup & Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
