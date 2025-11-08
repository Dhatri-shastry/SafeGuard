import { useState } from 'react';
import AuthPages from './pages/AuthPages';
import ProfileSetup from './pages/ProfileSetup';
import HomePage from './pages/HomePage';
import SOSPage from './pages/SOSPage';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import mockFirebase from './firebase/mockFirebase';
import LiveTrackingPage from './pages/LiveTrackingPage';
import VoiceActivationPage from './pages/VoiceActivationPage';
import ShakeDetectionPage from './pages/ShakeDetectionPage';
import FakeCallPage from './pages/FakeCallPage';
import HelpCentersPage from './pages/HelpCentersPage';
import SafeWalkPage from './pages/SafeWalkPage';
import CommunityPage from "./pages/CommunityPage";
import EmergencyDialPage from "./pages/EmergencyDialPage";



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

  // 🟢 Show login page if no user
  if (!currentUser) {
    console.log('Rendering Login Page');
    return <AuthPages setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;
  }

  // 🟡 Show profile setup if user exists but no profile yet
  if (!userProfile) {
    console.log('Rendering Profile Setup Page');
    return <ProfileSetup setUserProfile={setUserProfile} setCurrentPage={setCurrentPage} />;
  }

  const triggerSOS = () => {
  alert('🚨 SOS Triggered! Your emergency contacts will be notified.');
  // You can later navigate to SOSPage automatically, like:
  setCurrentPage('sos');
};

  

  // 🟣 Once logged in + profile done, show main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header 
        userProfile={userProfile} 
        logout={logout} 
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main className="pb-20">
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'sos' && <SOSPage userProfile={userProfile} />}
        {currentPage === 'live-tracking' && <LiveTrackingPage userProfile={userProfile} />}
        {currentPage === 'voice-activation' && <VoiceActivationPage />}
        {currentPage === 'shake-detection' && <ShakeDetectionPage userProfile={userProfile} onTriggerSOS={triggerSOS} />}
        {currentPage === 'fake-call' && <FakeCallPage onQuickExit={triggerSOS} />}
        {currentPage === 'help-centers' && <HelpCentersPage />}
        {currentPage === 'safe-walk' && <SafeWalkPage userProfile={userProfile} />}
        {currentPage === "community" && <CommunityPage userProfile={userProfile} />}
        {currentPage === "emergency-numbers" && <EmergencyDialPage />}
      </main>

      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
