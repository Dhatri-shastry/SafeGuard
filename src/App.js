import { useState, useEffect } from "react";
import Login from "./components/Login";
import AuthPages from "./pages/AuthPages";
import ProfileSetup from "./pages/ProfileSetup";
import HomePage from "./pages/HomePage";
import SOSPage from "./pages/SOSPage";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

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
  const [loading, setLoading] = useState(true);

  // ✅ Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);

          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            // ✅ Only force setup when essential information (name) is missing.
            // For returning users we DO NOT auto-navigate away from the login page;
            // this lets you see the login screen first, then proceed to setup/home.
            const needsSetup = !data.name?.trim();

            // Update Google photo into profile if missing (non-blocking)
            const updatedData = { ...data };
            if (!updatedData.profilePic && user.photoURL) {
              updatedData.profilePic = user.photoURL;
              try {
                await updateDoc(docRef, updatedData);
              } catch (e) {
                console.warn("Could not update profilePic from Google:", e.message);
              }
            }

            // Set profile in memory. Only force navigation if profile truly needs setup.
            setUserProfile(updatedData);
            if (needsSetup) setCurrentPage("profile");
          } else {
            // 🆕 No user profile at all → create skeleton and go to setup
            await setDoc(docRef, {
              email: user.email,
              name: user.displayName || "",
              profilePic: user.photoURL || "",
              emergencyContacts: [],
              createdAt: new Date().toISOString(),
            });
            setUserProfile(null);
            setCurrentPage("profile");
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setCurrentPage("login");
        }
      } catch (err) {
        console.error("Error checking user profile:", err);
        setCurrentPage("login");
      } finally {
        setLoading(false);
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
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setMenuOpen(false);
    setCurrentPage("login");
  };

  // 🕒 While loading auth state
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold text-purple-600">
        Loading...
      </div>
    );

  // If the app is explicitly set to the login page, show AuthPages first
  if (currentPage === "login")
    return <AuthPages setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;

  // 🔐 Not logged in → show login/register page
  if (!currentUser)
    return <AuthPages setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} />;

  // 🧍 If no profile exists, force setup flow. If user explicitly navigates to "profile",
  // render ProfileSetup inside the main app so users can edit without being redirected.
  if (!userProfile)
    return (
      <ProfileSetup
        setUserProfile={setUserProfile}
        setCurrentPage={setCurrentPage}
        currentUser={currentUser}
      />
    );

  // 🏠 Main App Pages
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header
        userProfile={userProfile}
        currentUser={currentUser}
        logout={logout}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        setCurrentPage={setCurrentPage}
      />

      <main className="pb-20">
        {currentPage === "home" && (
          <HomePage
            currentUser={currentUser}
            setCurrentPage={setCurrentPage}
            userProfile={userProfile} // ✅ ensures picture and name sync
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
        {currentPage === "profile" && (
          <ProfileSetup
            setUserProfile={setUserProfile}
            currentUser={currentUser}
            userProfile={userProfile}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === "emergency-dial" && <EmergencyDialPage />}
      </main>

      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
