import { useState, useEffect } from "react";
import AuthPages from "./pages/AuthPages";
import ProfileSetup from "./pages/ProfileSetup";
import HomePage from "./pages/HomePage";
import SOSPage from "./pages/SOSPage";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import LiveTrackingPage from "./pages/LiveTrackingPage";
import VoiceActivationPage from "./pages/VoiceActivationPage";
import ShakeDetectionPage from "./pages/ShakeDetectionPage";
import FakeCallPage from "./pages/FakeCallPage";
import HelpCentersPage from "./pages/HelpCentersPage";
import SafeWalkPage from "./pages/SafeWalkPage";
import CommunityPage from "./pages/CommunityPage";
import EmergencyDialPage from "./pages/EmergencyDialPage";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("login");
  const [userProfile, setUserProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
          setCurrentPage("home");
        } else {
          setUserProfile(null);
          setCurrentPage("profile");
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setCurrentPage("login");
      }
    });

    return () => unsubscribe();
  }, []);

  // 🚨 SOS Trigger
  const triggerSOS = () => {
    alert("🚨 SOS Triggered! Your emergency contacts will be notified.");
    setCurrentPage("sos");
  };

  // 🚪 Logout
  const logout = async () => {
    await auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    setCurrentPage("login");
  };

  if (!currentUser)
    return <AuthPages setCurrentUser={setCurrentUser} />;

  if (!userProfile)
    return (
      <ProfileSetup
        setUserProfile={setUserProfile}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
      />
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header
        userProfile={userProfile}
        logout={logout}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main className="pb-20">
        {currentPage === "home" && (
          <HomePage
            currentUser={currentUser}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === "sos" && <SOSPage userProfile={userProfile} />}
        {currentPage === "live-tracking" && (
          <LiveTrackingPage
            currentUser={currentUser}
            userProfile={userProfile}
          />
        )}
        {currentPage === "voice-activation" && (
          <VoiceActivationPage currentUser={currentUser} />
        )}
        {currentPage === "shake-detection" && (
          <ShakeDetectionPage
            userProfile={userProfile}
            onTriggerSOS={triggerSOS}
          />
        )}
        {currentPage === "fake-call" && (
          <FakeCallPage onQuickExit={triggerSOS} />
        )}
        {currentPage === "help-centers" && <HelpCentersPage />}
        {currentPage === "safe-walk" && (
          <SafeWalkPage userProfile={userProfile} />
        )}
        {currentPage === "community" && (
          <CommunityPage userProfile={userProfile} />
        )}
        {currentPage === "emergency-dial" && <EmergencyDialPage />}
      </main>

      <BottomNav
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default App;
