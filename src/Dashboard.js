import React, { useState, useEffect } from 'react';
import { Bell, Phone, MapPin, Mic, AlertCircle, Shield, Users, PhoneCall, Navigation, LogOut, User, Menu, X, ChevronRight } from 'lucide-react';

// Mock Firebase functions (replace with actual Firebase in production)
const mockFirebase = {
  signIn: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email && password) {
      return { user: { email, uid: '12345' } };
    }
    throw new Error('Invalid credentials');
  },
  signUp: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { user: { email, uid: '12345' } };
  },
  signInWithGoogle: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { user: { email: 'user@gmail.com', uid: '12345' } };
  },
  resetPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  },
  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [userProfile, setUserProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    await mockFirebase.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    setCurrentPage('login');
  };

  if (!currentUser) {
    return <AuthPages setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;
  }

  if (!userProfile) {
    return <ProfileSetup setUserProfile={setUserProfile} setCurrentPage={setCurrentPage} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header 
        userProfile={userProfile} 
        logout={logout} 
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      <main className="pb-20">
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'sos' && <SOSPage userProfile={userProfile} />}
        {currentPage === 'live-tracking' && <LiveTrackingPage userProfile={userProfile} />}
        {currentPage === 'voice-activation' && <VoiceActivationPage />}
        {currentPage === 'fake-call' && <FakeCallPage />}
        {currentPage === 'help-centers' && <HelpCentersPage />}
        {currentPage === 'safe-walk' && <SafeWalkPage />}
        {currentPage === 'community-alerts' && <CommunityAlertsPage />}
        {currentPage === 'emergency-numbers' && <EmergencyNumbersPage />}
      </main>

      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

const AuthPages = ({ setCurrentUser, setCurrentPage }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        const result = await mockFirebase.signIn(email, password);
        setCurrentUser(result.user);
        setCurrentPage('home');
      } else if (mode === 'signup') {
        const result = await mockFirebase.signUp(email, password);
        setCurrentUser(result.user);
        setCurrentPage('home');
      } else if (mode === 'forgot') {
        await mockFirebase.resetPassword(email);
        setError('Password reset email sent!');
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await mockFirebase.signInWithGoogle();
      setCurrentUser(result.user);
      setCurrentPage('home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
            <Shield className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SafeGuard</h1>
          <p className="text-gray-600">Your Safety, Our Priority</p>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg ${error.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('forgot')}
                className="text-purple-600 hover:underline text-sm"
              >
                Forgot Password?
              </button>
              <div className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-purple-600 hover:underline font-semibold">
                  Sign Up
                </button>
              </div>
            </>
          )}
          {mode === 'signup' && (
            <div className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-purple-600 hover:underline font-semibold">
                Sign In
              </button>
            </div>
          )}
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className="text-purple-600 hover:underline text-sm">
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileSetup = ({ setUserProfile, setCurrentPage }) => {
  const [name, setName] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);
  const [contactsPermission, setContactsPermission] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', priority: false });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      setEmergencyContacts([...emergencyContacts, { ...newContact, id: Date.now() }]);
      setNewContact({ name: '', phone: '', priority: false });
    }
  };

  const handleComplete = () => {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Profile</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={locationPermission}
                  onChange={(e) => setLocationPermission(e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="font-medium text-gray-800">Enable Location Access</div>
                  <div className="text-sm text-gray-600">Allow us to access your location for safety features</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={contactsPermission}
                  onChange={(e) => setContactsPermission(e.target.checked)}
                  className="w-5 h-5 text-purple-600"
                />
                <div>
                  <div className="font-medium text-gray-800">Enable Contacts Access</div>
                  <div className="text-sm text-gray-600">Add emergency contacts quickly</div>
                </div>
              </label>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Emergency Contacts</h3>
              <div className="space-y-3 mb-3">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.phone}</div>
                    </div>
                    {contact.priority && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Priority</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Contact Name"
                />
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Phone Number"
                />
                <label className="flex items-center gap-2">
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
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Contact
                </button>
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={!name}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ userProfile, logout, menuOpen, setMenuOpen, currentPage, setCurrentPage }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-purple-600" />
          <h1 className="text-xl font-bold text-gray-800">SafeGuard</h1>
        </div>
        
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">{userProfile.name}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

const HomePage = ({ setCurrentPage }) => {
  const features = [
    { id: 'sos', icon: AlertCircle, title: 'SOS Emergency', desc: 'Instant emergency alert', color: 'bg-red-500' },
    { id: 'live-tracking', icon: MapPin, title: 'Live Tracking', desc: 'Share your location', color: 'bg-blue-500' },
    { id: 'voice-activation', icon: Mic, title: 'Voice Activation', desc: 'Voice-activated SOS', color: 'bg-green-500' },
    { id: 'fake-call', icon: PhoneCall, title: 'Fake Call', desc: 'Escape unsafe situations', color: 'bg-purple-500' },
    { id: 'help-centers', icon: Navigation, title: 'Help Centers', desc: 'Find nearby help', color: 'bg-orange-500' },
    { id: 'safe-walk', icon: Shield, title: 'Safe Walk', desc: 'Guided safe routes', color: 'bg-teal-500' },
    { id: 'community-alerts', icon: Users, title: 'Community Alerts', desc: 'Local safety updates', color: 'bg-indigo-500' },
    { id: 'emergency-numbers', icon: Phone, title: 'Emergency Numbers', desc: 'Quick dial helplines', color: 'bg-pink-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to SafeGuard</h2>
        <p className="text-gray-600">Your comprehensive safety companion</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setCurrentPage(feature.id)}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 text-left"
          >
            <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{feature.desc}</p>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              Open <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const SOSPage = ({ userProfile }) => {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [shakeDetected, setShakeDetected] = useState(false);

  useEffect(() => {
    if (sosActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosActive && countdown === 0) {
      triggerSOS();
    }
  }, [sosActive, countdown]);

  const triggerSOS = () => {
    alert(`SOS ACTIVATED!\nAlerting emergency contacts:\n${userProfile.emergencyContacts.map(c => c.name).join(', ')}`);
    setSosActive(false);
    setCountdown(5);
  };

  const handleSOSPress = () => {
    setSosActive(true);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setCountdown(5);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Emergency SOS</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        {!sosActive ? (
          <>
            <button
              onClick={handleSOSPress}
              className="w-48 h-48 mx-auto bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all"
            >
              <div>
                <AlertCircle className="w-20 h-20 text-white mx-auto mb-2" />
                <div className="text-white font-bold text-xl">PRESS FOR SOS</div>
              </div>
            </button>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Shield className="w-5 h-5" />
                <span>Press and hold for 3 seconds to activate</span>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Shake Detection</h3>
                <p className="text-sm text-gray-600">Shake your device vigorously to trigger SOS</p>
                <div className={`mt-2 text-sm ${shakeDetected ? 'text-green-600' : 'text-gray-500'}`}>
                  {shakeDetected ? '✓ Shake detected!' : 'Shake detection active'}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="animate-pulse">
            <div className="w-48 h-48 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <div className="text-white">
                <div className="text-6xl font-bold">{countdown}</div>
                <div className="text-xl">Activating SOS...</div>
              </div>
            </div>
            <button
              onClick={cancelSOS}
              className="mt-8 px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-semibold text-gray-800">Auto Call</div>
            <div className="text-sm text-gray-600">Emergency contacts</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-semibold text-gray-800">Location Share</div>
            <div className="text-sm text-gray-600">Real-time tracking</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Bell className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="font-semibold text-gray-800">Alert Sent</div>
            <div className="text-sm text-gray-600">To all contacts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveTrackingPage = ({ userProfile }) => {
  const [tracking, setTracking] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });

  const toggleContact = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const startTracking = () => {
    setTracking(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          alert('Location access denied. Using default location.');
        }
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Location Tracking</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Who can access your location?</h3>
        <div className="space-y-2 mb-6">
          {userProfile.emergencyContacts.map((contact) => (
            <label
              key={contact.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
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
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Priority</span>
              )}
            </label>
          ))}
        </div>

        <button
          onClick={startTracking}
          disabled={selectedContacts.length === 0}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <MapPin className="w-5 h-5" />
          {tracking ? 'Tracking Active' : 'Start Live Tracking'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Your Location</h3>
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${location.lat},${location.lng}&zoom=15`}
            allowFullScreen
          ></iframe>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2 text-sm text-gray-700">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
        </div>
        
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
    </div>
  );
};

const VoiceActivationPage = () => {
  const [listening, setListening] = useState(false);
  const [safeWord, setSafeWord] = useState('help me');
  const [customWord, setCustomWord] = useState('');

  const startListening = () => {
    setListening(true);
    alert('Voice activation started. Say your safe word to trigger SOS.');
    setTimeout(() => setListening(false), 10000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Voice Activation</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <button
            onClick={startListening}
            className={`w-40 h-40 mx-auto ${listening ? 'bg-red-500 animate-pulse' : 'bg-purple-600'} hover:bg-purple-700 rounded-full flex items-center justify-center shadow-xl`}
          >
            <Mic className="w-16 h-16 text-white" />
          </button>
          <p className="mt-4 text-gray-600">
            {listening ? 'Listening for safe word...' : 'Tap to activate voice detection'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Safe Word</label>
            <div className="p-4 bg-purple-50 rounded-lg">
              <span className="text-lg font-semibold text-purple-700">"{safeWord}"</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Set Custom Safe Word</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Enter your safe word"
              />
              <button
                onClick={() => {
                  if (customWord) {
                    setSafeWord(customWord);
                    setCustomWord('');
                  }
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Set
              </button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">How it works</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Voice detection runs in the background</li>
              <li>• Say your safe word to trigger SOS</li>
              <li>• Works even when app is minimized</li>
              <li>• Choose a unique, easy-to-remember phrase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const FakeCallPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [callerName, setCallerName] = useState('Mom');
  const [ringDelay, setRingDelay] = useState(5);

  const startFakeCall = () => {
    setTimeout(() => {
      setCallActive(true);
    }, ringDelay * 1000);
  };

  const endCall = () => {
    setCallActive(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Fake Call</h2>
      
      {!callActive ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caller Name</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Who's calling?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ring After {ringDelay} seconds
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={ringDelay}
                onChange={(e) => setRingDelay(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={startFakeCall}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-6 h-6" />
              Schedule Fake Call
            </button>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Quick Exit Feature</h3>
              <p className="text-sm text-gray-600">
                Use this to safely exit uncomfortable situations. The call will appear realistic with caller ID and ringtone.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-8 text-white">
          <div className="text-center animate-pulse">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-16 h-16" />
            </div>
            <h3 className="text-3xl font-bold mb-2">{callerName}</h3>
            <p className="text-gray-300 mb-8">Incoming Call...</p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={endCall}
                className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center"
              >
                <X className="w-8 h-8" />
              </button>
              <button
                onClick={endCall}
                className="w-20 h-20 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center"
              >
                <Phone className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HelpCentersPage = () => {
  const helpCenters = [
    { name: 'Police Station - Central', distance: '0.5 km', type: 'Police', phone: '100' },
    { name: 'Women Helpline Center', distance: '1.2 km', type: 'Support', phone: '1091' },
    { name: 'City Hospital', distance: '2.1 km', type: 'Medical', phone: '108' },
    { name: 'NGO Support Center', distance: '3.5 km', type: 'NGO', phone: '181' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nearby Help Centers</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
          <MapPin className="w-12 h-12 text-gray-400" />
          <span className="ml-2 text-gray-500">Map showing nearby help centers</span>
        </div>
      </div>

      <div className="space-y-4">
        {helpCenters.map((center, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{center.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {center.distance}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {center.type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Call {center.phone}
              </button>
              <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SafeWalkPage = () => {
  const [walkActive, setWalkActive] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Safe Walk</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-6">
          <div className="text-center">
            <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Route map will appear here</p>
          </div>
        </div>

        <button
          onClick={() => setWalkActive(!walkActive)}
          className={`w-full py-4 ${walkActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600'} text-white rounded-lg font-semibold flex items-center justify-center gap-2`}
        >
          <Shield className="w-6 h-6" />
          {walkActive ? 'End Safe Walk' : 'Start Safe Walk'}
        </button>

        {walkActive && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Safe Walk Active</span>
              </div>
              <p className="text-sm text-gray-600">Your contacts are monitoring your journey</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">15 min</div>
                <div className="text-sm text-gray-600">ETA</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">2.3 km</div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CommunityAlertsPage = () => {
  const alerts = [
    { type: 'warning', area: 'MG Road', time: '30 min ago', msg: 'Suspicious activity reported' },
    { type: 'info', area: 'Indiranagar', time: '2 hours ago', msg: 'Increased police patrolling' },
    { type: 'danger', area: 'Koramangala', time: '5 hours ago', msg: 'Avoid this area after 9 PM' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Community Alerts</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2">
          <Bell className="w-5 h-5" />
          Post New Alert
        </button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, idx) => (
          <div key={idx} className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
            alert.type === 'danger' ? 'border-red-500' :
            alert.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-5 h-5 ${
                  alert.type === 'danger' ? 'text-red-500' :
                  alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
                <span className="font-semibold text-gray-800">{alert.area}</span>
              </div>
              <span className="text-sm text-gray-500">{alert.time}</span>
            </div>
            <p className="text-gray-700">{alert.msg}</p>
            <div className="mt-3 flex gap-2">
              <button className="text-sm text-purple-600 hover:underline">View Details</button>
              <button className="text-sm text-gray-600 hover:underline">Report</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmergencyNumbersPage = () => {
  const numbers = [
    { name: 'Police', number: '100', icon: Shield },
    { name: 'Women Helpline', number: '1091', icon: Users },
    { name: 'Ambulance', number: '108', icon: AlertCircle },
    { name: 'Child Helpline', number: '1098', icon: Phone },
    { name: 'Domestic Abuse', number: '181', icon: Bell },
    { name: 'Senior Citizen', number: '1291', icon: User }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Emergency Numbers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numbers.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <item.icon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-2xl font-bold text-red-600">{item.number}</p>
              </div>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Call Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const BottomNav = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-around">
        <button
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center gap-1 ${currentPage === 'home' ? 'text-purple-600' : 'text-gray-600'}`}
        >
          <Shield className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => setCurrentPage('sos')}
          className={`flex flex-col items-center gap-1 ${currentPage === 'sos' ? 'text-purple-600' : 'text-gray-600'}`}
        >
          <AlertCircle className="w-6 h-6" />
          <span className="text-xs">SOS</span>
        </button>
        <button
          onClick={() => setCurrentPage('live-tracking')}
          className={`flex flex-col items-center gap-1 ${currentPage === 'live-tracking' ? 'text-purple-600' : 'text-gray-600'}`}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-xs">Track</span>
        </button>
        <button
          onClick={() => setCurrentPage('community-alerts')}
          className={`flex flex-col items-center gap-1 ${currentPage === 'community-alerts' ? 'text-purple-600' : 'text-gray-600'}`}
        >
          <Bell className="w-6 h-6" />
          <span className="text-xs">Alerts</span>
        </button>
      </div>
    </nav>
  );
};

export default App;