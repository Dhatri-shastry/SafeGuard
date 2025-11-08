import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  MapPin,
  Mic,
  Phone,
  PhoneCall,
  Navigation,
  Shield,
  Users,
  ChevronRight,
  Plus,
  Trash,
  Star,
} from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const HomePage = ({ currentUser, setCurrentPage }) => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    priority: false,
  });

  // 🔹 Fetch emergency contacts from Firestore
  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser) return;
      const contactRef = collection(
        db,
        "users",
        currentUser.uid,
        "emergencyContacts"
      );
      const snapshot = await getDocs(contactRef);
      const contactList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContacts(contactList);

      // ✅ Save to localStorage for instant SOS access
      localStorage.setItem("emergencyContacts", JSON.stringify(contactList));
    };
    fetchContacts();
  }, [currentUser]);

  // 🔹 Add new contact
  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      alert("Please enter both name and phone number.");
      return;
    }
    if (!currentUser) {
      alert("Please log in before adding contacts.");
      return;
    }

    const contactRef = collection(
      db,
      "users",
      currentUser.uid,
      "emergencyContacts"
    );
    const docRef = await addDoc(contactRef, newContact);
    const addedContact = { id: docRef.id, ...newContact };
    const updatedContacts = [...contacts, addedContact];
    setContacts(updatedContacts);

    // ✅ Cache updated contact list locally
    localStorage.setItem("emergencyContacts", JSON.stringify(updatedContacts));

    // Reset input
    setNewContact({ name: "", phone: "", priority: false });
  };

  // 🔹 Delete contact
  const deleteContact = async (id) => {
    await deleteDoc(doc(db, "users", currentUser.uid, "emergencyContacts", id));
    const updatedContacts = contacts.filter((c) => c.id !== id);
    setContacts(updatedContacts);

    // ✅ Update cache after delete
    localStorage.setItem("emergencyContacts", JSON.stringify(updatedContacts));
  };

  const features = [
    {
      id: "sos",
      icon: AlertCircle,
      title: "SOS Emergency",
      desc: "Instant alert to contacts",
      color: "from-red-500 to-red-600",
      badge: "Critical",
    },
    {
      id: "live-tracking",
      icon: MapPin,
      title: "Live Tracking",
      desc: "Real-time location sharing",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "voice-activation",
      icon: Mic,
      title: "Voice SOS",
      desc: "Say safe word to alert",
      color: "from-green-500 to-green-600",
    },
    {
      id: "shake-detection",
      icon: Phone,
      title: "Shake Alert",
      desc: "Shake phone for SOS",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "fake-call",
      icon: PhoneCall,
      title: "Fake Call",
      desc: "Exit unsafe situations",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "help-centers",
      icon: Navigation,
      title: "Help Centers",
      desc: "Find nearby assistance",
      color: "from-teal-500 to-teal-600",
    },
    {
      id: "safe-walk",
      icon: Shield,
      title: "Safe Walk",
      desc: "Monitored journey",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      id: "emergency-dial",
      icon: Phone,
      title: "Emergency Dial",
      desc: "Quick access helplines",
      color: "from-red-600 to-pink-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* --- Title --- */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Stay Safe, Stay Connected
        </h2>
        <p className="text-gray-600">
          Your comprehensive safety companion is ready
        </p>
      </div>

      {/* --- Features Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setCurrentPage(feature.id)}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-2 text-left group"
          >
            <div
              className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
            >
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">
                {feature.title}
              </h3>
              {feature.badge && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {feature.badge}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-4">{feature.desc}</p>
            <div className="flex items-center text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
              <span>Open feature</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {/* --- System Status Cards --- */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-green-800">System Active</span>
          </div>
          <p className="text-sm text-gray-700">
            All safety features operational
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Protected 24/7</span>
          </div>
          <p className="text-sm text-gray-700">Round the clock monitoring</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-800">
              Community Strong
            </span>
          </div>
          <p className="text-sm text-gray-700">10,000+ active users</p>
        </div>
      </div>

      {/* --- Emergency Contacts Section --- */}
      <div className="mt-10 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-purple-600" />
          Add Priority Emergency Contacts
        </h3>

        {/* Input Fields */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Name"
            value={newContact.name}
            onChange={(e) =>
              setNewContact({ ...newContact, name: e.target.value })
            }
            className="flex-1 p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Phone"
            value={newContact.phone}
            onChange={(e) =>
              setNewContact({ ...newContact, phone: e.target.value })
            }
            className="flex-1 p-3 border border-gray-300 rounded-lg"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={newContact.priority}
              onChange={(e) =>
                setNewContact({ ...newContact, priority: e.target.checked })
              }
            />
            Priority
          </label>
          <button
            onClick={addContact}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No emergency contacts added yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center justify-between p-3 bg-white/80 rounded-lg shadow-sm border border-gray-100"
              >
                <div>
                  <p className="font-semibold text-gray-800">{contact.name}</p>
                  <p className="text-gray-600 text-sm">{contact.phone}</p>
                  {contact.priority && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mt-1 inline-block">
                      Priority
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomePage;
