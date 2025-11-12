import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { MapPin, Phone, Plus, Upload } from "lucide-react";

const ProfileSetup = ({ setUserProfile, currentUser, setCurrentPage, userProfile }) => {
  const [name, setName] = useState("");
  const [contacts, setContacts] = useState([]);
  const [locationAccess, setLocationAccess] = useState(false);
  const [contactAccess, setContactAccess] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [priority, setPriority] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState("");

  // Prefill fields when editing (userProfile passed) or load profile on first-time setup
  useEffect(() => {
    // If a userProfile prop is provided, we are in edit mode: prefill fields and don't auto-redirect
    if (userProfile) {
      setName(userProfile.name || "");
      setProfilePic(userProfile.profilePic || "");
      setLocationAccess(!!userProfile.locationAccess);
      setContactAccess(!!userProfile.contactAccess);
      setContacts(userProfile.emergencyContacts || []);
      return;
    }

    // Otherwise (first-time flow) load from Firestore and redirect to home if profile exists
    const loadProfile = async () => {
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile(data);
          setCurrentPage("home");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    if (currentUser) loadProfile();
  }, [currentUser, setUserProfile, setCurrentPage, userProfile]);

  // Handle adding emergency contacts
  const handleAddContact = () => {
    if (!contactName || !contactPhone) return;
    setContacts([...contacts, { name: contactName, phone: contactPhone, priority }]);
    setContactName("");
    setContactPhone("");
    setPriority(false);
  };

  // ✅ Handle Base64 image upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result); // Save as Base64 string
    };
    reader.readAsDataURL(file);
  };

  // Save profile to Firestore
  const handleSaveProfile = async () => {
    if (!name) {
      alert("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        name,
        profilePic, // ✅ store Base64 string
        locationAccess,
        contactAccess,
        emergencyContacts: contacts,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", currentUser.uid), profileData);
      setUserProfile(profileData);
      alert("✅ Profile saved successfully!");
      setCurrentPage("home");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Your Profile</h2>
      <p className="text-gray-600 mb-6">Set up your safety preferences</p>

      <div className="space-y-4 bg-white shadow-lg p-6 rounded-2xl">
        
        {/* ✅ Profile Picture */}
        <div className="flex flex-col items-center mb-4">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-500 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
              <Upload className="w-6 h-6" />
            </div>
          )}
          <label className="cursor-pointer mt-3 text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700">
            {profilePic ? "Change Photo" : "Upload Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Your Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Location Access */}
        <div className="flex items-center justify-between border p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <MapPin className="text-purple-600" />
            <div>
              <p className="font-medium">Location Access</p>
              <p className="text-sm text-gray-500">
                Required for tracking and emergency features
              </p>
            </div>
          </div>
          <button
            onClick={() => setLocationAccess(!locationAccess)}
            className={`px-4 py-2 rounded-lg text-white ${
              locationAccess ? "bg-green-600" : "bg-purple-600"
            }`}
          >
            {locationAccess ? "Enabled" : "Enable"}
          </button>
        </div>

        {/* Contact Access */}
        <div className="flex items-center justify-between border p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <Phone className="text-purple-600" />
            <div>
              <p className="font-medium">Contacts Access</p>
              <p className="text-sm text-gray-500">Quick add emergency contacts</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={contactAccess}
            onChange={() => setContactAccess(!contactAccess)}
            className="w-5 h-5 accent-purple-600"
          />
        </div>

        {/* Emergency Contacts */}
        <div className="border p-4 rounded-lg bg-purple-50">
          <p className="font-semibold text-purple-700 mb-2">Emergency Contacts</p>

          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact Name"
              className="w-full sm:flex-1 p-2 border rounded-lg"
            />
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full sm:flex-1 p-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={priority}
              onChange={() => setPriority(!priority)}
              className="accent-purple-600"
            />
            <span className="text-sm">Set as priority contact</span>
          </div>

          <button
            onClick={handleAddContact}
            className="w-full bg-purple-600 text-white rounded-lg py-2 font-semibold hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Contact
          </button>

          {contacts.length > 0 && (
            <ul className="mt-3 space-y-2">
              {contacts.map((c, i) => (
                <li key={i} className="text-sm text-gray-800 bg-white rounded-lg p-2 border">
                  {c.name} - {c.phone}{" "}
                  {c.priority && (
                    <span className="text-purple-600 font-semibold">(Priority)</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 mt-4"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

export default ProfileSetup;
