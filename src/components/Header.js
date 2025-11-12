import React from "react";
import { Shield, Menu, X, LogOut } from "lucide-react";

const Header = ({ userProfile, logout, menuOpen, setMenuOpen, setCurrentPage }) => {
  // Debug: log profile info so we can confirm whether profilePic is available
  // Remove this log later if not needed
  // eslint-disable-next-line no-console
  console.log('Header userProfile:', userProfile);
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: App logo + name */}
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">SafeGuard</h1>
            <p className="text-xs text-gray-600">
              Hello, {userProfile?.name || "User"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Avatar to open profile editor */}
          <button
            onClick={() => {
              setMenuOpen(false);
              setCurrentPage("profile");
            }}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 shadow-sm flex items-center justify-center bg-white mr-2"
            title="Edit / Update Profile"
          >
            {userProfile?.profilePic ? (
              <img src={userProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-purple-600 text-white flex items-center justify-center font-semibold">{(userProfile?.name || "U")[0].toUpperCase()}</div>
            )}
          </button>

          {/* Right: Menu toggle */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg animate-fadeIn">
          <button
            onClick={() => {
              setMenuOpen(false); // ✅ close menu after logout
              logout(); // ✅ trigger logout
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
